import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function WebHeader() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "text-[#214B80]" : "text-[#3DA8E4]";
  };

  return (
    <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
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

      <div className="flex items-center gap-8">
        <nav className="hidden lg:flex items-center gap-5">
          {[
            { name: "Home", path: "/" },
            { name: "Product", path: "/product" },
            { name: "How it works", path: "/how-it-works" },
            { name: "Industries", path: "/industries" },
            { name: "Pricing", path: "/pricing" },
            { name: "About us", path: "/about-us" },
            { name: "FAQs", path: "/faqs" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-bold transition-all hover:text-white ${location.pathname === item.path ? "text-white" : "text-gray-400"}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <Link to="/contact-us">
          <button className="bg-indigo-600/20 text-indigo-400 px-6 py-2 rounded-full font-bold text-sm md:text-base hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            Contact Us
          </button>
        </Link>
      </div>
    </header>
  );
}
