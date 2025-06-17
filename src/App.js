import React, { useState, useEffect } from "react";
import "./App.css";
import MapComponent from "./MapComponent";
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [location, setLocation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    toast.info("📍 Please enable location for accurate results", {
      position: "top-center",
      autoClose: 3000,
    });

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => toast.error("Enable location access in browser")
    );
  }, []);

  const handleSearch = async () => {
    if (!searchTerm || !location) return;

    const radius = 10000;
    const query = `
      [out:json];
      (
        node["name"~"${searchTerm}",i](around:${radius},${location.lat},${location.lon});
        node["amenity"~"${searchTerm}",i](around:${radius},${location.lat},${location.lon});
      );
      out body;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    const data = await response.json();
    setResults(data.elements);
    if (data.elements.length > 0) setSidebarOpen(true);
  };

  return (
    <div className="app">
      <ToastContainer />
      {/* 🔍 Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search hospitals, cafes, etc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* 🌍 Map */}
      <MapComponent location={location} places={results} />

      {/* ⋮ Three-dot icon */}
      <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
        ⋮
      </button>

      {/* 📦 Slide-in panel */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        places={results}
      />
    </div>
  );
}

export default App;
