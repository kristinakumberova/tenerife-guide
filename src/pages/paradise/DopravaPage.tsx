import dopravaJson from "../../data/doprava.json";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import type { TextSection } from "../../types";

interface TransportData {
  title: string;
  lead: string;
  sections: TextSection[];
}

const doprava = dopravaJson as TransportData;

export function DopravaPage() {
  useDocumentTitle("Doprava");

  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">Doprava</p>
        <h1>{doprava.title}</h1>
        <p>{doprava.lead}</p>
      </section>
      <section className="section-grid">
        {doprava.sections.map((section) => (
          <article className="content-panel" key={section.id}>
            <h2>{section.title}</h2>
            {section.hasFlags && <span className="confidence confidence-l">Overit pred cestou</span>}
            <p>{section.body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
