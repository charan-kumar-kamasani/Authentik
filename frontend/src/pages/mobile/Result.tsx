import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

// Assets
import authenticIcon from "../../assets/logo.svg";
import warningIcon from "../../assets/v2/home/header/warning.svg"; // Triangle
import fakeIcon from "../../assets/v2/home/header/dangerous.svg"; // Red X

import MobileHeader from "../../components/MobileHeader";
import { maskPhoneNumber } from "../../utils/helper";
import { useConfirm } from "../../components/ConfirmModal";

export default function Result() {
  const { status } = useParams();
  const navigate = useNavigate();
  const confirmModal = useConfirm() as any;
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
  const confirmModal = useConfirm() as any;
  const [showAll, setShowAll] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [optIn, setOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isReviewed, setIsReviewed] = useState(data.alreadyReviewed || false);
  const [awardedCoupon, setAwardedCoupon] = useState<any>(null);
  const [showCouponReveal, setShowCouponReveal] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  // Warranty claim state
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyClaiming, setWarrantyClaiming] = useState(false);
  const [warrantyClaimStatus, setWarrantyClaimStatus] = useState<string | null>(data.warrantyClaimStatus || null);
  const [warrantyClaimed, setWarrantyClaimed] = useState(!!data.warrantyClaimStatus);
  const [warrantyForm, setWarrantyForm] = useState({
    purchaseDate: '',
    purchaseSource: '',
    sellerName: '',
  });
  const [invoiceImages, setInvoiceImages] = useState<{ file: File; preview: string }[]>([]);
  const warrantyFileRef = useRef<HTMLInputElement>(null);

  const handleSkipProfile = () => {
    setShowProfilePrompt(false);
    setShowReviewModal(true); // Continue to review if they skip
  };

  // Determine colors
  const productName = data.productName || data.productId?.productName || "Product Info";

  // Check for image in data, then data.productId, then data.images array
  const productImage = data.productImage || data.productId?.productImage || (data.images && data.images.length > 0 ? data.images[0] : null);
  console.log("______product image", productImage, data)
  console.log("[WARRANTY DEBUG FRONTEND] data.warranty:", JSON.stringify(data.warranty));
  console.log("[WARRANTY DEBUG FRONTEND] condition check:", !!(data.warranty && (data.warranty.duration || data.warranty.warrantyType)));

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

  const formatMonthYear = (v: any) => {
    if (!v) return "";

    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

    if (typeof v === 'object') {
      if (v.month && v.year) {
        const mInt = parseInt(v.month);
        if (!isNaN(mInt) && mInt >= 1 && mInt <= 12) {
          const monthStr = new Date(2000, mInt - 1, 1).toLocaleDateString('en-GB', { month: 'short' });
          return `${capitalize(monthStr)} ${v.year}`;
        }
        return `${capitalize(String(v.month))} ${v.year}`;
      }
      return "";
    } else if (typeof v === 'string') {
      const parts = v.split(/[\/\-]/);
      if (parts.length === 2 || parts.length === 3) {
        const m = parseInt(parts.length === 3 ? parts[1] : parts[0]);
        let y = parseInt(parts.length === 3 ? parts[2] : parts[1]);
        if (y < 100) y += 2000;
        if (!isNaN(m) && !isNaN(y) && m >= 1 && m <= 12 && y >= 1000) {
          const monthStr = new Date(2000, m - 1, 1).toLocaleDateString('en-GB', { month: 'short' });
          return `${capitalize(monthStr)} ${y}`;
        }
      }

      const d = new Date(v);
      if (!isNaN(d.getTime()) && v.length >= 8 && !/^\d+$/.test(v)) {
        const formatted = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        return formatted.split(' ').map(capitalize).join(' ');
      }

      return v.split(' ').map(capitalize).join(' ');
    }
    return String(v);
  };

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

    if (key === "mfdOn") {
      const mfd = val || data.mfdOn || data.productId?.mfdOn;
      if (mfd) val = formatMonthYear(mfd);
    }

    if (key === "expiryDate") {
      const exp = val || data.expiryDate || data.expiry || data.calculatedExpiryDate || data.productId?.expiryDate || data.productId?.expiry || data.productId?.calculatedExpiryDate;
      if (exp) val = formatMonthYear(exp);
    }

    if (key === "mrp") {
      if (val) {
        const num = String(val).replace(/[^0-9.]/g, '');
        if (num && !isNaN(Number(num))) {
          val = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(Number(num));
        } else {
          val = val.toString().startsWith('₹') ? val : `₹${val}`;
        }
      }
    }

    if (val && val !== "-") {
      const finalLabel = key === "mrp" ? "MRP" : (fieldLabels[key] || label);
      blueFields.push({ label: finalLabel, value: String(val) });
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
          val = formatMonthYear(val);
        } else if (typeof val === 'string' && /^\d{1,2}[\/\-]\d{4}$/.test(val)) {
          val = formatMonthYear(val);
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

          {/* Cashback Banner */}
          {data.cashbackAwarded > 0 && (
            <div className="mx-4 mt-2 mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-[16px] p-4 text-white shadow-lg relative overflow-hidden flex items-center justify-between transform transition-all hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-pink-200 mb-0.5">Lucky QR Scan 🎉</p>
                <h3 className="text-[26px] font-black leading-tight drop-shadow-sm">₹{data.cashbackAwarded}</h3>
                <p className="text-[13px] font-medium opacity-90">Added to your Wallet</p>
              </div>
              <button 
                onClick={() => navigate('/wallet')}
                className="relative z-10 bg-white text-pink-600 font-extrabold px-4 py-2.5 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.1)] text-sm active:scale-95 transition-transform"
              >
                View Wallet
              </button>
            </div>
          )}

          {/* Loyalty Points Banner */}
          {data.loyaltyPointsAwarded > 0 && (
            <div className="mx-4 mt-2 mb-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[16px] p-4 text-white shadow-lg relative overflow-hidden flex items-center justify-between transform transition-all hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200 mb-0.5">Loyalty Points ⭐</p>
                <h3 className="text-[26px] font-black leading-tight drop-shadow-sm">+{data.loyaltyPointsAwarded} pts</h3>
                <p className="text-[13px] font-medium opacity-90">Added to your Points</p>
              </div>
              <button 
                onClick={() => navigate('/wallet')}
                className="relative z-10 bg-white text-amber-600 font-extrabold px-4 py-2.5 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.1)] text-sm active:scale-95 transition-transform"
              >
                View Points
              </button>
            </div>
          )}

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
          onClick={async () => {
            const token = localStorage.getItem("token");
            if (!token) {
              setShowReviewModal(true);
              return;
            }
            try {
              const { getProfile } = await import("../../config/api");
              const profileData = await getProfile(token);
              if (profileData && !profileData.name) {
                setShowProfilePrompt(true);
              } else {
                setShowReviewModal(true);
              }
            } catch (e) {
              setShowReviewModal(true);
            }
          }}
          disabled={isReviewed}
          className={`w-full ${isReviewed ? 'bg-gray-400' : 'bg-gradient-to-r from-[#0E5CAB] to-[#1F2642]'} text-white font-bold text-[18px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(14,92,171,0.3)] mt-4`}
        >
          {isReviewed ? "Product Reviewed" : (data.productId.orderId.coupon.code != null || data.productId.orderId.coupon.code != undefined || data.productId.orderId.coupon.code != "" ? "Review & Claim Coupon" : "Review Product")}
        </button>



        {/* Claim Warranty Button or Tracker */}
        {data.warranty && (data.warranty.duration || data.warranty.warrantyType) && (
          <div className="mt-3">
            {warrantyClaimStatus ? (
              <div >
                <button
                  onClick={() => navigate("/warranty")}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-[16px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Track Warranty
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowWarrantyModal(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-[16px] py-4 rounded-[30px] shadow-[0_10px_25px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Register Warranty
              </button>
            )}
          </div>
        )}

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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>

              {/* Product Hero */}
              <div className="px-6 pt-8 pb-5 text-center">
                {productImage ? (
                  <div className="w-[80px] h-[80px] rounded-[24px] overflow-hidden mx-auto mb-5 shadow-[0_8px_24px_rgba(13,78,150,0.15)] bg-white p-1">
                    <img src={productImage} alt="" className="w-full h-full object-cover rounded-[20px]" />
                  </div>
                ) : (
                  <div className="w-[80px] h-[80px] rounded-[24px] bg-gradient-to-br from-[#F0F7FF] to-[#E8F4F9] mx-auto mb-5 flex items-center justify-center shadow-[0_8px_24px_rgba(13,78,150,0.15)] bg-white p-1">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2CA4D6" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                )}
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
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="h-6">
                  {rating > 0 && (
                    <p className="text-center text-[15px] font-black text-[#F59E0B]" style={{ animation: 'reviewFadeIn 0.3s ease' }}>
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
                      {optIn && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>}
                    </div>
                  </div>
                  <span className="text-[12px] font-bold text-[#333] leading-tight mt-0.5">Yes, I would like to receive exclusive offer and discounts from the brand</span>
                </label>

                <button
                  onClick={async () => {
                    if (rating === 0) {
                      await confirmModal({ title: 'Required', description: "Please select a rating", cancelText: null });
                      return;
                    }
                    setSubmitting(true);
                    try {
                      const { submitReview } = await import("../../config/api");
                      const token = localStorage.getItem('token');
                      const result = await submitReview({
                        productId: data.productId?._id || data.productId,
                        rating,
                        optIn
                      }, token);
                      setIsReviewed(true);
                      setShowReviewModal(false);

                      // Check if a coupon was awarded
                      let couponToAward = result.coupon;
                      if (!couponToAward && data.isDemo) {
                        couponToAward = {
                          title: "DEMO REWARD",
                          code: "WELCOME50",
                          description: "Get 50% off on your next order!",
                          websiteLink: "https://authentiks.in"
                        };
                      }

                      if (couponToAward) {
                        setAwardedCoupon(couponToAward);
                        setTimeout(() => setShowCouponReveal(true), 300);
                      } else {
                        await confirmModal({ title: 'Success', description: "Thank you for your review!", cancelText: null });
                      }
                    } catch (error: any) {
                      await confirmModal({ title: 'Error', description: error.message || "Failed to submit review", cancelText: null });
                      if (error.message && error.message.includes("already reviewed")) {
                        setIsReviewed(true);
                        setShowReviewModal(false);
                      }
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting || rating === 0}
                  className={`w-full font-bold text-[16px] py-4 rounded-2xl shadow-lg transition-all duration-300 active:scale-[0.97] ${rating === 0
                    ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white shadow-blue-500/25 hover:shadow-blue-500/40'
                    } disabled:opacity-60`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg>
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

        {/* Coupon Reveal Dialog - Full Screen */}
        {showCouponReveal && awardedCoupon && (
          <div className="fixed inset-0 z-[200] bg-gradient-to-b from-[#F0F7FF] via-[#FFFFFF] to-[#F8FAFC] flex flex-col font-sans overflow-y-auto" style={{ animation: 'couponFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <MobileHeader
              title="Authentiks"
              onLeftClick={() => setShowCouponReveal(false)}
              onNotificationClick={handleNotificationClick}
              rightIcon={<div className="w-10" />}
            />

            <div className="flex-1 px-5 py-8 flex flex-col items-center relative overflow-hidden">
              {/* Confetti & Celebratory background SVGs */}
              <div className="absolute top-10 left-6 w-8 h-8 opacity-25 text-pink-500 animate-bounce">🎈</div>
              <div className="absolute top-20 right-8 w-6 h-6 opacity-25 text-amber-500 animate-pulse">✨</div>
              <div className="absolute bottom-40 left-10 w-6 h-6 opacity-25 text-blue-500 animate-pulse">✨</div>
              <div className="absolute bottom-20 right-10 w-8 h-8 opacity-25 text-indigo-500 animate-bounce">🎈</div>

              <div className="text-center mb-8 relative z-10">
                <span className="text-[12px] font-black uppercase tracking-widest text-[#2CA4D6] bg-cyan-50 px-3.5 py-1.5 rounded-full border border-cyan-100/50 mb-3 inline-block">
                  Reward Unlocked 🎉
                </span>
                <h2 className="bg-gradient-to-r from-[#0D4E96] to-[#1E3A8A] bg-clip-text text-transparent text-[24px] font-black text-center leading-tight">
                  Congratulations!<br />You've Earned a Coupon
                </h2>
              </div>

              {/* Ticket Card */}
              <div className="w-full max-w-sm relative mt-8 shadow-[0_20px_50px_rgba(13,78,150,0.1)] rounded-[24px] bg-white border border-slate-100">

                {/* Gift Icon overlapping top */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-tr from-[#0D4E96] to-[#2CA4D6] rounded-full border-[6px] border-white flex items-center justify-center z-20 shadow-xl shadow-blue-500/20">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12"></polyline>
                    <rect x="2" y="7" width="20" height="5"></rect>
                    <line x1="12" y1="22" x2="12" y2="7"></line>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                  </svg>
                </div>

                {/* Top Section: Gradient Header */}
                <div className="bg-[#1F2642] bg-gradient-to-br from-[#0D4E96] via-[#1E3A8A] to-[#1F2642] rounded-t-[24px] pt-16 pb-8 px-6 text-center relative overflow-hidden">
                  {/* Decorative glowing blobs */}
                  <div className="absolute -right-10 -top-10 w-28 h-28 bg-white/5 rounded-full blur-xl" />
                  
                  {/* Brand Tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-white/95 text-[10px] font-black tracking-wider uppercase">
                      {companyName}
                    </span>
                  </div>

                  <h3 className="text-white text-[22px] font-black uppercase tracking-wide leading-tight drop-shadow-sm px-2">
                    {awardedCoupon.title || "REWARD UNLOCKED"}
                  </h3>
                </div>

                {/* Ticket Notch Divider Area */}
                <div className="relative py-5 bg-slate-50 border-y border-dashed border-slate-200 flex items-center justify-center">
                  {/* Left Notch */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full border border-slate-200/50 shadow-[inset_-3px_0_6px_rgba(0,0,0,0.02)] z-10" />
                  {/* Right Notch */}
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full border border-slate-200/50 shadow-[inset_3px_0_6px_rgba(0,0,0,0.02)] z-10" />
                  
                  {/* Coupon Code Dashed Box */}
                  <div className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-2xl border-2 border-dashed font-mono text-[18px] font-black uppercase tracking-widest border-cyan-500/30 bg-cyan-500/5 text-[#0D4E96]">
                    <span>{awardedCoupon.code}</span>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(awardedCoupon.code);
                        setCouponCopied(true);
                        setTimeout(() => setCouponCopied(false), 2000);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        couponCopied
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105'
                          : 'bg-white text-slate-500 hover:text-slate-700 shadow-sm border border-slate-200 hover:border-slate-300 active:scale-90'
                      }`}
                    >
                      {couponCopied ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom Details Section */}
                <div className="bg-white rounded-b-[24px] p-6 text-center">
                  {awardedCoupon.expiryDate && (
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-4">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <p className="text-[13px] font-black uppercase tracking-wider text-slate-400">
                        Valid Until: <span className="text-slate-700 font-bold normal-case">{new Date(awardedCoupon.expiryDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                      </p>
                    </div>
                  )}

                  {awardedCoupon.description && (
                    <div className="text-left mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5">Reward Description</p>
                      <p className="text-slate-600 text-[13px] font-medium leading-relaxed break-all whitespace-pre-wrap">
                        {awardedCoupon.description}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (awardedCoupon.websiteLink) {
                        window.open(awardedCoupon.websiteLink, '_blank');
                      } else {
                        navigate('/rewards');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white font-extrabold text-[15px] py-4 rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 active:scale-95 transition-all uppercase tracking-wider"
                  >
                    Redeem Now
                  </button>
                </div>
              </div>
            </div>

            {/* CSS for animations */}
            <style>{`
              @keyframes couponFadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}

        {/* ===== Profile Completion Modal ===== */}
        {showProfilePrompt && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleSkipProfile}
            />

            {/* Bottom Sheet */}
            <div
              className="relative w-full bg-white rounded-t-[32px] px-6 pt-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] animate-slide-up"
              style={{ animation: "slideUp 0.4s ease-out forwards" }}
            >
              {/* Drag Handle */}
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

              {/* Illustration */}
              <div className="flex justify-center mb-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2CA4D6] to-[#0D4E96] flex items-center justify-center shadow-lg">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <h3 className="text-center text-[#0D4E96] font-extrabold text-[22px] mb-2">
                Complete Your Profile
              </h3>

              {/* Description */}
              <p className="text-center text-[#777] text-[14px] font-medium mb-8 leading-relaxed">
                Add your name and details to personalize
                <br />
                your Authentiks experience
              </p>

              {/* Update Profile Button */}
              <button
                onClick={() => {
                  setShowProfilePrompt(false);
                  navigate("/edit-profile");
                }}
                className="w-full bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white font-bold py-4 rounded-[30px] text-[18px] shadow-[0_8px_24px_rgba(13,78,150,0.35)] active:scale-[0.97] transition-all mb-4"
              >
                Update Profile
              </button>

              {/* Skip Button */}
              {/* <button
                onClick={handleSkipProfile}
                className="w-full text-[#999] font-bold text-[15px] py-3 active:text-[#666] transition-colors"
              >
                Skip for now
              </button> */}
            </div>
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* ===== Warranty Claim Modal ===== */}
        {showWarrantyModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ animation: 'reviewOverlayIn 0.25s ease' }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowWarrantyModal(false)} />
            <div
              className="relative w-full sm:max-w-[440px] sm:mx-4 bg-white rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-[0_-8px_40px_rgba(0,0,0,0.2)] sm:shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
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
              {data.warranty && (data.warranty.duration || data.warranty.warrantyType) && (
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
                        <p className="text-[13px] text-gray-700 leading-relaxed">{data.warranty.description}</p>
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
                            if (!f.type.startsWith('image/')) {
                              confirmModal({ title: 'Error', description: 'Only image files are allowed', cancelText: null });
                              return;
                            }
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
                            if (!f.type.startsWith('image/')) {
                              confirmModal({ title: 'Error', description: 'Only image files are allowed', cancelText: null });
                              return;
                            }
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
                  onClick={async () => {
                    // Validate
                    if (!warrantyForm.purchaseDate) {
                      await confirmModal({ title: 'Notice', description: 'Please select a purchase date', cancelText: null });
                      return;
                    }
                    if (invoiceImages.length === 0) {
                      alert('Please upload at least one invoice image');
                      return;
                    }

                    setWarrantyClaiming(true);
                    try {
                      // Upload images to Cloudinary
                      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dx4i1w3uf';
                      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

                      const uploadedUrls: string[] = [];
                      for (const img of invoiceImages) {
                        const formData = new FormData();
                        formData.append('file', img.file);
                        formData.append('upload_preset', uploadPreset);

                        const uploadRes = await fetch(
                          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                          { method: 'POST', body: formData }
                        );
                        const uploadData = await uploadRes.json();
                        if (uploadData.secure_url) {
                          uploadedUrls.push(uploadData.secure_url);
                        } else {
                          throw new Error('Image upload failed');
                        }
                      }

                      // Submit warranty claim
                      const { submitWarrantyClaim } = await import('../../config/api');
                      const token = localStorage.getItem('token');
                      const result = await submitWarrantyClaim({
                        productId: data.productId?._id || data.productId,
                        qrCode: data.qrCode,
                        productName: data.productName || data.productId?.productName,
                        brandId: data.brandId || data.productId?.brandId,
                        invoiceImages: uploadedUrls,
                        purchaseDate: warrantyForm.purchaseDate,
                        warrantyInfo: data.warranty || null,
                      }, token);

                      if (result && result.claim) {
                        setWarrantyClaimStatus(result.claim.status || 'Sent');
                      }
                      setWarrantyClaimed(true);
                      setShowWarrantyModal(false);
                      await confirmModal({ title: 'Success', description: 'Warranty registered successfully!', cancelText: null });
                    } catch (error: any) {
                      await confirmModal({ title: 'Error', description: error.message || 'Failed to register warranty', cancelText: null });
                    } finally {
                      setWarrantyClaiming(false);
                    }
                  }}
                  disabled={warrantyClaiming || invoiceImages.length === 0}
                  className={`w-full font-bold text-[16px] py-4 rounded-2xl shadow-lg transition-all duration-300 active:scale-[0.97] ${invoiceImages.length === 0
                    ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40'
                    } disabled:opacity-60`}
                >
                  {warrantyClaiming ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg>
                      Submitting...
                    </span>
                  ) : 'Register Warranty'}
                </button>
              </div>
            </div>
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
              WARNING! 
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

