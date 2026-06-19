import { ArrowUp, ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import { activityLabels, confidenceLabel, logisticsLabels, regionLabels } from "../../lib/labels";
import type { Permit, Poi } from "../../types";
import { WeatherBadge } from "./WeatherBadge";

interface POICardProps {
  poi: Poi;
  permits?: Permit[];
  variant?: "collapsed" | "popup";
  isOpen?: boolean;
  isSelected?: boolean;
  onBackToMap?: () => void;
  onOpen?: (poiId: string) => void;
}

export function POICard({
  poi,
  permits = [],
  variant = "collapsed",
  isOpen = false,
  isSelected = false,
  onBackToMap,
  onOpen,
}: POICardProps) {
  const isPopup = variant === "popup";
  const relatedPermits = permits.filter((permit) => permit.appliesToPoiIds.includes(poi.id));
  const bookingPermit =
    relatedPermits.find((permit) => permit.id === poi.id && permit.bookingUrl) ??
    relatedPermits.find((permit) => permit.bookingUrl);
  const hasRequiredBooking =
    relatedPermits.some((permit) => permit.required) ||
    poi.tags.logistics.some((tag) => tag === "permit-nutny" || tag === "rezervace-doporucena");
  const hasPaidEntry = relatedPermits.length > 0 || poi.tags.logistics.includes("placene-vstupne");
  const permitBadgeLabel = hasRequiredBooking ? "Rezervace nutná" : hasPaidEntry ? "Placené vstupné" : undefined;
  const photo = poi.photos[0];
  const hasCredit = photo?.credit && photo.credit !== "Doplnit";
  const hasDescription = Boolean(poi.description && poi.description !== poi.summary);
  const openingHours = usefulInfo(poi.practical.openingHours);
  const price = usefulInfo(poi.practical.price);
  const visitDuration = usefulInfo(poi.practical.visitDuration);
  const parking = usefulInfo(poi.practical.parking);
  const reservation = usefulInfo(poi.practical.reservation);
  const withoutCarNote = usefulInfo(poi.withoutCar?.note);
  const rainyAlt = usefulInfo(poi.rainyAlt);
  const mapsLabel = poi.links.mapsLabel ?? "Parkování v mapách";
  const guideLabel = poi.links.guideLabel ?? "Průvodce";
  const guideUrl = poi.links.guide ?? poi.links.official;
  const permitBookingUrls = relatedPermits.map((permit) => permit.bookingUrl).filter(Boolean);
  const showGuideLink = Boolean(guideUrl) && !permitBookingUrls.some((url) => sameUrl(url, guideUrl));
  const hasDetail =
    hasDescription ||
    openingHours ||
    price ||
    visitDuration ||
    parking ||
    reservation ||
    poi.insiderTip ||
    rainyAlt ||
    withoutCarNote ||
    relatedPermits.length > 0;

  return (
    <article
      className={`poi-card poi-card-${variant}${isSelected ? " poi-card-selected" : ""}`}
      id={`poi-${poi.id}`}
    >
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
          {permitBadgeLabel && <span className="badge badge-permit">{permitBadgeLabel}</span>}
        </div>
        <p>{poi.summary}</p>

        {!isPopup && hasDetail && (
          <details className="poi-more" open={isOpen || undefined}>
            <summary>Praktické info</summary>
            <div className="poi-detail">
              {hasDescription && <p>{poi.description}</p>}
              <Info label="Otevírací doba" value={openingHours} />
              <Info label="Cena" value={price} />
              <Info label="Doba návštěvy" value={visitDuration} />
              <Info label="Parkování" value={parking} />
              <Info label="Rezervace" value={reservation} />
              {withoutCarNote && <Info label="Bez auta" value={withoutCarNote} />}
              {poi.insiderTip && <Info label="Tip" value={poi.insiderTip} />}
              {rainyAlt && <Info label="Když fouká / prší" value={rainyAlt} />}
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
          {!isPopup && onBackToMap && (
            <button type="button" className="text-button" onClick={onBackToMap}>
              <ArrowUp size={16} aria-hidden="true" />
              Zpět k mapě
            </button>
          )}
          {isPopup && onOpen && (
            <button type="button" className="text-button" onClick={() => onOpen(poi.id)}>
              <ExternalLink size={16} aria-hidden="true" />
              Otevřít
            </button>
          )}
          {poi.links.maps && (
            <a className="text-button" href={poi.links.maps} target="_blank" rel="noreferrer">
              {poi.links.mapsLabel ? <ExternalLink size={16} aria-hidden="true" /> : <MapPin size={16} aria-hidden="true" />}
              {mapsLabel}
            </a>
          )}
          {bookingPermit && (
            <a className="text-button" href={bookingPermit.bookingUrl} target="_blank" rel="noreferrer">
              <ShieldCheck size={16} aria-hidden="true" />
              Vstupenky / permit
            </a>
          )}
          {showGuideLink && guideUrl && (
            <a className="text-button" href={guideUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              {poi.links.guide ? guideLabel : "Web"}
            </a>
          )}
          {poi.links.actions?.map((action) => (
            <a className="text-button" href={action.url} target="_blank" rel="noreferrer" key={action.url}>
              <ExternalLink size={16} aria-hidden="true" />
              {action.label}
            </a>
          ))}
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

function usefulInfo(value?: string) {
  if (!value) return undefined;
  const text = value.trim();
  const genericPatterns = [
    /^Veřejné prostranství je obvykle volně přístupné/i,
    /^Zdarma u veřejných míst; placené atrakce/i,
    /^Půlden až celý den podle tempa/i,
    /^Ověř podle konkrétního místa/i,
    /^Není uvedeno jako povinné; u placených atrakcí/i,
    /^Bez auta ověř aktuální linky TITSA/i,
    /^Když se zvedne vítr, přijde déšť nebo Kalima/i,
  ];
  return genericPatterns.some((pattern) => pattern.test(text)) ? undefined : text;
}

function sameUrl(left?: string, right?: string) {
  const normalizedLeft = normalizeUrl(left);
  const normalizedRight = normalizeUrl(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

function normalizeUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname.replace(/\/$/, "");
    return `${url.protocol}//${host}${path}${url.search}`;
  } catch {
    return value
      .replace(/^https?:\/\/www\./i, (match) => match.replace("www.", ""))
      .replace(/\/$/, "")
      .toLowerCase();
  }
}
