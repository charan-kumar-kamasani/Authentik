import React from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../../components/MobileHeader";

export default function Rewards() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <MobileHeader onBackClick={() => navigate(-1)} />
            
            {/* Content Container */}
            <div className="px-6 pt-6 pb-10">
                {/* Empty State */}
                <div className="flex flex-col items-center justify-center gap-4 pt-24">
                    {/* Gradient Gift Icon */}
                    <div className="relative flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF] flex items-center justify-center shadow-lg">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="url(#giftGradient)" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className="w-12 h-12"
                            >
                                <defs>
                                    <linearGradient id="giftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#0D4E96" />
                                        <stop offset="100%" stopColor="#2CA4D6" />
                                    </linearGradient>
                                </defs>
                                <polyline points="20 12 20 22 4 22 4 12" />
                                <rect x="2" y="7" width="20" height="5" />
                                <line x1="12" y1="22" x2="12" y2="7" />
                                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                            </svg>
                        </div>
                        
                        {/* Decorative Elements */}
                        <div 
                            className="absolute w-3 h-3 bg-[#2CA4D6] rounded-full opacity-30"
                            style={{
                                top: '10%',
                                left: '-20%',
                                animation: 'pulse 2s infinite'
                            }}
                        />
                        <div 
                            className="absolute w-2 h-2 bg-[#0D4E96] rounded-full opacity-30"
                            style={{
                                top: '30%',
                                right: '-15%',
                                animation: 'pulse 2s infinite',
                                animationDelay: '0.5s'
                            }}
                        />
                        <div 
                            className="absolute w-2.5 h-2.5 bg-[#1a5fa8] rounded-full opacity-30"
                            style={{
                                bottom: '20%',
                                left: '-10%',
                                animation: 'pulse 2s infinite',
                                animationDelay: '1s'
                            }}
                        />
                    </div>

                    {/* Empty State Text */}
                    <div className="text-center">
                        <h2 className="text-[#0D4E96] font-black text-[20px] mb-2">
                            Coming Soon!
                        </h2>
                        <p className="text-gray-600 text-[14px] max-w-[280px]">
                            We're working hard to bring you exciting rewards. Stay tuned for updates!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
