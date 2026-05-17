import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authenticIcon from "../../assets/logo.svg";
import warningIcon from "../../assets/v2/home/header/warning.svg";
import fakeIcon from "../../assets/v2/home/header/dangerous.svg";
import MobileHeader from "../../components/MobileHeader";

const DEMO_PRODUCT = {
  active: true,
  companyName: "Alphalite",
  productName: "Panther - Neon Blue",
  brand: "Alphalite",
  batchNo: "ALPHA-2478",
  mfdOn: { month: "Feb", year: "2026" },
  description: "ALPHALITE Performance Series: Panther - Neon Blue\nExperience the intersection of high-performance athletics and cutting-edge digital security. The ALPHALITE Performance Series isn't just a sneaker; it's a verified piece of technology designed for those who demand intelligence as much as they demand speed.",
  keyBenefits: "Design & Aesthetics\nA sleek, low-top aerodynamic profile finished in a deep carbon black.\n\nFeatures integrated neon-blue electroluminescent piping along the midsole, providing a signature \"glow\" that stands out in low-light environments.\n\nConstructed with a high-density engineered mesh upper for maximum breathability and lightweight durability.",
  productImage: "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1776596909/alphali_nig1vq.jpg",
  category: "Sporting Goods",
  dynamicFields: {
    "mrp": "₹36,999",
    "manufacturedBy": "ALPHALITE SPORTS",
    "website": "www.alphalite.com"
  },
  warranty: {
    duration: 1,
    durationUnit: "years",
    warrantyType: "Brand Warranty",
    customerCare: "1600800800",
    supportEmail: "care@alphalite.com",
    description: "This product comes with a 1-Year brand warranty covering all manufacturing defects. Physical damages and unauthorized modifications are not covered under standard terms."
  }
};

export default function DemoResult({ code }) {
  const navigate = useNavigate();

  const isFake = code === 'DEMO-FAKE-QR';
  const isDuplicate = code === 'DEMO-DUPLICATE-QR';
  const isInactive = code === 'DEMO-INACTIVE-QR';

  if (isFake) return <ResultFake data={{ qrCode: code, productName: "Unknown", brand: "Unknown" }} />;
  if (isDuplicate) return <ResultRepeat data={{ ...DEMO_PRODUCT, qrCode: code, originalScan: { scannedAt: new Date(), scannedBy: "98*****123" } }} />;
  if (isInactive) return <ResultInactive data={{ ...DEMO_PRODUCT, qrCode: code }} />;

  return <ResultAuthentic data={{ ...DEMO_PRODUCT, qrCode: code }} />;
}

function DetailBox({ label, value }) {
  return (
    <div className="bg-[#259DCF] rounded-[16px] p-3 shadow-lg text-left">
      <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-white text-[14px] font-bold leading-tight">{value}</p>
    </div>
  );
}

