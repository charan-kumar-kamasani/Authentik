import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Share, ShieldCheck, CheckCircle2, Star } from 'lucide-react';

interface ProductHeroHeaderProps {
  title: string;
  data: any;
  onBack?: () => void;
  onShare?: () => void;
}

const ProductHeroHeader: React.FC<ProductHeroHeaderProps> = ({ title, data, onBack, onShare }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      if (navigator.share) {
        navigator.share({
          title: data?.productName || "Authentik Product",
          text: `Check out this verified authentic product: ${data?.productName}`,
          url: window.location.href,
        }).catch(err => console.log(err));
      }
    }
  };

  if (!data) return null;

  return (
    <div className="bg-[#001466] text-white pt-8 pb-12 px-5 relative">
      {/* Top Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handleBack} className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-[15px] font-bold tracking-wide">{title}</h1>
        <button onClick={handleShare} className="p-1 -mr-1 rounded-full hover:bg-white/10 transition-colors">
          <Share size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Product Header Content */}
      <div className="flex gap-4 items-center mb-4">
        <div className="w-[120px] h-[140px] flex-shrink-0 relative flex items-center justify-center bg-transparent -ml-2">
          <img
            src={data.productImage || "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png"}
            alt={data.productName}
            className="w-full h-full object-contain drop-shadow-2xl mix-blend-normal"
          />
        </div>
        <div className="flex flex-col flex-1 pt-0">
         

          <div
            className="flex items-center gap-1.5 mb-1.5 cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => {
              const bId = data.brandId?._id || data.brandId || data.product?.brandId || data.productId?.brandId;
              if (bId) navigate(`/brand-portfolio/${bId}`);
            }}
          >
            <span className="text-[12px] font-bold tracking-wider text-white flex items-center gap-1.5">
              {data.brand && (
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[#001466] font-black text-[8px]">
                  {data.brand.charAt(0).toUpperCase()}
                </div>
              )}
              {data.brand || 'Brand'}
            </span>
          </div>

          <h2 className="text-[18px] font-bold leading-[1.1] mb-1.5 tracking-tight text-white">{data.productName}</h2>
          
          {(() => {
            const rating = data.rating || data.product?.rating || data.orderLinks?.[0]?.rating || data.product?.orderLinks?.[0]?.rating;
            const reviewsCount = data.reviewsCount || data.product?.reviewsCount || data.orderLinks?.[0]?.reviewsCount || data.product?.orderLinks?.[0]?.reviewsCount;
            
            if (!rating) return null;
            
            return (
              <div className="flex items-center gap-1 mb-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={12} className={star <= Math.round(rating) ? "fill-[#FFD700] text-[#FFD700]" : "fill-white/20 text-white/20"} />
                  ))}
                </div>
                <span className="text-[11px] text-white/90 font-medium ml-1">
                  {rating} {reviewsCount && <span className="opacity-70">({reviewsCount})</span>}
                </span>
              </div>
            );
          })()}

          <div className="flex flex-wrap gap-2">
            {data.variants
              ?.map((v: any) => v.value || (v.options && v.options.length > 0 ? v.options[0] : null) || v.variantName)
              .filter(Boolean)
              .slice(0, 3)
              .map((val: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 bg-white text-[#001466] text-[9px] font-bold rounded">
                  {val}
                </span>
            ))}
            {(!data.variants?.length || !data.variants.some((v: any) => v.value || (v.options && v.options.length > 0) || v.variantName)) && data.category && (
              <span className="px-2 py-0.5 bg-white text-[#001466] text-[9px] font-bold rounded">
                {data.category}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeroHeader;
