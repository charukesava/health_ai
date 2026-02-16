import { useEffect, useState } from "react";

export default function HospitalAppointments({ hospitalName }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!hospitalName) return;

    fetch(
      `http://localhost:5000/api/appointments/hospital/${encodeURIComponent(
        hospitalName
      )}`
    )
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, [hospitalName]);

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setData((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Appointments for {hospitalName}</h3>

      {data.length === 0 && <p>No appointments yet.</p>}

      {data.map((a) => (
        <div
          key={a.id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "8px",
          }}
        >
          <p>
            {a.patientName} — {a.date} {a.time}
          </p>
          <p>Status: {a.status}</p>
          {a.status === "Pending" && (
            <>
              <button
                onClick={() => updateStatus(a.id, "Approved")}
                style={{ marginRight: 6 }}
              >
                Approve
              </button>
              <button onClick={() => updateStatus(a.id, "Rejected")}>
                Reject
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
