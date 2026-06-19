import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";

const repoRoot = resolve(".");
const sourceRoot = resolve(repoRoot, "..");
const outputRoot = resolve(repoRoot, "src", "data");
const contentRoot = resolve(repoRoot, "src", "content");

const sourceMarker = resolve(sourceRoot, "CONTENT-POI");
if (!existsSync(sourceMarker)) {
  console.log(
    `[build-data] Source markdown not found at ${sourceMarker}. Skipping data build (using pre-committed JSON in src/data/).`,
  );
  process.exit(0);
}

const allowed = {
  activity: new Set(["koupani", "turistika", "atrakce", "mesta", "vyhlidky", "priroda", "gastro", "kultura"]),
  region: new Set(["okoli", "jih", "zapad", "sever", "vychod", "centrum-hory", "mimo-tenerife"]),
  logistics: new Set(["bez-auta", "s-koccarkem", "pul-den", "cely-den", "permit-nutny", "rezervace-doporucena", "placene-vstupne"]),
  weather: new Set(["slunecno-must", "vse-pocasi", "vetrno-ne", "kalima-ne"]),
  confidence: new Set(["H", "M", "L"]),
};

const gpsFallbacks = {
  "masca-trail": [28.3101, -16.8307],
  "promenada-costa-adeje": [28.086, -16.737],
};

const hardSecretPatterns = [
  /***REMOVED***/i,
  /***REMOVED***/i,
  /***REMOVED***/i,
  /***REMOVED***/i,
  /password\s*[:=]\s*\S+/i,
  /heslo\s*[:=]\s*\S+/i,
  /ssid\s*[:=]\s*\S+/i,
];

const warnings = [];

