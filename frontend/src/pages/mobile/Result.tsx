import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

// Assets
import authenticIcon from "../../assets/logo.svg";
import warningIcon from "../../assets/v2/home/header/warning.svg"; // Triangle
import fakeIcon from "../../assets/v2/home/header/dangerous.svg"; // Red X

import MobileHeader from "../../components/MobileHeader";
import { maskPhoneNumber } from "../../utils/helper";

export default function Result() {
  const { status } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const validStatuses = ["ORIGINAL", "ALREADY_USED", "ALREADY_SCANNED", "DUPLICATE", "FAKE", "INACTIVE"];
  const shouldRedirect = !state || !validStatuses.includes(status ?? "");

  useEffect(() => {
    if (shouldRedirect) navigate("/scan", { replace: true });
  }, [shouldRedirect, navigate]);

  if (shouldRedirect) return null;

  const data = state as any;

  if (status === "ORIGINAL") return <ResultAuthentic data={data} />;
  if (status === "ALREADY_USED" || status === "ALREADY_SCANNED" || status === "DUPLICATE") return <ResultRepeat data={data} />;
  if (status === "FAKE") return <ResultFake data={data} />;
  if (status === "INACTIVE") return <ResultInactive data={data} />;

  return null;
}

const handleNotificationClick = () => {
  // Placeholder for notification click
  console.log("Notification clicked");
};

// --- Sub-Components ---

function Header({ title = "Authentiks", showBell = true }) {
  const navigate = useNavigate();
  return (
    <div className="w-full flex items-center justify-between p-4 bg-white sticky top-0 z-50 shadow-sm/50">
      <button onClick={() => navigate("/home")} className="text-[#0D4E96] p-1">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 className="text-[20px] font-bold text-[#0D4E96] tracking-tight">
        {title}
      </h1>
      {showBell ? (
        <button className="text-[#0D4E96] p-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#0D4E96"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" />
          </svg>
        </button>
      ) : (
        <div className="w-8"></div>
      )}
    </div>
  );
}

