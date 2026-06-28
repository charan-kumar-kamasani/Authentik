import React from 'react';
import logo from '../../assets/logo-text.png';
import { QrCode, ShieldCheck, Lock, Award, Globe, ChevronRight } from 'lucide-react';

export default function MobileLanding({ onSelectMode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative overflow-hidden">
      
      {/* Background gradients for soft aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-blue-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] bg-blue-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

      {/* Decorative Bottom Illustration */}
      <div className="absolute bottom-0 left-0 w-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 400 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Skyline */}
          <path d="M0 150V80h20v-20h15v-10h10v30h20V50h25v100h-90z" fill="#164e9a" />
          <path d="M90 150V70h15v-15h20v15h15v80H90z" fill="#164e9a" opacity="0.7" />
          <path d="M140 150V40h10v-10h10v-10h5v20h10v110h-35z" fill="#164e9a" opacity="0.5" />
          <path d="M250 150V60h25v-20h10v20h25v90h-60z" fill="#164e9a" opacity="0.6" />
          <path d="M310 150V90h15v-15h10v15h20V70h15v80h-60z" fill="#164e9a" opacity="0.8" />
          <path d="M370 150V40h10V20h5v20h15v110h-30z" fill="#164e9a" opacity="0.5" />
          {/* Center Shield Placeholder (faint) */}
          <path d="M200 40c-15 0-25-10-25-10v30c0 20 15 35 25 45 10-10 25-25 25-45V30s-10 10-25 10z" stroke="#164e9a" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M192 65l6 6 12-12" stroke="#164e9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        </svg>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-8 pb-4 z-10 w-full max-w-md mx-auto">
        
        {/* Logo Section */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="flex justify-center mb-3">
            {/* The shield icon wrapper to mimic the image */}
            <img src={logo} alt="Authentiks Logo" className="w-[85px] h-[85px] object-contain drop-shadow-md" />
          </div>
          <h1 className="text-[32px] font-black tracking-tight text-[#164e9a] leading-none mb-2">
            Authentiks
          </h1>
          <div className="flex items-center justify-center w-full gap-2 opacity-60">
            <div className="h-[1px] bg-[#164e9a] w-8"></div>
            <p className="text-[#164e9a] text-[11px] font-bold tracking-widest uppercase">
              A Product Intelligence Platform
            </p>
            <div className="h-[1px] bg-[#164e9a] w-8"></div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8 w-full px-2">
          <h2 className="text-[34px] font-black text-black leading-[1.1] tracking-tight">
            Verify Your Product<br />
            <span className="text-[#164e9a]">Instantly.</span>
          </h2>
        </div>

        {/* Features Section */}
        <div className="w-full bg-white rounded-[24px] py-5 px-2 shadow-[0_8px_30px_rgba(13,78,150,0.06)] mb-6 flex justify-between items-start backdrop-blur-sm">
          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-2 text-[#164e9a]">
              <ShieldCheck size={20} fill="#164e9a" color="white" />
            </div>
            <span className="text-[11px] font-black text-black mb-0.5 whitespace-nowrap">100% Genuine</span>
            <span className="text-[9px] font-bold text-gray-400 text-center leading-tight">Verify with confidence</span>
          </div>
          
          {/* Divider */}
          <div className="w-[1px] h-12 bg-gray-100 self-center"></div>
          
          <div className="flex flex-col items-center flex-1 px-1">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-2 text-[#164e9a]">
              <Lock size={20} fill="#164e9a" color="white" />
            </div>
            <span className="text-[11px] font-black text-black mb-0.5 whitespace-nowrap">Secure & Private</span>
            <span className="text-[9px] font-bold text-gray-400 text-center leading-tight">Your data is safe</span>
          </div>
          
          {/* Divider */}
          <div className="w-[1px] h-12 bg-gray-100 self-center"></div>
          
          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-2 text-[#164e9a]">
              <Award size={20} fill="#164e9a" color="white" />
            </div>
            <span className="text-[11px] font-black text-black mb-0.5 whitespace-nowrap text-center">Trusted by</span>
            <span className="text-[10px] font-black text-black text-center leading-tight">100+ Brands</span>
          </div>
        </div>

        {/* Buttons Container */}
        <div className="w-full bg-white/80 rounded-[28px] p-5 shadow-[0_8px_30px_rgba(13,78,150,0.04)] flex flex-col gap-4 backdrop-blur-md">
          
          <button 
            onClick={() => onSelectMode('product')}
            className="w-full bg-[#134991] text-white font-bold py-[18px] px-6 rounded-[20px] text-[16px] shadow-[0_8px_20px_rgba(13,78,150,0.25)] active:scale-[0.97] transition-all tracking-wide flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <QrCode size={24} className="shrink-0" />
              <span className="mt-0.5">Verify Your Product</span>
            </div>
            <ChevronRight size={20} className="opacity-80 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => onSelectMode('brand')}
            className="w-full bg-white text-[#134991] font-bold py-[18px] px-6 rounded-[20px] text-[16px] active:scale-[0.97] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100 tracking-wide flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <Globe size={24} className="shrink-0 text-[#134991]" />
              <span className="mt-0.5">Visit Website</span>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
          
        </div>
      </div>
      
      {/* Footer */}
      <div className="pb-8 text-center mt-auto w-full z-20">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} fill="#164e9a" color="white" />
            <span className="text-[11px] font-bold tracking-wide">Trusted. Transparent. Authentiks.</span>
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-[11px] font-bold text-[#164e9a] tracking-wide">www.authentiks.in</span>
        </div>
      </div>
    </div>
  );
}
