import React, { useState } from "react";
import "./SearchBar.css";

const suggestionsList = [
  "Restaurant", "Hotel", "Gym", "Pharmacy",
  "School", "Hospital", "Cafe", "Bank",
];

export default function SearchBar({ value, onChange, onSearch }) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelect = (suggestion) => {
    onChange(suggestion);
    onSearch();
    setShowSuggestions(false);
  };

  const clearInput = () => {
    onChange("");
    setShowSuggestions(false);
  };

  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Search hospitals, gyms, hotels..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch();
            setShowSuggestions(false); // 👈 Close suggestions on Enter
          }
        }}
      />
      {value && (
        <button className="clear-btn" onClick={clearInput}>✖</button>
      )}
      {showSuggestions && value && (
        <ul className="suggestions-list">
          {suggestionsList
            .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
            .map((sug, idx) => (
              <li key={idx} onClick={() => handleSelect(sug)}>{sug}</li>
            ))}
        </ul>
      )}
    </div>
  );
}