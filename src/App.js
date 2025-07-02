import React, { useState, useEffect } from "react";
import "./App.css";
import SearchBar from "./SearchBar";
import NearbyResults from "./NearbyResults";
import MapComponent from "./MapComponent";
import haversine from "./utils/haversine";



import PinActionModel from './PinActionModel';
import SettingsView from "./SettingsView";
import FavoriteView from "./FavoriteView";
import NotesView from "./NotesView";

const queryTagMap = {
  restaurant: ["amenity=restaurant"],
  cafe: ["amenity=cafe"],
  fastfood: ["amenity=fast_food"],
  bakery: ["shop=bakery"],
  bar: ["amenity=bar"],
  pub: ["amenity=pub"],
  hotel: ["tourism=hotel"],
  motel: ["tourism=motel"],
  guesthouse: ["tourism=guest_house"],
  hospital: ["amenity=hospital"],
  clinic: ["amenity=clinic"],
  dentist: ["amenity=dentist", "healthcare=dentist"],
  pharmacy: ["amenity=pharmacy"],
  doctors: ["amenity=doctors", "healthcare=doctor"],
  school: ["amenity=school"],
  college: ["amenity=college"],
  university: ["amenity=university"],
  temple: ["amenity=place_of_worship"],
  church: ["amenity=place_of_worship", "religion=christian"],
  mosque: ["amenity=place_of_worship", "religion=muslim"],
  atm: ["amenity=atm"],
  bank: ["amenity=bank"],
  fuel: ["amenity=fuel"],
  petrol: ["amenity=fuel"],
  parking: ["amenity=parking"],
  toilet: ["amenity=toilets"],
  bus: ["highway=bus_stop", "amenity=bus_station"],
  train: ["railway=station"],
  metro: ["railway=subway_entrance"],
  library: ["amenity=library"],
  police: ["amenity=police"],
  fire: ["amenity=fire_station"],
  court: ["amenity=courthouse"],
  gym: ["leisure=fitness_centre"],
  park: ["leisure=park"],
  playground: ["leisure=playground"],
  mall: ["shop=mall"],
  supermarket: ["shop=supermarket"],
  grocery: ["shop=convenience"],
  market: ["amenity=marketplace"],
  electronics: ["shop=electronics"],
  clothing: ["shop=clothes"],
  salon: ["shop=beauty", "shop=hairdresser"],
  spa: ["leisure=spa"],
  theater: ["amenity=theatre"],
  cinema: ["amenity=cinema"],
  zoo: ["tourism=zoo"],
  museum: ["tourism=museum"],
  stadium: ["leisure=stadium"],
};

function isRelevant(place, query) {
  const tags = place.tags || {};
  const lowerQuery = query.toLowerCase();
  const tagList = queryTagMap[lowerQuery];
  if (tagList) {
    return tagList.some(tag => {
      const [key, value] = tag.split("=");
      return tags[key] === value;
    });
  }
  const name = tags.name?.toLowerCase() || "";
  return name.includes(lowerQuery);
}

function App() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [favorites, setFavorites] = useState([]);
const [notes, setNotes] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);

  
  const [showSettings, setShowSettings] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setUserLocation({ lat: 13.0827, lon: 80.2707 });
      setShowLocationPrompt(false);
      return;
    }
    setShowLocationPrompt(true);
  }, []);

  const requestLocation = () => {
    setShowLocationPrompt(false);
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        console.warn("Location denied:", err);
        setUserLocation({ lat: 13.0827, lon: 80.2707 }); // fallback to Chennai
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const handleAddToFavorites = (place) => {
  setFavorites(prev => [...prev, { ...place, date: new Date().toLocaleDateString() }]);
  alert("Added to Favorites!");
};

const handleAddToNotes = (place) => {
  setShowPinModal(false); // Close modal
  setShowNotes(true);
  // You can also pre-fill Notes with selected place data (optional enhancement)
};
  const handleSearch = async () => {
    if (!userLocation || !query) return;
    setIsLoading(true);
    const lowerQuery = query.toLowerCase();
    const tags = queryTagMap[lowerQuery];
    if (!tags) {
      alert("Unknown place type.");
      setIsLoading(false);
      return;
    }
    const radii = [50000, 100000, 200000, 500000, 1000000];
    const seen = new Map();

    for (let rad of radii) {
      const overpassTags = tags.map(tag => {
        const [key, value] = tag.split("=");
        return `node["${key}"="${value}"](around:${rad},${userLocation.lat},${userLocation.lon});`;
      }).join("\n");

      const queryStr = `
        [out:json][timeout:25];
        (
          ${overpassTags}
        );
        out body;
      `;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ data: queryStr }),
      });

      const data = await res.json();
      (data.elements || []).forEach((el) => {
        const key = el.lat + "_" + el.lon;
        if (!seen.has(key)) {
          const dist = haversine(
            { lat: userLocation.lat, lon: userLocation.lon },
            { lat: el.lat, lon: el.lon }
          );
          seen.set(key, {
            lat: el.lat,
            lon: el.lon,
            tags: el.tags || {},
            distance: dist,
          });
        }
      });

      if (seen.size > 0) break;
    }

    const sorted = Array.from(seen.values())
      .sort((a, b) => a.distance - b.distance)
      .map((p) => ({ ...p, distance: p.distance.toFixed(2) }));

    const filtered = sorted.filter(place => isRelevant(place, query));
    setPlaces(filtered);
    setIsSidebarOpen(true);
    setIsLoading(false);
  };

  return (
    <div className="app">
      
      {/* 🎯 NEW — 3-button panel */}
      <div className="action-bar">
        <button onClick={() => setShowFavorites(true)}>{"❤"}</button>
        <button onClick={() => setShowNotes(true)}>{"📝"}</button>
        <button onClick={() => setShowSettings(true)}>{"⚙"}</button>
      </div>
      {/* 🌐 Search bar stays on top */}
      <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />


      {showLocationPrompt && (
        <div className="location-warning-overlay">
          <div className="location-warning-modal">
            <h2>📍 Please enable your location</h2>
            <p>Nearli needs your location to show nearby places.</p>
            <button onClick={requestLocation}>OK</button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-screen">🔍 Searching nearby places...</div>
      )}

      {userLocation && (
       <MapComponent
  locations={{ location: userLocation, places }}
  query={query}
  onMapClick={() => setIsSidebarOpen(false)}
  onPlaceClick={(place) => {
    setSelectedPlace(place);
    setShowPinModal(true);
  }}
/>
      )}

     <NearbyResults
  places={places}
  isOpen={isSidebarOpen}
  onClose={() => setIsSidebarOpen(false)}
  onSelect={(place) =>
    alert(`${place.tags.name || "Unnamed"} – ${place.distance} km`)
  }
/>

      {/* 👇 Conditionally show each full-screen modal */}
      {showSettings && <SettingsView onClose={() => setShowSettings(false)} />}
      {showFavorites && <FavoriteView onClose={() => setShowFavorites(false)} />}
      {showNotes && <NotesView onClose={() => setShowNotes(false)} />}
      
 
    {showPinModal && selectedPlace && (
  <PinActionModel
    place={selectedPlace}
    onClose={() => {
      setSelectedPlace(null);
      setShowPinModal(false);
    }}
    onAddToFavorites={handleAddToFavorites}
    onAddToNotes={handleAddToNotes}
  />
)}


    </div>
  );
}

export default App;