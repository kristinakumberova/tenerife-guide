// One-time asset prep: download each POI's Wikimedia Commons photo and write an
// optimized, self-hosted WebP into public/images/poi/<slug>.webp.
//
// Why self-host: Commons originals are multi-MB and direct upload.wikimedia.org
// thumbnail widths are an unreliable per-file whitelist (400s). Self-hosting gives
// fast, stable, attribution-friendly images with zero runtime dependency.
//
// Usage:  node scripts/fetch-poi-photos.mjs [--force]
// Re-run only when POI photo sources change. Output images are committed.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

const repoRoot = resolve(".");
const sourceRoot = resolve(repoRoot, "..");
const poiDir = resolve(sourceRoot, "CONTENT-POI");
const outDir = resolve(repoRoot, "public", "images", "poi");
const force = process.argv.includes("--force");

const UA = "JazumaGuide/1.0 (https://jazumaliving.com; apartment guide)";
const TARGET_WIDTH = 1000; // displayed at most ~600px; 1000 covers retina + lightbox
const SOURCE_WIDTH = 1600; // download source width from Commons

function titleFromUrl(url) {
  const seg = url.split("/").pop() ?? "";
  return `File:${decodeURIComponent(seg).replace(/_/g, " ")}`;
}

async function resolveThumbs(titles) {
  const map = new Map();
  for (let i = 0; i < titles.length; i += 40) {
    const chunk = titles.slice(i, i + 40);
    const api =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url" +
      `&iiurlwidth=${SOURCE_WIDTH}&titles=${chunk.map(encodeURIComponent).join("|")}`;
    try {
      const res = await fetch(api, { headers: { "User-Agent": UA } });
      const json = await res.json();
      const pages = json?.query?.pages ?? {};
      for (const page of Object.values(pages)) {
        const info = page.imageinfo?.[0];
        if (page.title && info?.thumburl) map.set(page.title, info.thumburl);
      }
    } catch (error) {
      console.warn(`[poi-photos] API batch failed: ${error.message}`);
    }
  }
  return map;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, attempt = 1) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (res.status === 429 && attempt <= 4) {
    const wait = 2000 * attempt;
    process.stdout.write(`    …429, retry in ${wait}ms\n`);
    await sleep(wait);
    return download(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  const entries = readdirSync(poiDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const raw = readFileSync(resolve(poiDir, name), "utf8");
      const { data } = matter(raw);
      const id = data.slug ?? name.replace(/\.md$/, "");
      const url = Array.isArray(data.photos) ? data.photos[0]?.url : undefined;
      return { id, url, name: data.name ?? id };
    })
    .filter((entry) => entry.url);

  const titles = [...new Set(entries.map((entry) => titleFromUrl(entry.url)))];
  const thumbMap = await resolveThumbs(titles);

  let done = 0;
  let skipped = 0;
  const failures = [];

  for (const entry of entries) {
    const outFile = resolve(outDir, `${entry.id}.webp`);
    if (existsSync(outFile) && !force) {
      skipped += 1;
      continue;
    }
    const source = thumbMap.get(titleFromUrl(entry.url)) ?? entry.url;
    try {
      const buffer = await download(source);
      await sharp(buffer)
        .rotate()
        .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outFile);
      done += 1;
      process.stdout.write(`  ✓ ${entry.id}\n`);
      await sleep(700);
    } catch (error) {
      failures.push(`${entry.id}: ${error.message}`);
      process.stdout.write(`  ✗ ${entry.id} (${error.message})\n`);
    }
  }

  console.log(`\n[poi-photos] done=${done} skipped=${skipped} failed=${failures.length}`);
  if (failures.length > 0) {
    console.warn(`Failures:\n- ${failures.join("\n- ")}`);
    writeFileSync(resolve(outDir, "_failures.json"), JSON.stringify(failures, null, 2));
  }
}

main();
