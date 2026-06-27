import { ChevronLeft, Share, FileText, BookOpen, MessageSquare, ShieldCheck, Gift, ChevronRight, XCircle, AlertTriangle, Headset, Flag, X, ShieldAlert, Calendar, Phone, MapPin, RefreshCcw } from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API_BASE_URL from "../../config/api";

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

  // Recommendations from DB (if available) or fetched dynamically
  const [recommendations, setRecommendations] = useState(data?.recommendations || []);

  useEffect(() => {
    // If not provided in route state (e.g., coming from Scan History), fetch them.
    if ((!data?.recommendations || data.recommendations.length === 0) && (data?.brandId || data?.product?.brandId || data?.productId?.brandId || data?.brandId?._id)) {
      const bId = data?.brandId?._id || data?.brandId || data?.product?.brandId || data?.productId?.brandId;
      fetch(`${API_BASE_URL}/scan/recommendations/${bId}`)
        .then(res => res.json())
        .then(resData => {
          if (Array.isArray(resData)) {
            setRecommendations(resData.slice(0, 4));
          }
        })
        .catch(err => console.error("Failed to fetch recommendations:", err));
    }
  }, [data]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Authentik Product Verified",
          text: `Check out this 100% authentic ${data?.productName || "product"} by ${data?.brand || "Brand"}!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col relative pb-32">
      
      {/* Top Blue Header Section */}
      <div className="bg-[#01227E] pt-8 px-5 relative rounded-b-[40px] overflow-hidden">
        {/* Subtle glowing effect behind shield */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#105DE4] rounded-full opacity-30 blur-[40px] pointer-events-none" />
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-6 relative z-50">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-white">
            <ChevronLeft className="w-7 h-7" strokeWidth={2} />
          </button>
          <button onClick={handleShare} className="p-1 -mr-1 text-white">
            <Share className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        {/* Main Authentic Header Section */}
        <div className="flex flex-col items-center relative z-10 top-[-60px]">
          <div className="w-20 h-20 mb-4">
             <img src={authenticIcon} alt="Authentic" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <h2 className="text-white text-[24px] font-bold tracking-tight mb-1.5">Authentic Product</h2>
          <p className="text-[#B3C8F9] text-[13px] font-medium text-center max-w-[240px] leading-relaxed">
            This product is 100% authentic and verified by Authentiks
          </p>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 px-4 -mt-10 relative z-20 flex flex-col gap-4 pb-10">
        
        {/* Product Info Card */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.06)] flex gap-4">
          <div className="w-[100px] h-[120px] flex-shrink-0 flex items-center justify-center">
             {productImage ? (
                <img src={productImage} alt={productName} className="w-full h-full object-contain drop-shadow-md" />
              ) : (
                <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 text-xs">No Image</div>
              )}
          </div>
          <div className="flex flex-col flex-1 py-1 justify-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E05206" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <span className="text-[#0B1E36] font-bold text-[13px]">{companyName}</span>
              <ShieldCheck className="w-[14px] h-[14px] text-[#105DE4] fill-[#105DE4] stroke-white" strokeWidth={1} />
            </div>
            <h3 className="text-[#0B1E36] font-extrabold text-[17px] leading-tight mb-1">{productName}</h3>
            {(data.category || data.productId?.category) && (
              <p className="text-[#5A7184] text-[13px] font-medium mb-2">{data.category || data.productId?.category}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-1">
              {(data.variants || data.productId?.variants || []).map((v: any, index: number) => (
                <span 
                  key={index}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${index % 2 === 0 ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-[#ECFDF5] text-[#059669]'}`}
                >
                  {v.variantLabel || v.value || v.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Menu Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x pt-1">
           <button onClick={() => navigate("/product-details", { state: data })} className="snap-start flex-shrink-0 w-[120px] h-[110px] bg-white rounded-[16px] p-4 flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95 transition-transform relative">
             <FileText className="w-6 h-6 text-[#105DE4] mb-auto" strokeWidth={1.5} />
             <div className="flex items-end justify-between w-full mt-auto">
               <span className="text-[12px] font-bold text-[#0B1E36] text-left leading-[1.2] w-[70%]">Product Details</span>
               <ChevronRight className="w-4 h-4 text-gray-400 -mr-1" />
             </div>
           </button>

           <button className="snap-start flex-shrink-0 w-[120px] h-[110px] bg-white rounded-[16px] p-4 flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95 transition-transform relative">
             <BookOpen className="w-6 h-6 text-[#105DE4] mb-auto" strokeWidth={1.5} />
             <div className="flex items-end justify-between w-full mt-auto">
               <span className="text-[12px] font-bold text-[#0B1E36] text-left leading-[1.2] w-[70%]">Product Education</span>
               <ChevronRight className="w-4 h-4 text-gray-400 -mr-1" />
             </div>
           </button>

           <button className="snap-start flex-shrink-0 w-[120px] h-[110px] bg-white rounded-[16px] p-4 flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95 transition-transform relative">
             <MessageSquare className="w-6 h-6 text-[#105DE4] mb-auto" strokeWidth={1.5} />
             <div className="flex items-end justify-between w-full mt-auto">
               <span className="text-[12px] font-bold text-[#0B1E36] text-left leading-[1.2] w-[70%]">Consumer Feedback</span>
               <ChevronRight className="w-4 h-4 text-gray-400 -mr-1" />
             </div>
           </button>
        </div>

        {/* Why Authenticity Matters Banner */}
        <div className="bg-white rounded-[16px] p-4 flex items-center gap-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100">
           <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
             <ShieldCheck className="w-8 h-8 text-[#105DE4]" strokeWidth={1.5} />
           </div>
           <div className="flex flex-col flex-1">
             <h4 className="text-[14px] font-bold text-[#0B1E36] mb-0.5">Why Authenticity Matters</h4>
             <p className="text-[11px] text-[#5A7184] font-medium leading-tight">Every scan helps us fight counterfeit products and ensure you get the best quality and safety.</p>
           </div>
           <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-extrabold text-[#0B1E36]">Recommendation for You</h3>
              <button onClick={() => navigate(`/recommendations/${data?.brandId?._id || data?.brandId || data?.product?.brandId || data?.productId?.brandId}`)} className="text-[12px] font-bold text-[#105DE4] flex items-center gap-0.5">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
               {recommendations.map((item: any, index: number) => (
                 <div key={item.id || item._id || index} className="snap-start flex-shrink-0 w-[170px] bg-white rounded-[20px] p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 relative">
                   <div className="w-full h-[150px] bg-[#F8F9FA] rounded-[14px] p-2 flex items-center justify-center mb-4 relative">
                     <img src={item.image || item.productImage || 'https://via.placeholder.com/150'} alt={item.title || item.productName} className="w-full h-full object-contain mix-blend-multiply" />
                     {/* Rating/Feature Badge overlapping bottom right */}
                     {item.ratingBadge && (
                       <div className="absolute -bottom-3 -right-3 bg-[#F3F6E8] text-[#4F5927] border-2 border-white text-[9.5px] font-extrabold px-1.5 py-1 rounded-full text-center leading-[1.1] shadow-sm flex items-center justify-center w-[46px] h-[46px] whitespace-pre-wrap break-words">
                         {item.ratingBadge}
                       </div>
                     )}
                   </div>
                   <h4 className="text-[13px] font-bold text-[#0B1E36] leading-snug mb-3 line-clamp-2 min-h-[36px]">{item.title || item.productName}</h4>
                   <div className="flex items-baseline gap-2 mb-2 mt-auto">
                     <span className="text-[17px] font-extrabold text-[#0B1E36]">{item.price || (item.mrp ? `₹${item.mrp}` : '')}</span>
                     {item.oldPrice && (
                       <span className="text-[13px] font-semibold text-[#829AB1] line-through">{item.oldPrice}</span>
                     )}
                   </div>
                   {item.discount && (
                     <div className="bg-[#E8F8F0] text-[#059669] text-[10px] font-extrabold px-2.5 py-1 rounded-[6px] w-max tracking-wide">
                       {item.discount}
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Review & Claim Reward Button (Floating above tab bar) */}
      <div className="fixed bottom-[70px] left-0 right-0 px-4 py-3 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent z-40">
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
          className={`w-full ${isReviewed ? 'bg-gray-400' : 'bg-[#01227E]'} text-white rounded-[24px] p-3.5 flex items-center shadow-[0_8px_25px_rgba(1,34,126,0.25)] active:scale-[0.98] transition-transform`}
        >
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-3">
             <Gift className="w-[20px] h-[20px] text-[#01227E]" strokeWidth={2} />
          </div>
          <div className="flex flex-col flex-1 text-left">
             <span className="text-[15px] font-extrabold mb-0.5">{isReviewed ? "Product Reviewed" : "Review & Claim Reward"}</span>
             <span className="text-[11px] font-medium text-[#B3C8F9]">Share your experience and earn exciting rewards!</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80" />
        </button>
      </div>

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
  );
}


function ResultRepeat({ data }: { data: any }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col relative pb-32">
      
      {/* Top Orange Header Section */}
      <div className="bg-[#FF6B00] pt-8 px-5 relative rounded-b-[40px] overflow-hidden">
        {/* Subtle background circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-4 relative z-50">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-white">
            <ChevronLeft className="w-7 h-7" strokeWidth={2} />
          </button>
          <h1 className="text-white text-[17px] font-bold">Scan Result</h1>
          <div className="w-7 h-7" /> {/* Spacer */}
        </div>

        {/* Main Alert Header Section */}
        <div className="flex flex-col items-center relative z-10 pb-8 mt-2">
          <div className="mb-3 text-white">
            <ShieldAlert className="w-[60px] h-[60px]" strokeWidth={1.5} />
          </div>
          <h2 className="text-white text-[24px] font-bold tracking-tight mb-2 text-center leading-tight">
            DUPLICATE SCAN<br/>DETECTED
          </h2>
          <p className="text-white/90 text-[14px] font-medium text-center max-w-[280px] leading-relaxed">
            This product has already been registered and authenticated on another account.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 mt-6 relative z-20 flex flex-col gap-4 pb-10">
        
        {/* Scan Details Card */}
        <div className="bg-white rounded-[12px] shadow-sm flex flex-col overflow-hidden">
          <div className="text-center py-3">
            <h3 className="text-[#FF6B00] font-bold text-[16px]">Scan Details</h3>
          </div>
          <div className="px-5 pb-5 flex flex-col gap-4">
            
            <div className="flex items-center border-b border-gray-100 pb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center border border-[#FF6B00]/20 mr-4">
                <Calendar className="w-4 h-4 text-[#FF6B00]" strokeWidth={2} />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span className="text-[13px] font-semibold text-[#1A1A1A]">First Authenticated:</span>
                <span className="text-[13px] font-bold text-[#1A1A1A]">
                  {data.originalScan?.scannedAt
                    ? new Date(data.originalScan.scannedAt).toLocaleString("en-GB", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true
                      })
                    : "12 May 2026, 10:30 AM"}
                </span>
              </div>
            </div>

            <div className="flex items-center border-b border-gray-100 pb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center border border-[#FF6B00]/20 mr-4">
                <Phone className="w-4 h-4 text-[#FF6B00]" strokeWidth={2} />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span className="text-[13px] font-semibold text-[#1A1A1A]">First Authenticated By:</span>
                <span className="text-[13px] font-bold text-[#1A1A1A]">
                  {maskPhoneNumber(data.originalScan?.scannedBy) || "988XXXX144"}
                </span>
              </div>
            </div>

            <div className="flex items-center border-b border-gray-100 pb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center border border-[#FF6B00]/20 mr-4">
                <MapPin className="w-4 h-4 text-[#FF6B00]" strokeWidth={2} />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span className="text-[13px] font-semibold text-[#1A1A1A]">First Scan Location:</span>
                <span className="text-[13px] font-bold text-[#1A1A1A]">
                  {data.originalScan?.location || "Chennai, India"}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full flex items-center justify-center border border-[#FF6B00]/20 mr-4">
                <RefreshCcw className="w-4 h-4 text-[#FF6B00]" strokeWidth={2} />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span className="text-[13px] font-semibold text-[#1A1A1A]">Total Scans Detected:</span>
                <span className="text-[13px] font-bold text-[#1A1A1A]">{data.totalScans || 3}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Warning Indicator Card */}
        <div className="bg-white rounded-[12px] p-4 flex gap-4 border border-[#FF6B00] shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex-shrink-0 flex items-center justify-center mt-0.5">
            <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h4 className="text-[#FF6B00] font-bold text-[14px] mb-1.5">This may indicate:</h4>
            <ul className="list-disc pl-4 text-[#333333] text-[13px] space-y-1 font-medium">
              <li>Product sharing or resale</li>
              <li>Unauthorized distribution</li>
              <li>Potential counterfeit activity</li>
            </ul>
          </div>
        </div>

        {/* Contact Note */}
        <div className="bg-white rounded-[12px] p-4 flex gap-4 shadow-sm items-center">
          <Headset className="w-7 h-7 text-[#FF6B00] flex-shrink-0 ml-1" strokeWidth={1.5} />
          <p className="text-[#1A1A1A] text-[13px] font-medium leading-relaxed">
            If you recently purchased this product, please contact the seller or report this scan for investigation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-1">
          <button 
            onClick={() => navigate("/report", {
              state: {
                qrCode: data.qrCode,
                reportType: "FAKE",
                productName: data.productName || data.productId?.productName,
                brand: data.brand || data.productId?.brand,
                productId: data.productId?._id || data.productId || null,
                brandId: data.brandId || data.productId?.brandId || null,
                scanStatus: "ALREADY_USED"
              }
            })}
            className="w-full bg-[#FF6B00] text-white font-bold text-[15px] py-4 rounded-[8px] flex items-center justify-center gap-2 shadow-sm"
          >
            <Flag className="w-5 h-5" strokeWidth={2.5} />
            REPORT PRODUCT
          </button>
          <button className="w-full bg-white text-[#0D4E96] border border-[#0D4E96] font-bold text-[15px] py-4 rounded-[8px] flex items-center justify-center gap-2 shadow-sm">
            <Headset className="w-5 h-5" strokeWidth={2} />
            CONTACT SUPPORT
          </button>
        </div>

        {/* Footer Note */}
        <div className="bg-white rounded-[12px] p-4 flex gap-4 shadow-sm items-start mt-2 border border-gray-100">
          <ShieldCheck className="w-8 h-8 text-[#FF6B00] flex-shrink-0" strokeWidth={2} />
          <p className="text-[#1A1A1A] text-[12px] leading-relaxed">
            <span className="font-bold">Authentiks</span> is investigating this product identity to protect consumers and brand trust.
          </p>
        </div>

      </div>
    </div>
  );
}

function ResultFake({ data }: { data: any }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col relative pb-32">
      
      {/* Top Red Header Section */}
      <div className="bg-[#D10000] pt-8 px-5 relative rounded-b-[40px] overflow-hidden">
        {/* Subtle background circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-4 relative z-50">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-white">
            <ChevronLeft className="w-7 h-7" strokeWidth={2} />
          </button>
          <h1 className="text-white text-[17px] font-bold">Scan Result</h1>
          <div className="w-7 h-7" /> {/* Spacer */}
        </div>

        {/* Main Alert Header Section */}
        <div className="flex flex-col items-center relative z-10 pb-8 mt-2">
          <div className="mb-3 w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center p-2">
            <div className="bg-[#D10000] w-full h-full rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-white text-[28px] font-bold tracking-tight mb-3 text-center">
            WARNING
          </h2>
          <p className="text-white/90 text-[14px] font-medium text-center max-w-[300px] leading-relaxed">
            This QR code is not registered with Authentiks. This product may be counterfeit or unauthorized.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 mt-6 relative z-20 flex flex-col gap-4 pb-10">
        
        {/* Not Authentic Card */}
        <div className="bg-white rounded-[12px] p-4 flex gap-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-[#D10000] flex-shrink-0 flex items-center justify-center mt-0.5">
            <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h4 className="text-[#D10000] font-bold text-[14px] mb-1">This QR code is not authentic.</h4>
            <p className="text-[#333333] text-[13px] font-medium leading-snug">
              It does not match any product in our database. Please be cautious.
            </p>
          </div>
        </div>

        {/* Warning Indicator Card */}
        <div className="bg-white rounded-[12px] p-4 flex gap-4 border border-[#D10000] shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#D10000] flex-shrink-0 flex items-center justify-center mt-0.5">
            <X className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-[#D10000] font-bold text-[14px] mb-1.5">This may indicate:</h4>
            <ul className="list-disc pl-4 text-[#333333] text-[13px] space-y-1 font-medium">
              <li>Counterfeit or fake product</li>
              <li>Tampered or duplicate QR code</li>
              <li>Unauthorized manufacturing or distribution</li>
              <li>Product not linked with Authentiks protection</li>
            </ul>
          </div>
        </div>

        {/* Contact Note */}
        <div className="bg-white rounded-[12px] p-4 flex gap-4 shadow-sm items-center border border-gray-100">
          <Headset className="w-7 h-7 text-[#D10000] flex-shrink-0 ml-1" strokeWidth={1.5} />
          <p className="text-[#1A1A1A] text-[13px] font-medium leading-relaxed">
            If you believe this is a mistake or you have purchased this product from an authorized seller, please contact our support team.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-1">
          <button 
            onClick={() => navigate("/report", {
              state: {
                qrCode: data.qrCode,
                reportType: "COUNTERFEIT",
                productName: data.productName,
                brand: data.brand,
                productId: data.productId || null,
                brandId: data.brandId || null,
                scanStatus: data.status || "FAKE"
              }
            })}
            className="w-full bg-[#D10000] text-white font-bold text-[15px] py-4 rounded-[8px] flex items-center justify-center gap-2 shadow-sm"
          >
            <Flag className="w-5 h-5" strokeWidth={2.5} />
            REPORT THIS PRODUCT
          </button>
          <button className="w-full bg-white text-[#D10000] border border-[#D10000] font-bold text-[15px] py-4 rounded-[8px] flex items-center justify-center gap-2 shadow-sm">
            <Headset className="w-5 h-5" strokeWidth={2} />
            CONTACT SUPPORT
          </button>
        </div>

        {/* Footer Note */}
        <div className="bg-white rounded-[12px] p-4 flex gap-4 shadow-sm items-start mt-2 border border-gray-100">
          <ShieldCheck className="w-8 h-8 text-[#D10000] flex-shrink-0" strokeWidth={2} />
          <p className="text-[#1A1A1A] text-[12px] leading-relaxed">
            <span className="font-bold">Authentiks</span> is committed to protecting consumers and brand integrity.<br/>
            <span className="text-[#D10000] font-semibold mt-0.5 block">Thank you for helping us fight counterfeits.</span>
          </p>
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
        onLeftClick={() => navigate(-1)}
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

