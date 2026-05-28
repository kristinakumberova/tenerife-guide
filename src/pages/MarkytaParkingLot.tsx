import { Link } from "react-router-dom";

export function MarkytaParkingLot() {
  return (
    <section className="empty-state">
      <p className="eyebrow">Jazuma Living</p>
      <h1>Markyta se pripravuje.</h1>
      <p>Tahle property je zatim parking lot, v hlavni navigaci ji nezobrazujeme.</p>
      <Link className="btn btn-primary" to="/paradise/apartman">
        Otevrit Jazuma Paradise
      </Link>
    </section>
  );
}
