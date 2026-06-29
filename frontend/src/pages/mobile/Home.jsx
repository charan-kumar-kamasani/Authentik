import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE_URL, { getProfile } from "../../config/api";
import logo from "../../assets/logo-text.png";
import logoShield from "../../assets/logo-shield.png";
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
  HeartHandshake,
  Menu
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

let cachedStats = null;
let cachedRecentScans = null;
let lastHomeFetchTime = 0;

export default function Home() {
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState(cachedRecentScans || []);
  const [loading, setLoading] = useState(!cachedStats);
  const [stats, setStats] = useState(cachedStats || {
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
          const newStats = {
            totalScans: data.totalScans || 0,
            authentiks: data.authentiks || 0,
            counterfeit: data.counterfeit || 0,
            alert: data.alert || 0,
          };
          cachedStats = newStats;
          setStats(newStats);
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
              hour12: true
            });

            let type = "Verified";
            let statusLabel = "Verified";
            let statusText = "Verified Authentic";
            let badgeColor = "text-[#10B981]";
            let badgeBorder = "border-[#10B981]/30";
            let badgeBg = "bg-[#ECFDF5]";
            let statusIcon = "verified";

            let brandLogo = item.brandId?.brandLogo || null;

            if (item.status === "FAKE" || item.status === "INACTIVE") {
              type = "Counterfeit";
              statusLabel = "Counterfeit";
              statusText = "This product is identified as counterfeit. Please be cautious.";
              badgeColor = "text-[#EF4444]";
              badgeBorder = "border-[#EF4444]/30";
              badgeBg = "bg-[#FEF2F2]";
              statusIcon = "counterfeit";
            } else if (item.status === "ALREADY_USED" || item.status === "DUPLICATE") {
              type = "Duplicate";
              statusLabel = "Duplicate";
              statusText = "This product has been scanned before";
              badgeColor = "text-[#F59E0B]";
              badgeBorder = "border-[#F59E0B]/30";
              badgeBg = "bg-[#FFFBEB]";
              statusIcon = "alert";
            }

            const prod = item.productId || {};
            const category = prod.category || item.category || "Product";
            const brandName = item.brandId?.brandName || item.brandName || "";
            const productName = item.productName || prod.productName || "Unknown Product";

            const cardTitle = brandName ? (productName.toLowerCase().includes(brandName.toLowerCase()) ? productName : `${brandName} ${productName}`) : productName;

            return {
              id: item._id,
              type,
              cardTitle,
              productName,
              brandName,
              category,
              sn: item.qrCode || "Unknown",
              scannedDate: `${day} ${monthName} ${year}`,
              scannedTime: timeStr,
              brandLogo,
              statusLabel,
              statusText,
              badgeColor,
              badgeBorder,
              badgeBg,
              statusIcon,
              fullData: item,
              status: item.status
            };
          });

          cachedRecentScans = mappedData;
          lastHomeFetchTime = Date.now();
          setRecentScans(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch home data:", err);
      } finally {
        setLoading(false);
      }
    };

    // If cache is present, we still fetch in background to get latest updates silently
    fetchAllData();
  }, []);

  const handleRecentScanClick = (scan) => {
    let status = scan.fullData.status || "ORIGINAL";
    if (status === "ORIGINAL") {
      navigate('/product-passport', { state: scan.fullData });
    } else {
      navigate(`/result/${status}`, { state: scan.fullData });
    }
  };

  const handleScanClick = () => {
    navigate("/scan");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col relative w-full overflow-y-auto pb-24 overflow-x-hidden">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between px-5 pt-4 pb-4 bg-[#F8F9FA]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="p-1.5 -ml-1.5 rounded-full active:bg-slate-200 transition-colors">
            <Menu className="w-[26px] h-[26px] text-[#0B1E36]" strokeWidth={2} />
          </button>
          <div className="flex flex-col items-start justify-center gap-0.5">
            <div className="w-[145px] h-auto">
              <img src={logo} alt="Authentiks Logo" className="w-full h-auto object-contain" />
            </div>
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
          <div className="absolute right-[3%] top-[70%] transform -translate-y-1/2 w-[110px] h-[120px] z-10 pointer-events-none">
             <img src={logoShield} alt="Shield" className="w-full h-full object-contain drop-shadow-xl" style={{ animation: 'float 3s ease-in-out infinite' }} />
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
                return (
                  <div
                    key={index}
                    onClick={() => handleRecentScanClick(scan)}
                    className="bg-white rounded-[20px] p-3.5 flex gap-3.5 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#F1F5F9] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 active:scale-[0.98] mb-3"
                  >
                    {/* Brand Logo Container */}
                    <div className="w-[60px] h-[60px] rounded-[14px] border border-[#F1F5F9] flex items-center justify-center flex-shrink-0 overflow-hidden bg-white shadow-sm p-2">
                      {scan.brandLogo ? (
                        <img src={scan.brandLogo} alt={scan.cardTitle} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400">LOGO</span>
                      )}
                    </div>

                    {/* Content Container (Flex Column) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">

                      {/* Top Row: Title & Badge */}
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-[15px] text-[#0F172A] leading-tight truncate">
                            {scan.productName}
                          </h4>
                          <p className="text-[12px] text-[#64748B] truncate mt-0.5 font-medium">{scan.brandName || "Unknown Brand"}</p>
                        </div>

                        {/* Status Badge */}
                        <div className={`flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase ${scan.badgeColor} px-2 py-1 rounded-[6px] border ${scan.badgeBorder} ${scan.badgeBg}`}>
                          {scan.statusIcon === 'verified' && <ShieldCheck className="w-2.5 h-2.5" strokeWidth={3} />}
                          {scan.statusIcon === 'alert' && <AlertTriangle className="w-2.5 h-2.5" strokeWidth={3} />}
                          {scan.statusLabel}
                        </div>
                      </div>

                      {/* Bottom Row: Date/Time/Chevron */}
                      <div className="flex justify-between items-center mt-auto pt-2">
                        <div className="flex items-center gap-1.5 text-[#94A3B8] text-[11px] font-semibold">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>{scan.scannedDate}, {scan.scannedTime}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#CBD5E1]" strokeWidth={2.5} />
                      </div>

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
            
                <img src={logoShield} alt="Authentiks" className="w-[50px] h-[50px] object-contain drop-shadow-sm" />
             
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
