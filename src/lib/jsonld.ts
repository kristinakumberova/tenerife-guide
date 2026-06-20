import { SITE, absoluteUrl } from "./seo";
import apartmanData from "../data/apartman.json";

// GPS apartmánu = jediný zdroj v apartman.json (CR-012); sdílí ho mapa i geo níže.
const [apartmanLat, apartmanLng] = apartmanData.gps as [number, number];

// Per-typ JSON-LD (řeší P2 z auditu: dnes globální VacationRental kopírovaný i na
// obsahové routy). VacationRental jen / + /apartman; Organization na /kontakty;
// ItemList/TouristAttraction na /guide; BreadcrumbList všude (předává BaseLayout).

export function organization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: `${SITE.url}/`,
    logo: absoluteUrl(SITE.defaultImage),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+420702188376",
      email: "info@jazumaliving.com",
      contactType: "customer support",
      availableLanguage: ["cs"],
    },
  };
}

export function vacationRental() {
  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: "Jazuma Paradise",
    url: `${SITE.url}/`,
    image: absoluteUrl(SITE.defaultImage),
    description:
      "Apartmán pro hosty v San Eugenio, Costa Adeje na jihu Tenerife. Součástí je praktický průvodce: mapa míst, výlety, doprava a gastronomie.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle Irlanda 5",
      addressLocality: "Adeje",
      addressRegion: "Santa Cruz de Tenerife",
      postalCode: "38660",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: apartmanLat,
      longitude: apartmanLng,
    },
    identifier: "VV-38-4-0089376",
    telephone: "+420702188376",
    email: "info@jazumaliving.com",
  };
}

// ItemList of TouristAttraction pro /guide (SPEC §5). Slim vstup — jen co schema
// potřebuje, ne celý Poi.
interface AttractionInput {
  name: string;
  summary: string;
  gps: [number, number];
  links?: { official?: string; guide?: string };
}

export function touristAttractionList(pois: AttractionInput[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tenerife Guide — místa a tipy",
    numberOfItems: pois.length,
    itemListElement: pois.map((poi, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "TouristAttraction",
        name: poi.name,
        description: poi.summary,
        geo: {
          "@type": "GeoCoordinates",
          latitude: poi.gps[0],
          longitude: poi.gps[1],
        },
        ...(poi.links?.official || poi.links?.guide
          ? { url: poi.links.guide ?? poi.links.official }
          : {}),
      },
    })),
  };
}

export interface Crumb {
  name: string;
  url: string;
}

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.url),
    })),
  };
}
