/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** GA4 Measurement ID (G-XXXXXXXXXX). Necommituje se — viz .env.example. */
  readonly PUBLIC_GA_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
