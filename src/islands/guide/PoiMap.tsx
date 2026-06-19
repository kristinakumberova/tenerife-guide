import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { GuidePoi } from "../../types";
import { MapPopupCard } from "./MapPopupCard";

// Leaflet mapa. Načítá se přes lazy import() v POIMapList → Leaflet není v hlavním
// island bundlu a neběží při SSR buildu. Port z legacy/src/components/PoiMap.tsx
// beze změny logiky. CR-007: marker apartmánu je inline SVG string (lucide "home"),
// takže odpadá react-dom/server (renderToStaticMarkup) z lazy chunku.

interface ApartmentMarker {
  name: string;
  address: string;
  mapsUrl: string;
  gps: [number, number];
}

interface PoiMapProps {
  pois: GuidePoi[];
  apartment: ApartmentMarker;
  onOpenPoi: (poiId: string) => void;
}

const markerIcon = L.divIcon({
  className: "poi-marker",
  html: "<span></span>",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Inline SVG (lucide "home", strokeWidth 2.5) — bez react-dom/server. Rozměr
// vykresluje .apartment-marker svg v global.css; zde stačí cesty.
const apartmentIcon = L.divIcon({
  className: "apartment-marker",
  html:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' +
    '<polyline points="9 22 9 12 15 12 15 22"/></svg>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export function PoiMap({ pois, apartment, onOpenPoi }: PoiMapProps) {
  return (
    <div className="map-frame" id="poi-map">
      <MapContainer center={[28.2916, -16.6291]} zoom={9} scrollWheelZoom={false} className="leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={apartment.gps} icon={apartmentIcon}>
          <Popup minWidth={240}>
            <div className="map-apartment-popup">
              <p className="eyebrow">Apartmán</p>
              <h3>{apartment.name}</h3>
              <p>{apartment.address}</p>
              <a className="text-button" href={apartment.mapsUrl} target="_blank" rel="noreferrer">
                <MapPin size={16} aria-hidden="true" />
                Otevřít v mapách
              </a>
            </div>
          </Popup>
        </Marker>
        {pois.map((poi) => (
          <Marker key={poi.id} position={poi.gps} icon={markerIcon}>
            <Popup minWidth={320} maxWidth={340} keepInView autoPanPadding={[28, 28]}>
              <MapPopupCard poi={poi} onOpen={onOpenPoi} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
