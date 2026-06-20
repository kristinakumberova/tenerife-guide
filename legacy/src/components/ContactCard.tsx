import { PhoneCall } from "lucide-react";

interface ContactCardProps {
  title: string;
  value?: string;
  note?: string;
  severity?: "normal" | "emergency";
}

export function ContactCard({ title, value, note, severity = "normal" }: ContactCardProps) {
  const phone = value?.match(/\+?\d[\d\s]+/)?.[0];
  return (
    <article className={`contact-card ${severity === "emergency" ? "contact-card-emergency" : ""}`}>
      <PhoneCall size={20} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        {value && <p className="contact-value">{value}</p>}
        {note && <p>{note}</p>}
        {phone && (
          <a className="text-button" href={`tel:${phone.replace(/\s/g, "")}`}>
            Volat
          </a>
        )}
      </div>
    </article>
  );
}