function ResultAuthentic({ data }: { data: any }) {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isReviewed, setIsReviewed] = useState(data.alreadyReviewed || false);
  const [awardedCoupon, setAwardedCoupon] = useState<any>(null);
  const [showCouponReveal, setShowCouponReveal] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  // Determine colors
  const productName = data.productName || data.productId?.productName || "Product Info";

  // Check for image in data, then data.productId, then data.images array
  const productImage = data.productImage || data.productId?.productImage || (data.images && data.images.length > 0 ? data.images[0] : null);
  console.log("______product image", productImage, data)

  const companyName = data.companyName || data.company || data.manufacturer || data.brand || data.productId?.brand || "-";

  const technicalFields = [
    { key: "brand", label: "Brand" },
    { key: "category", label: "Category" },
    { key: "batchNo", label: "Batch #" },
    { key: "sku", label: "SKU" },
    { key: "mrp", label: "MRP" },
    { key: "color", label: "Color" },
    { key: "size", label: "Size" },
    { key: "model", label: "Model / Series" },
    { key: "weight", label: "Weight" },
    { key: "storage", label: "Storage" },
    { key: "flavour", label: "Flavour" },
    { key: "capacity", label: "Capacity" },
    { key: "material", label: "Material" },
    { key: "mfdOn", label: "Mfd on" },
    { key: "expiryDate", label: "Exp by" },
  ];

  // Helper to format labels from camelCase or field IDs
  const formatLabel = (key: string) => {
    if (key.toLowerCase().startsWith('field_')) return "Product Detail";
    if (key.toLowerCase().startsWith('variant_')) return "Specification";
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1).trim();
  };

  // Combine blue fields
  const blueFields: { label: string; value: any }[] = [];
  const handledKeys = new Set<string>();
  const fieldLabels = data.fieldLabels || data.productId?.fieldLabels || {};

  technicalFields.forEach(({ key, label }) => {
    let val = data[key] || data.productId?.[key];
    
    // Check dynamicFields or variants if not found top-level
    if (!val && data.dynamicFields) val = data.dynamicFields[key];
    if (!val && data.productId?.dynamicFields) val = data.productId.dynamicFields[key];
    
    if (!val && (data.variants || data.productId?.variants)) {
      const vArr = (data.variants || data.productId?.variants);
      const variant = vArr.find((v: any) => v.variantName?.toLowerCase() === key.toLowerCase());
      if (variant) val = variant.value;
    }

    const isDateObject = (v: any) => v && typeof v === 'object' && v.month && v.year;

    if (key === "mfdOn") {
      if (isDateObject(val)) {
        val = `${val.month} ${val.year}`;
      } else if (!val) {
        const mfd = data.mfdOn || data.productId?.mfdOn;
        if (isDateObject(mfd)) val = `${mfd.month} ${mfd.year}`;
      }
    }

    if (key === "expiryDate") {
      if (isDateObject(val)) {
        val = `${val.month} ${val.year}`;
      } else if (!val) {
        const exp = data.expiryDate || data.expiry || data.calculatedExpiryDate || data.productId?.expiryDate || data.productId?.expiry || data.productId?.calculatedExpiryDate;
        if (isDateObject(exp)) val = `${exp.month} ${exp.year}`;
        else if (typeof exp === 'string') val = exp;
      }
    }

    if (val && val !== "-") {
      blueFields.push({ label: fieldLabels[key] || label, value: String(val) });
      handledKeys.add(key);
    }
  });

  // Collect variants that haven't been handled yet and add them to blue boxes
  const allVariants = data.variants || data.productId?.variants || [];
  allVariants.forEach((v: any) => {
    if (!handledKeys.has(v.variantName) && !handledKeys.has(v.variantName?.toLowerCase())) {
      blueFields.push({ 
        label: fieldLabels[v.variantName] || v.variantLabel || formatLabel(v.variantName || ""), 
        value: String(v.value) 
      });
      handledKeys.add(v.variantName);
    }
  });


  // Additional Info fields (hardcoded list)
  const additionalInfoFields = [
    { key: "manufacturedBy", label: "Manufactured By" },
    { key: "marketedBy", label: "Marketed By" },
    { key: "importMarketedBy", label: "Import & Marketed By" },
    { key: "importerRegNo", label: "Importer Reg. No" },
    { key: "countryOfOrigin", label: "Country of Origin" },
    { key: "website", label: "Website" },
    { key: "supportEmail", label: "Support E-mail" },
    { key: "customerCare", label: "Customer Care" },
  ];

  // Dynamic fields to be shown in gray section
  const grayFields: { label: string; value: any }[] = [];
  
  // 1. Add fields from hardcoded additionalInfoFields
  additionalInfoFields.forEach(({ key, label }) => {
    let val = data[key] || data.productId?.[key];
    if (!val && data.dynamicFields) val = data.dynamicFields[key];
    if (!val && data.productId?.dynamicFields) val = data.productId?.dynamicFields[key];

    if (key === "manufacturedBy" || key === "marketedBy" || key === "importMarketedBy") {
      if (val && companyName !== "-" && !val.toLowerCase().includes(companyName.toLowerCase())) {
        val = `${companyName}\n${val}`;
      } else if (!val && companyName !== "-") {
        val = companyName;
      }
    }

    if (val && val !== "-" && !handledKeys.has(key)) {
      grayFields.push({ label, value: String(val) });
      handledKeys.add(key);
    }
  });

  // 2. Add all other dynamic fields that haven't been handled yet
  const combinedDynamicFields = { ...(data.productId?.dynamicFields || {}), ...(data.dynamicFields || {}) };
  Object.keys(combinedDynamicFields).forEach(key => {
    if (!handledKeys.has(key)) {
      // Skip quantity and SKU fields from display as per user request
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'product quantity' || lowerKey === 'quantity' || lowerKey === 'productquantity' || lowerKey === 'qr quantity' || lowerKey === 'qrquantity' || lowerKey.includes('sku')) {
        return;
      }

      let val = combinedDynamicFields[key];
      if (val && val !== "-") {
        if (typeof val === 'object' && val.month && val.year) {
           val = `${val.month} ${val.year}`;
        }
        
        if (typeof val !== 'object') {
          const label = fieldLabels[key] || formatLabel(key);
          grayFields.push({ label, value: String(val) });
          handledKeys.add(key);
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => navigate("/profile")}
        onNotificationClick={handleNotificationClick}
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
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative h-[220px] w-full rounded-[2rem] overflow-hidden bg-white shadow-2xl border-4 border-white shadow-indigo-200/50">
                {productImage ? (
                  <img src={productImage} alt={data.productName} className="w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                    {/* Assuming 'Package' icon is available or needs to be imported/defined */}
                    {/* <Package size={80} className="text-slate-300 stroke-[1.5]" /> */}
                    <span className="text-slate-300 text-xl">No Image</span>
                  </div>
                )}
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
                {(data.description || data.productId?.description || data.productInfo || data.productId?.productInfo) && (
                  <div className="mb-4">
                    <p className="text-[#444] text-[15px] font-medium whitespace-pre-wrap leading-relaxed">
                      {data.description || data.productId?.description || data.productInfo || data.productId?.productInfo}
                    </p>
                  </div>
                )}

                {/* Key Benefits */}
                {(data.keyBenefits || data.productId?.keyBenefits) && (
                  <div className="mb-4">
                    <p className="text-[#333] text-[12px] font-bold uppercase tracking-wider opacity-60 mb-1">Key Benefits</p>
                    <ul className="list-disc pl-5 text-[#444] text-[14px] font-medium space-y-1">
                      {(data.keyBenefits || data.productId?.keyBenefits).split('\n').filter(Boolean).map((benefit: string, i: number) => (
                        <li key={i}>{benefit.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* All Collected Gray Fields */}
                <div className="space-y-4">
                  {/* Gray Dynamic Fields */}
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
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ animation: 'reviewOverlayIn 0.25s ease' }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
            
            {/* Sheet */}
            <div 
              className="relative w-full sm:max-w-[440px] sm:mx-4 bg-white rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-[0_-8px_40px_rgba(0,0,0,0.2)] sm:shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
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
              <div className="px-6 pt-5 sm:pt-7 pb-5 text-center">
                {productImage ? (
                  <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg shadow-blue-500/10 border-2 border-white ring-2 ring-[#E8F4F9]">
                    <img src={productImage} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#F0F7FF] to-[#E8F4F9] mx-auto mb-4 flex items-center justify-center shadow-inner border-2 border-white ring-2 ring-[#E8F4F9]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2CA4D6" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  </div>
                )}
                <h2 className="text-[20px] font-black text-[#0D4E96] tracking-tight leading-tight mb-1">{productName}</h2>
                <p className="text-[13px] font-semibold text-[#1a5fa8]/50 uppercase tracking-wider">{companyName}</p>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#E8F4F9] to-transparent" />

              {/* Rating Section */}
              <div className="px-6 py-6">
                <p className="text-[15px] font-bold text-[#1e3a5f] text-center mb-1">How was your experience?</p>
                <p className="text-[12px] text-[#1a5fa8]/40 text-center mb-5 font-medium">Tap a star to rate this product</p>
                
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)} 
                      className="transition-all duration-200 active:scale-75 hover:scale-110"
                      style={{ 
                        transform: star <= rating ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >
                      <svg width="44" height="44" viewBox="0 0 24 24" fill={star <= rating ? "#F59E0B" : "none"} stroke={star <= rating ? "#F59E0B" : "#D1D5DB"} strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-[13px] font-bold text-[#F59E0B] mb-1" style={{ animation: 'reviewFadeIn 0.3s ease' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </p>
                )}
              </div>

              {/* Comment Section */}
              <div className="px-6 pb-5">
                <label className="text-[13px] font-bold text-[#1e3a5f]/70 block mb-2">Share your thoughts <span className="text-[#1a5fa8]/30 font-medium">(optional)</span></label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you think about this product?"
                  rows={3}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 text-[14px] text-[#1e3a5f] placeholder-[#94A3B8] font-medium resize-none focus:outline-none focus:ring-2 focus:ring-[#2CA4D6]/30 focus:border-[#2CA4D6]/50 transition-all"
                />
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
                  <span className="text-[12px] font-medium text-[#64748B] leading-relaxed">I'd like to receive exclusive offers and updates from this brand</span>
                </label>

                <button
                  onClick={async () => {
                    if (rating === 0) return alert("Please select a rating");
                    setSubmitting(true);
                    try {
                      const { submitReview } = await import("../../config/api");
                      const token = localStorage.getItem('token');
                      const result = await submitReview({
                        productId: data.productId?._id || data.productId,
                        rating,
                        comment,
                        optIn
                      }, token);
                      setIsReviewed(true);
                      setShowReviewModal(false);
                      
                      // Check if a coupon was awarded
                      if (result.coupon) {
                        setAwardedCoupon(result.coupon);
                        setTimeout(() => setShowCouponReveal(true), 300);
                      } else {
                        alert("Thank you for your review!");
                      }
                    } catch (error: any) {
                      alert(error.message || "Failed to submit review");
                      if (error.message && error.message.includes("already reviewed")) {
                        setIsReviewed(true);
                        setShowReviewModal(false);
                      }
                    } finally {
                      setSubmitting(false);
                    }
                  }}
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
              @keyframes reviewOverlayIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes reviewSheetUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              @keyframes reviewFadeIn {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}

        {/* Coupon Reveal Dialog */}
        {showCouponReveal && awardedCoupon && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" style={{ animation: 'couponFadeIn 0.25s ease' }}>
            {/* Confetti particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${4 + Math.random() * 6}px`,
                    height: `${4 + Math.random() * 6}px`,
                    left: `${Math.random() * 100}%`,
                    top: `-5%`,
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#F0E68C'][i % 7],
                    animation: `couponConfetti ${2 + Math.random() * 3}s linear ${Math.random() * 1.5}s infinite`,
                  }}
                />
              ))}
            </div>

            <div 
              className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full sm:max-w-[380px] sm:mx-6 overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.15)] sm:shadow-[0_20px_60px_rgba(13,78,150,0.35)]"
              style={{ animation: 'couponSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-[#0D4E96] via-[#1565B8] to-[#2CA4D6] px-6 py-7 text-center relative">
                <span className="text-[40px] block mb-2">🎉</span>
                <h2 className="text-white text-[22px] font-black tracking-tight leading-tight">You Earned a Reward!</h2>
                <p className="text-white/70 text-[13px] mt-1.5 font-semibold uppercase tracking-widest">Thank you for your review</p>
                {/* Close button */}
                <button
                  onClick={() => setShowCouponReveal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center active:bg-white/30 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                {/* Coupon Code Box */}
                <div className="bg-[#F0F7FF] border-2 border-dashed border-[#2CA4D6]/30 rounded-2xl p-5 mb-5">
                  <p className="text-[10px] text-[#1a5fa8]/70 font-black uppercase tracking-[0.2em] text-center mb-3">Your Coupon Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-[22px] sm:text-[26px] font-black text-[#0D4E96] tracking-[0.12em] break-all text-center leading-tight">
                      {awardedCoupon.code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(awardedCoupon.code);
                        setCouponCopied(true);
                        setTimeout(() => setCouponCopied(false), 2000);
                      }}
                      className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#0D4E96] to-[#2CA4D6] rounded-xl active:scale-90 transition-transform flex items-center justify-center shadow-md"
                    >
                      {couponCopied ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      )}
                    </button>
                  </div>
                  {couponCopied && (
                    <p className="text-[#059669] text-[11px] font-bold text-center mt-2 animate-pulse">Copied to clipboard!</p>
                  )}
                </div>

                {awardedCoupon.description && (
                  <p className="text-[#1e3a5f]/70 text-[14px] text-center mb-4 font-medium leading-relaxed">{awardedCoupon.description}</p>
                )}

                {awardedCoupon.expiryDate && (
                  <p className="text-[#1a5fa8]/40 text-[12px] font-bold text-center mb-5">
                    Valid until {new Date(awardedCoupon.expiryDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </p>
                )}

                <button
                  onClick={() => navigate('/rewards')}
                  className="w-full bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white font-bold text-[15px] py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.97] transition-all mb-2"
                >
                  View My Rewards
                </button>
                <button
                  onClick={() => setShowCouponReveal(false)}
                  className="w-full text-[#1e3a5f]/40 font-semibold text-[13px] py-2.5 active:bg-gray-50 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* CSS for animations */}
            <style>{`
              @keyframes couponConfetti {
                0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
              }
              @keyframes couponFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes couponSlideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}


function ResultRepeat({ data }: { data: any }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => navigate("/profile")}
        onNotificationClick={handleNotificationClick}
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
          {/* Details Section */}
          <div className="bg-[#F8F8F8] rounded-[16px] p-5 shadow-lg text-center space-y-2 border border-gray-200">
            <div>
              <p className="text-[#6E6D6B] text-[14px] font-bold">
                Already Verified On:
              </p>
              <p className="text-[#6E6D6B] text-[16px] font-bold">
                {data.originalScan?.scannedAt
                  ? new Date(data.originalScan.scannedAt).toLocaleString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    },
                  )
                  : "20/Oct/2025  08:30 PM (IST)"}
              </p>
            </div>
            {data.originalScan?.scannedBy && data.originalScan.scannedBy !== 'Unknown' && (
              <div>
                <p className="text-[#6E6D6B] text-[14px] font-bold">
                  Scanned Mobile No:
                </p>
                <p className="text-[#6E6D6B] text-[16px] font-bold">
                  {maskPhoneNumber(data.originalScan.scannedBy)}
                </p>
              </div>
            )}
            {/* <div>
              <p className="text-[#6E6D6B] text-[12px] font-bold">
                Product Verification ID:
              </p>
              <p className="text-[#6E6D6B] text-[14px] font-bold">
                {data._id
                  ? data._id.slice(-12).toUpperCase()
                  : "SSG45SHHSB58SBH"}
              </p>
            </div> */}
          </div>

          {/* Info Text */}
          <div className="p-5  space-y-4">
            <div>
              <h4 className="font-bold text-[#333] text-[13px] mb-1">
                Why you're seeing this?
              </h4>
              <ul className="list-disc pl-4 text-[#666] text-[11px] space-y-0.5">
                <li>This product's digital ID has been used before</li>
                <li>Genuine products are typically verified once per unit</li>
                <li>Repeated scans can be a sign of tampering or misuse</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#333] text-[13px] mb-1">
                What should you do?
              </h4>
              <ul className="list-disc pl-4 text-[#666] text-[11px] space-y-0.5">
                <li>Avoid purchasing or using this product</li>
                <li>Report to local consumer protection agency</li>
                <li>Contact the brand directly with batch details</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Report CTA */}
        <div className="text-center mt-2">
          <p className="text-[#FFA808] font-bold text-[14px]">
            Help us protect others
          </p>
          <p className="text-[#FFA808] font-bold text-[14px] mb-3">
            Report this product now
          </p>

          <button
            onClick={() => navigate("/report", {
              state: {
                qrCode: data.qrCode,
                reportType: "FAKE",
                productName: data.productName || data.productId?.productName,
                brand: data.brand || data.productId?.brand,
                productId: data.productId?._id || data.productId || null,
                brandId: data.brandId || data.productId?.brandId || null,
                scanStatus: "FAKE"
              }
            })}
            className="w-full bg-[#FFA808] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(255,168,8,0.4)] hover:bg-[#e59410] transition-colors"
          >
            Click to Report
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultFake({ data }: { data: any }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => navigate("/profile")}
        onNotificationClick={handleNotificationClick}
        rightIcon={<div className="w-10" />}
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
        {/* Counterfeit Card - Matches Repeat Alert Card style */}
        <div className="bg-[#E30211] rounded-[16px] shadow-[0_10px_20px_rgba(227,2,17,0.3)] text-center text-white flex flex-col items-center gap-3">
          <div className="flex flex-col justify-center items-center gap-2 mt-4">
            <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center">
              <img
                src={fakeIcon}
                alt="Counterfeit"
                className="w-[64px] h-[64px]"
              />
            </div>
            <h2 className="text-[20px] font-bold uppercase tracking-wide">
              COUNTERFEIT DETECTED
            </h2>
          </div>
          <div className="bg-[#444444] p-2 w-full">
            <p className="text-[14px] font-medium leading-tight  opacity-95">
              The scanned product is a Counterfeit or its not a registered
              product with Authentiks
            </p>
          </div>
        </div>

        <div className="bg-white rounded-b-[16px] shadow-sm p-2 pt-4">
          {/* Health Alert - Styled like Repeat's Details Section */}
          <div className="bg-[#F8F8F8] rounded-[16px] p-5 shadow-lg space-y-2 border border-gray-200">
            <h3 className="text-[#6E6D6B] font-bold text-[18px] mb-2">
              Health & Safety Alert
            </h3>
            <p className="text-[#6E6D6B] text-[15px] leading-relaxed font-medium">
              Millions like you are unknowingly put at risk by consuming or
              using counterfeit products
            </p>
          </div>

          {/* Action Steps - Styled like Repeat's Info Text */}
          <div className="p-5 space-y-4">
            <div>
              <h4 className="font-bold text-[#333] text-[16px] mb-2">
                What should you do?
              </h4>
              <ul className="list-disc pl-5 text-[#666] text-[14px] space-y-1.5 font-medium">
                <li>Do not use or consume this product</li>
                <li>Report to local consumer protection agency</li>
                <li>Contact the brand directly with batch details</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Report CTA */}
        <div className="text-center mt-4">
          <p className="text-[#E30211] font-bold text-[15px]">
            Help us protect others
          </p>
          <p className="text-[#E30211] font-bold text-[15px] mb-3">
            Report this product now
          </p>

          <button
            onClick={() => navigate("/report", {
              state: {
                qrCode: data.qrCode,
                reportType: "COUNTERFEIT",
                productName: data.productName,
                brand: data.brand,
                productId: data.productId || null,
                brandId: data.brandId || null,
                scanStatus: data.status || "ALREADY_USED"
              }
            })}
            className="w-full bg-[#E30211] text-white font-bold text-[20px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(227,2,17,0.4)] hover:bg-[#c9020f] transition-colors"
          >
            Click to Report
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-[#259DCF] rounded-[16px] p-3 shadow-lg text-left">
      <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-white text-[14px] font-bold leading-tight">{value}</p>
    </div>
  );
}

function ResultInactive({ data }: { data: any }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      <MobileHeader
        title="Scan Result"
        onLeftClick={() => navigate("/profile")}
        onNotificationClick={handleNotificationClick}
        rightIcon={<div className="w-10" />}
      />

      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
        {/* Inactive Card */}
        <div className="bg-[#444444] rounded-[16px] shadow-[0_10px_20px_rgba(68,68,68,0.3)] text-center text-white flex flex-col items-center gap-3 pb-6">
          <div className="flex flex-col justify-center items-center gap-2 mt-4">
            <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center">
              <img
                src={fakeIcon}
                alt="Inactive"
                className="w-[64px] h-[64px] opacity-50 grayscale"
              />
            </div>
            <h2 className="text-[20px] font-bold uppercase tracking-wide">
              INACTIVE QR CODE
            </h2>
          </div>
          <div className="px-6 w-full">
            <p className="text-[14px] font-medium leading-tight opacity-95">
              This QR code has been recorded but is currently not active in our system.
            </p>
          </div>
        </div>

        {/* Display product info even if inactive */}
        <div className="bg-white rounded-b-[16px] shadow-sm p-4 pt-6">
          <div className="bg-[#F8F8F8] rounded-[16px] p-4 border border-gray-200 mb-6">
            <h3 className="text-[#333] font-bold text-[16px] mb-3 text-left">Product Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Product</span>
                <span className="text-gray-900 font-bold">{data.productName || data.productId?.productName || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Brand</span>
                <span className="text-gray-900 font-bold">{data.brand || data.productId?.brand || 'N/A'}</span>
              </div>
              {(data.batchNo || data.productId?.batchNo) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Batch #</span>
                  <span className="text-gray-900 font-bold">{data.batchNo || data.productId?.batchNo}</span>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-[#333] font-bold text-[18px] mb-2 text-left">
            What does this mean?
          </h3>
          <p className="text-[#666] text-[14px] leading-relaxed text-left mb-6">
            A product might be marked as inactive if it's still in the warehouse, awaiting market release, or has been recalled.
          </p>

          <button
            onClick={() => navigate("/home")}
            className="w-full bg-[#0D4E96] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(13,78,150,0.3)]"
          >
            Scan Another Product
          </button>
        </div>
      </div>
    </div>
  );
}

