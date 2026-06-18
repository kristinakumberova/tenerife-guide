import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Home } from "./pages/Home";
import { MarkytaParkingLot } from "./pages/MarkytaParkingLot";
import { NotFound } from "./pages/NotFound";
import { ApartmanPage } from "./pages/paradise/ApartmanPage";
import { DopravaPage } from "./pages/paradise/DopravaPage";
import { GuidePage } from "./pages/paradise/GuidePage";
import { KontaktyPage } from "./pages/paradise/KontaktyPage";
import { PravniInformacePage } from "./pages/paradise/PravniInformacePage";
import { StravovaniPage } from "./pages/paradise/StravovaniPage";
import { ZasadyCookiesPage } from "./pages/paradise/ZasadyCookiesPage";
import { ZasadySoukromiPage } from "./pages/paradise/ZasadySoukromiPage";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export const router = createBrowserRouter(
  [
    { path: "/", element: <Home /> },
    {
      path: "/paradise",
      element: <AppShell />,
      children: [
        { index: true, element: <Navigate to="/paradise/apartman" replace /> },
        { path: "apartman", element: <ApartmanPage /> },
        { path: "guide", element: <GuidePage /> },
        { path: "doprava", element: <DopravaPage /> },
        { path: "stravovani", element: <StravovaniPage /> },
        { path: "kontakty", element: <KontaktyPage /> },
        { path: "zasady-soukromi", element: <ZasadySoukromiPage /> },
        { path: "cookies", element: <ZasadyCookiesPage /> },
        { path: "pravni-informace", element: <PravniInformacePage /> },
      ],
    },
    { path: "/markyta/*", element: <MarkytaParkingLot /> },
    { path: "*", element: <NotFound /> },
  ],
  { basename },
);
