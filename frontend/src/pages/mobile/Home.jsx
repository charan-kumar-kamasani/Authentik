import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    authentiks: 0,
    counterfeit: 0,
    alert: 0,
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [banner1, banner2, banner3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/scan/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setStats({
            totalScans: data.totalScans || 0,
            authentiks: data.authentiks || 0,
            counterfeit: data.counterfeit || 0,
            alert: data.alert || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch scan stats:", err);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRecentScans = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/scan/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          // Take top 10 recent scans
          const slicedData = data.slice(0, 10);

          const mappedData = slicedData.map((item) => {
            const dateObj = new Date(item.createdAt);
            // Format: 13/01/26 - 05:30 PM
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = String(dateObj.getFullYear()).slice(-2);
            const timeStr = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            });
            const dateStr = `${day}/${month}/${year}`;

            let title = "Authentic Product";
            let icon = statusValid;
            let statusColor = "text-[#214B80]";

            if (item.status === "FAKE") {
              title = "Fake or Counterfeit";
              icon = statusFake;
              statusColor = "text-red-600";
            } else if (item.status === "ALREADY_USED" || item.status === "DUPLICATE") {
              title = "Duplicate Scan";
              icon = statusWarning;
              statusColor = "text-amber-500";
            } else {
              // ORIGINAL
              title = item.productName || "Herbtox+";
            }

            return {
              id: item._id,
              title,
              date: dateStr,
              time: timeStr,
              icon,
              statusColor
            };
          });
          setRecentScans(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch recent scans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentScans();
  }, []);

  console.log("Home stats:", stats);
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col relative w-full h-full overflow-hidden">
      {/* Header */}
      <MobileHeader
        onLeftClick={() => navigate("/profile")}
        leftIcon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        }
      />

      <div className="flex-1 overflow-y-auto pb-24 bg-[#F8F9FA]">
        {/* Welcome Text */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-[#6F6F6F] text-[14px] font-medium mb-1">Welcome to Authentiks</p>
          <h2 className="text-[#257DD4] font-extrabold text-[20px] leading-tight">
            A Product Authentication Platform
          </h2>
        </div>

        {/* Banner Carousel */}
        <div className="mt-4 mb-4 mx-4">
          <div className="relative rounded-[24px] overflow-hidden bg-black shadow-lg aspect-[340/115]">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`transition-opacity duration-700 ease-in-out absolute inset-0 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
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
                className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-[#0D4E96] w-6" : "bg-gray-300 w-2.5"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Scan Button Section */}
        <div className="px-5 mb-6">
          <style>
            {`
              @keyframes float1 {
                0% { transform: translate(-20%, -20%) scale(1); }
                50% { transform: translate(20%, 20%) scale(1.2); }
                100% { transform: translate(-20%, -20%) scale(1); }
              }
              @keyframes float2 {
                0% { transform: translate(20%, 20%) scale(1.2); }
                50% { transform: translate(-20%, -20%) scale(1); }
                100% { transform: translate(20%, 20%) scale(1.2); }
              }
            `}
          </style>
          <button
            onClick={() => navigate("/scan")}
            className="w-full bg-[#0D4E96] text-white text-[22px] font-bold h-[75px] rounded-[38px] shadow-[0_12px_28px_rgba(14,92,171,0.35)] flex items-center justify-center gap-4 active:scale-[0.97] transition-all relative overflow-hidden group"
          >
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 z-0">
              <div
                className="absolute top-[-20%] left-[-10%] w-[100%] h-[120%] rounded-full bg-[#0E5CAB] blur-[40px] opacity-70"
                style={{ animation: 'float1 6s infinite ease-in-out' }}
              />
              <div
                className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[120%] rounded-full bg-[#1F2642] blur-[40px] opacity-80"
                style={{ animation: 'float2 8s infinite ease-in-out' }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center gap-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <path d="M7 7h.01M17 7h.01M17 17h.01M7 17h.01"></path>
              </svg>
              Scan to Verify
            </div>

            {/* Gloss Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-30 z-20" />
          </button>
        </div>

        {/* Trusted By Card */}
        <div className="mx-5 mb-6 bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center gap-5 border border-gray-50">
          <div className="w-24 h-24 flex-shrink-0  rounded-full flex items-center justify-center">
            {/* SVG Shield with Checkmark */}
            {/* <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#2CA4D6" stroke="#2CA4D6" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg> */}
            <img src="logo.svg" alt="logo" />
          </div>
          <div>
            <p className="text-[#6E6D6B] text-[18px] font-bold mb-1">Trusted by</p>
            <h4 className="text-[#259DCF] font-black text-[24px] leading-tight">
              100+ Brands
              <br />
              2M+ Users
            </h4>
          </div>
        </div>

        {/* Why Scan Card */}
        <div className="mx-5 mb-8 bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-50">
          <h3 className="text-[#0D4E96] text-[19px] font-black mb-5">
            Why Scan with Authentiks?
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#E8F4F9] p-2 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2CA4D6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="text-[#555] font-bold text-[15px]">Direct Brand Verification</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#FFF8E1] p-2 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFB300" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <span className="text-[#555] font-bold text-[15px]">Identify Reused QR Codes</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#FFEBEE] p-2 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <span className="text-[#555] font-bold text-[15px]">Detect Fake Products Instantly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

