import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE_URL, { getProfile } from "../../config/api";
import MobileHeader from "../../components/MobileHeader";

// Assets v2
import banner1 from "../../assets/v2/home/corosel/corosel_1.svg";
import banner2 from "../../assets/v2/home/corosel/corosel_2.svg";
import banner3 from "../../assets/v2/home/corosel/corosel_3.png";

import iconTotalScans from "../../assets/v2/home/header/qr.svg";
import iconAlert from "../../assets/v2/home/header/warning.svg";
import iconCounterfeit from "../../assets/v2/home/header/dangerous.svg";
import iconTopBrands from "../../assets/v2/home/category/Group.svg";
import iconScanHistory from "../../assets/v2/home/category/Vector.svg";

import statusFake from "../../assets/v2/history/dangerous.svg";
import statusWarning from "../../assets/v2/history/warning.svg";
// Fallback for valid status as v2 might not have it or it's named differently
import statusValid from "../../assets/logo.svg";

export default function Home() {
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    authentiks: 0,
    counterfeit: 0,
    alert: 0,
  });
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [banner1, banner2, banner3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        const [statsRes, historyRes, profileData] = await Promise.all([
          fetch(`${API_BASE_URL}/scan/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/scan/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getProfile(token).catch(() => null),
        ]);

        // Check if user has completed their profile
        if (profileData && !profileData.name) {
          setIsProfileIncomplete(true);
          
          // Smart interval logic - don't force, show at increasing intervals
          const lastDismissed = localStorage.getItem("profilePromptLastDismissed");
          const dismissCount = parseInt(localStorage.getItem("profilePromptDismissCount") || "0");
          
          if (!lastDismissed) {
            // First time - show the prompt
            setShowProfilePrompt(true);
          } else {
            const lastDismissedTime = parseInt(lastDismissed);
            const now = Date.now();
            const daysSinceDismissed = (now - lastDismissedTime) / (1000 * 60 * 60 * 24);
            
            // Progressive intervals: 1 day, 2 days, 3 days, then 7 days
            let intervalDays = 1;
            if (dismissCount === 1) intervalDays = 2;
            else if (dismissCount === 2) intervalDays = 3;
            else if (dismissCount >= 3) intervalDays = 7;
            
            if (daysSinceDismissed >= intervalDays) {
              setShowProfilePrompt(true);
            }
          }
        }

        // Handle stats
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({
            totalScans: data.totalScans || 0,
            authentiks: data.authentiks || 0,
            counterfeit: data.counterfeit || 0,
            alert: data.alert || 0,
          });
        }

        // Handle history
        if (historyRes.ok) {
          const data = await historyRes.json();
          const slicedData = data.slice(0, 10);

          const mappedData = slicedData.map((item) => {
            const dateObj = new Date(item.createdAt);

            const day = String(dateObj.getDate()).padStart(2, "0");
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const year = String(dateObj.getFullYear()).slice(-2);

            const timeStr = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            let title = "Authentic Product";
            let icon = statusValid;
            let statusColor = "text-[#214B80]";

            if (item.status === "FAKE") {
              title = "Fake or Counterfeit";
              icon = statusFake;
              statusColor = "text-red-600";
            } else if (
              item.status === "ALREADY_USED" ||
              item.status === "DUPLICATE"
            ) {
              title = "Duplicate Scan";
              icon = statusWarning;
              statusColor = "text-amber-500";
            } else {
              title = item.productName || "Herbtox+";
            }

            return {
              id: item._id,
              title,
              date: `${day}/${month}/${year}`,
              time: timeStr,
              icon,
              statusColor,
            };
          });

          setRecentScans(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch home data:", err);
      }
    };

    fetchAllData();
  }, []);

  console.log("Home stats:", recentScans);

  const handleSkipProfile = () => {
    // Save timestamp when dismissed
    localStorage.setItem("profilePromptLastDismissed", Date.now().toString());
    
    // Increment dismiss count for progressive intervals
    const currentCount = parseInt(localStorage.getItem("profilePromptDismissCount") || "0");
    localStorage.setItem("profilePromptDismissCount", (currentCount + 1).toString());
    
    setShowProfilePrompt(false);
  };

  const handleScanClick = () => {
    // Always allow scanning - don't force profile completion
    navigate("/scan");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col relative w-full h-full overflow-hidden">
      {/* Header */}
      <MobileHeader
        onLeftClick={() => navigate("/profile")}
        onNotificationClick={() => navigate("/notifications")}
        leftIcon={
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        }
      />

      <div className="flex-1 overflow-y-auto pb-24 bg-[#F8F9FA]">
        {/* Welcome Text */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-[#6F6F6F] text-[15px] font-medium mb-1">
            Welcome to Authentiks
          </p>
          <h2 className="text-[#257DD4] font-extrabold text-[18px] leading-tight">
            {recentScans.length > 0
              ? "Stay Protected"
              : "A Product Authentication Platform"}
          </h2>
        </div>

        {/* Banner Carousel */}
        <div className="mt-2 mb-4 mx-4">
          <div className="relative rounded-[24px] overflow-hidden bg-black shadow-lg aspect-[340/115]">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`transition-opacity duration-700 ease-in-out absolute inset-0 ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={banner}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-4 flex justify-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-[#0D4E96] w-6"
                    : "bg-gray-300 w-2.5"
                }`}
              />
            ))}
          </div>
        </div>

        {recentScans.length > 0 ? (
          <>
            <ScanQrCodeButton onScanClick={handleScanClick} />
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 px-4 mb-6">
              <StatsCard
                icon={iconTotalScans}
                count={String(stats.totalScans)}
                label="Total Scans"
              />
              <StatsCard
                icon={statusValid}
                count={String(stats.authentiks)}
                label="Verify"
                isLogo={true}
              />
              <StatsCard
                icon={iconAlert}
                count={String(stats.alert)}
                label="Alert"
                color="text-amber-500"
              />
              <StatsCard
                icon={iconCounterfeit}
                count={String(stats.counterfeit)}
                label="Counterfeit"
                color="text-red-500"
              />
            </div>

            {/* Recent Scans Section */}
            <div className="px-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#0D4E96] text-[16px] font-black flex items-center gap-2">
                  Recent Scans
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2CA4D6] animate-pulse" />
                </h3>
                <button 
                  onClick={() => navigate('/scan-history')}
                  className="text-[#2CA4D6] text-[12px] font-bold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="flex flex-col gap-3.5">
                {recentScans.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No recent scans found.
                  </p>
                ) : (
                  recentScans.slice(0, 5).map((scan, index) => (
                    <div
                      key={scan.id}
                      className="relative group"
                      style={{
                        animation: `fadeSlideUp 0.5s ease-out forwards`,
                        animationDelay: `${index * 0.1}s`,
                        opacity: 0
                      }}
                    >
                      {/* Gradient background glow */}
                      <div className={`absolute inset-0 rounded-[20px] blur-lg opacity-20 transition-opacity duration-300 group-hover:opacity-30 ${
                        scan.statusColor.includes('red') 
                          ? 'bg-gradient-to-br from-red-400 to-red-600' 
                          : scan.statusColor.includes('amber') 
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                          : 'bg-gradient-to-br from-[#2CA4D6] to-[#0D4E96]'
                      }`} />
                      
                      {/* Main card */}
                      <div className="relative bg-white/95 backdrop-blur-sm rounded-[20px] p-4 flex items-center shadow-[0_4px_20px_rgba(13,78,150,0.12)] border border-white/50 hover:shadow-[0_8px_30px_rgba(13,78,150,0.2)] transition-all duration-300 hover:scale-[1.02]">
                        {/* Icon Container with gradient circle */}
                        <div className="relative w-[52px] h-[52px] flex-shrink-0 mr-4">
                          {/* Glow effect */}
                          <div className={`absolute inset-0 rounded-full blur-md opacity-40 ${
                            scan.statusColor.includes('red') 
                              ? 'bg-gradient-to-br from-red-400 to-red-600' 
                              : scan.statusColor.includes('amber') 
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                              : 'bg-gradient-to-br from-[#2CA4D6] to-[#0D4E96]'
                          }`} />
                          
                          {/* Icon background */}
                          <div className={`relative w-full h-full rounded-full flex items-center justify-center shadow-lg border-2 ${
                            scan.statusColor.includes('red') 
                              ? 'bg-gradient-to-br from-[#FFEBEE] to-[#FFCDD2] border-red-200/50' 
                              : scan.statusColor.includes('amber') 
                              ? 'bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3] border-amber-200/50'
                              : 'bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF] border-[#2CA4D6]/30'
                          }`}>
                            <img
                              src={scan.icon}
                              alt={scan.title}
                              className="w-[32px] h-[32px] object-contain"
                            />
                          </div>
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-black text-[15px] leading-tight mb-1.5 ${scan.statusColor}`}
                          >
                            {scan.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <p className="text-gray-600 text-[11px] font-semibold truncate">
                              {scan.date} • {scan.time}
                            </p>
                          </div>
                        </div>
                        
                        {/* Arrow indicator */}
                        <svg 
                          className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Animation keyframes */}
            <style>
              {`
                @keyframes fadeSlideUp {
                  from {
                    opacity: 0;
                    transform: translateY(15px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}
            </style>

            {/* Floating Scan Button */}
            {/* <div className="fixed bottom-[80px] left 0 right-0 px-6 z-30">
              <ScanQrCodeButton onScanClick={handleScanClick} />
            </div> */}
          </>
        ) : (
          <>
            {/* Scan Button Section */}
            <ScanQrCodeButton onScanClick={handleScanClick} />

            {/* Trusted By Card */}
            <div className="mx-5 mb-6 relative group">
              <style>
                {`
                  @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                  
                  @keyframes float-gentle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-4px); }
                  }
                `}
              </style>

              {/* Animated gradient background */}
              <div
                className="absolute inset-0 rounded-[24px] opacity-80"
                style={{
                  background:
                    "linear-gradient(135deg, #E8F4F9, #F0F9FF, #E1F5FE, #F0F9FF, #E8F4F9)",
                  backgroundSize: "300% 300%",
                  animation: "gradient-shift 6s ease infinite",
                }}
              />

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[#2CA4D6]/10 via-transparent to-[#0D4E96]/10 blur-xl" />

              {/* Content */}
              <div
                className="relative bg-white/90 backdrop-blur-sm rounded-[24px] p-5 flex items-center gap-5 border border-[#2CA4D6]/20 shadow-[0_10px_40px_rgba(44,164,214,0.15)] transition-all duration-300 hover:shadow-[0_15px_50px_rgba(44,164,214,0.25)]"
                style={{ animation: "float-gentle 3s ease-in-out infinite" }}
              >
                {/* Logo container with gradient border */}
                <div className="relative w-18 h-18 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2CA4D6] to-[#0D4E96] opacity-20 blur-md" />
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF] flex items-center justify-center border-2 border-[#2CA4D6]/30 shadow-lg">
                    <img
                      src="logo.svg"
                      alt="logo"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[#6E6D6B] text-[12px] font-bold mb-1 tracking-wide uppercase">
                    Trusted by
                  </p>
                  <h4
                    className="font-black text-[24px] leading-tight bg-gradient-to-r from-[#0D4E96] via-[#2CA4D6] to-[#0D4E96] bg-clip-text text-transparent"
                    style={{
                      backgroundSize: "200% auto",
                      animation: "gradient-shift 3s linear infinite",
                    }}
                  >
                    100+ Brands
                    <br />
                    2M+ Users
                  </h4>
                </div>

                {/* Sparkle accent */}
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#2CA4D6] opacity-50 animate-pulse" />
              </div>
            </div>

            {/* Why Scan Card */}
            <div className="mx-5 mb-8 relative group">
              {/* Gradient background layer */}
              <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[#E8F4F9]/50 via-white to-[#F0F9FF]/50 blur-sm" />

              {/* Main card */}
              <div className="relative bg-white/95 backdrop-blur-sm rounded-[20px] p-4 shadow-[0_15px_50px_rgba(13,78,150,0.12)] border border-[#0D4E96]/10 hover:shadow-[0_20px_60px_rgba(13,78,150,0.18)] transition-all duration-500">
                {/* Animated corner accents */}
                <div className="absolute top-1 right-1 w-12 h-12 bg-gradient-to-br from-[#2CA4D6]/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-1 left-1 w-12 h-12 bg-gradient-to-tr from-[#0D4E96]/10 to-transparent rounded-full blur-2xl" />

                <h3 className="relative text-[#0D4E96] text-[16px] font-black mb-3 flex items-center gap-2">
                  Why Scan with Authentiks?
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2CA4D6] animate-pulse" />
                </h3>

                <div className="relative flex flex-col gap-2.5">
                  <div className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform duration-300">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#2CA4D6]/20 rounded-lg blur-md" />
                      <div className="relative bg-gradient-to-br from-[#E8F4F9] to-[#D4F1F9] p-2 rounded-lg border border-[#2CA4D6]/20 shadow-sm">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#2CA4D6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-[#444] font-bold text-[12px] flex-1">
                      Direct Brand Verification
                    </span>
                  </div>

                  <div className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform duration-300">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#FFB300]/20 rounded-lg blur-md" />
                      <div className="relative bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3] p-2 rounded-lg border border-[#FFB300]/20 shadow-sm">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FFB300"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-[#444] font-bold text-[12px] flex-1">
                      Identify Reused QR Codes
                    </span>
                  </div>

                  <div className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform duration-300">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#F44336]/20 rounded-lg blur-md" />
                      <div className="relative bg-gradient-to-br from-[#FFEBEE] to-[#FFCDD2] p-2 rounded-lg border border-[#F44336]/20 shadow-sm">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#F44336"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-[#444] font-bold text-[12px] flex-1">
                      Detect Fake Products Instantly
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== Profile Completion Modal ===== */}
      {showProfilePrompt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleSkipProfile}
          />

          {/* Bottom Sheet */}
          <div
            className="relative w-full bg-white rounded-t-[32px] px-6 pt-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] animate-slide-up"
            style={{ animation: "slideUp 0.4s ease-out forwards" }}
          >
            {/* Drag Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

            {/* Illustration */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2CA4D6] to-[#0D4E96] flex items-center justify-center shadow-lg">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h3 className="text-center text-[#0D4E96] font-extrabold text-[22px] mb-2">
              Complete Your Profile
            </h3>

            {/* Description */}
            <p className="text-center text-[#777] text-[14px] font-medium mb-8 leading-relaxed">
              Add your name and details to personalize
              <br />
              your Authentiks experience
            </p>

            {/* Update Profile Button */}
            <button
              onClick={() => {
                // Reset prompt tracking when user chooses to update profile
                localStorage.removeItem("profilePromptLastDismissed");
                localStorage.removeItem("profilePromptDismissCount");
                setShowProfilePrompt(false);
                navigate("/edit-profile");
              }}
              className="w-full bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white font-bold py-4 rounded-[30px] text-[18px] shadow-[0_8px_24px_rgba(13,78,150,0.35)] active:scale-[0.97] transition-all mb-4"
            >
              Update Profile
            </button>

            {/* Skip Button */}
            <button
              onClick={handleSkipProfile}
              className="w-full text-[#999] font-bold text-[15px] py-3 active:text-[#666] transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({
  icon,
  count,
  label,
  color = "text-[#214B80]",
  isLogo = false,
}) {
  return (
    <div className="bg-white rounded-[16px] py-3 px-1 flex flex-col items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.08)] h-[90px]">
      <div className="mb-1.5 h-[24px] flex items-center">
        <img
          src={icon}
          alt={label}
          className={`${isLogo ? "w-5" : "w-6"} h-auto object-contain`}
        />
      </div>
      <span className={`font-bold text-[18px] leading-none mb-1 ${color}`}>
        {count}
      </span>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
        {label}
      </span>
    </div>
  );
}

function ActionButton({ icon, label, bgColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 ${bgColor} rounded-[20px] p-4 flex items-center justify-center shadow-md relative overflow-hidden h-[70px]`}
    >
      <div className="flex items-center gap-3 z-10">
        <div className="w-12 h-12 flex items-center justify-center">
          <img
            src={icon}
            alt={label}
            className="w-full h-full object-contain "
          />
        </div>
        <span className="text-white font-bold text-[16px] leading-tight text-left">
          {label.split(" ").map((word, i) => (
            <div key={i}>{word}</div>
          ))}
        </span>
      </div>
    </button>
  );
}

