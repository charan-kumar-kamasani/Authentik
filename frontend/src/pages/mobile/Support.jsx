import React from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../../components/MobileHeader";
import { Phone, MessageCircle, Mail } from "lucide-react";

export default function Support() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] font-sans flex flex-col">
            <MobileHeader
                onLeftClick={() => navigate(-1)}
                title="Help & Support"
            />

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#0D4E96] to-[#2CA4D6] rounded-3xl flex items-center justify-center shadow-xl mb-8 animate-bounce">
                    <Phone size={40} className="text-white" />
                </div>

                <h1 className="text-3xl font-black text-[#0D4E96] mb-4 uppercase tracking-tighter">
                    Need Help?
                </h1>
                
                <p className="text-[#1e3a5f] font-bold text-lg mb-12 max-w-xs leading-relaxed">
                    Our team is here to assist you. Please reach out to us directly.
                </p>

                <div className="w-full space-y-4">
                   

                    <a 
                        href="https://wa.me/919342501819"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all w-full"
                    >
                        <MessageCircle size={20} />
                        WhatsApp Us
                    </a>

                    <a 
                        href="mailto:support@authentiks.in"
                        className="flex items-center justify-center gap-3 bg-indigo-50 border-2 border-indigo-200 text-indigo-800 py-4 rounded-2xl font-black text-lg shadow-sm active:scale-95 transition-all w-full"
                    >
                        <Mail size={20} />
                        Email Support
                    </a>
                </div>

                <div className="mt-16 p-6 bg-[#0D4E96]/5 rounded-2xl border border-[#0D4E96]/10">
                    <p className="text-[#0D4E96] font-black text-sm uppercase tracking-widest">
                        Available 24/7
                    </p>
                </div>
            </div>
        </div>
    );
}
