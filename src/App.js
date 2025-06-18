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

  // 🌍 Get user location or fallback
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsLoading(false);
        },
        (error) => {
          console.warn("Location access denied. Using default location.");
          setUserLocation({ lat: 13.0827, lng: 80.2707 }); // Default: Chennai
          setIsLoading(false);
          setShowDeniedWarning(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setUserLocation({ lat: 13.0827, lng: 80.2707 });
      setIsLoading(false);
      setShowDeniedWarning(true);
    }
  }, []);

  // 🔍 Search handler
  const handleSearch = async () => {
    if (!userLocation || !query) return;

    setIsLoading(true); // Start loading

    const q = `
      [out:json][timeout:25];
      (
        node["name"~"${query}",i](around:100000,${userLocation.lat},${userLocation.lng});
        node["amenity"~"${query}",i](around:100000,${userLocation.lat},${userLocation.lng});
        node["shop"~="${query}",i](around:100000,${userLocation.lat},${userLocation.lng});
        node["leisure"~="${query}",i](around:100000,${userLocation.lat},${userLocation.lng});
        node["tourism"~="${query}",i](around:100000,${userLocation.lat},${userLocation.lng});
      );
      out body;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: q,
      });

      const data = await res.json();

      let enrichedPlaces = (data.elements || []).map((el) => ({
        lat: el.lat,
        lon: el.lon,
        tags: el.tags || {},
        distance: haversine(
          { lat: userLocation.lat, lon: userLocation.lng },
          { lat: el.lat, lon: el.lon }
        ),
      }));

      enrichedPlaces.sort((a, b) => a.distance - b.distance);

      enrichedPlaces = enrichedPlaces.map((place) => ({
        ...place,
        distance: place.distance.toFixed(2),
      }));

      setPlaces(enrichedPlaces);
      setSidebarOpen(true);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false); // Done loading
    }
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