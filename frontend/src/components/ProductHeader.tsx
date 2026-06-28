import React from 'react';
import { ChevronLeft, Info, ShieldCheck } from 'lucide-react';

export interface ProductHeaderProps {
  pageTitle?: string;
  onBack?: () => void;
  onInfo?: () => void;
  productImage?: string;
  productName?: string;
  category?: string;
  brandLogo?: string;
  brandName?: string;
  isVerifiedBrand?: boolean;
  tags?: { label: string; bgColor: string; textColor: string }[];
}

export default function ProductHeader({
  pageTitle = "Smart Reorder",
  onBack,
  onInfo,
  productImage,
  productName,
  category,
  brandLogo,
  brandName,
  isVerifiedBrand = true,
  tags = []
}: ProductHeaderProps) {
  return (
    <div className="bg-[#021030] pt-12 pb-16 relative overflow-hidden">
      
      {/* Background gradient/glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

      {/* Top Nav */}
      <div className="px-5 flex items-center justify-between mb-6 relative z-10">
        <button onClick={onBack} className="p-1 -ml-1 text-white">
          <ChevronLeft className="w-7 h-7" strokeWidth={2} />
        </button>
        <h1 className="text-[16px] font-medium text-white">{pageTitle}</h1>
        <button onClick={onInfo} className="p-1 -mr-1 text-white">
          <Info className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* Header Content */}
      <div className="px-5 flex items-center gap-4 relative z-10">
        {/* Left: Product Image */}
        <div className="w-[140px] h-[160px] relative flex-shrink-0 flex items-center justify-center -ml-2">
          <div className="w-[120px] h-[140px] bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg relative transform rotate-[-2deg] overflow-hidden flex items-center justify-center bg-white p-2">
              {productImage ? (
                <img src={productImage} alt={productName} className="w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-orange-400 to-orange-600">
                   <span className="font-black text-2xl tracking-tighter leading-none mt-4">PLANT</span>
                   <span className="font-black text-2xl tracking-tighter leading-none">PROTEIN</span>
                </div>
              )}
          </div>
        </div>
        
        {/* Right: Product Info */}
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            {brandLogo && (
              <img src={brandLogo} className="w-6 h-6 bg-white rounded-md object-contain p-0.5" alt="logo" />
            )}
            <span className="text-white text-[13px] font-medium truncate">{brandName || "Brand Details"}</span>
            {isVerifiedBrand && (
              <ShieldCheck className="w-4 h-4 text-[#3b82f6] fill-[#3b82f6] stroke-white flex-shrink-0" strokeWidth={1} />
            )}
          </div>
          <h2 className="text-white text-[20px] font-bold leading-tight mb-1 line-clamp-2">
            {productName || "Product Name"}
          </h2>
          <p className="text-white/80 text-[13px] font-medium mb-3 truncate">
            {category || "Premium Quality"}
          </p>
          
          {/* Tags */}
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span key={idx} className={`text-[10px] font-bold px-2 py-1 rounded`} style={{ backgroundColor: tag.bgColor, color: tag.textColor }}>
                  {tag.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <span className="bg-white text-[#059669] text-[10px] font-bold px-2 py-1 rounded">Verified</span>
              <span className="bg-white text-[#105DE4] text-[10px] font-bold px-2 py-1 rounded">Authentic</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
