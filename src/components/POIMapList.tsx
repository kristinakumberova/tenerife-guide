import { List, Map } from "lucide-react";
import { useState } from "react";
import type { Poi } from "../types";
import { POICard } from "./POICard";
import { PoiMap } from "./PoiMap";

interface POIMapListProps {
  pois: Poi[];
  onResetFilters: () => void;
}

export function POIMapList({ pois, onResetFilters }: POIMapListProps) {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  if (pois.length === 0) {
    return (
      <section className="empty-state">
        <h2>Tahle kombinace nic nenašla.</h2>
        <p>Zkus odebrat jeden filtr — Tenerife je velké, ale ne nekonečné.</p>
        <button className="btn btn-primary" onClick={onResetFilters}>
          Vymazat filtry
        </button>
      </section>
    );
  }

  return (
    <section className="poi-map-list">
      <div className="segmented-control" role="group" aria-label="Zobrazení míst">
        <button className={viewMode === "map" ? "active" : ""} onClick={() => setViewMode("map")}>
          <Map size={16} aria-hidden="true" />
          Mapa
        </button>
        <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>
          <List size={16} aria-hidden="true" />
          Seznam
        </button>
      </div>
      <div className={`guide-split ${viewMode === "list" ? "show-list" : "show-map"}`}>
        <div className="poi-list">
          {pois.map((poi) => (
            <POICard key={poi.id} poi={poi} />
          ))}
        </div>
        <PoiMap pois={pois} />
      </div>
    </section>
  );
}
