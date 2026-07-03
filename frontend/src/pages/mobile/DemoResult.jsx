import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Share, FileText, BookOpen, MessageSquare, ShieldCheck, Gift, ChevronRight, XCircle, AlertTriangle, Headset, Flag, X, ShieldAlert, Calendar, Phone, MapPin, RefreshCcw, ScanLine, CheckCircle2, FlaskConical, Award, Star, ChevronDown, Check, Search, CheckCircle, QrCode, ExternalLink, Mail, Clock } from "lucide-react";
import authenticIcon from "../../assets/logo-shield.png";
import fakeIcon from "../../assets/v2/home/header/dangerous.svg";

const DEMO_PRODUCT = {
  active: true,
  companyName: "ProtiQ Nutrition",
  productName: "PROTIQ Whey Isolate Elite",
  brand: "ProtiQ",
  batchNo: "PTQ250701",
  mfdOn: { month: "Jul", year: "2026" },
  description: "Fuel Better. Perform Stronger.\n100% Whey Protein Isolate - Double Rich Chocolate.",
  keyBenefits: "25 g Protein per Serving\n5.5 g Naturally Occurring BCAAs\n11.7 g EAAs\n0 g Added Sugar\nFast Absorption\nLow Fat & Low Carbs\nGluten Free\nThird-Party Lab Tested\nNo Banned Substances\nMixes Instantly",
  productImage: "/protiq_whey.png",
  category: "Sports Nutrition",
  dynamicFields: {
    "mrp": "₹3,499",
    "manufacturedBy": "ProtiQ Nutrition Pvt. Ltd. Bengaluru, Karnataka, India",
    "website": "www.protiqnutrition.com"
  },
  warranty: {
    duration: 1,
    durationUnit: "years",
    warrantyType: "Brand Quality Guarantee",
    customerCare: "support@protiqnutrition.com",
    supportEmail: "support@protiqnutrition.com",
    description: "Quality Assurance: GMP Certified Facility, ISO 22000 Certified, Third-Party Tested, Heavy Metal Tested. Store in a cool, dry place away from direct sunlight."
  },
  variants: [
    { variantName: 'Flavor', value: 'Double Rich Chocolate' },
    { variantName: 'Net Weight', value: '907 g (2 lbs)' }
  ],
  supplementFacts: [
    { label: "Energy", value: "112 kcal" },
    { label: "Protein", value: "25 g" },
    { label: "Carbohydrates", value: "2.0 g" },
    { label: "Total Sugars", value: "0.5 g" },
    { label: "Added Sugar", value: "0 g" },
    { label: "Fat", value: "0.6 g" },
    { label: "Saturated Fat", value: "0.2 g" },
    { label: "Sodium", value: "85 mg" },
    { label: "BCAAs", value: "5.5 g" },
    { label: "EAAs", value: "11.7 g" }
  ],
  ingredients: "Whey Protein Isolate, Cocoa Powder, Natural & Nature-Identical Chocolate Flavour, Sunflower Lecithin, Stevia Extract.",
  recommendedUse: "Mix 1 scoop (30 g) with 200–250 ml of cold water or milk. Consume after workouts or anytime to meet your daily protein requirements.",
  certificates: [
    { name: "GMP Certified Facility", issuer: "Quality Council", date: "Jan 2026" },
    { name: "ISO 22000 Certified", issuer: "ISO Board", date: "Mar 2025" },
    { name: "Heavy Metal Tested", issuer: "Eurofins", date: "Jul 2026", isLabTest: true },
    { name: "Protein Authenticity", issuer: "NABL Labs", date: "Jul 2026", isLabTest: true }
  ]
};

export default function DemoResult({ code }) {
  const isFake = code === 'DEMO-FAKE-QR';
  const isDuplicate = code === 'DEMO-DUPLICATE-QR';
  const isInactive = code === 'DEMO-INACTIVE-QR';

  if (isFake) return <ResultFake data={{ qrCode: code, productName: "Unknown", brand: "Unknown" }} />;
  if (isDuplicate) return <ResultRepeat data={{ ...DEMO_PRODUCT, qrCode: code, originalScan: { scannedAt: new Date(), scannedBy: "98*****123", location: "Chennai, India" }, totalScans: 3 }} />;
  if (isInactive) return <ResultInactive data={{ ...DEMO_PRODUCT, qrCode: code }} />;

  return <ResultAuthentic data={{ ...DEMO_PRODUCT, qrCode: code }} />;
}

