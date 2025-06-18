import React, { useState, useEffect } from "react";
import "./App.css";
import SearchBar from "./SearchBar";
import NearbyResults from "./NearbyResults";
import MapComponent from "./MapComponent";
import haversine from "./utils/haversine";
                                           
function App() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

 useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    pos => {
      setLocation({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      });
    },
    () => alert("Enable location services to use this app."),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}, []);
      
   

  const handleSearch = async () => {
    if (!location || !query) return;

    const q = `
      [out:json][timeout:25];
      (
        node["name"~"${query}",i](around:50000,${location.lat},${location.lon});
        node["amenity"~"${query}",i](around:50000,${location.lat},${location.lon});
      );
      out body;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: q,
      });
      const data = await res.json();
      const enrichedPlaces = (data.elements || []).map(el => ({
        lat: el.lat,
        lon: el.lon,
        tags: el.tags || {},
        distance: haversine(
          { lat: location.lat, lon: location.lon },
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
        {location && <MapComponent locations={{ location, places }} />}
        <NearbyResults
          places={places}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelect={p =>
            alert(`Selected: ${p.tags.name || "Unnamed"}, ${p.distance} km`)
          }
        />
      </div>
    </div>
  );
}

export default App;