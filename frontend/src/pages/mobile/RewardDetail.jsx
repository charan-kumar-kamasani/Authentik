import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRewardDetail } from '../../config/api';
import MobileHeader from "../../components/MobileHeader";

export default function RewardDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await getRewardDetail(id, token);
        setReward(data);
      } catch (err) {
        console.error('Failed to fetch reward:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const copyCode = () => {
    if (!reward?.couponCode) return;
    navigator.clipboard.writeText(reward.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2CA4D6]/30 border-t-[#0D4E96] rounded-full animate-spin" />
      </div>
    );
  }

  if (!reward) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-5xl mb-6">😕</span>
        <h2 className="text-[#0D4E96] font-black text-xl mb-3 tracking-tight">Reward Not Found</h2>
        <button onClick={() => navigate('/rewards')} className="text-[#2CA4D6] font-black text-[15px] bg-white px-8 py-3 rounded-full shadow-sm border border-[#2CA4D6]/20">
          Back to Rewards
        </button>
      </div>
    );
  }

  const isExpired = reward.couponExpiry && new Date(reward.couponExpiry) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#FFFFFF] to-[#E8F4F9] font-sans pb-28 flex flex-col">
      <MobileHeader
        onLeftClick={() => navigate("/rewards")}
        leftIcon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        }
      />

      <div className="px-5 mt-2">
        {/* Title Area */}
        <div className="mb-6">
          <h1 className="text-[26px] font-black tracking-tight bg-gradient-to-r from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] bg-clip-text text-transparent">
            Reward Details
          </h1>
        </div>
        {/* Coupon Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-[32px] shadow-[0_12px_40px_rgba(13,78,150,0.12)] overflow-hidden mb-6 border-[2px] border-white">
          {/* Product Header */}
          <div className="p-6 border-b border-[#F0F7FF] bg-gradient-to-b from-white to-transparent">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F0F7FF] to-[#E8F4F9] rounded-[24px] flex-shrink-0 flex items-center justify-center overflow-hidden border border-white shadow-inner">
                {reward.productImage ? (
                  <img src={reward.productImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl drop-shadow-sm">🎁</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[#0D4E96] font-black text-[18px] truncate tracking-tight">{reward.productName || 'Product'}</h2>
                <p className="text-[#1a5fa8]/60 text-[13px] font-bold uppercase tracking-wide mt-1">{reward.brand || 'Brand'}</p>
                {isExpired ? (
                  <span className="bg-[#FFE8E8] text-[#C41E3A] text-[10px] font-black px-3 py-1 rounded-full inline-block mt-2 border border-[#FFCACA]">EXPIRED</span>
                ) : (
                  <span className="bg-[#E8F8F0] text-[#059669] text-[10px] font-black px-3 py-1 rounded-full inline-block mt-2 border border-[#A7F3D0]">ACTIVE</span>
                )}
              </div>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="p-6">
            <div className="border-[2px] border-dashed border-[#2CA4D6]/40 rounded-[28px] p-6 bg-gradient-to-b from-[#F0F7FF] to-[#E8F4F9] text-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -mr-10 -mt-10" />
              <p className="text-[11px] text-[#1a5fa8] font-black uppercase tracking-[0.25em] mb-4 relative z-10">Your Coupon Code</p>
              <div className="flex items-center justify-center gap-4 relative z-10 w-full px-2">
                <span className="text-[24px] sm:text-[32px] font-black text-[#0D4E96] tracking-[0.1em] drop-shadow-sm flex-1 break-all text-center">
                  {reward.couponCode}
                </span>
                <button
                  onClick={copyCode}
                  className="w-12 h-12 bg-gradient-to-br from-[#0D4E96] to-[#2CA4D6] rounded-[16px] active:scale-90 transition-transform flex items-center justify-center shadow-[0_6px_16px_rgba(13,78,150,0.3)] hover:shadow-[0_8px_20px_rgba(13,78,150,0.4)]"
                >
                  {copied ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  )}
                </button>
              </div>
            </div>

            {reward.couponDescription && (
              <p className="text-[#1e3a5f]/80 text-[15px] text-center mt-6 font-medium leading-relaxed px-2">
                {reward.couponDescription}
              </p>
            )}

            {reward.couponExpiry && (
              <p className="text-[#1a5fa8]/50 text-[12px] font-bold text-center mt-4">
                Valid until {new Date(reward.couponExpiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Your Review */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[24px] shadow-[0_4px_20px_rgba(13,78,150,0.05)] p-5 mb-4 border border-white">
          <h3 className="text-[#0D4E96] font-black text-[16px] mb-3 tracking-tight">Your Review</h3>
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="22" height="22" viewBox="0 0 24 24" fill={i < reward.reviewRating ? '#F2C94C' : '#E8F4F9'}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
            <span className="text-[#1a5fa8] text-[14px] font-black ml-1 bg-[#F0F7FF] px-2 py-0.5 rounded-md">{reward.reviewRating}/5</span>
          </div>
          {reward.reviewComment && (
            <p className="text-[#1e3a5f]/80 text-[14px] leading-relaxed bg-gradient-to-r from-[#F0F7FF] to-white rounded-xl p-4 border border-white shadow-sm mt-2 font-medium italic">
              "{reward.reviewComment}"
            </p>
          )}
        </div>

        {/* Scan Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[24px] shadow-[0_4px_20px_rgba(13,78,150,0.05)] p-5 mb-4 border border-white">
          <h3 className="text-[#0D4E96] font-black text-[16px] mb-4 tracking-tight">Scan Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0F7FF]">
              <span className="text-[#1a5fa8]/60 text-[13px] font-bold uppercase tracking-wider">Scanned On</span>
              <span className="text-[#1e3a5f] text-[14px] font-black">
                {reward.scannedAt
                  ? new Date(reward.scannedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#1a5fa8]/60 text-[13px] font-bold uppercase tracking-wider">Earned On</span>
              <span className="text-[#1e3a5f] text-[14px] font-black">
                {reward.createdAt
                  ? new Date(reward.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Product Details (if populated) */}
        {reward.productId && typeof reward.productId === 'object' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-[24px] shadow-[0_4px_20px_rgba(13,78,150,0.05)] p-5 mb-4 border border-white">
            <h3 className="text-[#0D4E96] font-black text-[16px] mb-4 tracking-tight">Product Details</h3>
            <div className="space-y-4">
              {reward.productId.batchNo && (
                <div className="flex justify-between items-center pb-2.5 border-b border-[#F0F7FF]">
                  <span className="text-[#1a5fa8]/60 text-[13px] font-bold uppercase tracking-wider">Batch No</span>
                  <span className="text-[#1e3a5f] text-[14px] font-black">{reward.productId.batchNo}</span>
                </div>
              )}
              {reward.productId.manufactureDate && (
                <div className="flex justify-between items-center pb-2.5 border-b border-[#F0F7FF]">
                  <span className="text-[#1a5fa8]/60 text-[13px] font-bold uppercase tracking-wider">Mfg Date</span>
                  <span className="text-[#1e3a5f] text-[14px] font-black">{reward.productId.manufactureDate}</span>
                </div>
              )}
              {reward.productId.expiryDate && (
                <div className="flex justify-between items-center pb-2.5 border-b border-[#F0F7FF]">
                  <span className="text-[#1a5fa8]/60 text-[13px] font-bold uppercase tracking-wider">Expiry Date</span>
                  <span className="text-[#1e3a5f] text-[14px] font-black">{reward.productId.expiryDate}</span>
                </div>
              )}
              {reward.productId.qrCode && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#1a5fa8]/60 text-[13px] font-bold uppercase tracking-wider">QR Code</span>
                  <span className="text-[#1e3a5f]/60 bg-[#F0F7FF] px-2 py-1 rounded text-[11px] font-mono font-bold truncate max-w-[180px]">{reward.productId.qrCode}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
