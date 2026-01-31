import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import OTP from "./pages/OTP";
import Home from "./pages/Home";
import Scan from "./pages/scan"; // Import Scan component
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
import UserManagement from './pages/UserManagement';

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  // If user is already logged in, redirect them to home instead of showing login/otp
  return token ? <Navigate to="/home" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/otp" element={<PublicRoute><OTP /></PublicRoute>} />

        {/* Protected routes */}
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

        {/* Protected routes */}
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

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <OrderManagement />
            </PrivateRoute>
          }
        />

        <Route path="/users" element={<UserManagement />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
