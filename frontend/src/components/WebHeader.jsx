import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png"; // Changed to use standard logo
import DemoModal from "./DemoModal";

export default function WebHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");



  const handleGoToAdmin = () => {
    navigate("/admin/dashboard");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about-us" },
    { name: "Why Authentiks", path: "/why-authentiks" },
    //{ name: "Platform", path: "/platform" },
    { name: "Solutions", path: "/solutions" },
    { name: "Plans", path: "/pricing" },
    { name: "FAQ", path: "/faqs" },
    { name: "Contact Us", path: "/contact-us" },
  ];

  return (
    <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Authentiks Logo"
            className="h-[32px] md:h-[40px] object-contain"
          />
        </Link>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-[15px] font-medium transition-all duration-300 
                ${isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                  }`}
              >
                {item.name}

                {/* Underline effect */}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] w-full bg-blue-600 transition-all duration-300 
                  ${isActive
                      ? "opacity-100 scale-x-100"
                      : "opacity-0 scale-x-0 transition-opacity group-hover:opacity-100"
                    }`}
                ></span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          {!token && !adminToken && (
            <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium text-[15px] transition-colors">
              Login
            </Link>
          )}

          <button 
            onClick={() => setIsDemoModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-[15px] hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Book a Demo
          </button>

          {adminToken && (
            <button
              onClick={handleGoToAdmin}
              className="bg-gray-100 text-gray-800 px-6 py-2.5 rounded-lg font-semibold text-[15px] hover:bg-gray-200 transition-all"
            >
              Dashboard
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="lg:hidden p-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl lg:hidden flex flex-col py-4 px-6 gap-3 z-40 border-b border-gray-100">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-[16px] font-medium transition-all duration-300 border-b border-gray-100 pb-3
                  ${isActive ? "text-blue-600 font-bold" : "text-gray-700 hover:text-blue-600"}`}
              >
                {item.name}
              </Link>
            );
          })}

          <div className="flex flex-col gap-3 mt-4">
            {!token && !adminToken && (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full bg-white text-gray-800 py-3 rounded-xl font-bold text-[15px] border border-gray-200">
                  Login
                </button>
              </Link>
            )}

            <button 
              onClick={() => {
                setIsDemoModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-[15px] shadow-md"
            >
              Book a Demo
            </button>

            {adminToken && (
              <button
                onClick={handleGoToAdmin}
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold text-[15px]"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      )}

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </header>
  );
}
