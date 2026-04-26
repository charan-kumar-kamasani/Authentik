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
        title="Authentiks"
        onLeftClick={() => navigate("/profile")}
        onNotificationClick={() => {}}
        rightIcon={<div className="w-10" />}
      />

      <div className="px-5 mt-4">
        {/* Title & Toggle Area */}
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-[#2CA4D6] mb-4">
            Rewards
          </h1>
          
          {/* Custom Toggle Switch */}
          <div className="bg-white p-1 rounded-full shadow-sm flex items-center border border-gray-100">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2.5 rounded-full text-[14px] font-bold transition-colors ${
                activeTab === 'active' 
                  ? 'bg-[#1F2642] text-white shadow-md' 
                  : 'text-[#64748B] hover:bg-gray-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`flex-1 py-2.5 rounded-full text-[14px] font-bold transition-colors ${
                activeTab === 'expired' 
                  ? 'bg-[#1F2642] text-white shadow-md' 
                  : 'text-[#64748B] hover:bg-gray-50'
              }`}
            >
              Expired
            </button>
          </div>
        </div>

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

        {/* Rewards List */}
        <div className="space-y-4">
          {filteredRewards.map((reward) => (
            <div key={reward._id} className="w-full relative shadow-[0_4px_15px_rgba(0,0,0,0.05)] rounded-[16px] bg-white border border-gray-100">
              {/* Top Dark Section */}
              <div className="bg-[#1F2642] rounded-t-[16px] pt-6 pb-5 px-5 text-center relative overflow-hidden">
                <p className="text-white/80 text-[12px] font-semibold tracking-wider uppercase mb-1">
                  {reward.brand || 'Brand'}
                </p>
                <h3 className="text-white text-[20px] font-black uppercase tracking-wide leading-tight">
                  {reward.couponTitle || 'REWARD UNLOCKED'}
                </h3>
              </div>

              {/* Middle Light Blue Section */}
              <div className="bg-[#2CA4D6] py-3 px-5 relative flex items-center justify-center gap-3">
                {/* Left Cutout */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full border-r border-gray-100/50"></div>
                {/* Right Cutout */}
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full border-l border-gray-100/50"></div>
                
                <span className="text-white text-[16px] font-black tracking-widest uppercase">
                  {reward.couponCode}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyCode(reward.couponCode, reward._id);
                  }}
                  className="w-7 h-7 flex items-center justify-center active:scale-90 transition-transform ml-2"
                >
                  {copiedId === reward._id ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  )}
                </button>
              </div>

              {/* Bottom White Section */}
              <div className="bg-white rounded-b-[16px] p-4 flex items-center justify-between">
                <div>
                  {reward.couponExpiry ? (
                    <p className="text-[#64748B] text-[12px] font-bold">
                      Validity: <span className="text-[#1F2642]">{new Date(reward.couponExpiry).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                    </p>
                  ) : (
                    <p className="text-[#64748B] text-[12px] font-bold">No expiry</p>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    if (reward.websiteLink) {
                      window.open(reward.websiteLink, '_blank');
                    }
                  }}
                  disabled={activeTab === 'expired'}
                  className={`px-5 py-2 rounded-full text-[13px] font-bold shadow-sm transition-transform ${
                    activeTab === 'expired'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-[#1F2642] text-white hover:bg-[#151a2e] active:scale-95'
                  }`}
                >
                  Redeem Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
