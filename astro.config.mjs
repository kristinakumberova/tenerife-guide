// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Astro 5 — static-first. Custom doména jazumaliving.com = root base.
// Per ADR-001: nativní HTML at-build-time, React jen jako islands.
export default defineConfig({
  site: "https://jazumaliving.com",
  trailingSlash: "always",
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
