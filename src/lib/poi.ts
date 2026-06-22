import type { Poi } from "../types";

// Sdílené POI helpery pro guide hub i detail (Fáze 2). Per SEO-Guide-Restructure:
// deterministická meta (title ≤60, desc 120–160), interní cesta a výběr „v okolí".

const GUIDE_BASE = "/paradise/guide";
const DESC_FILLER = " Praktické info, parkování a tipy najdeš v průvodci Jazuma.";

/** Interní cesta na detail POI. trailingSlash: "always" (astro.config). */
export function poiPath(id: string): string {
  return `${GUIDE_BASE}/${id}/`;
}

/**
 * Primární název = část před první závorkou nebo spojkou („El Médano (…)" →
 * „El Médano"). Názvy POI jsou často dlouhé výčty; titulek chce stručný keyword
 * vepředu. H1 na stránce zůstává plný `poi.name`.
 */
function primaryName(name: string): string {
  const cut = name.search(/\s[(+—–]/);
  return (cut > 0 ? name.slice(0, cut) : name).trim();
}

/** Meta title ≤60 zn. (tvrdý strop). Brand se neopakuje (je v og:site_name). */
export function poiTitle(poi: Pick<Poi, "name">): string {
  const core = primaryName(poi.name);
  const candidates = [`${core} – průvodce Tenerife`, `${core} – Tenerife`, core];
  const fit = candidates.find((candidate) => candidate.length <= 60);
  return fit ?? `${core.slice(0, 59).trimEnd()}…`;
}

/** Meta description 120–160 zn. ze summary dle SEO pravidel. */
export function poiDescription(poi: Pick<Poi, "summary">): string {
  const summary = poi.summary.trim();
  const text = summary.length < 120 ? (summary + DESC_FILLER).trim() : summary;
  if (text.length <= 160) return text;
  return `${truncateWords(text, 157)}…`;
}

/** True, když ani s dovětkem description nedosáhne 120 zn. → flag pro obsahovou editaci ve vaultu. */
export function isPoiDescriptionThin(poi: Pick<Poi, "summary">): boolean {
  return poiDescription(poi).length < 120;
}

function truncateWords(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd();
}

/**
 * „V okolí": až `count` POI stejného regionu (kromě sebe), deterministicky dle
 * pořadí v kolekci. Doplnění dle sdílené aktivity, fallback dle pořadí — nikdy 0.
 */
export function nearbyPois(current: Poi, all: Poi[], count = 4): Poi[] {
  const sameRegion = all.filter((p) => p.id !== current.id && p.region === current.region);
  if (sameRegion.length >= count) return sameRegion.slice(0, count);

  const activitySet = new Set(current.tags.activity);
  const result = [...sameRegion];
  for (const p of all) {
    if (result.length >= count) break;
    if (p.id === current.id || result.some((x) => x.id === p.id)) continue;
    if (p.tags.activity.some((tag) => activitySet.has(tag))) result.push(p);
  }
  if (result.length === 0) {
    return all.filter((p) => p.id !== current.id).slice(0, count);
  }
  return result.slice(0, count);
}

/**
 * Vrátí hodnotu, jen pokud není generický boilerplate (jinak undefined).
 * Port z POICard.tsx (CR-008) — sdíleno hubem i detailem.
 */
export function usefulInfo(value?: string): string | undefined {
  if (!value) return undefined;
  const text = value.trim();
  const genericPatterns = [
    /^Veřejné prostranství je obvykle volně přístupné/i,
    /^Zdarma u veřejných míst; placené atrakce/i,
    /^Půlden až celý den podle tempa/i,
    /^Ověř podle konkrétního místa/i,
    /^Není uvedeno jako povinné; u placených atrakcí/i,
    /^Bez auta ověř aktuální linky TITSA/i,
    /^Když se zvedne vítr, přijde déšť nebo Kalima/i,
  ];
  return genericPatterns.some((pattern) => pattern.test(text)) ? undefined : text;
}
