import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5000/api/appointments/user/${user.uid}`)
      .then((res) => res.json())
      .then(setAppointments)
      .catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>My Appointments</h2>
        <p>Please log in to view your appointments.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>My Appointments</h1>

      {appointments.length === 0 && <p>No appointments found.</p>}

      {appointments.map((a) => (
        <div
          key={a.id}
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "10px",
          }}
        >
          <p>
            <strong>Date:</strong> {a.date}
          </p>
          <p>
            <strong>Time:</strong> {a.time}
          </p>
          <p>
            <strong>Status:</strong> {a.status}
          </p>
        </div>
      ))}
    </div>
  );
}
