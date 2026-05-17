import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileHeader from '../../components/MobileHeader';
import { getMyWarrantyClaims } from '../../config/api';
import { Shield, Clock, AlertCircle, CheckCircle2, ChevronRight, ExternalLink, MessageSquare, History, Timer } from 'lucide-react';

export default function Warranty() {
  const navigate = useNavigate();
  const { state } = useLocation();
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
      const expiry = calculateExpiry(c.purchaseDate, c.warrantyInfo?.duration || 0, c.warrantyInfo?.durationUnit || 'years');
      return expiry.getTime() > new Date().getTime();
    }),
    expired: claims.filter(c => {
      const expiry = calculateExpiry(c.purchaseDate, c.warrantyInfo?.duration || 0, c.warrantyInfo?.durationUnit || 'years');
      return expiry.getTime() <= new Date().getTime();
    }),
    claims: claims.filter(c => c.issue || c.status !== 'Sent')
  };

  const renderTabContent = () => {
    const list = categorizedClaims[activeTab as keyof typeof categorizedClaims];

    if (loading) return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <p className="font-bold text-slate-500">Loading your warranties...</p>
      </div>
    );

    if (list.length === 0) return (
      <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Shield size={40} className="text-slate-300" />
        </div>
        <h3 className="text-[18px] font-black text-slate-800 mb-2">No {activeTab} warranties</h3>
        <p className="text-[14px] font-medium text-slate-500">Your registered products will appear here once you scan and register them.</p>
        <button 
          onClick={() => navigate('/scan')}
          className="mt-8 px-8 py-3 bg-[#0D4E96] text-white rounded-[24px] font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          Scan Product
        </button>
      </div>
    );

    return (
      <div className="space-y-4 px-4 pb-24">
        {list.map((item) => (
          <WarrantyCard key={item._id} item={item} activeTab={activeTab} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <MobileHeader title="My Warranties" onLeftClick={() => navigate('/home')} />
      
      {/* Tabs */}
      <div className="flex p-1 bg-slate-100/80 mx-4 mt-4 rounded-2xl mb-6 backdrop-blur-sm border border-slate-200/50">
        {['active', 'expired', 'claims'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[13px] font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === tab 
                ? 'bg-[#0D4E96] text-white shadow-md scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}

function WarrantyCard({ item, activeTab }: { item: any, activeTab: string }) {
  const navigate = useNavigate();
  const expiryDate = new Date(item.purchaseDate);
  const duration = item.warrantyInfo?.duration || 0;
  const unit = item.warrantyInfo?.durationUnit || 'years';
  
  if (unit === 'years') expiryDate.setFullYear(expiryDate.getFullYear() + duration);
  else expiryDate.setMonth(expiryDate.getMonth() + duration);

  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  const isExpired = diff <= 0;

  const getTimeLeft = () => {
    if (isExpired) return null;

    let years = expiryDate.getFullYear() - now.getFullYear();
    let months = expiryDate.getMonth() - now.getMonth();
    let days = expiryDate.getDate() - now.getDate();
    let hours = expiryDate.getHours() - now.getHours();

    if (hours < 0) {
      hours += 24;
      days--;
    }
    if (days < 0) {
      const prevMonth = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }

    return { years, months, days, hours };
  };

  const timeLeft = getTimeLeft();

  const handleSupport = () => {
    const p = item.productId;
    const care = item.warrantyInfo?.customerCare || p?.customerCare || 'Not available';
    const email = item.warrantyInfo?.supportEmail || p?.supportEmail || 'Not available';
    
    // Create a simple alert for now, or could use a modal
    const message = `Support Details:\n\nCustomer Care: ${care}\nSupport Email: ${email}`;
    if (email && email !== 'Not available') {
        if (window.confirm(`${message}\n\nWould you like to send an email?`)) {
            window.location.href = `mailto:${email}`;
        }
    } else {
        alert(message);
    }
  };

  return (
    <div className="bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-[0_8px_24px_rgba(13,78,150,0.06)] group active:scale-[0.99] transition-all">
      <div className="p-5">
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
             {item.productId?.productImage ? (
               <img src={item.productId.productImage} alt={item.productName} className="w-full h-full object-cover" />
             ) : (
               <Shield className="text-slate-200" size={32} />
             )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
               <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                 isExpired ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
               }`}>
                 {isExpired ? 'Expired' : 'Active'}
               </span>
               <span className="text-[11px] font-bold text-slate-400">#{item.qrCode.slice(-6)}</span>
            </div>
            <h3 className="text-[17px] font-black text-slate-800 truncate leading-tight mb-1">{item.productName}</h3>
            <p className="text-[13px] font-bold text-[#2CA4D6] uppercase tracking-wide truncate">
              {item.productId?.brand || 'Verified Product'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-400" />
                <p className="text-[11px] font-bold text-slate-500">
                  {new Date(item.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              {item.productId?.batchNo && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <p className="text-[11px] font-bold text-slate-400">Batch: {item.productId.batchNo}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timer Section */}
        {!isExpired && activeTab === 'active' && timeLeft && (
          <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100/50">
            <div className="flex items-center gap-2 mb-3">
              <Timer size={14} className="text-blue-500" />
              <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">Warranty Period Remaining</span>
            </div>
            <div className="flex justify-between items-center px-2">
              {timeLeft.years > 0 && (
                <div className="flex flex-col items-center">
                  <span className="text-[20px] font-black text-slate-800 leading-none">{timeLeft.years}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Years</span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <span className="text-[20px] font-black text-slate-800 leading-none">{timeLeft.months}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Months</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[20px] font-black text-slate-800 leading-none">{timeLeft.days}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Days</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[20px] font-black text-slate-800 leading-none">{timeLeft.hours}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Hours</span>
              </div>
            </div>
          </div>
        )}

        {/* Status Tracker for Claims Tab */}
        {activeTab === 'claims' && (
          <div className="mb-5 space-y-4">
            <div className="py-3 px-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold text-slate-500">Claim Status</span>
                <span className={`text-[13px] font-black ${item.status === 'Rejected' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {item.status}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                 {['Sent', 'Processing', 'Reviewing', 'Contacted', 'Resolved'].map((s, i, arr) => {
                   const currentIdx = arr.indexOf(item.status);
                   const isDone = i <= currentIdx && item.status !== 'Rejected';
                   const isRejected = item.status === 'Rejected';
                   return (
                    <div 
                      key={s} 
                      className={`flex-1 h-full border-r border-white last:border-0 ${
                        isRejected ? 'bg-red-200' : isDone ? 'bg-emerald-500' : 'bg-slate-200'
                      }`} 
                    />
                   );
                 })}
              </div>
            </div>

            {/* Admin Remarks / Feedback */}
            {item.adminNotes && (
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-blue-500" />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Support Feedback</span>
                </div>
                <p className="text-[13px] font-bold text-slate-700 leading-relaxed italic">
                  "{item.adminNotes}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Rewards Section */}
        {item.coupons && item.coupons.length > 0 && (
          <div className="mb-5 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/20 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <Timer size={12} className="text-white" />
                </div>
                <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest">Exclusive Rewards</span>
              </div>
              
              <div className="space-y-3">
                {item.coupons.map((coupon: any, idx: number) => (
                  <div key={idx} className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-amber-200/50 flex items-center justify-between shadow-sm">
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-slate-800 truncate">{coupon.code}</p>
                      <p className="text-[10px] font-bold text-slate-500 truncate">{coupon.description || 'Special discount for you'}</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (coupon.websiteLink) window.open(coupon.websiteLink, '_blank');
                        else {
                          navigator.clipboard.writeText(coupon.code);
                          alert('Coupon code copied to clipboard!');
                        }
                      }}
                      className="ml-3 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      {coupon.websiteLink ? 'Use Now' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2.5">
          {!isExpired && (
            <button 
              onClick={() => {
                if (!item.issue) {
                  navigate(`/raise-claim/${item._id}`, { state: { claim: item } });
                }
                // If it already has an issue, it's already being tracked
              }}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[14px] shadow-lg active:scale-95 transition-all ${
                item.issue 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none' 
                  : 'bg-[#0D4E96] text-white shadow-blue-100'
              }`}
            >
              {item.issue ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {item.issue ? 'Track Claim' : 'Raise Claim'}
            </button>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <button 
              onClick={() => navigate(`/update-warranty/${item._id}`, { state: { claim: item } })}
              className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-black text-[14px] active:scale-95 transition-all"
            >
              <History size={16} />
              Update
            </button>
            <button 
              onClick={handleSupport}
              className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-black text-[14px] active:scale-95 transition-all"
            >
              <MessageSquare size={16} />
              Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
