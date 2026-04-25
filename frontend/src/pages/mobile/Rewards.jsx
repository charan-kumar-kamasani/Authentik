import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRewards } from '../../config/api';
import MobileHeader from "../../components/MobileHeader";

export default function Rewards() {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

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
      <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2CA4D6]/30 border-t-[#0D4E96] rounded-full animate-spin" />
          <p className="text-[#1a5fa8] text-sm font-bold">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] font-sans pb-28 flex flex-col">
      <MobileHeader
        onLeftClick={() => navigate("/profile")}
        leftIcon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        }
      />

      <div className="px-5 mt-4">
        {/* Title Area */}
        <div className="mb-6">
          <h1 className="text-[28px] font-black tracking-tight bg-gradient-to-r from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] bg-clip-text text-transparent">
            My Rewards
          </h1>
          <p className="text-[#1e3a5f]/60 text-[14px] font-medium mt-1">
            {rewards.length > 0 
              ? `You have ${rewards.length} reward${rewards.length > 1 ? 's' : ''} earned!`
              : 'Scan & review products to earn rewards'
            }
          </p>
        </div>
        {rewards.length === 0 && (
          <div className="bg-white/80 backdrop-blur-md rounded-[32px] border-[2px] border-white shadow-[0_12px_40px_rgba(13,78,150,0.1)] p-8 text-center flex flex-col items-center justify-center my-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#E8F4F9] to-[#F0F7FF] rounded-full flex items-center justify-center mb-6 shadow-inner">
              <span className="text-5xl drop-shadow-md">🎁</span>
            </div>
            <h3 className="text-[#0D4E96] font-black text-[22px] mb-2 tracking-tight">No Rewards Yet</h3>
            <p className="text-[#1e3a5f]/70 text-[14px] font-medium leading-relaxed mb-8 px-2">
              Scan authentic products and leave a review to earn exclusive coupons and rewards!
            </p>
            <button
              onClick={() => navigate('/scan')}
              className="bg-gradient-to-r from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] text-white font-black text-[16px] px-10 py-3.5 rounded-[30px] shadow-[0_8px_24px_rgba(13,78,150,0.4)] hover:shadow-[0_12px_32px_rgba(13,78,150,0.5)] active:scale-[0.96] transition-all w-full leading-none"
            >
              Start Scanning
            </button>
          </div>
        )}

        {/* Rewards List */}
        <div className="space-y-3">
          {rewards.map((reward) => {
            const isExpired = reward.couponExpiry && new Date(reward.couponExpiry) < new Date();
            
            return (
              <div
                key={reward._id}
                onClick={() => navigate(`/rewards/${reward._id}`)}
                className={`bg-white/90 backdrop-blur-md rounded-[28px] border-[2px] border-white shadow-[0_8px_24px_rgba(13,78,150,0.08)] overflow-hidden active:scale-[0.98] transition-all cursor-pointer ${isExpired ? 'opacity-60 grayscale-[30%]' : ''}`}
              >
                <div className="flex p-4 gap-4">
                  {/* Product Image */}
                  <div className="w-[84px] h-[100px] bg-gradient-to-br from-[#F0F7FF] to-[#E8F4F9] rounded-[20px] flex-shrink-0 flex items-center justify-center overflow-hidden border border-white shadow-inner">
                    {reward.productImage ? (
                      <img src={reward.productImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl drop-shadow-sm">🎁</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h3 className="text-[#0D4E96] font-black text-[15px] truncate leading-tight tracking-tight">
                          {reward.productName || 'Product'}
                        </h3>
                        <p className="text-[#1a5fa8]/60 text-[12px] font-bold mt-0.5 tracking-wide uppercase">
                          {reward.brand || 'Brand'}
                        </p>
                      </div>
                      {isExpired ? (
                        <span className="bg-[#FFE8E8] text-[#C41E3A] text-[9px] font-black px-2.5 py-1 rounded-full flex-shrink-0 border border-[#FFCACA]">
                          EXPIRED
                        </span>
                      ) : (
                        <span className="bg-[#E8F8F0] text-[#059669] text-[9px] font-black px-2.5 py-1 rounded-full flex-shrink-0 border border-[#A7F3D0]">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Coupon Code Row */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="bg-gradient-to-r from-[#F0F7FF] to-[#E8F4F9] border border-dashed border-[#2CA4D6]/40 rounded-[14px] px-3 py-1.5 flex-1 min-w-0 shadow-inner">
                        <p className="text-[#1a5fa8] font-black text-[12px] tracking-tight truncate text-center mb-0.5">
                          {reward.couponTitle || 'REWARD'}
                        </p>
                        <p className="text-[#0D4E96] font-bold text-[14px] tracking-[0.1em] truncate text-center">
                          {reward.couponCode}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCode(reward.couponCode, reward._id);
                        }}
                        className="w-9 h-9 bg-gradient-to-br from-[#0D4E96] to-[#2CA4D6] rounded-[12px] flex-shrink-0 flex items-center justify-center shadow-[0_4px_12px_rgba(13,78,150,0.3)] active:scale-90 transition-transform"
                      >
                        {copiedId === reward._id ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        )}
                      </button>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < reward.reviewRating ? '#F2C94C' : '#E8F4F9'}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      {reward.couponExpiry && (
                        <p className="text-[#1a5fa8]/50 text-[11px] font-bold">
                          Exp: {new Date(reward.couponExpiry).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
