import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  // ⏳ WAIT UNTIL AUTH STATE IS RESOLVED
  if (loading) {
    return <div>Loading...</div>;
  }

  // 🔒 BLOCK IF NOT LOGGED IN OR NOT ADMIN
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // ✅ ALLOW ACCESS
  return children;
}

export default AdminRoute;
