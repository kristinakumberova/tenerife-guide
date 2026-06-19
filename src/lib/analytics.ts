// Google Analytics 4 + Consent Mode v2 (SPEC-Lite §7, DoD §4).
// Consent default = denied nastavuje inline skript v BaseLayout.astro (běží v
// <head> dřív než tento island). gtag.js se NEnačítá, dokud uživatel nedá
// souhlas → 0 GA requestů před consentem. Měření zapíná loadGa().
//
// Measurement ID se NEcommituje (repo pravidlo: žádná analytics v gitu). Bere se
// z env PUBLIC_GA_ID (viz .env.example); bez něj loadGa() no-opuje a GA se nikdy
// nenačte.
const GA_MEASUREMENT_ID = import.meta.env.PUBLIC_GA_ID;

const STORAGE_KEY = "jazuma-cookie-consent";

type ConsentChoice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function getStoredConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

// Fallback, kdyby inline gtag z BaseLayout chyběl. Consent default ŘEŠÍ
// BaseLayout — tady ho znovu nenastavujeme (jediný zapisovatel defaultu).
function ensureGtag(): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
}

let gaLoaded = false;
function loadGa(): void {
  if (gaLoaded || !GA_MEASUREMENT_ID) return;
  gaLoaded = true;
  const src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }
  window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
}

// Obnoví dříve udělený souhlas: pokud byl granted, zapne měření a načte GA.
export function initConsent(): void {
  ensureGtag();
  if (getStoredConsent() === "granted") {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    loadGa();
  }
}

export function grantConsent(): void {
  ensureGtag();
  try {
    localStorage.setItem(STORAGE_KEY, "granted");
  } catch {
    /* localStorage nedostupné — souhlas platí jen pro tuto relaci */
  }
  window.gtag("consent", "update", { analytics_storage: "granted" });
  loadGa();
}

export function denyConsent(): void {
  ensureGtag();
  try {
    localStorage.setItem(STORAGE_KEY, "denied");
  } catch {
    /* localStorage nedostupné */
  }
  window.gtag("consent", "update", { analytics_storage: "denied" });
}
