import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 🔵 Custom user icon
const userIcon = new L.Icon({
  iconUrl: '/bluepin.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// 📍 Convert tag-based emoji (you can expand this)
const getEmojiForTags = (tags = {}, fallback = '📍') => {
  const lowerTags = Object.values(tags).join(" ").toLowerCase();
  if (lowerTags.includes("hospital")) return "🏥";
  if (lowerTags.includes("coffee") || lowerTags.includes("cafe")) return "☕";
  if (lowerTags.includes("library")) return "📚";
  if (lowerTags.includes("restaurant")) return "🍽️";
  if (lowerTags.includes("school")) return "🏫";
  if (lowerTags.includes("gym")) return "🏋️";
  if (lowerTags.includes("bank")) return "🏦";
  if (lowerTags.includes("hotel")) return "🏨";
  if (lowerTags.includes("pharmacy")) return "💊";
  return fallback;
};

const getEmojiIcon = (emoji) =>
  new L.DivIcon({
    className: '',
    html: `<div style="font-size: 24px;">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
};

const MapComponent = ({ locations, query, onMapClick }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (locations?.location?.lat && locations?.location?.lon) {
      setPosition([locations.location.lat, locations.location.lon]);
    }
  }, [locations]);

  return (
    <div className="map">
      {position && (
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          onClick={onMapClick}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          <RecenterMap lat={position[0]} lng={position[1]} />

          {/* 🔵 User marker */}
          <Marker position={position} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>

          {/* 📍 Nearby result markers */}
          {locations?.places?.map((place, index) => (
            <Marker
              key={index}
              position={[place.lat, place.lon]}
              icon={getEmojiIcon(getEmojiForTags(place.tags, '📍'))}
            >
              <Popup>
                {place.tags.name || 'Unnamed'}<br />
                {place.distance} km away
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default MapComponent;