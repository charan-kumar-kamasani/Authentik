import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRewards } from '../../config/api';
import MobileHeader from "../../components/MobileHeader";

export default function Rewards() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'expired'

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await getMyRewards(token);
        setRewards(data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2CA4D6]/30 border-t-[#0D4E96] rounded-full animate-spin" />
          <p className="text-[#0D4E96] text-sm font-bold">Loading rewards...</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date();
  
  const filteredRewards = rewards.filter(reward => {
    const isExpired = reward.couponExpiry && new Date(reward.couponExpiry) < currentDate;
    if (activeTab === 'active') return !isExpired;
    return isExpired;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-28 flex flex-col">
      <MobileHeader
        title="My Rewards"
        onBackClick={() => navigate("/profile")}
      />

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100/80 mx-4 mt-4 rounded-2xl mb-6 backdrop-blur-sm border border-slate-200/50">
        {['active', 'expired'].map((tab) => (
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

      <div className="px-4 space-y-4">
        {filteredRewards.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center flex flex-col items-center justify-center my-8 border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🎁</span>
            </div>
            <h3 className="text-[#1F2642] font-bold text-[18px] mb-2">No {activeTab} rewards</h3>
            <p className="text-gray-500 text-[13px] mb-6">
              {activeTab === 'active' 
                ? "Scan products and leave reviews to earn exclusive coupons!" 
                : "You don't have any expired rewards."}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => navigate('/scan')}
                className="bg-[#2CA4D6] text-white font-bold text-[15px] px-8 py-3 rounded-full shadow-lg active:scale-95 transition-all"
              >
                Start Scanning
              </button>
            )}
          </div>
        )}

        {filteredRewards.map((reward) => {
          const isExpired = activeTab === 'expired';
          return (
            <div 
              key={reward._id} 
              className={`w-full relative rounded-2xl overflow-hidden border border-slate-100 bg-white transition-all duration-300 ${
                isExpired 
                  ? 'opacity-70 saturate-50' 
                  : 'shadow-[0_4px_18px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
              }`}
            >
              {/* Top Section: Gradient Header */}
              <div className={`p-4 text-center relative overflow-hidden bg-gradient-to-br ${
                isExpired
                  ? 'from-slate-600 via-slate-700 to-slate-800'
                  : 'from-[#0D4E96] via-[#1E3A8A] to-[#1F2642]'
              }`}>
                {/* Decorative glowing circles */}
                <div className="absolute -right-10 -top-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl" />
                
                {/* Brand Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-2">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-white/95 text-[9px] font-black tracking-wider uppercase">
                    {reward.brand || 'Brand'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white text-[16px] font-black uppercase tracking-wide leading-tight drop-shadow-sm px-2">
                  {reward.couponTitle || 'REWARD UNLOCKED'}
                </h3>
              </div>

              {/* Ticket Notch Divider Area */}
              <div className="relative py-2.5 bg-slate-50 border-y border-dashed border-slate-200 flex items-center justify-center">
                {/* Left Notch */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8FAFC] rounded-full border border-slate-200/50 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.02)] z-10" />
                {/* Right Notch */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8FAFC] rounded-full border border-slate-200/50 shadow-[inset_2px_0_4px_rgba(0,0,0,0.02)] z-10" />
                
                {/* Coupon Code Dashed Box */}
                <div className={`flex items-center justify-between gap-2.5 px-4 py-1.5 rounded-xl border-2 border-dashed font-mono text-[13px] font-black uppercase tracking-wider transition-colors ${
                  isExpired
                    ? 'border-slate-300 bg-slate-100 text-slate-500'
                    : 'border-cyan-500/30 bg-cyan-500/5 text-[#0D4E96]'
                }`}>
                  <span>{reward.couponCode}</span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isExpired) copyCode(reward.couponCode, reward._id);
                    }}
                    disabled={isExpired}
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                      copiedId === reward._id
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105'
                        : 'bg-white text-slate-500 hover:text-slate-700 shadow-sm border border-slate-200 hover:border-slate-300 active:scale-90'
                    }`}
                  >
                    {copiedId === reward._id ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Details Section */}
              <div className="bg-white p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {reward.couponExpiry ? (
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Valid: <span className="text-slate-700 font-bold normal-case">{new Date(reward.couponExpiry).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">No Expiry</p>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    if (reward.websiteLink) {
                      window.open(reward.websiteLink, '_blank');
                    }
                  }}
                  disabled={isExpired}
                  className={`px-4 py-2 rounded-xl text-[11px] font-extrabold shadow-md active:scale-95 transition-all uppercase tracking-wider ${
                    isExpired
                      ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed border border-slate-200'
                      : 'bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white shadow-blue-500/10 hover:shadow-blue-500/20'
                  }`}
                >
                  Redeem Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
