import { CalendarDays, Route } from "lucide-react";
import type { Bundle, Poi } from "../types";

interface BundleCardProps {
  bundle: Bundle;
  pois: Poi[];
}

export function BundleCard({ bundle, pois }: BundleCardProps) {
  const names = bundle.poiIds.map((id) => pois.find((poi) => poi.id === id)?.name ?? id);
  return (
    <article className="bundle-card">
      <div className="card-kicker">
        <CalendarDays size={16} aria-hidden="true" />
        {bundle.duration} · {bundle.transport}
      </div>
      <h3>{bundle.title}</h3>
      <p>{bundle.summary}</p>
      <div className="route-line">
        <Route size={16} aria-hidden="true" />
        <span>{names.join(" → ")}</span>
      </div>
      {bundle.estimatedCostPerson && <p className="muted">Odhad: {bundle.estimatedCostPerson}</p>}
      <details>
        <summary>Itinerář dne</summary>
        <p>{bundle.itinerary}</p>
        {bundle.whenNot && <p className="muted">{bundle.whenNot}</p>}
      </details>
    </article>
  );
}
