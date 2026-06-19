import { lazy, Suspense, useState } from "react";
import { useHydrated } from "../../lib/useHydrated";
import type { GuideApartment, Permit, Poi } from "../../types";
import { POICard } from "./POICard";

// PoiMap (Leaflet) je lazy → kód mapy je v samostatném chunku, mimo hlavní island
// bundle. Renderuje se až po hydrataci (useHydrated), takže dynamický import()
// nikdy neproběhne při SSR buildu (Leaflet sahá na window → jinak crash).
const PoiMap = lazy(() => import("./PoiMap").then((module) => ({ default: module.PoiMap })));

interface POIMapListProps {
  pois: Poi[];
  permits: Permit[];
  apartment: GuideApartment;
  onResetFilters: () => void;
}

const apartmentGps: [number, number] = [28.0816, -16.7227];

export function POIMapList({ pois, permits, apartment, onResetFilters }: POIMapListProps) {
  const hydrated = useHydrated();
  const [openedPoiId, setOpenedPoiId] = useState<string | null>(null);

  const openPoi = (poiId: string) => {
    setOpenedPoiId(poiId);
    window.setTimeout(() => {
      document.getElementById(`poi-${poiId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const scrollToMap = () => {
    document.getElementById("poi-map")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (pois.length === 0) {
    return (
      <section className="empty-state">
        <h2>Tahle kombinace nic nenašla.</h2>
        <p>Zkus odebrat jeden filtr. Tenerife je velké, ale ne nekonečné.</p>
        <button className="btn btn-primary" onClick={onResetFilters}>
          Vymazat filtry
        </button>
      </section>
    );
  }

  const mapFallback = (
    <div className="map-frame map-frame-loading" id="poi-map" aria-busy="true">
      <p className="muted">Načítám mapu…</p>
    </div>
  );

  return (
    <section className="poi-map-list">
      {hydrated ? (
        <Suspense fallback={mapFallback}>
          <PoiMap
            pois={pois}
            apartment={{
              name: apartment.name,
              address: apartment.address,
              mapsUrl: apartment.mapsUrl,
              gps: apartmentGps,
            }}
            onOpenPoi={openPoi}
          />
        </Suspense>
      ) : (
        mapFallback
      )}
      <div className="poi-list" aria-label="Seznam míst">
        {pois.map((poi) => (
          <POICard
            key={poi.id}
            poi={poi}
            permits={permits}
            isOpen={openedPoiId === poi.id}
            isSelected={openedPoiId === poi.id}
            onBackToMap={openedPoiId === poi.id ? scrollToMap : undefined}
            onOpen={openPoi}
          />
        ))}
      </div>
    </section>
  );
}
