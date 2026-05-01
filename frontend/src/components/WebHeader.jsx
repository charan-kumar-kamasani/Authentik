import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.svg";

export default function WebHeader() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? "text-[#214B80]" : "text-[#3DA8E4]";
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Problem", path: "/problem" },
    { name: "Product", path: "/product" },
    { name: "AI Pulse", path: "/ai-pulse", isButton: true },
    { name: "How it works", path: "/how-it-works" },
    { name: "Industries", path: "/industries" },
    { name: "Pricing", path: "/pricing" },
  ];

  return (
    <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-[#020617]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
            <img
              src={logo}
              alt="Authentiks Logo"
              className="h-[28px] md:h-[32px] object-contain"
            />
          </div>
          <h1
            className="text-[20px] md:text-[24px] font-black tracking-tighter text-white"
          >
            Authen<span className="text-indigo-400">tiks</span>
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.isButton) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative text-[14px] md:text-[15px] font-bold transition-all duration-300 flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm
          ${isActive
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      : "bg-white/5 border-white/10 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  {item.name}
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-base md:text-[17px] font-semibold transition-all duration-300 
        ${isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                  }`}
              >
                {item.name}

                {/* Underline effect */}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] w-full bg-indigo-500 transition-all duration-300 
          ${isActive
                      ? "opacity-100 scale-x-100"
                      : "opacity-0 scale-x-0 transition-opacity hover:opacity-100"
                    }`}
                ></span>
              </Link>
            );
          })}
        </nav>

        <Link to="/live-demo" className="hidden md:block">
          <button className="bg-indigo-600/20 text-indigo-400 px-6 py-2 rounded-full font-bold text-sm md:text-base hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            Live Demo
          </button>
        </Link>
        
        {/* Mobile Menu Toggle Button */}
        <button 
          className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#020617]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl lg:hidden flex flex-col py-6 px-6 gap-6 z-40 overflow-y-auto max-h-[calc(100vh-80px)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (item.isButton) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`relative text-[16px] font-bold transition-all duration-300 flex items-center gap-3 px-5 py-3 rounded-2xl border w-fit
                    ${isActive
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      : "bg-white/5 border-white/10 text-cyan-400"
                    }`}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  {item.name}
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-[18px] font-semibold transition-all duration-300 border-b border-white/5 pb-4
                  ${isActive ? "text-indigo-400" : "text-gray-300 hover:text-white"}`}
              >
                {item.name}
              </Link>
            );
          })}
          
          <Link to="/live-demo" onClick={() => setIsMobileMenuOpen(false)} className="mt-2 w-full">
            <button className="w-full bg-indigo-600/20 text-indigo-400 px-6 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all">
              Live Demo
            </button>
          </Link>
        </div>
      )}
    </header>
  );
}
