import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import MobileHeader from "../../components/MobileHeader";

// Assets
import StatusValid from "../../assets/logo.svg";
import StatusFake from "../../assets/v2/history/dangerous.svg";
import StatusDuplicate from "../../assets/v2/history/warning.svg";

export default function ScanHistory() {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/scan/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          // Map data
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const mappedData = data.map((item) => {
            const dateObj = new Date(item.createdAt);
            const day = String(dateObj.getDate()).padStart(2, "0");
            const monthName = monthNames[dateObj.getMonth()];
            const year = dateObj.getFullYear();
            const timeStr = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            });

            let type = "valid";
            let icon = StatusValid;
            let content = {};
            let statusLabel = "Verified";
            let badgeColor = "text-[#2CA4D6]";
            let badgeBg = "bg-[#E8F4F9]";
            let statusBadgeIcon = "verified";

            // Extract brand logo from populated brandId or company
            let brandLogo = item.brandId?.brandLogo || null;

            if (item.status === "FAKE" || item.status === "INACTIVE") {
              type = item.status.toLowerCase();
              icon = StatusFake;
              brandLogo = null;
              statusLabel = "Counterfeit";
              badgeColor = "text-[#DC2626]";
              badgeBg = "bg-[#FEF2F2]";
              statusBadgeIcon = "counterfeit";
              content = {
                title: item.status === "FAKE" ? "Fake or Counterfeit" : "Inactive QR Code",
                subtitle: item.status === "FAKE"
                  ? "This product doesn't match our authenticity records"
                  : "This product is currently inactive and cannot be verified",
              };
            } else if (item.status === "ALREADY_USED" || item.status === "DUPLICATE") {
              type = "duplicate";
              icon = StatusDuplicate;
              statusLabel = "Alert";
              badgeColor = "text-[#EA580C]";
              badgeBg = "bg-[#FFF7ED]";
              statusBadgeIcon = "alert";
              content = {
                title: "Duplicate Scan",
                subtitle: "This QR code has been scanned before. Please check product details carefully."
              };
            } else {
              type = "valid";
              icon = StatusValid;
              const prod = item.productId || {};
              content = {
                brand: prod.brand || item.productName || "Brand",
                product: item.productName || prod.productName || "Product",
                mfdOn: prod.manufactureDate || "--",
                expOn: prod.expiryDate || "--",
              };
            }

            // Title for the card (brand name or product name)
            const cardTitle = type === 'valid' 
              ? (item.brandId?.brandName || item.productName || content.product)
              : content.title;

            return {
              id: item._id,
              type,
              content,
              cardTitle,
              productName: item.productName,
              scannedDate: `${day} ${monthName} ${year}`,
              scannedTime: timeStr,
              icon,
              brandLogo,
              statusLabel,
              badgeColor,
              badgeBg,
              statusBadgeIcon,
              latitude: item.latitude,
              longitude: item.longitude,
              place: item.place,
              originalScan: item.originalScan,
              fullData: item,
              status: item.status
            };
          });
          setHistoryItems(mappedData);
        }
      } catch (err) {
        console.error("Error fetching scan history:", err);
      }
    };

    fetchHistory();
  }, []);

  const Card = ({ item, index }) => {
    return (
      <div 
        onClick={() => navigate(`/result/${item.status || 'ORIGINAL'}`, { state: item.fullData })}
        className="bg-white rounded-[16px] p-3.5 flex items-center cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#F0F0F0] hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all duration-300 active:scale-[0.98] mb-3"
        style={{
          animation: `fadeSlideUp 0.5s ease-out forwards`,
          animationDelay: `${index * 0.06}s`,
          opacity: 0
        }}
      >
        {/* Brand Logo with Status Badge */}
        <div className="relative w-[60px] h-[60px] flex-shrink-0 mr-3.5">
          {/* Logo Circle */}
          <div className="w-full h-full rounded-full bg-[#F5F5F5] border-2 border-[#E8E8E8] flex items-center justify-center overflow-hidden">
            {item.brandLogo ? (
              <img
                src={item.brandLogo}
                alt={item.cardTitle}
                className="w-[40px] h-[40px] object-contain"
              />
            ) : (
              <img
                src={item.icon}
                alt={item.type}
                className="w-[32px] h-[32px] object-contain"
              />
            )}
          </div>
          
          {/* Status Badge Overlay */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
            item.statusBadgeIcon === 'verified' 
              ? 'bg-[#2CA4D6]'
              : item.statusBadgeIcon === 'alert'
              ? 'bg-[#F59E0B]'
              : 'bg-[#DC2626]'
          }`}>
            {item.statusBadgeIcon === 'verified' ? (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : item.statusBadgeIcon === 'alert' ? (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Text Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="font-bold text-[15px] text-[#1A1A2E] leading-tight mb-0.5 truncate">
            {item.productName}
          </h4>
          {item.statusBadgeIcon === 'verified' && item.productName && item.cardTitle !== item.productName && (
            <p className="text-[13px] text-[#6B7280] font-medium mb-1.5 truncate">
              {item.cardTitle}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
            </svg>
            <p className="text-[#6B7280] text-[10px] font-medium">
              {item.scannedDate} • {item.scannedTime}
            </p>
          </div>
        </div>
        
        {/* Badge and Chevron */}
        <div className="flex items-center flex-shrink-0">
          <div className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase ${item.badgeColor} px-2.5 py-1 rounded-full ${item.badgeBg}`}>
            {item.statusLabel}
          </div>
          <svg 
            className="w-5 h-5 text-[#C4C4C4]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <MobileHeader
        title="My History"
        onBackClick={() => navigate(-1)}
      />

      {/* Content Container */}
      <div className="px-4 pt-6 pb-24">
        {historyItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 pt-24">
            {/* Gradient Icon */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF] flex items-center justify-center shadow-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="url(#historyGradient)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="w-12 h-12"
                >
                  <defs>
                    <linearGradient id="historyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0D4E96" />
                      <stop offset="100%" stopColor="#2CA4D6" />
                    </linearGradient>
                  </defs>
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              {/* Decorative Elements */}
              <div 
                className="absolute w-3 h-3 bg-[#2CA4D6] rounded-full opacity-30"
                style={{
                  top: '10%',
                  left: '-20%',
                  animation: 'pulse 2s infinite'
                }}
              />
              <div 
                className="absolute w-2 h-2 bg-[#0D4E96] rounded-full opacity-30"
                style={{
                  top: '30%',
                  right: '-15%',
                  animation: 'pulse 2s infinite',
                  animationDelay: '0.5s'
                }}
              />
              <div 
                className="absolute w-2.5 h-2.5 bg-[#1a5fa8] rounded-full opacity-30"
                style={{
                  bottom: '20%',
                  left: '-10%',
                  animation: 'pulse 2s infinite',
                  animationDelay: '1s'
                }}
              />
            </div>

            {/* Empty State Text */}
            <div className="text-center">
              <h2 className="text-[#0D4E96] font-black text-[20px] mb-2">
                No Scan History
              </h2>
              <p className="text-gray-600 text-[14px] max-w-[280px]">
                Start scanning products to build your verification history and track authenticity.
              </p>
            </div>
            
            {/* CTA Button */}
            <button
              onClick={() => navigate('/scan')}
              className="mt-6 px-8 py-3.5 bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white font-bold text-[15px] rounded-[30px] shadow-[0_8px_24px_rgba(13,78,150,0.35)] active:scale-95 transition-all"
            >
              Scan Your First Product
            </button>
          </div>
        ) : (
          <div>
            {historyItems.map((item, index) => <Card key={item.id} item={item} index={index} />)}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>
        {`
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
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .animate-shimmer {
            animation: shimmer 3s infinite linear;
          }
        `}
      </style>
    </div>
  );
}
