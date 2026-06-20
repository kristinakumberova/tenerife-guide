---
type: system
status: draft
tags: [astro, frontend, tenerife, jazuma]
created: 2026-05-28
last_updated: 2026-06-18
---

# AGENTS: jazumaliving.com (Astro)

Repo rules pro AI agenty stavějící tento web. Source of truth = parent vault `40_Projects/Tenerife-Guide/` (SPEC-Lite-Jazuma.md, DOD-Lite-Jazuma.md, ADR-001/002). Tento repo je veřejný static frontend pro `jazumaliving.com`.

## Persona

Frontend Implementer. Static-first web jako portfolio ukázka. Pravda a měřitelná kvalita před komfortem. Žádný kód bez vazby na SPEC-Lite chunk.

## Stack (zamčeno ADR-001)

- **Astro 5** static-first — nativní HTML at build time. Žádný prerender hack.
- **React islands** (`@astrojs/react`) jen pro interaktivitu: AvailabilityCalendar, Gallery lightbox, GuideExplorer (filtr+mapa), CookieConsent.
- **Tailwind 4** přes `@tailwindcss/vite`; design tokeny v `src/styles/tokens.css`.
- **Leaflet** lazy (`import()`), island **jen na `/guide`**.
- Obsah: **content collections** (`src/content/`), ne hardcoded v JSX. Data generována z parent markdown přes `scripts/build-data.mjs`.
- Deploy: **GitHub Pages** (custom doména jazumaliving.com), přes Actions.

## Hard rules

- **Bezpečnost (zachováno):** NIKDY necommituj kódy brány, key-locker kódy, WiFi přihlašovací údaje, soukromé e-maily, API klíče ani analytics tokeny. Google Calendar token přes env/secrets, ne v bundlu.
- **HTML-first.** Komponenta je `.astro`, dokud nepotřebuje stav/interakci. Island = vědomé rozhodnutí, ne default. `client:visible` před `client:load`, kde to jde.
- **Perf rozpočet** (`KNOWLEDGE-Web-Baseline` §3): initial JS ≤100 kB gz/routa, CSS ≤50 kB, page ≤1 MB. Leaflet nikdy mimo `/guide`.
- **Per-routa SEO**: title ≤60, description 120–160, canonical, OG+Twitter, per-typ JSON-LD (VacationRental jen `/`+`/apartman`, BreadcrumbList všude). Ne jeden globální blok.
- **GDPR**: GA `gtag.js` se NIKDY nenačítá před souhlasem — jen přes consent gate. Self-host fonty (`@fontsource`, latin/latin-ext subset). Žádné Google Fonts CDN.
- **A11y** (WCAG 2.1 AA min, 2.2 AA cíl): skip-link, viditelný focus, alt texty, touch ≥44px, lightbox focus trap.
- **Build/CI**: `npm ci`, NIKDY `npm install` v CI. Lockfile generovaný na Linuxu (sharp/lightningcss nativní binárky). Exact verze u react/react-dom/astro. Před deploy `npm run lint` + `npm run build` + `npm run check`.
- **Identita se NEmění**: teal #0f6b78, Lora/Inter. Není redesign.
- **Out-of-scope**: per-POI stránky, host-story „O nás" (ADR-002), druhý jazyk.
- Neměň parent vault soubory z tohoto repa, dokud Kristina explicitně nepožádá o obsahové změny.

## Konvence

- Soubory kebab-case. Jeden H1 na stránku. UI česky (MVP). Žádné absolutní lokální cesty.
- URL struktura `/paradise/*` zachována (parita canonicalů).
- Commit po každém funkčním chunku (SPEC-Lite §10). Bug Loop: 3× neúspěšná oprava = STOP + reset.
- Migrace na feature větvi `astro-rebuild`; merge do `main` (= go-live) až po zelené Fázi 5.
