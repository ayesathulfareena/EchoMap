import React, { useEffect, useState } from "react";
import "./NearbyResults.css";

const NearbyResults = ({ userLocation, searchQuery, onClose }) => {
  const [nearbyResults, setNearbyResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5000); // meters

  useEffect(() => {
    if (searchQuery && userLocation) {
      fetchNearbyPlaces();
    }
  }, [searchQuery, userLocation]);

  const fetchNearbyPlaces = async () => {
    setLoading(true);
    let resultsFound = [];
    let radius = 5000; // Start with 2km
    const maxRadius = 50000; // Up to 50km
    const step = 5000; // Increase radius by 5km each time

    while (radius <= maxRadius && resultsFound.length === 0) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=10&extratags=1&addressdetails=1&bounded=1&viewbox=${calculateBoundingBox(
          userLocation,
          radius
        )}`
      );
      const data = await response.json();
      resultsFound = data;
      if (data.length > 0) {
        setSearchRadius(radius);
      } else {
        radius += step;
      }
    }

    setNearbyResults(resultsFound);
    setLoading(false);
  };

  const calculateBoundingBox = (location, radius) => {
    const lat = location.lat;
    const lon = location.lon;
    const latDiff = radius / 111000;
    const lonDiff = radius / (111000 * Math.cos((lat * Math.PI) / 180));
    return `${lon - lonDiff},${lat - latDiff},${lon + lonDiff},${lat + latDiff}`;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  return (
    <div className="nearby-results">
      <div className="results-header">
        <h2>Nearby Results</h2>
        <button onClick={onClose}>✖</button>
      </div>
      {loading ? (
        <p>Loading results near you...</p>
      ) : nearbyResults.length > 0 ? (
        <div>
          <p>🔍 Showing results within {(searchRadius / 1000).toFixed(1)} km</p>
          <ul>
            {nearbyResults.map((place, index) => {
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lon,
                parseFloat(place.lat),
                parseFloat(place.lon)
              );
              return (
                <li key={index}>
                  {place.display_name} – {distance.toFixed(1)} km away
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default NearbyResults;

