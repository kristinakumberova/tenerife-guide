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
  integrations: [
    react(),
    // Sitemap generuje sitemap-index.xml + sitemap-0.xml at-build (chunk 7).
    // /markyta je noindex (parking lot) → vyřazeno, ať sitemap a meta robots
    // nedávají protichůdný signál.
    sitemap({ filter: (page) => !page.includes("/markyta/") }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
