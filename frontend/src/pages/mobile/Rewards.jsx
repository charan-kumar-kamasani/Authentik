import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, HelpCircle, Copy, ExternalLink, Calendar, ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react';
import { getMyRewards } from '../../config/api';

const BannerIllustration = () => (
  <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Confetti */}
    <rect x="15" y="15" width="4" height="8" rx="2" transform="rotate(45 15 15)" fill="#FCD34D" />
    <rect x="85" y="25" width="4" height="8" rx="2" transform="rotate(-30 85 25)" fill="#FCD34D" />
    <circle cx="25" cy="65" r="3" fill="#60A5FA" />
    <circle cx="90" cy="60" r="2.5" fill="#3B82F6" />
    <path d="M10 40 L15 35 L20 40" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M80 75 L85 70 L90 75" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

    {/* Gift Box */}
    <g transform="translate(45, 30)">
      {/* Box Body */}
      <rect x="-25" y="-5" width="50" height="35" rx="3" fill="#3B82F6" />
      {/* Box Lid */}
      <rect x="-28" y="-12" width="56" height="12" rx="2" fill="#2563EB" />
      {/* Ribbon Vertical */}
      <rect x="-5" y="-12" width="10" height="42" fill="#FCD34D" />
      {/* Ribbon Bow */}
      <path d="M 0 -12 C -10 -25 -20 -15 -5 -12 Z" fill="#FCD34D" />
      <path d="M 0 -12 C 10 -25 20 -15 5 -12 Z" fill="#FBBF24" />
    </g>

    {/* Ticket */}
    <g transform="translate(15, 25) rotate(-15)">
      <rect x="0" y="0" width="40" height="28" rx="4" fill="#60A5FA" />
      <circle cx="0" cy="14" r="4" fill="#FFFFFF" />
      <circle cx="40" cy="14" r="4" fill="#FFFFFF" />
      <line x1="12" y1="0" x2="12" y2="28" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="26" y="20" fill="white" fontSize="16" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">%</text>
    </g>
  </svg>
);

