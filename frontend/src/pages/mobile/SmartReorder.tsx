import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Share, ShieldCheck, Star, ChevronRight, Check, Tag, Bell, X, CheckCircle2, Copy, Gift } from 'lucide-react';
import ProductHeroHeader from '../../components/ProductHeroHeader';

import API_BASE_URL from '../../config/api';

const SmartReorder = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [priceAlertAmount, setPriceAlertAmount] = useState('');
  const [isPriceAlertSet, setIsPriceAlertSet] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  // Allow passing state directly via location, otherwise fetch
  const location = useLocation();
  const stateData = location.state as any;

  useEffect(() => {
    if (stateData) {
      setRawData(stateData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/scan/smart-reorder/${productId}`);
        const result = await response.json();
        if (response.ok) {
          setRawData(result);
        }
      } catch (err) {
        console.error("Failed to fetch smart reorder data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchData();
  }, [productId, stateData]);

  const normalizeData = React.useCallback((d: any) => {
    if (!d) return null;
    
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
      companyName: d.companyName || product.companyName || order.companyName,
      category: product.category || order.category || template.category || d.category,
      productImage: product.productImage || order.productImage || template.productImage || d.productImage,
      variants: (product.variants && product.variants.length > 0) ? product.variants : ((order.variants && order.variants.length > 0) ? order.variants : template.variants),
      orderLinks: orderLinks.map((link: any) => {
        if (!link.siteImage && template.orderLinks) {
          const tLink = template.orderLinks.find((t: any) => t.title === link.title);
          if (tLink && tLink.siteImage) return { ...link, siteImage: tLink.siteImage };
        }
        return link;
      }),
      rating: product.rating || order.rating || template.rating || d.rating || topLinkWithRating?.rating,
      reviewsCount: product.reviewsCount || order.reviewsCount || template.reviewsCount || d.reviewsCount || topLinkWithRating?.reviewsCount,
    };
  }, []);

  const data = React.useMemo(() => normalizeData(rawData), [rawData, normalizeData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001466] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
  const orderLinks = data.orderLinks && data.orderLinks.length > 0 ? data.orderLinks : [];
  const defaultPrice = orderLinks.find((l: any) => l.price)?.price;
  const defaultMrp = orderLinks.find((l: any) => l.mrp)?.mrp;
  const defaultDiscount = orderLinks.find((l: any) => l.discount)?.discount;

  return (
    <div className="min-h-screen bg-[#001466] font-sans overflow-x-hidden pb-20">
            <ProductHeroHeader title="Smart Re Order" data={data} />

{/* Main White Card */}
      <div className="bg-[#F8F9FA] rounded-t-[24px] px-5 pt-8 pb-8 min-h-screen flex flex-col gap-5">
        
        {/* Coupons Banner */}
        {(() => {
          const couponCode = data.couponCode || data.coupon?.code || data.coupon?.couponCode || data.coupons?.[0]?.code || data.coupons?.[0]?.couponCode || (typeof data.coupon === 'string' ? data.coupon : null);
          if (!couponCode) return null;

          return (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(couponCode || 'SAVE20');
                  setCouponCopied(true);
                  setTimeout(() => setCouponCopied(false), 2000);
                }}
                className="relative overflow-hidden w-full bg-[#7C3AED] text-white rounded-[24px] p-4 flex items-center shadow-[0_8px_25px_rgba(124,58,237,0.25)] active:scale-[0.98] transition-transform"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-flash-shimmer" />
                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-3 relative z-10">
                  <Gift className="w-[20px] h-[20px] text-[#7C3AED]" strokeWidth={2} />
                </div>
                <div className="flex flex-col flex-1 text-left relative z-10">
                  <span className="text-[15px] font-extrabold mb-0.5">Coupons & Offers</span>
                  <span className="text-[11px] font-medium text-purple-100">View exclusive offers and save more</span>
                </div>
                <div className="relative z-10 flex items-center bg-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                  {couponCopied ? (
                    <><span className="text-[11px] font-bold mr-1">Copied!</span> <CheckCircle2 size={14} /></>
                  ) : (
                    <><span className="text-[11px] font-bold mr-1">{couponCode || 'SAVE20'}</span> <Copy size={14} /></>
                  )}
                </div>
              </button>
          );
        })()}

        {/* Price Alert */}
        <button
          onClick={() => setShowPriceAlert(true)}
          className="relative overflow-hidden w-full bg-[#EA580C] text-white rounded-[24px] p-4 flex items-center shadow-[0_8px_25px_rgba(234,88,12,0.25)] active:scale-[0.98] transition-transform"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-flash-shimmer" />
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-3 relative z-10">
            <Bell className="w-[20px] h-[20px] text-[#EA580C]" strokeWidth={2} />
          </div>
          <div className="flex flex-col flex-1 text-left relative z-10">
            <span className="text-[15px] font-extrabold mb-0.5">Price Alert</span>
            <span className="text-[11px] font-medium text-orange-100">Notify me when the price drops</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 relative z-10" />
        </button>

        {/* Where to Buy */}
        {orderLinks.length > 0 && (
          <div className="mt-2">
            <h3 className="text-[#0B1E36] font-bold text-[16px] mb-4">All Prices</h3>
            <div className="flex flex-col gap-3">
              {(() => {
                const allPrices = orderLinks.map((l: any) => Number(l.price || defaultPrice)).filter((p: number) => !isNaN(p) && p > 0);
                const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
                
                return orderLinks.map((link: any, idx: number) => {
                  const displayPrice = link.price || defaultPrice;
                  const displayMrp = link.price ? link.mrp : defaultMrp;
                  const displayDiscount = link.price ? link.discount : defaultDiscount;
                  const isLowestPrice = minPrice !== null && Number(displayPrice) === minPrice;
                  
                  return (
                  <div key={idx} className={`bg-white rounded-2xl flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)] border overflow-hidden transition-all relative ${isLowestPrice ? 'border-[#059669]/40 ring-1 ring-[#059669]/10 shadow-[0_4px_15px_rgba(5,150,105,0.08)]' : 'border-slate-50'}`}>
                    {isLowestPrice && (
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-[#059669] to-[#10B981] text-white text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-br-xl shadow-sm z-10 flex items-center gap-1">
                        <span className="relative flex h-1 w-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1 w-1 bg-white"></span>
                        </span>
                        Lowest Price
                      </div>
                    )}
                    <div className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100/50 p-1.5">
                          {link.siteImage ? (
                            <img src={link.siteImage} alt={link.title} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <div className="w-full h-full rounded-lg flex items-center justify-center text-slate-400 font-black text-[14px]">
                              {link.title?.charAt(0) || 'S'}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[#0B1E36] font-bold text-[14px] leading-none">{link.title}</span>
                          </div>
                          <span className="text-slate-400 text-[11px] font-medium leading-none">Standard Delivery</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end justify-center">
                          {displayPrice && <span className="text-[#0B1E36] font-black text-[16px] leading-none tracking-tight">₹{displayPrice}</span>}
                          
                          {/* Show MRP and Discount together below the price */}
                          {(displayMrp || displayDiscount) && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {displayMrp && <span className="text-slate-400 text-[11px] font-medium line-through leading-none">₹{displayMrp}</span>}
                              {displayDiscount && <span className="text-[#16A34A] text-[10px] font-bold leading-none">{displayDiscount}</span>}
                            </div>
                          )}
                        </div>
                        
                        <a href={link.url || '#'} target="_blank" rel="noreferrer" className="bg-[#105DE4] text-white px-4 py-2 rounded-xl text-[13px] font-bold active:scale-95 transition-transform whitespace-nowrap shadow-[0_4px_12px_rgba(16,93,228,0.25)]">
                          Buy
                        </a>
                      </div>
                    </div>
                  </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* 100% Authentic Guarantee Banner */}
        <div className="bg-[#F0F5FF] border border-[#D5E3FF] rounded-2xl p-4 flex items-center justify-between mt-2 active:opacity-70 transition-opacity cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#105DE4] rounded-xl flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(16,93,228,0.2)]">
              <ShieldCheck size={24} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[#0B1E36] font-bold text-[14px] leading-tight mb-1">100% Authentic Guarantee</h4>
              <p className="text-slate-500 text-[12px] font-medium leading-tight">This product is verified and protected.</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>

      </div>

      {/* Price Alert Modal */}
      {showPriceAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <div className="relative">
                    <Bell size={24} className="text-[#EA580C]" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#EA580C] rounded-full flex items-center justify-center text-[8px] font-bold text-white">₹</div>
                  </div>
                </div>
                <button onClick={() => { setShowPriceAlert(false); setIsPriceAlertSet(false); }} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-900 text-center mb-1">Price Alert</h3>
              <p className="text-sm text-slate-500 text-center font-medium mb-6">Get notified when the price drops</p>

              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-800 mb-2">Notify me when price is</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-xl font-medium text-slate-400">₹</span>
                  </div>
                  <input
                    type="number"
                    value={priceAlertAmount}
                    onChange={(e) => setPriceAlertAmount(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 text-xl font-bold text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-[#105DE4] transition-colors"
                    placeholder="1,299"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-[#105DE4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-2">You will be notified when the price is equal to or less than this price.</p>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 flex gap-3 mb-6 border border-orange-100">
                <Bell size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-bold text-[#9A3412] mb-0.5">We'll monitor all major platforms for you</h4>
                  <p className="text-[11px] text-[#9A3412]/80 font-medium leading-relaxed">You'll get notified when the price drops on any of the listed platforms.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={async () => {
                    if (priceAlertAmount) {
                      try {
                        await fetch(`${API_BASE_URL}/api/price-alert`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            productId: data?.productId?._id || data?._id || productId,
                            targetPrice: priceAlertAmount
                          })
                        });
                      } catch (e) {
                        console.error('Failed to save price alert:', e);
                      }
                      setIsPriceAlertSet(true);
                      setShowPriceAlert(false);
                      alert('Price Alert Set Successfully!');
                    }
                  }}
                  className="w-full bg-[#EA580C] text-white font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Set Price Alert
                </button>
                <button
                  onClick={() => { setShowPriceAlert(false); setIsPriceAlertSet(false); }}
                  className="w-full text-slate-500 font-bold py-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartReorder;
