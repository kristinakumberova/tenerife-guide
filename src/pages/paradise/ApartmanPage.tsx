import { KeyRound, MapPin } from "lucide-react";
import apartmanJson from "../../data/apartman.json";
import { ContactCTA } from "../../components/ContactCTA";
import { Gallery } from "../../components/Gallery";
import { HeroProperty } from "../../components/HeroProperty";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import type { Apartment, ApartmentSection } from "../../types";

const apartment = apartmanJson as Apartment;
const mapsQuery = encodeURIComponent(`${apartment.navigationName}, ${apartment.address}`);
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

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
                    <td key={header}>{row[header]}</td>
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
  useDocumentTitle("Jazuma Paradise");

  return (
    <>
      <HeroProperty apartment={apartment} />

      {/* Klíče a WiFi — klíčová akce hned pod heroem, ať ji host nemusí hledat */}
      <section className="section-block">
        <div className="keys-card">
          <span className="keys-card-icon" aria-hidden="true">
            <KeyRound size={22} />
          </span>
          <div className="keys-card-body">
            <h2>Klíče, kódy a WiFi</h2>
            <p>
              Kód od brány, key-locker boxu s klíči a přihlášení k WiFi z bezpečnostních důvodů neuvádíme na webu.
              Napiš Kristině den před příjezdem — pošle ti aktuální údaje.
            </p>
            <ContactCTA
              label="Napsat Kristině pro kódy"
              whatsappUrl={apartment.contact.whatsappUrl}
              phone={apartment.contact.phone}
            />
          </div>
        </div>
      </section>

      {/* Galerie */}
      {apartment.gallery.length > 0 && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Prohlídka</p>
              <h2>Jak to u nás vypadá</h2>
            </div>
            <a className="text-button" href={mapsHref} target="_blank" rel="noreferrer">
              <MapPin size={16} aria-hidden="true" />
              {apartment.area}
            </a>
          </div>
          <Gallery images={apartment.gallery} />
        </section>
      )}

      {/* Praktické info — accordion, ať je mobilní stránka krátká */}
      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Vše potřebné</p>
            <h2>Praktické info k pobytu</h2>
          </div>
        </div>
        <div className="accordion">
          {apartment.sections.map((section, index) => (
            <details className="accordion-item" key={section.title} open={index === 0}>
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
