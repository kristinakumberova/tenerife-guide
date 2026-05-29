import L from "leaflet";
import { Home, MapPin } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Permit, Poi } from "../types";
import { POICard } from "./POICard";

interface ApartmentMarker {
  name: string;
  address: string;
  mapsUrl: string;
  gps: [number, number];
}

interface PoiMapProps {
  pois: Poi[];
  permits: Permit[];
  apartment: ApartmentMarker;
  onOpenPoi: (poiId: string) => void;
}

const markerIcon = L.divIcon({
  className: "poi-marker",
  html: "<span></span>",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const apartmentIcon = L.divIcon({
  className: "apartment-marker",
  html: renderToStaticMarkup(<Home size={18} strokeWidth={2.5} aria-hidden="true" />),
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export function PoiMap({ pois, permits, apartment, onOpenPoi }: PoiMapProps) {
  return (
    <div className="map-frame">
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
            <Popup minWidth={260}>
              <POICard poi={poi} permits={permits} variant="popup" onOpen={onOpenPoi} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
