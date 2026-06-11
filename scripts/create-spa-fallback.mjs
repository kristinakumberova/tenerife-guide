import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITE = "https://jazumaliving.com";
const indexPath = resolve("dist", "index.html");
const fallbackPath = resolve("dist", "404.html");

// Per-routa titulek + popis: kazda stranka dostane vlastni tvar pro vyhledavace
// i pro nahled pri sdileni (LinkedIn/WhatsApp). Telo stranky resi az prerender (P1).
const staticRoutes = [
  {
    path: "paradise",
    title: "Apartmán Jazuma Paradise — Costa Adeje, Tenerife",
    description:
      "Apartmán v San Eugenio, Costa Adeje na jihu Tenerife. Fotky, vybavení, dostupnost a praktické info k pobytu.",
    canonical: `${SITE}/paradise/apartman/`,
  },
  {
    path: "paradise/apartman",
    title: "Apartmán Jazuma Paradise — Costa Adeje, Tenerife",
    description:
      "Apartmán v San Eugenio, Costa Adeje na jihu Tenerife. Fotky, vybavení, dostupnost a praktické info k pobytu. Poptávka přes WhatsApp nebo e-mail.",
  },
  {
    path: "paradise/guide",
    title: "Tenerife Guide — mapa míst, výlety a denní tipy | Jazuma Paradise",
    description:
      "Průvodce po Tenerife: pláže, výlety, vyhlídky, permity a rezervace. Mapa s filtry a denní nápady od hostitelů apartmánu v Costa Adeje.",
  },
  {
    path: "paradise/doprava",
    title: "Doprava na Tenerife — auto, taxi, autobus TITSA | Jazuma Paradise",
    description:
      "Jak se pohybovat po Tenerife: půjčovna aut, taxi, autobusy TITSA a letiště TFS vs. TFN. Praktické rady pro pobyt v Costa Adeje.",
  },
  {
    path: "paradise/stravovani",
    title: "Stravování na Tenerife — restaurace a kanárská kuchyně | Jazuma Paradise",
    description:
      "Ověřené restaurace v okolí Costa Adeje i za výletem a co ochutnat z kanárské kuchyně. Výběr hostitelů apartmánu Jazuma Paradise.",
  },
  {
    path: "paradise/kontakty",
    title: "Kontakty a SOS na Tenerife | Jazuma Paradise",
    description:
      "Důležité kontakty pro pobyt na Tenerife: tísňová linka 112, zdravotnictví a co dělat v nouzových situacích.",
  },
  {
    path: "paradise/zasady-soukromi",
    title: "Zásady ochrany osobních údajů | Jazuma Living",
    description: "Jak web jazumaliving.com nakládá s osobními údaji: správci, rozsah údajů, cookies a vaše práva.",
  },
  {
    path: "paradise/cookies",
    title: "Zásady používání cookies | Jazuma Living",
    description: "Jaké cookies web jazumaliving.com používá, k čemu slouží a jak můžete souhlas kdykoli změnit.",
  },
  {
    path: "paradise/pravni-informace",
    title: "Právní informace | Jazuma Living",
    description:
      "Provozovatelé webu a registrace krátkodobého pronájmu Jazuma Paradise (VV-38-4-0089376), Registro General Turístico de Canarias.",
  },
];

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

// Root index.html: vlastni canonical na sebe.
writeFileSync(
  indexPath,
  renderRoute({
    title: "Jazuma Paradise — apartmán a průvodce, Costa Adeje, Tenerife",
    description:
      "Apartmán Jazuma Paradise v Costa Adeje na Tenerife a praktický průvodce pro hosty: mapa míst, doprava, jídlo a rychlé kontakty.",
    url: `${SITE}/`,
  }),
  "utf8",
);

console.log(`Created dist/404.html fallback and ${staticRoutes.length} static route entries with per-route meta.`);
