import React from "react";
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose, places }) {
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
            <div key={index} className="place-item">
              {place.tags.name || "Unnamed Place"}
            </div>
          ))
        )}
      </div>
    </div>
  );
}