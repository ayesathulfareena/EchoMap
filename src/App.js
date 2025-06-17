import React, { useEffect, useState } from "react";
import MapComponent from "./MapComponent";
import Sidebar from "./Sidebar";
import "./App.css";

function App() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        async () => {
          // fallback to IP-based location
          try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            setLocation({ lat: data.latitude, lon: data.longitude });
          } catch (err) {
            console.error("Location access denied and IP lookup failed", err);
          }
        }
      );
    };
    getLocation();
  }, []);

  const fetchPlaces = async () => {
    if (!query || !location) return;
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=${query}](around:5000,${location.lat},${location.lon});out;`
    );
    const data = await response.json();
    setPlaces(data.elements);
    setSidebarOpen(true);
  };

  return (
    <div className="app">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for nearby (e.g., hospital, cafe)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={fetchPlaces}>Search</button>
      </div>
      <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
        ☰
      </button>
      <MapComponent location={location} places={places} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} places={places} />
    </div>
  );
}

export default App;
