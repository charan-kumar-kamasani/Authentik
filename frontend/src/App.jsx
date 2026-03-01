import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LoadingProvider } from './context/LoadingContext';
import GlobalLoader from './components/GlobalLoader';

import Login from "./pages/mobile/Login";
import OTP from "./pages/mobile/OTP";
import Home from "./pages/mobile/Home";
import LandingPage from "./pages/web/LandingPage";
import WebAboutUs from "./pages/web/WebAboutUs";
import WebSolutions from "./pages/web/WebSolutions";
import WebPricing from "./pages/web/WebPricing";
import WebContactUs from "./pages/web/WebContactUs";
import Scan from "./pages/mobile/scan";
import Result from "./pages/mobile/Result";
import Profile from "./pages/mobile/profile";
import EditProfile from "./pages/mobile/EditProfile";
import ScanHistory from "./pages/mobile/ScanHistory";
import AboutUs from "./pages/mobile/AboutUs";
import TermsConditions from "./pages/mobile/TermsConditions";
import Policies from "./pages/mobile/Policies";
import Rewards from "./pages/mobile/Rewards";
import MobileLayout from "./components/MobileLayout";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
import AdminLayout from "./pages/admin/AdminLayout";
import GenerateQrs from "./pages/admin/GenerateQrs";
import QrManagement from "./pages/admin/QrManagement";
import AdminScannedQrs from "./pages/admin/AdminScannedQrs";
import AdminReports from "./pages/admin/AdminReports";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminPricePlans from "./pages/admin/AdminPricePlans";
import BillingCredits from "./pages/admin/BillingCredits";
import AdminSettings from "./pages/admin/AdminSettings";
import AuthDashboard from "./pages/admin/AuthDashboard";
import ReportProduct from "./pages/mobile/ReportProduct";
import MyReports from "./pages/mobile/MyReports";

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
      <LoadingProvider>
        <BrowserRouter>
          <GlobalLoader />
          <Routes>
            {/* Public Website */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about-us" element={<WebAboutUs />} />
            <Route path="/pricing" element={<WebPricing />} />
            <Route path="/solutions" element={<WebSolutions />} />
            <Route path="/contact-us" element={<WebContactUs />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <OrderManagement />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/generate-qrs"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <GenerateQrs />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/qr-management"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <QrManagement />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route path="/admin/scanned-qrs" element={<AdminRoute><AdminLayout><AdminScannedQrs /></AdminLayout></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminLayout><AdminReports /></AdminLayout></AdminRoute>} />
            <Route path="/admin/transactions" element={<AdminRoute><AdminLayout><AdminTransactions /></AdminLayout></AdminRoute>} />
            <Route path="/admin/price-plans" element={<AdminRoute><AdminLayout><AdminPricePlans /></AdminLayout></AdminRoute>} />
            <Route path="/admin/billing" element={<AdminRoute><AdminLayout><BillingCredits /></AdminLayout></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminLayout><AuthDashboard /></AdminLayout></AdminRoute>} />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
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
      </LoadingProvider>
    );
  }

  /* ================= MOBILE APP ================= */

  return (
    <LoadingProvider>
      <BrowserRouter>
        <GlobalLoader />
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

          {/* User Protected with Global Navbar */}
          <Route element={<PrivateRoute><MobileLayout /></PrivateRoute>}>
            <Route path="/home" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/scan-history" element={<ScanHistory />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/result/:status" element={<Result />} />
            <Route path="/report" element={<ReportProduct />} />
            <Route path="/my-reports" element={<MyReports />} />
          </Route>

          {/* Admin (mobile access optional) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <AdminRoute>
                <AdminLayout>
                  <OrderManagement />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/generate-qrs"
            element={
              <AdminRoute>
                <AdminLayout>
                  <GenerateQrs />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/qr-management"
            element={
              <AdminRoute>
                <AdminLayout>
                  <QrManagement />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route path="/admin/scanned-qrs" element={<AdminRoute><AdminLayout><AdminScannedQrs /></AdminLayout></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminLayout><AdminReports /></AdminLayout></AdminRoute>} />
          <Route path="/admin/transactions" element={<AdminRoute><AdminLayout><AdminTransactions /></AdminLayout></AdminRoute>} />
          <Route path="/admin/price-plans" element={<AdminRoute><AdminLayout><AdminPricePlans /></AdminLayout></AdminRoute>} />
          <Route path="/admin/billing" element={<AdminRoute><AdminLayout><BillingCredits /></AdminLayout></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminLayout><AuthDashboard /></AdminLayout></AdminRoute>} />

          <Route
            path="/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
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
    </LoadingProvider>
  );
}

