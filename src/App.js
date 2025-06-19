import React, { useState, useEffect } from "react";
import "./App.css";
import SearchBar from "./SearchBar";
import NearbyResults from "./NearbyResults";
import MapComponent from "./MapComponent";
import haversine from "./utils/haversine";

export default function App() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeniedWarning, setShowDeniedWarning] = useState(false);

  // 🔍 Get user location or fallback immediately
  useEffect(() => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      setUserLocation({ lat: 13.0827, lon: 80.2707 }); // Chennai fallback
      setShowDeniedWarning(true);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lon: coords.longitude });
        setShowDeniedWarning(false);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Denied or failed:", err.message);
        setUserLocation({ lat: 13.0827, lon: 80.2707 });
        setShowDeniedWarning(true);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // 🔎 Search handler across radii
  const handleSearch = async () => {
    if (!userLocation || !query.trim()) return;

    setIsLoading(true);
    setIsSidebarOpen(false);
    const radii = [2000, 5000, 10000, 25000, 50000, 100000];
    const unique = new Map();

    for (const radius of radii) {
      const q = `
        [out:json][timeout:25];
        (
          node["name"~"${query}",i](around:${radius},${userLocation.lat},${userLocation.lon});
          node["amenity"~"${query}",i](around:${radius},${userLocation.lat},${userLocation.lon});
          node["shop"~="${query}",i](around:${radius},${userLocation.lat},${userLocation.lon});
          node["leisure"~="${query}",i](around:${radius},${userLocation.lat},${userLocation.lon});
          node["tourism"~="${query}",i](around:${radius},${userLocation.lat},${userLocation.lon});
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
          if (!unique.has(key)) {
            const dist = haversine(
              { lat: userLocation.lat, lon: userLocation.lon },
              { lat: el.lat, lon: el.lon }
            );
            unique.set(key, {
              lat: el.lat,
              lon: el.lon,
              tags: el.tags || {},
              distance: dist,
            });
          }
        }
        if (unique.size >= 10) break;
      } catch (e) {
        console.error("Overpass fetch error:", e);
      }
    }

    const sorted = [...unique.values()]
      .sort((a, b) => a.distance - b.distance)
      .map((p) => ({ ...p, distance: p.distance.toFixed(2) }));
    setPlaces(sorted);
    setSidebarOpen(true);
    setIsLoading(false);
  };

  return (
    <div className="app">
      {/* Location Denied Banner */}
      {showDeniedWarning && (
        <div className="location-warning-overlay">
          <div className="location-warning-modal">
            <h2>🔒 Location Required</h2>
            <p>Please enable location to improve results.</p>
            <button onClick={() => window.location.reload()}>OK</button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-screen">
          ⏳ Echo Map is loading...
        </div>
      )}

      {/* Map and Nearby Sidebar */}
      {!isLoading && userLocation && (
        <div className="main-container">
          <MapComponent locations={{ location: userLocation, places }} />
          <NearbyResults
            places={places}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onSelect={(p) =>
              alert(`Selected: ${p.tags.name || "Unnamed"}, ${p.distance} km`)
            }
          />
        </div>
      )}
    </div>
  );
}