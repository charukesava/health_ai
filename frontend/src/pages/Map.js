import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Map() {
  const location = useLocation();
  const hospital = location.state?.hospital;

  const [userPos, setUserPos] = useState(null);
  const [mapMode, setMapMode] = useState("hospital");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        setError("Location permission denied");
      }
    );
  }, []);

  const createBBox = (lat, lon, zoom = 0.01) => {
    return `${lon - zoom},${lat - zoom},${lon + zoom},${lat + zoom}`;
  };

  let mapUrl = "https://www.openstreetmap.org/export/embed.html";
  if (mapMode === "user" && userPos) {
    mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${createBBox(
      userPos.lat,
      userPos.lon
    )}&marker=${userPos.lat},${userPos.lon}`;
  }
  if (mapMode === "hospital" && hospital) {
    mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${createBBox(
      hospital.lat,
      hospital.lon
    )}&marker=${hospital.lat},${hospital.lon}`;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Map View</h1>

      {hospital && (
        <div style={{ marginBottom: "10px" }}>
          <h3>{hospital.name}</h3>
          <p>{hospital.address || "Address not available"}</p>
          <p>{hospital.phone || "Phone not available"}</p>
        </div>
      )}

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setMapMode("hospital")}>Hospital</button>
        <button onClick={() => setMapMode("user")} style={{ marginLeft: 8 }}>
          My Location
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <iframe
        title="map"
        src={mapUrl}
        style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
      />
    </div>
  );
}
