import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useHydrated } from "../lib/useHydrated";
import availabilityJson from "../data/availability.json";

// Island (SPEC-Lite §3, chunk 5). Occupancy logika portována beze změny z
// legacy/src/components/AvailabilityCalendar.tsx. Jediné úpravy proti legacy:
// react-router <Link> → nativní <a> (Astro file-routing) a hydration gate přes
// useSyncExternalStore — server (a první klientský render) ukáže stabilní
// skeleton, kalendář se vykreslí až po hydrataci. Tím client:visible SSR HTML
// nikdy nekoliduje s klientským "dnes" přes hranici měsíce (žádný mismatch).

interface OccupiedRange {
  start: string; // ISO YYYY-MM-DD, včetně
  end: string; // ISO YYYY-MM-DD, vyjma (den check-outu je volný)
}

interface Availability {
  updated: string | null;
  occupied: OccupiedRange[];
}

const availability = availabilityJson as Availability;

const MONTHS = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec",
];
const WEEKDAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDay(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

// Obsazeno = den spadá do nějakého intervalu [start, end). Konec je vyjma (check-out je volný).
function isOccupied(day: string): boolean {
  return availability.occupied.some((r) => day >= r.start && day < r.end);
}

interface Cell {
  day: number | null;
  iso: string;
}

function buildCells(year: number, month: number): Cell[] {
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Po = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push({ day: null, iso: "" });
  for (let d = 1; d <= daysInMonth; d += 1) cells.push({ day: d, iso: isoDay(year, month, d) });
  while (cells.length % 7 !== 0) cells.push({ day: null, iso: "" });
  return cells;
}

interface View {
  year: number;
  month: number;
}

const Legend = () => (
  <p className="availability-legend">
    <span className="availability-dot availability-dot--busy" aria-hidden="true" />
    Obsazeno
    <span className="availability-dot availability-dot--free" aria-hidden="true" />
    Volné dny jsou k rezervaci
  </p>
);

export function AvailabilityCalendar() {
  const hydrated = useHydrated();
  // Lazy initializer poběží jen na klientu (na serveru ho nevyužijeme — viz gate
  // níže), takže "dnes" se počítá z klientského času, ne z času buildu.
  const [view, setView] = useState<View>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  function shiftMonth(delta: number) {
    setView((v) => {
      const next = new Date(v.year, v.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  if (!hydrated) {
    return (
      <div className="availability">
        <Legend />
        <p className="availability-note">
          <CalendarDays size={15} aria-hidden="true" />
          Načítám kalendář obsazenosti…
        </p>
      </div>
    );
  }

  const now = new Date();
  const todayIso = isoDay(now.getFullYear(), now.getMonth(), now.getDate());
  const cells = buildCells(view.year, view.month);
  const isCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();

  return (
    <div className="availability">
      <Legend />

      <div className="availability-cal">
        <div className="availability-cal-head">
          <button
            type="button"
            className="availability-nav"
            onClick={() => shiftMonth(-1)}
            disabled={isCurrentMonth}
            aria-label="Předchozí měsíc"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <strong className="availability-month">
            {MONTHS[view.month]} {view.year}
          </strong>
          <button
            type="button"
            className="availability-nav"
            onClick={() => shiftMonth(1)}
            aria-label="Další měsíc"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="availability-grid" role="grid">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="availability-weekday" role="columnheader">
              {wd}
            </div>
          ))}
          {cells.map((cell, index) => {
            if (cell.day === null) {
              return <div key={`empty-${index}`} className="availability-day availability-day--empty" />;
            }
            const occupied = isOccupied(cell.iso);
            const classes = ["availability-day"];
            if (occupied) classes.push("availability-day--busy");
            if (cell.iso === todayIso) classes.push("availability-day--today");
            return (
              <div
                key={cell.iso}
                className={classes.join(" ")}
                role="gridcell"
                aria-label={occupied ? `${cell.day}. — obsazeno` : `${cell.day}. — volno`}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>

      <p className="availability-note">
        <CalendarDays size={15} aria-hidden="true" />
        Pro konkrétní termín nás <a href="/paradise/kontakty/">kontaktujte</a>.
      </p>
    </div>
  );
}
