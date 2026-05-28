import { ExternalLink, MapPin } from "lucide-react";
import { activityLabels, confidenceLabel, logisticsLabels, regionLabels } from "../lib/labels";
import type { Poi } from "../types";
import { WeatherBadge } from "./WeatherBadge";

interface POICardProps {
  poi: Poi;
  variant?: "collapsed" | "expanded" | "popup";
}

export function POICard({ poi, variant = "collapsed" }: POICardProps) {
  const isExpanded = variant === "expanded";
  const showPermit = poi.tags.logistics.some((tag) => tag === "permit-nutny" || tag === "rezervace-doporucena" || tag === "placene-vstupne");

  return (
    <article className={`poi-card poi-card-${variant}`} id={`poi-${poi.id}`}>
      <div className="poi-thumb" aria-hidden="true">
        {poi.photos[0]?.url ? <img src={poi.photos[0].url} alt={poi.photos[0].alt} loading="lazy" /> : <MapPin size={28} />}
      </div>
      <div className="poi-body">
        <div className="poi-heading">
          <h3>{poi.name}</h3>
          <span className={`confidence confidence-${poi.confidence.toLowerCase()}`}>{confidenceLabel(poi.confidence)}</span>
        </div>
        <div className="chip-row compact">
          <span className="badge">{regionLabels[poi.region]}</span>
          {poi.tags.activity.slice(0, 2).map((tag) => (
            <span className="badge" key={tag}>
              {activityLabels[tag]}
            </span>
          ))}
          {showPermit && <span className="badge badge-permit">Rezervace</span>}
        </div>
        <p>{poi.summary}</p>
        {isExpanded && (
          <div className="poi-detail">
            <Info label="Oteviracky" value={poi.practical.openingHours} />
            <Info label="Cena" value={poi.practical.price} />
            <Info label="Doba" value={poi.practical.visitDuration} />
            <Info label="Parkovani" value={poi.practical.parking} />
            {poi.withoutCar?.note && <Info label="Bez auta" value={poi.withoutCar.note} />}
            {poi.insiderTip && <Info label="Tip" value={poi.insiderTip} />}
            {poi.rainyAlt && <Info label="Pocasi" value={poi.rainyAlt} />}
            <div className="chip-row compact">
              {poi.tags.logistics.map((tag) => (
                <span className="badge" key={tag}>
                  {logisticsLabels[tag]}
                </span>
              ))}
              {poi.tags.weather.map((tag) => (
                <WeatherBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>
        )}
        <div className="card-actions">
          <a className="text-button" href={poi.links.maps} target="_blank" rel="noreferrer">
            <MapPin size={16} aria-hidden="true" />
            Mapy
          </a>
          {poi.links.official && (
            <a className="text-button" href={poi.links.official} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              Web
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p className="info-line">
      <strong>{label}:</strong> {value}
    </p>
  );
}