function ResultAuthentic({ data }) {
  const navigate = useNavigate();

  const scanDate = new Date();
  const scanDateStr = `${scanDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}\n${scanDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  
  const mfdDate = data.mfdOn ? `${data.mfdOn.month} ${data.mfdOn.year}` : "Jul 2026";
  const expDate = "Jun 2028";
  const batchNo = data.batchNo;

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [optIn, setOptIn] = useState(false);
  const [purchaseLocation, setPurchaseLocation] = useState("");
  const [customPurchaseLocation, setCustomPurchaseLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const [awardedCoupon, setAwardedCoupon] = useState(null);
  const [showCouponReveal, setShowCouponReveal] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [showCertsModal, setShowCertsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyClaiming, setWarrantyClaiming] = useState(false);
  const [warrantyClaimStatus, setWarrantyClaimStatus] = useState(null);
  const [warrantyClaimed, setWarrantyClaimed] = useState(false);
  const [warrantyForm, setWarrantyForm] = useState({ purchaseDate: '' });
  const [invoiceImages, setInvoiceImages] = useState([]);
  const warrantyFileRef = useRef(null);

  const productName = data.productName;
  const productImage = data.productImage;
  const companyName = data.companyName;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Authentik Product Verified",
          text: `Check out this 100% authentic ${productName} by ${companyName}!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col relative pb-32">
      {/* Top Blue Header Section */}
      <div className="bg-[#01227E] pt-4 px-5 relative rounded-b-[40px] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#105DE4] rounded-full opacity-40 blur-[40px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-[3px] border-[#105DE4]/40 pointer-events-none animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-dashed border-white/30 pointer-events-none animate-[spin_15s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-dashed border-white/20 pointer-events-none animate-[spin_20s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full border border-dashed border-white/10 pointer-events-none animate-[spin_25s_linear_infinite]" />
        
        <div className="absolute top-[30%] left-[20%] w-6 h-6 opacity-40 text-[#4CC9F0] animate-pulse" style={{ animationDuration: '2s' }}>✨</div>
        <div className="absolute top-[20%] right-[25%] w-8 h-8 opacity-40 text-[#4CC9F0] animate-bounce" style={{ animationDuration: '3s' }}>✨</div>
        <div className="absolute bottom-[40%] right-[15%] w-5 h-5 opacity-40 text-[#4CC9F0] animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }}>✨</div>
        
        <div className="flex items-center justify-between mb-6 relative z-50">
          <button onClick={() => window.location.href = '/'} className="p-1 -ml-1 text-white">
            <ChevronLeft className="w-7 h-7" strokeWidth={2} />
          </button>
          <button onClick={handleShare} className="p-1 -mr-1 text-white">
            <Share className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col items-center relative z-10 top-[-50px] animate-[slide-up_0.5s_ease-out]">
          <div className="w-20 h-20 animate-bounce" style={{ animationDuration: '2s' }}>
             <img src={authenticIcon} alt="Authentic" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <h2 className="text-white text-[24px] font-bold tracking-tight mb-1.5">Authentic Product</h2>
          <p className="text-[#B3C8F9] text-[13px] font-medium text-center max-w-[240px] leading-relaxed">
            This product is 100% authentic and verified by Authentiks
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-10 relative z-20 flex flex-col gap-4 pb-10">
        
        {/* Product Info Card */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.06)] flex gap-4">
          <div className="w-[100px] h-[120px] flex-shrink-0 flex items-center justify-center">
             <img src={productImage} alt={productName} className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <div className="flex flex-col flex-1 py-1 justify-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E05206" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <span className="text-[#0B1E36] font-bold text-[13px]">{companyName}</span>
              <ShieldCheck className="w-[14px] h-[14px] text-[#105DE4] fill-[#105DE4] stroke-white" strokeWidth={1} />
            </div>
            <h3 className="text-[#0B1E36] font-extrabold text-[17px] leading-tight mb-1">{productName}</h3>
            <p className="text-[#5A7184] text-[13px] font-medium mb-2">{data.category}</p>
            
            <div className="flex flex-wrap gap-2 mt-1 mb-2.5">
              {data.variants.map((v, index) => (
                <span 
                  key={index}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${index % 2 === 0 ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-[#ECFDF5] text-[#059669]'}`}
                >
                  {v.value}
                </span>
              ))}
            </div>
            
            <div className="mt-auto pt-1 flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-[#105DE4] rounded-full flex items-center justify-center shadow-[0_2px_4px_rgba(16,93,228,0.2)]">
                <CheckCircle2 size={9} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[#105DE4] text-[10.5px] font-bold tracking-wide">100% Authentic</span>
            </div>
          </div>
        </div>

        {/* Tracking Grid */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex justify-between divide-x divide-slate-100">
          <div className="flex flex-col items-center flex-1 px-1">
            <ScanLine size={20} className="text-[#105DE4] mb-2" strokeWidth={1.5} />
            <h4 className="text-[10px] font-bold text-slate-900 mb-1">Scanned On</h4>
            <p className="text-[9px] text-slate-500 font-medium text-center leading-tight whitespace-pre-line">{scanDateStr}</p>
          </div>
          <div className="flex flex-col items-center flex-1 px-1">
            <Calendar size={20} className="text-[#105DE4] mb-2" strokeWidth={1.5} />
            <h4 className="text-[10px] font-bold text-slate-900 mb-1">Mfd On</h4>
            <p className="text-[9px] text-slate-500 font-medium text-center leading-tight">{mfdDate}</p>
          </div>
          <div className="flex flex-col items-center flex-1 px-1">
            <Calendar size={20} className="text-[#105DE4] mb-2" strokeWidth={1.5} />
            <h4 className="text-[10px] font-bold text-slate-900 mb-1">Expiry On</h4>
            <p className="text-[9px] text-slate-500 font-medium text-center leading-tight">{expDate}</p>
          </div>
          <div className="flex flex-col items-center flex-1 px-1">
            <ShieldCheck size={20} className="text-[#105DE4] mb-2" strokeWidth={1.5} />
            <h4 className="text-[10px] font-bold text-slate-900 mb-1">Batch No.</h4>
            <p className="text-[9px] text-slate-500 font-medium text-center leading-tight">{batchNo}</p>
          </div>
        </div>

        {/* Action Menu Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x pt-1">
           <button onClick={() => setShowProductDetails(true)} className="snap-start flex-shrink-0 w-[120px] h-[110px] bg-white rounded-[16px] p-4 flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95 transition-transform relative">
             <FileText className="w-6 h-6 text-[#105DE4] mb-auto" strokeWidth={1.5} />
             <div className="flex items-end justify-between w-full mt-auto">
               <span className="text-[12px] font-bold text-[#0B1E36] text-left leading-[1.2] w-[70%]">Product Details</span>
               <ChevronRight className="w-4 h-4 text-gray-400 -mr-1" />
             </div>
           </button>

           <button onClick={() => setShowIngredientsModal(true)} className="snap-start flex-shrink-0 w-[120px] h-[110px] bg-white rounded-[16px] p-4 flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95 transition-transform relative">
             <FlaskConical className="w-6 h-6 text-[#105DE4] mb-auto" strokeWidth={1.5} />
             <div className="flex items-end justify-between w-full mt-auto">
               <span className="text-[12px] font-bold text-[#0B1E36] text-left leading-[1.2] w-[70%]">Ingredients & Usage</span>
               <ChevronRight className="w-4 h-4 text-gray-400 -mr-1" />
             </div>
           </button>
           
           <button onClick={() => setShowCertsModal(true)} className="snap-start flex-shrink-0 w-[120px] h-[110px] bg-white rounded-[16px] p-4 flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95 transition-transform relative">
             <Award className="w-6 h-6 text-[#105DE4] mb-auto" strokeWidth={1.5} />
             <div className="flex items-end justify-between w-full mt-auto">
               <span className="text-[12px] font-bold text-[#0B1E36] text-left leading-[1.2] w-[70%]">Certificates & Labs</span>
               <ChevronRight className="w-4 h-4 text-gray-400 -mr-1" />
             </div>
           </button>

           <button onClick={() => setShowSupportModal(true)} className="snap-start flex-shrink-0 w-[120px] h-[110px] bg-white rounded-[16px] p-4 flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95 transition-transform relative">
             <Headset className="w-6 h-6 text-[#105DE4] mb-auto" strokeWidth={1.5} />
             <div className="flex items-end justify-between w-full mt-auto">
               <span className="text-[12px] font-bold text-[#0B1E36] text-left leading-[1.2] w-[70%]">Consumer Support</span>
               <ChevronRight className="w-4 h-4 text-gray-400 -mr-1" />
             </div>
           </button>
        </div>

        {/* Warranty Claim Banner */}
        <button
          onClick={() => {
            if (warrantyClaimed) return;
            setShowWarrantyModal(true);
          }}
          disabled={warrantyClaimed}
          className={`relative overflow-hidden w-full mt-3 ${warrantyClaimed ? 'bg-gray-400' : 'bg-emerald-600'} text-white rounded-[24px] p-4 flex items-center shadow-[0_8px_25px_rgba(5,150,105,0.25)] active:scale-[0.98] transition-transform`}
        >
          {!warrantyClaimed && (
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-flash-shimmer" style={{ animationDelay: '2s' }} />
          )}
          
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-3 relative z-10">
             <ShieldCheck className="w-[20px] h-[20px] text-emerald-600" strokeWidth={2} />
          </div>
          <div className="flex flex-col flex-1 text-left relative z-10">
             <span className="text-[15px] font-extrabold mb-0.5">{warrantyClaimed ? "Warranty Registered" : "Register Warranty"}</span>
             <span className="text-[11px] font-medium text-emerald-100">
               {warrantyClaimed ? "Your product warranty is active" : "Activate your product protection"}
             </span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 relative z-10" />
        </button>
        
        {/* Review & Claim Reward Banner */}
        <button
          onClick={() => setShowReviewModal(true)}
          disabled={isReviewed}
          className={`relative overflow-hidden w-full ${isReviewed ? 'bg-gray-400' : 'bg-[#01227E]'} text-white rounded-[24px] p-4 flex items-center shadow-[0_8px_25px_rgba(1,34,126,0.25)] active:scale-[0.98] transition-transform`}
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-flash-shimmer" />
          
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-3 relative z-10">
             <Gift className="w-[20px] h-[20px] text-[#01227E]" strokeWidth={2} />
          </div>
          <div className="flex flex-col flex-1 text-left relative z-10">
             <span className="text-[15px] font-extrabold mb-0.5">{isReviewed ? "Product Reviewed" : "Review & Claim Reward"}</span>
             <span className="text-[11px] font-medium text-[#B3C8F9]">
               {isReviewed ? "Thank you for your valuable feedback!" : "Share your experience and earn exciting rewards!"}
             </span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 relative z-10" />
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ animation: 'reviewOverlayIn 0.25s ease' }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />

          <div
            className="relative w-full sm:max-w-[440px] sm:mx-4 bg-white rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-[0_-8px_40px_rgba(0,0,0,0.2)] sm:shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            style={{ animation: 'reviewSheetUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute right-4 top-4 sm:top-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <div className="px-6 pt-8 pb-5 text-center">
              <div className="w-[80px] h-[80px] rounded-[24px] overflow-hidden mx-auto mb-5 shadow-[0_8px_24px_rgba(13,78,150,0.15)] bg-white p-1">
                <img src={productImage} alt="" className="w-full h-full object-cover rounded-[20px]" />
              </div>
              <h2 className="text-[22px] font-black text-[#0D4E96] tracking-tight leading-tight mb-1.5">{productName}</h2>
              <p className="text-[13px] font-bold text-[#8ba2be] uppercase tracking-[0.1em]">{companyName}</p>
            </div>

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
                  <p className="text-center text-[15px] font-black text-[#F59E0B]">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 pb-2">
              <label className="block text-sm font-bold text-[#1F2642] mb-2">Where did you buy this product?</label>
              <select
                value={purchaseLocation}
                onChange={(e) => setPurchaseLocation(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-[14px] px-4 py-3 text-[#1F2642] font-semibold text-[14px] focus:outline-none focus:border-[#0D4E96]"
              >
                <option value="" disabled>Select marketplace</option>
                <option value="Amazon">Amazon</option>
                <option value="Retail Store">Retail Store</option>
              </select>
            </div>

            <div className="px-6 pb-8">
              <label className="flex items-start gap-3 cursor-pointer mb-6 group mt-4">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="sr-only" />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${optIn ? 'bg-[#0D4E96] border-[#0D4E96] scale-105' : 'bg-white border-[#CBD5E1]'}`}>
                    {optIn && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>}
                  </div>
                </div>
                <span className="text-[12px] font-bold text-[#333] leading-tight mt-0.5">Yes, I would like to receive exclusive offer and discounts from the brand</span>
              </label>

              <button
                onClick={() => {
                  setSubmitting(true);
                  setTimeout(() => {
                    setSubmitting(false);
                    setIsReviewed(true);
                    setShowReviewModal(false);
                    setAwardedCoupon({
                      title: "DEMO REWARD",
                      code: "WELCOME50",
                      description: "Get 50% off on your next order!",
                      websiteLink: "https://authentiks.in",
                      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    });
                    setTimeout(() => setShowCouponReveal(true), 300);
                  }, 1500);
                }}
                disabled={submitting || rating === 0 || !purchaseLocation}
                className={`w-full font-bold text-[16px] py-4 rounded-2xl shadow-lg transition-all duration-300 active:scale-[0.97] ${rating === 0 || !purchaseLocation
                  ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white shadow-blue-500/25'
                  }`}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Reveal */}
      {showCouponReveal && awardedCoupon && (
        <div className="fixed inset-0 z-[200] bg-gradient-to-b from-[#F0F7FF] via-[#FFFFFF] to-[#F8FAFC] flex flex-col font-sans overflow-y-auto">
          <div className="w-full flex items-center justify-between p-4 bg-white sticky top-0 z-50 shadow-sm/50">
            <button onClick={() => setShowCouponReveal(false)} className="text-[#0D4E96] p-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <h1 className="text-[20px] font-bold text-[#0D4E96] tracking-tight">Authentiks</h1>
            <div className="w-8"></div>
          </div>

          <div className="flex-1 px-5 py-8 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-10 left-6 w-8 h-8 opacity-25 text-pink-500 animate-bounce">🎈</div>
            <div className="absolute top-20 right-8 w-6 h-6 opacity-25 text-amber-500 animate-pulse">✨</div>
            <div className="absolute bottom-40 left-10 w-6 h-6 opacity-25 text-blue-500 animate-pulse">✨</div>
            <div className="absolute bottom-20 right-10 w-8 h-8 opacity-25 text-indigo-500 animate-bounce">🎈</div>

            <div className="text-center mb-8 relative z-10">
              <span className="text-[12px] font-black uppercase tracking-widest text-[#2CA4D6] bg-cyan-50 px-3.5 py-1.5 rounded-full border border-cyan-100/50 mb-3 inline-block">Reward Unlocked 🎉</span>
              <h2 className="bg-gradient-to-r from-[#0D4E96] to-[#1E3A8A] bg-clip-text text-transparent text-[24px] font-black text-center leading-tight">
                Congratulations!<br />You've Earned a Coupon
              </h2>
            </div>

            <div className="w-full max-w-sm relative mt-8 shadow-[0_20px_50px_rgba(13,78,150,0.1)] rounded-[24px] bg-white border border-slate-100">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-tr from-[#0D4E96] to-[#2CA4D6] rounded-full border-[6px] border-white flex items-center justify-center z-20 shadow-xl shadow-blue-500/20">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
              </div>

              <div className="bg-[#1F2642] bg-gradient-to-br from-[#0D4E96] via-[#1E3A8A] to-[#1F2642] rounded-t-[24px] pt-16 pb-8 px-6 text-center relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-white/95 text-[10px] font-black tracking-wider uppercase">{companyName}</span>
                </div>
                <h3 className="text-white text-[22px] font-black uppercase tracking-wide leading-tight drop-shadow-sm px-2">
                  {awardedCoupon.title}
                </h3>
              </div>

              <div className="relative py-5 bg-slate-50 border-y border-dashed border-slate-200 flex items-center justify-center">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full border border-slate-200/50 shadow-[inset_-3px_0_6px_rgba(0,0,0,0.02)] z-10" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full border border-slate-200/50 shadow-[inset_3px_0_6px_rgba(0,0,0,0.02)] z-10" />
                
                <div className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-2xl border-2 border-dashed font-mono text-[18px] font-black uppercase tracking-widest border-cyan-500/30 bg-cyan-500/5 text-[#0D4E96]">
                  <span>{awardedCoupon.code}</span>
                  <button onClick={() => {
                      navigator.clipboard.writeText(awardedCoupon.code);
                      setCouponCopied(true);
                      setTimeout(() => setCouponCopied(false), 2000);
                    }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${couponCopied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500'}`}
                  >
                    {couponCopied ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-b-[24px] p-6 text-center">
                <div className="text-left mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5">Reward Description</p>
                  <p className="text-slate-600 text-[13px] font-medium leading-relaxed whitespace-pre-wrap">{awardedCoupon.description}</p>
                </div>
                <button
                  onClick={() => window.open(awardedCoupon.websiteLink, '_blank')}
                  className="w-full bg-gradient-to-r from-[#0D4E96] to-[#2CA4D6] text-white font-extrabold text-[15px] py-4 rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 active:scale-95 transition-all uppercase tracking-wider"
                >
                  Redeem Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warranty Modal */}
      {showWarrantyModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowWarrantyModal(false)} />
          <div className="relative w-full sm:max-w-[440px] sm:mx-4 bg-white rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] overflow-y-auto shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
            <div className="px-6 pt-8 pb-4 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h2 className="text-[20px] font-black text-[#0D4E96] tracking-tight">Register Warranty</h2>
              <p className="text-[13px] text-gray-500 font-medium mt-1">Upload your purchase invoice to register warranty</p>
            </div>
            <div className="px-6 pb-8 space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Purchase Date *</label>
                <input
                  type="date"
                  value={warrantyForm.purchaseDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setWarrantyForm({ ...warrantyForm, purchaseDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Invoice Image <span className="text-gray-400 font-normal">(Simulated)</span></label>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-700 font-bold text-[13px] hover:bg-emerald-100 transition-colors">
                  Upload from Gallery
                </button>
              </div>
              <button
                onClick={() => {
                  if (!warrantyForm.purchaseDate) return alert('Please select a purchase date');
                  setWarrantyClaiming(true);
                  setTimeout(() => {
                    setWarrantyClaiming(false);
                    setWarrantyClaimed(true);
                    setShowWarrantyModal(false);
                    alert('Demo Mode: Warranty registered!');
                  }, 1500);
                }}
                disabled={warrantyClaiming}
                className="w-full font-bold text-[16px] py-4 rounded-2xl shadow-lg transition-all duration-300 active:scale-[0.97] bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-emerald-500/25"
              >
                {warrantyClaiming ? "Submitting..." : 'Register Warranty'}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showProductDetails && <DemoProductDetails data={data} onBack={() => setShowProductDetails(false)} />}
      {showIngredientsModal && <DemoIngredients data={data} onBack={() => setShowIngredientsModal(false)} />}
      {showCertsModal && <DemoCertificates data={data} onBack={() => setShowCertsModal(false)} />}
      {showSupportModal && <DemoConsumerSupport data={data} onBack={() => setShowSupportModal(false)} />}
<style>{`
        @keyframes reviewOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes reviewSheetUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

function ResultRepeat({ data }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col relative pb-32">
      <div className="bg-white sticky top-0 z-[100] px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => window.location.href = '/'} className="p-1 -ml-1 text-[#0B1E36]">
          <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <h1 className="text-[#0B1E36] text-[17px] font-bold">Scan Result</h1>
        <div className="w-7 h-7" />
      </div>

      <div className="bg-[#FF6B00] px-5 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-dashed border-white/30 pointer-events-none animate-[spin_15s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-dashed border-white/20 pointer-events-none animate-[spin_20s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full border border-dashed border-white/10 pointer-events-none animate-[spin_25s_linear_infinite]" />
        
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 translate-y-[2px]">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
            <path d="M0,0 C320,80 420,80 720,40 C1020,0 1120,0 1440,80 L1440,120 L0,120 Z" fill="#FAFAFA"></path>
          </svg>
        </div>

        <div className="flex flex-col items-center relative z-20 pb-4">
          <div className="mb-3 w-[72px] h-[72px] bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-10 h-10 text-white animate-bounce" style={{ animationDuration: '2s' }} strokeWidth={2.5} />
          </div>
          <h2 className="text-white text-[28px] font-bold tracking-tight mb-3 text-center uppercase leading-tight px-12">
            DUPLICATE SCAN DETECTED
          </h2>
          <p className="text-white/90 text-[14px] font-medium text-center max-w-[320px] leading-relaxed">
            This product has already been registered and authenticated on another account.
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-14 relative z-30 flex flex-col gap-4 pb-10">
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
                <span className="text-[13px] font-semibold text-[#1A1A1A]">First Verified On:</span>
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
                <span className="text-[13px] font-semibold text-[#1A1A1A]">First Verified By:</span>
                <span className="text-[13px] font-bold text-[#1A1A1A]">
                  {data.originalScan?.scannedBy || "988XXXX144"}
                </span>
              </div>
            </div>

            <div className="flex items-center border-b border-gray-100 pb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center border border-[#FF6B00]/20 mr-4">
                <MapPin className="w-4 h-4 text-[#FF6B00]" strokeWidth={2} />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span className="text-[13px] font-semibold text-[#1A1A1A]">First Verified Location:</span>
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

        <div className="bg-white rounded-[12px] p-4 flex gap-4 border border-[#FF6B00] shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#FF6B00] flex-shrink-0 flex items-center justify-center mt-0.5 animate-pulse">
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

        <div className="flex flex-col gap-3 mt-1">
          <button 
            onClick={() => alert("Report Product Clicked")}
            className="w-full bg-[#FF6B00] text-white font-bold text-[15px] py-4 rounded-[8px] flex items-center justify-center gap-2 shadow-sm"
          >
            <Flag className="w-5 h-5" strokeWidth={2.5} />
            REPORT PRODUCT
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultFake({ data }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col relative pb-32">
      <div className="bg-white sticky top-0 z-[100] px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => window.location.href = '/'} className="p-1 -ml-1 text-[#0B1E36]">
          <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <h1 className="text-[#0B1E36] text-[17px] font-bold">Scan Result</h1>
        <div className="w-7 h-7" />
      </div>

      <div className="bg-[#D10000] px-5 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-dashed border-white/30 pointer-events-none animate-[spin_15s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-dashed border-white/20 pointer-events-none animate-[spin_20s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full border border-dashed border-white/10 pointer-events-none animate-[spin_25s_linear_infinite]" />
        
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 translate-y-[2px]">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
            <path d="M0,0 C320,80 420,80 720,40 C1020,0 1120,0 1440,80 L1440,120 L0,120 Z" fill="#FAFAFA"></path>
          </svg>
        </div>

        <div className="flex flex-col items-center relative z-20 pb-4">
          <div className="mb-3 w-[72px] h-[72px] bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
            <X className="w-10 h-10 text-white animate-bounce" style={{ animationDuration: '2s' }} strokeWidth={3} />
          </div>
          <h2 className="text-white text-[28px] font-bold tracking-tight mb-3 text-center uppercase leading-tight max-w-[280px]">
            WARNING
          </h2>
          <p className="text-white/90 text-[14px] font-medium text-center max-w-[300px] leading-relaxed">
            This QR code is not registered with Authentiks. This product may be counterfeit or unauthorized.
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-14 relative z-30 flex flex-col gap-4 pb-10">
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

        <div className="bg-white rounded-[12px] p-4 flex gap-4 border border-[#D10000] shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#D10000] flex-shrink-0 flex items-center justify-center mt-0.5 animate-pulse">
            <X className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-[#D10000] font-bold text-[14px] mb-1.5">This may indicate:</h4>
            <ul className="list-disc pl-4 text-[#333333] text-[13px] space-y-1 font-medium">
              <li>Counterfeit or fake product</li>
              <li>Tampered or duplicate QR code</li>
              <li>Unauthorized manufacturing or distribution</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-1">
          <button 
            onClick={() => alert("Report Product Clicked")}
            className="w-full bg-[#D10000] text-white font-bold text-[15px] py-4 rounded-[8px] flex items-center justify-center gap-2 shadow-sm"
          >
            <Flag className="w-5 h-5" strokeWidth={2.5} />
            REPORT PRODUCT
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultInactive({ data }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col relative pb-32">
      <div className="bg-white sticky top-0 z-[100] px-5 py-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => window.location.href = '/'} className="p-1 -ml-1 text-[#0B1E36]">
          <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
        </button>
        <h1 className="text-[#0B1E36] text-[17px] font-bold">Scan Result</h1>
        <div className="w-7 h-7" />
      </div>

      <div className="bg-slate-800 px-5 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 translate-y-[2px]">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[40px] md:h-[60px]">
            <path d="M0,0 C320,80 420,80 720,40 C1020,0 1120,0 1440,80 L1440,120 L0,120 Z" fill="#FAFAFA"></path>
          </svg>
        </div>

        <div className="flex flex-col items-center relative z-20 pb-4">
          <div className="mb-3 w-[72px] h-[72px] bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-slate-300" strokeWidth={2.5} />
          </div>
          <h2 className="text-white text-[28px] font-bold tracking-tight mb-3 text-center uppercase leading-tight max-w-[280px]">
            INACTIVE CODE
          </h2>
          <p className="text-white/90 text-[14px] font-medium text-center max-w-[300px] leading-relaxed">
            This QR code is in our system but has not been activated for retail sale yet.
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-14 relative z-30 flex flex-col gap-4 pb-10">
        <div className="bg-white rounded-[12px] p-4 flex gap-4 border border-slate-200 shadow-sm">
          <div>
            <h4 className="text-slate-800 font-bold text-[14px] mb-1.5">What does this mean?</h4>
            <p className="text-slate-600 text-[13px] leading-relaxed">
              A product might be marked as inactive if it's still in the warehouse, awaiting market release, or has been recalled.
            </p>
          </div>
        </div>
        <button onClick={() => window.location.href = '/'} className="w-full bg-slate-800 text-white font-bold text-[15px] py-4 rounded-[8px] mt-4 shadow-sm">
          SCAN ANOTHER PRODUCT
        </button>
      </div>
    </div>
  );
}


function DemoProductDetails({ data, onBack }) {
  const [showMoreDesc, setShowMoreDesc] = React.useState(false);
  const variantName = data.variants?.[0]?.value || data.category || 'Standard';
  const benefitsList = data.keyBenefits ? data.keyBenefits.split(/\n|,/).map((b) => b.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[#001466] font-sans overflow-x-hidden pb-20 fixed inset-0 z-[200] overflow-y-auto">
      <div className="px-5 pt-6 pb-2 flex items-center justify-between text-white sticky top-0 bg-[#001466] z-10">
        <button onClick={onBack} className="p-1 -ml-1 active:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
        <h1 className="text-[17px] font-bold tracking-wide">Product Details</h1>
        <button className="p-1 -mr-1 active:bg-white/10 rounded-full transition-colors">
          <Share size={22} strokeWidth={2.5} />
        </button>
      </div>

      <div className="px-5 pt-4 pb-8 flex gap-4 items-center">
        <div className="w-[140px] h-[160px] shrink-0 relative flex items-center justify-center -ml-2">
          <img src={data.productImage} alt={data.productName} className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-white text-[13px] font-bold flex items-center gap-1.5">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[#001466] font-black text-[10px]">
                {data.companyName.charAt(0).toUpperCase()}
              </div>
              {data.companyName}
            </span>
            <div className="w-4 h-4 bg-[#105DE4] rounded-full flex items-center justify-center">
              <Check size={10} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-white text-[22px] font-bold leading-[1.1] mb-1 tracking-tight">{data.productName}</h2>
          {variantName && <p className="text-blue-100 text-[13px] font-medium mb-3">{variantName}</p>}
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 bg-[#FFE8D6] text-[#E07A25] text-[10px] font-extrabold rounded uppercase tracking-wide">
              {data.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-[#FFC107] fill-[#FFC107]" />
            <span className="text-white text-[14px] font-bold">4.8</span>
            <span className="text-blue-200 text-[11px]">(124 Reviews)</span>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] rounded-t-[24px] px-5 pt-6 pb-8 min-h-screen">
        <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 mb-6">
          <div className="flex flex-col border-r border-slate-100 pr-3 mr-1 w-[40%]">
            <p className="text-[10px] font-medium text-slate-500 leading-[1.2] mb-1">
              Every product is scanned, verified and protected by
            </p>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#105DE4]" strokeWidth={2.5} />
              <span className="text-[#105DE4] font-black text-[13px] tracking-tight">Authentiks</span>
            </div>
          </div>
          <div className="flex flex-1 justify-between gap-1">
            <div className="flex flex-col items-center gap-1">
              <Search size={16} className="text-slate-400" />
              <span className="text-[8px] font-bold text-center leading-tight text-slate-600">Tracked from<br/>Source</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle size={16} className="text-slate-400" />
              <span className="text-[8px] font-bold text-center leading-tight text-slate-600">Third Party<br/>Verified</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <QrCode size={16} className="text-slate-400" />
              <span className="text-[8px] font-bold text-center leading-tight text-slate-600">Unique<br/>Identity</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            <h3 className="text-[#0B1E36] font-bold text-[15px] mb-2.5">About this Product</h3>
            <p className="text-slate-700 text-[13px] leading-[1.6] whitespace-pre-wrap">
              {showMoreDesc ? data.description : (data.description.length > 100 ? `${data.description.slice(0, 100)}...` : data.description)}
            </p>
            {data.description.length > 100 && (
              <button 
                onClick={() => setShowMoreDesc(!showMoreDesc)}
                className="text-[#105DE4] text-[12px] font-bold mt-1 flex items-center gap-0.5"
              >
                Read {showMoreDesc ? 'Less' : 'More'} <ChevronDown size={14} className={showMoreDesc ? 'rotate-180' : ''} />
              </button>
            )}
          </div>
        </div>

        {benefitsList.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[#0B1E36] font-bold text-[15px] mb-4">Key Benefits</h3>
            <div className="flex flex-col gap-3">
              {benefitsList.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                     <CheckCircle2 size={16} />
                   </div>
                   <span className="text-sm font-medium text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#F0F5FF] border border-[#D5E3FF] rounded-2xl p-4 flex items-center justify-between mt-2 active:opacity-70 transition-opacity cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#105DE4] rounded-xl flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(16,93,228,0.2)]">
              <ShieldCheck size={22} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[#0B1E36] font-bold text-[13px] leading-tight mb-0.5">100% Authentic Guarantee</h4>
              <p className="text-slate-500 text-[11px] font-medium leading-tight">This product is verified and protected by Authentiks.</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}

function DemoIngredients({ data, onBack }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 font-sans fixed inset-0 z-[200] overflow-y-auto">
      <div className="bg-[#001466] text-white pt-6 pb-4 px-5 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-[16px] font-bold tracking-wide flex-1 text-center pr-6">Ingredients & Usage</h1>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FlaskConical size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Formulation</h2>
              <p className="text-xs font-medium text-slate-500">What goes into this product</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{data.ingredients}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Supplement Facts</h2>
              <p className="text-xs font-medium text-slate-500">Nutritional Information</p>
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {data.supplementFacts.map((fact, idx) => (
              <div key={idx} className={`flex justify-between p-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 last:border-0`}>
                <span className="text-[13px] font-semibold text-slate-700">{fact.label}</span>
                <span className="text-[13px] font-black text-[#001466]">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recommended Use</h2>
              <p className="text-xs font-medium text-slate-500">How to consume</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{data.recommendedUse}</p>
        </div>
      </div>
    </div>
  );
}

function DemoCertificates({ data, onBack }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 font-sans fixed inset-0 z-[200] overflow-y-auto">
      <div className="bg-[#001466] text-white pt-6 pb-4 px-5 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-[16px] font-bold tracking-wide flex-1 text-center pr-6">Certifications & Lab Tests</h1>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-4">
        {data.certificates.map((cert, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                {cert.isLabTest ? <FlaskConical size={20} strokeWidth={2.5} /> : <Award size={20} strokeWidth={2.5} />}
              </div>
              <div className="flex flex-col flex-1">
                <h2 className="text-[15px] font-bold text-slate-900 leading-tight">{cert.name}</h2>
                <span className="text-[11px] text-slate-500 font-medium">Issued by {cert.issuer} • {cert.date}</span>
              </div>
            </div>
            
            <a 
              href="#" onClick={(e) => { e.preventDefault(); alert("Simulating PDF download/view"); }}
              className="group relative block overflow-hidden rounded-xl border border-slate-100 bg-slate-50 aspect-video flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center flex-col gap-2">
                 {cert.isLabTest ? <FileText size={48} className="text-slate-300" /> : <Award size={48} className="text-slate-300" />}
                 <span className="text-slate-400 text-sm font-bold">Tap to View Certificate</span>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  <ExternalLink size={16} className="text-slate-900" />
                  <span className="text-sm font-bold text-slate-900">View Original</span>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoConsumerSupport({ data, onBack }) {
  const waNumber = data.warranty.customerCare.replace(/[^0-9]/g, '');
  
  return (
    <div className="min-h-screen max-h-[100dvh] bg-white font-sans flex flex-col relative overflow-hidden fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex items-center justify-between p-3 bg-white shrink-0 pt-6">
        <button onClick={onBack} className="p-1 -ml-1 text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="text-[16px] font-bold text-[#0B1E36] tracking-tight">Help & Support</h1>
        <div className="w-8" />
      </div>

      <div className="px-5 pt-2 flex-1 flex flex-col pb-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 shrink-0 mt-4">
          <div className="flex-1 max-w-[55%]">
            <h2 className="text-[#0B1E36] text-[18px] font-extrabold leading-[1.2] mb-2">
              We're here to help you!
            </h2>
            <p className="text-slate-500 text-[12px] leading-[1.5] font-medium pr-1">
              Choose your preferred way to reach out. Our support team will get back to you as soon as possible.
            </p>
          </div>
          <div className="w-[110px] h-[110px] shrink-0 bg-blue-50 rounded-full flex items-center justify-center">
             <Headset size={50} className="text-blue-500" />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="text-[#0B1E36] text-[15px] font-bold mb-3">Contact Us</h3>

          <div className="space-y-3">
            <a 
              href={`https://wa.me/${waNumber}`} 
              target="_blank" rel="noreferrer"
              className="flex items-center bg-[#F8FAFC] border border-slate-100 p-4 rounded-2xl active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                <MessageSquare size={22} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-[14px] font-bold text-[#0B1E36] leading-none mb-1">WhatsApp Chat</h4>
                <p className="text-[12px] text-slate-500 font-medium">Fastest response</p>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </a>

            <a 
              href={`mailto:${data.warranty.supportEmail}`}
              className="flex items-center bg-[#F8FAFC] border border-slate-100 p-4 rounded-2xl active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-[#EA4335]/10 text-[#EA4335] flex items-center justify-center shrink-0">
                <Mail size={22} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-[14px] font-bold text-[#0B1E36] leading-none mb-1">Email Support</h4>
                <p className="text-[12px] text-slate-500 font-medium">{data.warranty.supportEmail}</p>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </a>

            <a 
              href={`tel:${waNumber}`}
              className="flex items-center bg-[#F8FAFC] border border-slate-100 p-4 rounded-2xl active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-[#105DE4]/10 text-[#105DE4] flex items-center justify-center shrink-0">
                <Phone size={22} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-[14px] font-bold text-[#0B1E36] leading-none mb-1">Call Us</h4>
                <p className="text-[12px] text-slate-500 font-medium">Mon-Sat, 9AM to 6PM</p>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </a>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-bold text-slate-700 mb-1">Operating Hours</h4>
                <p className="text-[11px] text-slate-500 leading-[1.5]">
                  Our support team is available Monday through Saturday from 9:00 AM to 6:00 PM IST. 
                  Emails sent outside these hours will be addressed on the next business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
