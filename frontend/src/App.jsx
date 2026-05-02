import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LoadingProvider } from './context/LoadingContext';
import { ConfirmProvider } from './components/ConfirmModal';

import Login from "./pages/mobile/Login";
import OTP from "./pages/mobile/OTP";
import Home from "./pages/mobile/Home";
import LandingPage from "./pages/web/LandingPage";
import WebAboutUs from "./pages/web/WebAboutUs";
import WebPricing from "./pages/web/WebPricing";
import WebContactUs from "./pages/web/WebContactUs";
import WebProduct from "./pages/web/WebProduct";
import WebHowItWorks from "./pages/web/WebHowItWorks";
import WebIndustries from "./pages/web/WebIndustries";
import WebFAQs from "./pages/web/WebFAQs";
import WebPrivacyPolicy from "./pages/web/WebPrivacyPolicy";
import WebTermsConditions from "./pages/web/WebTermsConditions";
import WebLiveDemo from "./pages/web/WebLiveDemo";
import WebAIPulse from "./pages/web/WebAIPulse";
import WebProblem from "./pages/web/WebProblem";
import WebVerified from "./pages/web/WebVerified";
import Scan from "./pages/mobile/scan";
import Result from "./pages/mobile/Result";
import Profile from "./pages/mobile/profile";
import EditProfile from "./pages/mobile/EditProfile";
import ScanHistory from "./pages/mobile/ScanHistory";
import AboutUs from "./pages/mobile/AboutUs";
import TermsConditions from "./pages/mobile/TermsConditions";
import Policies from "./pages/mobile/Policies";
import Rewards from "./pages/mobile/Rewards";
import RewardDetail from "./pages/mobile/RewardDetail";
import MobileLayout from "./components/MobileLayout";
import MobileLanding from "./pages/mobile/MobileLanding";

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
import AdminTestAccounts from "./pages/admin/AdminTestAccounts";
import QrFormConfig from "./pages/admin/QrFormConfig";
import AuthDashboard from "./pages/admin/AuthDashboard";
import ReportProduct from "./pages/mobile/ReportProduct";
import MyReports from "./pages/mobile/MyReports";
import Notifications from "./pages/mobile/Notifications";
import ProductManager from "./pages/admin/ProductManager";
import AdminReviews from "./pages/admin/AdminReviews";
import ProductCoupons from "./pages/admin/ProductCoupons";
import AdminLeads from "./pages/admin/AdminLeads";
import QrPricingManagement from "./pages/admin/QrPricingManagement";
import AIPulseDashboard from "./pages/admin/AIPulseDashboard";

// User private route
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  
  if (!token) {
    // Save the intended destination (including query params) for redirect after login
    // Even though we force /home after login, we keep this for potential future use
    const redirectPath = `${location.pathname}${location.search}`;
    sessionStorage.setItem("redirectAfterLogin", redirectPath);
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// User public route
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  
  if (token) {
    // Always land on home tab after login as requested
    return <Navigate to="/home" replace />;
  }
  
  return children;
}

// Admin private route
function AdminRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? children : <Navigate to="/enterprise" replace />;
}

/* ================= APP ================= */

export default function App() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [appMode, setAppMode] = useState(() => {
    let mode = sessionStorage.getItem('appMode') || null;
    if (!mode && typeof window !== 'undefined' && window.innerWidth < 768) {
      if (window.location.pathname.startsWith('/scan')) {
        sessionStorage.setItem('appMode', 'product');
        mode = 'product';
      } else if (localStorage.getItem('token')) {
        sessionStorage.setItem('appMode', 'product');
        mode = 'product';
      }
    }
    return mode;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= DESKTOP (WEBSITE + ADMIN) OR "BRAND" MODE ON MOBILE ================= */

  if (!isMobile || appMode === 'brand') {
    return (
      <LoadingProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Routes>
            {/* Public Website */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/problem" element={<WebProblem />} />
            <Route path="/product" element={<WebProduct />} />
            <Route path="/ai-pulse" element={<WebAIPulse />} />
            <Route path="/how-it-works" element={<WebHowItWorks />} />
            <Route path="/verified" element={<WebVerified />} />
            <Route path="/industries" element={<WebIndustries />} />
            <Route path="/pricing" element={<WebPricing />} />
            <Route path="/about-us" element={<WebAboutUs />} />
            <Route path="/faqs" element={<WebFAQs />} />
            <Route path="/contact-us" element={<WebContactUs />} />
            <Route path="/privacy-policy" element={<WebPrivacyPolicy />} />
            <Route path="/terms-conditions" element={<WebTermsConditions />} />
            <Route path="/live-demo" element={<WebLiveDemo />} />

            {/* Admin */}
            <Route path="/enterprise" element={<AdminLogin />} />
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
            <Route path="/admin/test-accounts" element={<AdminRoute><AdminLayout><AdminTestAccounts /></AdminLayout></AdminRoute>} />
            <Route path="/admin/form-config" element={<AdminRoute><AdminLayout><QrFormConfig /></AdminLayout></AdminRoute>} />
            <Route path="/admin/leads" element={<AdminRoute><AdminLayout><AdminLeads /></AdminLayout></AdminRoute>} />
            <Route path="/admin/qr-pricing" element={<AdminRoute><AdminLayout><QrPricingManagement /></AdminLayout></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminLayout><AuthDashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/ai-pulse" element={<AdminRoute><AdminLayout><AIPulseDashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><AdminLayout><AdminReviews /></AdminLayout></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><ProductCoupons /></AdminLayout></AdminRoute>} />
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
            <Route
              path="/product-manager"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <ProductManager />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Smart fallback */}
            <Route
              path="*"
              element={
                window.location.pathname.startsWith("/enterprise")
                  ? <Navigate to="/enterprise" replace />
                  : <Navigate to="/" replace />
              }
            />
          </Routes>
        </BrowserRouter>
        </ConfirmProvider>
      </LoadingProvider>
    );
  }

  /* ================= MOBILE APP (PRODUCT MODE) ================= */

  return (
    <LoadingProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <Routes>
          {/* Mobile Specific Public Routes */}
          <Route
            path="/"
            element={
              !appMode ? (
                <MobileLanding onSelectMode={(mode) => {
                  sessionStorage.setItem('appMode', mode);
                  setAppMode(mode);
                }} />
              ) : (
                <PublicRoute>
                  <Login />
                </PublicRoute>
              )
            }
          />
          <Route
            path="/login"
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

          {/* Publicly accessible Mobile Information Pages */}
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<Policies />} />

          {/* User Protected with Global Navbar */}
          <Route element={<PrivateRoute><MobileLayout /></PrivateRoute>}>
            <Route path="/home" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/scan-history" element={<ScanHistory />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/rewards/:id" element={<RewardDetail />} />
            <Route path="/result/:status" element={<Result />} />
            <Route path="/report" element={<ReportProduct />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Smart fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </LoadingProvider>
  );
}

