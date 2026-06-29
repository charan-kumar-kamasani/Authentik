import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Scan, Clock, Gift, ShieldCheck } from "lucide-react";

export default function MobileNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: "home", label: "Home", icon: Home, path: "/home" },
        { id: "history", label: "History", icon: Clock, path: "/scan-history" },
        { id: "scan", label: "", icon: Scan, path: "/scan", isFloating: true },
        { id: "rewards", label: "Rewards", icon: Gift, path: "/rewards" },
        { id: "warranty", label: "Warranty", icon: ShieldCheck, path: "/warranty" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F1F5F9] px-2 pt-2 pb-2 flex justify-between items-end z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-[70px]">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.id === "home" && location.pathname === "/");
                const Icon = item.icon;

                if (item.isFloating) {
                    return (
                        <div key={item.id} className="relative flex flex-col items-center justify-end w-full max-w-[20%] pb-1 h-full">
                            <div className="absolute -top-[25px] flex flex-col items-center">
                                <button
                                    onClick={() => navigate(item.path)}
                                    className="w-[60px] h-[60px] bg-[#105DE4] rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(16,93,228,0.4)] active:scale-95 transition-transform border-[4px] border-white z-10"
                                >
                                    <Icon size={28} className="text-white" strokeWidth={2.5} />
                                </button>
                            </div>
                            {item.label && (
                                <span className="text-[11px] font-bold text-[#105DE4] mt-auto">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    );
                }

                // Make the home icon filled when active
                const isHomeActive = isActive && item.id === "home";

                return (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className="flex flex-col items-center gap-[5px] w-full max-w-[20%] active:opacity-70 transition-opacity pb-1"
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
