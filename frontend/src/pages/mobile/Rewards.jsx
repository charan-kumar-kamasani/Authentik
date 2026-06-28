import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Copy, ExternalLink, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getMyRewards } from '../../config/api';

// Banner SVG Component matching the screenshot's coupon illustration
const BannerIllustration = () => (
  <svg width="84" height="68" viewBox="0 0 84 68" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(-15 42 34)">
      {/* Main Ticket Body */}
      <rect x="12" y="14" width="60" height="40" rx="6" fill="#3B82F6" />
      {/* Ticket Shadow/Depth */}
      <path d="M16 54h52a6 6 0 006-6v-4H12v4a6 6 0 004 6z" fill="#2563EB" />
      
      {/* Left and Right Notches */}
      <circle cx="12" cy="34" r="5" fill="#F8FAFC" />
      <circle cx="72" cy="34" r="5" fill="#F8FAFC" />
      
      {/* Vertical Dashed Line inside ticket */}
      <line x1="28" y1="14" x2="28" y2="54" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* % Sign */}
      <text x="50" y="42" fill="white" fontSize="24" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">%</text>
    </g>
    
    {/* Sparkles / Stars */}
    {/* Top Right */}
    <path d="M68 6 Q 72 6 72 2 Q 72 6 76 6 Q 72 6 72 10 Q 72 6 68 6 Z" fill="#FCD34D" />
    {/* Top Left */}
    <path d="M12 18 Q 16 18 16 14 Q 16 18 20 18 Q 16 18 16 22 Q 16 18 12 18 Z" fill="#FCD34D" />
    {/* Bottom Left */}
    <path d="M26 60 Q 29 60 29 57 Q 29 60 32 60 Q 29 60 29 63 Q 29 60 26 60 Z" fill="#FCD34D" />
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
        if (data && data.length > 0) {
          setRewards(data);
        } else {
          // Dummy data mimicking the screenshot
          setRewards([
            {
              _id: '1',
              brand: 'Nike',
              couponTitle: 'Get 20% off on orders above ₹2499',
              couponCode: 'NIKE20',
              couponExpiry: '2024-05-31T00:00:00.000Z',
              discountText: '20% OFF',
              websiteLink: 'https://nike.com'
            },
            {
              _id: '2',
              brand: 'Amazon',
              couponTitle: 'Get 10% cashback up to ₹200',
              couponCode: 'AMZ10',
              couponExpiry: '2024-05-25T00:00:00.000Z',
              discountText: '10% OFF',
              websiteLink: 'https://amazon.in'
            },
            {
              _id: '3',
              brand: 'Myntra',
              couponTitle: 'Get 15% off on minimum purchase of ₹1599',
              couponCode: 'MYNTRA15',
              couponExpiry: '2024-05-20T00:00:00.000Z',
              discountText: '15% OFF',
              websiteLink: 'https://myntra.com'
            },
            {
              _id: '4',
              brand: 'Flipkart',
              couponTitle: 'Flat ₹100 off on orders above ₹999',
              couponCode: 'FK100',
              couponExpiry: '2024-05-18T00:00:00.000Z',
              discountText: '₹100 OFF',
              websiteLink: 'https://flipkart.com'
            },
            {
              _id: '5',
              brand: 'Puma',
              couponTitle: 'Get 25% off on Puma footwear',
              couponCode: 'PUMA25',
              couponExpiry: '2024-05-30T00:00:00.000Z',
              discountText: '25% OFF',
              websiteLink: 'https://puma.com'
            }
          ]);
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
    if (b.includes('nike')) return 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg';
    if (b.includes('amazon')) return 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg';
    if (b.includes('myntra')) return 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png';
    if (b.includes('flipkart')) return 'https://upload.wikimedia.org/wikipedia/en/2/22/Flipkart_logo.svg';
    if (b.includes('puma')) return 'https://upload.wikimedia.org/wikipedia/en/4/41/Puma_Logo.svg';
    if (b.includes('alphalite')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Alphabet_Inc_Logo_2015.svg/1024px-Alphabet_Inc_Logo_2015.svg.png';
    return null;
  };

  const getTheme = (index) => {
    const themes = [
      { 
        tagBg: 'bg-[#ECFDF5]', tagText: 'text-[#059669]', 
        boxBorder: 'border-[#6EE7B7]', boxLeftBg: 'bg-[#ECFDF5]', 
        copyIcon: 'text-[#059669]' 
      }, // Green (Nike)
      { 
        tagBg: 'bg-[#EFF6FF]', tagText: 'text-[#2563EB]', 
        boxBorder: 'border-[#93C5FD]', boxLeftBg: 'bg-[#EFF6FF]', 
        copyIcon: 'text-[#2563EB]' 
      }, // Blue (Amazon)
      { 
        tagBg: 'bg-[#FAF5FF]', tagText: 'text-[#9333EA]', 
        boxBorder: 'border-[#D8B4FE]', boxLeftBg: 'bg-[#FAF5FF]', 
        copyIcon: 'text-[#9333EA]' 
      }, // Purple (Myntra)
      { 
        tagBg: 'bg-[#FFF7ED]', tagText: 'text-[#EA580C]', 
        boxBorder: 'border-[#FDBA74]', boxLeftBg: 'bg-[#FFF7ED]', 
        copyIcon: 'text-[#EA580C]' 
      }, // Orange (Flipkart)
      { 
        tagBg: 'bg-[#FFF1F2]', tagText: 'text-[#E11D48]', 
        boxBorder: 'border-[#FDA4AF]', boxLeftBg: 'bg-[#FFF1F2]', 
        copyIcon: 'text-[#E11D48]' 
      } // Red (Puma)
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
      
      {/* Top Header */}
      <div className="w-full flex items-center justify-between px-4 pt-4 pb-4 bg-[#F8FAFC] sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#0F172A] hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        <h1 className="text-[18px] font-bold text-[#0F172A] tracking-tight">
          Rewards
        </h1>
        <button className="p-2 -mr-2 text-[#0F172A] hover:bg-slate-50 rounded-full transition-colors">
          <HelpCircle className="w-[22px] h-[22px]" strokeWidth={2} />
        </button>
      </div>

      <div className="px-4 mt-1">
        {/* Banner Section */}
        <div className="bg-[#FFFFFF] border border-[#F1F5F9] rounded-[16px] p-5 flex items-center gap-4 mb-4">
          <div className="flex-shrink-0 relative w-[80px] h-[60px] flex items-center justify-center">
            <BannerIllustration />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[14px] font-bold text-[#0F172A] mb-1 tracking-tight">Exclusive Offers for You!</h2>
            <p className="text-[12px] text-[#64748B] font-normal leading-[1.4] pr-2">
              Use these exclusive coupons and save on your favorite brands.
            </p>
          </div>
        </div>

        <div className="bg-[#F1F5F9] p-1 rounded-[12px] flex mb-4">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-1.5 text-[12px] font-bold rounded-[10px] transition-all duration-300 flex items-center justify-center gap-1.5 ${activeTab === 'active' ? 'bg-[#105DE4] text-white shadow-[0_2px_4px_rgba(0,0,0,0.02)]' : 'text-[#64748B]'}`}
          >
            Active <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#475569]'}`}>{activeRewards.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('expired')}
            className={`flex-1 py-1.5 text-[12px] font-bold rounded-[10px] transition-all duration-300 flex items-center justify-center gap-1.5 ${activeTab === 'expired' ? 'bg-[#EF4444] text-white shadow-[0_2px_4px_rgba(0,0,0,0.02)]' : 'text-[#64748B]'}`}
          >
            Expired <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] ${activeTab === 'expired' ? 'bg-white/20 text-white' : 'bg-[#E2E8F0] text-[#475569]'}`}>{expiredRewards.length}</span>
          </button>
        </div>

        {/* Coupons List */}
        <div className="flex flex-col gap-4">
          {displayedRewards.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center px-4 bg-white border border-[#F1F5F9] rounded-[16px] border-dashed">
              <div className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-[#94A3B8]" />
              </div>
              <h3 className="text-[14px] font-bold text-[#0F172A] mb-1">No {activeTab} coupons</h3>
              <p className="text-[12px] text-[#64748B] max-w-[200px]">You don't have any {activeTab} coupons to display right now.</p>
            </div>
          ) : (
            displayedRewards.map((reward, index) => {
            const logo = reward.brandLogo || reward.brandId?.brandLogo || reward.productCouponId?.brandId?.brandLogo || reward.productId?.brandId?.brandLogo || getBrandLogo(reward.brand);
            const theme = getTheme(index);
            const discountText = reward.discountText || (reward.couponTitle?.match(/\d+%\s*OFF|₹\d+\s*OFF/i) ? reward.couponTitle.match(/\d+%\s*OFF|₹\d+\s*OFF/i)[0] : 'OFFER');
            const expiryDate = reward.couponExpiry ? new Date(reward.couponExpiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry';
            const brandDomain = reward.brand?.toLowerCase() === 'amazon' ? 'Amazon.in' : `${reward.brand || 'Brand'}.com`;
            
            return (
              <div key={reward._id || index} className="w-full bg-white border border-[#F1F5F9] rounded-[16px] flex flex-row p-3.5 gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                
                {/* Left: Logo & Brand */}
                <div className="w-[60px] flex flex-col items-center flex-shrink-0">
                  <div className="w-[52px] h-[52px] border border-[#F1F5F9] rounded-[14px] flex items-center justify-center p-2 mb-1.5 shadow-[0_2px_4px_rgba(0,0,0,0.01)] bg-white">
                    {logo ? (
                      <img 
                        src={logo} 
                        alt={reward.brand} 
                        className="w-full h-full object-contain mix-blend-multiply" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.outerHTML = `<div class="w-full h-full bg-slate-50 rounded text-slate-400 flex items-center justify-center font-bold text-lg">${reward.brand ? reward.brand.charAt(0).toUpperCase() : 'B'}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 rounded text-slate-400 flex items-center justify-center font-bold text-lg">
                        {reward.brand ? reward.brand.charAt(0).toUpperCase() : 'B'}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-[#64748B] text-center w-full truncate">
                    {reward.brand || 'Brand'}
                  </span>
                </div>

                {/* Middle: Offer Details */}
                <div className="flex-1 flex flex-col justify-center px-1">
                  <div className="mb-1.5">
                    <span className={`inline-block px-1.5 py-0.5 rounded-[4px] ${theme.tagBg} ${theme.tagText} text-[9px] font-bold tracking-wider uppercase`}>
                      {discountText}
                    </span>
                  </div>
                  <h3 className="text-[13px] font-bold text-[#0F172A] leading-[1.3] mb-2 pr-1">
                    {reward.couponTitle || 'Special Offer'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <Calendar className="w-3 h-3 text-[#94A3B8]" />
                    <span className="text-[10px] font-normal text-[#64748B]">
                      Valid till {expiryDate}
                    </span>
                  </div>
                </div>

                {/* Right Side (Only if active) */}
                {activeTab === 'active' && (
                  <>
                    {/* Vertical Dashed Line */}
                    <div className="w-[1px] bg-[repeating-linear-gradient(to_bottom,transparent,transparent_3px,#E2E8F0_3px,#E2E8F0_6px)] mx-1"></div>

                    {/* Right: Code & Link */}
                    <div className="w-[125px] flex-shrink-0 flex flex-col justify-center pl-1.5">
                      <span className="text-[10px] font-normal text-[#64748B] mb-1 ml-1">Code</span>
                      
                      {/* The Custom Code Box */}
                      <div className={`flex items-stretch border border-dashed ${theme.boxBorder} rounded-md overflow-hidden mb-2.5`}>
                        <div className={`flex-1 flex items-center justify-center px-1.5 py-1 ${theme.boxLeftBg} border-r border-dashed ${theme.boxBorder}`}>
                          <span className="text-[11px] font-bold text-[#0F172A] tracking-wider truncate w-[50px] text-center">{reward.couponCode}</span>
                        </div>
                        <button 
                          onClick={() => copyCode(reward.couponCode, reward._id)}
                          className={`flex items-center justify-center px-1.5 py-1 bg-white hover:bg-slate-50 transition-colors active:scale-95`}
                        >
                          {copiedId === reward._id ? (
                            <CheckCircle2 className={`w-3 h-3 ${theme.copyIcon}`} strokeWidth={2.5} />
                          ) : (
                            <Copy className={`w-3 h-3 ${theme.copyIcon}`} strokeWidth={2} />
                          )}
                          <span className={`text-[10px] font-bold ml-1 ${theme.copyIcon}`}>
                            {copiedId === reward._id ? 'Copied' : 'Copy'}
                          </span>
                        </button>
                      </div>

                      <a 
                        href={reward.websiteLink || '#'} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`text-[10.5px] font-bold ${index < 3 ? 'text-[#2563EB]' : 'text-[#E11D48]'} flex items-center gap-1 ml-0.5 hover:underline overflow-hidden w-full`}
                      >
                        <span className="truncate">Visit Website</span> <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                      </a>
                    </div>
                  </>
                )}
              </div>
            );
          })
          )}
        </div>
        
        {/* Footer Terms */}
        <div className="mt-4 mb-6 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[12px] p-4 flex gap-3 items-start">
          <ShieldCheck className="w-[18px] h-[18px] text-[#475569] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-[11px] text-[#64748B] font-normal leading-[1.5]">
            Coupons are subject to terms and conditions of the respective brands. Offers may be changed or withdrawn at any time.
          </p>
        </div>

      </div>
    </div>
  );
}
