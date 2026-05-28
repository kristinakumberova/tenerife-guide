# IMPLEMENTATION NOTES — F6 Frontend

> Status: **F6 done 2026-05-28 22:15 UTC**
> Live: https://kristinakumberova.github.io/tenerife-guide/
> Repo: https://github.com/kristinakumberova/tenerife-guide

---

## Resolved package versions

| Package | Range (package.json) | Resolved (package-lock.json) |
|---|---|---|
| react | ^19.2.4 | 19.2.x |
| react-dom | ^19.2.4 | 19.2.x |
| react-router-dom | ^7.13.0 | 7.13.x |
| react-leaflet | ^5.0.0 | 5.0.x |
| leaflet | ^1.9.4 | 1.9.x |
| lucide-react | ^0.468.0 | 0.468.x |
| gray-matter | ^4.0.3 | 4.0.3 |
| js-yaml | ^4.1.0 | 4.1.0 |
| vite | ^8.0.0 | 8.0.14 |
| @tailwindcss/vite | ^4.2.1 | 4.2.x |
| tailwindcss | ^4.2.1 | 4.2.x |
| typescript | ~5.9.3 | 5.9.x |

(See `package-lock.json` for full transitive tree.)

---

## Build flow

```
npm install
npm run build:data   # markdown (../*.md) → src/data/*.json
npm run build        # tsc -b && vite build → dist/
npm run postbuild    # copy index.html → 404.html (SPA fallback)
```

CI mirror in `.github/workflows/deploy.yml` (Node 22, runs `npm ci && npm run lint && npm run build`).

`build-data.mjs` reads source markdown from `..` (the Obsidian vault) and is a **no-op on CI** (vault not present); CI relies on the JSON files committed under `src/data/`.

---

## Deploy configuration

| | Value |
|---|---|
| Pages source | GitHub Actions workflow (`actions/deploy-pages@v4`) |
| Trigger | push to `main` + `workflow_dispatch` |
| Build env | `VITE_BASE_PATH=/tenerife-guide/` |
| Custom domain | **deferred to F7** (`public/CNAME.f7-disabled`, will re-enable + flip base to `/` once Cloudflare DNS points at GH Pages) |
| SPA fallback | `dist/404.html` = copy of `index.html`; React Router `basename` derived from `import.meta.env.BASE_URL` |

---

## Apartman content pipeline

`LOGISTIKA-Apartman.md` is the **single source of truth**. `parseApartment()` in `scripts/build-data.mjs` produces structured sections:

```ts
ApartmentSection {
  title: string;
  body: string;          // joined paragraphs (legacy)
  mapImage?: string;     // attached map (Příjezd autem | Vstup do areálu)
  paragraphs: string[];
  bullets: string[];
  table: { headers: string[], rows: Record<string,string>[] } | null;
}
```

Sections shipped: Příjezd autem (table) · Vstup do areálu (table) · Parkování (table) · Vybavení apartmánu (bullets) · Supermarkety a nákupy (table) · Pláže (table). After the loop the page also renders a "Klíče a WiFi" CTA block.

Two maps under `public/images/apartman/`:
- `mapa-prijezdy.png` — road view, two driving routes (modrá / oranžová) from Av. Europa kruháč
- `mapa-arealu.png` — aerial view, walking routes from both entries to apartment 33

Legacy `vstup-mapa.png` was removed.

---

## Lighthouse / known limitations

- **Lighthouse score:** not yet captured (TODO during F7 smoke test on real device).
- Bundle size warning: main JS chunk ~635 KB / ~181 KB gzip. Acceptable for MVP; can be code-split per route in a follow-up if Lighthouse Performance < 85.
- Restaurant photos still placeholder (`PHOTO-MANIFEST-MISSING.md`); F3c photos.json swap pending.
- POI photos rely on Wikimedia Commons / official websites; some POI still without verified license.

---

## Open items / handoff to F7

1. **DNS swap (Kristina)** — Cloudflare → GH Pages CNAME records (`apex` ALIAS or 4× A records + `www` CNAME).
2. **Re-enable CNAME** — rename `public/CNAME.f7-disabled` → `public/CNAME` and change `VITE_BASE_PATH` from `/tenerife-guide/` to `/` in `.github/workflows/deploy.yml` (or remove the override entirely).
3. **Enable custom domain in GH Pages settings** — only after DNS propagates (avoid the 24h verification lock).
4. **Smoke test on mobile 375 px** — run Lighthouse Mobile, target ≥ 85.
5. **F3c photos integration** — when restaurant photos are licensed, swap placeholder paths.
6. **Code-Reviewer pass (CR agent)** — security headers, accessibility, SEO meta.

---

## Security / public-safe verification

- Parser has hard-coded secret-pattern guard in `scripts/build-data.mjs` (`/***REMOVED***/`, `/***REMOVED***/`, `/***REMOVED***/`, `password=`, `heslo=`, `ssid=`).
- WiFi SSID + password and gate / key-locker codes are NOT in the repo or in any markdown source. Public CTA: "Napsat Kristině" → WhatsApp `wa.me/420702188376`.
- `.gitignore` excludes `node_modules`, `dist`, `*.log`, `.env*`.
