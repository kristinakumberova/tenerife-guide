import type { ActivityTag, LogisticsTag, Region, WeatherTag } from "../types";

export const activityLabels: Record<ActivityTag, string> = {
  koupani: "Koupání",
  turistika: "Turistika",
  atrakce: "Atrakce",
  mesta: "Města",
  vyhlidky: "Vyhlídky",
  priroda: "Příroda",
  gastro: "Gastro",
  kultura: "Kultura",
};

export const regionLabels: Record<Region, string> = {
  okoli: "Okolí",
  jih: "Jih",
  zapad: "Západ",
  sever: "Sever",
  vychod: "Východ",
  "centrum-hory": "Hory",
  "mimo-tenerife": "Mimo Tenerife",
};

export const logisticsLabels: Record<LogisticsTag, string> = {
  "bez-auta": "Bez auta",
  "s-koccarkem": "S kočárkem",
  "pul-den": "Půl dne",
  "cely-den": "Celý den",
  "permit-nutny": "Permit nutný",
  "rezervace-doporucena": "Rezervace",
  "placene-vstupne": "Vstupné",
};

export const weatherLabels: Record<WeatherTag, string> = {
  "slunecno-must": "Za slunce",
  "vse-pocasi": "Za každého počasí",
  "vetrno-ne": "Ne za větru",
  "kalima-ne": "Ne za Kalimy",
};

export function confidenceLabel(value: string) {
  if (value === "H") return "Ověřeno";
  if (value === "M") return "Ověřit aktuálnost";
  return "Ověřit před cestou";
}
