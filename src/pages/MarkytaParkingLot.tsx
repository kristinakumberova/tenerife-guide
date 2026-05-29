import { Link } from "react-router-dom";

export function MarkytaParkingLot() {
  return (
    <section className="empty-state">
      <p className="eyebrow">Jazuma Living</p>
      <h1>Markyta se připravuje.</h1>
      <p>Tahle property je zatím rozpracovaná, v hlavní navigaci ji nezobrazujeme.</p>
      <Link className="btn btn-primary" to="/paradise/apartman">
        Otevřít Jazuma Paradise
      </Link>
    </section>
  );
}
