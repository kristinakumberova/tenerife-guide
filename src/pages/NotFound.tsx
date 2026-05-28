import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <section className="empty-state">
      <h1>Tahle stranka tu neni.</h1>
      <Link className="btn btn-primary" to="/paradise/apartman">
        Zpet na Jazuma Paradise
      </Link>
    </section>
  );
}
