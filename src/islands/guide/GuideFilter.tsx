import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { emptyFilters, filterPois } from "../../lib/tagFilter";
import { useHydrated } from "../../lib/useHydrated";
import type { GuideApartment, GuidePoi, PoiFilterState } from "../../types";
import { ActiveFilterBar } from "./ActiveFilterBar";
import { FilterPanel } from "./FilterPanel";

// Lazy Leaflet — kód mapy v samostatném chunku, mimo island bundle; window-safe
// až po hydrataci (jinak SSR crash).
const PoiMap = lazy(() => import("./PoiMap").then((module) => ({ default: module.PoiMap })));

interface GuideFilterProps {
  pois: GuidePoi[];
  apartment: GuideApartment;
}

// Jediný hydratovaný island na /guide (Fáze 2). POI karty renderuje staticky
// Astro (0 JS); tento island jen (a) přepíná jejich viditelnost v DOM podle
// filtru a (b) krmí mapu filtrovaným seznamem. Tím přestalo hydratovat 35 React
// karet — nahrazuje render-based GuideExplorer.
export function GuideFilter({ pois, apartment }: GuideFilterProps) {
  const hydrated = useHydrated();
  const [filters, setFilters] = useState<PoiFilterState>(emptyFilters);
  const filtered = useMemo(() => filterPois(pois, filters), [filters, pois]);

  // Most do statického DOM: přepni hidden na kartách, které renderuje Astro.
  useEffect(() => {
    const visible = new Set(filtered.map((poi) => poi.id));
    document.querySelectorAll<HTMLElement>("[data-poi-card]").forEach((card) => {
      const id = card.dataset.poiId;
      card.toggleAttribute("hidden", id ? !visible.has(id) : false);
    });
  }, [filtered]);

  const removeFilter = (axis: keyof PoiFilterState, value: string) => {
    if (axis === "query") {
      setFilters({ ...filters, query: "" });
      return;
    }
    setFilters({ ...filters, [axis]: (filters[axis] as string[]).filter((item) => item !== value) });
  };

  // CR-010: neutrální text — platí i pro no-JS (karty jsou vždy v DOM níže).
  const mapFallback = (
    <div className="map-frame map-frame-loading" id="poi-map">
      <p className="muted">Interaktivní mapa se zobrazí po načtení. Všechna místa najdeš v kartách níže.</p>
    </div>
  );

  return (
    <section className="guide-layout section-anchor" id="mista" aria-label="Filtry, mapa a místa">
      {/* Skrytý nadpis sekce — drží pořadí h1 → h2 → h3 bez přeskoku. */}
      <h2 className="sr-only">Místa a mapa</h2>
      <FilterPanel filters={filters} resultCount={filtered.length} onChange={setFilters} />
      <div className="guide-main">
        <ActiveFilterBar
          filters={filters}
          resultCount={filtered.length}
          onClearAll={() => setFilters(emptyFilters)}
          onRemove={removeFilter}
        />
        {hydrated ? (
          <Suspense fallback={mapFallback}>
            <PoiMap
              pois={filtered}
              apartment={{
                name: apartment.name,
                address: apartment.address,
                mapsUrl: apartment.mapsUrl,
                gps: apartment.gps,
              }}
            />
          </Suspense>
        ) : (
          mapFallback
        )}
        {filtered.length === 0 && (
          <section className="empty-state">
            <h3>Tahle kombinace nic nenašla.</h3>
            <p>Zkus odebrat jeden filtr. Tenerife je velké, ale ne nekonečné.</p>
            <button type="button" className="btn btn-primary" onClick={() => setFilters(emptyFilters)}>
              Vymazat filtry
            </button>
          </section>
        )}
      </div>
    </section>
  );
}
