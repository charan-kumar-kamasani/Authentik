import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationIcon from "../../assets/icon_notification.png";

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

export default function Profile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-10">

      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 bg-white sticky top-0 z-50">
        <button onClick={() => navigate("/home")} className="p-2 text-[#0D4E96]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-[24px] font-bold tracking-tight text-[#0D4E96]">
            Authen<span className="text-[#2CA4D6]">tiks</span>
          </h1>
        </div>

        <button className="p-2">
          <img src={NotificationIcon} alt="Notifications" className="w-6 h-6 object-contain" />
        </button>
      </div>

      {/* User Card */}
      <div className="mx-5 mt-2 mb-6 bg-[#2CA4D6] rounded-[24px] p-8 shadow-md flex flex-col items-center justify-center relative min-h-[180px]">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-[-16px] z-10 shadow-sm relative top-[-10px]">
          <img
            src={UserAvatar}
            alt="Profile"
            className="w-14 h-14 object-contain filter"
            style={{ filter: 'brightness(0) saturate(100%) invert(42%) sepia(77%) saturate(496%) hue-rotate(166deg) brightness(93%) contrast(92%)' }}
          />
        </div>

        <button
          onClick={() => navigate("/edit-profile")}
          className="bg-[#1B4B6E] text-white px-8 py-2 rounded-[20px] font-bold text-[14px] shadow-[0_4px_15px_rgba(27,75,110,0.4)] hover:bg-[#153a55] transition-colors relative z-20 mt-4"
        >
          Edit Profile
        </button>
      </div>

      {/* Menu List */}
      <div className="flex flex-col pb-8">

        {/* Render Menu Groups */}
        {[
          [
            { icon: IconScanHistory, text: "Scan History", action: () => navigate("/scan-history") },
            { icon: IconReports, text: "Reports", action: () => { } }
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
          <div key={groupIndex} className="mx-5 mb-4 flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-[20px]">
            {group.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === group.length - 1;

              return (
                <div
                  key={index}
                  onClick={item.action}
                  className={`flex items-center justify-between py-4 px-6 bg-white cursor-pointer active:bg-gray-50 transition-colors h-[70px]
                    ${isFirst ? "rounded-t-[20px]" : ""} 
                    ${isLast ? "rounded-b-[20px]" : ""}
                    ${!isLast ? "border-b-[1.5px] border-gray-200" : ""}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex justify-center items-center">
                      <img src={item.icon} alt={item.text} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[#555] text-[16px] font-bold">{item.text}</span>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2CA4D6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              )
            })}
          </div>
        ))}

        {/* Logout */}
        <div
          onClick={handleLogout}
          className={`flex items-center justify-between py-4 px-6 bg-white cursor-pointer active:bg-gray-50 transition-colors mb-2 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] mx-5 h-[70px] border border-gray-100 mt-2`}
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 flex justify-center items-center">
              <img src={IconLogout} alt="Logout" className="w-full h-full object-contain" />
            </div>
            <span className="text-[#FF8088] text-[18px] font-bold">Logout</span>
          </div>
        </div>

      </div>
    </div>
  );
}
