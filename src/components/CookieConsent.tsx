import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { denyConsent, getStoredConsent, grantConsent, initConsent } from "../lib/analytics";

export const COOKIE_SETTINGS_EVENT = "open-cookie-settings";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    initConsent();
    if (getStoredConsent() === null) {
      setVisible(true);
    }
    const open = () => setVisible(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="cookie-consent" role="dialog" aria-label="Souhlas s cookies">
      <div className="cookie-consent-inner">
        <p>
          <strong>Tento web používá cookies.</strong> S vaším souhlasem bychom rádi používali analytické cookies
          (Google Analytics) k anonymnímu měření návštěvnosti. Pokud odmítnete, neměříme nic. Více v{" "}
          <Link to="/paradise/cookies">zásadách cookies</Link>.
        </p>
        <div className="cookie-consent-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              denyConsent();
              setVisible(false);
            }}
          >
            Odmítnout
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              grantConsent();
              setVisible(false);
            }}
          >
            Přijmout
          </button>
        </div>
      </div>
    </div>
  );
}
