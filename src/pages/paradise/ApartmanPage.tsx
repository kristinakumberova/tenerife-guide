import apartmanJson from "../../data/apartman.json";
import { HeroProperty } from "../../components/HeroProperty";
import { ContactCTA } from "../../components/ContactCTA";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import type { Apartment, ApartmentSection } from "../../types";

const apartment = apartmanJson as Apartment;

function SectionContent({ section }: { section: ApartmentSection }) {
  return (
    <>
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

      {apartment.sections.map((section) => (
        <section className="section-block" key={section.title}>
          <div className="section-heading">
            <h2>{section.title}</h2>
          </div>
          {section.mapImage && (
            <img
              className="entry-map"
              src={section.mapImage}
              alt={`Mapa: ${section.title}`}
              loading="lazy"
            />
          )}
          <div className="content-panel">
            <SectionContent section={section} />
          </div>
        </section>
      ))}

      <section className="section-block">
        <div className="section-heading">
          <h2>Klíče a WiFi</h2>
          <p>Kódy od brány, key-locker boxu a WiFi neposíláme veřejně. Napiš Kristině den před příjezdem.</p>
        </div>
        <ContactCTA
          label="Napsat Kristině pro kódy"
          whatsappUrl={apartment.contact.whatsappUrl}
          phone={apartment.contact.phone}
        />
      </section>
    </>
  );
}
