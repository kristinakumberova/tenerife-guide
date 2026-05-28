import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Poi } from "../types";
import { POICard } from "./POICard";

interface PoiMapProps {
  pois: Poi[];
}

const markerIcon = L.divIcon({
  className: "poi-marker",
  html: "<span></span>",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function PoiMap({ pois }: PoiMapProps) {
  return (
    <div className="map-frame">
      <MapContainer center={[28.2916, -16.6291]} zoom={9} scrollWheelZoom={false} className="leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pois.map((poi) => (
          <Marker key={poi.id} position={poi.gps} icon={markerIcon}>
            <Popup minWidth={240}>
              <POICard poi={poi} variant="popup" />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
