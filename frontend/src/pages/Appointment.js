import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../services/api";

export default function Appointment() {
  const { state } = useLocation();
  const { user } = useAuth();
  const [hospital, setHospital] = useState(state?.hospital || null);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("all");

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

  // Fetch available hospitals on component mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoadingHospitals(true);
        const response = await fetch(`${BASE_URL}/api/hospitals`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setHospitals(data);
          } else {
            console.error("Unexpected hospitals response:", data);
            setHospitals([]);
          }
        } else {
          console.error("Failed to fetch hospitals");
        }
      } catch (err) {
        console.log("Error fetching hospitals:", err);
      } finally {
        setLoadingHospitals(false);
      }
    };
    fetchHospitals();
  }, []);

  // Different departments per hospital type
  const departmentMap = {
    hospital: [
      "General Medicine",
      "Cardiology",
      "Orthopedics",
      "Pediatrics",
      "Neurology",
      "Oncology",
    ],
    clinic: ["General Consultation", "ENT", "Dermatology"],
    pharmacy: ["Prescription Pickup", "Consultation"],
  };

  const departments = hospital
    ? departmentMap[hospital.type?.toLowerCase()] || departmentMap.hospital
    : [];

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

    if (!formData.phone || formData.phone.length < 10) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }
    if (!hospital) {
      setError("Please select a hospital.");
      setLoading(false);
      return;
    }

    const payload = {
      userId: user.uid,
      userEmail: user.email,
      hospitalName: hospital.name,
      department: formData.department,
      date: formData.date,
      time: formData.time,
      patientName: formData.patientName,
      notes: formData.symptoms,
      phone: formData.phone,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to book appointment",
        );
      }

      console.log("Appointment booked:", result);
      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError("Error booking appointment: " + err.message);
      setLoading(false);
    }
  };

  // Filter hospitals
  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = filterCity === "all" || h.city === filterCity;
    return matchesSearch && matchesCity;
  });

  // Recalculate cities whenever hospitals change
  const cities =
    hospitals.length > 0
      ? [...new Set(hospitals.map((h) => h.city))].sort()
      : [];

  return (
    <div className="page fade-in">
      <h1>📅 Book Appointment</h1>

      {/* Hospital Selection */}
      {!hospital && (
        <div style={{ marginBottom: "30px" }}>
          <h2>Step 1: Select a Hospital/Clinic</h2>

          {/* Search and Filter */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                🔍 Search Hospital/Clinic
              </label>
              <input
                type="text"
                placeholder="Search by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                📍 Filter by City
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hospitals Grid */}
          {loadingHospitals ? (
            <p style={{ textAlign: "center", color: "#999" }}>
              Loading hospitals...
            </p>
          ) : filteredHospitals.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999" }}>
              No hospitals found. Try different search terms.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "15px",
              }}
            >
              {filteredHospitals.map((h) => (
                <div
                  key={h.id}
                  className="feedback-card slide-in-up"
                  style={{ cursor: "pointer", minHeight: 0 }}
                  onClick={() => setHospital(h)}
                >
                  <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>
                    {h.name}
                  </h3>

                  {/* Rating Section */}
                  <div
                    style={{
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "18px", color: "#ffc107" }}>
                      {"⭐".repeat(Math.floor(h.rating))}
                    </span>
                    <span style={{ fontWeight: "bold", color: "#333" }}>
                      {h.rating}
                    </span>
                    <span style={{ color: "#999", fontSize: "12px" }}>
                      ({h.reviews} reviews)
                    </span>
                  </div>

                  <div
                    style={{
                      color: "#666",
                      fontSize: "13px",
                      marginBottom: "8px",
                    }}
                  >
                    <p style={{ margin: "4px 0" }}>
                      <strong>🏥 Type:</strong> {h.type}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>📍 Location:</strong> {h.city}, {h.state}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>📱 Phone:</strong> {h.phone}
                    </p>
                  </div>

                  {/* Specialties */}
                  <div style={{ marginBottom: "10px" }}>
                    <strong style={{ fontSize: "12px" }}>Specialties:</strong>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "5px",
                        marginTop: "5px",
                      }}
                    >
                      {h.specialties.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          style={{
                            backgroundColor: "#e8f0fe",
                            color: "#667eea",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                      {h.specialties.length > 3 && (
                        <span
                          style={{
                            color: "#999",
                            fontSize: "11px",
                            padding: "4px 0",
                          }}
                        >
                          +{h.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setHospital(h)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#667eea",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      marginTop: "10px",
                      transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#5568d3")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#667eea")
                    }
                  >
                    Select Hospital
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hospital Details & Appointment Form */}
      {hospital && (
        <>
          <div
            style={{
              marginBottom: "30px",
              padding: "20px",
              backgroundColor: "#f0f4ff",
              borderRadius: "10px",
              borderLeft: "5px solid #667eea",
            }}
          >
            <h2
              style={{ marginTop: 0, color: "#667eea", marginBottom: "15px" }}
            >
              ✅ {hospital.name}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <div>
                <p style={{ margin: "8px 0" }}>
                  <strong>Type:</strong> {hospital.type}
                </p>
                <p style={{ margin: "8px 0" }}>
                  <strong>Address:</strong> {hospital.address}
                </p>
                <p style={{ margin: "8px 0" }}>
                  <strong>Phone:</strong> {hospital.phone}
                </p>
              </div>
              <div>
                <p style={{ margin: "8px 0" }}>
                  <strong>Rating:</strong> {hospital.rating} ⭐ (
                  {hospital.reviews} reviews)
                </p>
                <p style={{ margin: "8px 0" }}>
                  <strong>Specialties:</strong>{" "}
                  {hospital.specialties.join(", ")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setHospital(null)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              ← Change Hospital
            </button>
          </div>

          <h2>Step 2: Fill Appointment Details</h2>
          {!submitted && (
            <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
              {error && (
                <p
                  style={{
                    color: "red",
                    marginBottom: "10px",
                    padding: "10px",
                    backgroundColor: "#ffe6e6",
                    borderRadius: "4px",
                  }}
                >
                  ❌ {error}
                </p>
              )}

              <div style={{ marginBottom: 15 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Patient Name *
                </label>
                <input
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: 15,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: 15,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Appointment Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 15 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Symptoms / Reason for Visit
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Describe your symptoms or reason for visit..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: loading ? "#ccc" : "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.3s",
                }}
              >
                {loading ? "⏳ Booking..." : "✅ Submit Appointment Request"}
              </button>
            </form>
          )}

          {submitted && (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "8px",
                color: "#155724",
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                ✅ Appointment Request Sent Successfully!
              </h2>
              <p>
                Your appointment request has been sent to{" "}
                <strong>{hospital.name}</strong>.
              </p>
              <p>
                <strong>Appointment Details:</strong>
                <br />
                📅 Date: {formData.date}
                <br />
                🕐 Time: {formData.time}
                <br />
                🏥 Hospital: {hospital.name}
                <br />
                🩺 Department: {formData.department}
              </p>
              <p>
                A hospital administrator will review your request and notify you
                about the status within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setHospital(null);
                  setFormData({
                    patientName: "",
                    age: "",
                    gender: "",
                    phone: "",
                    date: "",
                    time: "",
                    department: "",
                    symptoms: "",
                  });
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ➕ Book Another Appointment
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
