---
type: system
status: draft
tags: [astro, frontend, tenerife, jazuma]
created: 2026-06-18
created_by: claude-code
---

# CLAUDE.md: jazumaliving.com (Astro)

Claude Code adapter pro tento repo. **Pravidla jsou v `AGENTS.md`** (single source) — persona, stack, hard rules, konvence. Tady jen Claude-specifické poznámky.

## Kontext

- Source of truth = parent vault `40_Projects/Tenerife-Guide/`: `SPEC-Lite-Jazuma.md` (struktura + chunking §10), `DOD-Lite-Jazuma.md` (akceptační kritéria), `ADR-001` (stack), `ADR-002` (host-story OUT).
- Tento repo je veřejný static frontend. Push do `main` = deploy (GitHub Pages). Stavíme na větvi `astro-rebuild`; merge do `main` až po zelené Fázi 5.

## Pracovní pravidla

- Žádný kód bez vazby na SPEC-Lite chunk. Commit po každém funkčním chunku.
- Před commitem: `npm run lint` (eslint, 0 warnings cíl) + dle fáze `npm run check` (astro check) a `npm run build`.
- `npm ci`, nikdy `npm install` v CI. Lockfile generovaný na Linuxu (chunk 10, `refresh-lock.yml`).
- Bug Loop Pattern: 3× neúspěšná oprava stejné chyby = STOP + reset, ne další pokus naslepo.
- Bezpečnost: NIKDY necommituj gate kódy, WiFi údaje, soukromé e-maily, API klíče, analytics ani Google tokeny.
