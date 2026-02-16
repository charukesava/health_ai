import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div style={{ padding: "30px" }}>
        <p>You must be logged in to view the admin dashboard.</p>
        <button onClick={() => navigate("/admin-login")}>
          Go to Admin Login
        </button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: "30px" }}>
        <h1>Admin Dashboard</h1>
        <p>Admin-only overview and controls</p>

        {/* Summary Cards */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              border: "1px solid #ddd",
              padding: "16px",
              borderRadius: "8px",
              minWidth: "200px",
            }}
          >
            <h3>Application Status</h3>
            <p>Application Running</p>
          </div>

          <div
            style={{
              border: "1px solid #ddd",
              padding: "16px",
              borderRadius: "8px",
              minWidth: "200px",
            }}
          >
            <h3>Role</h3>
            <p>Admin</p>
            <p>Email verified: {user?.emailVerified ? "Yes" : "No"}</p>
          </div>
        </div>

        <div style={{ marginTop: "30px" }}>
          <h2>Account Details</h2>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>User ID:</strong> {user?.uid}
          </p>
          <p>
            <strong>Verified:</strong> {user?.emailVerified ? "Yes" : "No"}
          </p>
        </div>

        <button
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/admin/updates")}
        >
          Manage Hospital Updates
        </button>
      </div>
    </>
  );
}

export default AdminDashboard;
