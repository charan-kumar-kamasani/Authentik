import React from 'react';
import { useLoading } from '../context/LoadingContext';
import logo from '../assets/logo-shield.png';
import { Lock, ShieldCheck, UserCheck } from 'lucide-react';

export default function GlobalLoader() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#FDFDFD] flex flex-col items-center justify-center font-sans overflow-hidden">
      <style>
        {`
          @keyframes progressAnim {
            0% { width: 10%; }
            50% { width: 90%; }
            100% { width: 10%; }
          }
          @keyframes pulseSoft {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }
        `}
      </style>

      {/* Central Shield Graphic with Concentric Rings */}
      <div className="relative w-[280px] h-[280px] flex items-center justify-center mb-2 mt-8">
        
        {/* Faint Concentric Rings */}
        <div className="absolute inset-0 m-auto w-[240px] h-[240px] rounded-full border-[1.5px] border-[#F0F5FF]"></div>
        <div className="absolute inset-0 m-auto w-[180px] h-[180px] rounded-full border-[1.5px] border-[#D0E2FB] opacity-60"></div>
        <div className="absolute inset-0 m-auto w-[120px] h-[120px] rounded-full border border-[#D0E2FB] opacity-30"></div>
        
        {/* Ring Tech Dots */}
        <div className="absolute top-[12%] left-[30%] w-[5px] h-[5px] bg-[#A5C8FA] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[4px] h-[4px] bg-[#105DE4] rounded-full"></div>
        <div className="absolute top-[25%] right-[12%] w-[8px] h-[8px] bg-[#407BFF] rounded-full shadow-[0_0_12px_rgba(64,123,255,0.6)]"></div>
        <div className="absolute bottom-[35%] left-[10%] w-[6px] h-[6px] bg-[#407BFF] rounded-full"></div>

        {/* Shield Logo */}
        <div className="relative z-10 w-[110px] h-[120px] flex items-center justify-center" style={{ animation: 'pulseSoft 3s ease-in-out infinite' }}>
           <img src={logo} alt="Authentiks" className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(16,93,228,0.4)]" />
        </div>

        {/* Floor Blur Shadow */}
        <div className="absolute bottom-[55px] w-[120px] h-[12px] bg-[#105DE4] blur-[14px] opacity-50 rounded-[100%]"></div>
      </div>

      {/* Texts */}
      <h2 className="text-[26px] font-bold text-[#0B1E36] mb-3 text-center tracking-tight">Verifying Your Identity</h2>
      <p className="text-[#5A7184] text-[14px] text-center max-w-[280px] leading-[1.6] mb-10">
        Please wait while we securely verify your number and set up your account.
      </p>

      {/* Progress Bar Area */}
      <div className="w-full max-w-[280px] flex flex-col items-center mb-14">
        <div className="w-full h-[4px] bg-[#E2E8F0] rounded-full relative mb-5">
          <div className="h-full bg-[#105DE4] rounded-full absolute left-0 top-0 overflow-visible" style={{ animation: 'progressAnim 2s ease-in-out infinite' }}>
            {/* Thumb */}
            <div className="absolute right-[-6px] top-[-5px] w-[14px] h-[14px] bg-[#105DE4] rounded-full shadow-[0_2px_8px_rgba(16,93,228,0.5)]"></div>
          </div>
        </div>
        <p className="text-[#105DE4] text-[13.5px] font-medium tracking-wide">Authenticating...</p>
      </div>

      {/* Three Icons */}
      <div className="flex items-center justify-center gap-[28px] mb-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-[48px] h-[48px] bg-[#F8FAFC] rounded-full flex items-center justify-center border border-[#F1F5F9]">
            <Lock className="w-[20px] h-[20px] text-[#105DE4] stroke-[2]" />
          </div>
          <span className="text-[#0B1E36] text-[12.5px] font-bold">Secure</span>
        </div>

        <div className="w-[1.5px] h-[36px] bg-[#F1F5F9]"></div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-[48px] h-[48px] bg-[#F8FAFC] rounded-full flex items-center justify-center border border-[#F1F5F9]">
            <ShieldCheck className="w-[20px] h-[20px] text-[#105DE4] stroke-[2]" />
          </div>
          <span className="text-[#0B1E36] text-[12.5px] font-bold">Verified</span>
        </div>

        <div className="w-[1.5px] h-[36px] bg-[#F1F5F9]"></div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-[48px] h-[48px] bg-[#F8FAFC] rounded-full flex items-center justify-center border border-[#F1F5F9]">
            <UserCheck className="w-[20px] h-[20px] text-[#105DE4] stroke-[2]" />
          </div>
          <span className="text-[#0B1E36] text-[12.5px] font-bold">Protected</span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Bottom Card */}
      <div className="w-[90%] max-w-[340px] bg-[#F8FAFC] rounded-[16px] py-4 px-5 flex items-center gap-4 mb-8 border border-[#F1F5F9]">
        <div className="w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex-shrink-0">
           <ShieldCheck className="w-[22px] h-[22px] text-[#105DE4] stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-[#0B1E36] font-bold text-[14px] mb-[2px]">Almost there!</h3>
          <p className="text-[#5A7184] text-[12.5px] leading-[1.4]">This will only take a few seconds.</p>
        </div>
      </div>
    </div>
  );
}
