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
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeniedWarning, setShowDeniedWarning] = useState(false);

 useEffect(() => {
  if (!navigator.geolocation) {
    console.warn("Geolocation not supported.");
    setUserLocation({ lat: 13.0827, lng: 80.2707 }); // Chennai fallback
    setShowDeniedWarning(true);
    setIsLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setIsLoading(false);
      console.log("✅ Location fetched:", latitude, longitude);
    },
    (error) => {
      console.warn("❌ Location access denied or failed:", error.message);
      setUserLocation({ lat: 13.0827, lng: 80.2707 }); // fallback
      setShowDeniedWarning(true);
      setIsLoading(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}, []);

  const handleSearch = async () => {
    setIsLoading(true);

   if (!query) {
  alert("Please enter a search term.");
  setIsLoading(false);
  return;
}

if (!userLocation) {
  alert("User location not available yet. Please wait or reload.");
  setIsLoading(false);
  return;
}
    const radii = [2000, 5000, 10000, 25000, 50000, 100000];
    const fetched = new Map();

    for (const radius of radii) {
      const q = `
        [out:json][timeout:60];
        (
          node["name"~"${query}",i](around:${radius},${userLocation.lat},${userLocation.lng});
          node["amenity"~"${query}",i](around:${radius},${userLocation.lat},${userLocation.lng});
          node["shop"~="${query}",i](around:${radius},${userLocation.lat},${userLocation.lng});
          node["leisure"~="${query}",i](around:${radius},${userLocation.lat},${userLocation.lng});
          node["tourism"~="${query}",i](around:${radius},${userLocation.lat},${userLocation.lng});
        );
        out body;
      `;

      try {
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: q,
        });

        const data = await res.json();
        for (const el of data.elements || []) {
          const key = `${el.lat}_${el.lon}`;
          if (!fetched.has(key)) {
            fetched.set(key, {
              lat: el.lat,
              lon: el.lon,
              tags: el.tags || {},
              distance: haversine(
                { lat: userLocation.lat, lon: userLocation.lng },
                { lat: el.lat, lon: el.lon }
              ),
            });
          }
        }
        // 👇 NO break — continue collecting results from all radii
      } catch (err) {
        console.error("Overpass fetch error:", err);
      }
    }

    const results = Array.from(fetched.values())
      .sort((a, b) => a.distance - b.distance)
      .map((p) => ({
        ...p,
        distance: p.distance.toFixed(2),
      }));

    setPlaces(results);
    setSidebarOpen(true);
    setIsLoading(false);
  };

  return (
    <div className="app">
      <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />

      {isLoading && (
        <div className="loading-screen">
          <p>🔍 Echo Map is searching for your location and nearby places...</p>
        </div>
      )}

      {!isLoading && (
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
      )}

      {showDeniedWarning && (
        <div className="location-warning-overlay">
          <div className="location-warning-modal">
            <h2>Location Access Denied</h2>
            <p>Echo Map is using default location (Chennai) for results.</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;