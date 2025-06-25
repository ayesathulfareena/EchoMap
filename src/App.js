import React, { useState, useEffect } from "react";
import "./App.css";
import SearchBar from "./SearchBar";
import NearbyResults from "./NearbyResults";
import MapComponent from "./MapComponent";
import haversine from "./utils/haversine";
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

  // fallback: name includes query
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

  // 1️⃣ Ask for location access
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setUserLocation({ lat: 13.0827, lon: 80.2707 });
      setShowLocationPrompt(false);
      return;
    }
    setShowLocationPrompt(true);
  }, []);

  // 2️⃣ Request location after user allows
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

  // 3️⃣ Handle Search
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
      <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />

      {showLocationPrompt && (
        <div className="location-warning-overlay">
          <div className="location-warning-modal">
            <h2>📍 Please enable your location</h2>
            <p>Echo Map needs your location to show nearby places.</p>
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
        />
      )}

      <NearbyResults
        places={places}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelect={(place) =>
          alert(`${place.tags.name || "Unnamed"} – ${place.distance} km`)
        }
      />
    </div>
  );
}

export default App;