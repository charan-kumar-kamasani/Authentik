import React from "react";
import { Gift } from "lucide-react";
import MobileHeader from "../../components/MobileHeader";

export default function Rewards() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            <MobileHeader title="Rewards" />

            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-24 h-24 bg-[#E8F4F9] rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <Gift size={48} className="text-[#2CA4D6]" />
                </div>

                <h2 className="text-[#0D4E96] text-[28px] font-black mb-3">
                    Coming Soon!
                </h2>

                <p className="text-[#666] text-[16px] font-medium max-w-[280px] leading-relaxed">
                    We're working hard to bring you exciting rewards. Stay tuned for updates!
                </p>

                <div className="mt-10 flex gap-2">
                    <div className="w-2 h-2 bg-[#2CA4D6] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-[#2CA4D6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#2CA4D6] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
}
