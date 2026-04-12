import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Building,
  UserPlus,
  FileText,
  Component,
  Search,
  BarChart2,
  Package,
  CreditCard,
  Tag,
  LogOut,
  ChevronRight,
  Box,
  ShieldCheck,
  Star,
  Ticket,
  LayoutDashboard,
  Receipt,
  Beaker,
  FormInput,
  Mail,
  User,
  Coins,
  Gift,
  Layers,
  Briefcase,
} from "lucide-react";
import GenerateQrs from "./GenerateQrs";
import QrManagement from "./QrManagement";
import API_BASE_URL, { getCreditsBalance } from "../../config/api";

// Sidebar item component
function SidebarItem({ label, onClick, icon: Icon, isActive, hasSubmenu }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300
          ${
            isActive
              ? "bg-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.3)] text-white"
              : "text-gray-500 hover:bg-blue-50/50 hover:text-blue-700"
          }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={18}
          className={isActive ? "text-white" : "text-gray-400"}
          strokeWidth={2.5}
        />
        {label}
      </div>
      {hasSubmenu && (
        <ChevronRight
          size={16}
          className={`transition-transform duration-300 ${isActive ? "rotate-90 text-white/80" : "text-gray-300"}`}
        />
      )}
    </button>
  );
}

// Users submenu
function UsersSubmenu({ activePath, locationSearch, navigateTo }) {
  const isParentActive =
    activePath === "/users" || activePath.startsWith("/users");
  if (!isParentActive) return null;
  const isSearch = (name) => locationSearch.includes(`tab=${name}`);
  const isList =
    isSearch("list") || (!locationSearch && activePath === "/users");

  return (
    <div className="mt-1 mb-2 px-3 pl-11 flex flex-col gap-1 border-l-2 border-blue-100/50 ml-6 pb-2 relative">
      <button
        onClick={() => navigateTo("/users?tab=list")}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${isList ? "bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-100/50" : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"}`}
      >
        <div className="flex items-center gap-2">
          <Users size={14} /> User List
        </div>
      </button>
      <button
        onClick={() => navigateTo("/users?tab=createBrand")}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSearch("createBrand") ? "bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-100/50" : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"}`}
      >
        <div className="flex items-center gap-2">
          <Building size={14} /> Create Company
        </div>
      </button>
      <button
        onClick={() => navigateTo("/users?tab=createStaff")}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSearch("createStaff") ? "bg-blue-50 text-blue-700 font-bold shadow-sm ring-1 ring-blue-100/50" : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"}`}
      >
        <div className="flex items-center gap-2">
          <UserPlus size={14} /> Create User
        </div>
      </button>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("adminRole") || "";
  const email = localStorage.getItem("adminEmail") || "";
  const [remainingCredits, setRemainingCredits] = useState(() => {
    const v =
      localStorage.getItem("availableCredits") ||
      localStorage.getItem("credits") ||
      localStorage.getItem("remainingCredits");
    return v ? Number(v) : null;
  });

  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("token");


  const activePath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminEmail");
    navigate("/enterprise");
  };

  const roleColors = {
    superadmin: "bg-gradient-to-br from-indigo-500 to-purple-600",
    admin: "bg-gradient-to-br from-blue-500 to-cyan-500",
    company: "bg-gradient-to-br from-emerald-400 to-teal-500",
    creator: "bg-gradient-to-br from-orange-400 to-red-500",
  };

  useEffect(() => {
    let mounted = true;
    const fetchCredits = async () => {
      if (!token) return;
      try {
        const bal = await getCreditsBalance(token);
        if (!mounted) return;
        // try common shapes: { qrCredits }, { credits }
        const val =
          (bal &&
            (bal.qrCredits || bal.credits || bal.available || bal.balance)) ||
          null;
        setRemainingCredits(val !== null ? Number(val) : null);
      } catch (e) {
        // keep localStorage fallback if API fails
        console.debug("Credits fetch failed:", e.message || e);
      }
    };
    if (
      role === "authorizer" ||
      role === "creator" ||
      role === "company" ||
      role === "admin" ||
      role === "superadmin"
    ) {
      fetchCredits();
    }
    return () => {
      mounted = false;
    };
  }, [role, token]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-slate-200/60 flex flex-col h-screen fixed top-0 left-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
        <div className="p-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">
                Authentiks<span className="text-blue-600">.</span>
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-bold">
                Enterprise panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {role === "creator" ? (
            <div className="space-y-1.5">
              <SidebarItem
                label="Generate QRs"
                onClick={() => navigate("/generate-qrs")}
                icon={Box}
                isActive={activePath === "/generate-qrs"}
              />
              <SidebarItem
                label="Product Manager"
                onClick={() => navigate("/product-manager")}
                icon={Package}
                isActive={activePath === "/product-manager"}
              />
              <SidebarItem
                label="Order History"
                onClick={() => navigate("/orders")}
                icon={FileText}
                isActive={activePath === "/orders"}
              />
              <SidebarItem
                label="Coupons & Rewards"
                onClick={() => navigate("/admin/coupons")}
                icon={Gift}
                isActive={activePath === "/admin/coupons"}
              />
            </div>
          ) : (
            <>
              <SidebarItem
                label="Dashboard"
                onClick={() => navigate("/admin/analytics")}
                icon={LayoutDashboard}
                isActive={activePath === "/admin/analytics"}
              />
              <SidebarItem
                label="Product Manager"
                onClick={() => navigate("/product-manager")}
                icon={Package}
                isActive={activePath === "/product-manager"}
              />
              <SidebarItem
                label="Order Management"
                onClick={() => navigate("/orders")}
                icon={FileText}
                isActive={activePath === "/orders"}
              />
              <SidebarItem
                label="Scanned QRs"
                onClick={() => navigate("/admin/scanned-qrs")}
                icon={Search}
                isActive={activePath === "/admin/scanned-qrs"}
              />
              <SidebarItem
                label="Reports"
                onClick={() => navigate("/admin/reports")}
                icon={BarChart2}
                isActive={activePath === "/admin/reports"}
              />
              <SidebarItem
                label="Product Reviews"
                onClick={() => navigate("/admin/reviews")}
                icon={Star}
                isActive={activePath === "/admin/reviews"}
              />
              <SidebarItem
                label="QR Inventory"
                onClick={() => navigate("/admin/dashboard")}
                icon={Package}
                isActive={activePath === "/admin/dashboard"}
              />
              <SidebarItem
                label="Coupons & Rewards"
                onClick={() => navigate("/admin/coupons")}
                icon={Gift}
                isActive={activePath === "/admin/coupons"}
              />

              {["superadmin", "admin"].includes(role) && (
                <SidebarItem
                  label="Sales Leads"
                  onClick={() => navigate("/admin/leads")}
                  icon={Briefcase}
                  isActive={activePath === "/admin/leads"}
                />
              )}

              {["superadmin"].includes(role) && (
                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Billing & Pricing
                  </p>
                  <div className="space-y-1.5">
                    <SidebarItem
                      label="Transactions"
                      onClick={() => navigate("/admin/transactions")}
                      icon={CreditCard}
                      isActive={activePath === "/admin/transactions"}
                    />
                    <SidebarItem
                      label="Price Plans"
                      onClick={() => navigate("/admin/price-plans")}
                      icon={Tag}
                      isActive={activePath === "/admin/price-plans"}
                    />
                    <SidebarItem
                      label="QR Volume Pricing"
                      onClick={() => navigate("/admin/qr-pricing")}
                      icon={Layers}
                      isActive={activePath === "/admin/qr-pricing"}
                    />
                  </div>
                </div>
              )}

              {["superadmin", "admin"].includes(role) && (
                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Configuration
                  </p>
                  <div className="space-y-1.5">
                    {["superadmin"].includes(role) && (
                      <SidebarItem
                        label="Settings"
                        onClick={() => navigate("/admin/settings")}
                        icon={Ticket}
                        isActive={activePath === "/admin/settings"}
                      />
                    )}
                    {["superadmin"].includes(role) && (
                      <SidebarItem
                        label="Test Accounts"
                        onClick={() => navigate("/admin/test-accounts")}
                        icon={Beaker}
                        isActive={activePath === "/admin/test-accounts"}
                      />
                    )}
                    <SidebarItem
                      label="QR Form Config"
                      onClick={() => navigate("/admin/form-config")}
                      icon={FormInput}
                      isActive={activePath === "/admin/form-config"}
                    />
                  </div>
                </div>
              )}

              {["company", "authorizer"].includes(role) && (
                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Billing
                  </p>
                  <div className="space-y-1.5">
                    <SidebarItem
                      label="Credits & Billing"
                      onClick={() => navigate("/admin/billing")}
                      icon={CreditCard}
                      isActive={activePath === "/admin/billing"}
                    />
                    <SidebarItem
                      label="Transactions"
                      onClick={() => navigate("/admin/transactions")}
                      icon={Receipt}
                      isActive={activePath === "/admin/transactions"}
                    />
                  </div>
                </div>
              )}

              {["superadmin", "admin", "company"].includes(role) && (
                <div className="pt-4 pb-2">
                  <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Team & Access
                  </p>
                  <div className="space-y-1.5">
                    {role === "superadmin" && (
                      <>
                        <SidebarItem
                          label="Mobile Users"
                          onClick={() => navigate("/users?tab=user")}
                          icon={Users}
                          isActive={activePath === "/users" && location.search.includes("tab=user")}
                        />
                        <SidebarItem
                          label="Companies"
                          onClick={() => navigate("/users?tab=brand")}
                          icon={Building}
                          isActive={activePath === "/users" && location.search.includes("tab=brand")}
                        />
                      </>
                    )}
                    <SidebarItem
                      label="User Management"
                      onClick={() => navigate("/users")}
                      icon={Users}
                      isActive={
                        activePath === "/users" &&
                        (!location.search || (!location.search.includes("tab=user") && !location.search.includes("tab=brand")))
                      }
                      hasSubmenu={true}
                    />
                    <UsersSubmenu
                      activePath={activePath}
                      locationSearch={location.search}
                      navigateTo={(to) => navigate(to)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Logout button below menu tabs */}
        <div className="px-4 pb-6">
          <SidebarItem
            label="Log out"
            onClick={handleLogout}
            icon={LogOut}
            isActive={false}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] p-8 md:p-12 min-h-screen">
        {/* Fixed top header (aligned with sidebar) */}
        <div className="fixed left-[280px] right-0 top-0 z-30">
          <div className="bg-white p-2 shadow-sm flex items-center">
            {/* left: avatar only */}

            {/* right: avatar, email/role and credits grouped */}
            <div className="ml-auto flex items-center gap-6 px-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${roleColors[role] || roleColors.company}`}
                >
                  {email ? email.charAt(0).toUpperCase() : role?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-slate-800">{email || 'Administrator'}</div>
                  <div className="text-xs text-slate-500 capitalize">{role || 'Account'}</div>
                </div>
              </div>

              {(role === 'authorizer' || role === 'creator' || remainingCredits !== null) && (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg">
                  <Coins size={16} className="text-blue-600" />
                  <div className="text-sm text-slate-700 font-semibold">Credits</div>
                  <div className="text-blue-600 font-black ml-2">{remainingCredits !== null ? remainingCredits.toLocaleString() : '-'}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spacer to offset fixed header height */}
        <div className="h-20" />

        <div className="w-full h-full animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `,
        }}
      />
    </div>
  );
}
