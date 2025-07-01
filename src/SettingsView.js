import React, { useEffect, useState } from "react";
import "./SettingsView.css";

function SettingsView({ onBack }) {
  const [user, setUser] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Replace these with real API calls
    fetch("/api/user/me").then(res => res.json()).then(setUser);
    fetch("/api/favorite").then(res => res.json()).then(setFavorites);
    fetch("/api/notes").then(res => res.json()).then(setNotes);
    fetch("/api/login-history").then(res => res.json()).then(setLoginHistory);
    fetch("/api/recent-searches").then(res => res.json()).then(setRecentSearches);
  }, []);

  return (
    <div className="settings-view">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <h2>👤 Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>

      <h3>❤ Favorites</h3>
      <ul>
        {favorites.map((fav, idx) => (
          <li key={idx}>{fav.placeName}</li>
        ))}
      </ul>

      <h3>📝 Notes</h3>
      <ul>
        {notes.map((note, idx) => (
          <li key={idx}>
            <strong>{note.placeName}</strong>: {note.text}
          </li>
        ))}
      </ul>

      <h3>🕓 Login History</h3>
      <ul>
        {loginHistory.map((entry, idx) => (
          <li key={idx}>{entry.timestamp}</li>
        ))}
      </ul>

      <h3>🔍 Recent Searches</h3>
      <ul>
        {recentSearches.map((search, idx) => (
          <li key={idx}>{search.query}</li>
        ))}
      </ul>

      <button className="logout-btn">🚪 Logout</button>
    </div>
  );
}

export default SettingsView;