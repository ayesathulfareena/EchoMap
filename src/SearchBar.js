import React, { useState } from "react";
import "./SearchBar.css";

const suggestionsList = [
  // 🏥 Health & Emergency
  "Hospital",
  "Clinic",
  "Pharmacy",
  "Medical Shop",
  "Blood Bank",
  "Diagnostic Center",
  "Covid Center",
  "Eye Hospital",
  "Dentist",
  "Physiotherapy",

  // 🏫 Education
  "School",
  "College",
  "University",
  "Tuition Center",
  "Library",
  "Coaching Institute",

  // 🏦 Banking & Finance
  "ATM",
  "Bank",
  "Credit Union",
  "Loan Center",
  "Microfinance",

  // 🛒 Shopping & Retail
  "Supermarket",
  "Grocery Store",
  "Shopping Mall",
  "Vegetable Market",
  "Electronics Shop",
  "Bakery",
  "Butcher",
  "Clothing Store",
  "Furniture Shop",
  "Hardware Store",

  // 🍽️ Food & Dining
  "Restaurant",
  "Cafe",
  "Fast Food",
  "Tea Stall",
  "Ice Cream Parlour",
  "Juice Shop",
  "Bar",
  "Pub",
  "Dhaba",
  "Bakery",

  // ⛽ Travel & Transport
  "Petrol Bunk",
  "Gas Station",
  "Bus Stop",
  "Railway Station",
  "Metro Station",
  "Airport",
  "Taxi Stand",
  "Auto Stand",
  "Car Wash",
  "EV Charging Station",
  "Toll Booth",

  // 🏨 Accommodation & Hospitality
  "Hotel",
  "Lodge",
  "Hostel",
  "Guest House",
  "Resort",
  "PG",

  // 🎡 Entertainment & Leisure
  "Movie Theater",
  "Cinema",
  "Park",
  "Zoo",
  "Amusement Park",
  "Museum",
  "Game Zone",
  "Aquarium",
  "Stadium",
  "Sports Complex",

  // ⛪ Religious Places
  "Temple",
  "Church",
  "Mosque",
  "Gurudwara",
  "Dargah",
  "Prayer Hall",
  "Ashram",

  // 👮 Government & Services
  "Police Station",
  "Fire Station",
  "RTO",
  "Post Office",
  "Municipality",
  "Passport Office",
  "Government Office",
  "Court",
  "Collector Office",
  "Electricity Office",
  "Water Board",
  "Taluk Office",
  "E-Sevai Center",
  "CSC",
  "Panchayat Office",

  // 📦 Utilities & Misc
  "Water Tank",
  "Public Toilet",
  "Dustbin",
  "Marriage Hall",
  "Cemetery",
  "Burial Ground",
  "Cremation Ground",
  "Marriage Registrar",
  "Community Hall",
  "Donation Center",
  "Lost and Found",

  // 🧑‍🔧 Professional Services
  "Doctor",
  "Lawyer",
  "Advocate",
  "Notary",
  "Plumber",
  "Electrician",
  "Mechanic",
  "Tailor",
  "Barber",
  "Salon",
  "Beautician",
  "Parlour",
  "Laundry",
  "Dry Cleaners"
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