import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LoadingProvider } from './context/LoadingContext';
import { ConfirmProvider } from './components/ConfirmModal';
import { HelmetProvider } from 'react-helmet-async';

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
import WebSecurityPolicy from "./pages/web/WebSecurityPolicy";
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
import Support from "./pages/mobile/Support";
import DemoReport from "./pages/mobile/DemoReport";
import DemoResult from "./pages/mobile/DemoResult";
import Warranty from "./pages/mobile/Warranty";
import RaiseClaim from "./pages/mobile/RaiseClaim";
import UpdateWarranty from "./pages/mobile/UpdateWarranty";

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
import WarrantyClaims from "./pages/admin/WarrantyClaims";

// Scroll to top on navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Token verification hook
function useTokenVerification(tokenKey) {
  const [status, setStatus] = useState("loading"); // "loading", "verified", "unauthorized", "server_error"
  const token = localStorage.getItem(tokenKey);

  useEffect(() => {
    if (!token) {
      setStatus("unauthorized");
      return;
    }
    
    // Use the API_BASE_URL environment variable correctly
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://authentik-8p39.vercel.app";
    
    fetch(`${baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.ok) {
        setStatus("verified");
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(tokenKey);
        if (tokenKey === 'adminToken') {
            localStorage.removeItem('adminRole');
            localStorage.removeItem('adminEmail');
        }
        setStatus("unauthorized");
      } else {
        setStatus("server_error");
      }
    })
    .catch(() => {
      setStatus("server_error");
    });
  }, [token, tokenKey]);

  return { status, token };
}

// Error Screen Component
function ServerErrorScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-5">
         <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Service Unavailable</h2>
      <p className="text-slate-500 font-medium max-w-md">We are currently experiencing connection issues with our servers. Please try again in a moment.</p>
      <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold tracking-wide hover:bg-blue-700 active:scale-95 transition-all shadow-md">
        Try Again
      </button>
    </div>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  );
}

// User private route
function PrivateRoute({ children }) {
  const { status, token } = useTokenVerification("token");
  const location = useLocation();
  
  if (status === "loading") return <LoadingScreen />;
  if (status === "server_error") return <ServerErrorScreen />;

  if (status === "unauthorized" || !token) {
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
  const { status, token } = useTokenVerification("adminToken");

  if (status === "loading") return <LoadingScreen />;
  if (status === "server_error") return <ServerErrorScreen />;

  if (status === "unauthorized" || !token) {
    return <Navigate to="/enterprise" replace />;
  }
  
  return children;
}

/* ================= APP ================= */

export default function App() {
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const isDemoRoute = (window.location.pathname === '/scan' && ['DEMO-GENUINE-QR', 'DEMO-DUPLICATE-QR', 'DEMO-FAKE-QR', 'DEMO-INACTIVE-QR'].includes(code)) || window.location.pathname === '/demo-report';
    
    if (isDemoRoute) {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="/scan" element={<DemoResult code={code} />} />
            <Route path="/demo-report" element={<DemoReport />} />
          </Routes>
        </BrowserRouter>
      );
    }
  }

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
      <HelmetProvider>
      <LoadingProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <ScrollToTop />
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
            <Route path="/security-policy" element={<WebSecurityPolicy />} />
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
            <Route path="/admin/warranty-claims" element={<AdminRoute><AdminLayout><WarrantyClaims /></AdminLayout></AdminRoute>} />
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
      </HelmetProvider>
    );
  }

  /* ================= MOBILE APP (PRODUCT MODE) ================= */

  return (
    <HelmetProvider>
    <LoadingProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <ScrollToTop />
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
          <Route path="/support" element={<Support />} />

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
            <Route path="/warranty" element={<Warranty />} />
            <Route path="/raise-claim/:id" element={<RaiseClaim />} />
            <Route path="/update-warranty/:id" element={<UpdateWarranty />} />
          </Route>

          {/* Smart fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </LoadingProvider>
    </HelmetProvider>
  );
}

