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
        { id: "profile", label: "Profile", icon: User, path: "/profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? "bg-[#E8F4F9] text-[#2CA4D6]" : "text-[#888] group-active:scale-95"
                            }`}>
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[12px] font-bold transition-colors ${isActive ? "text-[#2CA4D6]" : "text-[#888]"
                            }`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
