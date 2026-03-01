import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../../components/MobileHeader";
import { useLoading } from "../../context/LoadingContext";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000";

export default function MyReports() {
    const [reports, setReports] = useState([]);
    const navigate = useNavigate();
    const { setLoading } = useLoading();

    useEffect(() => {
        const fetchReports = async () => {
            (setLoading as any)(true);
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
            } finally {
                (setLoading as any)(false);
            }
        };

        fetchReports();
    }, [setLoading]);

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center">
            <MobileHeader
                title="My Reports"
                onLeftClick={() => navigate("/profile")}
                rightIcon={<div className="w-10" />}
            />

            <div className="w-full max-w-md p-4 space-y-4 pb-24">
                {reports.length === 0 ? (
                    <div className="bg-white p-10 rounded-[20px] shadow-sm text-center">
                        <p className="text-gray-500">You haven't submitted any reports yet.</p>
                    </div>
                ) : (
                    reports.map((report: any) => (
                        <div key={report._id} className="bg-white rounded-[20px] shadow-sm overflow-hidden border border-gray-100">
                            <div className="bg-[#2CA4D6] px-4 py-2 flex justify-between items-center">
                                <span className="text-white font-bold text-xs uppercase tracking-wider">
                                    {report.status || "Pending"}
                                </span>
                                <span className="text-white/80 text-[10px]">
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="p-4 flex gap-4">
                                {report.images && report.images[0] && (
                                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                                        <img
                                            src={report.images[0]}
                                            alt={report.productName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-bold text-[#333] leading-tight mb-1">{report.productName}</h3>
                                    {report.brand && (
                                        <p className="text-xs text-gray-500 mb-1">{report.brand}</p>
                                    )}
                                    {report.qrCode && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
                                            <span>#️⃣</span>
                                            <span className="truncate max-w-[150px]">{report.qrCode}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1 text-[10px] text-[#2CA4D6]">
                                        <div className="flex items-center gap-1">
                                            <span>📍</span>
                                            <span className="truncate max-w-[150px]">{report.place || "Unknown Location"}</span>
                                        </div>
                                        {(report.latitude && report.longitude) && (
                                            <div className="flex items-center gap-1 text-gray-400 pl-4">
                                                <span className="truncate max-w-[150px]">
                                                    {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
