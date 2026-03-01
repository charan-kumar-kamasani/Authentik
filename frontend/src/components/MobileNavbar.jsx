import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, History, Gift, User } from "lucide-react";

export default function MobileNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: "home", label: "Home", icon: Home, path: "/home" },
        { id: "history", label: "History", icon: History, path: "/scan-history" },
        { id: "rewards", label: "Rewards", icon: Gift, path: "/rewards" },
        { id: "profile", label: "Profile", icon: User, path: "/edit-profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white via-[#F9FCFF] to-white border-t-2 border-[#E8F4F9] px-6 py-3 flex justify-between items-center z-50 shadow-[0_-8px_32px_rgba(13,78,150,0.12)] backdrop-blur-sm">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className="flex flex-col items-center gap-1 group relative"
                    >
                        <div className={`p-2.5 rounded-[14px] transition-all duration-300 ${
                            isActive 
                                ? "bg-gradient-to-br from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] text-white scale-110 shadow-[0_4px_16px_rgba(13,78,150,0.35)]" 
                                : "text-[#1e3a5f] group-hover:bg-[#F0F7FF] group-active:scale-95"
                            }`}>
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[11px] font-black transition-colors ${
                            isActive ? "text-[#0D4E96]" : "text-[#1e3a5f]"
                            }`}>
                            {item.label}
                        </span>
                        {/* Active indicator dot */}
                        {isActive && (
                            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#2CA4D6] animate-pulse" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
