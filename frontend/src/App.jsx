import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import OTP from "./pages/OTP";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import WebAboutUs from "./pages/WebAboutUs";
import WebSolutions from "./pages/WebSolutions";
import WebContactUs from "./pages/WebContactUs";
import Scan from "./pages/scan";
import Result from "./pages/Result";
import Profile from "./pages/profile";
import EditProfile from "./pages/EditProfile";
import ScanHistory from "./pages/ScanHistory";
import AboutUs from "./pages/AboutUs";
import TermsConditions from "./pages/TermsConditions";
import Policies from "./pages/Policies";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import OrderManagement from "./pages/OrderManagement";
import UserManagement from "./pages/UserManagement";

/* ================= AUTH GUARDS ================= */

// User private route
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

// User public route
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/home" replace /> : children;
}

// Admin private route
function AdminRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? children : <Navigate to="/admin" replace />;
}

/* ================= APP ================= */

export default function App() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= DESKTOP (WEBSITE + ADMIN) ================= */

  if (!isMobile) {
    return (
      <BrowserRouter>
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about-us" element={<WebAboutUs />} />
          <Route path="/solutions" element={<WebSolutions />} />
          <Route path="/contact-us" element={<WebContactUs />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <AdminRoute>
                <OrderManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />

          {/* Smart fallback */}
          <Route
            path="*"
            element={
              window.location.pathname.startsWith("/admin")
                ? <Navigate to="/admin" replace />
                : <Navigate to="/" replace />
            }
          />
        </Routes>
      </BrowserRouter>
    );
  }

  /* ================= MOBILE APP ================= */

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/otp"
          element={
            <PublicRoute>
              <OTP />
            </PublicRoute>
          }
        />

        {/* User Protected */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/scan"
          element={
            <PrivateRoute>
              <Scan />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/scan-history"
          element={
            <PrivateRoute>
              <ScanHistory />
            </PrivateRoute>
          }
        />

        <Route
          path="/about-us"
          element={
            <PrivateRoute>
              <AboutUs />
            </PrivateRoute>
          }
        />

        <Route
          path="/terms-conditions"
          element={
            <PrivateRoute>
              <TermsConditions />
            </PrivateRoute>
          }
        />

        <Route
          path="/policies"
          element={
            <PrivateRoute>
              <Policies />
            </PrivateRoute>
          }
        />

        <Route
          path="/result/:status"
          element={
            <PrivateRoute>
              <Result />
            </PrivateRoute>
          }
        />

        {/* Admin (mobile access optional) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <AdminRoute>
              <OrderManagement />
            </AdminRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />

        {/* Smart fallback */}
        <Route
          path="*"
          element={
            window.location.pathname.startsWith("/admin")
              ? <Navigate to="/admin" replace />
              : <Navigate to="/" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
