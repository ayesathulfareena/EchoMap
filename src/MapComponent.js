import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapComponent({ location, places }) {
  if (!location) return <div className="map-loading">Loading map...</div>;

  return (
    <MapContainer
      center={[location.lat, location.lon]}
      zoom={13}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[location.lat, location.lon]} icon={markerIcon}>
        <Popup>You are here</Popup>
      </Marker>
      {places.map((place, i) => (
        <Marker
          key={i}
          position={[place.lat, place.lon]}
          icon={markerIcon}
        >
          <Popup>{place.tags.name || "Unnamed"}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

