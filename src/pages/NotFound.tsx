import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <section className="empty-state">
      <h1>Tahle stránka tu není.</h1>
      <Link className="btn btn-primary" to="/paradise/apartman">
        Zpět na Jazuma Paradise
      </Link>
    </section>
  );
}
