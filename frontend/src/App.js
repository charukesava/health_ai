import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Map from "./pages/Map";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import HealthChat from "./pages/HealthChat";
import Emergency from "./pages/Emergency";
import NearbyFinder from "./pages/NearbyFinder";
import Appointment from "./pages/Appointment";
import MyAppointment from "./pages/MyAppointment";
import HospitalAppointment from "./pages/HospitalAppointment";
import AdminUpdates from "./pages/AdminUpdates";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import { AuthProvider, useAuth } from "./context/AuthContext";

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: "30px" }}>Loading...</div>;
  }

  const hideNavbar =
    location.pathname === "/" || location.pathname === "/signup";

  return (
    <>
      {/* Navbar only after login and not on auth pages */}
      {user && !hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/health-chat"
          element={
            <ProtectedRoute>
              <HealthChat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nearby"
          element={
            <ProtectedRoute>
              <NearbyFinder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment"
          element={
            <ProtectedRoute>
              <Appointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute>
              <MyAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-appointments"
          element={
            <AdminRoute>
              <HospitalAppointment />
            </AdminRoute>
          }
        />
        <Route path="/map" element={<Map />} />

        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <Emergency />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminUpdates />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
