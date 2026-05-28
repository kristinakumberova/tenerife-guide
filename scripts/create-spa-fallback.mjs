import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const indexPath = resolve("dist", "index.html");
const fallbackPath = resolve("dist", "404.html");

if (!existsSync(indexPath)) {
  throw new Error("Cannot create SPA fallback: dist/index.html does not exist.");
}

copyFileSync(indexPath, fallbackPath);
console.log("Created dist/404.html SPA fallback.");
