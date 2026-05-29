import { ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import { activityLabels, confidenceLabel, logisticsLabels, regionLabels } from "../lib/labels";
import type { Permit, Poi } from "../types";
import { WeatherBadge } from "./WeatherBadge";

interface POICardProps {
  poi: Poi;
  permits?: Permit[];
  variant?: "collapsed" | "popup";
  isOpen?: boolean;
  onOpen?: (poiId: string) => void;
}

export function POICard({ poi, permits = [], variant = "collapsed", isOpen = false, onOpen }: POICardProps) {
  const isPopup = variant === "popup";
  const relatedPermits = permits.filter((permit) => permit.appliesToPoiIds.includes(poi.id));
  const bookingPermit = relatedPermits.find((permit) => permit.bookingUrl);
  const showPermit =
    relatedPermits.length > 0 ||
    poi.tags.logistics.some((tag) => tag === "permit-nutny" || tag === "rezervace-doporucena" || tag === "placene-vstupne");
  const photo = poi.photos[0];
  const hasCredit = photo?.credit && photo.credit !== "Doplnit";
  const hasDescription = Boolean(poi.description && poi.description !== poi.summary);
  const hasDetail =
    hasDescription ||
    poi.practical.openingHours ||
    poi.practical.price ||
    poi.practical.visitDuration ||
    poi.practical.parking ||
    poi.practical.reservation ||
    poi.insiderTip ||
    poi.rainyAlt ||
    poi.withoutCar?.note ||
    relatedPermits.length > 0;

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
          <details className="poi-more" open={isOpen || undefined}>
            <summary>Praktické info</summary>
            <div className="poi-detail">
              {hasDescription && <p>{poi.description}</p>}
              <Info label="Otevírací doba" value={poi.practical.openingHours} />
              <Info label="Cena" value={poi.practical.price} />
              <Info label="Doba návštěvy" value={poi.practical.visitDuration} />
              <Info label="Parkování" value={poi.practical.parking} />
              <Info label="Rezervace" value={poi.practical.reservation} />
              {poi.withoutCar?.note && <Info label="Bez auta" value={poi.withoutCar.note} />}
              {poi.insiderTip && <Info label="Tip od Kristiny" value={poi.insiderTip} />}
              {poi.rainyAlt && <Info label="Když fouká / prší" value={poi.rainyAlt} />}
              {relatedPermits.length > 0 && (
                <div className="poi-permit-links">
                  {relatedPermits.map((permit) => (
                    <a className="text-button" href={permit.bookingUrl} target="_blank" rel="noreferrer" key={permit.id}>
                      <ShieldCheck size={16} aria-hidden="true" />
                      {permit.title}
                    </a>
                  ))}
                </div>
              )}
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
          {isPopup && onOpen && (
            <button type="button" className="text-button" onClick={() => onOpen(poi.id)}>
              <ExternalLink size={16} aria-hidden="true" />
              Otevřít
            </button>
          )}
          {poi.links.maps && (
            <a className="text-button" href={poi.links.maps} target="_blank" rel="noreferrer">
              <MapPin size={16} aria-hidden="true" />
              Otevřít v mapách
            </a>
          )}
          {bookingPermit && (
            <a className="text-button" href={bookingPermit.bookingUrl} target="_blank" rel="noreferrer">
              <ShieldCheck size={16} aria-hidden="true" />
              Permit
            </a>
          )}
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
