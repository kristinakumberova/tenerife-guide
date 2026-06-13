import { COOKIE_SETTINGS_EVENT } from "../../components/CookieConsent";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

export function ZasadyCookiesPage() {
  useDocumentTitle("paradise/cookies");

  return (
    <>
      <section className="page-intro section-anchor" id="cookies">
        <h1>Zásady používání cookies</h1>
      </section>
      <section className="section-block">
        <article className="content-panel legal-text">
          <p>
            Cookies jsou malé soubory, které web ukládá do vašeho prohlížeče. Tento web používá pouze cookies nezbytné
            pro fungování a — s vaším souhlasem — analytické cookies pro měření návštěvnosti.
          </p>
          <h2>Analytické cookies (Google Analytics)</h2>
          <p>
            Používáme Google Analytics 4 k anonymnímu měření návštěvnosti. Tyto cookies se načtou jen tehdy, když k tomu
            dáte souhlas v cookie liště. Bez souhlasu se neměří. Samotný skript Google Analytics je na webu přítomen už
            před souhlasem (kvůli ověření ze strany Googlu), ale měření i cookies se aktivují teprve po vašem souhlasu.
          </p>
          <ul>
            <li>
              <strong>_ga, _ga_*</strong> — rozlišení návštěvníků a relací; poskytovatel Google; doba platnosti až 2 roky.
            </li>
          </ul>
          <p>Data zpracovává společnost Google jako třetí strana. IP adresa je zpracovávána anonymizovaně.</p>
          <h2>Odvolání souhlasu</h2>
          <p>Souhlas můžete kdykoli změnit:</p>
          <p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
            >
              Nastavení cookies
            </button>
          </p>
          <p>Cookies můžete také smazat nebo blokovat přímo v nastavení svého prohlížeče.</p>
        </article>
      </section>
    </>
  );
}
