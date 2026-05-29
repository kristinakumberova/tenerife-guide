import { useMemo, useState } from "react";
import bundlesJson from "../../data/bundles.json";
import permitsJson from "../../data/permits.json";
import poisJson from "../../data/poi.json";
import { ActiveFilterBar } from "../../components/ActiveFilterBar";
import { BundleCard } from "../../components/BundleCard";
import { FilterPanel } from "../../components/FilterPanel";
import { POIMapList } from "../../components/POIMapList";
import { PermitChecklist } from "../../components/PermitChecklist";
import { emptyFilters, filterPois } from "../../lib/tagFilter";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import type { Bundle, Permit, Poi, PoiFilterState } from "../../types";

const pois = poisJson as unknown as Poi[];
const bundles = bundlesJson as unknown as Bundle[];
const permits = permitsJson as unknown as Permit[];

export function GuidePage() {
  useDocumentTitle("Tenerife Guide");
  const [filters, setFilters] = useState<PoiFilterState>(emptyFilters);
  const filteredPois = useMemo(() => filterPois(pois, filters), [filters]);

  const removeFilter = (axis: keyof PoiFilterState, value: string) => {
    if (axis === "query") {
      setFilters({ ...filters, query: "" });
      return;
    }
    setFilters({ ...filters, [axis]: filters[axis].filter((item) => item !== value) });
  };

  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">Tenerife Guide</p>
        <h1>Mapa, filtry a denní nápady</h1>
        <p>Vyber si místo podle regionu, aktivity, logistiky a počasí. Místa s permitem nebo rezervací jsou označená přímo v kartách.</p>
      </section>
      <div className="guide-layout">
        <FilterPanel filters={filters} resultCount={filteredPois.length} onChange={setFilters} />
        <div className="guide-main">
          <ActiveFilterBar filters={filters} resultCount={filteredPois.length} onClearAll={() => setFilters(emptyFilters)} onRemove={removeFilter} />
          <POIMapList pois={filteredPois} onResetFilters={() => setFilters(emptyFilters)} />
        </div>
      </div>
      <PermitChecklist permits={permits} />
      <section className="section-block">
        <div className="section-heading">
          <h2>Denní nápady</h2>
          <p>Hotové kombinace míst, když nechceš skládat program od nuly.</p>
        </div>
        <div className="bundle-grid">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} pois={pois} />
          ))}
        </div>
      </section>
    </>
  );
}
