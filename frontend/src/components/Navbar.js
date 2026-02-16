import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="navbar">
      <div className="nav-left" onClick={() => navigate("/home")}>
        AI Health Assistant
      </div>

      <div className="nav-center">
        <button onClick={() => navigate("/home")}>Home</button>
        <button onClick={() => navigate("/health-chat")}>Health Chat</button>
        <button onClick={() => navigate("/nearby")}>Nearby Finder</button>
        <button onClick={() => navigate("/map")}>Map</button>
        <button className="danger" onClick={() => navigate("/emergency")}>
          Emergency
        </button>
      </div>

      <div className="nav-right">
        <div className="profile" onClick={() => setOpen(!open)}>
          {user.email ? user.email[0].toUpperCase() : "U"}
        </div>

        {open && (
          <div className="dropdown">
            <div className="email">{user.email}</div>
            <div className="role">{isAdmin ? "Admin" : "User"}</div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
