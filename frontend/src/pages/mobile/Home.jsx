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
  Menu,
  Clock,
  CheckCircle2,
  Star,
  Gift,
  Lock
} from "lucide-react";
import Lottie from "lottie-react";
import coinAnimationData from "../../assets/gold_coin.json";






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
    activeWarranties: 0,
    rewardsData: {
      totalRewardValue: 0,
      pendingRewardValue: 0,
      reviews: { submitted: 0, pending: 0 },
      coupons: { unlocked: 1, available: 1 },
      warranty: { active: 0, inactive: 0 }
    }
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
            activeWarranties: data.activeWarranties || 0,
            rewardsData: data.rewardsData || {
              totalRewardValue: 0,
              reviews: { submitted: 0, pending: 0 },
              coupons: { unlocked: 1, available: 1 },
              warranty: { active: 0, inactive: 0 }
            }
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
            let ribbonColor = "#10B981"; // Green for verified

            let brandLogo = item.brandId?.brandLogo || null;
            let productImage = item.productImage || item.productId?.productImage || (item.images && item.images.length > 0 ? item.images[0] : null);

            if (item.status === "FAKE" || item.status === "INACTIVE") {
              type = "Counterfeit";
              statusLabel = "Counterfeit";
              statusText = "This product is identified as counterfeit. Please be cautious.";
              badgeColor = "text-[#EF4444]";
              badgeBorder = "border-[#EF4444]/30";
              badgeBg = "bg-[#FEF2F2]";
              statusIcon = "counterfeit";
              ribbonColor = "#EF4444"; // Red for counterfeit
            } else if (item.status === "ALREADY_USED" || item.status === "DUPLICATE") {
              type = "Duplicate";
              statusLabel = "Duplicate";
              statusText = "This product has been scanned before";
              badgeColor = "text-[#F59E0B]";
              badgeBorder = "border-[#F59E0B]/30";
              badgeBg = "bg-[#FFFBEB]";
              statusIcon = "alert";
              ribbonColor = "#F59E0B"; // Amber for duplicate
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
              productImage,
              statusLabel,
              statusText,
              badgeColor,
              badgeBorder,
              badgeBg,
              statusIcon,
              ribbonColor,
              fullData: item,
              status: item.status,
              alreadyReviewed: item.alreadyReviewed
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
      if (scan.alreadyReviewed) {
        navigate('/product-passport', { state: scan.fullData });
      } else {
        navigate(`/result/${status}`, { state: scan.fullData });
      }
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

        {/* Rewards & Engagement Section */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#0B1E36] text-[16px] font-bold">Rewards & Engagement</h3>
            <button onClick={() => navigate('/rewards')} className="text-[#105DE4] text-[13px] font-bold flex items-center gap-0.5 hover:underline">
              View All <ChevronRight className="w-[14px] h-[14px]" />
            </button>
          </div>

          {/* Two Cards Side by Side */}
          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Rewards Unlocked Card */}
            <div className="bg-[#F4FAF6] rounded-[18px] p-2.5 sm:p-3 border border-[#E3F2E9] flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              {/* Top Section: Icon + Text Stack */}
              <div className="flex items-center gap-1.5 mb-2.5">
                {/* 3D Coin Icon */}
                <div className="w-[42px] h-[42px] shrink-0 flex items-center justify-center relative">
                  <Lottie 
                    animationData={coinAnimationData} 
                    loop={true} 
                    className="w-[42px] h-[42px] drop-shadow-[0_3px_5px_rgba(0,0,0,0.12)]"
                  />
                </div>
                {/* Info & Amount */}
                <div className="flex flex-col min-w-0 flex-1 justify-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[#0B1E36] font-bold text-[8px] sm:text-[10px] leading-tight whitespace-nowrap">Rewards Unlocked</span>
                    <div className="w-[12px] h-[12px] rounded-full border border-[#64748B] flex items-center justify-center text-[#64748B] text-[7px] font-bold shrink-0">i</div>
                  </div>
                  <h2 className="text-[#00A859] font-extrabold text-[20px] sm:text-[22px] leading-tight tracking-tight mt-0.5">
                    ₹{stats.rewardsData.totalRewardValue.toLocaleString('en-IN')}
                  </h2>
                </div>
              </div>

              {/* CTA Button - Rounded Pill */}
              <button 
                onClick={() => navigate('/rewards')} 
                className="w-full bg-[#009944] hover:bg-[#00853B] text-white font-bold text-[10px] sm:text-[11px] py-1.5 px-2.5 rounded-full flex items-center justify-between active:scale-[0.97] transition-all shadow-[0_2px_6px_rgba(0,153,68,0.2)]"
              >
                <span className="whitespace-nowrap">Redeem Rewards</span>
                <ChevronRight className="w-[12px] h-[12px] shrink-0 stroke-[3]" />
              </button>
            </div>

            {/* Rewards Unclaimed Card */}
            <div className="bg-[#F8F6FE] rounded-[18px] p-2.5 sm:p-3 border border-[#EBE7FE] flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              {/* Top Section: Lock Icon + Text Stack */}
              <div className="flex items-center gap-1.5 mb-2.5">
                {/* 3D Lock Icon */}
                <div className="w-[42px] h-[42px] shrink-0 flex items-center justify-center">
                  <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#7C3AED] to-[#582CFF] flex items-center justify-center shadow-[0_3px_8px_rgba(88,44,255,0.25)] border-[1.5px] border-[#A78BFA]/40">
                    <Lock className="w-[16px] h-[16px] text-white" strokeWidth={2.5} />
                  </div>
                </div>
                {/* Info & Amount */}
                <div className="flex flex-col min-w-0 flex-1 justify-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[#0B1E36] font-bold text-[8px] sm:text-[10px] leading-tight whitespace-nowrap">Rewards Unclaimed</span>
                    <div className="w-[12px] h-[12px] rounded-full border border-[#64748B] flex items-center justify-center text-[#64748B] text-[7px] font-bold shrink-0">i</div>
                  </div>
                  <h2 className="text-[#4318FF] font-extrabold text-[20px] sm:text-[22px] leading-tight tracking-tight mt-0.5">
                    ₹{stats.rewardsData.pendingRewardValue?.toLocaleString('en-IN') ?? '0'}
                  </h2>
                </div>
              </div>

              {/* CTA Button - Rounded Pill */}
              <button 
                onClick={() => navigate('/rewards')} 
                className="w-full bg-[#4F2DED] hover:bg-[#4323D6] text-white font-bold text-[9.5px] sm:text-[10.5px] py-1.5 px-2 rounded-full flex items-center justify-between active:scale-[0.97] transition-all shadow-[0_2px_6px_rgba(79,45,237,0.2)]"
              >
                <span className="whitespace-nowrap">Review & Claim Now</span>
                <ChevronRight className="w-[12px] h-[12px] shrink-0 stroke-[3]" />
              </button>
            </div>

          </div>

          {/* Grid of 3 Cards (Reviews, Coupons, Warranty) */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {/* Reviews Card */}
            <div className="bg-gradient-to-b from-[#F0FDF4] to-[#FFFFFF] rounded-[16px] p-3 flex flex-col items-center border border-[#BBF7D0] shadow-[0_2px_8px_rgba(16,185,129,0.05)]">
              <div className="w-[32px] h-[32px] rounded-full bg-white border border-[#BBF7D0] flex items-center justify-center mb-1 shadow-sm text-[#10B981]">
                 <Star className="w-[16px] h-[16px] fill-[#10B981] stroke-[#10B981]" />
              </div>
              <span className="text-[#0F172A] font-bold text-[12px] mb-2">Reviews</span>
              <div className="flex w-full items-center justify-between px-1">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[#10B981] font-black text-[16px] leading-none mb-0.5">{stats.rewardsData.reviews.submitted}</span>
                  <span className="text-[#0F172A] text-[9px] font-semibold">Submitted</span>
                </div>
                <div className="w-[1px] h-[20px] bg-[#BBF7D0]"></div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[#F59E0B] font-black text-[16px] leading-none mb-0.5">{stats.rewardsData.reviews.pending}</span>
                  <span className="text-[#0F172A] text-[9px] font-semibold">Pending</span>
                </div>
              </div>
            </div>

            {/* Coupons Card */}
            <div className="bg-gradient-to-b from-[#FAF5FF] to-[#FFFFFF] rounded-[16px] p-3 flex flex-col items-center border border-[#E9D5FF] shadow-[0_2px_8px_rgba(147,51,234,0.05)]">
              <div className="w-[32px] h-[32px] rounded-full bg-white border border-[#E9D5FF] flex items-center justify-center mb-1 shadow-sm text-[#9333EA]">
                 <Gift className="w-[16px] h-[16px] stroke-[2]" style={{ animation: 'nod 2s ease-in-out infinite' }} />
              </div>
              <span className="text-[#0F172A] font-bold text-[12px] mb-2">Coupons</span>
              <div className="flex w-full items-center justify-between px-1">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[#9333EA] font-black text-[16px] leading-none mb-0.5">{stats.rewardsData.coupons.unlocked}</span>
                  <span className="text-[#0F172A] text-[9px] font-semibold">Unlocked</span>
                </div>
                <div className="w-[1px] h-[20px] bg-[#E9D5FF]"></div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[#F59E0B] font-black text-[16px] leading-none mb-0.5">{stats.rewardsData.coupons.available}</span>
                  <span className="text-[#0F172A] text-[9px] font-semibold">Pending</span>
                </div>
              </div>
            </div>

            {/* Warranty Card */}
            <div className="bg-gradient-to-b from-[#EFF6FF] to-[#FFFFFF] rounded-[16px] p-3 flex flex-col items-center border border-[#BFDBFE] shadow-[0_2px_8px_rgba(59,130,246,0.05)]">
              <div className="w-[32px] h-[32px] rounded-full bg-white border border-[#BFDBFE] flex items-center justify-center mb-1 shadow-sm text-[#3B82F6]">
                 <ShieldCheck className="w-[16px] h-[16px] stroke-[2]" />
              </div>
              <span className="text-[#0F172A] font-bold text-[12px] mb-2">Warranty</span>
              <div className="flex w-full items-center justify-between px-1">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[#3B82F6] font-black text-[16px] leading-none mb-0.5">{stats.rewardsData.warranty.active}</span>
                  <span className="text-[#0F172A] text-[9px] font-semibold">Active</span>
                </div>
                <div className="w-[1px] h-[20px] bg-[#BFDBFE]"></div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[#105DE4] font-black text-[16px] leading-none mb-0.5">{stats.rewardsData.warranty.inactive}</span>
                  <span className="text-[#0F172A] text-[9px] font-semibold">Inactive</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - One White Card Container */}
        {/* <div className="w-full bg-white rounded-[24px] py-[18px] px-2 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F1F5F9]">
          <div className="flex items-center justify-between w-full">

            <div className="flex flex-col items-center flex-1">
              <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center mb-1.5 bg-[#F0F5FF]">
                <ScanLine className="w-[20px] h-[20px] text-[#105DE4]" />
              </div>
              <span className="text-[#0B1E36] font-extrabold text-[22px] leading-none mb-[3px]">{stats.totalScans}</span>
              <span className="text-[#5A7184] text-[10.5px] font-medium text-center leading-tight">Total Scans</span>
            </div>
            
            <div className="w-[1px] h-[55px] bg-[#F1F5F9] mx-1"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center mb-1.5 bg-[#ECFDF5]">
                <ShieldCheck className="w-[20px] h-[20px] text-[#10B981]" />
              </div>
              <span className="text-[#0B1E36] font-extrabold text-[22px] leading-none mb-[3px]">{stats.authentiks}</span>
              <span className="text-[#5A7184] text-[10.5px] font-medium text-center leading-tight">Verified</span>
            </div>

            <div className="w-[1px] h-[55px] bg-[#F1F5F9] mx-1"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center mb-1.5 bg-[#FFFBEB]">
                <AlertTriangle className="w-[20px] h-[20px] text-[#F59E0B]" />
              </div>
              <span className="text-[#0B1E36] font-extrabold text-[22px] leading-none mb-[3px]">{stats.alert}</span>
              <span className="text-[#5A7184] text-[10.5px] font-medium text-center leading-tight">Alert</span>
            </div>

            <div className="w-[1px] h-[55px] bg-[#F1F5F9] mx-1"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center mb-1.5 bg-[#FEF2F2]">
                <ShieldX className="w-[20px] h-[20px] text-[#EF4444]" />
              </div>
              <span className="text-[#0B1E36] font-extrabold text-[22px] leading-none mb-[3px]">{stats.counterfeit}</span>
              <span className="text-[#5A7184] text-[10.5px] font-medium text-center leading-tight">Counterfeit</span>
            </div>

          </div>
        </div> */}

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
                    className="bg-white rounded-[20px] flex overflow-hidden cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#F1F5F9] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 active:scale-[0.98] mb-3 relative"
                  >
                    {/* Left Ribbon */}
                    <div 
                      className="w-[5px] flex-shrink-0 rounded-l-[20px]" 
                      style={{ backgroundColor: scan.ribbonColor }}
                    />

                    <div className="flex flex-col w-full">
                      {/* Top Row: Image, Text, Chevron */}
                      <div className="flex items-center gap-3 p-3.5 pb-2">
                        {/* Image Container */}
                        <div className="w-[64px] h-[64px] rounded-[12px] flex items-center justify-center flex-shrink-0 overflow-hidden p-1"
                          style={{ backgroundColor: scan.productImage ? '#FFFFFF' : scan.ribbonColor + '15' }}
                        >
                          {scan.productImage ? (
                            <img src={scan.productImage} alt={scan.cardTitle} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[18px] font-black" style={{ color: scan.ribbonColor }}>
                              {(scan.brandName || scan.productName || 'P').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-[14px] text-[#1E293B] leading-tight mb-1 truncate">
                            {scan.productName}
                          </h4>
                          <p className="text-[12px] text-[#64748B] truncate mt-0.5 font-medium mb-1.5">{scan.brandName || "Unknown Brand"}</p>
                          <div className="flex items-center gap-1.5 text-[#94A3B8] text-[10px] font-semibold">
                            <Calendar className="w-3 h-3 shrink-0" strokeWidth={2} />
                            <span>{scan.scannedDate}, {scan.scannedTime}</span>
                          </div>
                        </div>

                        {/* Chevron */}
                        <ChevronRight className="w-5 h-5 text-[#CBD5E1] flex-shrink-0" strokeWidth={2.5} />
                      </div>

                      {/* Bottom Row: Badges */}
                      {scan.status === "ORIGINAL" && (
                        <div className="mx-3.5 mb-3.5 mt-1 border border-[#F1F5F9] rounded-[8px] bg-[#F8FAFC] py-1.5 px-0.5 flex items-center divide-x divide-[#E2E8F0]">
                          
                          {/* Reviewed */}
                          <div className="flex-1 flex flex-col justify-center items-center px-0.5 text-center min-w-0 overflow-hidden">
                            <div className="flex items-center justify-center gap-0.5 mb-[1px] w-full">
                              <Star className={`w-[9px] h-[9px] shrink-0 ${scan.alreadyReviewed ? 'text-[#10B981]' : 'text-[#94A3B8]'}`} strokeWidth={2.5} />
                              <span className={`text-[7.5px] font-bold truncate ${scan.alreadyReviewed ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
                                {scan.alreadyReviewed ? 'Reviewed' : 'Review'}
                              </span>
                            </div>
                            <span className="text-[6.5px] text-[#64748B] font-semibold truncate w-full">
                              {scan.alreadyReviewed ? 'Thank you for your review!' : 'Share your feedback'}
                            </span>
                          </div>

                          {/* Reward */}
                          <div className="flex-1 flex flex-col justify-center items-center px-0.5 text-center min-w-0 overflow-hidden">
                            <div className="flex items-center justify-center gap-0.5 mb-[1px] w-full">
                              <Gift className={`w-[9px] h-[9px] shrink-0 ${scan.alreadyReviewed ? 'text-[#8B5CF6]' : 'text-[#94A3B8]'}`} strokeWidth={2.5} />
                              <span className={`text-[7.5px] font-bold truncate ${scan.alreadyReviewed ? 'text-[#8B5CF6]' : 'text-[#94A3B8]'}`}>
                                {scan.alreadyReviewed ? 'Reward Claimed' : 'No Reward'}
                              </span>
                            </div>
                            <span className="text-[6.5px] text-[#64748B] font-semibold truncate w-full">
                              {scan.alreadyReviewed ? 'You saved ₹200' : 'Not claimed'}
                            </span>
                          </div>

                          {/* Warranty */}
                          <div className="flex-1 flex flex-col justify-center items-center px-0.5 text-center min-w-0 overflow-hidden">
                            <div className="flex items-center justify-center gap-0.5 mb-[1px] w-full">
                              <ShieldCheck className={`w-[9px] h-[9px] shrink-0 ${scan.alreadyReviewed ? 'text-[#105DE4]' : 'text-[#94A3B8]'}`} strokeWidth={2.5} />
                              <span className={`text-[7.5px] font-bold truncate ${scan.alreadyReviewed ? 'text-[#105DE4]' : 'text-[#94A3B8]'}`}>
                                {scan.alreadyReviewed ? 'Warranty Activated' : 'No Warranty'}
                              </span>
                            </div>
                            <span className="text-[6.5px] text-[#64748B] font-semibold truncate w-full">
                              {scan.alreadyReviewed ? 'Valid till 12 Jul 2027' : 'Not applicable'}
                            </span>
                          </div>

                        </div>
                      )}
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
          @keyframes nod {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-15deg); }
            75% { transform: rotate(15deg); }
          }
          @keyframes gift-shake {
            0%, 100% { transform: rotate(0deg) scale(1); }
            10% { transform: rotate(15deg) scale(1.1); }
            20% { transform: rotate(-15deg) scale(1.1); }
            30% { transform: rotate(15deg) scale(1.1); }
            40% { transform: rotate(-15deg) scale(1.1); }
            50% { transform: rotate(0deg) scale(1.1); }
            60% { transform: rotate(0deg) scale(1) translateY(-10px); }
            70% { transform: rotate(0deg) scale(1) translateY(0px); }
            80% { transform: rotate(0deg) scale(1) translateY(-5px); }
            90% { transform: rotate(0deg) scale(1) translateY(0px); }
          }
          .coin-3d-container {
            perspective: 1000px;
            width: 52px;
            height: 52px;
          }
          .coin-3d {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            animation: spin-coin-3d 3s linear infinite;
          }
          .coin-layer {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #B45309; /* Darker edge color */
          }
          .coin-face {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, #FDE68A, #D97706 85%);
            border: 3px solid #F59E0B;
            box-shadow: inset 0 0 15px rgba(255,255,255,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            backface-visibility: hidden;
          }
          .coin-inner {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 1.5px solid #D97706;
            box-shadow: inset 0 0 5px rgba(217,119,6,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #92400E;
            font-size: 22px;
            font-weight: 900;
            text-shadow: 1px 1px 0px rgba(253,230,138,0.8);
          }
          .coin-front {
            transform: translateZ(6px);
          }
          .coin-back {
            transform: rotateY(180deg) translateZ(0px); /* Adjusting Z to touch edge */
          }
          @keyframes float-tilt {
            0% { transform: translateY(0px) rotate(0deg) scale(1); }
            50% { transform: translateY(-6px) rotate(5deg) scale(1.05); }
            100% { transform: translateY(0px) rotate(0deg) scale(1); }
          }
        `}
      </style>
    </div>
  );
}
