// E2E regresní test consent gatingu (CR10-2 / CR8-1, DoD §4 P1 CRITICAL).
//
// Co ověřuje (deterministicky, headless chromium nad build outputem):
//   1. PŘED souhlasem: 0 requestů na googletagmanager/google-analytics a žádný
//      <script src=...gtag/js> v DOM — tj. GA se nenačítá bez souhlasu.
//   2. Consent Mode default = denied (inline gtag z BaseLayout, dataLayer).
//   3. Po "Odmítnout": consent update denied, localStorage 'denied', stále 0 GA.
//   4. Po "Přijmout": consent update granted, localStorage 'granted', banner pryč.
//
// Záměrně NEpoužívá @playwright/test (test runner) — jen core `playwright`, který
// už je v devDependencies. Důvod: přidání @playwright/test = změna lockfile na
// Windows = riziko per ADR-005 (sharp/lightningcss nativní binárky). MVP-first.
//
// Síťové načtení gtag.js po souhlasu je by-design gatnuté na PUBLIC_GA_ID
// (loadGa() no-opuje bez ID) — pokrývá code review + gate č.1 výše. Tento test
// běží proti buildu BEZ GA ID, proto ověřuje consent STAV (dataLayer), ne reálný
// network ping po souhlasu.
//
// Předpoklady: `npm run build` proběhl (existuje dist/) + chromium nainstalován
// (`npx playwright install chromium`). NENÍ součástí CI gate (lokální on-demand).
// Spuštění: npm run build && npm run test:e2e

import { readFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright";

const DIST = resolve("dist");
const GA_HOSTS = /googletagmanager\.com|google-analytics\.com/;

if (!existsSync(join(DIST, "index.html"))) {
  console.error("FAIL: dist/index.html chybí. Spusť nejdřív `npm run build`.");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".woff2": "font/woff2",
};

// Minimální statický server nad dist/ (vzor z scripts/prerender.mjs).
function startServer() {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let filePath = normalize(join(DIST, urlPath));
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    if (urlPath.endsWith("/")) {
      filePath = join(filePath, "index.html");
    } else if (!extname(filePath) && existsSync(join(filePath, "index.html"))) {
      filePath = join(filePath, "index.html");
    }
    if (!existsSync(filePath)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream" });
    res.end(readFileSync(filePath));
  });
  return new Promise((res) => server.listen(0, "127.0.0.1", () => res(server)));
}

const failures = [];
function check(cond, msg) {
  if (cond) {
    console.log(`  PASS  ${msg}`);
  } else {
    failures.push(msg);
    console.error(`  FAIL  ${msg}`);
  }
}

// dataLayer obsahuje gtag("consent", <state>, {analytics_storage}) s danou hodnotou?
// Pozn.: gtag z BaseLayout pushuje `arguments` (array-like), které se přes
// page.evaluate serializují jako objekt {"0":..,"1":..} — proto čteme přes index
// bez Array.isArray guardu (funguje pro pole i array-like objekt).
function consentInDataLayer(entries, state, storage) {
  return entries.some(
    (e) => e && e[0] === "consent" && e[1] === state && e[2]?.analytics_storage === storage,
  );
}

const server = await startServer();
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();

try {
  // ---- Scénář A: čerstvá návštěva + "Odmítnout" ----
  console.log("Scénář A — čerstvá návštěva, pak Odmítnout:");
  let gaRequests = [];
  const ctxA = await browser.newContext();
  ctxA.on("request", (r) => {
    if (GA_HOSTS.test(r.url())) gaRequests.push(r.url());
  });
  const a = await ctxA.newPage();
  await a.goto(`${origin}/`, { waitUntil: "load" });
  await a.waitForSelector(".cookie-consent", { timeout: 10000 });

  check(gaRequests.length === 0, "0 GA requestů PŘED souhlasem");
  const gtagScripts = await a.$$eval('script[src*="googletagmanager"]', (s) => s.length);
  check(gtagScripts === 0, "žádný gtag/js <script> v DOM před souhlasem");
  const dlBefore = await a.evaluate(() => window.dataLayer ?? []);
  check(consentInDataLayer(dlBefore, "default", "denied"), "Consent Mode default = denied");
  check(!consentInDataLayer(dlBefore, "update", "granted"), "žádný consent update granted před souhlasem");

  await a.getByRole("button", { name: "Odmítnout" }).click();
  await a.waitForTimeout(300);
  const denied = await a.evaluate(() => localStorage.getItem("jazuma-cookie-consent"));
  check(denied === "denied", "localStorage = 'denied' po Odmítnout");
  check(gaRequests.length === 0, "0 GA requestů i PO Odmítnout");
  const dlDeny = await a.evaluate(() => window.dataLayer ?? []);
  check(consentInDataLayer(dlDeny, "update", "denied"), "consent update denied po Odmítnout");
  await ctxA.close();

  // ---- Scénář B: čerstvá návštěva + "Přijmout" ----
  console.log("Scénář B — čerstvá návštěva, pak Přijmout:");
  gaRequests = [];
  const ctxB = await browser.newContext();
  ctxB.on("request", (r) => {
    if (GA_HOSTS.test(r.url())) gaRequests.push(r.url());
  });
  const b = await ctxB.newPage();
  await b.goto(`${origin}/`, { waitUntil: "load" });
  await b.waitForSelector(".cookie-consent", { timeout: 10000 });
  check(gaRequests.length === 0, "0 GA requestů PŘED souhlasem (scénář B)");

  await b.getByRole("button", { name: "Přijmout" }).click();
  await b.waitForTimeout(300);
  const granted = await b.evaluate(() => localStorage.getItem("jazuma-cookie-consent"));
  check(granted === "granted", "localStorage = 'granted' po Přijmout");
  const dlGrant = await b.evaluate(() => window.dataLayer ?? []);
  check(consentInDataLayer(dlGrant, "update", "granted"), "consent update granted po Přijmout");
  const bannerGone = await b.$(".cookie-consent");
  check(bannerGone === null, "banner zmizel po rozhodnutí");
  await ctxB.close();
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`\nE2E FAIL: ${failures.length} kontrol selhalo.`);
  process.exit(1);
}
console.log("\nE2E PASS: consent gating OK (0 GA před souhlasem, stav konzistentní).");
