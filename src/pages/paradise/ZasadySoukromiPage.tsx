import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

export function ZasadySoukromiPage() {
  useDocumentTitle("Zásady ochrany osobních údajů");

  return (
    <>
      <section className="page-intro section-anchor" id="zasady-soukromi">
        <h1>Zásady ochrany osobních údajů</h1>
      </section>
      <section className="section-block">
        <article className="content-panel legal-text">
          <p>
            Správci údajů: Kristina Kumberová a Jaroslav Kumbera, Calle Irlanda 5, 38660 Adeje, Tenerife. Kontakt:{" "}
            <a href="mailto:info@jazumaliving.com">info@jazumaliving.com</a>, WhatsApp{" "}
            <a href="https://wa.me/420702188376">+420 702 188 376</a>.
          </p>
          <p>
            Tento web slouží k prezentaci apartmánu a okolí. Nesbíráme údaje přes formuláře a neprodáváme je třetím
            stranám.
          </p>
          <h2>Jaké údaje zpracováváme</h2>
          <p>
            (1) technické logy hostingu (IP adresa, typ prohlížeče) nezbytné pro provoz a bezpečnost; (2) údaje, které
            nám sami pošlete při kontaktu přes WhatsApp nebo e-mail — použijeme je pouze k vyřízení vaší poptávky.
          </p>
          <h2>Příjemci údajů</h2>
          <p>
            Na zajištění pobytu (check-in, komunikace s hosty) spolupracujeme se správcovskou společností zajišťující
            správu pronájmu, která vystupuje jako zpracovatel na základě smlouvy o zpracování osobních údajů. Nad tento
            rámec údaje nepředáváme.
          </p>
          <h2>Třetí strany</h2>
          <p>
            Mapové podklady poskytují OpenStreetMap / Leaflet; web používá Google Fonts (fonts.gstatic.com). Jejich
            načtení může znamenat přenos vaší IP adresy danému poskytovateli.
          </p>
          <h2>Cookies</h2>
          <p>
            Web používá analytické cookies (Google Analytics) pouze s vaším souhlasem. Bez souhlasu měření neprobíhá.
            Souhlas můžete kdykoli odvolat. Podrobnosti v <Link to="/paradise/cookies">zásadách cookies</Link>.
          </p>
          <h2>Vaše práva</h2>
          <p>
            Máte právo na přístup, opravu, výmaz, omezení a námitku. Uplatníte je na kontaktu výše. Máte také právo
            podat stížnost u dozorového úřadu.
          </p>
        </article>
      </section>
    </>
  );
}
