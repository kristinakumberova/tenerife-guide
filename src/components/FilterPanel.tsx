import { Search } from "lucide-react";
import { activityLabels, logisticsLabels, regionLabels, weatherLabels } from "../lib/labels";
import type { ActivityTag, LogisticsTag, PoiFilterState, Region, WeatherTag } from "../types";

interface FilterPanelProps {
  filters: PoiFilterState;
  resultCount: number;
  onChange: (filters: PoiFilterState) => void;
}

const activity = Object.keys(activityLabels) as ActivityTag[];
const regions = Object.keys(regionLabels) as Region[];
const logistics = Object.keys(logisticsLabels) as LogisticsTag[];
const weather = Object.keys(weatherLabels) as WeatherTag[];

export function FilterPanel({ filters, resultCount, onChange }: FilterPanelProps) {
  const toggle = <T extends string>(axis: keyof Pick<PoiFilterState, "activity" | "region" | "logistics" | "weather">, value: T) => {
    const current = filters[axis] as T[];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    onChange({ ...filters, [axis]: next });
  };

  return (
    <aside className="filter-panel">
      <label className="search-box">
        <Search size={18} aria-hidden="true" />
        <input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Hledat místo"
        />
      </label>
      <FilterGroup title="Typ aktivity">
        {activity.map((item) => (
          <Chip key={item} active={filters.activity.includes(item)} onClick={() => toggle("activity", item)}>
            {activityLabels[item]}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Region">
        {regions.map((item) => (
          <Chip key={item} active={filters.region.includes(item)} onClick={() => toggle("region", item)}>
            {regionLabels[item]}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Logistika">
        {logistics.map((item) => (
          <Chip key={item} active={filters.logistics.includes(item)} onClick={() => toggle("logistics", item)}>
            {logisticsLabels[item]}
          </Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="Počasí">
        {weather.map((item) => (
          <Chip key={item} active={filters.weather.includes(item)} onClick={() => toggle("weather", item)}>
            {weatherLabels[item]}
          </Chip>
        ))}
      </FilterGroup>
      <p className="filter-total">{resultCount} míst odpovídá filtru</p>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="filter-group">
      <h3>{title}</h3>
      <div className="chip-row">{children}</div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`chip ${active ? "chip-active" : ""}`} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}
