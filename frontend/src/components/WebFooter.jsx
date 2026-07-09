import React from "react";
import { Link } from "react-router-dom";
import { Linkedin, X, Youtube } from "lucide-react";
import logo from "../assets/logo.png";

export default function WebFooter() {
  return (
    <footer className="bg-[#0b1b36] text-white py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Brand Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Authentiks Logo" className="h-[36px] object-contain " />
          </Link>
          <p className="text-gray-300 text-[15px] leading-relaxed max-w-sm">
            Consumer Intelligence Platform that authenticates products, captures consumer data, and builds lifelong brand relationships.
          </p>
          <div className="flex items-center gap-4 text-gray-300">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><X size={20} /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Youtube size={20} /></a>
          </div>
        </div>

        {/* Company Column */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-[16px]">Company</h4>
          <Link to="/about-us" className="text-gray-400 hover:text-white transition-colors text-[14px]">About Us</Link>
          <Link to="/contact-us" className="text-gray-400 hover:text-white transition-colors text-[14px]">Resources</Link>
          <Link to="/contact-us" className="text-gray-400 hover:text-white transition-colors text-[14px]">Contact Us</Link>
        </div>
        
        {/* Legal Column */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-[16px]">Legal</h4>
          <Link to="/security-policy" className="text-gray-400 hover:text-white transition-colors text-[14px]">Security</Link>
          <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-[14px]">Privacy Policy</Link>
          <Link to="/terms-conditions" className="text-gray-400 hover:text-white transition-colors text-[14px]">Terms of Service</Link>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-gray-400">
        <p>© {new Date().getFullYear()} Authentiks. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span>Secured by</span>
          <span className="font-bold text-white text-[15px] flex items-center gap-1">
             <span className="text-orange-500">cloudflare</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
