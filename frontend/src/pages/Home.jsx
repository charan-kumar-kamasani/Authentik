import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";
import homeBanner from "../assets/home_banner.png";
import banner1 from "../assets/corosels/banner_1.jpg";
import banner2 from "../assets/corosels/banner_2.jpg";
import banner3 from "../assets/corosels/banner_3.jpg";
import navBrands from "../assets/nav_brands.png";
import navAuthentik from "../assets/nav_authentik.png";
import navHistory from "../assets/nav_history.png";
import statusFake from "../assets/recent_status_fake.png";
import statusValid from "../assets/recent_status_valid.png";
import statusDuplicate from "../assets/recent_status_duplicate.png";
import iconNotification from "../assets/icon_notification.png";

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
            const dateStr = dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY
            const timeStr = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            let title = "Authentic Product";
            let icon = statusValid;
            // Uniform background color as per previous mock, or could be dynamic
            let bgColor = "bg-[#2D9CDB]";

            if (item.status === "FAKE") {
              title = "Fake or Counterfeit";
              icon = statusFake;
            } else if (item.status === "ALREADY_USED") {
              title = "Duplicate Scan";
              icon = statusDuplicate;
            } else {
              // ORIGINAL
              title = item.productName || "Authentic Product";
            }

            return {
              id: item._id,
              title,
              date: dateStr,
              time: timeStr,
              icon,
              bgColor,
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
    <div className="min-h-screen bg-white font-sans flex flex-col relative w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white fixed top-0 left-0 right-0 z-50 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
        <button
          className="text-[#1B2B49] p-1"
          onClick={() => navigate("/profile")}
        >
          <svg
            width="22"
            height="22"
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
        </button>
        <h1
          className="text-[24px] font-bold tracking-tight text-[#1B2B49]"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
        >
          Authen<span className="text-[#2CA4D6]">tiks</span>
        </h1>
        <button className="text-[#1B2B49] p-1">
          <img
            src={iconNotification}
            alt="Notifications"
            className="w-5 h-5 object-contain"
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 pt-16">
        {/* Welcome Text */}
        {/* <div className="text-center py-2">
          <h2
            className="text-[#1B2B49] font-semibold text-[16px]"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
          >
            Welcome to Authentiks
          </h2>
        </div> */}

        {/* Banner */}
        <div className="mt-4 mb-4 mx-6">
          {/* Banner */}
          <div className="relative shadow-md rounded-2xl overflow-hidden bg-gray-100">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide
                    ? "block opacity-100"
                    : "hidden opacity-0"
                }`}
              >
                <img
                  src={banner}
                  alt={`Banner ${index + 1}`}
                  className="block max-w-full h-auto mx-auto object-contain"
                />
              </div>
            ))}
          </div>

          {/* Dots BELOW image */}
          <div className="mt-3 flex justify-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-gray-800 w-4" : "bg-gray-400 w-2"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Grid - Brands, Authentik, History */}
        <div className="flex justify-between px-6 gap-3 mb-4">
          <NavButton icon={navBrands} label="Brands" />
          {/* <NavButton icon={navAuthentik} label="Authentik" /> */}
          <NavButton
            icon={navHistory}
            label="History"
            onClick={() => navigate("/scan-history")}
          />
        </div>

        {/* Recent Scans Section */}
        <div className="px-5">
          <h3 className="text-[#1B2B49] text-[16px] font-bold mb-3">
            Recent Scans
          </h3>
          <div className="flex flex-col gap-2">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading recent scans...</p>
            ) : recentScans.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent scans found.</p>
            ) : (
              recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className={`rounded-[16px] px-3 py-2 flex items-center shadow-[0_4px_6px_rgba(0,0,0,0.15)] min-h-[70px]`}
                >
                  {/* Icon Container */}
                  <div
                    className={`w-[46px] h-[46px] rounded-full flex-shrink-0 flex items-center justify-center mr-3`}
                  >
                    <img
                      src={scan.icon}
                      alt={scan.title}
                      className="w-[100px] h-[100px] object-contain"
                    />
                  </div>
                  {/* Text Content */}
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-[15px] leading-tight mb-0.5">
                      {scan.title}
                    </h4>
                    <div className="text-[16px] font-semibold opacity-95">
                      <p className="leading-tight">Scanned On: {scan.date}</p>
                      <p className="leading-tight">Time: {scan.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Scan Button */}
      <div className="bg-white h-24">
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30 px-6">
          <button
            onClick={() => navigate("/scan")}
            className="w-full bg-[#1B2B49] text-[#F2C94C] text-[20px] font-bold py-3 rounded-[30px] shadow-[0_6px_12px_rgba(0,0,0,0.25)] flex items-center justify-center hover:bg-[#142036] transition-colors"
          >
            Scan QR Code
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, onClick }) {
  return (
    <button className="flex-1 group" onClick={onClick}>
      <div className="w-full bg-[#1B2B49] rounded-[16px] py-3 flex flex-col items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.25)] group-active:scale-95 transition-transform">
        <img src={icon} alt={label} className="w-13 h-13 object-contain" />
        <span className="text-white font-semibold text-[20px] mt-1.5">
          {label}
        </span>
      </div>
    </button>
  );
}
