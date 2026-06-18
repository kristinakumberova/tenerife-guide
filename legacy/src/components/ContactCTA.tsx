import { MessageCircle, Phone } from "lucide-react";

interface ContactCTAProps {
  label?: string;
  whatsappUrl?: string;
  phone?: string;
  variant?: "primary" | "compact" | "emergency";
}

export function ContactCTA({
  label = "Napiš zprávu",
  whatsappUrl = "https://wa.me/420702188376",
  phone = "+420 702 188 376",
  variant = "primary",
}: ContactCTAProps) {
  const className = variant === "compact" ? "btn btn-ghost" : variant === "emergency" ? "btn btn-danger" : "btn btn-primary";

  return (
    <div className="contact-cta">
      <a className={className} href={whatsappUrl} target="_blank" rel="noreferrer">
        <MessageCircle size={18} aria-hidden="true" />
        <span>{label}</span>
      </a>
      {variant !== "compact" && (
        <a className="phone-link" href={`tel:${phone.replace(/\s/g, "")}`}>
          <Phone size={16} aria-hidden="true" />
          <span>{phone}</span>
        </a>
      )}
    </div>
  );
}