export default function Rewards() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await getMyRewards(token);
        if (data) {
          setRewards(data);
        } else {
          setRewards([]);
        }
      } catch (err) {
        console.error('Failed to fetch rewards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBrandLogo = (brand) => {
    const b = brand?.toLowerCase() || '';
    if (b.includes('origin')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Origin_logo.svg/512px-Origin_logo.svg.png';
    if (b.includes('gulab')) return 'https://gulabs.in/cdn/shop/files/Gulabs_Logo_2_1080x.png';
    if (b.includes('daily')) return 'https://images.dailyobjects.com/marche/assets/images/other/logo.svg';
    return null;
  };

  const getTheme = (index) => {
    const themes = [
      { bg: 'bg-[#1352cb]', text: 'text-[#1352cb]', lightBg: 'bg-[#EFF6FF]', border: 'border-[#93C5FD]' }, // Blue
      { bg: 'bg-[#14b875]', text: 'text-[#14b875]', lightBg: 'bg-[#ECFDF5]', border: 'border-[#6EE7B7]' }, // Green
      { bg: 'bg-[#7d48d4]', text: 'text-[#7d48d4]', lightBg: 'bg-[#FAF5FF]', border: 'border-[#D8B4FE]' }, // Purple
      { bg: 'bg-[#ef6b0b]', text: 'text-[#ef6b0b]', lightBg: 'bg-[#FFF7ED]', border: 'border-[#FDBA74]' }, // Orange
    ];
    return themes[index % themes.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#105DE4]/30 border-t-[#105DE4] rounded-full animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const activeRewards = rewards.filter(r => !r.couponExpiry || new Date(r.couponExpiry) >= now);
  const expiredRewards = rewards.filter(r => r.couponExpiry && new Date(r.couponExpiry) < now);
  const displayedRewards = activeTab === 'active' ? activeRewards : expiredRewards;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-28 flex flex-col relative w-full overflow-x-hidden">
      
      {/* Top Header Background */}
      <div className="bg-[#0050C8] pt-6 pb-24 px-4 w-full">
        <div className="flex items-center justify-between text-white">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
          </button>
          <h1 className="text-[18px] font-bold tracking-wide">
            Coupons
          </h1>
          <button className="flex items-center gap-1.5 text-[13px] font-medium hover:bg-white/10 px-2 py-1 rounded-full transition-colors">
            <HelpCircle className="w-4 h-4" strokeWidth={2} />
            How it works?
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 -mt-16 relative z-10">
        
        {/* Banner */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-2 mb-5">
          <div className="flex-1">
            <h2 className="text-[18px] font-extrabold text-[#0F172A] mb-1.5 leading-tight tracking-tight">Exclusive offers for you!</h2>
            <p className="text-[13.5px] text-[#64748B] leading-snug">
              Unlock amazing deals and save more on your favorite brands.
            </p>
          </div>
          <div className="w-[100px] h-[80px] flex-shrink-0 flex items-center justify-center -mr-2">
            <BannerIllustration />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 bg-transparent">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold flex justify-center items-center gap-2 transition-all ${
              activeTab === 'active' 
                ? 'bg-[#105DE4] text-white shadow-md' 
                : 'bg-[#F1F5F9] text-[#64748B]'
            }`}
          >
            Active 
            <span className={`px-2 py-0.5 rounded text-[11px] ${activeTab === 'active' ? 'bg-white/25' : 'bg-gray-200/80'}`}>
              {activeRewards.length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('expired')}
            className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold flex justify-center items-center gap-2 transition-all ${
              activeTab === 'expired' 
                ? 'bg-[#105DE4] text-white shadow-md' 
                : 'bg-[#F1F5F9] text-[#64748B]'
            }`}
          >
            Expired 
            <span className={`px-2 py-0.5 rounded text-[11px] ${activeTab === 'expired' ? 'bg-white/25' : 'bg-gray-200/80'}`}>
              {expiredRewards.length}
            </span>
          </button>
        </div>

        {/* List Header */}
        <div className="flex justify-between items-center mb-4 mt-2">
          <h2 className="text-[16px] font-bold text-[#0F172A]">Your {activeTab === 'active' ? 'Active' : 'Expired'} Coupons</h2>
          <button className="text-[13.5px] text-[#64748B] flex items-center gap-1 font-medium">
            Sort by: <span className="text-[#105DE4] font-bold flex items-center">Latest <ChevronDown size={14} className="ml-0.5"/></span>
          </button>
        </div>

        {/* Coupons List */}
        <div className="flex flex-col gap-4">
          {displayedRewards.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-white border border-[#F1F5F9] rounded-2xl border-dashed">
              <ShieldCheck className="w-10 h-10 text-[#CBD5E1] mb-3" />
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">No {activeTab} coupons</h3>
              <p className="text-[14px] text-[#64748B] max-w-[200px]">You don't have any {activeTab} coupons right now.</p>
            </div>
          ) : (
            displayedRewards.map((reward, index) => {
              const theme = getTheme(index);
              const discountText = reward.discountText || (reward.couponTitle?.match(/\d+%\s*OFF|₹\d+\s*OFF/i) ? reward.couponTitle.match(/\d+%\s*OFF|₹\d+\s*OFF/i)[0] : 'OFFER');
              
              const valMatch = discountText.match(/^([0-9%₹]+)\s*(OFF)?/i);
              const blockVal = valMatch ? valMatch[1] : discountText;
              const blockOff = valMatch && valMatch[2] ? valMatch[2].toUpperCase() : 'OFF';

              const expiryDate = reward.couponExpiry ? new Date(reward.couponExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No expiry';
              const logo = reward.productImage || reward.productId?.productImage || reward.brandLogo || getBrandLogo(reward.brand);
              
              return (
                <div key={reward._id || index} className="w-full bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-3 flex items-stretch">
                  
                  {/* Left Section: Colored Block + Logo */}
                  <div className="relative w-[120px] flex-shrink-0 flex items-center py-1">
                    {/* Colored block with full rounded corners to create the curved intersection */}
                    <div className={`absolute right-0 top-1.5 bottom-1.5 w-[75px] ${theme.bg} rounded-[20px]`} />
                    
                    {/* Overlapping Logo Box */}
                    <div className="absolute left-1 bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] w-[68px] h-[86px] flex flex-col justify-center items-center z-10 border border-gray-50 p-1">
                      {logo ? (
                        <div className="w-10 h-10 bg-gray-50/50 rounded-full flex items-center justify-center mb-1 overflow-hidden">
                          <img src={logo} alt={reward.brand} className="w-full h-full object-cover mix-blend-multiply drop-shadow-sm" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-[20px] mb-1">
                          {reward.brand ? reward.brand.charAt(0).toUpperCase() : 'B'}
                        </div>
                      )}
                      <span className="text-[10.5px] font-bold text-gray-800 text-center leading-[1.1] truncate px-1 w-full" style={{fontFamily:'serif'}}>
                        {reward.brand || 'Origin\nNUTRITION'}
                      </span>
                    </div>

                    {/* Text inside colored block */}
                    <div className="absolute right-0 w-[50px] text-center z-10 text-white font-black flex flex-col justify-center h-full">
                      <span className="text-[20px] leading-[1] tracking-tight">{blockVal}</span>
                      <span className="text-[12px] leading-tight mt-1">{blockOff}</span>
                    </div>
                  </div>

                  {/* Middle Section */}
                  <div className="flex-1 flex flex-col justify-center pl-3 pr-2">
                    <div className="mb-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded-md ${theme.lightBg} ${theme.text} text-[10px] font-bold tracking-wider uppercase`}>
                        {discountText}
                      </span>
                    </div>
                    <h3 className="text-[16px] font-extrabold text-[#0F172A] leading-tight mb-1.5 pr-1 truncate">
                      {reward.couponTitle || `${reward.brand || 'Brand'} ${discountText}`}
                    </h3>
                    <p className="text-[11px] text-[#64748B] leading-[1.4] line-clamp-2 mb-2.5 pr-2">
                      {reward.couponDescription || `Get ${discountText.toLowerCase()} on your entire order on ${reward.brand} products.`}
                    </p>
                    <div className="flex items-center gap-1.5 mt-auto">
                      <Calendar className="w-[12px] h-[12px] text-[#94A3B8]" />
                      <span className="text-[11px] font-semibold text-[#64748B]">
                        Valid till {expiryDate}
                      </span>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="w-[1px] bg-[repeating-linear-gradient(to_bottom,transparent,transparent_4px,#E2E8F0_4px,#E2E8F0_8px)] mx-1.5 my-3" />

                  {/* Right Section */}
                  <div className="w-[110px] flex-shrink-0 flex flex-col justify-center pl-2 pr-1 py-1">
                    <span className="text-[9.5px] font-bold text-[#94A3B8] mb-1.5 tracking-wider uppercase">Coupon Code</span>
                    
                    <div className={`flex items-center justify-between px-2.5 py-2 rounded-lg ${theme.lightBg} border border-dashed ${theme.border} mb-2.5`}>
                      <span className={`text-[12px] font-extrabold ${theme.text} tracking-wide truncate pr-1`}>
                        {reward.couponCode}
                      </span>
                      <button onClick={() => copyCode(reward.couponCode, reward._id)} className="flex-shrink-0 active:scale-95 transition-transform">
                        {copiedId === reward._id ? (
                          <CheckCircle2 className={`w-3.5 h-3.5 ${theme.text}`} strokeWidth={2.5} />
                        ) : (
                          <Copy className={`w-3.5 h-3.5 ${theme.text}`} strokeWidth={2} />
                        )}
                      </button>
                    </div>

                    <a 
                      href={reward.websiteLink || '#'} 
                      target="_blank" 
                      rel="noreferrer"
                      className={`w-full py-2 rounded-lg border ${theme.border} bg-white flex justify-center items-center gap-1.5 active:scale-95 transition-transform`}
                    >
                      <span className={`text-[11px] font-bold ${theme.text}`}>Visit Website</span>
                      <ExternalLink className={`w-3 h-3 ${theme.text}`} strokeWidth={2.5} />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-5 mb-4 bg-white border border-[#F1F5F9] rounded-xl p-3 flex justify-between items-center px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#105DE4]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#0F172A] leading-tight">All offers are 100% verified & secure</p>
              <p className="text-[10px] text-[#64748B] mt-0.5">Deals you can trust. Savings you deserve.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#F8FAFC] px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-[#105DE4]" strokeWidth={3} />
            <span className="text-[9px] font-bold text-[#475569]">Authentiks Protected</span>
          </div>
        </div>

      </div>
    </div>
  );
}
