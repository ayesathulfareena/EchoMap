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

// 📍 Tag-to-emoji conversion
const getEmojiForTags = (tags = {}, fallback = '📍') => {
  const lowerTags = Object.values(tags).join(" ").toLowerCase();
  if (lowerTags.includes("hospital")) return "🏥";
  if (lowerTags.includes("clinic")) return "🩺";
  if (lowerTags.includes("pharmacy") || lowerTags.includes("medical")) return "💊";
  if (lowerTags.includes("blood")) return "🩸";
  if (lowerTags.includes("diagnostic")) return "🔬";
  if (lowerTags.includes("covid")) return "🦠";
  if (lowerTags.includes("eye")) return "👁";
  if (lowerTags.includes("dentist")) return "🦷";
  if (lowerTags.includes("school")) return "🏫";
  if (lowerTags.includes("college") || lowerTags.includes("university")) return "🎓";
  if (lowerTags.includes("library")) return "📚";
  if (lowerTags.includes("coaching") || lowerTags.includes("tuition")) return "📖";
  if (lowerTags.includes("bank")) return "🏦";
  if (lowerTags.includes("atm")) return "🏧";
  if (lowerTags.includes("supermarket") || lowerTags.includes("grocery")) return "🛒";
  if (lowerTags.includes("shopping")) return "🛍";
  if (lowerTags.includes("vegetable") || lowerTags.includes("market")) return "🥦";
  if (lowerTags.includes("electronics")) return "📱";
  if (lowerTags.includes("clothing") || lowerTags.includes("dress")) return "👗";
  if (lowerTags.includes("furniture")) return "🛋";
  if (lowerTags.includes("hardware")) return "🧰";
  if (lowerTags.includes("bakery")) return "🍞";
  if (lowerTags.includes("restaurant")) return "🍽";
  if (lowerTags.includes("cafe")) return "☕";
  if (lowerTags.includes("fast food")) return "🍔";
  if (lowerTags.includes("tea")) return "🍵";
  if (lowerTags.includes("ice cream")) return "🍨";
  if (lowerTags.includes("juice")) return "🧃";
  if (lowerTags.includes("bar") || lowerTags.includes("pub")) return "🍻";
  if (lowerTags.includes("dhaba")) return "🛖";
  if (lowerTags.includes("petrol") || lowerTags.includes("gas station")) return "⛽";
  if (lowerTags.includes("bus")) return "🚌";
  if (lowerTags.includes("railway") || lowerTags.includes("train")) return "🚆";
  if (lowerTags.includes("metro")) return "🚇";
  if (lowerTags.includes("airport") || lowerTags.includes("flight")) return "✈";
  if (lowerTags.includes("taxi") || lowerTags.includes("auto")) return "🚖";
  if (lowerTags.includes("car wash")) return "🧽";
  if (lowerTags.includes("ev")) return "🔌";
  if (lowerTags.includes("hotel") || lowerTags.includes("resort")) return "🏨";
  if (lowerTags.includes("hostel") || lowerTags.includes("pg") || lowerTags.includes("guest")) return "🏠";
  if (lowerTags.includes("movie") || lowerTags.includes("cinema")) return "🎬";
  if (lowerTags.includes("park")) return "🌳";
  if (lowerTags.includes("zoo")) return "🦁";
  if (lowerTags.includes("museum")) return "🏛";
  if (lowerTags.includes("stadium")) return "🏟";
  if (lowerTags.includes("sports")) return "🏅";
  if (lowerTags.includes("aquarium")) return "🐠";
  if (lowerTags.includes("amusement")) return "🎡";
  if (lowerTags.includes("temple")) return "🛕";
  if (lowerTags.includes("church")) return "⛪";
  if (lowerTags.includes("mosque")) return "🕌";
  if (lowerTags.includes("gurudwara")) return "🕍";
  if (lowerTags.includes("ashram") || lowerTags.includes("prayer")) return "🙏";
  if (lowerTags.includes("police")) return "👮";
  if (lowerTags.includes("fire")) return "🚒";
  if (lowerTags.includes("rto")) return "🚗";
  if (lowerTags.includes("post")) return "📮";
  if (lowerTags.includes("municipality")) return "🏛";
  if (lowerTags.includes("passport")) return "🛂";
  if (lowerTags.includes("court")) return "⚖";
  if (lowerTags.includes("toilet")) return "🚻";
  if (lowerTags.includes("dustbin") || lowerTags.includes("garbage")) return "🗑";
  if (lowerTags.includes("water tank")) return "🚰";
  if (lowerTags.includes("doctor")) return "👨‍⚕";
  if (lowerTags.includes("lawyer") || lowerTags.includes("advocate")) return "👨‍⚖";
  if (lowerTags.includes("plumber")) return "🔧";
  if (lowerTags.includes("electrician")) return "💡";
  if (lowerTags.includes("mechanic")) return "🔩";
  if (lowerTags.includes("tailor")) return "🧵";
  if (lowerTags.includes("barber") || lowerTags.includes("salon")) return "💇";
  if (lowerTags.includes("laundry")) return "🧺";
  if (lowerTags.includes("parlour") || lowerTags.includes("beauty")) return "💅";
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

// ✅ FIXED: Place this inside the file properly
const handleAddToFavorites = async (place) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8080/api/favourites/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        placeId: place.place_id || place.id || "unknown",
        name: place.tags?.name || "Unnamed",
        address: `${place.lat}, ${place.lon}`, // ✅ Corrected
      }),
    });

    const data = await res.json();
    alert("✅ Added to favorites!");
  } catch (err) {
    console.error("Error adding to favorites:", err);
    alert("❌ Failed to add to favorites");
  }
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

          <Marker position={position} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>

          {locations?.places?.map((place, index) => (
            <Marker
              key={index}
              position={[place.lat, place.lon]}
              icon={getEmojiIcon(getEmojiForTags(place.tags, '📍'))}
            >
              <Popup>
                <div>
                  <strong>{place.tags.name || 'Unnamed'}</strong><br />
                  {place.distance} km away<br />
                  <button
                    onClick={() => handleAddToFavorites(place)}
                    style={{ marginTop: "8px", padding: "4px 8px", cursor: "pointer" }}
                  >
                    ⭐ Add to Favorites
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default MapComponent;