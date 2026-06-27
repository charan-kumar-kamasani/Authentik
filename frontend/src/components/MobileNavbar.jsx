import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, QrCode, Clock, Flag, User } from "lucide-react";

export default function MobileNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: "home", label: "Home", icon: Home, path: "/home" },
        { id: "scan", label: "Scan", icon: QrCode, path: "/scan" },
        { id: "history", label: "History", icon: Clock, path: "/scan-history" },
        { id: "report", label: "Report", icon: Flag, path: "/report" },
        { id: "profile", label: "Profile", icon: User, path: "/profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F1F5F9] px-2 pt-3 pb-6 flex justify-between items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.id === "home" && location.pathname === "/");
                const Icon = item.icon;

                // Make the home icon filled when active
                const isHomeActive = isActive && item.id === "home";

                return (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className="flex flex-col items-center gap-[5px] w-full max-w-[20%] active:opacity-70 transition-opacity"
                    >
                        <Icon 
                           size={24} 
                           strokeWidth={isHomeActive ? 0 : 2} 
                           fill={isHomeActive ? '#105DE4' : 'none'} 
                           className={isActive ? "text-[#105DE4]" : "text-[#94A3B8]"} 
                        />
                        <span className={`text-[11px] font-semibold ${isActive ? "text-[#105DE4]" : "text-[#94A3B8]"}`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
