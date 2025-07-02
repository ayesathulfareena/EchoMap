 import React, { useState, useEffect } from "react"; import "./SettingsView.css";

export default function SettingsView({ onClose }) { const [user, setUser] = useState({ name: "", email: "" }); const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

useEffect(() => { const token = localStorage.getItem("token"); if (token) { try { const base64Url = token.split('.')[1]; const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); const payload = JSON.parse(atob(base64)); setUser({ name: payload.name || "User", email: payload.sub }); } catch (e) { console.error("Invalid token", e); } } }, []);

function handleLogout() { localStorage.removeItem("token"); window.location.href = "/login"; }

return ( <div className="settings-view"> <div className="header"> <h2>Settings ⚙</h2> <button onClick={onClose}>✖</button> </div>

<div className="profile-info">
    <h3>👤 Profile</h3>
    <p><strong>Name:</strong> {user.name}</p>
    <p><strong>Email:</strong> {user.email}</p>
  </div>

  <div className="section">
    <h3>📜 Login History</h3>
    <p>Coming Soon...</p>
  </div>

  <div className="section">
    <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
      🚪 Logout
    </button>
  </div>

  {showLogoutConfirm && (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={() => setShowLogoutConfirm(false)}>×</button>
        <p>Do you want to log out from Nearli?</p>
        <button className="confirm-btn" onClick={handleLogout}>OK</button>
      </div>
    </div>
  )}
</div>

); 
}