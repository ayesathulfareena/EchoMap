import React, { useState, useEffect } from "react";
import "./App.css";
import SearchBar from "./SearchBar";
import NearbyResults from "./NearbyResults";
import MapComponent from "./MapComponent";

function App() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      }),
      () => alert("Enable location services to use this app.")
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
        method: "POST", body: q
      });
      const data = await res.json();
      setPlaces(
        (data.elements || []).map(el => ({
          lat: el.lat,
          lon: el.lon,
          tags: el.tags || {},
          distance: ((el.dist) || (
            haversine(
              { lat: location.lat, lon: location.lon },
              { lat: el.lat, lon: el.lon }
            ) / 1000
          )).toFixed(2)
        }))
      );
      setSidebarOpen(true);
    } catch (e) {
      console.error("Search error:", e);
    }
  };

  return (
    <div className="app">
      <SearchBar
        value={query}
        onChange={s => setQuery(s)}
        onSearch={handleSearch}
      />
      <div className="main-container">
        {location &&
          <MapComponent locations={{ location, places }} />
        }
        <NearbyResults
          places={places}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelect={p => alert(`Selected: ${p.tags.name || "Unnamed"}, ${p.distance} km`)}
        />
      </div>
    </div>
  );
}

export default App;