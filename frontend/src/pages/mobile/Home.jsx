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
import logo from "../../assets/logo.svg"; // Fallback for Authentiks stats icon

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

  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [banner1, banner2, banner3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
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

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Welcome Text */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-[#666] text-[13px] font-bold mb-0 leading-none">Welcome</p>
          <h2 className="text-[#2CA4D6] font-bold text-[22px] leading-tight">
            Stay Protected
          </h2>
        </div>

        {/* Banner Carousel */}
        <div className="mt-2 mb-6 mx-4">
          <div className="relative rounded-[20px] overflow-hidden bg-black shadow-sm aspect-[340/150]">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`transition-opacity duration-700 ease-in-out absolute inset-0 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                <img
                  src={banner}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-contain opacity-90"
                />
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-3 flex justify-center gap-1.5">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-[#214B80] w-2 h-2" : "bg-gray-300 w-2 h-2"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 px-4 mb-6">
          <StatsCard icon={iconTotalScans} count="25" label="Total Scans" />
          <StatsCard icon={logo} count="14" label="Authentiks" isLogo={true} />
          <StatsCard icon={iconAlert} count="01" label="Alert" color="text-amber-500" />
          <StatsCard icon={iconCounterfeit} count="12" label="Counterfeit" color="text-red-500" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 px-4 mb-6">
          <ActionButton
            icon={iconTopBrands}
            label="Top Brands"
            bgColor="bg-[#2CA4D6]"
            onClick={() => { }}
          />
          <ActionButton
            icon={iconScanHistory}
            label="Scan History"
            bgColor="bg-[#2CA4D6]"
            onClick={() => navigate("/scan-history")}
          />
        </div>

        {/* Recent Scans Section */}
        <div className="px-4">
          <h3 className="text-[#666] text-[15px] font-bold mb-3">
            Recent Scans
          </h3>
          <div className="flex flex-col gap-3">
            {loading ? (
              <p className="text-gray-500 text-sm text-center py-4">Loading recent scans...</p>
            ) : recentScans.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No recent scans found.</p>
            ) : (
              recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="bg-white rounded-[16px] p-4 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                >
                  {/* Icon */}
                  <div className="w-[42px] h-[42px] flex-shrink-0 mr-4">
                    <img
                      src={scan.icon}
                      alt={scan.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Text Content */}
                  <div className="flex-1">
                    <h4 className={`font-bold text-[15px] leading-tight mb-1 ${scan.statusColor}`}>
                      {scan.title}
                    </h4>
                    <p className="text-[#777] text-[12px] font-medium">
                      Scanned On: {scan.date} - {scan.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Scan Button */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-30">
        <style>
          {`
            @keyframes goldSlash {
              0% { left: -100%; opacity: 0; }
              20% { opacity: 1; }
              50% { left: 200%; opacity: 0; }
              100% { left: 200%; opacity: 0; }
            }
          `}
        </style>
        <button
          onClick={() => navigate("/scan")}
          className="w-full bg-gradient-to-r from-[#0E5CAB] to-[#1F2642] text-white text-[20px] font-bold h-[65px] rounded-[35px] shadow-[0_8px_20px_rgba(14,92,171,0.4)] relative overflow-hidden transition-transform active:scale-[0.98]"
        >
          {/* Gold Flash Animation */}
          <div
            className="absolute top-[50%] left-[-100%] w-[8px] h-[400%] bg-gradient-to-r from-transparent to-[#FFD700] opacity-90 transform -translate-y-1/2 rotate-[-25deg]"
            style={{ animation: 'goldSlash 3s infinite ease-in-out' }}
          ></div>

          <div className="relative z-10 flex items-center justify-center gap-3 w-full h-full">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <path d="M3 14h1v7h6v-1M10 14v3"></path>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Scan QR
          </div>
        </button>
      </div>
    </div>
  );
}

function StatsCard({ icon, count, label, color = "text-[#214B80]", isLogo = false }) {
  return (
    <div className="bg-white rounded-[16px] py-3 px-1 flex flex-col items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.08)] h-[90px]">
      <div className="mb-1.5 h-[24px] flex items-center">
        <img src={icon} alt={label} className={`${isLogo ? 'w-5' : 'w-6'} h-auto object-contain`} />
      </div>
      <span className={`font-bold text-[18px] leading-none mb-1 ${color}`}>{count}</span>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{label}</span>
    </div>
  )
}

function ActionButton({ icon, label, bgColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 ${bgColor} rounded-[20px] p-4 flex items-center justify-center shadow-md relative overflow-hidden h-[70px]`}
    >
      <div className="flex items-center gap-3 z-10">
        <div className="w-8 h-8 flex items-center justify-center">
          <img src={icon} alt={label} className="w-full h-full object-contain " />
        </div>
        <span className="text-white font-bold text-[16px] leading-tight text-left">
          {label.split(' ').map((word, i) => <div key={i}>{word}</div>)}
        </span>
      </div>
    </button>
  )
}
