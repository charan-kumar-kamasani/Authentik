import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Calendar, Ticket, ChevronRight, ShieldCheck, ChevronDown, TrendingUp, Package } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import ProductHeader from '../../components/ProductHeader';

export default function Recommendations() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!brandId) return;
      try {
        const storedToken = localStorage.getItem("token");
        const authHeader = storedToken ? (storedToken.startsWith("Bearer ") ? storedToken : `Bearer ${storedToken}`) : null;
        
        const headers = {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        };

        const [brandRes, productsRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/scan/brand/${brandId}`, { headers }),
          fetch(`${API_BASE_URL}/scan/recommendations/${brandId}?page=1&limit=20`, { headers }),
          fetch(`${API_BASE_URL}/scan/user-stats/${brandId}`, { headers })
        ]);

        if (brandRes.ok) {
          const brandData = await brandRes.json();
          setBrand(brandData);
        }
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setUserStats(statsData);
        }
        
        if (productsRes.ok) {
          const resData = await productsRes.json();
          if (resData && Array.isArray(resData.products)) {
            setRecommendations(resData.products);
            setHasMore(resData.currentPage < resData.totalPages);
          } else if (Array.isArray(resData)) {
            setRecommendations(resData);
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [brandId]);

  const loadMore = async () => {
    if (loadingMore || !hasMore || !brandId) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const storedToken = localStorage.getItem("token");
      const authHeader = storedToken ? (storedToken.startsWith("Bearer ") ? storedToken : `Bearer ${storedToken}`) : null;
      
      const headers = {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      };

      const res = await fetch(`${API_BASE_URL}/scan/recommendations/${brandId}?page=${nextPage}&limit=20`, { headers });
      if (res.ok) {
        const resData = await res.json();
        if (resData && Array.isArray(resData.products)) {
          setRecommendations(prev => [...prev, ...resData.products]);
          setPage(resData.currentPage);
          setHasMore(resData.currentPage < resData.totalPages);
        } else if (Array.isArray(resData)) {
          setRecommendations(prev => [...prev, ...resData]);
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const featuredProduct = recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans flex flex-col relative pb-28">
      
      {/* Dynamic Product Header */}
      <ProductHeader 
        onBack={() => navigate(-1)}
        productImage={featuredProduct?.productImage}
        productName={featuredProduct?.productName}
        category={featuredProduct?.category}
        brandLogo={brand?.brandLogo}
        brandName={brand?.brandName || brand?.companyId?.companyName}
        isVerifiedBrand={true}
      />

      {/* Main White Content Card */}
      <div className="flex-1 bg-[#F5F7FA] -mt-6 rounded-t-[24px] relative z-20 flex flex-col gap-3 px-4 pt-6">
        
        {/* Usage & Reorder Row */}
        {userStats?.hasStats && userStats?.usage && (
          <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="24" stroke="#EEF2FF" strokeWidth="6" fill="none" />
                  <circle cx="28" cy="28" r="24" stroke="#105DE4" strokeWidth="6" fill="none" strokeDasharray="150" strokeDashoffset={`${150 - (150 * (userStats.usage.usagePercent / 100))}`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[#105DE4] font-bold text-[12px]">{userStats.usage.usagePercent}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#0B1E36] font-bold text-[14px]">~{userStats.usage.servingsRemaining} Servings Left</span>
                <span className="text-[#5A7184] text-[11px] font-medium mt-0.5">(Out of {userStats.usage.totalServings} Servings)</span>
              </div>
            </div>
            <div className="w-[1px] h-12 bg-gray-100 mx-2"></div>
            <div className="flex flex-col flex-1 pl-2">
              <span className="text-[#5A7184] text-[10px] font-medium mb-1.5">Next Reorder Suggested</span>
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-4 h-4 text-[#105DE4]" strokeWidth={2} />
                <span className="text-[#105DE4] font-bold text-[14px]">
                  {userStats.usage.nextReorderDate ? new Date(userStats.usage.nextReorderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                </span>
              </div>
              {userStats.usage.daysUntilReorder !== null && (
                <span className="text-[#333333] text-[11px] font-medium pl-5">In {userStats.usage.daysUntilReorder} days</span>
              )}
            </div>
          </div>
        )}

        {/* Coupons & Offers */}
        {userStats && (
          <div className="bg-white rounded-[12px] p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#105DE4]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#0B1E36] font-bold text-[13px]">Coupons & Offers</span>
                <span className="text-[#333333] text-[12px] mt-0.5">You have <strong className="text-[#105DE4]">{userStats.couponCount || 0} offers</strong> available</span>
              </div>
            </div>
            <button className="flex items-center gap-1 text-[#105DE4] text-[12px] font-bold bg-[#EEF2FF] px-2 py-1.5 rounded-md">
              View Coupons <ChevronRight className="w-3 h-3" strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Dynamic Products List styled like 'Where to Buy' */}
        <div className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 mt-2">
          <div className="flex flex-col mb-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[#0B1E36] font-bold text-[15px]">Brand Products</h3>
              <div className="bg-[#E8F8F0] text-[#059669] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" strokeWidth={2} /> Authentic Sellers
              </div>
            </div>
            <p className="text-[#5A7184] text-[11px]">Get the best deals from trusted & verified sellers</p>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="py-8 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#105DE4]"></div></div>
            ) : recommendations.length === 0 ? (
              <div className="py-6 text-center text-gray-500 text-xs">No products found.</div>
            ) : (
              recommendations.map((item: any, idx: number) => (
                <div key={item._id || idx} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 max-w-[55%]">
                    <div className="w-10 h-10 border border-gray-100 rounded-lg flex-shrink-0 bg-white p-1 flex items-center justify-center">
                      {item.productImage ? (
                        <img src={item.productImage} className="w-full h-full object-contain" alt="product" />
                      ) : (
                        <span className="font-bold text-gray-400 text-xs">{item.productName?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[#0B1E36] font-bold text-[13px] truncate">{item.productName}</span>
                      </div>
                      <span className="text-[#5A7184] text-[11px] mt-0.5 truncate">{item.category || "Authentic Product"}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                     {item.discount && (
                       <span className="bg-[#E8F8F0] text-[#059669] text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                         {item.discount}
                       </span>
                     )}
                     <div className="flex flex-col items-end min-w-[40px]">
                        {(item.price && item.mrp) ? (
                          <span className="text-[#829AB1] text-[10px] font-medium line-through leading-none mb-0.5">₹{item.mrp}</span>
                        ) : item.oldPrice ? (
                          <span className="text-[#829AB1] text-[10px] font-medium line-through leading-none mb-0.5">{item.oldPrice}</span>
                        ) : null}
                        <span className="text-[#0B1E36] font-extrabold text-[14px] leading-none">
                          {item.price ? `₹${item.price}` : (item.mrp ? `₹${item.mrp}` : '')}
                        </span>
                     </div>
                     <button onClick={() => navigate(`/product/${item._id}`)} className="bg-[#105DE4] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm">
                       View
                     </button>
                  </div>
                </div>
              ))
            )}
            
            {hasMore && (
              <button 
                onClick={loadMore} 
                disabled={loadingMore}
                className="flex items-center justify-center gap-1 text-[#105DE4] font-bold text-[12px] mt-2 w-full p-2 disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : (
                  <>View More Products <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Your Usage Summary */}
        {userStats?.hasStats && userStats?.usage && (
          <div className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 mt-2">
             <h3 className="text-[#0B1E36] font-bold text-[14px] mb-4">Your Usage Summary</h3>
             <div className="flex items-center justify-between px-2">
                <div className="flex flex-col items-center flex-1">
                   <Calendar className="w-6 h-6 text-[#105DE4] mb-2" strokeWidth={1.5} />
                   <span className="text-[#5A7184] text-[10px] font-medium mb-1">Average Usage</span>
                   <span className="text-[#0B1E36] text-[12px] font-bold">{userStats.usage.averageUsagePerWeek} Servings / Week</span>
                </div>
                <div className="w-[1px] h-10 bg-gray-100"></div>
                <div className="flex flex-col items-center flex-1">
                   <TrendingUp className="w-6 h-6 text-[#105DE4] mb-2" strokeWidth={1.5} />
                   <span className="text-[#5A7184] text-[10px] font-medium mb-1">Last Purchased On</span>
                   <span className="text-[#0B1E36] text-[12px] font-bold">
                     {new Date(userStats.usage.lastPurchasedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                   </span>
                </div>
                <div className="w-[1px] h-10 bg-gray-100"></div>
                <div className="flex flex-col items-center flex-1">
                   <Package className="w-6 h-6 text-[#105DE4] mb-2" strokeWidth={1.5} />
                   <span className="text-[#5A7184] text-[10px] font-medium mb-1">Last Quantity</span>
                   <span className="text-[#0B1E36] text-[12px] font-bold">{userStats.usage.lastQuantity}</span>
                </div>
             </div>
          </div>
        )}

        {/* 100% Authentic Guarantee */}
        <div className="bg-[#EEF2FF] rounded-[12px] p-4 flex items-start gap-3 mt-2 border border-[#E0E7FF] mb-6">
          <ShieldCheck className="w-6 h-6 text-[#4F46E5] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <h4 className="text-[#4F46E5] font-bold text-[13px] mb-0.5">100% Authentic Guarantee</h4>
            <p className="text-[#4F46E5]/80 text-[11px] font-medium leading-snug">
              Every reorder is verified and protected by {brand?.brandName || 'the brand'}.
            </p>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-8 z-50">
        <button className="w-full bg-[#105DE4] text-white rounded-xl py-3.5 font-bold text-[15px] shadow-[0_4px_15px_rgba(16,93,228,0.3)] active:scale-[0.98] transition-transform">
          Update & Save Reorder Settings
        </button>
      </div>

    </div>
  );
}
