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
          const mappedData = data.map((item) => {
            const dateObj = new Date(item.createdAt);
            const dateStr = dateObj.toLocaleDateString("en-GB");
            const timeStr = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            }).toLowerCase(); // "10:10 am"

            let type = "valid";
            let icon = StatusValid;
            let content = {};

            if (item.status === "FAKE" || item.status === "INACTIVE") {
              type = item.status.toLowerCase();
              // "dangerous" icon (red circle x)
              icon = StatusFake;
              content = {
                title: item.status === "FAKE" ? "Fake or Counterfeit" : "Inactive QR Code",
                subtitle: item.status === "FAKE"
                  ? "This product doesn't match our authenticity records"
                  : "This product is currently inactive and cannot be verified",
              };
            } else if (item.status === "ALREADY_USED" || item.status === "DUPLICATE") {
              type = "duplicate";
              // "warning" icon (yellow triangle)
              icon = StatusDuplicate;
              content = {
                title: "Duplicate Scan",
                subtitle: "This QR code has been scanned before. Please check product details carefully."
              };
            } else {
              // Valid
              type = "valid";
              icon = StatusValid;
              const prod = item.productId || {};
              content = {
                brand: prod.brand || item.productName || "Amul",
                product: item.productName || prod.productName || "Amul Pure Ghee",
                mfdOn: prod.manufactureDate || "10/24",
                expOn: prod.expiryDate || "10/25",
              };
            }

            return {
              id: item._id,
              type,
              content,
              scannedDate: dateStr,
              scannedTime: timeStr,
              icon,
              latitude: item.latitude,
              longitude: item.longitude,
              place: item.place,
              originalScan: item.originalScan,
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
        className="w-full mb-5 bg-white rounded-[20px] shadow-[0_4px_20px_rgba(13,78,150,0.12)] overflow-hidden border border-white hover:shadow-[0_8px_30px_rgba(13,78,150,0.2)] transition-all duration-300 hover:scale-[1.02]"
        style={{
          animation: `fadeSlideUp 0.5s ease-out forwards`,
          animationDelay: `${index * 0.1}s`,
          opacity: 0
        }}
      >
        {/* Main Content */}
        <div className="flex items-center p-5 bg-gradient-to-br from-white to-[#F8FBFF]">
          {/* Icon Container with Premium Gradient */}
          <div className="relative w-[85px] h-[85px] flex-shrink-0 mr-4">
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-[16px] blur-xl opacity-40 ${
              item.type === 'valid' ? 'bg-gradient-to-br from-[#0D4E96] to-[#2CA4D6]' :
              ['fake', 'inactive'].includes(item.type) ? 'bg-gradient-to-br from-[#E30211] to-[#FF4444]' :
              'bg-gradient-to-br from-[#FFA500] to-[#FFCC00]'
            }`} />
            
            {/* Icon Background */}
            <div className={`relative w-full h-full rounded-[16px] flex items-center justify-center ${
              item.type === 'valid' ? 'bg-gradient-to-br from-[#E8F4F9] to-[#F0F9FF]' :
              ['fake', 'inactive'].includes(item.type) ? 'bg-gradient-to-br from-[#FFE8E8] to-[#FFF0F0]' :
              'bg-gradient-to-br from-[#FFF8E8] to-[#FFFBF0]'
            } shadow-lg`}>
              <img src={item.icon} alt={item.type} className="w-[60px] h-[60px] object-contain" />
            </div>
          </div>

          {/* Text Container */}
          <div className="flex-1">
            {item.type === 'valid' ? (
              <div className="text-[13px] leading-relaxed space-y-1">
                <p className="font-extrabold text-[#0D4E96]">
                  Brand: <span className="font-black bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] bg-clip-text text-transparent">{item.content.brand}</span>
                </p>
                <p className="font-bold text-[#214B80]">
                  Product: <span className="font-extrabold text-[#0D4E96]">{item.content.product}</span>
                </p>
                <p className="font-bold text-[#555]">
                  Mfd: <span className="font-extrabold text-[#333]">{item.content.mfdOn}</span>
                </p>
                <p className="font-bold text-[#555]">
                  Exp: <span className="font-extrabold text-[#333]">{item.content.expOn}</span>
                </p>
              </div>
            ) : (
              <div>
                <h3 className={`font-black text-[17px] mb-2 ${
                  ['fake', 'inactive'].includes(item.type) 
                    ? 'bg-gradient-to-r from-[#E30211] to-[#FF4444] bg-clip-text text-transparent' 
                    : 'bg-gradient-to-r from-[#FFA500] to-[#FF8C00] bg-clip-text text-transparent'
                }`}>
                  {item.content.title}
                </h3>
                <p className="text-[#555] text-[12px] font-semibold leading-snug">
                  {item.content.subtitle}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Premium Gradient Bar */}
        <div className="bg-gradient-to-r from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] text-white py-3 px-4 relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
               style={{ backgroundSize: '200% 100%' }} />
          
          <div className="relative">
            <div className="text-center text-[11px] font-bold">
              <span className="inline-flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {item.scannedDate}
              </span>
              <span className="mx-2 opacity-50">•</span>
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {item.scannedTime}
              </span>
            </div>
            
            {item.latitude && item.longitude && (
              <div className="text-center text-[10px] font-medium border-t border-white/20 pt-2 mt-2 opacity-90">
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{parseFloat(item.latitude).toFixed(4)}, {parseFloat(item.longitude).toFixed(4)}</span>
                </div>
                {item.place && <div className="text-[9px] mt-1">{item.place}</div>}
              </div>
            )}
            
            {item.originalScan && (
              <div className="text-center text-[10px] font-medium border-t border-white/20 pt-2 mt-2 italic opacity-80">
                First scanned by {item.originalScan.scannedBy} on {new Date(item.originalScan.scannedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <MobileHeader
        onBackClick={() => navigate(-1)}
      />

      {/* Content Container */}
      <div className="px-6 pt-6 pb-10">
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
