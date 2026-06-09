// Načte obsazenost apartmánu z neveřejného Google Kalendáře (přes Calendar API,
// přihlášené účtem, který má na kalendář přístup) a uloží POUZE datumy do
// src/data/availability.json. Jména hostů ani popis událostí se NIKDY neukládají
// — z API si vyžádáme jen pole start/end/status, na web jde jen "obsazeno/volno".
//
// Priorita zdrojů (podle nastavených env proměnných / GitHub secrets):
//   1. Google Calendar API  — GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
//                             GOOGLE_REFRESH_TOKEN, (GOOGLE_CALENDAR_ID)
//   2. Veřejný iCal feed    — AVAILABILITY_ICS_URL
//   3. Nic                  — ponechá se pre-committed availability.json
//
// Tajné hodnoty drž v GitHub Actions secrets, NIKDY v repu (zero-secrets).

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outFile = resolve(".", "src", "data", "availability.json");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_CALENDAR_ID = "a6383c9d7df8ef7272a220efec10692de1e1201a30d71cade137f485288554cd@group.calendar.google.com",
  AVAILABILITY_ICS_URL,
} = process.env;

// ---------- pomocné funkce ----------

function addOneDay(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Z události vytáhne čistě datum (all-day i časovanou) ve formátu YYYY-MM-DD.
function dateOf(point) {
  if (!point) return null;
  if (point.date) return point.date; // all-day: "2026-06-01"
  if (point.dateTime) return point.dateTime.slice(0, 10); // časovaná
  return null;
}

function normalize(ranges) {
  return ranges
    .filter((r) => r.start && r.end && r.end > r.start)
    .sort((a, b) => a.start.localeCompare(b.start));
}

// ---------- Google Calendar API ----------

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`OAuth token HTTP ${res.status}: ${await res.text()}`);
  }
  return (await res.json()).access_token;
}

async function fromGoogleApi() {
  const accessToken = await getAccessToken();
  // Od začátku dneška (UTC) dál — staré rezervace nás nezajímají.
  const timeMin = `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;
  const ranges = [];
  let pageToken;

  do {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events`,
    );
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("maxResults", "2500");
    // Vyžádáme JEN start/end/status — žádný summary/popis se ani nestáhne.
    url.searchParams.set("fields", "items(start,end,status),nextPageToken");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) {
      throw new Error(`Calendar API HTTP ${res.status}: ${await res.text()}`);
    }
    const json = await res.json();
    for (const item of json.items ?? []) {
      if (item.status === "cancelled") continue;
      const start = dateOf(item.start);
      if (!start) continue;
      const end = dateOf(item.end) ?? addOneDay(start);
      ranges.push({ start, end });
    }
    pageToken = json.nextPageToken;
  } while (pageToken);

  return normalize(ranges);
}

// ---------- veřejný iCal feed (záloha) ----------

function unfold(text) {
  return text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function icsToIso(value) {
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length < 8) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

async function fromIcsFeed() {
  const res = await fetch(AVAILABILITY_ICS_URL);
  if (!res.ok) throw new Error(`iCal feed HTTP ${res.status}`);
  const lines = unfold(await res.text()).split(/\r?\n/);
  const ranges = [];
  let cur = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = { start: null, end: null, cancelled: false };
    else if (line === "END:VEVENT") {
      if (cur && cur.start && !cur.cancelled) ranges.push({ start: cur.start, end: cur.end ?? addOneDay(cur.start) });
      cur = null;
    } else if (cur) {
      const colon = line.indexOf(":");
      if (colon === -1) continue;
      const name = line.slice(0, colon).split(";")[0].toUpperCase();
      const value = line.slice(colon + 1).trim();
      if (name === "DTSTART") cur.start = icsToIso(value);
      else if (name === "DTEND") cur.end = icsToIso(value);
      else if (name === "STATUS" && value.toUpperCase() === "CANCELLED") cur.cancelled = true;
    }
  }
  return normalize(ranges);
}

// ---------- hlavní běh ----------

let occupied;
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) {
  console.log("[availability] Zdroj: Google Calendar API.");
  occupied = await fromGoogleApi();
} else if (AVAILABILITY_ICS_URL) {
  console.log("[availability] Zdroj: veřejný iCal feed.");
  occupied = await fromIcsFeed();
} else {
  console.log("[availability] Žádné přihlašovací údaje — používám pre-committed JSON.");
  process.exit(0);
}

const payload = { updated: new Date().toISOString(), occupied };
const serialized = `${JSON.stringify(payload, null, 2)}\n`;
const previous = (() => {
  try {
    return readFileSync(outFile, "utf8");
  } catch {
    return "";
  }
})();

if (serialized.trim() !== previous.trim()) {
  writeFileSync(outFile, serialized, "utf8");
  console.log(`[availability] Uloženo ${occupied.length} obsazených termínů (bez jmen).`);
} else {
  console.log("[availability] Beze změny.");
}
