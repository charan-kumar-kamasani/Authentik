import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true); // This would be controlled by parent component

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white font-['-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto','Helvetica','Arial','sans-serif']">
      {/* Time - Fixed at top */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 text-black font-medium text-[14px] z-50">
        10:10 AM
      </div>

      {/* Scrollable Content */}
      <div className="pt-12 px-6">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-[#1a1a1a] mb-2">Authentick</h1>
        </div>

        {/* Edit Profile Button */}
        <div className="mb-8">
          <button className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg text-[16px] font-medium hover:bg-[#2c2c2e] active:bg-[#000] transition-colors duration-200 w-full">
            Edit Profile
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-6">
          {/* History */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-[#1a1a1a]">History</span>
            <div className="w-6 h-6 border-2 border-[#d1d1d6] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#1a1a1a] rounded-sm"></div>
            </div>
          </div>

          {/* Notifications - Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-[#1a1a1a]">Notifications</span>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${notifications ? 'bg-[#34C759]' : 'bg-[#d1d1d6]'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transform transition-transform duration-200 ${notifications ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#d1d1d6] w-full my-4"></div>

          {/* About Us */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-[#1a1a1a]">About Us</span>
            <div className="w-6 h-6 border-2 border-[#d1d1d6] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#1a1a1a] rounded-sm"></div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-[#1a1a1a]">Help & Support</span>
            <div className="w-6 h-6 border-2 border-[#d1d1d6] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#1a1a1a] rounded-sm"></div>
            </div>
          </div>

          {/* Share */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-[#1a1a1a]">Share</span>
            <div className="w-6 h-6 border-2 border-[#d1d1d6] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#1a1a1a] rounded-sm"></div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#d1d1d6] w-full my-4"></div>

          {/* Terms & Conditions */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-[#1a1a1a]">Terms & Conditions</span>
            <div className="w-6 h-6 border-2 border-[#d1d1d6] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#1a1a1a] rounded-sm"></div>
            </div>
          </div>

          {/* Policies */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-[#1a1a1a]">Policies</span>
            <div className="w-6 h-6 border-2 border-[#d1d1d6] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#1a1a1a] rounded-sm"></div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#d1d1d6] w-full my-4"></div>

          {/* Logout */}
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-[#1a1a1a]">Logout</span>
            <div className="w-6 h-6 border-2 border-[#d1d1d6] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-[#1a1a1a] rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Back Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#d1d1d6] p-6">
        <button
          onClick={() => navigate(-1)} // Go back to previous page
          className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg text-[16px] font-medium hover:bg-[#2c2c2e] active:bg-[#000] transition-colors duration-200 w-full max-w-[300px] mx-auto block"
        >
          Back
        </button>
      </div>
    </div>
  );
}