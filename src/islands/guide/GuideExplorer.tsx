import { useMemo, useState } from "react";
import { emptyFilters, filterPois } from "../../lib/tagFilter";
import type { GuideApartment, Permit, Poi, PoiFilterState } from "../../types";
import { ActiveFilterBar } from "./ActiveFilterBar";
import { FilterPanel } from "./FilterPanel";
import { POIMapList } from "./POIMapList";

// Jediný hydratovaný island na /guide (client:load). Drží stav filtru, vše
// ostatní jsou jeho děti. Statické sekce (permity, denní nápady) jsou v guide.astro
// jako 0 JS. Port interaktivní části legacy/src/pages/paradise/GuidePage.tsx.

interface GuideExplorerProps {
  pois: Poi[];
  permits: Permit[];
  apartment: GuideApartment;
}

export function GuideExplorer({ pois, permits, apartment }: GuideExplorerProps) {
  const [filters, setFilters] = useState<PoiFilterState>(emptyFilters);
  const filteredPois = useMemo(() => filterPois(pois, filters), [filters, pois]);

  const removeFilter = (axis: keyof PoiFilterState, value: string) => {
    if (axis === "query") {
      setFilters({ ...filters, query: "" });
      return;
    }
    setFilters({ ...filters, [axis]: (filters[axis] as string[]).filter((item) => item !== value) });
  };

  return (
    <section className="guide-layout section-anchor" id="mista" aria-label="Filtry, mapa a seznam míst">
      <FilterPanel filters={filters} resultCount={filteredPois.length} onChange={setFilters} />
      <div className="guide-main">
        <ActiveFilterBar
          filters={filters}
          resultCount={filteredPois.length}
          onClearAll={() => setFilters(emptyFilters)}
          onRemove={removeFilter}
        />
        <POIMapList
          pois={filteredPois}
          permits={permits}
          apartment={apartment}
          onResetFilters={() => setFilters(emptyFilters)}
        />
      </div>
    </section>
  );
}
