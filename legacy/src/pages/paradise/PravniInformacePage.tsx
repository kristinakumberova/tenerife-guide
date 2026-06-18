import { useDocumentTitle } from "../../lib/useDocumentTitle";

export function PravniInformacePage() {
  useDocumentTitle("paradise/pravni-informace");

  return (
    <>
      <section className="page-intro section-anchor" id="pravni-informace">
        <h1>Právní informace</h1>
      </section>
      <section className="section-block">
        <article className="content-panel legal-text">
          <p>Provozovatelé: Kristina Kumberová (NIE Y9629668-L) a Jaroslav Kumbera (NIE Y9629517-Y).</p>
          <p>Adresa: Calle Irlanda 5, 38660 Adeje, Santa Cruz de Tenerife, Španělsko.</p>
          <p>
            Kontakt: <a href="mailto:info@jazumaliving.com">info@jazumaliving.com</a>, WhatsApp{" "}
            <a href="https://wa.me/420702188376">+420 702 188 376</a>.
          </p>
          <p>Předmět: prezentace a propagace krátkodobého pronájmu apartmánu Jazuma Paradise, Adeje, Tenerife.</p>
          <p>
            Registrace turistického pronájmu: <strong>VV-38-4-0089376</strong>, Registro General Turístico de Canarias.
          </p>
        </article>
      </section>
    </>
  );
}
