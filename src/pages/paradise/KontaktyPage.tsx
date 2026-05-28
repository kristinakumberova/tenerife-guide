import kontaktyJson from "../../data/kontakty.json";
import { ContactCard } from "../../components/ContactCard";
import { ContactCTA } from "../../components/ContactCTA";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

interface ContactItem {
  title?: string;
  value?: string;
  note?: string;
  address?: string;
  phone?: string;
  detail?: string;
  situation?: string;
  action?: string;
}

interface ContactsData {
  emergency: ContactItem[];
  medical: ContactItem[];
  consulate: ContactItem[];
  playbooks: ContactItem[];
  host: {
    name: string;
    whatsappUrl: string;
    phone: string;
    note: string;
  };
}

const data = kontaktyJson as ContactsData;

export function KontaktyPage() {
  useDocumentTitle("Kontakty");

  return (
    <>
      <section className="page-intro emergency-intro">
        <p className="eyebrow">SOS</p>
        <h1>Kdyz se neco deje, zacni tady</h1>
        <ContactCTA label="Napsat Kristine" whatsappUrl={data.host.whatsappUrl} phone={data.host.phone} variant="emergency" />
      </section>
      <section className="section-block">
        <div className="contact-grid">
          {data.emergency.slice(0, 6).map((item) => (
            <ContactCard key={item.title} title={item.title ?? "Kontakt"} value={item.value} note={item.note} severity={item.value?.includes("112") ? "emergency" : "normal"} />
          ))}
        </div>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <h2>Zdravotnictvi</h2>
        </div>
        <div className="contact-grid">
          {data.medical.slice(0, 4).map((item) => (
            <ContactCard key={item.title} title={item.title ?? "Zdravotnictvi"} value={item.phone} note={[item.address, item.note].filter(Boolean).join(" · ")} />
          ))}
        </div>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <h2>Co delat kdyz</h2>
        </div>
        <div className="section-grid">
          {data.playbooks.map((item) => (
            <article className="content-panel" key={item.situation}>
              <h3>{item.situation}</h3>
              <p>{item.action}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
