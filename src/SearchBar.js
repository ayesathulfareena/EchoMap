import React from "react";
import "./SearchBar.css";

export default function SearchBar({ value, onChange, onSearch }) {
  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Search hospitals, gyms, hotels..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      
    </div>
  );
}
