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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] font-sans flex flex-col pb-10">

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

      {/* User Card - Blue & White Premium Design */}
      <div className="mx-5 mt-2 mb-6 relative">
        {/* Soft Blue Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D4E96] via-[#2CA4D6] to-[#0D4E96] rounded-[32px] blur-3xl opacity-20 animate-pulse" />
        
        {/* Card */}
        <div className="relative bg-gradient-to-br from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] rounded-[32px] p-8 shadow-[0_12px_40px_rgba(13,78,150,0.3)] flex flex-col items-center justify-center min-h-[200px] overflow-hidden border-2 border-white/30">
          {/* Animated shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          
          {/* Decorative soft circles */}
          <div className="absolute top-6 right-8 w-28 h-28 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-3xl" />
          <div className="absolute bottom-8 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#2CA4D6]/20 to-transparent blur-2xl" />
          
          {/* Blue sparkle dots */}
          <div className="absolute top-12 left-12 w-2 h-2 rounded-full bg-white opacity-60 animate-pulse" />
          <div className="absolute bottom-14 right-14 w-1.5 h-1.5 rounded-full bg-white opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-20 right-20 w-1 h-1 rounded-full bg-white opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Avatar Container */}
          <div className="relative mb-5 z-10">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.2)] relative">
              {/* Blue gradient ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2CA4D6] via-[#1a5fa8] to-[#0D4E96] p-[3px]">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                  {profileData.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={UserAvatar}
                      alt="Profile"
                      className="w-16 h-16 object-contain"
                      style={{ filter: 'brightness(0) saturate(100%) invert(42%) sepia(77%) saturate(496%) hue-rotate(166deg) brightness(93%) contrast(92%)' }}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Blue pulsing dot indicator */}
            <div className="absolute bottom-3 right-3 w-4 h-4 bg-gradient-to-br from-[#4ADE80] to-[#22C55E] rounded-full border-[3px] border-white shadow-lg animate-pulse" />
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => navigate("/edit-profile")}
            className="relative z-20 bg-white px-12 py-2.5 rounded-[30px] font-black text-[15px] shadow-[0_8px_24px_rgba(255,255,255,0.4)] hover:shadow-[0_12px_32px_rgba(255,255,255,0.5)] active:scale-[0.96] transition-all"
          >
            <span className="bg-gradient-to-r from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] bg-clip-text text-transparent">
              Profile
            </span>
          </button>
        </div>
      </div>

      {/* Menu List */}
      <div className="flex flex-col pb-8"
           style={{
             animation: 'fadeSlideUp 0.6s ease-out forwards',
             animationDelay: '0.2s',
             opacity: 0
           }}>

        {/* Render Menu Groups */}
        {[
          [
            { icon: IconScanHistory, text: "Scan History", action: () => navigate("/scan-history") },
            { icon: IconReports, text: "Reports", action: () => navigate("/my-reports") }
          ],
          [
            { icon: IconAboutUs, text: "About Us", action: () => navigate("/about-us") },
            { icon: IconHelp, text: "Help & Support", action: () => { } },
            { icon: IconShare, text: "Share", action: () => { } }
          ],
          [
            { icon: IconTerms, text: "Terms & Conditions", action: () => navigate("/terms-conditions") },
            { icon: IconPolicies, text: "Policies", action: () => navigate("/policies") }
          ]
        ].map((group, groupIndex) => (
          <div 
            key={groupIndex} 
            className="mx-5 mb-4 flex flex-col shadow-[0_6px_24px_rgba(13,78,150,0.12)] rounded-[28px] overflow-hidden border-2 border-white bg-white backdrop-blur-sm"
            style={{
              animation: `fadeSlideUp 0.5s ease-out forwards`,
              animationDelay: `${0.3 + groupIndex * 0.1}s`,
              opacity: 0
            }}
          >
            {group.map((item, index) => {
              const isLast = index === group.length - 1;

              return (
                <div
                  key={index}
                  onClick={item.action}
                  className={`flex items-center justify-between py-4 px-6 bg-gradient-to-r from-white to-[#F9FCFF] cursor-pointer hover:from-[#E8F4F9] hover:to-[#F0F7FF] active:scale-[0.98] transition-all h-[60px] group
                    ${!isLast ? "border-b-[2px] border-[#F0F7FF]" : ""}
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon with blue gradient background */}
                    <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] flex justify-center items-center shadow-[0_4px_12px_rgba(13,78,150,0.25)] group-hover:shadow-[0_6px_16px_rgba(13,78,150,0.35)] group-hover:scale-110 transition-all">
                      <img src={item.icon} alt={item.text} className="w-5 h-5 object-contain brightness-0 invert" />
                    </div>
                    <span className="text-[#1e3a5f] text-[15px] font-black group-hover:text-[#0D4E96] transition-colors">{item.text}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8F4F9] to-[#D1E8F5] flex items-center justify-center group-hover:scale-110 group-hover:translate-x-1 transition-all shadow-sm">
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#0D4E96" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Logout - Premium Design */}
        <div
          onClick={handleLogout}
          className="flex items-center justify-between py-4 px-6  mb-10 bg-gradient-to-r from-[#FFE8E8] via-[#FFF0F0] to-[#FFE8E8] cursor-pointer hover:from-[#FFD5D5] hover:to-[#FFE0E0] active:scale-[0.98] transition-all rounded-[28px] shadow-[0_6px_24px_rgba(227,2,17,0.15)] mx-5 h-[60px] border-2 border-[#FFCACA] mt-2 group"
          style={{
            animation: `fadeSlideUp 0.5s ease-out forwards`,
            animationDelay: '0.6s',
            opacity: 0
          }}
        >
          <div className="flex items-center gap-4">
            {/* Icon with soft red gradient background */}
            <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#FFB5B5] via-[#FF9999] to-[#FF8888] flex justify-center items-center shadow-[0_4px_12px_rgba(227,2,17,0.2)] group-hover:shadow-[0_6px_16px_rgba(227,2,17,0.3)] group-hover:scale-110 transition-all">
              <img src={IconLogout} alt="Logout" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-[#C41E3A] text-[16px] font-black group-hover:text-[#A01C2E] transition-colors">Logout</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD5D5] to-[#FFB5B5] flex items-center justify-center group-hover:scale-110 group-hover:translate-x-1 transition-all shadow-sm">
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#C41E3A" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
        </div>

      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeSlideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .animate-shimmer {
            animation: shimmer 4s infinite linear;
          }
        `}
      </style>
    </div>
  );
}
