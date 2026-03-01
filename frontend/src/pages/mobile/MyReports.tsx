import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, MapPin, Calendar, AlertCircle } from "lucide-react";
import MobileHeader from "../../components/MobileHeader";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000";

export default function MyReports() {
    const [reports, setReports] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_BASE_URL}/scan/reports/my`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setReports(data);
                }
            } catch (error) {
                console.error("Error fetching reports:", error);
            }
        };

        fetchReports();
    }, []);

    const getStatusStyle = (status: string) => {
        const statusLower = (status || "pending").toLowerCase();
        switch (statusLower) {
            case "resolved":
            case "verified":
                return "bg-gradient-to-r from-[#0D4E96] to-[#1a5fa8] shadow-[0_4px_12px_rgba(13,78,150,0.35)]";
            case "pending":
            case "under review":
                return "bg-gradient-to-r from-[#2CA4D6] to-[#60b8e8] shadow-[0_4px_12px_rgba(44,164,214,0.35)]";
            case "rejected":
            case "closed":
                return "bg-gradient-to-r from-[#1a5fa8] to-[#0D4E96] shadow-[0_4px_12px_rgba(13,78,150,0.3)]";
            default:
                return "bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] shadow-[0_4px_12px_rgba(13,78,150,0.3)]";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF] via-[#F0F7FF] to-[#E8F4F9] flex flex-col items-center">
            <style>{`
                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-fadeSlideUp {
                    animation: fadeSlideUp 0.6s ease-out forwards;
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 3s infinite;
                }
            `}</style>

            <MobileHeader
                title="My Reports"
                onLeftClick={() => navigate("/profile")}
                onNotificationClick={() => navigate("/notifications")}
                rightIcon={<div className="w-10" />}
            />

            <div className="w-full max-w-md p-4 space-y-4 pb-24">
                {reports.length === 0 ? (
                    <div className="bg-white p-10 rounded-[24px] shadow-[0_8px_32px_rgba(13,78,150,0.12)] text-center animate-fadeSlideUp relative overflow-hidden">
                        {/* Decorative gradient circle */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0D4E96]/10 to-[#2CA4D6]/10 rounded-full blur-3xl" />
                        
                        <div className="relative">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#0D4E96]/10 to-[#2CA4D6]/10 mb-4 relative">
                                <FileText size={40} className="text-[#0D4E96]" strokeWidth={2} />
                                {/* Pulsing dots */}
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#2CA4D6] animate-pulse" />
                                <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#0D4E96] animate-pulse" style={{ animationDelay: "0.5s" }} />
                            </div>
                            <p className="text-[#1e3a5f] font-semibold text-[15px] mb-2">No Reports Yet</p>
                            <p className="text-[#0D4E96]/60 text-[13px] leading-relaxed">
                                You haven't submitted any product reports yet.
                            </p>
                        </div>
                    </div>
                ) : (
                    reports.map((report: any, index: number) => (
                        <div 
                            key={report._id} 
                            className="bg-white rounded-[24px] shadow-[0_8px_32px_rgba(13,78,150,0.12)] overflow-hidden border border-[#E8F4F9] hover:shadow-[0_12px_40px_rgba(13,78,150,0.18)] transition-all duration-300 animate-fadeSlideUp"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Status Header with Gradient */}
                            <div className={`px-4 py-3 flex justify-between items-center ${getStatusStyle(report.status)} relative overflow-hidden`}>
                                <div className="absolute inset-0 animate-shimmer" />
                                <span className="text-white font-black text-xs uppercase tracking-wider relative z-10">
                                    {report.status || "Pending"}
                                </span>
                                <div className="flex items-center gap-2 relative z-10">
                                    <Calendar size={12} className="text-white/80" />
                                    <span className="text-white/90 text-[11px] font-semibold">
                                        {new Date(report.createdAt).toLocaleDateString("en-US", { 
                                            month: "short", 
                                            day: "numeric", 
                                            year: "numeric" 
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex gap-4">
                                {report.images && report.images[0] && (
                                    <div className="w-24 h-24 rounded-[16px] overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#F0F7FF] to-[#E8F4F9] border-2 border-[#E8F4F9] shadow-[0_4px_12px_rgba(13,78,150,0.1)]">
                                        <img
                                            src={report.images[0]}
                                            alt={report.productName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-[#0D4E96] leading-tight mb-1.5 text-[15px]">
                                        {report.productName}
                                    </h3>
                                    {report.brand && (
                                        <p className="text-xs text-[#1e3a5f] font-semibold mb-2 bg-[#F0F7FF] inline-block px-2 py-0.5 rounded-full">
                                            {report.brand}
                                        </p>
                                    )}
                                    {report.qrCode && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-[#0D4E96]/60 mb-2.5 bg-[#F0F7FF] px-2 py-1 rounded-lg w-fit">
                                            <AlertCircle size={12} className="text-[#2CA4D6] flex-shrink-0" />
                                            <span className="truncate max-w-[140px] font-medium">
                                                {report.qrCode}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-start gap-1.5 text-[11px]">
                                            <MapPin size={13} className="text-[#2CA4D6] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                            <span className="text-[#1e3a5f] font-medium leading-tight">
                                                {report.place || "Unknown Location"}
                                            </span>
                                        </div>
                                        {(report.latitude && report.longitude) && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-[#0D4E96]/50 pl-5">
                                                <span className="truncate max-w-[140px] font-mono">
                                                    {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Gradient Bar */}
                            <div className="h-1 bg-gradient-to-r from-[#0D4E96] via-[#2CA4D6] to-[#0D4E96] relative overflow-hidden">
                                <div className="absolute inset-0 animate-shimmer" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
