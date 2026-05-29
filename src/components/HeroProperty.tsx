import type { Apartment } from "../types";
import { ContactCTA } from "./ContactCTA";
import { QuickInfoCard } from "./QuickInfoCard";

interface HeroPropertyProps {
  apartment: Apartment;
}

export function HeroProperty({ apartment }: HeroPropertyProps) {
  return (
    <section className="hero-property">
      <div className="hero-media">
        <img src={apartment.heroImage} alt={apartment.heroAlt} fetchPriority="high" />
      </div>
      <div className="hero-copy">
        <p className="eyebrow">{apartment.brand}</p>
        <h1>{apartment.name}</h1>
        <p className="lead">{apartment.area}. Praktický průvodce pro příjezd, výlety, jídlo a rychlé kontakty.</p>
        <ContactCTA label={apartment.contact.label} whatsappUrl={apartment.contact.whatsappUrl} phone={apartment.contact.phone} />
      </div>
      <div className="quick-grid">
        {apartment.quickInfo.map((item) => (
          <QuickInfoCard key={item.title} title={item.title} summary={item.summary} status={item.status} />
        ))}
      </div>
    </section>
  );
}
