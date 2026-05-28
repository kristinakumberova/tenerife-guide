import { ExternalLink, Utensils } from "lucide-react";
import { confidenceLabel } from "../lib/labels";
import type { Restaurant } from "../types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <article className="restaurant-card">
      <div className="icon-pill">
        <Utensils size={18} aria-hidden="true" />
      </div>
      <h3>{restaurant.name}</h3>
      <p>{restaurant.kristinasNote}</p>
      {restaurant.practical?.note && <p className="muted clamp">{restaurant.practical.note}</p>}
      <div className="chip-row compact">
        {restaurant.tags.slice(0, 4).map((tag) => (
          <span className="badge" key={tag}>
            {tag}
          </span>
        ))}
        <span className={`confidence confidence-${restaurant.confidence.toLowerCase()}`}>{confidenceLabel(restaurant.confidence)}</span>
      </div>
      {restaurant.links.official && (
        <a className="text-button" href={restaurant.links.official} target="_blank" rel="noreferrer">
          <ExternalLink size={16} aria-hidden="true" />
          Web
        </a>
      )}
    </article>
  );
}
