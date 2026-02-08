import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Authentiks.png";
import NotificationIcon from "../../assets/icon_notification.png";
import UserAvatar from "../../assets/profile/user_avatar.png";

// Profile Icons
import IconScanHistory from "../../assets/profile/icon_scan_history.png";
import IconReports from "../../assets/profile/icon_reports.png";
import IconAboutUs from "../../assets/profile/icon_about_us.png";
import IconHelp from "../../assets/profile/icon_help.png";
import IconShare from "../../assets/profile/icon_share.png";
import IconTerms from "../../assets/profile/icon_terms.png";
import IconPolicies from "../../assets/profile/icon_policies.png";
import IconLogout from "../../assets/profile/icon_logout.png";

export default function Profile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const MenuGroup = ({ children }) => (
    <div className="bg-white rounded-3xl w-full max-w-sm mb-4 overflow-hidden shadow-sm">
      {children}
    </div>
  );

  const MenuItem = ({ icon, text, onClick, isLast }) => (
    <div
      onClick={onClick}
      className={`flex items-center py-4 px-6 cursor-pointer active:bg-gray-50 transition-colors ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      <div className="w-8 flex justify-center mr-4">
        <img src={icon} alt={text} className="w-6 h-6 object-contain" />
      </div>
      <span className="text-[#0F4160] text-lg font-bold">{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4F8] to-[#0F4160] font-sans flex flex-col items-center pb-10">
    
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 pt-6">
         <button onClick={() => navigate("/home")} className="p-2">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-[#0F4160]">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
         </button>
        <h1
          className="text-[24px] font-bold tracking-tight text-[#214B80]"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
        >
          Authen<span className="text-[#2CA4D6]">tiks</span>
        </h1>
         <button className="p-2">
            <img src={NotificationIcon} alt="Notifications" className="w-6 h-6" />
         </button>
      </div>

      {/* User Profile Section */}
      <div className="flex flex-col items-center mt-4 mb-8">
        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg mb-4">
             <img src={UserAvatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <button 
            onClick={() => navigate("/edit-profile")}
            className="bg-gradient-to-b from-[#32ADD8] to-[#146890] text-white px-6 py-2 rounded-full font-medium shadow-md hover:opacity-90 transition-opacity"
        >
            Edit Profile
        </button>
      </div>

      {/* Menu Groups */}
      <div className="w-full px-6 flex flex-col items-center">
        
        {/* Group 1 */}
        <MenuGroup>
            <MenuItem icon={IconScanHistory} text="Scan History" onClick={() => navigate("/scan-history")} />
            <MenuItem icon={IconReports} text="Reports" onClick={() => {}} isLast={true} />
        </MenuGroup>

        {/* Group 2 */}
        <MenuGroup>
            <MenuItem icon={IconAboutUs} text="About Us" onClick={() => navigate("/about-us")} />
            <MenuItem icon={IconHelp} text="Help & Support" onClick={() => {}} />
            <MenuItem icon={IconShare} text="Share" onClick={() => {}} isLast={true} />
        </MenuGroup>

        {/* Group 3 */}
        <MenuGroup>
            <MenuItem icon={IconTerms} text="Terms & Conditions" onClick={() => navigate("/terms-conditions")} />
            <MenuItem icon={IconLogout} text="Policies" onClick={() => navigate("/policies")} isLast={true} />
        </MenuGroup>

        {/* Logout */}
         <div className="bg-white rounded-full w-full max-w-sm mb-4 overflow-hidden shadow-sm">
            <MenuItem icon={IconPolicies} text="Logout" onClick={handleLogout} isLast={true} />
         </div>

      </div>
    </div>
  );
}
