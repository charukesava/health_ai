import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!email || !password) {
      setMessage("❌ Please fill in all fields.");
      return;
    }

    try {
      await login(email, password);
      setMessage("✅ Login successful.");
      navigate("/home");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setMessage("❌ No account found. Please sign up.");
      } else if (error.code === "auth/wrong-password") {
        setMessage("❌ Incorrect password.");
      } else if (error.code === "auth/email-not-verified") {
        setMessage("⚠️ Please verify your email before logging in.");
      } else {
        setMessage("❌ " + (error.message || "Login failed. Try again."));
      }
    }
  };

  return (
    <div className="auth-box">
      <h2>AI Health Assistant</h2>

      {message && (
        <p style={{ marginBottom: "10px", color: "#d9534f" }}>{message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      <button onClick={googleLogin} style={{ marginTop: "10px" }}>
        Login with Google
      </button>

      <p style={{ marginTop: "10px" }}>
        Don’t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
