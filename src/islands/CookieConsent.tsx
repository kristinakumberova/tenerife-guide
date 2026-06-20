import { useEffect, useRef, useState } from "react";
import { denyConsent, getStoredConsent, grantConsent, initConsent } from "../lib/analytics";
import { useHydrated } from "../lib/useHydrated";

// Island (SPEC-Lite §3 / §7, chunk 8), client:load. Port legacy CookieConsent.
// Proti legacy: react-router Link → <a> s koncovým lomítkem (trailingSlash:
// "always"); posluchač se váže na statická tlačítka [data-cookie-settings]
// (SiteFooter + /paradise/cookies) místo React eventu z AppShell.
//
// useHydrated gate: na serveru a při prvním klientském renderu vrací null →
// HTML se shoduje a localStorage (klient-only) se čte až po hydrataci, takže
// nehrozí hydration mismatch ani SSR čtení storage. setState se nevolá v těle
// efektu (eslint react-hooks/set-state-in-effect), jen v event handlerech.

export function CookieConsent() {
  const hydrated = useHydrated();
  // klik (přijmout/odmítnout) v této relaci → lišta se schová
  const [decided, setDecided] = useState(false);
  // znovuotevřeno přes "Nastavení cookies" v patičce / na /cookies
  const [reopened, setReopened] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Obnoví dříve udělený souhlas (granted → načte GA). Bez souhlasu nic.
    initConsent();
    const open = () => setReopened(true);
    const buttons = Array.from(document.querySelectorAll<HTMLElement>("[data-cookie-settings]"));
    buttons.forEach((button) => button.addEventListener("click", open));
    return () => buttons.forEach((button) => button.removeEventListener("click", open));
  }, []);

  // Fokus do lišty jen při znovuotevření z patičky (klávesnicová obsluha);
  // při automatickém zobrazení po načtení fokus nekrademe.
  useEffect(() => {
    if (reopened) dialogRef.current?.focus();
  }, [reopened]);

  if (!hydrated) return null;

  const visible = reopened || (getStoredConsent() === null && !decided);
  if (!visible) return null;

  const choose = (granted: boolean) => {
    if (granted) grantConsent();
    else denyConsent();
    setDecided(true);
    setReopened(false);
  };

  return (
    <div
      ref={dialogRef}
      className="cookie-consent"
      role="dialog"
      aria-label="Souhlas s cookies"
      tabIndex={-1}
    >
      <div className="cookie-consent-inner">
        <p>
          <strong>Tento web používá cookies.</strong> S vaším souhlasem bychom rádi používali analytické cookies
          (Google Analytics) k anonymnímu měření návštěvnosti. Pokud odmítnete, neměříme nic. Více v{" "}
          <a href="/paradise/cookies/">zásadách cookies</a>.
        </p>
        <div className="cookie-consent-actions">
          <button type="button" className="btn btn-ghost" onClick={() => choose(false)}>
            Odmítnout
          </button>
          <button type="button" className="btn btn-primary" onClick={() => choose(true)}>
            Přijmout
          </button>
        </div>
      </div>
    </div>
  );
}
