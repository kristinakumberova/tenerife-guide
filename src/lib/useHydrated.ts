import { useSyncExternalStore } from "react";

// Vrací false na serveru i při prvním klientském renderu, true po hydrataci.
// Použití: gate pro klientsky-závislý obsah (datum, Leaflet), aby se SSR HTML
// shodovalo s prvním klientským renderem a nedošlo k hydration mismatch ani
// k evaluaci browser-only kódu při SSR buildu.
const subscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
