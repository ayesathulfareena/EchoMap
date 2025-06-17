import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapComponent({ locations: { location, places } }) {
  if (!location) return <div>Loading map...</div>;

  return (
    <MapContainer center={[location.lat, location.lon]} zoom={12} className="map">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[location.lat, location.lon]} icon={markerIcon}>
        <Popup>Your Location</Popup>
      </Marker>
      {places.map((p, idx) => (
        <Marker key={idx} position={[p.lat, p.lon]} icon={markerIcon}>
          <Popup>{p.tags.name || "Unnamed"}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}