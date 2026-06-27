import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE_URL, { getProfile } from "../../config/api";
import logo from "../../assets/logo.svg";
import highFive from "../../assets/v2/home/high_five.png";
import { 
  Bell, 
  ScanLine, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldX,
  ChevronRight, 
  Calendar,
  HeartHandshake
} from "lucide-react";





const BannerShield = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="#105DE4">
    <path d="M12 2s8 4 8 10v5l-8 3-8-3v-5c0-6 8-10 8-10z"/>
    <path d="M12 6s4.5 2 4.5 5.5v3l-4.5 1.5-4.5-1.5v-3C7.5 8 12 6 12 6z" fill="none" stroke="white" strokeWidth="1"/>
    <path d="M10 12.5l1.5 1.5 3-3" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const OrangeAlertTriangle = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#FFFBEB"/>
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const RedShieldX = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#FEF2F2" />
    <line x1="9" y1="10" x2="15" y2="16" />
    <line x1="15" y1="10" x2="9" y2="16" />
  </svg>
);

export default function Home() {
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    authentiks: 0,
    counterfeit: 0,
    alert: 0,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [statsRes, historyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/scan/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/scan/history`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({
            totalScans: data.totalScans || 0,
            authentiks: data.authentiks || 0,
            counterfeit: data.counterfeit || 0,
            alert: data.alert || 0,
          });
        }

        if (historyRes.ok) {
          const data = await historyRes.json();
          const slicedData = data.slice(0, 10);

          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const mappedData = slicedData.map((item) => {
            const dateObj = new Date(item.createdAt);
            const day = String(dateObj.getDate()).padStart(2, "0");
            const monthName = monthNames[dateObj.getMonth()];
            const year = dateObj.getFullYear();
            const timeStr = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            const title = item.productName || item.brandId?.brandName || "Premium Product";
            const code = item.productCode || item.batchId || `AUTH-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(1000 + Math.random() * 9000)}`;

            let statusLabel = "Verified";
            let badgeColor = "text-[#10B981]";
            let badgeBg = "bg-[#ECFDF5]";
            let dotColor = "bg-[#10B981]";

            if (item.status === "FAKE" || item.status === "INACTIVE") {
              statusLabel = "Counterfeit";
              badgeColor = "text-[#EF4444]";
              badgeBg = "bg-[#FEF2F2]";
              dotColor = "bg-[#EF4444]";
            } else if (item.status === "ALREADY_USED" || item.status === "DUPLICATE") {
              statusLabel = "Alert";
              badgeColor = "text-[#F59E0B]";
              badgeBg = "bg-[#FFFBEB]";
              dotColor = "bg-[#F59E0B]";
            }

            return {
              id: item._id,
              status: item.status, // Store status to determine icon inline
              title,
              code,
              date: `${day} ${monthName} ${year}`,
              time: timeStr,
              statusLabel,
              badgeColor,
              badgeBg,
              dotColor,
              fullData: item
            };
          });

          setRecentScans(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleRecentScanClick = (scan) => {
    let status = scan.fullData.status || "ORIGINAL";
    navigate(`/result/${status}`, { state: scan.fullData });
  };

  const handleScanClick = () => {
    navigate("/scan");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col relative w-full overflow-y-auto pb-24 overflow-x-hidden">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between px-5 pt-10 pb-4 bg-[#F8F9FA]">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[44px]">
            <img src={logo} alt="Authentiks Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col mt-[-2px]">
            <h1 className="text-[#0B1E36] text-[24px] font-extrabold tracking-tight leading-none">
              Authentiks
            </h1>
            <p className="text-[#5A7184] text-[11px] font-medium tracking-wide mt-[3px]">Trusted. Verified. Protected.</p>
          </div>
        </div>
        <button onClick={() => navigate('/notifications')} className="relative p-2 mr-[-8px]">
          <Bell className="w-[24px] h-[24px] text-[#0B1E36] stroke-[2]" />
          <div className="absolute top-[8px] right-[10px] w-[9px] h-[9px] bg-[#105DE4] rounded-full border-[2px] border-[#F8F9FA]"></div>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="px-5">
        
        {/* Verify with Confidence Banner */}
        <div className="w-full bg-[#032B77] rounded-[20px] p-5 pb-5 relative overflow-hidden mb-5 flex flex-col shadow-md">
          {/* Background glowing rings */}
          <div className="absolute right-[-20%] top-[50%] transform -translate-y-1/2 w-[280px] h-[280px] flex items-center justify-center pointer-events-none">
            <div className="absolute w-[240px] h-[240px] rounded-full border border-white/10"></div>
            <div className="absolute w-[180px] h-[180px] rounded-full border border-white/20"></div>
            <div className="absolute w-[120px] h-[120px] rounded-full border-[1.5px] border-[#3B82F6] opacity-70 blur-[1px]"></div>
            
            {/* Dots */}
            <div className="absolute top-[20%] right-[30%] w-[4px] h-[4px] bg-[#60A5FA] rounded-full shadow-[0_0_10px_#60A5FA]"></div>
            <div className="absolute bottom-[28%] left-[22%] w-[3px] h-[3px] bg-[#60A5FA] rounded-full shadow-[0_0_10px_#60A5FA]"></div>
            
            {/* Bottom glow */}
            <div className="absolute w-[100px] h-[10px] bg-[#3B82F6] blur-[10px] bottom-[50px] rounded-full"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 w-[65%]">
            <h2 className="text-white text-[24px] font-bold leading-[1.2] mb-2 text-shadow-sm">Verify with<br/>Confidence.</h2>
            <p className="text-[#E2E8F0] text-[12px] leading-[1.4] mb-4 max-w-[150px]">
              Scan the Authentiks QR code to verify product authenticity in real time.
            </p>
            <button onClick={handleScanClick} className="bg-white rounded-[10px] flex items-center justify-center gap-1.5 px-3 py-2.5 shadow-sm active:scale-[0.98] transition-transform w-max">
              <ScanLine className="w-[18px] h-[18px] text-[#105DE4] stroke-[2.5]" />
              <span className="text-[#105DE4] text-[12px] font-bold tracking-wide whitespace-nowrap">SCAN TO VERIFY</span>
            </button>
          </div>

          {/* Floating Shield Logo */}
          <div className="absolute right-[5%] top-[60%] transform -translate-y-1/2 w-[110px] h-[120px] z-10 pointer-events-none">
             <img src={logo} alt="Shield" className="w-full h-full object-contain drop-shadow-xl" style={{ animation: 'float 3s ease-in-out infinite' }} />
          </div>
        </div>

        {/* Stats Grid - One White Card Container */}
        <div className="w-full bg-white rounded-[24px] py-[18px] px-2 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F1F5F9]">
          <div className="flex items-center justify-between w-full">
            {/* Stat: Total Scans */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center mb-1.5 bg-[#F0F5FF]">
                <ScanLine className="w-[20px] h-[20px] text-[#105DE4]" />
              </div>
              <span className="text-[#0B1E36] font-extrabold text-[22px] leading-none mb-[3px]">{stats.totalScans}</span>
              <span className="text-[#5A7184] text-[10.5px] font-medium text-center">Total Scans</span>
            </div>
            
            <div className="w-[1px] h-[55px] bg-[#F1F5F9] mx-1"></div>

            {/* Stat: Verified */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center mb-1.5 bg-[#ECFDF5]">
                <ShieldCheck className="w-[20px] h-[20px] text-[#10B981]" />
              </div>
              <span className="text-[#0B1E36] font-extrabold text-[22px] leading-none mb-[3px]">{stats.authentiks}</span>
              <span className="text-[#5A7184] text-[10.5px] font-medium text-center">Verified</span>
            </div>

            <div className="w-[1px] h-[55px] bg-[#F1F5F9] mx-1"></div>

            {/* Stat: Alert */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center mb-1.5 bg-[#FFFBEB]">
                <AlertTriangle className="w-[20px] h-[20px] text-[#F59E0B]" />
              </div>
              <span className="text-[#0B1E36] font-extrabold text-[22px] leading-none mb-[3px]">{stats.alert}</span>
              <span className="text-[#5A7184] text-[10.5px] font-medium text-center">Alert</span>
            </div>

            <div className="w-[1px] h-[55px] bg-[#F1F5F9] mx-1"></div>

            {/* Stat: Counterfeit */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center mb-1.5 bg-[#FEF2F2]">
                <ShieldX className="w-[20px] h-[20px] text-[#EF4444]" />
              </div>
              <span className="text-[#0B1E36] font-extrabold text-[22px] leading-none mb-[3px]">{stats.counterfeit}</span>
              <span className="text-[#5A7184] text-[10.5px] font-medium text-center">Counterfeit</span>
            </div>
          </div>
        </div>

        {/* Recent Scans Card */}
        <div className="w-full bg-white rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F1F5F9]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#0B1E36] text-[16px] font-bold">Recent Scans</h3>
            <button onClick={() => navigate('/scan-history')} className="text-[#105DE4] text-[13px] font-bold flex items-center gap-0.5 hover:underline">
              View All <ChevronRight className="w-[14px] h-[14px]" />
            </button>
          </div>

          <div className="flex flex-col">
            {loading ? (
              <div className="py-8 flex justify-center">
                 <div className="w-6 h-6 border-4 border-[#105DE4] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : recentScans.length === 0 ? (
              <div className="py-8 text-center text-gray-400 font-medium text-[13px]">
                No recent scans found.
              </div>
            ) : (
              recentScans.slice(0, 4).map((scan, index) => {
                let iconComponent = <img src={logo} alt="Verified" className="w-[26px] h-[26px] object-contain drop-shadow-sm" />;
                let iconContainerBg = "bg-[#F0F5FF]";
                if (scan.status === "FAKE" || scan.status === "INACTIVE") {
                  iconComponent = <RedShieldX />;
                  iconContainerBg = "bg-[#FEF2F2]";
                } else if (scan.status === "ALREADY_USED" || scan.status === "DUPLICATE") {
                  iconComponent = <OrangeAlertTriangle />;
                  iconContainerBg = "bg-[#FFFBEB]";
                }

                return (
                  <div key={index} onClick={() => handleRecentScanClick(scan)} className="w-full flex items-center py-3.5 border-b border-gray-100 last:border-0 cursor-pointer active:bg-gray-50 transition-colors">
                    {/* Icon */}
                    <div className={`w-[44px] h-[44px] rounded-[12px] flex items-center justify-center mr-4 flex-shrink-0 ${iconContainerBg}`}>
                       {iconComponent}
                    </div>
                    {/* Texts */}
                    <div className="flex flex-col flex-1 min-w-0 pr-2 gap-[3px]">
                      <span className="text-[#0B1E36] text-[13.5px] font-extrabold truncate leading-tight">{scan.title}</span>
                      <span className="text-[#829AB1] text-[11px] truncate">{scan.code}</span>
                      <div className="flex items-center gap-1.5 text-[#A0AEC0] text-[10px] font-medium mt-[1px]">
                        <Calendar className="w-[10px] h-[10px]" />
                        {scan.date}, {scan.time}
                      </div>
                    </div>
                    {/* Pill & Arrow */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                       <div className={`flex items-center gap-1.5 px-3 py-[4px] rounded-full text-[11px] font-bold ${scan.badgeColor} ${scan.badgeBg}`}>
                         <div className={`w-[5px] h-[5px] rounded-full ${scan.dotColor}`}></div>
                         {scan.statusLabel}
                       </div>
                       <ChevronRight className="w-[16px] h-[16px] text-gray-300 stroke-[2.5]" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Banner Card */}
        <div className="w-full bg-[#F4F8FE] border border-[#E5EFFF] rounded-[16px] py-[12px] mt-6 mb-2 flex items-center relative overflow-hidden shadow-[0_2px_12px_rgba(16,93,228,0.04)] min-h-[90px]">
          <div className="mr-2 ml-2 z-10 flex-shrink-0">
            
                <img src={logo} alt="Authentiks" className="w-[50px] h-[50px] object-contain drop-shadow-sm" />
             
          </div>
          <div className="flex flex-col z-10 w-[65%]">
            <h4 className="text-[#0B1E36] font-bold text-[13px] leading-tight mb-[4px]">Your verification makes a difference.</h4>
            <p className="text-[#5A7184] text-[10px] leading-[1.4] pr-1">Help us build a safer authentication platform by verifying products before you buy.</p>
          </div>
          {/* Decorative illustration */}
          <div className="absolute right-[-5px] bottom-0 top-0 z-0 pointer-events-none flex items-end justify-end">
             <img src={highFive} alt="High Five" className="h-[75%] w-auto object-contain object-bottom" />
          </div>
        </div>

      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(-50%) translateY(0); }
            50% { transform: translateY(-50%) translateY(-6px); }
          }
        `}
      </style>
    </div>
  );
}
