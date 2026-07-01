import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { getProfile } from "../../config/api";
import MobileNavbar from "../../components/MobileNavbar";
import { 
  Settings, 
  ChevronRight, 
  Calendar, 
  ShieldCheck, 
  ScanLine, 
  AlertTriangle, 
  ShieldAlert, 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Gift, 
  HelpCircle, 
  LogOut,
  FileText,
  FileKey
} from "lucide-react";

// Authentiks Logo SVG
const LogoShield = () => (
  <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 18 L26 24 V38 C26 51 34 62 40 66 C46 62 54 51 54 38 V24 L40 18 Z" fill="#105DE4" />
    <path d="M40 18 L26 24 V38 C26 51 34 62 40 66 C46 62 54 51 54 38 V24 L40 18 Z" fill="url(#paint0_linear)" />
    <path d="M34 40 L38 44 L47 34" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="paint0_linear" x1="26" y1="18" x2="54" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F8BFF" />
        <stop offset="1" stopColor="#0B42A5" />
      </linearGradient>
    </defs>
  </svg>
);

// Verified Badge
const VerifiedBadge = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#105DE4" />
    <path d="M7.5 12.5L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    email: "",
    memberSince: "",
    profileImage: null,
  });
  const [activityStats, setActivityStats] = useState({
    totalScans: 0,
    verified: 0,
    alerts: 0,
    counterfeit: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch profile data
    const fetchProfileData = async () => {
      try {
        const data = await getProfile(token);
        const createdAt = data.createdAt ? new Date(data.createdAt) : null;
        const memberSince = createdAt
          ? createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : "";

        setProfileData({
          name: data.name || "User",
          phone: data.mobile || "",
          email: data.email || "",
          memberSince,
          profileImage: data.profileImage || null,
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    // Fetch scan stats for activity overview
    const fetchScanStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/scan/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setActivityStats({ 
            totalScans: data.totalScans || 0, 
            verified: data.authentiks || 0, 
            alerts: data.alert || 0, 
            counterfeit: data.counterfeit || 0 
          });
        }
      } catch (error) {
        console.error("Failed to load scan stats", error);
      }
    };

    fetchProfileData();
    fetchScanStats();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      navigate("/");
    }
  };

  const menuItems = [
    { icon: User, title: "Personal Information", subtitle: "Name, email, phone number", action: () => navigate("/edit-profile") },
    { icon: Bell, title: "Notifications", subtitle: "Manage your notification preferences", action: () => navigate("/notifications") },
    { icon: Shield, title: "Trusted Brands", subtitle: "Brands you interact with", action: () => navigate("/home") },
    { icon: Gift, title: "Rewards & Offers", subtitle: "View your rewards and offers", action: () => navigate("/rewards") },
    { icon: FileText, title: "My Reports", subtitle: "View your submitted reports", action: () => navigate("/my-reports") },
    { icon: FileText, title: "Terms & Conditions", subtitle: "Read our terms of service", action: () => navigate("/terms-conditions") },
    { icon: FileKey, title: "Privacy Policy", subtitle: "Review our privacy policies", action: () => navigate("/privacy-policy") },
    { icon: HelpCircle, title: "Help & Support", subtitle: "FAQs, contact us, support tickets", action: () => navigate("/support") },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-[90px] relative">
      {/* Blue Background Header */}
      <div className="absolute top-0 left-0 right-0 h-[280px] bg-gradient-to-b from-[#092B6B] to-[#105DE4] rounded-b-[40px] z-0 overflow-hidden">
        {/* Subtle background rings/patterns */}
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] border-[1px] border-white/5 rounded-full" />
        <div className="absolute top-[-10%] right-[-5%] w-[250px] h-[250px] border-[1px] border-white/5 rounded-full" />
        <div className="absolute top-[0%] right-[0%] w-[200px] h-[200px] border-[1px] border-white/5 rounded-full" />
      </div>

      <div className="relative z-10 px-4 pt-12">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LogoShield />
            <div>
              <h1 className="text-white text-[22px] font-bold leading-tight">Authentiks</h1>
              <p className="text-blue-100 text-[12px] font-medium">Trusted. Verified. Protected.</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 text-white">
            <Settings size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] mb-6 border border-slate-100">
          <div className="flex gap-4 items-center mb-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-[84px] h-[84px] bg-[#EBF2FF] rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                {profileData.profileImage ? (
                  <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-[#105DE4]" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 shadow-sm rounded-full bg-white">
                <VerifiedBadge />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-[#0B1E36] text-[20px] font-bold leading-tight truncate mb-1">
                {profileData.name}
              </h2>
              <div className="inline-flex items-center gap-1 bg-[#F0F5FF] text-[#105DE4] px-2 py-0.5 rounded-[6px] mb-2">
                <ShieldCheck size={12} strokeWidth={3} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
              </div>
              <p className="text-[#0B1E36] text-[13px] font-bold mb-0.5 truncate">{profileData.phone}</p>
              <p className="text-[#64748B] text-[12px] font-medium truncate">{profileData.email}</p>
            </div>
            
            <button onClick={() => navigate("/edit-profile")} className="shrink-0 text-slate-400 active:bg-slate-100 p-2 rounded-full transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="h-[1px] bg-slate-100 w-full mb-4" />

          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#105DE4]">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[#64748B] text-[10px] font-medium">Member Since</p>
                <p className="text-[#0B1E36] text-[12px] font-bold">{profileData.memberSince}</p>
              </div>
            </div>
            
            <div className="w-[1px] h-8 bg-slate-100" />

            <div className="flex items-center gap-3 pr-4">
              <div className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#105DE4]">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-[#64748B] text-[10px] font-medium">Account Security</p>
                <p className="text-[#22C55E] text-[12px] font-bold">Strong</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-3 px-1">
            <h3 className="text-[#0B1E36] text-[15px] font-bold">Your Activity Overview</h3>
            {/* <button className="text-[#105DE4] text-[12px] font-bold flex items-center">
              View All <ChevronRight size={14} className="ml-0.5" />
            </button> */}
          </div>
          
          <div className="bg-white rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#F0F5FF] flex items-center justify-center mb-2">
                  <ScanLine size={20} className="text-[#105DE4]" />
                </div>
                <span className="text-[#0B1E36] text-[16px] font-bold leading-none mb-1">{activityStats.totalScans}</span>
                <span className="text-[#64748B] text-[10px] font-medium text-center">Total Scans</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-2">
                  <ShieldCheck size={20} className="text-[#22C55E]" />
                </div>
                <span className="text-[#0B1E36] text-[16px] font-bold leading-none mb-1">{activityStats.verified}</span>
                <span className="text-[#64748B] text-[10px] font-medium text-center">Verified</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#FFF7ED] flex items-center justify-center mb-2">
                  <AlertTriangle size={20} className="text-[#F97316]" />
                </div>
                <span className="text-[#0B1E36] text-[16px] font-bold leading-none mb-1">{activityStats.alerts}</span>
                <span className="text-[#64748B] text-[10px] font-medium text-center">Alerts</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-2">
                  <ShieldAlert size={20} className="text-[#EF4444]" />
                </div>
                <span className="text-[#0B1E36] text-[16px] font-bold leading-none mb-1">{activityStats.counterfeit}</span>
                <span className="text-[#64748B] text-[10px] font-medium text-center">Counterfeit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center p-4 active:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center shrink-0 mr-4">
                  <Icon size={18} className="text-[#105DE4]" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-[#0B1E36] text-[14px] font-bold mb-0.5">{item.title}</h4>
                  <p className="text-[#64748B] text-[12px] font-medium truncate">{item.subtitle}</p>
                </div>
                <ChevronRight size={18} className="text-slate-400 shrink-0" />
              </button>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-4 active:bg-slate-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0 mr-4">
              <LogOut size={18} className="text-[#EF4444]" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h4 className="text-[#EF4444] text-[14px] font-bold mb-0.5">Logout</h4>
              <p className="text-[#64748B] text-[12px] font-medium truncate">Sign out from your account</p>
            </div>
            <ChevronRight size={18} className="text-slate-400 shrink-0" />
          </button>
        </div>
      </div>

      <MobileNavbar />
    </div>
  );
}
