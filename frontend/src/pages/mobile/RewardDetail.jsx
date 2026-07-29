import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Globe, Calendar, Info, ShieldCheck, Star, ExternalLink, Check, ChevronRight } from 'lucide-react';
import { getRewardDetail } from '../../config/api';

const NewIllustration = () => (
  <div className="relative w-[180px] h-[120px] flex items-center justify-center mb-3 mt-4">
    <div className="absolute top-2 left-6 text-xl animate-bounce" style={{ animationDuration: '3s' }}>🎊</div>
    <div className="absolute top-8 right-6 text-xl animate-bounce delay-100" style={{ animationDuration: '2.5s' }}>🎉</div>
    <div className="absolute bottom-4 left-10 w-2 h-2 bg-blue-500 rounded-sm rotate-45" />
    <div className="absolute top-1/2 right-12 w-2 h-2 bg-yellow-400 rounded-sm" />
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-xl animate-bounce" style={{ animationDuration: '2s' }}>
      {/* Blue Box Front */}
      <path d="M10 40 L50 60 L50 95 L10 75 Z" fill="#2563EB" />
      {/* Blue Box Right */}
      <path d="M50 60 L90 40 L90 75 L50 95 Z" fill="#1D4ED8" />
      {/* Blue Box Top */}
      <path d="M50 15 L90 40 L50 60 L10 40 Z" fill="#60A5FA" />
      {/* Yellow Ribbon Cross on Front & Right */}
      <path d="M25 32 L35 37 L35 82 L25 70 Z" fill="#FACC15" />
      <path d="M75 32 L65 37 L65 82 L75 70 Z" fill="#EAB308" />
      {/* Yellow Ribbon Top */}
      <path d="M50 15 L60 22 L35 37 L25 32 Z" fill="#FDE047" />
      <path d="M50 15 L40 22 L65 37 L75 32 Z" fill="#FACC15" />
      {/* Bow */}
      <path d="M48 25 C25 5 15 25 43 32 Z" fill="#FDE047" />
      <path d="M52 25 C75 5 85 25 57 32 Z" fill="#FACC15" />
      <circle cx="50" cy="27" r="7" fill="#EAB308" />
    </svg>
    <div className="absolute bottom-2 w-20 h-4 bg-black/10 blur-[6px] rounded-[100%]" />
  </div>
);

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
    if (!r?.couponCode) return;
    navigator.clipboard.writeText(r.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#105DE4]/30 border-t-[#105DE4] rounded-full animate-spin" />
      </div>
    );
  }

  // Use a fallback object to render the UI for demonstration if no reward data is present
  const r = reward || {
    discountText: '20% OFF',
    brand: 'Origin Nutrition',
    couponTitle: '20% OFF',
    couponCode: 'ON200FF',
    websiteLink: 'originnutrition.in',
    couponExpiry: '2026-12-28',
    couponDescription: 'Use code ON200FF at checkout to unlock your savings.\nEnjoy 20% off on your entire cart of plant-based nutrition products.\nRedeemable on all protein powders, supplements, and wellness essentials.\nVisit the official store today and fuel your fitness for less.'
  };

  const expiryDate = r.couponExpiry ? new Date(r.couponExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No expiry';
  const discountText = r.discountText || (r.couponTitle?.match(/\d+%\s*OFF|₹\d+\s*OFF/i) ? r.couponTitle.match(/\d+%\s*OFF|₹\d+\s*OFF/i)[0] : 'OFFER');

  return (
    <div className="min-h-screen bg-white font-sans pb-6 flex flex-col relative overflow-x-hidden">
      
      {/* Top Header */}
      <div className="flex items-center justify-center relative py-4 bg-white sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="absolute left-4 p-2 -ml-2 text-[#0F172A] hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <h1 className="text-[17px] font-bold text-[#0F172A] tracking-wide">
          Your Reward Unlocked!
        </h1>
      </div>

      <div className="flex-1 px-4 py-2 flex flex-col items-center">
        
        {/* Illustration & Congrats */}
        <div className="mb-5 flex flex-col items-center">
          <NewIllustration />
          <h2 className="text-[22px] font-bold text-[#0F172A] mb-1">
            Congratulations!
          </h2>
          <p className="text-[13px] text-[#475569] text-center px-6 leading-relaxed">
            Thank you for your review.<br/>You've earned an exclusive reward.
          </p>
        </div>

        {/* Main Blue Card */}
        <div className="w-full bg-[#0A34B8] rounded-[12px] flex shadow-[0_8px_20px_rgba(10,52,184,0.15)] mb-6 overflow-hidden">
          {/* Left Section */}
          <div className="flex-1 p-5 pr-2 flex flex-col justify-center text-white relative">
            <div className="bg-[#4F6BE1] w-max px-3 py-1 rounded-full mb-2">
              <span className="text-[10px] font-bold tracking-widest text-[#DBEAFE] uppercase">YOU WON</span>
            </div>
            <h3 className="text-[36px] font-black leading-none mb-1">
              {discountText}
            </h3>
            <p className="text-[14px] font-medium text-white mb-2">on {r.brand || 'Origin Nutrition'}</p>
            <p className="text-[10px] text-[#93A7F1]">Valid on your entire order</p>
          </div>

          {/* Vertical Dashed Line */}
          <div className="w-[1px] bg-[repeating-linear-gradient(to_bottom,transparent,transparent_4px,rgba(255,255,255,0.2)_4px,rgba(255,255,255,0.2)_8px)] mx-0 my-4" />

          {/* Right Section */}
          <div className="w-[130px] p-4 pr-5 pl-3 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">COUPON CODE</span>
              <div className="w-3.5 h-3.5 bg-[#60A5FA] rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            </div>
            
            <div className="w-full bg-white rounded-[6px] py-2 px-1 mb-3 flex items-center justify-center shadow-sm">
              <span className="text-[15px] font-extrabold text-[#0A34B8] tracking-wide truncate">
                {r.couponCode}
              </span>
            </div>
            
            <button onClick={copyCode} className="w-full bg-transparent border border-white/30 hover:bg-white/10 active:scale-95 text-white rounded-[6px] py-1.5 flex items-center justify-center gap-1.5 transition-all">
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              )}
              <span className="text-[11px] font-medium tracking-wide">{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Details Card */}
        <div className="w-full bg-white border border-[#F1F5F9] rounded-[16px] p-4 mb-5 shadow-sm">
          <div className="flex flex-col gap-4">
            {r.websiteLink && (
              <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
                <Globe className="w-[18px] h-[18px] text-[#64748B] flex-shrink-0" />
                <span className="text-[14px] font-bold text-[#475569] flex-1">Website</span>
                <a href={r.websiteLink?.startsWith('http') ? r.websiteLink : `https://${r.websiteLink}`} target="_blank" rel="noreferrer" className="text-[14px] font-bold text-[#2563EB] flex items-center gap-1.5 hover:underline truncate max-w-[150px]">
                  {new URL(r.websiteLink?.startsWith('http') ? r.websiteLink : `https://${r.websiteLink}`).hostname.replace('www.', '')} <ExternalLink className="w-[14px] h-[14px]" />
                </a>
              </div>
            )}

            {r.couponExpiry && (
              <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-4">
                <Calendar className="w-[18px] h-[18px] text-[#64748B] flex-shrink-0" />
                <span className="text-[14px] font-bold text-[#475569] flex-1">Valid Till</span>
                <span className="text-[14px] font-bold text-[#0F172A]">
                  {expiryDate}
                </span>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Info className="w-[18px] h-[18px] text-[#64748B] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-[14px] font-bold text-[#475569] block mb-2">About this offer</span>
                <div className="text-[12px] text-[#475569] leading-relaxed">
                  {r.couponDescription ? (
                    <div dangerouslySetInnerHTML={{ __html: r.couponDescription.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <>
                      Use code {r.couponCode} at checkout to unlock your savings.<br/>
                      Enjoy this exclusive discount on your entire cart.<br/>
                      Visit the official store today.
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Shop Now Button */}
        <button 
          onClick={() => {
            if (r.websiteLink) {
              window.open(r.websiteLink?.startsWith('http') ? r.websiteLink : `https://${r.websiteLink}`, '_blank');
            } else {
              navigate('/rewards');
            }
          }}
          className="w-full bg-[#105DE4] hover:bg-[#0D4E96] text-white py-3.5 rounded-[10px] font-bold text-[15px] flex justify-center items-center gap-2 mb-6 shadow-sm active:scale-[0.98] transition-all relative"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          Shop Now
          <div className="absolute right-4 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </button>

        {/* Want another reward? */}
        <div className="w-full bg-[#EFF6FF] rounded-[10px] p-4 flex items-center gap-3.5 mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 border border-[#93C5FD] rounded-full flex items-center justify-center flex-shrink-0 bg-white">
            <Star className="w-5 h-5 text-[#2563EB]" fill="currentColor" />
          </div>
          <div className="flex-1 pr-1">
            <h4 className="text-[13px] font-bold text-[#1E3A8A] mb-0.5">Want another reward?</h4>
            <p className="text-[11px] font-medium text-[#475569] leading-snug">Review another verified product<br/>to unlock more exclusive coupons.</p>
          </div>
          <button className="bg-white border border-[#BFDBFE] text-[#2563EB] text-[11px] font-bold px-3 py-2 rounded-[6px] shadow-sm whitespace-nowrap active:scale-95 transition-all">
            Explore More
          </button>
        </div>

        {/* 4 Footer Icons row */}
        <div className="w-full flex justify-between px-1 border-t border-[#F1F5F9] pt-6 pb-6 mb-2">
          <div className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full border border-blue-100 flex items-center justify-center mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" strokeWidth={2} />
            </div>
            <span className="text-[9px] font-bold text-slate-800 text-center mb-0.5">100% Authentic</span>
            <span className="text-[8px] text-slate-500 text-center">Every Product</span>
          </div>
          
          <div className="flex flex-col items-center flex-1 border-l border-slate-100">
            <div className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center mb-1.5">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <span className="text-[9px] font-bold text-slate-800 text-center mb-0.5">Trusted Reviews</span>
            <span className="text-[8px] text-slate-500 text-center">Real Impact</span>
          </div>
          
          <div className="flex flex-col items-center flex-1 border-l border-slate-100">
            <div className="w-8 h-8 rounded-full border border-purple-100 flex items-center justify-center mb-1.5">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            </div>
            <span className="text-[9px] font-bold text-slate-800 text-center mb-0.5">Exclusive Rewards</span>
            <span className="text-[8px] text-slate-500 text-center">Just for You</span>
          </div>

          <div className="flex flex-col items-center flex-1 border-l border-slate-100">
            <div className="w-8 h-8 rounded-full border border-blue-100 flex items-center justify-center mb-1.5">
              <svg className="w-4 h-4 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <span className="text-[9px] font-bold text-slate-800 text-center mb-0.5">Secure & Safe</span>
            <span className="text-[8px] text-slate-500 text-center">Always</span>
          </div>
        </div>

        {/* Bottom verify text */}
        <div className="flex flex-col items-center text-center pb-8 opacity-90">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShieldCheck className="w-[14px] h-[14px] text-[#2563EB]" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-slate-600">100% Authentic. 100% Rewarded.</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Thank you for choosing authentic products.</span>
        </div>
      </div>
    </div>
  );
}
