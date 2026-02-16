import { useEffect, useState } from "react";

function Home() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/hospital-updates")
      .then((res) => res.json())
      .then((data) => {
        setUpdates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Welcome to AI Health Assistant</h1>
      <p style={{ color: "#555", marginBottom: "30px" }}>
        Latest hospital updates and health information from across India.
      </p>

      {/* Hospital Updates */}
      <section>
        <h2>🏥 Hospital Updates (India)</h2>

        {loading && <p>Loading updates...</p>}

        {!loading && updates.length === 0 && (
          <p>No hospital updates available at the moment.</p>
        )}

        {updates.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "12px",
              backgroundColor: "#f9fafb",
            }}
          >
            <strong>{item.title}</strong>
            <p>{item.description}</p>

            <p style={{ marginTop: "5px", fontSize: "14px" }}>
              🏥 <strong>{item.hospitalName}</strong>
              <br />
              📍 {item.location}
            </p>

            <small style={{ color: "#777" }}>Date: {item.date}</small>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
