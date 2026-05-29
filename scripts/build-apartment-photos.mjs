// One-time asset prep: optimize the apartment photos (polished real photos of
// the actual Jazuma Paradise unit) from photo-exports/ into web-ready WebP and
// emit an ordered gallery manifest the data build reads.
//
// Usage:  node scripts/build-apartment-photos.mjs
// Re-run only when source photos change. Outputs are committed.

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const repoRoot = resolve(".");
const sourceRoot = resolve(repoRoot, "..");
const srcDir = resolve(sourceRoot, "photo-exports");
const outDir = resolve(repoRoot, "public", "images", "apartman");

// [ source file, output slug, target width, alt text, role ]
const PHOTOS = [
  ["ChatGPT Image 28. 5. 2026 09_12_31 (10).png", "hero-terasa-sunset", 1800,
    "Terasa apartmánu Jazuma Paradise při západu slunce s výhledem na moře a Costa Adeje", "hero"],
  ["ChatGPT Image 28. 5. 2026 09_12_29 (4).png", "terasa-denni-vyhled", 1500,
    "Terasa s pergolou, jídelním sezením, lounge sofa a výhledem na oceán", "gallery"],
  ["ChatGPT Image 28. 5. 2026 09_12_30 (6).png", "obyvak-vyhled", 1500,
    "Obývací pokoj s prosklenými dveřmi na terasu a výhledem k moři", "gallery"],
  ["ChatGPT Image 28. 5. 2026 09_12_29 (5).png", "interier-living-dining", 1500,
    "Otevřený obývací a jídelní prostor ve světlém středomořském stylu", "gallery"],
  ["ChatGPT Image 28. 5. 2026 09_12_28 (1).png", "obyvak-sofa", 1500,
    "Obývací pokoj s rozkládací pohovkou a námořnickými detaily", "gallery"],
  ["ChatGPT Image 28. 5. 2026 09_12_29 (3).png", "loznice", 1500,
    "Ložnice s manželskou postelí ve světlém plážovém stylu", "gallery"],
  ["ChatGPT Image 28. 5. 2026 09_12_30 (8).png", "kuchynsky-kout", 1500,
    "Plně vybavený kuchyňský kout s bílým obkladem a dřevěnou pracovní deskou", "gallery"],
  ["ChatGPT Image 28. 5. 2026 09_12_30 (9).png", "koupelna", 1500,
    "Koupelna s mozaikovým obkladem, vanou se sprchou a podsvíceným zrcadlem", "gallery"],
  ["ChatGPT Image 28. 5. 2026 09_12_30 (7).png", "bazen-komplex", 1500,
    "Bazén v apartmánovém komplexu s lehátky a slunečnou terasou", "gallery"],
];

async function main() {
  mkdirSync(outDir, { recursive: true });
  const gallery = [];

  for (const [file, slug, width, alt, role] of PHOTOS) {
    const out = resolve(outDir, `${slug}.webp`);
    const info = await sharp(resolve(srcDir, file))
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(out);
    gallery.push({ src: `/images/apartman/${slug}.webp`, alt, width: info.width, height: info.height, role });
    process.stdout.write(`  ✓ ${slug}.webp (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)\n`);
  }

  writeFileSync(resolve(outDir, "gallery.json"), `${JSON.stringify(gallery, null, 2)}\n`, "utf8");
  console.log(`\n[apartment-photos] wrote ${gallery.length} images + gallery.json`);
}

main();
