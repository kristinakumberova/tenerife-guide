import { SITE, absoluteUrl } from "./seo";

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
      latitude: 28.081741,
      longitude: -16.726585,
    },
    identifier: "VV-38-4-0089376",
    telephone: "+420702188376",
    email: "info@jazumaliving.com",
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
