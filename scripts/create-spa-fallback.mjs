import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE = "https://jazumaliving.com";
const indexPath = resolve("dist", "index.html");
const fallbackPath = resolve("dist", "404.html");

// Per-routa titulek + popis: kazda stranka dostane vlastni tvar pro vyhledavace
// i pro nahled pri sdileni (LinkedIn/WhatsApp). Telo stranky resi az prerender (P1).
// Zdroj titulku/popisu je sdileny src/routeMeta.json — stejny soubor cte i React
// (useDocumentTitle), takze HTML titulek a runtime titulek se nerozejdou.
const routeMeta = JSON.parse(readFileSync(resolve("src", "routeMeta.json"), "utf8"));

// Vsechny routy krome "root" (root = index.html resime zvlast nize).
const staticRoutes = Object.entries(routeMeta)
  .filter(([key]) => key !== "root")
  .map(([path, meta]) => ({ path, ...meta }));

if (!existsSync(indexPath)) {
  throw new Error("Cannot create SPA fallback: dist/index.html does not exist.");
}

const template = readFileSync(indexPath, "utf8");

// 404 fallback = cista kopie bez canonical (slouzi pro libovolnou neznamou adresu).
copyFileSync(indexPath, fallbackPath);

function renderRoute({ title, description, canonical, url }) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${title}</title>`);
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[\s\S]*?("\s*\/>)/,
    (_m, open, close) => `${open}${description}${close}`,
  );
  html = html.replace(
    /(<meta property="og:title" content=")[^"]*(" \/>)/,
    (_m, open, close) => `${open}${title}${close}`,
  );
  html = html.replace(
    /(<meta property="og:description" content=")[^"]*(" \/>)/,
    (_m, open, close) => `${open}${description}${close}`,
  );
  const headExtras = [
    `<link rel="canonical" href="${canonical ?? url}" />`,
    `<meta property="og:url" content="${canonical ?? url}" />`,
  ].join("\n    ");
  html = html.replace("</head>", `  ${headExtras}\n  </head>`);
  return html;
}

for (const route of staticRoutes) {
  const url = `${SITE}/${route.path}/`;
  const routeDir = resolve("dist", route.path);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(resolve(routeDir, "index.html"), renderRoute({ ...route, url }), "utf8");
}

// Root index.html: "/" je redirect na /paradise/apartman (viz router) a prerender
// do nej vyfoti obsah apartmanu — canonical proto miri na apartman (z routeMeta.json).
writeFileSync(indexPath, renderRoute({ ...routeMeta.root, url: `${SITE}/` }), "utf8");

console.log(`Created dist/404.html fallback and ${staticRoutes.length} static route entries with per-route meta.`);
