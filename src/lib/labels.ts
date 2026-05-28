import type { ActivityTag, LogisticsTag, Region, WeatherTag } from "../types";

export const activityLabels: Record<ActivityTag, string> = {
  koupani: "Koupani",
  turistika: "Turistika",
  atrakce: "Atrakce",
  mesta: "Mesta",
  vyhlidky: "Vyhlidky",
  priroda: "Priroda",
  gastro: "Gastro",
  kultura: "Kultura",
};

export const regionLabels: Record<Region, string> = {
  okoli: "Okoli",
  jih: "Jih",
  zapad: "Zapad",
  sever: "Sever",
  vychod: "Vychod",
  "centrum-hory": "Hory",
  "mimo-tenerife": "Mimo TF",
};

export const logisticsLabels: Record<LogisticsTag, string> = {
  "bez-auta": "Bez auta",
  "s-koccarkem": "S kocarkem",
  "pul-den": "Pul dne",
  "cely-den": "Cely den",
  "permit-nutny": "Permit",
  "rezervace-doporucena": "Rezervace",
  "placene-vstupne": "Vstupne",
};

export const weatherLabels: Record<WeatherTag, string> = {
  "slunecno-must": "Slunce",
  "vse-pocasi": "Vse pocasi",
  "vetrno-ne": "Bez vetru",
  "kalima-ne": "Bez Kalimy",
};

export function confidenceLabel(value: string) {
  if (value === "H") return "Overeno";
  if (value === "M") return "Overit";
  return "Over pred cestou";
}
