import kontaktyJson from "../../data/kontakty.json";
import { ContactCard } from "../../components/ContactCard";
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
const visiblePlaybooks = data.playbooks.filter((item) => item.situation !== "Ztracené klíče od apartmánu");

export function KontaktyPage() {
  useDocumentTitle("Kontakty");

  return (
    <>
      <section className="page-intro emergency-intro">
        <h1>SOS</h1>
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
          <h2>Zdravotnictví</h2>
        </div>
        <div className="contact-grid">
          {data.medical.slice(0, 4).map((item) => (
            <ContactCard key={item.title} title={item.title ?? "Zdravotnické zařízení"} value={item.phone} note={[item.address, item.note].filter(Boolean).join(" · ")} />
          ))}
        </div>
      </section>
      <section className="section-block">
        <div className="section-heading">
          <h2>Co dělat, když…</h2>
        </div>
        <div className="section-grid">
          {visiblePlaybooks.map((item) => (
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
