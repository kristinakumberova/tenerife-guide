// One-time asset prep for the 2026-06-22 photo batch (Kristina's own photos,
// ChatGPT-polished → copyright OK; license in content = "vlastní foto, upraveno").
// Optimizes them into web-ready WebP at the right target widths:
//   - host family (privacy-safe) → public/images/apartman/host-family.webp
//   - Aqualand POI (replaces earlier AI visual) → public/images/poi/aqualand-costa-adeje.webp
//   - 5 restaurants → public/images/restaurants/<id>.webp
//
// Source folder: photo-exports/final-web-assets-2026-06-22/ (vault, not in repo).
// Re-run only when source photos change. Outputs are committed.
//
// Usage:  node scripts/build-web-photos.mjs

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const repoRoot = resolve(".");
const sourceRoot = resolve(repoRoot, "..");
const srcDir = resolve(sourceRoot, "photo-exports", "final-web-assets-2026-06-22");

// [ source file, output absolute path, target width, webp quality ]
const apartmanDir = resolve(repoRoot, "public", "images", "apartman");
const poiDir = resolve(repoRoot, "public", "images", "poi");
const restaurantDir = resolve(repoRoot, "public", "images", "restaurants");

const JOBS = [
  // Host family — privacy-safe (faces already blurred at source). Small supplementary
  // image, no lightbox (ADR-006); keep it light.
  ["host-family-privacy-safe.webp", resolve(apartmanDir, "host-family.webp"), 720, 80],

  // Aqualand POI — Kristina's own photo replaces the earlier AI-generated visual.
  ["aqualand-costa-adeje.webp", resolve(poiDir, "aqualand-costa-adeje.webp"), 1000, 80],

  // Restaurants — slug must match restaurants.json id (build-data picks it up).
  ["craft-burger.webp", resolve(restaurantDir, "craft-burger-beer.webp"), 1000, 80],
  ["el-cordero.webp", resolve(restaurantDir, "el-cordero.webp"), 1000, 80],
  ["el-molino-blanco.webp", resolve(restaurantDir, "el-molino-blanco.webp"), 1000, 80],
  ["roca-negra-sunset-club.webp", resolve(restaurantDir, "roca-negra-sunset-club.webp"), 1000, 80],
  ["bahia-beach-paella.jpg", resolve(restaurantDir, "bahia-beach.webp"), 1000, 80],
  ["el-caleton-chill-out.png", resolve(restaurantDir, "el-caleton-restaurante-chill-out.webp"), 1000, 80],
];

async function main() {
  if (!existsSync(srcDir)) {
    console.error(`[web-photos] Source folder not found: ${srcDir}`);
    process.exit(1);
  }
  for (const dir of [apartmanDir, poiDir, restaurantDir]) mkdirSync(dir, { recursive: true });

  let done = 0;
  // Manifest of restaurant photo dimensions → build-data attaches w/h so the card
  // can pick a portrait-friendly aspect ratio (vertical subjects, e.g. Bahia swing).
  const restaurantDims = {};
  for (const [file, out, width, quality] of JOBS) {
    const source = resolve(srcDir, file);
    if (!existsSync(source)) {
      console.warn(`  ✗ missing source: ${file}`);
      continue;
    }
    const info = await sharp(source)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(out);
    if (out.startsWith(restaurantDir)) {
      const slug = out.slice(restaurantDir.length + 1).replace(/\.webp$/, "");
      restaurantDims[slug] = { width: info.width, height: info.height };
    }
    done += 1;
    process.stdout.write(
      `  ✓ ${out.replace(repoRoot, "").replace(/\\/g, "/")} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)\n`,
    );
  }

  writeFileSync(resolve(restaurantDir, "manifest.json"), `${JSON.stringify(restaurantDims, null, 2)}\n`, "utf8");
  console.log(`\n[web-photos] wrote ${done}/${JOBS.length} images + restaurants/manifest.json`);
}

main();
