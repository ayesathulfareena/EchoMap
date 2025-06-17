import React, { useEffect, useState } from "react";
import MapComponent from "./MapComponent";
import Sidebar from "./Sidebar";
import "./App.css";

export default function App() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get geolocation on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        // fallback location (e.g., default city)
        setLocation({ lat: 12.9716, lon: 77.5946 }); // Bangalore fallback
      }
    );
  }, []);

  // Fetch places when query is submitted
  const fetchPlaces = async () => {
    if (!location || !query) return;
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:3000,${location.lat},${location.lon})[name~"${query}",i];out;`;
    try {
      const res = await fetch(overpassUrl);
      const data = await res.json();
      setPlaces(data.elements || []);
      setIsSidebarOpen(true);
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchPlaces();
  };

  return (
    <div className="app">
      <div className="search-bar">
        <input
          placeholder="Search street or place..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</button>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        places={places}
        onSelect={(place) =>
          setLocation({ lat: place.lat, lon: place.lon })
        }
      />
      <MapComponent location={location} places={places} />
    </div>
  );
}