function ScanQrCodeButton({ onScanClick }) {
  const navigate = useNavigate();
  const handleClick = onScanClick || (() => navigate("/scan"));

  return (
    <div className="px-5 mb-6">
      <style>
        {`
          @keyframes wave-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(13, 78, 150, 0.3), 0 0 40px rgba(44, 164, 214, 0.2); }
            50% { box-shadow: 0 0 30px rgba(13, 78, 150, 0.5), 0 0 60px rgba(44, 164, 214, 0.3); }
          }
        `}
      </style>
      <button
        onClick={handleClick}
        className="w-full text-white text-[22px] font-bold h-[65px] rounded-[38px] flex items-center justify-center gap-4 active:scale-[0.97] transition-transform relative overflow-hidden group"
        style={{
          background:
            "linear-gradient(135deg, #0D4E96, #1a5fa8, #2CA4D6, #1a5fa8, #0D4E96)",
          backgroundSize: "300% 300%",
          animation:
            "wave-gradient 4s ease infinite, pulse-glow 3s ease-in-out infinite",
        }}
      >
        {/* Flowing shimmer overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
            transform: "skewX(-20deg)",
            animation: "shimmer 3s infinite",
          }}
        />

        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 z-0 bg-gradient-radial from-white/5 via-transparent to-transparent opacity-50" />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <path d="M7 7h.01M17 7h.01M17 17h.01M7 17h.01"></path>
          </svg>
          Scan to Verify
        </div>

        {/* Top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
      </button>
    </div>
  );
}
<style>
  {`
@keyframes shimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}

.skeleton {
  background: linear-gradient(
    to right,
    #eeeeee 8%,
    #dddddd 18%,
    #eeeeee 33%
  );
  background-size: 800px 104px;
  animation: shimmer 1.6s infinite linear;
}
`}
</style>;
