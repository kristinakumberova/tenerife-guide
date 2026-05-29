import { ExternalLink, ShieldCheck } from "lucide-react";
import { confidenceLabel } from "../lib/labels";
import type { Permit } from "../types";

interface PermitChecklistProps {
  permits: Permit[];
}

export function PermitChecklist({ permits }: PermitChecklistProps) {
  return (
    <details className="section-block section-disclosure" id="permity">
      <summary className="section-disclosure-summary">
        <span>
          <span className="eyebrow">Rezervace předem</span>
          <h2>Permity a rezervace</h2>
          <p>Ceny a pravidla se mění. Před cestou otevři oficiální odkaz a ověř aktuální stav.</p>
        </span>
        <span className="accordion-chevron" aria-hidden="true" />
      </summary>
      <div className="permit-list">
        {permits.map((permit) => (
          <article className="permit-item" key={permit.id}>
            <ShieldCheck size={20} aria-hidden="true" />
            <div>
              <h3>{permit.title}</h3>
              <p>{permit.deadline}</p>
              {permit.fees && <p className="muted">{permit.fees}</p>}
              <span className={`confidence confidence-${permit.confidence.toLowerCase()}`}>{confidenceLabel(permit.confidence)}</span>
            </div>
            {permit.bookingUrl && (
              <a className="text-button" href={permit.bookingUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={16} aria-hidden="true" />
                Otevřít rezervaci
              </a>
            )}
          </article>
        ))}
      </div>
    </details>
  );
}
