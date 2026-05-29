import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <section className="empty-state">
      <p className="eyebrow">404</p>
      <h1>Tahle stránka tu není.</h1>
      <p>Možná se odkaz změnil. Vrať se na úvod a pokračuj odtud.</p>
      <Link className="btn btn-primary" to="/paradise/apartman">
        Zpět na Jazuma Paradise
      </Link>
    </section>
  );
}
