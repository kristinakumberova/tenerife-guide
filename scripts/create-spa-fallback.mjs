import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const indexPath = resolve("dist", "index.html");
const fallbackPath = resolve("dist", "404.html");
const staticRoutes = [
  "paradise",
  "paradise/apartman",
  "paradise/guide",
  "paradise/doprava",
  "paradise/stravovani",
  "paradise/kontakty",
];

if (!existsSync(indexPath)) {
  throw new Error("Cannot create SPA fallback: dist/index.html does not exist.");
}

copyFileSync(indexPath, fallbackPath);

for (const route of staticRoutes) {
  const routeDir = resolve("dist", route);
  mkdirSync(routeDir, { recursive: true });
  copyFileSync(indexPath, resolve(routeDir, "index.html"));
}

console.log(`Created dist/404.html fallback and ${staticRoutes.length} static route entries.`);
