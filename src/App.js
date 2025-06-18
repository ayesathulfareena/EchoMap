import React, { useState, useEffect } from "react";
import "./App.css";
import SearchBar from "./SearchBar";
import NearbyResults from "./NearbyResults";
import MapComponent from "./MapComponent";
import haversine from "./utils/haversine";

function App() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null); // ✅ renamed properly

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude }); // ✅ use lon, not lng
          console.log("GPS Location:", latitude, longitude);
        },
        (error) => {
          console.error("Error fetching location", error);
          setUserLocation({ lat: 12.9716, lon: 77.5946 }); // fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.log("Geolocation not supported.");
    }
  }, []);       

  const handleSearch = async () => {
    if (!userLocation || !query) return;

    const q = `
      [out:json][timeout:25];
      (
        node["name"~"${query}",i](around:1000000,${userLocation.lat},${userLocation.lon});
        node["amenity"~"${query}",i](around:1000000,${userLocation.lat},${userLocation.lon});
      );
      out body;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: q,
      });
      const data = await res.json();
      const enrichedPlaces = (data.elements || []).map((el) => ({
        lat: el.lat,
        lon: el.lon,
        tags: el.tags || {},
        distance: haversine(
          { lat: userLocation.lat, lon: userLocation.lon },
          { lat: el.lat, lon: el.lon }
        ).toFixed(2),
      }));

      setPlaces(enrichedPlaces);
      setSidebarOpen(true);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div className="app">
      <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />
      <div className="main-container">
        {userLocation && (
          <MapComponent locations={{ location: userLocation, places }} />
        )}
        <NearbyResults
          places={places}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelect={(p) =>
            alert(`Selected: ${p.tags.name || "Unnamed"}, ${p.distance} km`)
          }
        />
      </div>
    </div>
  );
}

export default App;
