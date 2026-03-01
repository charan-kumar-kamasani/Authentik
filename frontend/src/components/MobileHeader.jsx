import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Menu, ChevronLeft } from "lucide-react";
import bell from "../assets/v2/home/header/bell.svg";
export default function MobileHeader({
  onLeftClick,
  title,
  rightIcon,
  onNotificationClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome =
    location.pathname === "/" ||
    location.pathname === "/home";

  return (
    <div className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-white via-[#F9FCFF] to-white sticky top-0 z-50 shadow-[0_4px_24px_rgba(13,78,150,0.1)] border-b-2 border-[#E8F4F9] backdrop-blur-sm">

      {/* LEFT SIDE */}
      {isHome ? (
        <button
          onClick={onLeftClick}
          className="p-2.5 text-[#0D4E96] rounded-[12px] hover:bg-[#F0F7FF] active:scale-95 transition-all"
        >
          <Menu className="w-6 h-6" strokeWidth={2.5} />
        </button>
      ) : (
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 text-[#0D4E96] rounded-[12px] hover:bg-[#F0F7FF] active:scale-95 transition-all"
        >
          <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}

      {/* TITLE */}
      <div className="text-center">
        {title ? (
          <span className="text-[20px] font-black text-[#0D4E96]">{title}</span>
        ) : (
          <h1 className="text-[28px] font-black tracking-tight">
            <span className="bg-gradient-to-r from-[#0D4E96] to-[#1e3a5f] bg-clip-text text-transparent">Authen</span><span className="bg-gradient-to-r from-[#2CA4D6] to-[#1a5fa8] bg-clip-text text-transparent">tiks</span>
          </h1>
        )}
      </div>

      {/* RIGHT SIDE — Only show on Home */}
      {isHome ? (
        <button
          className="p-2.5 rounded-[12px] hover:bg-[#F0F7FF] active:scale-95 transition-all relative"
          onClick={onNotificationClick}
        >
          {rightIcon ? (
            rightIcon
          ) : (
            <>
            <img src={bell} alt="notifications" className="w-6 h-6" />
            {/* Optional notification dot indicator */}
            {/* <div className="absolute top-2 right-2 w-2 h-2 bg-[#FF4444] rounded-full animate-pulse" /> */}
            </>
          )}
        </button>
      ) : (
        <div className="w-10" />  // spacer to keep layout balanced
      )}

    </div>
  );
}
