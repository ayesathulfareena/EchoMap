import React from 'react';
import './FavoriteView.css';

const FavoriteView = ({ onClose }) => {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  return (
    <div className="tab-modal">
      <div className="tab-header">
        <h3>Favorites</h3>
        <button onClick={onClose}>✖</button>
      </div>
      <div className="tab-content">
        {favorites.length === 0 ? (
          <p>No favorites added yet.</p>
        ) : (
          <ul>
            {favorites.map((fav, index) => (
              <li key={index}>
                <strong>{fav.name}</strong>
                <br />
                <small>{fav.date}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FavoriteView;