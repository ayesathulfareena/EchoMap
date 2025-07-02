// PinActionModel.jsx
import React from "react";
import "./PinActionModel.css"; // Add style if needed

function PinActionModel({ place, onClose, onAddToFavorites, onAddToNotes }) {
  if (!place) return null;

  const name = place.tags?.name || "Unnamed";
  const dist = place.distance || "N/A";

  return (
    <div className="pin-action-modal">
      <div className="modal-card">
        <h3>{name}</h3>
        <p>📍 Distance: {dist} km</p>
        <div className="actions">
          <button onClick={() => onAddToFavorites(place)}>❤ Favorite</button>
          <button onClick={() => onAddToNotes(place)}>📝 Note</button>
          <button onClick={onClose}>❌ Close</button>
        </div>
      </div>
    </div>
  );
}

export default PinActionModel;