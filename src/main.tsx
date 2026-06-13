import "leaflet/dist/leaflet.css";
// Self-hostovane fonty (drive nactane z Google Fonts CDN). Lokalni soubory =
// zadny prenos IP navstevnika na Google pred souhlasem (GDPR, kauza Google Fonts)
// a rychlejsi nacteni. Vahy odpovidaji puvodnimu Google Fonts odkazu.
import "@fontsource/lora/400.css";
import "@fontsource/lora/500.css";
import "@fontsource/lora/600.css";
import "@fontsource/lora/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./styles/tokens.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
