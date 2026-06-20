import { Car, Home, Map, Phone, Utensils } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { ContactCTA } from "./ContactCTA";
import { CookieConsent, COOKIE_SETTINGS_EVENT } from "./CookieConsent";

const tabs = [
  { to: "/paradise/apartman", label: "Apartmán", mobile: "Apartmán", icon: Home },
  { to: "/paradise/guide", label: "Tenerife Guide", mobile: "Guide", icon: Map },
  { to: "/paradise/doprava", label: "Doprava", mobile: "Doprava", icon: Car },
  { to: "/paradise/stravovani", label: "Stravování", mobile: "Jídlo", icon: Utensils },
  { to: "/paradise/kontakty", label: "Kontakty", mobile: "Kontakty", icon: Phone },
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
      <footer className="site-footer">
        <div className="footer-inner">
          <p className="footer-registration">
            Registrace krátkodobého pronájmu: <strong>VV-38-4-0089376</strong>
            <span className="footer-registration-note">
              Vivienda vacacional registrovaná v Registro General Turístico de Canarias
            </span>
          </p>
          <nav className="footer-legal-links" aria-label="Právní odkazy">
            <NavLink to="/paradise/zasady-soukromi">Zásady ochrany osobních údajů</NavLink>
            <NavLink to="/paradise/cookies">Cookies</NavLink>
            <NavLink to="/paradise/pravni-informace">Právní informace</NavLink>
            <button
              type="button"
              className="footer-cookie-btn"
              onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
            >
              Nastavení cookies
            </button>
          </nav>
        </div>
      </footer>
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
      <CookieConsent />
    </div>
  );
}
