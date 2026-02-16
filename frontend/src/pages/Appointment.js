import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Appointment() {
  const { state } = useLocation();
  const { user } = useAuth();
  const hospital = state?.hospital;

  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "",
    phone: "",
    date: "",
    time: "",
    department: "",
    symptoms: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!hospital) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>No hospital selected</h2>
        <p>Please go back and choose a hospital.</p>
      </div>
    );
  }

  // Different departments per hospital type
  const departmentMap = {
    hospital: ["General Medicine", "Cardiology", "Orthopedics", "Pediatrics"],
    clinic: ["General Consultation", "ENT", "Dermatology"],
    pharmacy: ["Prescription Pickup", "Consultation"],
  };

  const departments =
    departmentMap[hospital.type?.toLowerCase()] || departmentMap.hospital;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!user) {
      setError("Please log in to book an appointment");
      setLoading(false);
      return;
    }

    const payload = {
      userId: user.uid,
      hospitalName: hospital.name,
      department: formData.department,
      date: formData.date,
      time: formData.time,
      patientName: formData.patientName,
      notes: formData.symptoms,
    };

    try {
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }

      const result = await response.json();
      console.log("Appointment booked:", result);
      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError("Error booking appointment: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Book Appointment</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>{hospital.name}</h2>
        <p>{hospital.address}</p>
      </div>

      {!submitted && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
          {error && (
            <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
          )}

          <div style={{ marginBottom: 10 }}>
            <label>Patient Name</label>
            <input
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              style={{ width: "100%", padding: 8 }}
              required
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label>Age</label>
              <input
                name="age"
                value={formData.age}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={{ width: "100%", padding: 8 }}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Symptoms / Reason</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Booking..." : "Submit Appointment Request"}
          </button>
        </form>
      )}

      {submitted && (
        <div style={{ marginTop: "20px" }}>
          <h2>Appointment Request Sent</h2>
          <p>
            Your appointment request has been sent to{" "}
            <strong>{hospital.name}</strong>.
          </p>
          <p>
            Please arrive on <strong>{formData.date}</strong> at{" "}
            <strong>{formData.time}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
