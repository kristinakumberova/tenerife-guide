import { ExternalLink, MapPin } from "lucide-react";
import { activityLabels, regionLabels } from "../../lib/labels";
import type { Poi } from "../../types";

interface MapPopupCardProps {
  poi: Poi;
  onOpen: (poiId: string) => void;
}

export function MapPopupCard({ poi, onOpen }: MapPopupCardProps) {
  const photo = poi.photos[0];

  return (
    <article className="map-popup-card">
      <div className="map-popup-thumb">
        {photo?.url ? <img src={photo.url} alt={photo.alt} loading="lazy" /> : <MapPin size={24} aria-hidden="true" />}
      </div>
      <div className="map-popup-body">
        <h3>{poi.name}</h3>
        <div className="chip-row compact">
          <span className="badge">{regionLabels[poi.region]}</span>
          {poi.tags.activity.slice(0, 2).map((tag) => (
            <span className="badge" key={tag}>
              {activityLabels[tag]}
            </span>
          ))}
        </div>
        <p>{poi.summary}</p>
        <button
          type="button"
          className="text-button map-popup-action"
          onClick={() => onOpen(poi.id)}
          aria-label={`Více info: ${poi.name}`}
        >
          <ExternalLink size={16} aria-hidden="true" />
          Více info
        </button>
      </div>
    </article>
  );
}
