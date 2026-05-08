import React from "react";
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
  }
};

function DetailBox({ label, value }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-[16px] flex flex-col justify-center border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <p className="text-[#666] text-[11px] font-bold uppercase tracking-wider mb-1 truncate">{label}</p>
      <p className="text-[#0D4E96] text-[14px] font-bold truncate">{value}</p>
    </div>
  );
}

export default function DemoResult({ code }) {
  const navigate = useNavigate();

  const isFake = code === 'DEMO-FAKE-QR';
  const isDuplicate = code === 'DEMO-DUPLICATE-QR';

  const handleReport = () => {
    navigate('/demo-report', { state: { productName: isFake ? 'Unknown' : DEMO_PRODUCT.productName, qrCode: code } });
  };

  const renderHeader = () => (
    <MobileHeader
      title="Scan Result"
      onLeftClick={() => window.location.href = '/'}
      rightIcon={<div className="w-10" />}
    />
  );

  if (isFake) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
        {renderHeader()}
        <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
          <div className="bg-[#E74C3C] rounded-[16px] shadow-lg text-center text-white p-6 flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
              <img src={fakeIcon} alt="Fake" className="w-10 h-10" />
            </div>
            <h2 className="text-[20px] font-bold uppercase tracking-wide">
              FAKE PRODUCT
            </h2>
            <p className="text-[13px] font-medium leading-tight mt-1 opacity-95">
              Warning! This QR code is not recognized by Authentiks. This product might be counterfeit.
            </p>
          </div>
          
          <button onClick={handleReport} className="w-full bg-[#E74C3C] text-white font-bold text-[18px] py-4 rounded-[30px] shadow-lg mt-6">
            Report Fake Product
          </button>
        </div>
      </div>
    );
  }

  if (isDuplicate) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
        {renderHeader()}
        <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
          <div className="bg-[#FFA808] rounded-[16px] shadow-lg text-center text-white flex flex-col items-center gap-3 pb-6">
            <div className="flex flex-col justify-center items-center gap-2 mt-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <img src={warningIcon} alt="Warning" className="w-10 h-10" />
              </div>
              <h2 className="text-[20px] font-bold uppercase tracking-wide">
                REPEAT SCAN ALERT
              </h2>
            </div>
            <p className="text-[13px] font-medium leading-tight px-4 opacity-95">
              This product has already been scanned and verified earlier.
            </p>
            <div className="w-full bg-white/20 p-4 mt-2">
              <p className="text-[12px] uppercase opacity-80 font-bold mb-1">First Scanned By</p>
              <p className="text-[16px] font-black">98*****123</p>
              <p className="text-[12px] font-medium mt-1">1 Day Ago</p>
              <p className="text-[12px] font-medium">Mumbai, Maharashtra</p>
            </div>
          </div>
          
          <div className="bg-white rounded-[16px] shadow-sm mt-4 p-4">
             <h3 className="text-[#1F2642] font-bold text-[18px] text-center mb-4">{DEMO_PRODUCT.productName}</h3>
             <div className="w-full h-[200px] rounded-xl overflow-hidden mb-4 border">
                <img src={DEMO_PRODUCT.productImage} className="w-full h-full object-contain" />
             </div>
             <p className="text-center text-sm text-gray-500 mb-4">If you just purchased this, it might be a duplicated QR code on a fake product.</p>
             <button onClick={handleReport} className="w-full bg-gradient-to-r from-[#0E5CAB] to-[#1F2642] text-white font-bold text-[16px] py-4 rounded-[30px] shadow-lg">
                Report Issue
             </button>
          </div>
        </div>
      </div>
    );
  }

  // GENUINE
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col items-center">
      {renderHeader()}
      <div className="w-full max-w-md px-4 py-4 flex flex-col pb-24">
        <div className="bg-[#2CA4D6] rounded-t-[16px] p-4 text-center text-white relative shadow-md z-10">
          <div className="flex flex-row justify-center items-center gap-2">
            <div className="bg-white rounded-full">
              <img src={authenticIcon} alt="Authentic" className="w-11 h-11 object-contain m-1" />
            </div>
            <div className="text-left">
              <h2 className="text-[18px] font-bold leading-tight">Authentic Product</h2>
              <p className="text-[12px] opacity-90 font-medium">This product has been verified as genuine</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-b-[16px]">
          <div className="bg-white pb-6 flex flex-col items-center relative gap-3">
            <div className="w-full bg-[#1F2642] py-2 text-center">
              <h3 className="text-white font-bold text-[20px]">{DEMO_PRODUCT.productName}</h3>
            </div>
            <div className="relative h-[220px] w-full rounded-[2rem] overflow-hidden bg-white shadow-2xl border-4 border-white mt-2">
              <img src={DEMO_PRODUCT.productImage} alt={DEMO_PRODUCT.productName} className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="p-4 space-y-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-3">
              <DetailBox label="Brand" value={DEMO_PRODUCT.brand} />
              <DetailBox label="Category" value={DEMO_PRODUCT.category} />
              <DetailBox label="Batch #" value={DEMO_PRODUCT.batchNo} />
              <DetailBox label="Mfd on" value="Feb 2026" />
              <DetailBox label="MRP" value={DEMO_PRODUCT.dynamicFields.mrp} />
              <DetailBox label="Color" value="Black" />
              <DetailBox label="Size" value="10 UK" />
              <DetailBox label="Model / Series" value="Panther" />
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <h4 className="text-[#333] font-bold text-[14px] mb-3 ml-1 uppercase tracking-tight">Additional Info:</h4>
              <div className="bg-white p-5 rounded-[20px] shadow-sm space-y-4 border border-gray-100">
                <p className="text-[#444] text-[14px] font-medium whitespace-pre-wrap leading-relaxed">{DEMO_PRODUCT.description}</p>
                <div className="border-b border-gray-100 pb-3">
                   <p className="text-[#999] text-[11px] font-bold uppercase tracking-wider mb-1">Manufactured By</p>
                   <p className="text-[#0D4E96] text-[14px] font-bold">{DEMO_PRODUCT.dynamicFields.manufacturedBy}</p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                   <p className="text-[#999] text-[11px] font-bold uppercase tracking-wider mb-1">Website</p>
                   <p className="text-[#0D4E96] text-[14px] font-bold">{DEMO_PRODUCT.dynamicFields.website}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button onClick={() => alert('This is a static demo. In the real app, you can submit a review and get a coupon!')} className="w-full bg-gradient-to-r from-[#0E5CAB] to-[#1F2642] text-white font-bold text-[18px] py-4 rounded-[30px] mt-4 shadow-lg active:scale-[0.98] transition-transform">
          Review Product
        </button>
      </div>
    </div>
  );
}
