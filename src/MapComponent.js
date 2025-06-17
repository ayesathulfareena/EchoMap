import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Reverse geocoding function that returns a short address
const reverseGeocode = async (lat, lon) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat,
        lon,
        format: "json",
      },
    });

    const address = res.data.address;
const road = address.road || "";
const village = address.village || address.town || address.city || "";
const district = address.county || "";
const state = address.state || "";

return [road, village, district, state].filter(Boolean).join(", ");
    
  } catch (e) {
    return "Address not available";
  }
};

// Distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapComponent = ({ location, places, onMarkerClick }) => {
  const [userAddress, setUserAddress] = useState("");
  const [tooltips, setTooltips] = useState([]);

  // Fetch user's location address
  useEffect(() => {
    const getAddress = async () => {
      if (location?.lat && location?.lon) {
        const address = await reverseGeocode(location.lat, location.lon);
        setUserAddress(address);
      }
    };
    getAddress();
  }, [location]);

  // Fetch tooltip addresses for each place
  useEffect(() => {
    const fetchTooltips = async () => {
      const results = await Promise.all(
        places.map(async (place) => {
          try {
            const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
              params: {
                lat: place.lat,
                lon: place.lon,
                format: "json",
                addressdetails: 1,
              },
            });
            const addr = res.data.address;
            return (
              addr.road || addr.village || addr.town || addr.city || res.data.display_name || "Unnamed Place"
            );
          } catch {
            return place.tags?.name || "Unnamed Place";
          }
        })
      );
      setTooltips(results);
    };

    fetchTooltips();
  }, [places]);

  return (
    <MapContainer center={[location.lat, location.lon]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* User's Location */}
      <Marker position={[location.lat, location.lon]} icon={markerIcon}>
        <Popup>You are here: {userAddress}</Popup>
        <Tooltip direction="top">{userAddress}</Tooltip>
      </Marker>

      {/* Places */}
      {places.map((place, index) => {
        const distance = calculateDistance(location.lat, location.lon, place.lat, place.lon).toFixed(2);

        return (
          <Marker
            key={index}
            position={[place.lat, place.lon]}
            icon={markerIcon}
            eventHandlers={{
              click: async () => {
                const address = await reverseGeocode(place.lat, place.lon);
                onMarkerClick({
                  ...place,
                  name: place.tags?.name || "Unnamed",
                  address,
                  contact: "0452-123456",
                  rating: "3.5",
                  distance,
                });
              },
            }}
          >
            <Tooltip direction="top">{tooltips[index] || "Unnamed Place"}</Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;


