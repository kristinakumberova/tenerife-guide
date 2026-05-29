import { Car, Home, Map, Phone, Utensils } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { ContactCTA } from "./ContactCTA";

const tabs = [
  { to: "/paradise/apartman", label: "Apartmán", mobile: "Apartmán", icon: Home },
  { to: "/paradise/guide", label: "Tenerife Guide", mobile: "Guide", icon: Map },
  { to: "/paradise/doprava", label: "Doprava", mobile: "Doprava", icon: Car },
  { to: "/paradise/stravovani", label: "Stravování", mobile: "Jídlo", icon: Utensils },
  { to: "/paradise/kontakty", label: "Kontakty", mobile: "SOS", icon: Phone },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Přeskočit na obsah
      </a>
      <header className="top-bar">
        <NavLink className="brand" to="/paradise/apartman">
          <span className="brand-mark">JL</span>
          <span>
            <strong>Jazuma Living</strong>
            <small>Jazuma Paradise</small>
          </span>
        </NavLink>
        <nav className="desktop-nav" aria-label="Hlavní navigace">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to}>
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <ContactCTA variant="compact" />
      </header>
      <main id="main" className="page-shell">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Mobilní navigace">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink key={tab.to} to={tab.to}>
              <Icon size={20} aria-hidden="true" />
              <span>{tab.mobile}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
