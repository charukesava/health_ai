import { useEffect, useState } from "react";
import Header from "../components/Header";

function Emergency() {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setLocation({ lat, lon });

        // OpenStreetMap Overpass API
        const query = `
          [out:json];
          node["amenity"="hospital"](around:3000, ${lat}, ${lon});
          out;
        `;

        try {
          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
          });
          const data = await res.json();
          setHospitals(data.elements || []);
        } catch (e) {
          setError("Failed to load nearby hospitals.");
        }
      },
      () => {
        setError("Location permission denied.");
      }
    );
  }, []);

  return (
    <>
      <Header />
      <div style={{ padding: "30px" }}>
        <h1>Emergency Nearby Hospitals</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {location && (
          <div style={{ marginBottom: "20px" }}>
            <h3>Your Location:</h3>
            <p>Latitude: {location.lat}</p>
            <p>Longitude: {location.lon}</p>
          </div>
        )}

        {!error && !location && (
          <p>Fetching your location and nearby hospitals...</p>
        )}

        {hospitals.length > 0 && (
          <div>
            <h3>Hospitals within 3 km</h3>
            {hospitals.map((h, i) => (
              <div
                key={h.id || i}
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "10px",
                }}
              >
                <strong>{h.tags?.name || "Unnamed Hospital"}</strong>
                <p>
                  {h.tags?.["addr:full"] ||
                    h.tags?.["addr:street"] ||
                    "Address not available"}
                </p>
                <p>
                  Phone:{" "}
                  {h.tags?.phone ||
                    h.tags?.["contact:phone"] ||
                    "Phone number not available"}
                </p>
              </div>
            ))}
          </div>
        )}

        {!error && location && hospitals.length === 0 && (
          <p>Searching hospitals...</p>
        )}
      </div>
    </>
  );
}

export default Emergency;
