export type PropertyId = "paradise" | "markyta";

// Obsazenost apartmánu. Z feedu se ukládají JEN datumy — nikdy jména hostů ani popis.
export interface OccupiedRange {
  start: string; // ISO YYYY-MM-DD, včetně
  end: string; // ISO YYYY-MM-DD, vyjma (den check-outu je volný)
}

export interface Availability {
  updated: string | null; // ISO timestamp posledního načtení feedu, nebo null
  occupied: OccupiedRange[];
}

export type Region = "okoli" | "jih" | "zapad" | "sever" | "vychod" | "centrum-hory" | "mimo-tenerife";
export type ActivityTag = "koupani" | "turistika" | "atrakce" | "mesta" | "vyhlidky" | "priroda" | "gastro" | "kultura";
export type LogisticsTag = "bez-auta" | "s-koccarkem" | "pul-den" | "cely-den" | "permit-nutny" | "rezervace-doporucena" | "placene-vstupne";
export type WeatherTag = "slunecno-must" | "vse-pocasi" | "vetrno-ne" | "kalima-ne";
export type Confidence = "H" | "M" | "L";

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
  propertyId: PropertyId;
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

export interface PoiFilterState {
  activity: ActivityTag[];
  region: Region[];
  logistics: LogisticsTag[];
  weather: WeatherTag[];
  query: string;
}

export interface Bundle {
  id: string;
  propertyId: PropertyId;
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

export interface Restaurant {
  id: string;
  propertyId: PropertyId;
  name: string;
  category: "okoli" | "zazitkove" | "specializovane";
  tags: string[];
  kristinasNote: string;
  practical?: { note?: string };
  links: { official?: string };
  photos: PhotoAsset[];
  confidence: Confidence;
  sourceRefs: SourceRef[];
}

export interface CanarianKitchenItem {
  id: string;
  name: string;
  description: string;
  photoUrl?: string;
  whereToTry: string;
}

export interface TextSection {
  id: string;
  title: string;
  body: string;
  hasFlags?: boolean;
}

export interface LinkRef {
  label: string;
  url: string;
}

export interface TransportSection {
  id: string;
  title: string;
  intro: string;
  bullets: string[];
  table: { headers: string[]; rows: Array<Record<string, string>> } | null;
  links: LinkRef[];
}

export interface TransportData {
  title: string;
  lead: string;
  sections: TransportSection[];
}

export interface ApartmentMaps {
  arrival: string;
  complex: string;
}

export interface ApartmentTable {
  headers: string[];
  rows: Array<Record<string, string>>;
}

export interface ApartmentSection {
  title: string;
  body: string;
  mapImage?: string;
  paragraphs: string[];
  bullets: string[];
  table: ApartmentTable | null;
}

export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  role: "hero" | "gallery";
}

export interface Apartment {
  id: PropertyId;
  brand: string;
  name: string;
  address: string;
  mapsUrl: string;
  navigationName: string;
  apartmentNumber: string;
  area: string;
  checkIn: string;
  checkOut: string;
  heroImage: string;
  heroAlt: string;
  gallery: GalleryImage[];
  mapImage: string;
  maps: ApartmentMaps;
  contact: {
    label: string;
    whatsappUrl: string;
    phone: string;
  };
  quickInfo: Array<{ title: string; summary: string; status: "neutral" | "contact-required"; href?: string }>;
  sections: ApartmentSection[];
}
