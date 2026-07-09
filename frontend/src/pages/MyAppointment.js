import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../services/api";

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch appointments
    fetch(`${BASE_URL}/api/appointments/user/${user.uid}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
        } else if (Array.isArray(data.appointments)) {
          setAppointments(data.appointments);
        } else if (Array.isArray(data.data)) {
          setAppointments(data.data);
        } else {
          console.error("Unexpected polling response:", data);
          setAppointments([]);
        }
      })
      .catch((err) => console.error("Error fetching appointments:", err));

    // Fetch notifications
    fetch(`${BASE_URL}/api/appointments/user/${user.uid}/notifications`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
        setLoading(false);
      });

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetch(`${BASE_URL}/api/appointments/user/${user.uid}`)
        .then((res) => res.json())
        .then((data) => setAppointments(data))
        .catch((err) => console.error("Error fetching appointments:", err));

      fetch(`${BASE_URL}/api/appointments/user/${user.uid}/notifications`)
        .then((res) => res.json())
        .then((data) => setNotifications(data))
        .catch((err) => console.error("Error fetching notifications:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const getStatusColor = (status) => {
    const colors = {
      Pending: { bg: "#fff3cd", text: "#856404" },
      Approved: { bg: "#d4edda", text: "#155724" },
      Rejected: { bg: "#f8d7da", text: "#721c24" },
      Completed: { bg: "#d1ecf1", text: "#0c5460" },
    };
    return colors[status] || { bg: "#e2e3e5", text: "#383d41" };
  };

  if (!user) {
    return (
      <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
        <h2>My Appointments</h2>
        <p>Please log in to view your appointments.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>📋 My Appointments</h1>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ color: "#667eea" }}>
            🔔 Notifications ({notifications.length})
          </h2>
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  backgroundColor:
                    notif.type === "appointment" ? "#e3f2fd" : "#fff3e0",
                  border: `2px solid ${notif.type === "appointment" ? "#2196F3" : "#ff9800"}`,
                  borderRadius: "8px",
                  padding: "15px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>
                    {notif.type === "appointment" ? "📅 " : "📢 "}
                    {notif.title}
                  </h3>
                  <p style={{ margin: "0 0 8px 0", color: "#666" }}>
                    {notif.message}
                  </p>
                  <small style={{ color: "#999" }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </small>
                </div>
                <span
                  style={{
                    backgroundColor: notif.isRead ? "#e0e0e0" : "#4CAF50",
                    color: notif.isRead ? "#666" : "white",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    marginLeft: "10px",
                  }}
                >
                  {notif.isRead ? "✓ Read" : "● New"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works Info Box */}
      <div
        style={{
          backgroundColor: "#e8f4f8",
          border: "1px solid #b3d9e8",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "30px",
          fontSize: "14px",
          color: "#333",
        }}
      >
        <strong>ℹ️ How Appointments Work:</strong>
        <p style={{ marginTop: "10px", marginBottom: "0" }}>
          When you submit an appointment request, it's sent to the hospital's
          admin dashboard for review. They will review your details and approve,
          reject, or reschedule your appointment. You'll receive notifications
          here when your appointment status changes. Check the Notifications
          section above for the latest updates!
        </p>
      </div>

      {/* Appointments Section */}
      <h2 style={{ marginBottom: "20px" }}>📅 Your Appointments</h2>

      {loading && (
        <p style={{ textAlign: "center", color: "#999" }}>
          Loading your appointments...
        </p>
      )}

      {!loading && appointments.length === 0 && (
        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            color: "#666",
          }}
        >
          <p>No appointments found. Start by booking your first appointment!</p>
        </div>
      )}

      {Array.isArray(appointments) &&
        appointments.map((a) => {
          const statusColors = getStatusColor(a.status);
          return (
            <div
              key={a.id}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "15px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                borderLeft: `5px solid ${Object.values(statusColors)[1] === "#155724" ? "#28a745" : "#ffc107"}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
              }}
            >
              {/* Header with Hospital and Status */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h3 style={{ margin: 0, color: "#667eea" }}>
                  🏥 {a.hospitalName}
                </h3>
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                  }}
                >
                  {a.status}
                </span>
              </div>

              {/* Appointment Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <strong style={{ color: "#666", fontSize: "13px" }}>
                    📅 Date:
                  </strong>
                  <p style={{ margin: "5px 0 0 0", color: "#1a1a2e" }}>
                    {a.date}
                  </p>
                </div>

                <div>
                  <strong style={{ color: "#666", fontSize: "13px" }}>
                    ⏰ Time:
                  </strong>
                  <p style={{ margin: "5px 0 0 0", color: "#1a1a2e" }}>
                    {a.time}
                  </p>
                </div>

                <div>
                  <strong style={{ color: "#666", fontSize: "13px" }}>
                    👤 Patient:
                  </strong>
                  <p style={{ margin: "5px 0 0 0", color: "#1a1a2e" }}>
                    {a.patientName || "Not provided"}
                  </p>
                </div>

                <div>
                  <strong style={{ color: "#666", fontSize: "13px" }}>
                    🏨 Department:
                  </strong>
                  <p style={{ margin: "5px 0 0 0", color: "#1a1a2e" }}>
                    {a.department || "Not specified"}
                  </p>
                </div>

                <div>
                  <strong style={{ color: "#666", fontSize: "13px" }}>
                    📱 Phone:
                  </strong>
                  <p style={{ margin: "5px 0 0 0", color: "#1a1a2e" }}>
                    {a.phone || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Notes/Symptoms */}
              {a.notes && (
                <div
                  style={{
                    backgroundColor: "#f9f9f9",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "12px",
                  }}
                >
                  <strong style={{ color: "#666", fontSize: "13px" }}>
                    📝 Symptoms/Reason:
                  </strong>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: "#555",
                      fontSize: "14px",
                    }}
                  >
                    {a.notes}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {a.adminNotes && (
                <div
                  style={{
                    backgroundColor: "#e3f2fd",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "12px",
                    borderLeft: "4px solid #2196F3",
                  }}
                >
                  <strong style={{ color: "#1565c0", fontSize: "13px" }}>
                    💬 Hospital Notes:
                  </strong>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: "#0d47a1",
                      fontSize: "14px",
                    }}
                  >
                    {a.adminNotes}
                  </p>
                </div>
              )}

              {/* Created Date */}
              {a.createdAt && (
                <div
                  style={{ marginTop: "12px", fontSize: "12px", color: "#999" }}
                >
                  Submitted on: {new Date(a.createdAt).toLocaleDateString()} at{" "}
                  {new Date(a.createdAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
