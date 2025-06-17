import React from "react";
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose, places, onSelect }) {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h3>Nearby Results</h3>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="sidebar-content">
        {places.length === 0 ? (
          <p>No results found.</p>
        ) : (
          places.map((place, index) => (
            <div
              key={index}
              className="place-item"
              onClick={() => onSelect(place)}
            >
              <strong>{place.tags.name || "Unnamed Place"}</strong>
              <div className="place-meta">
                {place.tags.amenity && <span>{place.tags.amenity}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}