import { useState } from "react";
import type { Apartment, Permit, Poi } from "../types";
import { POICard } from "./POICard";
import { PoiMap } from "./PoiMap";

interface POIMapListProps {
  pois: Poi[];
  permits: Permit[];
  apartment: Apartment;
  onResetFilters: () => void;
}

const apartmentGps: [number, number] = [28.0816, -16.7227];

export function POIMapList({ pois, permits, apartment, onResetFilters }: POIMapListProps) {
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

  return (
    <section className="poi-map-list">
      <PoiMap
        pois={pois}
        apartment={{ name: apartment.name, address: apartment.address, mapsUrl: apartment.mapsUrl, gps: apartmentGps }}
        onOpenPoi={openPoi}
      />
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
