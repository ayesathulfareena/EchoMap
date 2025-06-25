import React from "react";
import "./NearbyResults.css";



const NearbyResults = ({ places, isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="nearby-results">
      <div className="results-header">
        <h2>Nearby Results</h2>
        <button onClick={onClose}>✖</button>
      </div>

      {places.length > 0 ? (
        <ul>
          {places.map((place, index) => (
            <li key={index} onClick={() => onSelect(place)}>
              {place.tags.name || "Unnamed Place"} – {place.distance} km away
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found. Try expanding your search or checking your location.</p>
      )}
    </div>
  );
};

export default NearbyResults;

