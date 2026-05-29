// One-time content migration: restore Czech diacritics on the generic, AI-written
// boilerplate sentences that repeat across CONTENT-POI/*.md (practical-info
// fallbacks, "bez auta", rainy-day note). Exact-string replacement only — these
// are long, unique boilerplate phrases, so there is no risk of false positives.
//
// Usage:  node scripts/restore-diacritics.mjs

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const poiDir = resolve(".", "..", "CONTENT-POI");

const REPLACEMENTS = [
  [
    "Verejne prostranstvi obvykle volne pristupne; konkretni atrakce, trhy a restaurace over u oficialniho odkazu.",
    "Veřejné prostranství je obvykle volně přístupné; konkrétní atrakce, trhy a restaurace ověř u oficiálního odkazu.",
  ],
  [
    "Zdarma u verejnych mist; placene atrakce a rezervace viz oficialni odkaz nebo Permity HUB.",
    "Zdarma u veřejných míst; placené atrakce a rezervace viz oficiální odkaz nebo Permity HUB.",
  ],
  [
    "Pulden az cely den podle tempa a zvolene varianty.",
    "Půlden až celý den podle tempa a zvolené varianty.",
  ],
  [
    "Neni uvedeno jako povinne; u placenych atrakci a regulovanych tras over Permity HUB.",
    "Není uvedeno jako povinné; u placených atrakcí a regulovaných tras ověř Permity HUB.",
  ],
  [
    "Over podle konkretniho mista; u center a plazi pocitej s omezenou kapacitou nebo placenym parkingem.",
    "Ověř podle konkrétního místa; u center a pláží počítej s omezenou kapacitou nebo placeným parkováním.",
  ],
  [
    "Bez auta over aktualni linky TITSA; pro tento POI je praktictejsi auto nebo organizovany vylet.",
    "Bez auta ověř aktuální linky TITSA; pro tento POI je praktičtější auto nebo organizovaný výlet.",
  ],
  [
    "Kdyz se zvedne vitr, prijde dest nebo Kalima, over aktualni podminky a zvol kratsi variantu programu nebo indoor alternativu z bundles.",
    "Když se zvedne vítr, přijde déšť nebo Kalima, ověř aktuální podmínky a zvol kratší variantu programu nebo indoor alternativu z denních nápadů.",
  ],
];

let filesChanged = 0;
let totalReplacements = 0;

for (const name of readdirSync(poiDir).filter((file) => file.endsWith(".md"))) {
  const path = resolve(poiDir, name);
  let content = readFileSync(path, "utf8");
  let changed = false;
  for (const [from, to] of REPLACEMENTS) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
      totalReplacements += 1;
    }
  }
  if (changed) {
    writeFileSync(path, content, "utf8");
    filesChanged += 1;
  }
}

console.log(`[restore-diacritics] files changed: ${filesChanged}, replacements: ${totalReplacements}`);
