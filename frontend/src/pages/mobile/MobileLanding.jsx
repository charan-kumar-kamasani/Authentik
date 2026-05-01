import React from 'react';
import logo from '../../assets/logo.svg';
import { QrCode } from 'lucide-react';

export default function MobileLanding({ onSelectMode }) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans relative overflow-hidden">
      
      {/* Background gradients for soft aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-blue-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] bg-blue-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="flex justify-center mb-6">
            {/* The shield icon wrapper to mimic the image */}
            <img src={logo} alt="Authentiks Logo" className="w-[100px] h-[100px] object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-[38px] font-black tracking-tight text-[#164e9a] leading-none mb-2">
            Authentiks
          </h1>
          <p className="text-[#164e9a] text-[14px] font-bold italic tracking-wide opacity-90">
            A Product Intelligence Platform
          </p>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12 w-full px-2">
          <h2 className="text-[36px] font-black text-black leading-[1.1] tracking-tight">
            What would you<br />like to do today?
          </h2>
        </div>

        {/* Buttons Container */}
        <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-[0_12px_40px_rgba(13,78,150,0.08)] border border-white/60 flex flex-col gap-5 backdrop-blur-sm">
          
          <button 
            onClick={() => onSelectMode('product')}
            className="w-full bg-gradient-to-b from-[#1c55a5] to-[#0e3b7b] text-white font-bold py-[18px] rounded-[18px] text-[19px] shadow-[0_8px_20px_rgba(13,78,150,0.3)] active:scale-[0.97] transition-all tracking-wide flex items-center justify-center gap-3"
          >
            <QrCode size={24} className="shrink-0" />
            Verify Your Product
          </button>
          
          <button 
            onClick={() => onSelectMode('brand')}
            className="w-full bg-white text-[#0e3b7b] font-bold py-[18px] rounded-[18px] text-[19px] active:scale-[0.97] transition-all border-[2.5px] border-[#0e3b7b] shadow-sm tracking-wide"
          >
            Visit Website
          </button>
          
        </div>
      </div>
      
      {/* Footer */}
      <div className="pb-10 text-center mt-auto w-full z-10">
        <p className="text-black font-bold text-[16px] tracking-wide">
          www.authentiks.in
        </p>
      </div>
    </div>
  );
}
