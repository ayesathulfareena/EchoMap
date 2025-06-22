import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";
import L from "leaflet";

// Import default marker images
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for missing marker icons in many React setups
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper to get emoji based on search
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
          if (onMapClick) onMapClick(); // close sidebar on map click
        });
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* ✅ User Location with default Leaflet blue pin */}
      <Marker position={[location.lat, location.lon]}>
        <Popup>Your Location</Popup>
      </Marker>

      {/* Nearby Places with Emoji Pins */}
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