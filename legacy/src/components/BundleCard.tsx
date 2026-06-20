import { CalendarDays, Route } from "lucide-react";
import type { Bundle, Poi } from "../types";

interface BundleCardProps {
  bundle: Bundle;
  pois: Poi[];
}

const durationLabels: Record<string, string> = {
  "half-day": "Půldenní",
  "full-day": "Celodenní",
};

const transportLabels: Record<string, string> = {
  car: "Autem",
  "car-or-walk": "Auto / pěšky",
  "car-plus-bus": "Auto + bus",
  ferry: "Trajektem",
};

function stripBullet(line: string) {
  return line.replace(/^[-•]\s*/, "").trim();
}

export function BundleCard({ bundle, pois }: BundleCardProps) {
  const names = bundle.poiIds.map((id) => pois.find((poi) => poi.id === id)?.name ?? id);
  const duration = durationLabels[bundle.duration] ?? bundle.duration;
  const transport = transportLabels[bundle.transport] ?? bundle.transport;
  const itineraryLines = bundle.itinerary.split("\n").map(stripBullet).filter(Boolean);

  return (
    <article className="bundle-card">
      <div className="card-kicker">
        <CalendarDays size={16} aria-hidden="true" />
        {duration} · {transport}
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
        {itineraryLines.length > 0 && (
          <ul className="section-list bundle-itinerary">
            {itineraryLines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        )}
        {bundle.whenNot && (
          <p className="muted bundle-whennot">
            <strong>Kdy ne:</strong> {stripBullet(bundle.whenNot)}
          </p>
        )}
      </details>
    </article>
  );
}
