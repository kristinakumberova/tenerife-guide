import { X } from "lucide-react";
import { activityLabels, logisticsLabels, regionLabels, weatherLabels } from "../lib/labels";
import type { PoiFilterState } from "../types";

interface ActiveFilterBarProps {
  filters: PoiFilterState;
  resultCount: number;
  onClearAll: () => void;
  onRemove: (axis: keyof PoiFilterState, value: string) => void;
}

export function ActiveFilterBar({ filters, resultCount, onClearAll, onRemove }: ActiveFilterBarProps) {
  const chips = [
    ...filters.activity.map((value) => ({ axis: "activity" as const, value, label: activityLabels[value] })),
    ...filters.region.map((value) => ({ axis: "region" as const, value, label: regionLabels[value] })),
    ...filters.logistics.map((value) => ({ axis: "logistics" as const, value, label: logisticsLabels[value] })),
    ...filters.weather.map((value) => ({ axis: "weather" as const, value, label: weatherLabels[value] })),
    ...(filters.query ? [{ axis: "query" as const, value: filters.query, label: filters.query }] : []),
  ];

  if (chips.length === 0) {
    return <p className="result-count">{resultCount} mist</p>;
  }

  return (
    <div className="active-filters" aria-live="polite">
      <strong>{resultCount} vysledku</strong>
      <div className="chip-row">
        {chips.map((chip) => (
          <button key={`${chip.axis}-${chip.value}`} className="chip chip-active" onClick={() => onRemove(chip.axis, chip.value)}>
            {chip.label}
            <X size={14} aria-hidden="true" />
          </button>
        ))}
      </div>
      <button className="text-button" onClick={onClearAll}>
        Vymazat vse
      </button>
    </div>
  );
}
