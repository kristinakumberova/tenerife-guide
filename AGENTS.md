---
type: system
status: draft
tags: [codex, frontend, tenerife]
created: 2026-05-28
---

# AGENTS: Tenerife Guide Frontend

Use the parent vault as source of truth. This repo is a public static frontend for `jazumaliving.com`.

- Do not commit gate codes, key-locker codes, WiFi credentials, private emails, API keys or analytics tokens.
- Data is generated from parent markdown files by `scripts/build-data.mjs`.
- Keep UI Czech-only for MVP.
- Use React + Vite + TypeScript + Tailwind + Leaflet.
- Before deploy, run `npm run lint` and `npm run build`.
- Do not edit parent vault source files from this repo unless Kristina explicitly asks for content changes.
