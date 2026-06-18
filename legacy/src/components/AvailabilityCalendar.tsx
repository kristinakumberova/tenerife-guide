import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import availabilityJson from "../data/availability.json";
import type { Availability } from "../types";

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

export function AvailabilityCalendar() {
  const now = new Date();
  const todayIso = isoDay(now.getFullYear(), now.getMonth(), now.getDate());
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  function shiftMonth(delta: number) {
    setView((v) => {
      const next = new Date(v.year, v.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  const cells = buildCells(view.year, view.month);
  const isCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();

  return (
    <div className="availability">
      <p className="availability-legend">
        <span className="availability-dot availability-dot--busy" aria-hidden="true" />
        Obsazeno
        <span className="availability-dot availability-dot--free" aria-hidden="true" />
        Volné dny jsou k rezervaci
      </p>

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
        Pro konkrétní termín nás <Link to="/paradise/kontakty">kontaktujte</Link>.
      </p>
    </div>
  );
}
