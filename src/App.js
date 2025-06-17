import React, { useState, useEffect } from "react";
import './App.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Sidebar from "./Sidebar";
import MapComponent from "./MapComponent";

function RecenterMap({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], 13);
    }
  }, [lat, lon, map]);
  return null;
}
function getRadiusForSearch(term) {
  const lowerTerm = term.toLowerCase();
  if (lowerTerm.includes("restaurant") || lowerTerm.includes("shop")) return 5000;
  if (lowerTerm.includes("doctor") || lowerTerm.includes("hospital")) return 8000;
  if (lowerTerm.includes("tourist") || lowerTerm.includes("attraction")) return 20000;
  if (lowerTerm.includes("emergency")) return 3000;
  return 10000; // Default for general nearby finder
}

function App() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState(null);
  const [results, setResults] = useState([]);

  // Get user location
 useEffect(() => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      });
    },
    (error) => {
      // If the user blocks or it fails, show a warning
      alert("Please enable location access in your browser to use this app.");
    }
  );
}, []);

  // Search nearby places
  const handleSearch = async () => {
    if (!location || !searchTerm) return;
    const radius = getRadiusForSearch(searchTerm);

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
  };

  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (<div className="App">
  <h1>FindMate</h1>

  <input
    type="text"
    placeholder="Search for hospitals, gyms, etc..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
  />
  <button onClick={handleSearch}>Search</button>

  <div style={{ display: 'flex' }}>
    {location && (
  <>
    <Sidebar places={results} selectedPlace={selectedPlace} />
    <MapComponent
      location={location}
      places={results}
      onMarkerClick={(place) => setSelectedPlace(place)}
    />
  </>
)}
  </div>
</div>
  );
}

export default App;



