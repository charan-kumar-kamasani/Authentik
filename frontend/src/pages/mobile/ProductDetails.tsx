import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share, ShieldCheck, Star, ChevronDown, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const ProductDetails = () => {
  const navigate = useNavigate();
  const rawData = useLocation().state as any;

  const normalizeData = React.useCallback((d: any) => {
    if (!d) return null;
    
    // If d.productId is an object, it's a Scan document. Otherwise, d might be a Product or ProductTemplate directly.
    const product = (d.productId && typeof d.productId === 'object') ? d.productId : d;
    const order = product.orderId || {};
    const template = d.templateData || {};
    const orderLinks = (product.orderLinks && product.orderLinks.length > 0) ? product.orderLinks : ((order.orderLinks && order.orderLinks.length > 0) ? order.orderLinks : template.orderLinks);
    const topLinkWithRating = (orderLinks || []).find((l: any) => l.rating);

    return {
      ...d,
      productName: product.productName || order.productName || template.productName || d.productName,
      brand: d.brand || product.brand || order.brand,
      brandId: d.brandId || product.brandId,
      category: product.category || order.category || template.category || d.category,
      productImage: product.productImage || order.productImage || template.productImage || d.productImage,
      productInfo: product.productInfo || order.productInfo || template.productInfo || d.productInfo,
      description: product.description || order.description || template.description || d.description,
      variants: (product.variants && product.variants.length > 0) ? product.variants : ((order.variants && order.variants.length > 0) ? order.variants : template.variants),
      orderLinks,
      rating: product.rating || order.rating || template.rating || d.rating || topLinkWithRating?.rating,
      reviewsCount: product.reviewsCount || order.reviewsCount || template.reviewsCount || d.reviewsCount || topLinkWithRating?.reviewsCount,
      servingSize: product.servingSize || order.servingSize || template.servingSize || d.servingSize || (product.dynamicFields?.['Serving Size']) || (product.dynamicFields?.['servingSize']),
      keyBenefits: product.keyBenefits || order.keyBenefits || template.keyBenefits || d.keyBenefits,
    };
  }, []);

  const data = React.useMemo(() => normalizeData(rawData), [rawData, normalizeData]);
  const [showMoreDesc, setShowMoreDesc] = useState(false);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#001466] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-white text-xl font-bold mb-4">Product Not Found</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white text-[#001466] rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  const variantName = data.variants?.[0]?.value || data.category || 'Standard';
  const category = data.category;
  const rating = data.rating;
  const reviews = data.reviewsCount;

  const desc = data.productInfo || data.description;
  const orderLinks = data.orderLinks && data.orderLinks.length > 0 ? data.orderLinks : [];
  const benefitsList = data.keyBenefits ? data.keyBenefits.split(/[\n,]+/).map((b: string) => b.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[#001466] font-sans overflow-x-hidden pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-2 flex items-center justify-between text-white">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 active:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
        <h1 className="text-[17px] font-bold tracking-wide">Product Details</h1>
        <button className="p-1 -mr-1 active:bg-white/10 rounded-full transition-colors">
          <Share size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="px-5 pt-4 pb-8 flex gap-4 items-center">
        <div className="w-[140px] h-[160px] shrink-0 relative flex items-center justify-center -ml-2">
          {data.productImage ? (
            <img 
              src={data.productImage} 
              alt={data.productName} 
              className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
            />
          ) : (
            <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center text-white/50 text-[10px]">No Image</div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-white text-[13px] font-bold flex items-center gap-1.5">
              {data.companyName && (
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[#001466] font-black text-[10px]">
                  {data.companyName.charAt(0).toUpperCase()}
                </div>
              )}
              {data.brand || data.companyName || 'Product'}
            </span>
            <div className="w-4 h-4 bg-[#105DE4] rounded-full flex items-center justify-center">
              <Check size={10} className="text-white" strokeWidth={3} />
            </div>
          </div>
          
          <h2 className="text-white text-[22px] font-bold leading-[1.1] mb-1 tracking-tight">{data.productName}</h2>
          {variantName && <p className="text-blue-100 text-[13px] font-medium mb-3">{variantName}</p>}
          
          {category && (
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 bg-[#FFE8D6] text-[#E07A25] text-[10px] font-extrabold rounded uppercase tracking-wide">
                {category}
              </span>
            </div>
          )}
          
          {rating && (
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-[#FFC107] fill-[#FFC107]" />
              <span className="text-white text-[14px] font-bold">{rating}</span>
              {reviews && <span className="text-blue-200 text-[11px]">({reviews} Reviews)</span>}
            </div>
          )}
        </div>
      </div>

      {/* Main White Card */}
      <div className="bg-[#F8F9FA] rounded-t-[24px] px-5 pt-6 pb-8 min-h-screen">
        
        {/* Authentiks Banner */}
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
            <SmallFeature icon={<SearchIcon />} label={"Tracked from\nSource"} />
            <SmallFeature icon={<VerifiedIcon />} label={"Third Party\nVerified"} />
            <SmallFeature icon={<QrIcon />} label={"Unique\nIdentity"} />
          </div>
        </div>

        {/* About Section */}
        {desc && (
          <div className="flex justify-between items-start gap-4 mb-6">
            <div className="flex-1">
              <h3 className="text-[#0B1E36] font-bold text-[15px] mb-2.5">About this Product</h3>
              <p className="text-slate-700 text-[13px] leading-[1.6] whitespace-pre-wrap">
                {showMoreDesc ? desc : (desc.length > 100 ? `${desc.slice(0, 100)}...` : desc)}
              </p>
              {desc.length > 100 && (
                <button 
                  onClick={() => setShowMoreDesc(!showMoreDesc)}
                  className="text-[#105DE4] text-[12px] font-bold mt-1 flex items-center gap-0.5"
                >
                  Read {showMoreDesc ? 'Less' : 'More'} <ChevronDown size={14} className={showMoreDesc ? 'rotate-180' : ''} />
                </button>
              )}
            </div>
            {data.servingSize && (
              <div className="w-[100px] shrink-0 bg-blue-50/50 rounded-2xl p-3 flex flex-col items-center justify-center border border-blue-100/50">
                <span className="text-[#0B1E36] text-[16px] font-black leading-none mb-1 text-center">{data.servingSize}</span>
                {category && <span className="text-[#0B1E36] text-[11px] font-bold mb-1 text-center">{category}</span>}
                <span className="text-slate-500 text-[9px] font-medium text-center">Per Serving</span>
              </div>
            )}
          </div>
        )}

        {/* Key Benefits */}
        {benefitsList.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[#0B1E36] font-bold text-[15px] mb-4">Key Benefits</h3>
            <div className="flex justify-start gap-4 items-start overflow-x-auto pb-2 scrollbar-hide">
              {benefitsList.map((benefit: string, idx: number) => (
                <BenefitIcon key={idx} icon={<CheckCircle2 size={20} />} label={benefit} />
              ))}
            </div>
          </div>
        )}

        {/* Where to Buy */}
        {orderLinks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[#0B1E36] font-bold text-[15px] mb-4">Where to Buy</h3>
            <div className="flex flex-col gap-3 mb-3">
              {orderLinks.map((link: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100/50 p-1">
                      {link.siteImage ? (
                        <img src={link.siteImage} alt={link.title} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <div className="w-full h-full rounded-lg flex items-center justify-center text-slate-400 font-black text-[12px]">
                          {link.title?.charAt(0) || 'S'}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[#0B1E36] font-bold text-[13px] leading-none">{link.title}</span>
                      </div>
                      <span className="text-slate-400 text-[10px] font-medium leading-none">Standard Delivery</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end justify-center">
                      {link.price && <span className="text-[#0B1E36] font-black text-[15px] leading-none tracking-tight">₹{link.price}</span>}
                      
                      {/* Show MRP and Discount together below the price */}
                      {(link.mrp || link.discount) && (
                        <div className="flex items-center gap-1 mt-1">
                          {link.mrp && <span className="text-slate-400 text-[10px] font-medium line-through leading-none">₹{link.mrp}</span>}
                          {link.discount && <span className="text-[#16A34A] text-[9px] font-bold leading-none">{link.discount}</span>}
                        </div>
                      )}
                    </div>
                    
                    <a href={link.url || '#'} target="_blank" rel="noreferrer" className="bg-[#105DE4] text-white px-4 py-2 rounded-xl text-[12px] font-bold active:scale-95 transition-transform whitespace-nowrap shadow-[0_4px_12px_rgba(16,93,228,0.25)]">
                      Buy
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 100% Authentic Guarantee Banner */}
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
};

// --- SVG Icons ---
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const VerifiedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);
const QrIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
);

// --- Components ---
const SmallFeature = ({ icon, label }: { icon: any, label: string }) => (
  <div className="flex flex-col items-center flex-1">
    <div className="w-6 h-6 flex items-center justify-center text-[#105DE4] mb-1">
      {icon}
    </div>
    <span className="text-[#0B1E36] text-[7.5px] font-bold leading-[1.2] text-center whitespace-pre-line">
      {label}
    </span>
  </div>
);

const BenefitIcon = ({ icon, label }: { icon: any, label: string }) => (
  <div className="flex flex-col items-center w-[80px] shrink-0">
    <div className="w-11 h-11 rounded-full flex items-center justify-center mb-1.5 text-[#105DE4] bg-blue-50/70 border border-blue-100/50">
      {icon}
    </div>
    <span className="text-[#0B1E36] text-[9px] font-bold leading-[1.2] text-center whitespace-pre-line">
      {label}
    </span>
  </div>
);

export default ProductDetails;
