import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function HospitalAppointments() {
  const { hospitalName } = useParams();
  const [data, setData] = useState([]);
  const [searchHospital, setSearchHospital] = useState(hospitalName || "");

  const fetchAppointments = (name) => {
    if (!name) return;
    fetch(
      `http://localhost:5000/api/appointments/hospital/${encodeURIComponent(
        name,
      )}`,
    )
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData([]));
  };

  useEffect(() => {
    if (hospitalName) {
      fetchAppointments(hospitalName);
    }
  }, [hospitalName]);

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setData((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAppointments(searchHospital);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Hospital Appointments Management</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter hospital name..."
          value={searchHospital}
          onChange={(e) => setSearchHospital(e.target.value)}
          style={{
            padding: "8px",
            width: "300px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button type="submit">Search</button>
      </form>

      <h3>Appointments {searchHospital && `for ${searchHospital}`}</h3>

      {data.length === 0 && <p>No appointments found.</p>}

      {data.map((a) => (
        <div
          key={a.id}
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "10px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <p>
            <strong>Patient:</strong> {a.patientName || "N/A"}
          </p>
          <p>
            <strong>Date & Time:</strong> {a.date} {a.time}
          </p>
          <p>
            <strong>Department:</strong> {a.department || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                fontWeight: "bold",
                color:
                  a.status === "Approved"
                    ? "green"
                    : a.status === "Rejected"
                      ? "red"
                      : "orange",
              }}
            >
              {a.status}
            </span>
          </p>
          {a.status === "Pending" && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => updateStatus(a.id, "Approved")}
                style={{
                  marginRight: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(a.id, "Rejected")}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
