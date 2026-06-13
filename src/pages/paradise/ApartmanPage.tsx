import { Fragment, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import apartmanJson from "../../data/apartman.json";
import { AvailabilityCalendar } from "../../components/AvailabilityCalendar";
import { Gallery } from "../../components/Gallery";
import { HeroProperty } from "../../components/HeroProperty";
import { PageAnchors } from "../../components/PageAnchors";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import type { Apartment, ApartmentSection } from "../../types";

const apartment = apartmanJson as Apartment;

function renderInline(value: string): ReactNode {
  const withoutMarkdownEmphasis = value.replace(/[*`]/g, "");
  const lines = withoutMarkdownEmphasis.split(/<br\s*\/?>/i);

  return lines.map((line, lineIndex) => {
    const nodes: ReactNode[] = [];
    const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkPattern.exec(line))) {
      if (match.index > lastIndex) nodes.push(line.slice(lastIndex, match.index));
      nodes.push(
        <a key={`${lineIndex}-${match.index}`} href={match[2]} target="_blank" rel="noreferrer">
          {match[1]}
        </a>,
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) nodes.push(line.slice(lastIndex));

    return (
      <Fragment key={lineIndex}>
        {lineIndex > 0 && <br />}
        {nodes}
      </Fragment>
    );
  });
}

function SectionContent({ section }: { section: ApartmentSection }) {
  return (
    <>
      {section.mapImage && (
        <img className="entry-map" src={section.mapImage} alt={`Mapa: ${section.title}`} loading="lazy" />
      )}
      {section.paragraphs.map((paragraph, index) => (
        <p key={`p-${index}`}>{paragraph}</p>
      ))}
      {section.bullets.length > 0 && (
        <ul className="section-list">
          {section.bullets.map((item, index) => (
            <li key={`b-${index}`}>{item}</li>
          ))}
        </ul>
      )}
      {section.table && section.table.rows.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {section.table.headers.map((header) => (
                  <th key={header} scope="col">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {section.table!.headers.map((header) => (
                    <td key={header}>{renderInline(row[header])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function ApartmanPage() {
  useDocumentTitle("paradise/apartman");

  return (
    <>
      <HeroProperty apartment={apartment} />

      <PageAnchors
        items={[
          { href: "#fotky", label: "Fotky" },
          { href: "#dostupnost", label: "Dostupnost" },
          { href: "#prakticke-info", label: "Praktické info" },
        ]}
      />

      {/* Galerie */}
      {apartment.gallery.length > 0 && (
        <section className="section-block section-anchor" id="fotky">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Prohlídka</p>
              <h2>Jak to u nás vypadá</h2>
            </div>
            <a className="text-button" href={apartment.mapsUrl} target="_blank" rel="noreferrer">
              <MapPin size={16} aria-hidden="true" />
              Adresa v Google Maps
            </a>
          </div>
          <Gallery images={apartment.gallery} />
        </section>
      )}

      {/* Dostupnost — živý Google embed (free/busy) */}
      <section className="section-block section-anchor" id="dostupnost">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Volné termíny</p>
            <h2>Dostupnost apartmánu</h2>
          </div>
        </div>
        <AvailabilityCalendar />
      </section>

      {/* Praktické info — accordion, ať je mobilní stránka krátká */}
      <section className="section-block section-anchor" id="prakticke-info">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Vše potřebné</p>
            <h2>Praktické info k pobytu</h2>
          </div>
        </div>
        <div className="accordion">
          {apartment.sections.map((section) => (
            <details className="accordion-item" key={section.title}>
              <summary className="accordion-summary">
                <span>{section.title}</span>
                <span className="accordion-chevron" aria-hidden="true" />
              </summary>
              <div className="accordion-body">
                <SectionContent section={section} />
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
