import { defineCollection, z } from "astro:content";
import { file } from "astro/loaders";

// Schema portovane z legacy/src/types/index.ts. Data generuje scripts/build-data.mjs
// z vault markdownu do src/content/*.json (kolekce) a src/data/*.json (singletony).
// Kolekce = editovatelne v CMS (chunk 9). availability.json je read-only feed mimo kolekce.

const propertyId = z.enum(["paradise", "markyta"]);
const region = z.enum(["okoli", "jih", "zapad", "sever", "vychod", "centrum-hory", "mimo-tenerife"]);
const activityTag = z.enum(["koupani", "turistika", "atrakce", "mesta", "vyhlidky", "priroda", "gastro", "kultura"]);
const logisticsTag = z.enum([
  "bez-auta",
  "s-koccarkem",
  "pul-den",
  "cely-den",
  "permit-nutny",
  "rezervace-doporucena",
  "placene-vstupne",
]);
const weatherTag = z.enum(["slunecno-must", "vse-pocasi", "vetrno-ne", "kalima-ne"]);
const confidence = z.enum(["H", "M", "L"]);

const linkRef = z.object({ label: z.string(), url: z.string() });

const photoAsset = z.object({
  url: z.string(),
  alt: z.string(),
  license: z.string(),
  credit: z.string(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  objectPosition: z.string().nullable().optional(),
  sourceUrl: z.string().optional(),
  localPath: z.string().optional(),
});

const sourceRef = z.object({
  label: z.string(),
  url: z.string(),
  tier: z.enum(["official", "maps", "secondary", "internal"]),
  checkedDate: z.string(),
});

const poi = defineCollection({
  loader: file("src/content/poi.json"),
  schema: z.object({
    id: z.string(),
    propertyId,
    name: z.string(),
    nameLocal: z.string().optional(),
    gps: z.tuple([z.number(), z.number()]),
    region,
    tags: z.object({
      activity: z.array(activityTag),
      logistics: z.array(logisticsTag),
      weather: z.array(weatherTag),
    }),
    summary: z.string(),
    description: z.string(),
    practical: z.object({
      openingHours: z.string().optional(),
      price: z.string().optional(),
      visitDuration: z.string().optional(),
      parking: z.string().optional(),
      reservation: z.string().optional(),
    }),
    withoutCar: z.object({ titsaLines: z.array(z.string()), note: z.string() }).optional(),
    links: z.object({
      official: z.string().optional(),
      maps: z.string().optional(),
      mapsLabel: z.string().optional(),
      guide: z.string().optional(),
      guideLabel: z.string().optional(),
      actions: z.array(linkRef).default([]),
      other: z.array(z.string()).default([]),
    }),
    photos: z.array(photoAsset),
    rainyAlt: z.string().optional(),
    insiderTip: z.string().optional(),
    verifiedDate: z.string(),
    confidence,
    flags: z.array(z.string()).default([]),
    sourceRefs: z.array(sourceRef).default([]),
  }),
});

const bundles = defineCollection({
  loader: file("src/content/bundles.json"),
  schema: z.object({
    id: z.string(),
    propertyId,
    title: z.string(),
    region: z.union([region, z.literal("multi-region")]),
    duration: z.string(),
    poiIds: z.array(z.string()),
    transport: z.string(),
    permits: z.array(z.string()).default([]),
    estimatedCostPerson: z.string().optional(),
    notes: z.string(),
    summary: z.string(),
    itinerary: z.string(),
    bestFor: z.array(z.string()),
    whenNot: z.string().optional(),
  }),
});

const permits = defineCollection({
  loader: file("src/content/permits.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    appliesToPoiIds: z.array(z.string()),
    required: z.boolean(),
    bookingUrl: z.string(),
    deadline: z.string(),
    fees: z.string().optional(),
    currentStatus: z.string(),
    verifiedDate: z.string(),
    confidence,
    sourceRefs: z.array(sourceRef).default([]),
  }),
});

const restaurants = defineCollection({
  loader: file("src/content/restaurants.json"),
  schema: z.object({
    id: z.string(),
    propertyId,
    name: z.string(),
    category: z.enum(["okoli", "zazitkove", "specializovane"]),
    tags: z.array(z.string()).default([]),
    kristinasNote: z.string(),
    practical: z.object({ note: z.string().optional() }).optional(),
    links: z.object({ official: z.string().optional() }),
    photos: z.array(photoAsset),
    confidence,
    sourceRefs: z.array(sourceRef).default([]),
  }),
});

export const collections = { poi, bundles, permits, restaurants };
