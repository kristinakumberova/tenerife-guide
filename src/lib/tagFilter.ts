import type { Poi, PoiFilterState } from "../types";

// Port z legacy/src/lib/tagFilter.ts beze změny. Multi-axis filtr POI:
// prázdná osa = bez omezení; jinak průnik vybraných hodnot s tagy místa.

const intersects = <T extends string>(selected: T[], values: T[]) =>
  selected.length === 0 || selected.some((item) => values.includes(item));

export const emptyFilters: PoiFilterState = {
  activity: [],
  region: [],
  logistics: [],
  weather: [],
  query: "",
};

export function filterPois(pois: Poi[], filters: PoiFilterState): Poi[] {
  const query = filters.query.trim().toLowerCase();

  return pois.filter((poi) => {
    const matchesActivity = intersects(filters.activity, poi.tags.activity);
    const matchesRegion = filters.region.length === 0 || filters.region.includes(poi.region);
    const matchesLogistics = intersects(filters.logistics, poi.tags.logistics);
    const matchesWeather = intersects(filters.weather, poi.tags.weather);
    const matchesQuery =
      query.length === 0 ||
      [poi.name, poi.nameLocal, poi.summary, poi.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

    return matchesActivity && matchesRegion && matchesLogistics && matchesWeather && matchesQuery;
  });
}
