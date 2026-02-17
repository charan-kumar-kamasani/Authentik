import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Menu, ChevronLeft } from "lucide-react";
import bell from "../assets/v2/home/header/bell.svg";
export default function MobileHeader({
  onLeftClick,
  title,
  rightIcon,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome =
    location.pathname === "/" ||
    location.pathname === "/home";

  return (
    <div className="w-full flex items-center justify-between p-4 bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">

      {/* LEFT SIDE */}
      {isHome ? (
        <button
          onClick={onLeftClick}
          className="p-2 text-[#0D4E96]"
        >
          <Menu className="w-6 h-6" />
        </button>
      ) : (
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-[#0D4E96]"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* TITLE */}
      <div className="text-center">
        {title ? (
          title
        ) : (
          <h1 className="text-[28px] font-black tracking-tight text-[#0D4E96]">
            Authen<span className="text-[#2CA4D6]">tiks</span>
          </h1>
        )}
      </div>

      {/* RIGHT SIDE — Only show on Home */}
      {isHome ? (
        <button
          className="p-2"
          // onClick={() => navigate("/edit-profile")}
        >
          {rightIcon ? (
            rightIcon
          ) : (
            <>
            <img src={bell} alt="" />
           {/* <User className="w-6 h-6 text-[#259DCF]" /> */}
            </>
          )}
        </button>
      ) : (
        <div className="w-10" />  // spacer to keep layout balanced
      )}

    </div>
  );
}
