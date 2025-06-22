import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";
import L from "leaflet";

// Emoji icon for query
const getEmojiForQuery = (query) => {
  const q = query.toLowerCase();
  if (q.includes("restaurant")) return "🍽️";
  if (q.includes("school")) return "🏫";
  if (q.includes("hospital")) return "🏥";
  if (q.includes("gym")) return "🏋️";
  if (q.includes("pharmacy")) return "💊";
  if (q.includes("hotel")) return "🏨";
  return "📍";
};

export default function MapComponent({ locations: { location, places }, query, onMapClick }) {
  if (!location) return <div className="map-loading">Loading map...</div>;

  return (
    <MapContainer
      center={[location.lat, location.lon]}
      zoom={13}
      className="map"
      whenReady={(map) => {
        map.target.on("click", () => {
          if (onMapClick) onMapClick();
        });
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* User Location */}
      <Marker position={[location.lat, location.lon]}>
        <Popup>Your Location</Popup>
      </Marker>

      {/* Nearby Places */}
      {places.map((p, idx) => {
        const emojiIcon = L.divIcon({
          className: "custom-emoji-icon",
          html: `<div class="emoji-pin">${getEmojiForQuery(query)}</div>`,
        });

        return (
          <Marker key={idx} position={[p.lat, p.lon]} icon={emojiIcon}>
            <Popup>
              <strong>{p.tags?.name || "Unnamed"}</strong>
              <br />
              {p.distance} km away
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}