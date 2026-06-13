// Prerender: po buildu otevre kazdou routu v headless prohlizeci a ulozi
// vyrenderovane HTML do dist/<routa>/index.html. Diky tomu vidi obsah stranek
// i AI crawleri (GPTBot, ClaudeBot, PerplexityBot...), kteri nespousti JavaScript.
//
// Bezi az PO create-spa-fallback.mjs — snapshot tak prebira spravne per-routa
// meta tagy (title, description, canonical...) primo z DOM.
//
// Co skript zamerne NEdela:
// - 404.html nechava netknutou (musi zustat cista SPA kopie bez obsahu a canonical),
// - /paradise (redirect na /paradise/apartman) neprerendruje — zustava meta-only
//   fallback, aby snapshot neobsahoval duplicitni obsah apartmanu,
// - externí requesty (fonty, mapove dlazdice) blokuje — snapshot je rychly
//   a deterministicky; realny prohlizec si je donacte pri hydrataci.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright";

const DIST = resolve("dist");

// Routy k prerenderu: root + obsahove stranky (viz create-spa-fallback.mjs).
const routes = [
  "/",
  "/paradise/apartman/",
  "/paradise/guide/",
  "/paradise/doprava/",
  "/paradise/stravovani/",
  "/paradise/kontakty/",
  "/paradise/zasady-soukromi/",
  "/paradise/cookies/",
  "/paradise/pravni-informace/",
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".woff2": "font/woff2",
};

// Minimalni staticky server nad dist/ — zadna dalsi zavislost.
function startServer() {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let filePath = normalize(join(DIST, urlPath));
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    if (urlPath.endsWith("/")) {
      filePath = join(filePath, "index.html");
    } else if (!extname(filePath) && existsSync(join(filePath, "index.html"))) {
      filePath = join(filePath, "index.html");
    }
    if (!existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(readFileSync(join(DIST, "404.html")));
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream" });
    res.end(readFileSync(filePath));
  });
  return new Promise((resolveServer) => {
    server.listen(0, "127.0.0.1", () => resolveServer(server));
  });
}

const server = await startServer();
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const context = await browser.newContext({ locale: "cs-CZ" });

// Cookie lista se ve snapshotu nesmi objevit (po hydrataci by se zdvojila pro oko
// crawleru a duplikovala obsah). "denied" v localStorage ji skryje; localStorage
// se do snapshotu nepropisuje, uklada se jen DOM.
await context.addInitScript(() => {
  window.localStorage.setItem("jazuma-cookie-consent", "denied");
});

// Externí domeny blokujeme — viz hlavicka souboru.
await context.route(/.*/, (route) => {
  if (route.request().url().startsWith(origin)) {
    route.continue();
  } else {
    route.abort();
  }
});

let failed = false;

for (const routePath of routes) {
  const page = await context.newPage();
  try {
    const outPath = routePath === "/" ? join(DIST, "index.html") : join(DIST, routePath.slice(1), "index.html");

    // SEO titulek z fallback skriptu — React ho za behu prepisuje kratsi variantou
    // (useDocumentTitle), do snapshotu se proto po vyfoceni vraci puvodni.
    const seoTitle = readFileSync(outPath, "utf8").match(/<title>[\s\S]*?<\/title>/)?.[0];

    await page.goto(`${origin}${routePath}`, { waitUntil: "load" });
    // Pockat, az React naplni #root realnym obsahem.
    await page.waitForFunction(() => {
      const root = document.getElementById("root");
      return root !== null && root.children.length > 0 && root.innerText.trim().length > 100;
    });
    // Kratka pauza na donacteni lazy casti (mapa, kalendar).
    await page.waitForTimeout(500);

    let html = await page.evaluate(() => `<!doctype html>\n${document.documentElement.outerHTML}`);
    if (seoTitle) {
      html = html.replace(/<title>[\s\S]*?<\/title>/, () => seoTitle);
    }

    // Sanity: snapshot musi obsahovat plny <head> (per-routa meta z fallback skriptu).
    if (!html.includes("</title>") || !html.includes('id="root"')) {
      throw new Error("Snapshot nevypada jako kompletni stranka.");
    }
    if (html.includes("cookie-consent")) {
      throw new Error("Snapshot obsahuje cookie listu — nesmi tam byt.");
    }

    writeFileSync(outPath, html, "utf8");
    console.log(`prerender OK  ${routePath}  (${Math.round(html.length / 1024)} kB)`);
  } catch (error) {
    failed = true;
    console.error(`prerender FAIL ${routePath}: ${error.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
server.close();

if (failed) {
  process.exit(1);
}
console.log(`Prerendered ${routes.length} routes into dist/.`);
