import React from 'react';
import './Sidebar.css';

const Sidebar = ({ places, selectedPlace }) => {
  return (
    <div className="sidebar">
      {selectedPlace ? (
        <div>
          <h2>Place Details</h2>
          <p><strong>{selectedPlace.name || "Unnamed"}</strong></p>
          <p>🏷 {selectedPlace.tags?.amenity || "Type not available"}</p>
          <p>📍 {selectedPlace.address || "Address not available"}</p>
          <p>📞 {selectedPlace.contact || "No contact info"}</p>
          <p>⭐ {selectedPlace.rating || "No rating"}</p>
          <p>📏 {selectedPlace.distance ? `${selectedPlace.distance} km away` : "Distance not available"}</p>
        </div>
      ) : (
        <>
          <h2>Nearby Places</h2>
          {places.length === 0 ? (
            <p>No results found</p>
          ) : (
            <ul>
              {places.map((place) => (
                <li key={place.id}>
                  <strong>{place.tags?.name || "Unnamed"}</strong><br />
                  🏷 {place.tags?.amenity || "N/A"}<br />
                  📍 Lat: {place.lat.toFixed(4)}, Lon: {place.lon.toFixed(4)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default Sidebar;

