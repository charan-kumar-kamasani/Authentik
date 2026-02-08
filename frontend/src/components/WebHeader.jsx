import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function WebHeader() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "text-[#214B80]" : "text-[#3DA8E4]";
  };

  return (
    <header className="flex items-center justify-between px-6 md:px-12 py-3 bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Authentiks Logo"
            className="h-[30px] md:h-[40px] object-contain"
          />
          <h1
            className="text-[24px] font-bold tracking-tight text-[#214B80]"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
          >
            Authen<span className="text-[#2CA4D6]">tiks</span>
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`font-bold text-sm md:text-base hover:text-blue-700 ${location.pathname === "/" ? "text-[#214B80]" : "text-[#3DA8E4]"}`}
          >
            Home
          </Link>
          <Link
            to="/about-us"
            className={`font-bold text-sm md:text-base hover:text-blue-700 ${location.pathname === "/about-us" ? "text-[#214B80]" : "text-[#3DA8E4]"}`}
          >
            About Us
          </Link>
          <Link
            to="/solutions"
            className={`font-bold text-sm md:text-base hover:text-blue-700 ${location.pathname === "/solutions" ? "text-[#214B80]" : "text-[#3DA8E4]"}`}
          >
            Solutions
          </Link>
        </nav>

        <Link to="/contact-us">
          <button className="bg-[#1B4079] text-white px-6 py-2 rounded-full font-bold text-sm md:text-base hover:bg-blue-900 shadow-md">
            Contact Us
          </button>
        </Link>
      </div>
    </header>
  );
}
