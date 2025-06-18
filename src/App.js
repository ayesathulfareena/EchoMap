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

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (error) => {
          console.warn("Location access denied. Using default location.");
          setUserLocation({ lat: 13.0827, lng: 80.2707 }); // Default: Chennai
          setShowDeniedWarning(true);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setUserLocation({ lat: 13.0827, lng: 80.2707 });
      setShowDeniedWarning(true);
      setIsLoading(false);
    }
  }, []);

  // Handle search and show unlimited nearby results
  const handleSearch = async () => {
    if (!userLocation || !query) return;

    setIsLoading(true);
    setPlaces([]);

    const fetched = new Map();
    const radiusSteps = [2000, 5000, 10000, 25000, 50000, 100000, 150000, 200000];

    for (const radius of radiusSteps) {
      const queryString = `
        [out:json][timeout:25];
        (
          node["name"~"${query}",i](around:${radius},${userLocation.lat},${userLocation.lng});
          node["amenity"~"${query}",i](around:${radius},${userLocation.lat},${userLocation.lng});
          node["shop"~="${query}",i](around:${radius},${userLocation.lat},${userLocation.lng});
          node["leisure"~="${query}",i](around:${radius},${userLocation.lat},${userLocation.lng});
          node["tourism"~="${query}",i](around:${radius},${userLocation.lat},${userLocation.lng});
        );
        out body;
      `;

      try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: queryString,
        });

        const data = await response.json();
        for (const el of data.elements || []) {
          const key = `${el.lat}_${el.lon}`;
          if (!fetched.has(key)) {
            fetched.set(key, {
              lat: el.lat,
              lon: el.lon,
              tags: el.tags || {},
              distance: haversine(
                { lat: userLocation.lat, lon: userLocation.lng },
                { lat: el.lat, lon: el.lon }
              ),
            });
          }
        }

        // Optional: remove break to get ALL results, not just 10
        // if (fetched.size >= 10) break;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    const sorted = Array.from(fetched.values())
      .sort((a, b) => a.distance - b.distance)
      .map((place) => ({
        ...place,
        distance: place.distance.toFixed(2),
      }));

    setPlaces(sorted);
    setSidebarOpen(true);
    setIsLoading(false);
  };

  return (
    <div className="app">
      <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />

      {isLoading && (
        <div className="loading-screen">
          <p>🔍 Echo Map is searching for your location and nearby places...</p>
        </div>
      )}

      {!isLoading && userLocation && (
        <div className="main-container">
          <MapComponent locations={{ location: userLocation, places }} />
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
            <h2>📍 Location Access Denied</h2>
            <p>Echo Map is using default location (Chennai).</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
