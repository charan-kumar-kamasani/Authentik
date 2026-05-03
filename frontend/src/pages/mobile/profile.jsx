import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationIcon from "../../assets/icon_notification.png";
import { getProfile } from "../../config/api";

// Profile Icons from v2
import UserAvatar from "../../assets/v2/profile/Group (2).svg";

// Menu Icons
import IconScanHistory from "../../assets/v2/profile/Vector (2).svg"; // Clock
import IconReports from "../../assets/v2/profile/Vector (5).svg"; // Document
import IconAboutUs from "../../assets/v2/profile/Group.svg"; // Info-like circle
import IconHelp from "../../assets/v2/profile/Vector (3).svg"; // Question mark
import IconShare from "../../assets/v2/profile/Vector (1).svg"; // Share
import IconTerms from "../../assets/v2/profile/Vector (4).svg"; // Document
import IconPolicies from "../../assets/v2/profile/Vector.svg"; // Shield
import IconLogout from "../../assets/v2/profile/Vector (6).svg"; // Power button
import MobileHeader from "../../components/MobileHeader";
import { Globe } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    profileImage: null,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await getProfile(token);
        setProfileData({
          name: data.name || "",
          profileImage: data.profileImage || null,
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfileData();
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Authentiks',
          text: 'Protect your brand with Authentiks - The most intelligent product authentication platform.',
          url: window.location.origin,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] font-sans flex flex-col overflow-hidden">

      {/* Header */}
      <div className="shrink-0">
        <MobileHeader
          onLeftClick={() => navigate("/profile")}
          leftIcon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          }
        />
      </div>

      {/* User Card - Compact */}
      <div className="mx-5 mt-1 mb-2 relative shrink-0">
        <div className="relative bg-gradient-to-br from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] rounded-[24px] p-4 shadow-xl flex flex-col items-center justify-center min-h-[130px] overflow-hidden border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          
          <div className="relative mb-2 z-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg relative p-[2px]">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                {profileData.profileImage ? (
                  <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <img src={UserAvatar} alt="Profile" className="w-8 h-8 object-contain opacity-80" />
                )}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ADE80] rounded-full border-2 border-white shadow-sm" />
          </div>

          <button
            onClick={() => navigate("/edit-profile")}
            className="relative z-20 bg-white px-6 py-1.5 rounded-full font-black text-[12px] shadow-md active:scale-95 transition-all"
          >
            <span className="bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] bg-clip-text text-transparent uppercase tracking-tight">
              {profileData.name || "Edit Profile"}
            </span>
          </button>
        </div>
      </div>

      {/* Menu List - Tight Layout to fit screen */}
      <div className="flex-1 flex flex-col px-5 pb-20 overflow-y-auto no-scrollbar">
        {[
          [
            { icon: IconScanHistory, text: "Scan History", action: () => navigate("/scan-history") },
            { icon: IconReports, text: "Reports", action: () => navigate("/my-reports") },
            { icon: IconScanHistory, text: "My Rewards", action: () => navigate("/rewards") }
          ],
          [
            { icon: IconAboutUs, text: "About Us", action: () => navigate("/about-us") },
            { icon: IconHelp, text: "Help & Support", action: () => navigate("/support") },
            { icon: IconShare, text: "Share", action: handleShare },
            { icon: Globe, text: "Go to Website", isLucide: true, action: () => {
                sessionStorage.setItem('appMode', 'brand');
                window.location.href = '/'; 
            }}
          ],
          [
            { icon: IconTerms, text: "Terms & Conditions", action: () => navigate("/terms-conditions") },
            { icon: IconPolicies, text: "Policies", action: () => navigate("/privacy-policy") }
          ]
        ].map((group, groupIndex) => (
          <div 
            key={groupIndex} 
            className="mb-1.5 flex flex-col shadow-md rounded-[18px] overflow-hidden border border-white/20 bg-gradient-to-br from-[#0D4E96] to-[#1a5fa8]"
          >
            {group.map((item, index) => {
              const isLast = index === group.length - 1;

              return (
                <div
                  key={index}
                  onClick={item.action}
                  className={`flex items-center justify-between py-2 px-5 cursor-pointer active:scale-[0.99] transition-all h-[44px] group
                    ${!isLast ? "border-b border-white/10" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[8px] bg-white/10 flex justify-center items-center">
                      {item.isLucide ? (
                        <item.icon size={14} className="text-white" />
                      ) : (
                        <img src={item.icon} alt={item.text} className="w-4 h-4 object-contain brightness-0 invert" />
                      )}
                    </div>
                    <span className="text-white text-[13px] font-black tracking-tight">{item.text}</span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Logout */}
        <div
          onClick={handleLogout}
          className="flex items-center justify-between py-2 px-5 mt-1 bg-white border-2 border-red-100 cursor-pointer active:scale-[0.99] transition-all rounded-[18px] shadow-sm h-[44px] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-[8px] bg-red-50 flex justify-center items-center">
              <img src={IconLogout} alt="Logout" className="w-4 h-4 object-contain" />
            </div>
            <span className="text-[#C41E3A] text-[13px] font-black uppercase tracking-tight">Logout</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C41E3A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer { animation: shimmer 4s infinite linear; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </div>
  );
}
