import kontaktyJson from "../../data/kontakty.json";
import { PhoneCall } from "lucide-react";
import { ContactCard } from "../../components/ContactCard";
import { PageAnchors } from "../../components/PageAnchors";
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
    email: string;
    note: string;
  };
}

const data = kontaktyJson as ContactsData;
const visiblePlaybooks = data.playbooks.filter((item) => item.situation !== "Ztracené klíče od apartmánu");

export function KontaktyPage() {
  useDocumentTitle("paradise/kontakty");
  const { host } = data;
  const hostTel = host.phone.replace(/\s/g, "");

  return (
    <>
      <section className="page-intro section-anchor" id="hostitel">
        <h1>Kontakty</h1>
      </section>
      <PageAnchors
        items={[
          { href: "#hostitel-kontakt", label: "Hostitel" },
          { href: "#sos-kontakty", label: "Tísňové kontakty" },
          { href: "#zdravotnictvi", label: "Zdravotnictví" },
          { href: "#co-delat", label: "Co dělat" },
        ]}
      />
      <section className="section-block section-anchor" id="hostitel-kontakt">
        <div className="section-heading">
          <h2>Hostitel</h2>
        </div>
        <article className="contact-card">
          <PhoneCall size={20} aria-hidden="true" />
          <div>
            <h3>{host.name}</h3>
            {host.note && <p>{host.note}</p>}
            <p className="contact-value">{host.phone}</p>
            <a className="text-button" href={host.whatsappUrl} target="_blank" rel="noreferrer">
              Napsat na WhatsApp
            </a>
            <a className="text-button" href={`tel:${hostTel}`}>
              Volat
            </a>
            <a className="text-button" href={`mailto:${host.email}`}>
              Napsat e-mail
            </a>
          </div>
        </article>
      </section>
      <section className="section-block section-anchor" id="sos-kontakty">
        <div className="section-heading">
          <h2>Tísňové kontakty (SOS)</h2>
        </div>
        <div className="contact-grid">
          {data.emergency.slice(0, 6).map((item) => (
            <ContactCard key={item.title} title={item.title ?? "Kontakt"} value={item.value} note={item.note} severity={item.value?.includes("112") ? "emergency" : "normal"} />
          ))}
        </div>
      </section>
      <section className="section-block section-anchor" id="zdravotnictvi">
        <div className="section-heading">
          <h2>Zdravotnictví</h2>
        </div>
        <div className="contact-grid">
          {data.medical.slice(0, 4).map((item) => (
            <ContactCard key={item.title} title={item.title ?? "Zdravotnické zařízení"} value={item.phone} note={[item.address, item.note].filter(Boolean).join(" · ")} />
          ))}
        </div>
      </section>
      <section className="section-block section-anchor" id="co-delat">
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
