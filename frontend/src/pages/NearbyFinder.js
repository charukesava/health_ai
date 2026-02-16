import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NearbyFinder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  // Haversine distance
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  }

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setError("");
      },
      () => setError("Location permission denied")
    );
  };

  const findNearby = async () => {
    try {
      setError("");
      setResults([]);

      if (!query.trim()) {
        setError("Enter a city or location name.");
        return;
      }

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const geoData = await geoRes.json();

      if (!geoData.length) {
        setError("Location not found");
        return;
      }

      const { lat, lon } = geoData[0];

      const overpassQuery = `
        [out:json];
        (
          node["amenity"="hospital"](around:5000,${lat},${lon});
          node["amenity"="clinic"](around:5000,${lat},${lon});
          node["amenity"="pharmacy"](around:5000,${lat},${lon});
        );
        out;
      `;

      const overpassRes = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: overpassQuery,
        }
      );
      const data = await overpassRes.json();

      const mapped = (data.elements || []).map((el) => {
        let distance = "N/A";
        if (userLocation) {
          distance = getDistance(
            userLocation.lat,
            userLocation.lon,
            el.lat,
            el.lon
          );
        }
        return {
          id: el.id,
          name: el.tags?.name || "Unnamed",
          type: el.tags?.amenity,
          address:
            el.tags?.["addr:full"] ||
            el.tags?.["addr:street"] ||
            "Address not available",
          phone: el.tags?.phone || "Phone not available",
          lat: el.lat,
          lon: el.lon,
          distance,
        };
      });

      setResults(mapped);
    } catch {
      setError("Overpass API blocked. Please try again later.");
    }
  };

  const openMap = (item) => {
    navigate("/map", { state: { hospital: item } });
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Nearby Finder</h1>

      <div style={{ marginBottom: 12 }}>
        <button onClick={getMyLocation}>Use My Location</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Enter city or area..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "300px", padding: 8 }}
        />
        <button onClick={findNearby} style={{ marginLeft: 8 }}>
          Search
        </button>
      </div>

      {error && <p style={{ color: "red", marginBottom: 8 }}>{error}</p>}

      {results.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "10px",
          }}
        >
          <h3>{item.name}</h3>
          <p>Type: {item.type}</p>
          <p>{item.address}</p>
          <p>{item.phone}</p>
          <p>
            <strong>Distance: </strong>
            {item.distance !== "N/A"
              ? `${item.distance} km`
              : "Enable location"}
          </p>
          <button onClick={() => openMap(item)}>View on Map</button>
        </div>
      ))}

      {results.length === 0 && !error && (
        <p>Search for a location to find nearby hospitals and clinics.</p>
      )}
    </div>
  );
}
