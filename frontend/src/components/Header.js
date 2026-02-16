import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header style={styles.header}>
      <div style={styles.logo} onClick={() => navigate("/home")}>
        AI Health Assistant
      </div>
      <div style={styles.right}>
        <span style={styles.email}>{user.email}</span>
        <button style={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#0f3c4c",
    color: "#fff",
  },
  logo: {
    cursor: "pointer",
    fontWeight: 600,
  },
  right: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  email: {
    fontSize: "14px",
  },
  logout: {
    background: "#e74c3c",
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "4px",
  },
};

export default Header;
