import { useEffect } from "react";
import routeMeta from "../routeMeta.json";

// Klic do sdileneho routeMeta.json (stejny zdroj cte build skript pro staticke
// HTML). Diky tomu se runtime titulek a HTML titulek nerozejdou — Googlebot
// renderuje JS a jinak by indexoval kratsi runtime variantu misto SEO titulku.
type RouteKey = keyof typeof routeMeta;

export function useDocumentTitle(routeKey: RouteKey) {
  useEffect(() => {
    document.title = routeMeta[routeKey].title;
  }, [routeKey]);
}
