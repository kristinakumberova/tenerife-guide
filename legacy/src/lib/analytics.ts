// Google Analytics 4 s Google Consent Mode v2.
// Tag je v HTML kvůli detekci Googlem; měření se zapne až po souhlasu uživatele.
// Měření zapneš doplněním Measurement ID (formát G-XXXXXXXXXX) níže:
const GA_MEASUREMENT_ID = "G-W0SDXB9VTX";

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

function ensureGtagBase(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  // Consent Mode v2 — vše zamítnuto, dokud uživatel nesouhlasí.
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

let gaLoaded = false;
function loadGa(): void {
  if (gaLoaded || !GA_MEASUREMENT_ID) {
    return;
  }
  gaLoaded = true;
  const src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
    window.gtag("js", new Date());
  }
  window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
}

// Zavolat při startu — obnoví dříve udělený souhlas.
export function initConsent(): void {
  ensureGtagBase();
  if (getStoredConsent() === "granted") {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    loadGa();
  }
}

export function grantConsent(): void {
  ensureGtagBase();
  try {
    localStorage.setItem(STORAGE_KEY, "granted");
  } catch {
    /* localStorage nedostupné — souhlas platí jen pro tuto relaci */
  }
  window.gtag("consent", "update", { analytics_storage: "granted" });
  loadGa();
}

export function denyConsent(): void {
  ensureGtagBase();
  try {
    localStorage.setItem(STORAGE_KEY, "denied");
  } catch {
    /* localStorage nedostupné */
  }
  window.gtag("consent", "update", { analytics_storage: "denied" });
}
