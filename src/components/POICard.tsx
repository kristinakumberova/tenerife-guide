import { ExternalLink, MapPin } from "lucide-react";
import { activityLabels, confidenceLabel, logisticsLabels, regionLabels } from "../lib/labels";
import type { Poi } from "../types";
import { WeatherBadge } from "./WeatherBadge";

interface POICardProps {
  poi: Poi;
  variant?: "collapsed" | "popup";
}

export function POICard({ poi, variant = "collapsed" }: POICardProps) {
  const isPopup = variant === "popup";
  const showPermit = poi.tags.logistics.some(
    (tag) => tag === "permit-nutny" || tag === "rezervace-doporucena" || tag === "placene-vstupne",
  );
  const photo = poi.photos[0];
  const hasCredit = photo?.credit && photo.credit !== "Doplnit";
  const hasDetail =
    poi.practical.openingHours ||
    poi.practical.price ||
    poi.practical.visitDuration ||
    poi.practical.parking ||
    poi.insiderTip ||
    poi.rainyAlt ||
    poi.withoutCar?.note;

  return (
    <article className={`poi-card poi-card-${variant}`} id={`poi-${poi.id}`}>
      <div className="poi-thumb">
        {photo?.url ? <img src={photo.url} alt={photo.alt} loading="lazy" /> : <MapPin size={28} aria-hidden="true" />}
      </div>
      <div className="poi-body">
        <div className="poi-heading">
          <h3>{poi.name}</h3>
        </div>
        <div className="chip-row compact">
          <span className="badge">{regionLabels[poi.region]}</span>
          {poi.tags.activity.slice(0, 2).map((tag) => (
            <span className="badge" key={tag}>
              {activityLabels[tag]}
            </span>
          ))}
          {showPermit && <span className="badge badge-permit">Rezervace nutná</span>}
        </div>
        <p>{poi.summary}</p>

        {!isPopup && hasDetail && (
          <details className="poi-more">
            <summary>Praktické info</summary>
            <div className="poi-detail">
              <Info label="Otevírací doba" value={poi.practical.openingHours} />
              <Info label="Cena" value={poi.practical.price} />
              <Info label="Doba návštěvy" value={poi.practical.visitDuration} />
              <Info label="Parkování" value={poi.practical.parking} />
              {poi.withoutCar?.note && <Info label="Bez auta" value={poi.withoutCar.note} />}
              {poi.insiderTip && <Info label="Tip od Kristiny" value={poi.insiderTip} />}
              {poi.rainyAlt && <Info label="Když fouká / prší" value={poi.rainyAlt} />}
              {(poi.tags.logistics.length > 0 || poi.tags.weather.length > 0) && (
                <div className="chip-row compact poi-detail-tags">
                  {poi.tags.logistics.map((tag) => (
                    <span className="badge" key={tag}>
                      {logisticsLabels[tag]}
                    </span>
                  ))}
                  {poi.tags.weather.map((tag) => (
                    <WeatherBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}
              <p className="poi-verified">
                <span className={`confidence confidence-${poi.confidence.toLowerCase()}`}>
                  {confidenceLabel(poi.confidence)}
                </span>
                <span className="muted"> · data z {poi.verifiedDate}</span>
              </p>
            </div>
          </details>
        )}

        <div className="card-actions">
          <a className="text-button" href={poi.links.maps} target="_blank" rel="noreferrer">
            <MapPin size={16} aria-hidden="true" />
            Otevřít v mapách
          </a>
          {poi.links.official && (
            <a className="text-button" href={poi.links.official} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              Web
            </a>
          )}
        </div>

        {hasCredit && (
          <p className="photo-credit">
            Foto: {photo.credit}
            {photo.license && photo.license !== "missing" ? `, ${photo.license}` : ""}
          </p>
        )}
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
