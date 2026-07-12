import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, HelpCircle, ChevronRight, Shield, AlertTriangle } from 'lucide-react';
import { getMyWarrantyClaims } from '../../config/api';
import MobileNavbar from '../../components/MobileNavbar';

// Shield Hero Icon SVG
const ShieldHeroIcon = () => (
  <svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="32" fill="#EBF2FF" />
    <path d="M40 18 L26 24 V38 C26 51 34 62 40 66 C46 62 54 51 54 38 V24 L40 18 Z" fill="#105DE4" />
    <path d="M40 18 L26 24 V38 C26 51 34 62 40 66 C46 62 54 51 54 38 V24 L40 18 Z" fill="url(#paint0_linear)" />
    <path d="M34 40 L38 44 L47 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Decorative dots */}
    <circle cx="16" cy="24" r="1.5" fill="#105DE4" opacity="0.4" />
    <circle cx="64" cy="20" r="2" fill="#105DE4" opacity="0.6" />
    <circle cx="68" cy="34" r="1" fill="#105DE4" opacity="0.3" />
    <circle cx="64" cy="56" r="1.5" fill="#105DE4" opacity="0.5" />
    <circle cx="20" cy="60" r="2" fill="#105DE4" opacity="0.4" />
    <circle cx="12" cy="44" r="1" fill="#105DE4" opacity="0.6" />
    <defs>
      <linearGradient id="paint0_linear" x1="26" y1="18" x2="54" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F8BFF" />
        <stop offset="1" stopColor="#0B42A5" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Warranty() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active'); // active, expired, claims
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await getMyWarrantyClaims(token);
      setClaims(data);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateExpiry = (purchaseDate: string, duration: number, unit: string) => {
    const date = new Date(purchaseDate);
    if (unit === 'years') {
      date.setFullYear(date.getFullYear() + duration);
    } else {
      date.setMonth(date.getMonth() + duration);
    }
    return date;
  };

  const categorizedClaims = {
    active: claims.filter(c => {
      if (c.status === 'Rejected') return false;
      if (c.issue) return false;
      const expiry = calculateExpiry(c.purchaseDate, c.warrantyInfo?.duration || 0, c.warrantyInfo?.durationUnit || 'years');
      return expiry.getTime() > new Date().getTime();
    }),
    expired: claims.filter(c => {
      const expiry = calculateExpiry(c.purchaseDate, c.warrantyInfo?.duration || 0, c.warrantyInfo?.durationUnit || 'years');
      return expiry.getTime() <= new Date().getTime();
    }),
    claims: claims.filter(c => c.issue || (c.status !== 'Registered' && c.status !== 'Sent'))
  };

  const currentList = categorizedClaims[activeTab as keyof typeof categorizedClaims] || [];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col relative pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-[#0B1E36] rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-[17px] font-bold text-[#0B1E36] tracking-tight">My Warranty</h1>
        <button className="p-1 -mr-1 text-[#0B1E36] rounded-full hover:bg-slate-100 transition-colors">
          <HelpCircle size={22} strokeWidth={2} />
        </button>
      </div>

      <div className="px-4 pt-2">
        {/* Hero Card */}
        <div className="bg-[#F8FAFF] rounded-[16px] border border-[#EDF2FE] p-4 flex items-center gap-4 mb-6">
          <ShieldHeroIcon />
          <div className="flex-1 pr-2">
            <h2 className="text-[#0B1E36] text-[16px] font-bold mb-1">We've got you covered!</h2>
            <p className="text-slate-500 text-[12px] leading-snug font-medium">
              View all your registered products and track your warranty status.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 mb-5 px-2">
          {['active', 'expired', 'claims'].map((tab) => {
            const count = categorizedClaims[tab as keyof typeof categorizedClaims].length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-3 text-[14px] font-bold capitalize transition-colors relative ${
                  isActive ? 'text-[#105DE4]' : 'text-slate-500'
                }`}
              >
                {tab} ({count})
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#105DE4] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* List Content */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-3 border-[#105DE4] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 font-medium text-[14px]">No {activeTab} warranties found.</p>
              </div>
            ) : (
              currentList.map(item => (
                <WarrantyCard key={item._id} item={item} activeTab={activeTab} />
              ))
            )}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-8 mb-6 bg-[#F8FAFC] rounded-[16px] p-4 border border-slate-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-50 text-[#105DE4]">
            <Shield size={20} strokeWidth={2} />
          </div>
          <div className="flex-1 pr-1">
            <h4 className="text-[#0B1E36] text-[13px] font-bold mb-1">Warranty Expired?</h4>
            <p className="text-slate-500 text-[11px] leading-snug font-medium mb-3">
              Extend your warranty and continue to enjoy protection and peace of mind.
            </p>
            <button className="bg-[#105DE4] text-white text-[12px] font-bold py-2.5 px-6 rounded-[8px] active:scale-95 transition-transform">
              Extend Now
            </button>
          </div>
        </div>

      </div>
      
      <MobileNavbar />
    </div>
  );
}

function WarrantyCard({ item, activeTab }: { item: any, activeTab: string }) {
  const purchaseDate = new Date(item.purchaseDate);
  const duration = item.warrantyInfo?.duration || 0;
  const unit = item.warrantyInfo?.durationUnit || 'years';
  
  const expiryDate = new Date(item.purchaseDate);
  if (unit === 'years') expiryDate.setFullYear(expiryDate.getFullYear() + duration);
  else expiryDate.setMonth(expiryDate.getMonth() + duration);

  const now = new Date();
  const totalDuration = expiryDate.getTime() - purchaseDate.getTime();
  const elapsed = now.getTime() - purchaseDate.getTime();
  const remaining = expiryDate.getTime() - now.getTime();
  
  const isExpired = remaining <= 0;
  
  let progressPercent = 100 - Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  if (isExpired) progressPercent = 0;

  const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));
  const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const isDanger = progressPercent < 20;
  const barColor = isDanger ? 'bg-[#F97316]' : 'bg-[#22C55E]';
  const textColor = isDanger ? 'text-[#F97316]' : 'text-[#22C55E]';

  // Claims tab: show claim-specific card
  if (activeTab === 'claims') {
    return (
      <div className="bg-white rounded-[16px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 flex gap-3">
          {/* Product Image */}
          <div className="w-[56px] h-[56px] bg-slate-50 rounded-[10px] flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
            <img 
              src={item.productId?.productImage || "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png"} 
              alt={item.productName} 
              className="w-full h-full object-cover mix-blend-multiply" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[#0B1E36] text-[14px] font-bold leading-tight truncate mb-0.5">{item.productName}</h3>
            <p className="text-[#64748B] text-[11px] font-medium truncate">
              {item.productId?.category || item.productId?.brand || 'Product'} · SN: {item.qrCode.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold shrink-0 self-start ${
            item.status === 'Resolved' ? 'bg-[#F0FDF4] text-[#22C55E]' :
            item.status === 'Rejected' ? 'bg-[#FEF2F2] text-[#EF4444]' :
            'bg-[#FFF7ED] text-[#F97316]'
          }`}>
            {item.status}
          </div>
        </div>

        {/* Claim Details */}
        <div className="px-4 pb-4">
          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-[10px] p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-[#F59E0B] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#92400E] text-[11px] font-bold mb-0.5">Issue Reported</p>
                <p className="text-[#92400E] text-[11px] font-medium leading-snug">{item.issue}</p>
              </div>
            </div>
          </div>

          {/* Status Progress */}
          <div className="mt-3 flex items-center gap-1">
            {['Sent', 'Processing', 'Reviewing', 'Contacted', 'Resolved'].map((s, i) => {
              const steps = ['Sent', 'Processing', 'Reviewing', 'Contacted', 'Resolved'];
              const currentIdx = steps.indexOf(item.status);
              const isDone = i <= currentIdx && item.status !== 'Rejected';
              return (
                <div key={s} className={`flex-1 h-1.5 rounded-full ${
                  isDone ? 'bg-[#F97316]' : 'bg-[#F1F5F9]'
                }`} />
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-[#64748B] font-medium">Sent</span>
            <span className="text-[9px] text-[#64748B] font-medium">Resolved</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[16px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex gap-3">
      {/* Product Image */}
      <div className="w-[64px] h-[64px] bg-slate-50 rounded-[10px] flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
        <img 
          src={item.productId?.productImage || "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png"} 
          alt={item.productName} 
          className="w-full h-full object-cover mix-blend-multiply" 
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="text-[#0B1E36] text-[14px] font-bold leading-tight truncate pr-2">
            {item.productName}
          </h3>
          <div className={`px-2 py-0.5 rounded-[4px] text-[10px] font-extrabold uppercase shrink-0 ${
            isExpired ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F0FDF4] text-[#22C55E]'
          }`}>
            {isExpired ? 'Expired' : 'Active'}
          </div>
        </div>

        <p className="text-[#64748B] text-[11px] font-medium mb-1 truncate">
          {item.productId?.category || item.productId?.brand || 'Verified Product'}
        </p>
        <p className="text-[#0B1E36] text-[11px] font-bold mb-0.5 truncate">
          SN: {item.qrCode.slice(-10).toUpperCase()}
        </p>
        <p className="text-[#64748B] text-[10px] font-medium truncate">
          Registered on {formatDate(purchaseDate)}
        </p>

        {!isExpired ? (
          <>
            {/* Days Left - right aligned row */}
            <div className="flex justify-between items-end mt-2">
              <div />
              <div className="text-right">
                <span className={`text-[20px] font-bold leading-none ${textColor}`}>{daysLeft}</span>
                <span className="text-[#0B1E36] text-[10px] font-bold ml-1">Days Left</span>
                <p className="text-[#64748B] text-[9px] font-medium mt-0.5">Till {formatDate(expiryDate)}</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full`} style={{ width: `${progressPercent}%` }} />
              </div>
              <span className={`text-[10px] font-bold ${textColor} shrink-0 whitespace-nowrap`}>
                {Math.round(progressPercent)}% Remaining
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-end mt-2">
            <div className="text-[#64748B]">
              <p className="text-[10px] font-medium">Expired on</p>
              <p className="text-[10px] font-medium">{formatDate(expiryDate)}</p>
            </div>
            <button className="text-[#105DE4] border border-[#105DE4] rounded-[8px] px-3 py-1.5 text-[11px] font-bold bg-white shrink-0 whitespace-nowrap">
              Extend Warranty
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