function readVaultFile(relativePath) {
  return readFileSync(resolve(sourceRoot, relativePath), "utf8");
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function writeJson(name, value) {
  ensureDir(outputRoot);
  const path = join(outputRoot, name);
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

// Content collections (Astro file() loader) zivou v src/content/.
function writeContentJson(name, value) {
  ensureDir(contentRoot);
  const path = join(contentRoot, name);
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function fail(message) {
  throw new Error(`Data build failed: ${message}`);
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function stripMarkdown(value) {
  return normalizeText(value)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripTableCellMarkdown(value) {
  return normalizeText(value)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function section(content, heading) {
  const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m");
  const match = content.match(pattern);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = rest.search(/^## /m);
  return normalizeText(next === -1 ? rest : rest.slice(0, next));
}

function firstParagraph(value) {
  return stripMarkdown(value)
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .find(Boolean) ?? "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// YAML auto-parses unquoted `2026-05-28` into a Date; String(date) yields an ugly
// locale string. Normalize everything to a clean ISO yyyy-mm-dd.
function isoDate(value, fallback = "2026-05-28") {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const text = String(value ?? "").trim();
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : fallback;
}

function parseMarkdownTable(markdown) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));

  if (lines.length < 3) return [];
  const headers = splitTableLine(lines[0]);
  return lines.slice(2).map((line) => {
    const cells = splitTableLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

function splitTableLine(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function markdownLinkToUrl(value) {
  const match = value.match(/\((https?:\/\/[^)]+)\)/);
  if (match) return match[1];
  const raw = value.match(/https?:\/\/\S+/);
  return raw ? raw[0].replace(/[);,.]+$/, "") : undefined;
}

function markdownLinkLabel(value) {
  const match = value.match(/\[([^\]]+)\]/);
  return match ? match[1] : stripMarkdown(value);
}

function containsFlag(value) {
  return /\[\?\]|CONFLICT|NEDOHLEDATELNE|ROZPOR/i.test(value);
}

function checkedArray(value, name, set, id) {
  if (!Array.isArray(value)) fail(`${id}: ${name} must be an array`);
  for (const item of value) {
    if (!set.has(item)) fail(`${id}: invalid ${name} tag "${item}"`);
  }
  return value;
}

function parsePoiFile(fileName) {
  const raw = readVaultFile(join("CONTENT-POI", fileName));
  const { data, content } = matter(raw);
  if (data.status === "archived" || data.publish === false) return null;
  const id = data.slug ?? fileName.replace(/\.md$/, "");
  const gps = Array.isArray(data.gps) && data.gps.length === 2 ? data.gps : gpsFallbacks[id];

  if (!gps) fail(`${id}: missing GPS and no fallback`);
  if (gpsFallbacks[id]) warnings.push(`${id}: GPS fallback used; confidence forced to L.`);

  const why = section(content, "Proč jít") || section(content, "Proc jit");
  const practical = section(content, "Praktické info") || section(content, "Prakticke info");
  const withoutCar = section(content, "Bez auta");
  const rainyAlt = section(content, "Co když fouká / prší") || section(content, "Co kdyz fouka / prsi");
  const insiderTip = section(content, "Insider tip");
  const flags = containsFlag(raw) || gpsFallbacks[id] ? ["overit-pred-cestou"] : [];
  const confidence = flags.length > 0 ? "L" : (data.confidence ?? "M");

  const poi = {
    id,
    propertyId: "paradise",
    name: data.name,
    nameLocal: data.nameLocal,
    gps,
    region: data.region,
    tags: {
      activity: checkedArray(data.tags?.activity ?? [], "activity", allowed.activity, id),
      logistics: checkedArray(data.tags?.logistics ?? [], "logistics", allowed.logistics, id),
      weather: checkedArray(data.tags?.weather ?? [], "weather", allowed.weather, id),
    },
    summary: firstParagraph(why),
    description: stripMarkdown(why),
    practical: parsePractical(practical),
    withoutCar: withoutCar
      ? { titsaLines: extractTitsaLines(withoutCar), note: stripMarkdown(withoutCar) }
      : undefined,
    links: {
      official: data.links?.official,
      maps: data.links?.maps ?? `https://www.google.com/maps/search/?api=1&query=${gps[0]},${gps[1]}`,
      mapsLabel: data.links?.mapsLabel,
      guide: data.links?.guide,
      guideLabel: data.links?.guideLabel,
      actions: Array.isArray(data.links?.actions) ? data.links.actions : [],
      other: Array.isArray(data.links?.other) ? data.links.other : [],
    },
    photos: normalizePhotos(data.photos, id, data.name),
    rainyAlt: stripMarkdown(rainyAlt),
    insiderTip: stripMarkdown(insiderTip),
    verifiedDate: isoDate(data.verified),
    confidence,
    flags,
    sourceRefs: sourceRefsFromLinks(data.links, isoDate(data.verified)),
  };

  validatePoi(poi);
  return poi;
}

function parsePractical(markdown) {
  const lines = stripMarkdown(markdown)
    .split("\n")
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean);

  const get = (...labels) => {
    const found = lines.find((line) => labels.some((label) => line.toLowerCase().startsWith(label)));
    return found?.replace(/^[^:]+:\s*/, "");
  };

  return {
    openingHours: get("oteviraci", "otevírací"),
    price: get("vstupne", "vstupné", "cena"),
    visitDuration: get("doba"),
    parking: get("parkovani", "parkování"),
    reservation: get("rezervace", "permit"),
  };
}

function extractTitsaLines(value) {
  return [...new Set([...value.matchAll(/\b\d{2,3}\b/g)].map((match) => match[0]))];
}

function localPoiPhoto(id) {
  const webPath = `/images/poi/${id}.webp`;
  const filePath = resolve(repoRoot, "public", "images", "poi", `${id}.webp`);
  return existsSync(filePath) ? webPath : null;
}

function normalizePhotos(photos, id, name) {
  const local = localPoiPhoto(id);
  if (!Array.isArray(photos) || photos.length === 0) {
    return [
      {
        url: local ?? "",
        alt: `${name} – Tenerife`,
        license: "missing",
        credit: "Doplnit",
      },
    ];
  }

  return photos.map((photo, index) => {
    // First photo is served from the optimized self-hosted WebP when available;
    // the original Commons URL is kept as sourceUrl for attribution/lightbox.
    const useLocal = local && index === 0;
    return {
      url: useLocal ? local : (photo.url ?? ""),
      alt: photo.alt ?? `${name} – Tenerife`,
      license: photo.license ?? "ověřit licenci",
      credit: photo.credit ?? "Doplnit",
      sourceUrl: photo.sourceUrl ?? photo.url,
      localPath: useLocal ? local : photo.localPath,
    };
  });
}

function sourceRefsFromLinks(links, checkedDate) {
  const refs = [];
  if (links?.official) refs.push({ label: "Oficialni web", url: links.official, tier: "official", checkedDate: String(checkedDate) });
  if (links?.guide) refs.push({ label: links.guideLabel ?? "Pruvodce", url: links.guide, tier: "secondary", checkedDate: String(checkedDate) });
  for (const action of links?.actions ?? []) {
    refs.push({ label: action.label, url: action.url, tier: "secondary", checkedDate: String(checkedDate) });
  }
  if (links?.maps) {
    refs.push({
      label: links.mapsLabel ?? "Parkovani / mapa",
      url: links.maps,
      tier: links.mapsLabel ? "official" : "maps",
      checkedDate: String(checkedDate),
    });
  }
  for (const [index, url] of (links?.other ?? []).entries()) {
    refs.push({ label: `Zdroj ${index + 1}`, url, tier: "secondary", checkedDate: String(checkedDate) });
  }
  return refs;
}

function validatePoi(poi) {
  if (!poi.id || !/^[a-z0-9-]+$/.test(poi.id)) fail(`${poi.id}: invalid id`);
  if (!poi.name) fail(`${poi.id}: missing name`);
  if (!Array.isArray(poi.gps) || poi.gps.length !== 2 || poi.gps.some((n) => typeof n !== "number")) {
    fail(`${poi.id}: invalid GPS`);
  }
  if (!allowed.region.has(poi.region)) fail(`${poi.id}: invalid region ${poi.region}`);
  if (!poi.summary) fail(`${poi.id}: missing summary`);
  if (!poi.verifiedDate) fail(`${poi.id}: missing verifiedDate`);
  if (!allowed.confidence.has(poi.confidence)) fail(`${poi.id}: invalid confidence`);
}

function parsePois() {
  const dir = resolve(sourceRoot, "CONTENT-POI");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map(parsePoiFile)
    .filter(Boolean);
}

function parseBundles() {
  const raw = readVaultFile("BUNDLES-Denni-Navrhy.md");
  const chunks = raw.split(/^---\s*$/m).map((chunk) => chunk.trim()).filter(Boolean);
  const bundles = [];

  for (let index = 0; index < chunks.length; index += 1) {
    let data;
    try {
      data = yaml.load(chunks[index]);
    } catch {
      continue;
    }
    if (!data?.id) continue;
    const body = chunks[index + 1] ?? "";
    bundles.push({
      id: data.id,
      propertyId: "paradise",
      title: data.title,
      region: data.region === "mix" ? "multi-region" : data.region,
      duration: data.duration,
      poiIds: data.poiIds ?? [],
      transport: data.transport ?? "mixed",
      permits: data.permits ?? [],
      estimatedCostPerson: data.estimatedCostPerson,
      notes: stripMarkdown(subsection(body, "Logistika")),
      summary: firstParagraph(subsection(body, "Pro koho")),
      itinerary: stripMarkdown(subsection(body, "Co uvidíš") || subsection(body, "Co uvidis")),
      bestFor: [firstParagraph(subsection(body, "Pro koho"))].filter(Boolean),
      whenNot: stripMarkdown(subsection(body, "Kdy NE")),
    });
  }

  return bundles;
}

function parsePermits() {
  const raw = readVaultFile("PERMITY-HUB.md");
  const rows = parseMarkdownTable(section(raw, "Povinne permity a rezervace"));
  return rows.map((row) => {
    const title = markdownLinkLabel(row["Permit / rezervace"]);
    const bookingUrl = markdownLinkToUrl(row["Kde rezervovat"]) ?? "";
    const id = slugify(title);
    return {
      id,
      title,
      appliesToPoiIds: inferPermitPoiIds(id),
      required: /pico|masca|trail|ferry/i.test(title),
      bookingUrl,
      deadline: stripMarkdown(row.Kdy),
      fees: stripMarkdown(row["Cena 2026"]),
      currentStatus: stripMarkdown(row.Pravidlo),
      verifiedDate: "2026-05-28",
      confidence: containsFlag(Object.values(row).join(" ")) ? "L" : "H",
      sourceRefs: bookingUrl ? [{ label: title, url: bookingUrl, tier: "official", checkedDate: "2026-05-28" }] : [],
    };
  });
}

function inferPermitPoiIds(id) {
  if (id.includes("teide") || id.includes("pico")) return ["teide-cable-car-pico"];
  if (id.includes("masca")) return ["masca-vesnice"];
  if (id.includes("loro")) return ["loro-parque", "siam-park"];
  if (id.includes("siam")) return ["siam-park"];
  if (id.includes("aqualand")) return ["aqualand-costa-adeje"];
  if (id.includes("gomera")) return ["la-gomera-day-trip"];
  if (id.includes("margaritas")) return ["las-galletas-finca-las-margaritas"];
  return [];
}

// Guest-facing transport content, curated from CONTENT-DOPRAVA.md (a research doc
// with evidence columns + flags that is not publishable as-is). Facts are kept;
// evidence markers and dynamic prices are dropped in favor of clean prose + tables.
function parseTransport() {
  return {
    title: "Doprava na Tenerife",
    lead:
      "Auto je nejpohodlnější, ale základní trasy zvládneš i taxíkem nebo autobusem TITSA.",
    sections: [
      {
        id: "auto",
        title: "Auto z půjčovny",
        intro:
          "Přepážky půjčoven jsou přímo v příletové hale letiště TFS (úroveň 0, úroveň 1 i venku u terminálu). Nejlevnější a osvědčenou je Autoreisen, spolehlivá alternativa je Cicar, která je o něco dražší.",
        bullets: [
          "Řidičák: stačí platný český nebo EU průkaz.",
          "Platba: kreditní i běžná debetní karta (předplacené většinou ne).",
          "Věk: Autoreisen od 23 let, Cicar od 21–25 let podle kategorie vozu.",
          "Pojištění: Autoreisen i Cicar nabízejí široké krytí bez spoluúčasti.",
          "Palivo: auto vrať se stejným množstvím paliva, s jakým ho přebíráš.",
          "Ceny jsou dynamické podle termínu a délky — rezervuj online předem.",
        ],
        table: null,
        links: [
          { label: "Autoreisen", url: "https://www.autoreisen.com/" },
          { label: "Cicar", url: "https://www.cicar.com/" },
        ],
      },
      {
        id: "taxi",
        title: "Taxi",
        intro:
          "Oficiální taxi jede na taxametr. Ceny níže jsou orientační pro rok 2026 a liší se podle denní doby, provozu, zavazadel a přesné adresy.",
        bullets: [],
        table: {
          headers: ["Trasa", "Cena", "Čas"],
          rows: [
            { Trasa: "Letiště TFS ↔ Paradise Court / San Eugenio", Cena: "cca 25–35 €", Čas: "20–25 min" },
            { Trasa: "Paradise Court → Los Cristianos", Cena: "cca 12–18 €", Čas: "10–15 min" },
          ],
        },
        links: [],
      },
      {
        id: "bus",
        title: "Autobus TITSA",
        intro:
          "Po celém ostrově jezdí autobusy TITSA. Platit lze bankovní kartou (Visa/Mastercard) na všech linkách, nebo hotově. Pro opakované jízdy se vyplatí dobíjecí karta Ten+.",
        bullets: [],
        table: {
          headers: ["Linka", "Trasa", "Hodí se na"],
          rows: [
            { Linka: "343", Trasa: "TFS ↔ Costa Adeje ↔ TFN", "Hodí se na": "spojení z letiště do Costa Adeje" },
            { Linka: "467", Trasa: "Costa Adeje ↔ Las Galletas", "Hodí se na": "Las Galletas a okolí" },
            { Linka: "342", Trasa: "Costa Adeje → Vilaflor → Teide → El Portillo", "Hodí se na": "Teide bez auta z jihu (1× denně)" },
            { Linka: "348", Trasa: "Puerto de la Cruz ↔ Teide", "Hodí se na": "Teide ze severu" },
            { Linka: "355", Trasa: "Santiago del Teide ↔ Masca", "Hodí se na": "trek soutěskou Masca" },
            { Linka: "408 + 415", Trasa: "přes San Isidro na El Médano", "Hodí se na": "El Médano bez auta (s přestupem)" },
          ],
        },
        links: [{ label: "titsa.com", url: "https://www.titsa.com/" }],
      },
      {
        id: "letiste",
        title: "Letiště: TFS vs. TFN",
        intro:
          "Tenerife má dvě letiště. Většina charterů a low-cost letů přilétá na jižní TFS, které je blíž apartmánu.",
        bullets: [],
        table: {
          headers: ["Letiště", "Poloha", "K apartmánu", "Doporučení"],
          rows: [
            { "Letiště": "TFS (Reina Sofía)", Poloha: "jih", "K apartmánu": "cca 25 min autem", Doporučení: "preferovat" },
            { "Letiště": "TFN (Los Rodeos)", Poloha: "sever", "K apartmánu": "cca 60–75 min autem", Doporučení: "hlavně mezi­ostrovní + Madrid/Barcelona" },
          ],
        },
        links: [],
      },
    ],
  };
}

function parseRestaurants() {
  const raw = readVaultFile("CONTENT-STRAVOVANI.md");
  const categories = [
    ["okoli", "V okoli apartmanu (San Eugenio / Costa Adeje)"],
    ["zazitkove", "Zazitkove (za vyletem)"],
    ["specializovane", "Specializovane"],
  ];

  const restaurants = [];
  for (const [category, heading] of categories) {
    const rows = parseMarkdownTable(subsection(raw, heading));
    for (const row of rows) {
      const name = stripMarkdown(row.Restaurace).replace(/\s*\([^)]*\)$/, "");
      restaurants.push({
        id: slugify(name),
        propertyId: "paradise",
        name,
        category,
        tags: row.Tag ? row.Tag.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
        kristinasNote: stripMarkdown(row["Kristina poznamka"]),
        practical: { note: stripMarkdown(row["Overeno 2026-05-28"]) },
        links: { official: markdownLinkToUrl(row["Web / kontakt"]) },
        photos: [{ url: "", alt: `${name} - foto se doplnuje`, license: "missing", credit: "Doplnit" }],
        confidence: containsFlag(Object.values(row).join(" ")) ? "L" : "M",
        sourceRefs: markdownLinkToUrl(row["Web / kontakt"])
          ? [{ label: name, url: markdownLinkToUrl(row["Web / kontakt"]), tier: "official", checkedDate: "2026-05-28" }]
          : [],
      });
    }
  }

  const canarianKitchen = parseMarkdownTable(section(raw, "Kanarska kuchyne - co ochutnat")).map((row) => ({
    id: slugify(row.Specialita),
    name: stripMarkdown(row.Specialita),
    description: stripMarkdown(row["Kratky text"]),
    photoUrl: markdownLinkToUrl(row["Foto URL"]) ?? row["Foto URL"],
    whereToTry: stripMarkdown(row["Kde ochutnat"]),
  }));

  return { restaurants, canarianKitchen };
}

function subsection(content, heading) {
  const pattern = new RegExp(`^### ${escapeRegExp(heading)}\\s*$`, "m");
  const match = content.match(pattern);
  if (!match || match.index === undefined) return "";
  const rest = content.slice(match.index + match[0].length);
  const next = rest.search(/^#{1,3} /m);
  return normalizeText(next === -1 ? rest : rest.slice(0, next));
}

// Guest-facing contacts, curated from CONTENT-KONTAKTY.md (research doc with
// evidence columns + CONFLICT/[?] flags). Numbers/facts kept, noise removed.
function parseContacts() {
  return {
    emergency: [
      { title: "Tísňová linka (EU)", value: "112", note: "Policie, hasiči i záchranka — funguje 24/7 i z mobilu bez SIM." },
      { title: "Guardia Civil", value: "062", note: "Národní policie mimo města." },
      { title: "Policía Nacional", value: "091", note: "Národní policie ve městech." },
      { title: "Policía Local", value: "092", note: "Místní policie." },
      { title: "Hasiči (Bomberos)", value: "080", note: "Pro jistotu volej raději 112." },
      { title: "Námořní záchrana", value: "900 202 202", note: "Salvamento Marítimo." },
    ],
    medical: [
      {
        title: "Hospital Quirónsalud Costa Adeje",
        address: "Urb. San Eugenio, Adeje",
        phone: "+34 922 791 000",
        note: "Soukromá nemocnice, urgentní příjem 24/7. Vezmi cestovní pojištění nebo platební kartu.",
        confidence: "H",
      },
      {
        title: "Hospiten Sur",
        address: "C. Siete Islas 8, Arona",
        phone: "+34 922 750 022",
        note: "Soukromá nemocnice. Platnost EHIC si ověř předem.",
        confidence: "H",
      },
      {
        title: "Lékárna San Eugenio",
        address: "Av. de los Pueblos 29, Costa Adeje",
        phone: "+34 922 716 309",
        note: "Pohotovostní lékárny (farmacia de guardia) se střídají — ověř v den potřeby.",
        confidence: "M",
      },
      {
        title: "Veřejná péče / EHIC",
        address: "Servicio Canario de la Salud",
        phone: "112",
        note: "S kartou EHIC využij veřejný systém; v akutní situaci vždy volej 112.",
        confidence: "M",
      },
    ],
    consulate: [
      {
        title: "Velvyslanectví ČR — Madrid",
        detail: "Avenida Pío XII 22-24, 28016 Madrid",
        phone: "+34 915 313 065",
        confidence: "H",
      },
      {
        title: "Honorární konzulát ČR — Tenerife",
        detail: "El Médano (jen po předchozí domluvě)",
        phone: "+34 650 368 524",
        confidence: "M",
      },
    ],
    playbooks: [
      {
        situation: "Ztracený pas",
        action:
          "Nahlas to na Policía Nacional (091) a kontaktuj Velvyslanectví ČR v Madridu. Honorární konzulát na Tenerife pomůže jen omezeně a po domluvě.",
      },
      {
        situation: "Nehoda autem",
        action:
          "Volej 112 a pak půjčovnu podle čísla ve smlouvě — Autoreisen TFS +34 922 392 216, Cicar +34 928 822 900.",
      },
      {
        situation: "Ztracené klíče od apartmánu",
        action: "Zavolej Kristině na WhatsApp nebo telefon +420 702 188 376.",
      },
      {
        situation: "Nemoc nebo úraz",
        action:
          "Vážné případy: 112. Méně vážné: Quirónsalud Costa Adeje nebo Hospiten Sur s cestovním pojištěním; pro EHIC veřejný systém.",
      },
      {
        situation: "Krádež osobních věcí",
        action: "Nahlas to na Policía Nacional (091) a vyžádej si protokol pro pojišťovnu.",
      },
    ],
    host: {
      name: "Kristina Kumberová",
      whatsappUrl: "https://wa.me/420702188376",
      phone: "+420 702 188 376",
      email: "info@jazumaliving.com",
      note: "WhatsApp je preferovaný kontakt pro hosty.",
    },
  };
}

function parseStructuredSection(raw, ...headings) {
  let block = "";
  for (const heading of headings) {
    const found = section(raw, heading);
    if (found) {
      block = found;
      break;
    }
  }
  if (!block) return { paragraphs: [], bullets: [], table: null };

  const tableLines = block.split("\n").filter((line) => /^\|.*\|$/.test(line.trim()));
  const tableMd = tableLines.length >= 3 ? tableLines.join("\n") : "";
  const rawRows = tableMd ? parseMarkdownTable(tableMd) : [];
  const tableHeaders = rawRows.length > 0 ? Object.keys(rawRows[0]).map((h) => stripMarkdown(h)) : [];
  const originalHeaders = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  const tableRows = rawRows.map((row) => {
    const out = {};
    originalHeaders.forEach((header, index) => {
      out[tableHeaders[index]] = stripTableCellMarkdown(row[header] ?? "");
    });
    return out;
  });

  const nonTable = block
    .split("\n")
    .filter((line) => !/^\|.*\|$/.test(line.trim()))
    .join("\n");

  const cleaned = stripMarkdown(nonTable).replace(/!\[[^\]]*\]\([^)]+\)/g, "");
  const lines = cleaned.split("\n").map((line) => line.trim()).filter(Boolean);
  const bullets = [];
  const paragraphs = [];
  for (const line of lines) {
    if (/^[-•]\s+/.test(line)) {
      bullets.push(line.replace(/^[-•]\s+/, ""));
    } else {
      paragraphs.push(line);
    }
  }

  return {
    paragraphs,
    bullets,
    table: tableHeaders.length > 0 ? { headers: tableHeaders, rows: tableRows } : null,
  };
}

function parseApartment() {
  const raw = readVaultFile("LOGISTIKA-Apartman.md");
  const apartmentRows = parseMarkdownTable(section(raw, "Apartmán") || section(raw, "Apartman"));
  const fields = Object.fromEntries(apartmentRows.map((row) => [stripMarkdown(row.Pole), stripMarkdown(row.Hodnota)]));
  const navigationRow = apartmentRows.find((row) => stripMarkdown(row.Pole) === "Navigace");
  const mapsUrl = markdownLinkToUrl(navigationRow?.Hodnota ?? "")
    ?? "https://www.google.com/maps/place//data=!4m2!3m1!1s0xc6a99e20f73a321:0x4b3db373dfb4bf9e?sa=X&ved=1t:8290&ictx=111";

  const arrival = parseStructuredSection(raw, "Příjezd autem", "Prijezd autem");
  const parkovani = parseStructuredSection(raw, "Parkování", "Parkovani");
  const vybaveni = parseStructuredSection(raw, "Vybavení apartmánu", "Vybaveni apartmanu");
  const supermarkety = parseStructuredSection(raw, "Supermarkety a nákupy", "Supermarkety a nakupy");
  const plaze = parseStructuredSection(raw, "Pláže", "Plaze");

  const maps = {
    arrival: "/images/apartman/mapa-prijezdy.png",
    complex: "/images/apartman/mapa-arealu.png",
  };

  const galleryPath = resolve(repoRoot, "public", "images", "apartman", "gallery.json");
  const gallery = existsSync(galleryPath) ? JSON.parse(readFileSync(galleryPath, "utf8")) : [];
  const heroFromGallery = gallery.find((image) => image.role === "hero");

  const buildSection = (title, mapImage, parsed) => ({
    title,
    mapImage,
    paragraphs: parsed.paragraphs,
    bullets: parsed.bullets,
    table: parsed.table,
    body: parsed.paragraphs.join("\n\n"),
  });

  return {
    id: "paradise",
    brand: "Jazuma Living",
    name: "Jazuma Paradise",
    address: fields.Adresa ?? "C. Irlanda 5, 38660 Adeje, Tenerife",
    mapsUrl,
    // Jediný zdroj GPS apartmánu (CR-012): generuje se sem, ať přežije přegenerování
    // apartman.json. Čte ho mapa (POIMapList) i VacationRental JSON-LD geo.
    gps: [28.081741, -16.726585],
    navigationName: "Paradise Court",
    apartmentNumber: "33",
    area: "San Eugenio Alto / Costa Adeje",
    checkIn: fields["Check-in"] ?? "od 15:00",
    checkOut: fields["Check-out"] ?? "do 10:00",
    heroImage: heroFromGallery?.src ?? "/images/apartman/hero-terasa-sunset.webp",
    heroAlt: heroFromGallery?.alt ?? "Terasa apartmánu Jazuma Paradise při západu slunce",
    gallery,
    mapImage: maps.complex,
    maps,
    contact: {
      label: "Kontaktuj den před příjezdem",
      whatsappUrl: "https://wa.me/420702188376",
      phone: "+420 702 188 376",
    },
    quickInfo: [
      { title: "Check-in", summary: fields["Check-in"] ?? "od 15:00", status: "neutral" },
      { title: "Check-out", summary: fields["Check-out"] ?? "do 10:00", status: "neutral" },
      { title: "Navigace", summary: fields.Adresa ?? "C. Irlanda 5, 38660 Adeje, Tenerife", status: "neutral", href: mapsUrl },
      { title: "Kódy a WiFi", summary: "Kontaktuj den před příjezdem pro aktuální kódy a hesla.", status: "contact-required" },
    ],
    sections: [
      buildSection("Příjezd autem", maps.arrival, arrival),
      buildSection("Mapa areálu", maps.complex, { paragraphs: [], bullets: [], table: null }),
      buildSection("Parkování", undefined, parkovani),
      buildSection("Vybavení apartmánu", undefined, vybaveni),
      buildSection("Supermarkety a nákupy", undefined, supermarkety),
      buildSection("Pláže", undefined, plaze),
    ],
  };
}

function slugify(value) {
  return stripMarkdown(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateReferences(pois, bundles, permits) {
  const ids = new Set(pois.map((poi) => poi.id));
  for (const bundle of bundles) {
    for (const id of bundle.poiIds) {
      if (!ids.has(id)) fail(`bundle ${bundle.id}: unknown poiId ${id}`);
    }
  }
  for (const permit of permits) {
    for (const id of permit.appliesToPoiIds) {
      if (!ids.has(id)) warnings.push(`permit ${permit.id}: inferred missing poiId ${id}`);
    }
  }
}

function scanForSecrets(payload) {
  const json = JSON.stringify(payload);
  const matches = hardSecretPatterns.flatMap((pattern) => {
    const match = json.match(pattern);
    return match ? [match[0]] : [];
  });
  if (matches.length > 0) fail(`secret-like value found: ${matches.join(", ")}`);
}

function main() {
  const pois = parsePois();
  const bundles = parseBundles();
  const permits = parsePermits();
  const doprava = parseTransport();
  const { restaurants, canarianKitchen } = parseRestaurants();
  const kontakty = parseContacts();
  const apartman = parseApartment();

  validateReferences(pois, bundles, permits);
  const allData = { pois, bundles, permits, doprava, restaurants, canarianKitchen, kontakty, apartman };
  scanForSecrets(allData);

  // Editovatelne kolekce -> src/content/ (Astro content collections, file() loader)
  writeContentJson("poi.json", pois);
  writeContentJson("bundles.json", bundles);
  writeContentJson("permits.json", permits);
  writeContentJson("restaurants.json", restaurants);

  // Data singletony + read-only feed -> src/data/ (mimo kolekce)
  writeJson("canarian-kitchen.json", canarianKitchen);
  writeJson("doprava.json", doprava);
  writeJson("kontakty.json", kontakty);
  writeJson("apartman.json", apartman);

  console.log(
    `Data build OK: ${pois.length} POI, ${bundles.length} bundles, ${permits.length} permits, ${restaurants.length} restaurants.`,
  );
  if (warnings.length > 0) {
    console.warn(`Warnings:\n- ${warnings.join("\n- ")}`);
  }
}

main();
