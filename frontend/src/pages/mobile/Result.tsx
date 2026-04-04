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

  // Collect variants that haven't been handled yet
  const unhandledVariants: { label: string; value: any }[] = [];
  const allVariants = data.variants || data.productId?.variants || [];
  allVariants.forEach((v: any) => {
    if (!handledKeys.has(v.variantName) && !handledKeys.has(v.variantName?.toLowerCase())) {
      unhandledVariants.push({ 
        label: fieldLabels[v.variantName] || v.variantLabel || formatLabel(v.variantName || ""), 
        value: v.value 
      });
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
                  {/* Unhandled Variants */}
                  {unhandledVariants.map(({ label, value }, idx) => (
                    <div key={`variant-${idx}`} className="border-b border-gray-300/30 pb-3 last:border-0 last:pb-0">
                      <p className="text-[#333] text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1">{label}</p>
                      <p className="text-[#0D4E96] text-[14px] font-bold whitespace-pre-wrap">{value}</p>
                    </div>
                  ))}

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

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom duration-500">
            <Header title="Authentiks" />
            
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col items-center">
              {/* Status Banner (Same as scan result) */}
              <div className="w-full max-w-sm bg-[#2CA4D6] rounded-t-[16px] p-4 text-center text-white shadow-md">
                <div className="flex flex-row justify-center items-center gap-2">
                  <div className="bg-white rounded-full">
                    <img src={authenticIcon} alt="Authentic" className="w-10 h-10 object-contain m-1" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-[17px] font-bold leading-tight">Authentic Product</h2>
                    <p className="text-[11px] opacity-90 font-medium">This product has been verified as genuine</p>
                  </div>
                </div>
              </div>

              {/* Congratulations Box (Screenshot 1) */}
              <div className="w-full max-w-sm bg-[#1F2642] p-8 text-center text-white rounded-b-[16px] shadow-lg mb-8">
                <h3 className="text-[22px] font-bold leading-tight mb-2 uppercase tracking-wide">Congratulations,</h3>
                <h2 className="text-[24px] font-black leading-tight tracking-tight">Your Product is 100% Authentik</h2>
              </div>

              <div className="w-full max-w-sm space-y-8 flex flex-col items-center">
                {/* Star Rating Section */}
                <div className="flex flex-col items-center gap-4">
                  <p className="text-[16px] font-bold text-gray-700">Please rate your experience</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-90 duration-200">
                        <svg
                          width="48" height="48" viewBox="0 0 24 24"
                          fill={star <= rating ? "#1E9BD3" : "none"}
                          stroke={star <= rating ? "#1E9BD3" : "#D1D5DB"}
                          strokeWidth="1.5"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coupon Code Section (Screenshot 1) */}
                {/* <div className="w-full flex flex-col items-center gap-2 mt-4 px-2">
                  <p className="text-[16px] font-bold text-gray-700 mb-1">Coupon Code</p>
                  <div className="w-full border-2 border-dashed border-gray-400 rounded-2xl py-5 px-6 flex items-center justify-center gap-4 bg-white shadow-sm">
                    <div className="p-2 bg-gray-50 rounded-xl">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-900">
                        <path d="M15 5H4v14h16v-7" />
                        <path d="M22 2l-6 6" />
                        <path d="M21 8V2h-6" />
                        <rect x="7" y="10" width="10" height="5" rx="1" />
                      </svg>
                    </div>
                    <span className="text-[28px] font-black text-gray-900 tracking-[0.2em]">IE5050</span>
                  </div>
                </div> */}

                {/* Opt-in & Submit */}
                <div className="w-full space-y-6 pt-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-1">
                      <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="sr-only" />
                      <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${optIn ? 'bg-[#0E5CAB] border-[#0E5CAB]' : 'bg-white border-gray-300'}`}>
                        {optIn && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>}
                      </div>
                    </div>
                    <span className="text-[13px] font-semibold text-gray-600 leading-snug">Yes, I would like to receive exclusive offer and discounts from the brand</span>
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
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    disabled={submitting}
                    className="w-full bg-[#0E5CAB] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute left-4 top-4 text-[#0D4E96] p-1 z-[110]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          </div>
        )}

        {/* Coupon Reveal Animation Overlay */}
        {showCouponReveal && awardedCoupon && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70" style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Confetti particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-5%`,
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#DDA0DD', '#F0E68C'][i % 7],
                    animation: `confettiFall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
                  }}
                />
              ))}
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-[32px] mx-6 w-full max-w-sm overflow-hidden shadow-[0_24px_60px_rgba(13,78,150,0.4)] border border-white" style={{ animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              {/* Header */}
              <div className="bg-gradient-to-br from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
                  <span className="text-4xl drop-shadow-md">🎉</span>
                </div>
                <h2 className="text-white text-[24px] font-black tracking-tight drop-shadow-sm">You Earned a Reward!</h2>
                <p className="text-[#E8F4F9]/80 text-[14px] mt-2 font-bold tracking-wide uppercase">Thank you for your review</p>
              </div>

              {/* Coupon Card */}
              <div className="p-8">
                <div className="border-[2px] border-dashed border-[#2CA4D6]/40 rounded-[28px] p-6 bg-gradient-to-b from-[#F0F7FF] to-[#E8F4F9] text-center mb-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -ml-10 -mt-10" />
                  <p className="text-[11px] text-[#1a5fa8] font-black uppercase tracking-[0.25em] mb-4 relative z-10">Your Coupon Code</p>
                  <div className="flex items-center justify-center gap-4 relative z-10">
                    <span className="text-[32px] font-black text-[#0D4E96] tracking-[0.15em] drop-shadow-sm">
                      {awardedCoupon.code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(awardedCoupon.code);
                        setCouponCopied(true);
                        setTimeout(() => setCouponCopied(false), 2000);
                      }}
                      className="w-12 h-12 bg-gradient-to-br from-[#0D4E96] to-[#2CA4D6] rounded-[16px] active:scale-90 transition-transform flex items-center justify-center shadow-[0_6px_16px_rgba(13,78,150,0.3)] hover:shadow-[0_8px_20px_rgba(13,78,150,0.4)]"
                    >
                      {couponCopied ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {awardedCoupon.description && (
                  <p className="text-[#1e3a5f]/80 text-[15px] text-center mb-4 font-medium leading-relaxed px-2">{awardedCoupon.description}</p>
                )}

                {awardedCoupon.expiryDate && (
                  <p className="text-[#1a5fa8]/50 text-[12px] font-bold text-center mb-6">
                    Valid until {new Date(awardedCoupon.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}

                <button
                  onClick={() => navigate('/rewards')}
                  className="w-full bg-gradient-to-r from-[#0D4E96] via-[#1a5fa8] to-[#2CA4D6] text-white font-black text-[16px] py-4 rounded-[30px] shadow-[0_8px_24px_rgba(13,78,150,0.4)] hover:shadow-[0_12px_32px_rgba(13,78,150,0.5)] active:scale-[0.96] transition-all mb-3 leading-none"
                >
                  View in Rewards
                </button>
                <button
                  onClick={() => setShowCouponReveal(false)}
                  className="w-full text-[#1e3a5f]/50 font-bold text-[14px] py-3 active:bg-[#F0F7FF] rounded-xl transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>

            {/* CSS for animations */}
            <style>{`
              @keyframes confettiFall {
                0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
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

