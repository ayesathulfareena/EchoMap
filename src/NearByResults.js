import React from "react";
import "./NearbyResults.css";

export default function NearbyResults({ places, isOpen, onClose, onSelect }) {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h3>Nearby Results</h3>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="sidebar-content">
        {!places.length ? (
          <p>No results found.</p>
        ) : (
          places.map((p, i) => (
            <div key={i} className="place-item" onClick={() => onSelect(p)}>
              <strong>{p.tags.name || "Unnamed"}</strong>
              <div className="place-meta">
                {p.tags.amenity && <span>{p.tags.amenity}</span>}
                <span>• {p.distance} km away</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
