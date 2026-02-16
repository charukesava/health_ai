import React from "react";
import "../styles/AuthContainer.css";

function AuthContainer({ children }) {
  return (
    <div className="auth-bg">
      <div className="auth-card">{children}</div>
    </div>
  );
}

export default AuthContainer;
