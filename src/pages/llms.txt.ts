import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import type { Poi } from "../types";

// Build-generovaný llms.txt (Fáze 2). Statický obsah (hlavní + právní stránky)
// + sekce „Místa v průvodci" z poi kolekce → 35 URL zůstává v sync s daty
// (nahrazuje ručně udržovaný public/llms.txt, který by s 35 detaily driftoval).

const HEADER = `# Jazuma Living

> Apartmán Jazuma Paradise v Costa Adeje na jihu Tenerife a praktický průvodce pro hosty. Ubytování pro 4 osoby s výhledem na moře, plus ověřená mapa míst, výlety, doprava a kontakty. Rezervace a dotazy řešíme přímo přes WhatsApp nebo e-mail — žádné formuláře.

## Hlavní stránky

- [Apartmán Jazuma Paradise](https://jazumaliving.com/paradise/apartman/): studio pro 4 hosty, fotky, kalendář dostupnosti, příjezd, parkování a praktické info k pobytu.
- [Tenerife Guide](https://jazumaliving.com/paradise/guide/): interaktivní mapa míst s filtry podle regionu, aktivity a počasí, hotové denní trasy a permity k rezervaci předem.
- [Doprava](https://jazumaliving.com/paradise/doprava/): jak se dostat na ostrov a po něm — letiště, auto, autobusy TITSA.
- [Stravování](https://jazumaliving.com/paradise/stravovani/): tipy na restaurace a jídlo v okolí apartmánu.
- [Kontakty](https://jazumaliving.com/paradise/kontakty/): WhatsApp, e-mail a telefon na hostitele, plus SOS kontakty.

## Právní

- [Zásady soukromí](https://jazumaliving.com/paradise/zasady-soukromi/)
- [Cookies](https://jazumaliving.com/paradise/cookies/)
- [Právní informace](https://jazumaliving.com/paradise/pravni-informace/)`;

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}

export const GET: APIRoute = async () => {
  const pois = (await getCollection("poi")).map((entry) => entry.data) as Poi[];
  const places = pois
    .map((poi) => `- [${poi.name}](https://jazumaliving.com/paradise/guide/${poi.id}/): ${truncate(poi.summary, 120)}`)
    .join("\n");

  const body = `${HEADER}\n\n## Místa v průvodci\n\n${places}\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
