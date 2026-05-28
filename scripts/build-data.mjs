import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";

const repoRoot = resolve(".");
const sourceRoot = resolve(repoRoot, "..");
const outputRoot = resolve(repoRoot, "src", "data");

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
      maps: `https://www.google.com/maps/search/?api=1&query=${gps[0]},${gps[1]}`,
      other: Array.isArray(data.links?.other) ? data.links.other : [],
    },
    photos: normalizePhotos(data.photos, id, data.name),
    rainyAlt: stripMarkdown(rainyAlt),
    insiderTip: stripMarkdown(insiderTip),
    verifiedDate: String(data.verified ?? "2026-05-28"),
    confidence,
    flags,
    sourceRefs: sourceRefsFromLinks(data.links, data.verified ?? "2026-05-28"),
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

function normalizePhotos(photos, id, name) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return [
      {
        url: "",
        alt: `${name} - foto se doplnuje`,
        license: "missing",
        credit: "Doplnit",
      },
    ];
  }

  return photos.map((photo, index) => ({
    url: photo.url ?? "",
    alt: photo.alt ?? `${name} - foto ${index + 1}`,
    license: photo.license ?? "overit licenci",
    credit: photo.credit ?? "Doplnit",
    sourceUrl: photo.sourceUrl ?? photo.url,
    localPath: photo.localPath,
  }));
}

function sourceRefsFromLinks(links, checkedDate) {
  const refs = [];
  if (links?.official) refs.push({ label: "Oficialni web", url: links.official, tier: "official", checkedDate: String(checkedDate) });
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
    .map(parsePoiFile);
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
      notes: stripMarkdown(section(body, "Logistika") || body),
      summary: firstParagraph(section(body, "Pro koho")),
      itinerary: stripMarkdown(section(body, "Co uvidis") || section(body, "Co uvidíš")),
      bestFor: [firstParagraph(section(body, "Pro koho"))].filter(Boolean),
      whenNot: stripMarkdown(section(body, "Kdy NE")),
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
  if (id.includes("masca")) return ["masca-trail", "masca-vesnice"];
  if (id.includes("loro")) return ["loro-parque", "siam-park"];
  if (id.includes("siam")) return ["siam-park"];
  if (id.includes("gomera")) return ["la-gomera-day-trip"];
  if (id.includes("margaritas")) return ["las-galletas-finca-las-margaritas"];
  return [];
}

function parseTransport() {
  const raw = readVaultFile("CONTENT-DOPRAVA.md");
  return {
    title: "Doprava",
    lead: "Auto je nejpohodlnejsi, ale zakladni trasy zvladnes i taxi nebo TITSA autobusem.",
    sections: ["Auto - pujcovny v TFS arrivals", "Taxi", "Autobus TITSA", "Letiste - TFS vs. TFN", "Teide lanovka"].map((title) => ({
      id: slugify(title),
      title,
      body: stripMarkdown(section(raw, title)),
      hasFlags: containsFlag(section(raw, title)),
    })),
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
  const next = rest.search(/^### /m);
  return normalizeText(next === -1 ? rest : rest.slice(0, next));
}

function parseContacts() {
  const raw = readVaultFile("CONTENT-KONTAKTY.md");
  return {
    emergency: parseMarkdownTable(section(raw, "Nouzove kontakty (Tenerife / Spanelsko")).map((row) => ({
      title: stripMarkdown(row.Kontakt),
      value: stripMarkdown(row["Cislo / web"]),
      note: stripMarkdown(row.Poznamka),
    })),
    medical: parseMarkdownTable(section(raw, "Zdravotnictvi - okoli apartmanu")).map((row) => ({
      title: stripMarkdown(row.Zarizeni),
      address: stripMarkdown(row.Adresa),
      phone: stripMarkdown(row.Tel),
      note: stripMarkdown(row["Status / poznamka"]),
      confidence: containsFlag(Object.values(row).join(" ")) ? "L" : "H",
    })),
    consulate: parseMarkdownTable(section(raw, "Konzulat / velvyslanectvi")).map((row) => ({
      title: stripMarkdown(row.Zeme),
      detail: stripMarkdown(row.Detail),
      phone: stripMarkdown(row["Tel / email"]),
      confidence: containsFlag(Object.values(row).join(" ")) ? "L" : "H",
    })),
    playbooks: parseMarkdownTable(section(raw, "Co delat kdyz...")).map((row) => ({
      situation: stripMarkdown(row.Situace),
      action: stripMarkdown(row["Co delat"]),
      confidence: containsFlag(Object.values(row).join(" ")) ? "L" : "M",
    })),
    host: {
      name: "Kristina Kumberova",
      whatsappUrl: "https://wa.me/420702188376",
      phone: "+420 702 188 376",
      note: "WhatsApp je preferovany kontakt pro hosty.",
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
      out[tableHeaders[index]] = stripMarkdown(row[header] ?? "");
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

  const arrival = parseStructuredSection(raw, "Příjezd autem", "Prijezd autem");
  const entry = parseStructuredSection(raw, "Vstup do areálu (pěšky)", "Vstup do arealu (pesky)", "Vstup do komplexu");
  const parkovani = parseStructuredSection(raw, "Parkování", "Parkovani");
  const vybaveni = parseStructuredSection(raw, "Vybavení apartmánu", "Vybaveni apartmanu");
  const supermarkety = parseStructuredSection(raw, "Supermarkety a nákupy", "Supermarkety a nakupy");
  const plaze = parseStructuredSection(raw, "Pláže", "Plaze");

  const maps = {
    arrival: "/images/apartman/mapa-prijezdy.png",
    complex: "/images/apartman/mapa-arealu.png",
  };

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
    navigationName: "Paradise Court",
    apartmentNumber: "33",
    area: "San Eugenio Alto / Costa Adeje",
    checkIn: fields["Check-in"] ?? "od 15:00",
    checkOut: fields["Check-out"] ?? "do 10:00",
    heroImage: "/images/apartman/hero-terasa-sunset.png",
    mapImage: maps.complex,
    maps,
    contact: {
      label: "Kontaktuj Kristinu den pred prijezdem",
      whatsappUrl: "https://wa.me/420702188376",
      phone: "+420 702 188 376",
    },
    quickInfo: [
      { title: "Check-in", summary: "od 15:00", status: "neutral" },
      { title: "Check-out", summary: "do 10:00", status: "neutral" },
      { title: "Navigace", summary: "Zadat Paradise Court", status: "neutral" },
      { title: "Kody a WiFi", summary: "Neposilame verejne. Napis Kristine na WhatsApp.", status: "contact-required" },
    ],
    sections: [
      buildSection("Příjezd autem", maps.arrival, arrival),
      buildSection("Vstup do areálu", maps.complex, entry),
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

  writeJson("poi.json", pois);
  writeJson("bundles.json", bundles);
  writeJson("permits.json", permits);
  writeJson("doprava.json", doprava);
  writeJson("restaurants.json", { restaurants, canarianKitchen });
  writeJson("kontakty.json", kontakty);
  writeJson("apartman.json", apartman);

  console.log(`Data build OK: ${pois.length} POI, ${bundles.length} bundles, ${permits.length} permits.`);
  if (warnings.length > 0) {
    console.warn(`Warnings:\n- ${warnings.join("\n- ")}`);
  }
}

main();
