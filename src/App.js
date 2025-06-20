import React, { useState, useEffect } from "react";
import "./App.css";
import SearchBar from "./SearchBar"; // you already have this
import NearbyResults from "./NearbyResults";
import MapComponent from "./MapComponent";
import haversine from "./utils/haversine";

function App() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);

  // 1️⃣ Prompt for location at app load
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setUserLocation({ lat: 13.0827, lon: 80.2707 });
      setShowLocationPrompt(false);
      return;
    }
    setShowLocationPrompt(true);
  }, []);

  // 2️⃣ Actually get location once user sees prompt or retries
  const requestLocation = () => {
    setShowLocationPrompt(false);
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setIsLoading(false);
      },
      err => {
        console.warn("Denied / failed location", err);
        setUserLocation({ lat: 13.0827, lon: 80.2707 });
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 3️⃣ Handle search with unlimited radius until we get results
  const handleSearch = async () => {
    if (!userLocation || !query) return;
    setIsLoading(true);

    const radii = [2000, 5000, 10000, 20000, 50000, 100000];
    const seen = new Map();

    for (let rad of radii) {
      const q = `
        [out:json][timeout:25];
        (
          node["name"~"${query}",i](around:${rad},${userLocation.lat},${userLocation.lon});
          node["amenity"~"${query}",i](around:${rad},${userLocation.lat},${userLocation.lon});
          node["shop"~"${query}",i](around:${rad},${userLocation.lat},${userLocation.lon});
        );
        out body;
      `;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST", body: q
      });
      const data = await res.json();

      (data.elements || []).forEach(el => {
        const key = el.lat + "_" + el.lon;
        if (!seen.has(key)) {
          const dist = haversine(
            { lat: userLocation.lat, lon: userLocation.lon },
            { lat: el.lat, lon: el.lon }
          );
          seen.set(key, { lat: el.lat, lon: el.lon, tags: el.tags || {}, distance: dist });
        }
      });

      if (seen.size > 0) break;
    }

    const arr = Array.from(seen.values())
      .sort((a, b) => a.distance - b.distance)
      .map(p => ({ ...p, distance: p.distance.toFixed(2) }));

    setPlaces(arr);
    setIsSidebarOpen(true);
    setIsLoading(false);
  };

  return (
    <div className="app">
      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
      />

      {showLocationPrompt && (
        <div className="location-warning-overlay">
          <div className="location-warning-modal">
            <h2>📍 Please enable your location</h2>
            <p>Echo Map needs your location to work properly.</p>
            <button onClick={requestLocation}>OK</button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-screen">
          🔍 Echo Map is searching...
        </div>
      )}

      <div className="main-container">
        {userLocation && (
          <MapComponent locations={{ location: userLocation, places }} />
        )}

        <NearbyResults
          places={places}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelect={p => alert(`${p.tags.name || "Unnamed"} – ${p.distance} km`)}
        />
      </div>
    </div>
  );
}

export default App;