function ResultAuthentic({ data }) {
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [optIn, setOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const [awardedCoupon, setAwardedCoupon] = useState(null);
  const [showCouponReveal, setShowCouponReveal] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyClaimStatus, setWarrantyClaimStatus] = useState(null);
  const [warrantyClaimed, setWarrantyClaimed] = useState(false);
  const [warrantyClaiming, setWarrantyClaiming] = useState(false);
  const [warrantyForm, setWarrantyForm] = useState({ purchaseDate: "" });
  const [invoiceImages, setInvoiceImages] = useState([]);
  const warrantyFileRef = React.useRef(null);

  const productName = data.productName;
  const productImage = data.productImage;
  const companyName = data.companyName;

  const blueFields = [
    { label: "Brand", value: data.brand },
    { label: "Category", value: data.category },
    { label: "Batch #", value: data.batchNo },
    { label: "Mfd on", value: "Feb 2026" },
    { label: "MRP", value: data.dynamicFields.mrp },
    { label: "Color", value: "Neon Blue" },
    { label: "Size", value: "10 UK" },
    { label: "Model / Series", value: "Panther" },
  ];

  const grayFields = [
    { label: "Manufactured By", value: data.dynamicFields.manufacturedBy },
    { label: "Website", value: data.dynamicFields.website },
  ];

  const handleReviewSubmit = () => {
    if (rating === 0) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsReviewed(true);
      setShowReviewModal(false);
      
      const coupon = { 
        title: "DEMO REWARD", 
        code: "WELCOME50", 
        description: "Get 50% off on your next order! This is a demo reward for verification testing.", 
        websiteLink: "https://authentiks.in",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      setAwardedCoupon(coupon);
      setTimeout(() => setShowCouponReveal(true), 300);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => window.location.href = '/'}
        rightIcon={<div className="w-10" />}
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
        {/* Status Card */}
        <div className="bg-[#2CA4D6] rounded-t-[16px] p-4 text-center text-white relative shadow-md z-10">
          <div className="flex flex-row justify-center items-center gap-2">
            <div className="bg-white rounded-full">
              <img
                src={authenticIcon}
                alt="Authentic"
                className="w-11 h-11 object-contain m-1"
              />
            </div>
            <div className="text-left">
              <h2 className="text-[18px] font-bold leading-tight">
                Authentic Product
              </h2>
              <p className="text-[12px] opacity-90 font-medium">
                This product has been verified as genuine
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-b-[16px]">
          {/* Product Image & Name Section */}
          <div className="bg-white pb-6 flex flex-col items-center relative gap-3">
            <div className="w-full bg-[#1F2642] py-2 text-center">
              <h3 className="text-white font-bold text-[20px]">
                {productName}
              </h3>
            </div>
            <div className="relative group px-4 w-full">
              <div className="relative h-[220px] w-full rounded-[2rem] overflow-hidden bg-white shadow-2xl border-4 border-white">
                <img src={productImage} alt={productName} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div className="p-2 space-y-4">
            {/* Grid Details (Blue Cards) */}
            <div className="grid grid-cols-2 gap-3">
              {blueFields.map((field, idx) => (
                <DetailBox key={idx} label={field.label} value={field.value} />
              ))}
            </div>

            {/* Additional Info Section (Gray Box) */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h4 className="text-[#333] font-bold text-[14px] mb-3 ml-1 uppercase tracking-tight">Additional Info:</h4>
              <div className="bg-[#F2F2F2] p-5 rounded-[20px] shadow-sm space-y-4 border border-gray-200/50">
                {/* Product Info / Description */}
                <div className="mb-4">
                  <p className="text-[#444] text-[15px] font-medium whitespace-pre-wrap leading-relaxed">
                    {data.description}
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="mb-4">
                  <p className="text-[#333] text-[12px] font-bold uppercase tracking-wider opacity-60 mb-1">Key Benefits</p>
                  <ul className="list-disc pl-5 text-[#444] text-[14px] font-medium space-y-1">
                    {data.keyBenefits.split('\n').filter(Boolean).map((benefit, i) => (
                      <li key={i}>{benefit.trim()}</li>
                    ))}
                  </ul>
                </div>

                {/* All Collected Gray Fields */}
                <div className="space-y-4">
                  {grayFields.map(({ label, value }, idx) => (
                    <div key={idx} className="border-b border-gray-300/30 pb-3 last:border-0 last:pb-0">
                      <p className="text-[#333] text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1">{label}</p>
                      <p className="text-[#0D4E96] text-[14px] font-bold whitespace-pre-wrap">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Register Warranty Button */}
        {data.warranty && (
          <div className="w-full mt-4">
            {warrantyClaimStatus ? (
              <button
                onClick={() => alert(`Demo Mode Tracker:\nYour claim status is currently: "${warrantyClaimStatus}".\nIn a real scan, you'd be redirected to your personal Warranty Claims dashboard to track this live.`)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-[18px] py-4 rounded-[30px] shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Track Warranty
              </button>
            ) : (
              <button
                onClick={() => setShowWarrantyModal(true)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-[18px] py-4 rounded-[30px] shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Register Warranty
              </button>
            )}
          </div>
        )}

        {/* Review Button */}
        <button 
          onClick={() => setShowReviewModal(true)}
          disabled={isReviewed}
          className={`w-full ${isReviewed ? 'bg-gray-400' : 'bg-gradient-to-r from-[#0E5CAB] to-[#1F2642]'} text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(14,92,171,0.3)] mt-4`}
        >
          {isReviewed ? "Product Reviewed" : "Review Product"}
        </button>

        {/* Review Modal — Premium Bottom Sheet */}
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
            
            {/* Sheet */}
            <div 
              className="relative w-full sm:max-w-[440px] sm:mx-4 bg-white rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-[0_-8px_40px_rgba(0,0,0,0.2)] animate-slide-up"
              style={{ animation: 'reviewSheetUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Handle bar (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* Close button */}
              <button 
                onClick={() => setShowReviewModal(false)}
                className="absolute right-4 top-4 sm:top-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>

              {/* Product Hero */}
              <div className="px-6 pt-8 pb-5 text-center">
                <div className="w-[80px] h-[80px] rounded-[24px] overflow-hidden mx-auto mb-5 shadow-[0_8px_24px_rgba(13,78,150,0.15)] bg-white p-1">
                  <img src={productImage} alt="" className="w-full h-full object-cover rounded-[20px]" />
                </div>
                <h2 className="text-[22px] font-black text-[#0D4E96] tracking-tight leading-tight mb-1.5">{productName}</h2>
                <p className="text-[13px] font-bold text-[#8ba2be] uppercase tracking-[0.1em]">{companyName}</p>
              </div>

              {/* Rating Section */}
              <div className="px-6 py-6 mt-2">
                <p className="text-[18px] font-black text-[#1F2642] text-center mb-1.5 tracking-tight">How was your experience?</p>
                <p className="text-[14px] text-[#2CA4D6]/70 text-center mb-6 font-bold tracking-wide">Tap a star to rate this product</p>
                
                <div className="flex justify-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)} 
                      className="transition-all duration-200 active:scale-75 hover:scale-110"
                      style={{ 
                        transform: star <= rating ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill={star <= rating ? "#F59E0B" : "none"} stroke={star <= rating ? "#F59E0B" : "#CBD5E1"} strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="h-6">
                  {rating > 0 && (
                    <p className="text-center text-[15px] font-black text-[#F59E0B] animate-fade-in">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                    </p>
                  )}
                </div>
              </div>

              {/* Opt-in & Submit */}
              <div className="px-6 pb-8">
                <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="sr-only" />
                    <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${optIn ? 'bg-[#0D4E96] border-[#0D4E96] scale-105' : 'bg-white border-[#CBD5E1] group-hover:border-[#94A3B8]'}`}>
                      {optIn && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                  </div>
                  <span className="text-[12px] font-bold text-[#333] leading-tight mt-0.5">Yes, I would like to receive exclusive offer and discounts from the brand</span>
                </label>

                <button
                  onClick={handleReviewSubmit}
                  disabled={submitting || rating === 0}
                  className={`w-full font-bold text-[16px] py-4 rounded-2xl shadow-lg transition-all duration-300 active:scale-[0.97] ${
                    rating === 0 
                      ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white shadow-blue-500/25 hover:shadow-blue-500/40'
                  } disabled:opacity-60`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>
                      Submitting...
                    </span>
                  ) : "Submit Review"}
                </button>
              </div>
            </div>

            <style>{`
              @keyframes reviewSheetUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              .animate-fade-in {
                animation: fadeIn 0.3s ease;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}

        {/* Coupon Reveal Dialog - Full Screen */}
        {showCouponReveal && awardedCoupon && (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col font-sans overflow-y-auto animate-fade-in">
            <MobileHeader
              title="Authentiks"
              onLeftClick={() => setShowCouponReveal(false)}
              rightIcon={<div className="w-10" />}
            />
            
            <div className="flex-1 px-5 py-8 flex flex-col items-center">
              <h2 className="text-[#0D4E96] text-[22px] font-bold text-center leading-tight mb-10 max-w-[280px]">
                Congratulations,<br />You've Unlocked a Reward!
              </h2>

              {/* Ticket Card */}
              <div className="w-full max-w-sm relative mt-6 shadow-[0_15px_40px_rgba(0,0,0,0.1)] rounded-[20px] bg-white border border-gray-100">
                
                {/* Gift Icon overlapping top */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#2CA4D6] rounded-full border-[6px] border-white flex items-center justify-center z-10 shadow-sm">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12"></polyline>
                    <rect x="2" y="7" width="20" height="5"></rect>
                    <line x1="12" y1="22" x2="12" y2="7"></line>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                  </svg>
                </div>

                {/* Top Dark Section */}
                <div className="bg-[#1F2642] rounded-t-[20px] pt-14 pb-8 px-6 text-center relative overflow-hidden">
                  <h3 className="text-white text-[24px] font-black uppercase tracking-wide">
                    {awardedCoupon.title}
                  </h3>
                </div>

                {/* Middle Light Blue Section */}
                <div className="bg-[#2CA4D6] py-4 px-6 relative flex items-center justify-center gap-3">
                  {/* Left Cutout */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full"></div>
                  {/* Right Cutout */}
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full"></div>
                  
                  <span className="text-white text-[20px] font-black tracking-widest uppercase">
                    {awardedCoupon.code}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(awardedCoupon.code);
                      setCouponCopied(true);
                      setTimeout(() => setCouponCopied(false), 2000);
                    }}
                    className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    {couponCopied ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    )}
                  </button>
                </div>

                {/* Bottom White Section */}
                <div className="bg-white rounded-b-[20px] p-6 text-center">
                  <p className="text-[#333] text-[14px] font-bold mb-4">
                    Valid till: {new Date(awardedCoupon.expiryDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </p>
                  
                  <div className="text-left mb-6">
                    <p className="text-[#666] text-[12px] font-bold uppercase mb-1">Coupon Details:</p>
                    <p className="text-[#666] text-[13px] leading-relaxed">
                      {awardedCoupon.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      window.open(awardedCoupon.websiteLink, '_blank');
                    }}
                    className="w-full bg-[#1F2642] text-white font-bold text-[16px] py-4 rounded-[30px] shadow-lg active:scale-95 transition-transform"
                  >
                    Redeem Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ===== Warranty Claim Modal ===== */}
        {showWarrantyModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowWarrantyModal(false)} />
            <div
              className="relative w-full sm:max-w-[440px] sm:mx-4 bg-white rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-[0_-8px_40px_rgba(0,0,0,0.2)]"
              style={{ animation: 'reviewSheetUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Handle bar (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* Close */}
              <button
                onClick={() => setShowWarrantyModal(false)}
                className="absolute right-4 top-4 sm:top-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>

              {/* Header */}
              <div className="px-6 pt-8 pb-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h2 className="text-[20px] font-black text-[#0D4E96] tracking-tight">Register Warranty</h2>
                <p className="text-[13px] text-gray-500 font-medium mt-1">Upload your purchase invoice to register warranty</p>
              </div>

              {/* ===== Warranty Info Section ===== */}
              {data.warranty && (
                <div className="mx-6 mb-6 bg-emerald-50 rounded-[16px] shadow-sm border border-emerald-100 overflow-hidden">
                  <div className="p-4 space-y-3">
                    {data.warranty.warrantyType && (
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Type</span>
                        <span className="text-[14px] text-emerald-700 font-bold">{data.warranty.warrantyType}</span>
                      </div>
                    )}
                    {data.warranty.duration && (
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Duration</span>
                        <span className="text-[14px] text-emerald-700 font-bold">
                          {data.warranty.duration} {data.warranty.durationUnit === 'years' ? 'Year(s)' : 'Month(s)'}
                        </span>
                      </div>
                    )}
                    {data.warranty.customerCare && (
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Support Tel</span>
                        <span className="text-[14px] text-emerald-700 font-bold">
                          <a href={`tel:${data.warranty.customerCare}`} className="underline hover:text-emerald-800">{data.warranty.customerCare}</a>
                        </span>
                      </div>
                    )}
                    {data.warranty.supportEmail && (
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Support Email</span>
                        <span className="text-[14px] text-emerald-700 font-bold">
                          <a href={`mailto:${data.warranty.supportEmail}`} className="underline hover:text-emerald-800">{data.warranty.supportEmail}</a>
                        </span>
                      </div>
                    )}
                    {data.warranty.description && (
                      <div className="border-t border-emerald-100 pt-3">
                        <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider mb-1">Details</p>
                        <p className="text-[13px] text-gray-700 leading-relaxed break-all whitespace-pre-wrap">{data.warranty.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="px-6 pb-8 space-y-5">
                {/* Purchase Date */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Purchase Date *</label>
                  <input
                    type="date"
                    value={warrantyForm.purchaseDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setWarrantyForm({ ...warrantyForm, purchaseDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                    required
                  />
                </div>

                {/* Invoice Image Upload */}
                <div>
                  <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Invoice / Bill Images * <span className="text-gray-400 font-normal">(max 3)</span>
                  </label>

                  {/* Image previews */}
                  {invoiceImages.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {invoiceImages.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-200 shadow-sm">
                          <img src={img.preview} alt={`Invoice ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setInvoiceImages(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {invoiceImages.length < 3 && (
                    <div className="flex gap-2">
                      {/* Camera capture */}
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-700 font-bold text-[13px] cursor-pointer hover:bg-emerald-100 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        Camera
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const preview = URL.createObjectURL(f);
                            setInvoiceImages(prev => [...prev, { file: f, preview }]);
                            e.target.value = '';
                          }}
                        />
                      </label>

                      {/* File upload */}
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl text-blue-700 font-bold text-[13px] cursor-pointer hover:bg-blue-100 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Gallery
                        <input
                          ref={warrantyFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const preview = URL.createObjectURL(f);
                            setInvoiceImages(prev => [...prev, { file: f, preview }]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Upload clear photos of your purchase bill/invoice (images only, no PDFs)</p>
                </div>

                {/* Submit */}
                <button
                  onClick={() => {
                    if (!warrantyForm.purchaseDate) {
                      alert('Please select a purchase date');
                      return;
                    }
                    if (invoiceImages.length === 0) {
                      alert('Please upload at least one invoice image');
                      return;
                    }

                    setWarrantyClaiming(true);
                    setTimeout(() => {
                      setWarrantyClaiming(false);
                      setWarrantyClaimStatus('Processing');
                      setWarrantyClaimed(true);
                      setShowWarrantyModal(false);
                      alert('Demo Mode: Warranty registered successfully! (Simulated submission)');
                    }, 1500);
                  }}
                  disabled={warrantyClaiming}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-[16px] py-4 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {warrantyClaiming ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>
                      Registering...
                    </span>
                  ) : 'Submit Claim'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRepeat({ data }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => window.location.href = '/'}
        rightIcon={<div className="w-10" />}
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
        {/* Alert Card */}
        <div className="bg-[#FFA808] rounded-[16px] shadow-[0_10px_20px_rgba(255,168,8,0.3)] text-center text-white flex flex-col items-center gap-3">
          <div className="flex flex-col justify-center items-center gap-2 mt-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <img src={warningIcon} alt="Warning" className="w-10 h-10" />
            </div>

            <h2 className="text-[20px] font-bold uppercase tracking-wide">
              REPEAT SCAN ALERT
            </h2>
          </div>
          <div className="bg-[#444444] p-2 w-full">
            <p className="text-[13px] font-medium leading-tight mt-1 opacity-95">
              This product has already been scanned and verified earlier on
              another account
            </p>
          </div>
        </div>

        <div className="bg-white rounded-b-[16px] shadow-sm p-2 pt-4">
          <div className="bg-[#F8F8F8] rounded-[16px] p-5 shadow-lg text-center space-y-2 border border-gray-200">
            <div>
              <p className="text-[#6E6D6B] text-[14px] font-bold">
                Already Verified On:
              </p>
              <p className="text-[#6E6D6B] text-[16px] font-bold">
                {new Date(data.originalScan.scannedAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
            <div>
              <p className="text-[#6E6D6B] text-[14px] font-bold">
                Scanned Mobile No:
              </p>
              <p className="text-[#6E6D6B] text-[16px] font-bold">
                {data.originalScan.scannedBy}
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <h4 className="font-bold text-[#333] text-[13px] mb-1">Why you're seeing this?</h4>
              <ul className="list-disc pl-4 text-[#666] text-[11px] space-y-0.5">
                <li>This product's digital ID has been used before</li>
                <li>Genuine products are typically verified once per unit</li>
                <li>Repeated scans can be a sign of tampering or misuse</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#333] text-[13px] mb-1">What should you do?</h4>
              <ul className="list-disc pl-4 text-[#666] text-[11px] space-y-0.5">
                <li>Avoid purchasing or using this product</li>
                <li>Report to local consumer protection agency</li>
                <li>Contact the brand directly with batch details</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-2">
          <p className="text-[#FFA808] font-bold text-[14px]">Help us protect others</p>
          <p className="text-[#FFA808] font-bold text-[14px] mb-3">Report this product now</p>

          <button
            onClick={() => navigate("/demo-report", {
              state: {
                qrCode: data.qrCode,
                reportType: "FAKE",
                productName: data.productName,
                brand: data.brand
              }
            })}
            className="w-full bg-[#FFA808] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(255,168,8,0.4)]"
          >
            Click to Report
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultFake({ data }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => window.location.href = '/'}
        rightIcon={<div className="w-10" />}
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
        <div className="bg-[#E30211] rounded-[16px] shadow-[0_10px_20px_rgba(227,2,17,0.3)] text-center text-white flex flex-col items-center gap-3">
          <div className="flex flex-col justify-center items-center gap-2 mt-4">
            <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center">
              <img src={fakeIcon} alt="Counterfeit" className="w-[64px] h-[64px]" />
            </div>
            <h2 className="text-[20px] font-bold uppercase tracking-wide">COUNTERFEIT DETECTED</h2>
          </div>
          <div className="bg-[#444444] p-2 w-full">
            <p className="text-[14px] font-medium leading-tight opacity-95">
              The scanned product is a Counterfeit or its not a registered product with Authentiks
            </p>
          </div>
        </div>

        <div className="bg-white rounded-b-[16px] shadow-sm p-2 pt-4">
          <div className="bg-[#F8F8F8] rounded-[16px] p-5 shadow-lg space-y-2 border border-gray-200">
            <h3 className="text-[#6E6D6B] font-bold text-[18px] mb-2">Health & Safety Alert</h3>
            <p className="text-[#6E6D6B] text-[15px] leading-relaxed font-medium">
              Millions like you are unknowingly put at risk by consuming or using counterfeit products
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <h4 className="font-bold text-[#333] text-[16px] mb-2">What should you do?</h4>
              <ul className="list-disc pl-5 text-[#666] text-[14px] space-y-1.5 font-medium">
                <li>Do not use or consume this product</li>
                <li>Report to local consumer protection agency</li>
                <li>Contact the brand directly with batch details</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-[#E30211] font-bold text-[15px]">Help us protect others</p>
          <p className="text-[#E30211] font-bold text-[15px] mb-3">Report this product now</p>

          <button
            onClick={() => navigate("/demo-report", {
              state: {
                qrCode: data.qrCode,
                reportType: "COUNTERFEIT",
                productName: data.productName,
                brand: data.brand
              }
            })}
            className="w-full bg-[#E30211] text-white font-bold text-[20px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(227,2,17,0.4)]"
          >
            Click to Report
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultInactive({ data }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => window.location.href = '/'}
        rightIcon={<div className="w-10" />}
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
        <div className="bg-[#444444] rounded-[16px] shadow-[0_10px_20px_rgba(68,68,68,0.3)] text-center text-white flex flex-col items-center gap-3 pb-6">
          <div className="flex flex-col justify-center items-center gap-2 mt-4">
            <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center">
              <img src={fakeIcon} alt="Inactive" className="w-[64px] h-[64px] opacity-50 grayscale" />
            </div>
            <h2 className="text-[20px] font-bold uppercase tracking-wide">INACTIVE QR CODE</h2>
          </div>
          <div className="px-6 w-full">
            <p className="text-[14px] font-medium leading-tight opacity-95">
              This QR code has been recorded but is currently not active in our system.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-b-[16px] shadow-sm p-4 pt-6">
          <div className="bg-[#F8F8F8] rounded-[16px] p-4 border border-gray-200 mb-6">
            <h3 className="text-[#333] font-bold text-[16px] mb-3 text-left">Product Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Product</span>
                <span className="text-gray-900 font-bold">{data.productName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Brand</span>
                <span className="text-gray-900 font-bold">{data.brand}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Batch #</span>
                <span className="text-gray-900 font-bold">{data.batchNo}</span>
              </div>
            </div>
          </div>

          <h3 className="text-[#333] font-bold text-[18px] mb-2 text-left">What does this mean?</h3>
          <p className="text-[#666] text-[14px] leading-relaxed text-left mb-6">
            A product might be marked as inactive if it's still in the warehouse, awaiting market release, or has been recalled.
          </p>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-[#0D4E96] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(13,78,150,0.3)]"
          >
            Scan Another Product
          </button>
        </div>
      </div>
    </div>
  );
}
