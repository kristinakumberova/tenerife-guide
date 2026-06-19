// Doménové typy pro guide islandy. Port z legacy/src/types/index.ts — zrcadlí
// Zod schémata v src/content.config.ts (kolekce poi/bundles/permits). Data se
// z kolekcí načítají v guide.astro a předávají islandu jako props.

export type Region = "okoli" | "jih" | "zapad" | "sever" | "vychod" | "centrum-hory" | "mimo-tenerife";
export type ActivityTag = "koupani" | "turistika" | "atrakce" | "mesta" | "vyhlidky" | "priroda" | "gastro" | "kultura";
export type LogisticsTag =
  | "bez-auta"
  | "s-koccarkem"
  | "pul-den"
  | "cely-den"
  | "permit-nutny"
  | "rezervace-doporucena"
  | "placene-vstupne";
export type WeatherTag = "slunecno-must" | "vse-pocasi" | "vetrno-ne" | "kalima-ne";
export type Confidence = "H" | "M" | "L";

export interface LinkRef {
  label: string;
  url: string;
}

export interface PhotoAsset {
  url: string;
  alt: string;
  license: string;
  credit: string;
  sourceUrl?: string;
  localPath?: string;
}

export interface SourceRef {
  label: string;
  url: string;
  tier: "official" | "maps" | "secondary" | "internal";
  checkedDate: string;
}

export interface Poi {
  id: string;
  propertyId: "paradise" | "markyta";
  name: string;
  nameLocal?: string;
  gps: [number, number];
  region: Region;
  tags: {
    activity: ActivityTag[];
    logistics: LogisticsTag[];
    weather: WeatherTag[];
  };
  summary: string;
  description: string;
  practical: {
    openingHours?: string;
    price?: string;
    visitDuration?: string;
    parking?: string;
    reservation?: string;
  };
  withoutCar?: {
    titsaLines: string[];
    note: string;
  };
  links: {
    official?: string;
    maps?: string;
    mapsLabel?: string;
    guide?: string;
    guideLabel?: string;
    actions?: LinkRef[];
    other?: string[];
  };
  photos: PhotoAsset[];
  rainyAlt?: string;
  insiderTip?: string;
  verifiedDate: string;
  confidence: Confidence;
  flags: string[];
  sourceRefs: SourceRef[];
}

// Oříznutý POI tvar pro guide island (CR-008). Z plného Poi se vynechávají pole,
// která UI ani filtr nepotřebují (sourceRefs = nejtěžší, flags, propertyId) — jinak
// by se serializovala do client:load island props. nameLocal/description zůstávají
// (hledá v nich tagFilter). photos se navíc ořezávají na první v guide.astro.
export type GuidePoi = Omit<Poi, "sourceRefs" | "flags" | "propertyId">;

export interface PoiFilterState {
  activity: ActivityTag[];
  region: Region[];
  logistics: LogisticsTag[];
  weather: WeatherTag[];
  query: string;
}

export interface Bundle {
  id: string;
  propertyId: "paradise" | "markyta";
  title: string;
  region: Region | "multi-region";
  duration: string;
  poiIds: string[];
  transport: string;
  permits?: string[];
  estimatedCostPerson?: string;
  notes: string;
  summary: string;
  itinerary: string;
  bestFor: string[];
  whenNot?: string;
}

export interface Permit {
  id: string;
  title: string;
  appliesToPoiIds: string[];
  required: boolean;
  bookingUrl: string;
  deadline: string;
  fees?: string;
  currentStatus: string;
  verifiedDate: string;
  confidence: Confidence;
  sourceRefs: SourceRef[];
}

// Slim apartmán marker pro mapu — jen co popup potřebuje (ne celý Apartment singleton).
// gps = jediný zdroj v apartman.json (CR-012), sdílí ho mapa i VacationRental JSON-LD.
export interface GuideApartment {
  name: string;
  address: string;
  mapsUrl: string;
  gps: [number, number];
}
