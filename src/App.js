import React, { useEffect, useState } from "react";
import MapComponent from "./MapComponent";
import Sidebar from "./Sidebar";
import "./App.css";
import haversine from "haversine-distance";

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
  // Replace fetchPlaces(...) with:
const fetchPlaces = async () => {
  if (!location || !query) return;
  
  // Overpass query for name and amenities
 const overpassQuery = `
  [out:json];
  (
    node["name"~"${query}",i](around:50000,${location.lat},${location.lon});
    node["amenity"~"${query}",i](around:50000,${location.lat},${location.lon});
  );
  out body;
`;
  
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST", body: q
    });
    const data = await res.json();
    const mapped = (data.elements || []).map(el => ({
      lat: el.lat,
      lon: el.lon,
      tags: el.tags || {},
      distance: (haversine(
        { lat: location.lat, lon: location.lon },
        { lat: el.lat, lon: el.lon },
      ) / 1000).toFixed(2), // in km
    }));
    setPlaces(mapped);
    setIsSidebarOpen(true);
  } catch (e) {
    console.error("Search failed:", e);
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