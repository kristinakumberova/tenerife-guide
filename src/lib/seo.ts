// Centrální SEO konstanty + typy. Per-routa meta předávají stránky přes props
// do <BaseLayout> / <SeoHead>. Hodnoty portované z legacy/src/routeMeta.json.

export const SITE = {
  url: "https://jazumaliving.com",
  name: "Jazuma Living",
  brand: "Jazuma Paradise",
  locale: "cs_CZ",
  themeColor: "#0f6b78",
  defaultTitle: "Jazuma Paradise — apartmán a průvodce, Tenerife",
  defaultDescription:
    "Apartmán Jazuma Paradise v Costa Adeje na Tenerife a praktický průvodce pro hosty: mapa míst, doprava, jídlo a rychlé kontakty.",
  defaultImage: "/og-image.jpg",
} as const;

export interface SeoProps {
  /** Per-stránka title (cíl ≤60 znaků). */
  title?: string;
  /** Per-stránka description (cíl 120–160 znaků). */
  description?: string;
  /** OG/Twitter obrázek, root-relativní cesta nebo absolutní URL. */
  image?: string;
  /** Override kanonické URL (např. / a /paradise → /paradise/apartman/). */
  canonical?: string;
  /** OG type, default "website". */
  ogType?: string;
  /** noindex pro nekanonické/duplicitní routy. */
  noindex?: boolean;
}

/** Root-relativní cestu převede na absolutní URL nad SITE.url. Absolutní vrátí beze změny. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).href;
}
