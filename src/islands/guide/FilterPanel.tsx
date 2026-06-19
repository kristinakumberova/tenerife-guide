import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";
import { activityLabels, logisticsLabels, regionLabels, weatherLabels } from "../../lib/labels";
import type { ActivityTag, LogisticsTag, PoiFilterState, Region, WeatherTag } from "../../types";

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
  const [open, setOpen] = useState(true);
  const activeCount =
    filters.activity.length +
    filters.region.length +
    filters.logistics.length +
    filters.weather.length +
    (filters.query ? 1 : 0);

  const toggle = <T extends string>(
    axis: keyof Pick<PoiFilterState, "activity" | "region" | "logistics" | "weather">,
    value: T,
  ) => {
    const current = filters[axis] as T[];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    onChange({ ...filters, [axis]: next });
  };

  return (
    <aside className={`filter-panel ${open ? "filter-open" : ""}`}>
      <button type="button" className="filter-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <SlidersHorizontal size={18} aria-hidden="true" />
        <span>Filtry{activeCount > 0 ? ` (${activeCount})` : ""}</span>
        <ChevronDown className="filter-toggle-chevron" size={18} aria-hidden="true" />
      </button>

      <div className="filter-body">
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
      </div>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="filter-group">
      <h3>{title}</h3>
      <div className="chip-row">{children}</div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button className={`chip ${active ? "chip-active" : ""}`} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}
