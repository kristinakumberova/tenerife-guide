import { CloudSun } from "lucide-react";
import { weatherLabels } from "../lib/labels";
import type { WeatherTag } from "../types";

interface WeatherBadgeProps {
  tag: WeatherTag;
}

export function WeatherBadge({ tag }: WeatherBadgeProps) {
  return (
    <span className="badge badge-weather">
      <CloudSun size={14} aria-hidden="true" />
      {weatherLabels[tag]}
    </span>
  );
}
