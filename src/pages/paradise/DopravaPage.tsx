import { ExternalLink } from "lucide-react";
import dopravaJson from "../../data/doprava.json";
import { PageAnchors } from "../../components/PageAnchors";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import type { TransportData, TransportSection } from "../../types";

const doprava = dopravaJson as TransportData;

function SectionTable({ table }: { table: NonNullable<TransportSection["table"]> }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {table.headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, index) => (
            <tr key={index}>
              {table.headers.map((header) => (
                <td key={header}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DopravaPage() {
  useDocumentTitle("paradise/doprava");

  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">Doprava</p>
        <h1>{doprava.title}</h1>
        <p>{doprava.lead}</p>
      </section>
      <PageAnchors items={doprava.sections.map((section) => ({ href: `#${section.id}`, label: section.title }))} />
      <div className="transport-list">
        {doprava.sections.map((section) => (
          <article className="content-panel section-anchor" id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            {section.intro && <p>{section.intro}</p>}
            {section.table && <SectionTable table={section.table} />}
            {section.bullets.length > 0 && (
              <ul className="section-list">
                {section.bullets.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
            {section.links.length > 0 && (
              <div className="card-actions">
                {section.links.map((link) => (
                  <a key={link.url} className="text-button" href={link.url} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} aria-hidden="true" />
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
