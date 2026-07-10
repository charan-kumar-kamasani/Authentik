import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Share, ShieldCheck, Leaf, FlaskConical, Sprout, Star, CheckCircle2, ChevronRight, SlidersHorizontal } from "lucide-react";
import ProductRating from '../../components/ProductRating';
import API_BASE_URL from "../../config/api";
import MobileNavbar from "../../components/MobileNavbar";

export default function BrandPortfolio() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brandData, setBrandData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  const [hasMore, setHasMore] = useState(true);
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBrandData = async () => {
      try {
        const brandRes = await fetch(`${API_BASE_URL}/scan/brand/${brandId}`);
        if (brandRes.ok) {
          const bData = await brandRes.json();
          setBrandData(bData);
        }
      } catch (err) {
        console.error("Error fetching brand details:", err);
      }
    };
    if (brandId) {
      fetchBrandData();
    }
  }, [brandId]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (page === 1) setLoading(true);
        const productsRes = await fetch(`${API_BASE_URL}/scan/recommendations/${brandId}?page=${page}&limit=20&sort=${sortOption}`);
        if (productsRes.ok) {
          const pData = await productsRes.json();
          if (page === 1) {
            setProducts(pData.products || []);
          } else {
            setProducts(prev => [...prev, ...(pData.products || [])]);
          }
          setHasMore((pData.products || []).length === 20);
        }
      } catch (err) {
        console.error("Error fetching brand products:", err);
      } finally {
        setLoading(false);
      }
    };
    if (brandId) {
      fetchProducts();
    }
  }, [brandId, page, sortOption]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: brandData?.brandName || 'Brand Portfolio',
          text: `Check out ${brandData?.brandName || 'this brand'} on Authentiks!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#032B77] flex flex-col font-sans pb-[70px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 mt-2">
        <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full text-white active:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-white text-[16px] font-semibold">Brand Portfolio</h1>
        <button onClick={handleShare} className="p-1.5 -mr-1.5 rounded-full text-white active:bg-white/10 transition-colors">
          <Share size={20} />
        </button>
      </div>

      {/* Brand Hero */}
      <div className="px-5 mt-2 flex justify-between items-start">
        <div className="flex items-start gap-4">
          <div className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-sm">
            {brandData?.brandLogo ? (
              <img src={brandData.brandLogo} alt={brandData?.brandName} className="w-full h-full object-contain" />
            ) : (
              <span className="text-[24px] font-bold text-[#032B77]">{brandData?.brandName?.charAt(0) || "B"}</span>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1.5">
              <h2 className="text-white text-[18px] font-bold leading-tight">{brandData?.brandName || "Authentic Brand"}</h2>
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={11} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <p className="text-blue-100 text-[12px] leading-snug mb-3 pr-2">
              {brandData?.industry ? `Premium ${brandData.industry} Brand.` : "Official Authentiks Brand Partner."}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#1A3385] border border-[#2B47A1] rounded-full self-start">
              <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={9} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[9px] font-medium text-white tracking-wide">Verified by Authentiks</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end pt-1">
          {/* Follow button removed */}
        </div>
      </div>

      {/* Generic Trust Badges */}
      <div className="px-4 mt-10 mb-10 flex justify-between items-start text-center">
        <div className="flex flex-col items-center flex-1">
          <div className="w-11 h-11 rounded-full border border-blue-400/30 flex items-center justify-center mb-2">
            <CheckCircle2 size={18} className="text-blue-100 stroke-[1.5]" />
          </div>
          <p className="text-white text-[10px] font-semibold mb-0.5 whitespace-nowrap">Verified Brand</p>
          <p className="text-blue-200/80 text-[9px]">Official Partner</p>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="w-11 h-11 rounded-full border border-blue-400/30 flex items-center justify-center mb-2">
            <ShieldCheck size={18} className="text-blue-100 stroke-[1.5]" />
          </div>
          <p className="text-white text-[10px] font-semibold mb-0.5 whitespace-nowrap">Quality Assured</p>
          <p className="text-blue-200/80 text-[9px]">Tested for safety</p>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="w-11 h-11 rounded-full border border-blue-400/30 flex items-center justify-center mb-2">
            <ShieldCheck size={18} className="text-blue-100 stroke-[1.5]" />
          </div>
          <p className="text-white text-[10px] font-semibold mb-0.5 whitespace-nowrap">100% Authentic</p>
          <p className="text-blue-200/80 text-[9px] leading-tight">Every product<br />verified</p>
        </div>
        <div className="flex flex-col items-center flex-1">
          <div className="w-11 h-11 rounded-full border border-blue-400/30 flex items-center justify-center mb-2">
            <Star size={18} className="text-blue-100 stroke-[1.5]" />
          </div>
          <p className="text-white text-[10px] font-semibold mb-0.5 whitespace-nowrap">Premium Quality</p>
          <p className="text-blue-200/80 text-[9px] leading-tight">Highly rated</p>
        </div>
      </div>

      {/* White Products Container */}
      <div className="flex-1 bg-white rounded-t-[28px] px-5 pt-7 pb-6">
        <div className="flex justify-between items-center mb-6 relative">
          <h3 className="text-[#0B1E36] text-[17px] font-extrabold tracking-tight">All Products ({products.length})</h3>
          <button 
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full shadow-sm border border-slate-100 active:bg-slate-100 transition-colors"
          >
            <span className="text-[13px] font-medium">Sort</span>
            <SlidersHorizontal size={14} className="stroke-[2]" />
          </button>
          
          {showSort && (
            <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
              <button 
                onClick={() => { setSortOption('newest'); setPage(1); setShowSort(false); }}
                className={`w-full text-left px-4 py-2.5 text-[13px] ${sortOption === 'newest' ? 'font-bold text-[#105DE4] bg-blue-50/50' : 'font-medium text-slate-700'}`}
              >
                Newest First
              </button>
              <button 
                onClick={() => { setSortOption('price_low'); setPage(1); setShowSort(false); }}
                className={`w-full text-left px-4 py-2.5 text-[13px] ${sortOption === 'price_low' ? 'font-bold text-[#105DE4] bg-blue-50/50' : 'font-medium text-slate-700'}`}
              >
                Price: Low to High
              </button>
              <button 
                onClick={() => { setSortOption('price_high'); setPage(1); setShowSort(false); }}
                className={`w-full text-left px-4 py-2.5 text-[13px] ${sortOption === 'price_high' ? 'font-bold text-[#105DE4] bg-blue-50/50' : 'font-medium text-slate-700'}`}
              >
                Price: High to Low
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">Loading portfolio...</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">No products found.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {products.map((product, idx) => {
                const catTag = product.category || 'Product';
                const catBg = 'bg-blue-50 text-blue-600';
                const prices = product.orderLinks?.map((l: any) => Number(l.price)).filter((p: number) => !isNaN(p) && p > 0) || [];
                const lowestPrice = prices.length > 0 ? Math.min(...prices) : product.price;
                const displayPrice = lowestPrice || product.mrp || '';
                
                return (
                  <div 
                    key={product._id || idx} 
                    onClick={() => navigate('/product-details', { 
                      state: { 
                        ...product,
                        brand: brandData?.brandName,
                        companyName: brandData?.brandName
                      } 
                    })}
                    className="cursor-pointer rounded-[20px] border border-slate-100 p-2.5 flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.02)] bg-white relative active:opacity-70 transition-opacity"
                  >
                    {/* Image Section */}
                    <div className="bg-[#F8F9FA] rounded-[16px] h-[150px] flex items-center justify-center relative p-4 mb-3">
                      <img 
                        src={product.productImage || "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png"} 
                        alt={product.productName} 
                        className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm" 
                      />
                      {/* Floating Badge (Only show if discount or price is available) */}
                      {product.discount && (
                        <div className="absolute -right-2 -bottom-2 w-[48px] h-[48px] rounded-full bg-blue-50 border-[3.5px] border-white flex flex-col items-center justify-center shadow-sm z-10">
                          <span className="text-[#0B1E36] text-[12px] font-extrabold leading-none">{product.discount}</span>
                          <span className="text-[#105DE4] text-[6.5px] font-bold mt-[1px] tracking-widest uppercase text-center leading-tight">OFF</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Info Section */}
                    <div className="px-1.5 flex flex-col flex-1 pt-1">
                      <div className="flex items-baseline gap-2 mb-1.5">
                        <span className="text-[15px] font-extrabold text-[#0B1E36]">
                          {displayPrice ? `₹${displayPrice}` : ''}
                        </span>
                        {lowestPrice && product.mrp && (
                          <span className="text-[11px] font-semibold text-[#829AB1] line-through">₹{product.mrp}</span>
                        )}
                      </div>
                      <h4 className="text-[#0B1E36] text-[13px] font-extrabold leading-tight mb-1 line-clamp-2">{product.productName}</h4>
                      <p className="text-slate-500 text-[11px] mb-2 leading-snug line-clamp-1">
                        {product.keyBenefits || brandData?.brandName || 'Verified Product'}
                      </p>
                      
                      <div className="mb-2">
                        <span className={`inline-block px-2.5 py-1 ${catBg} text-[9.5px] font-bold rounded-md`}>
                          {catTag}
                        </span>
                      </div>
                      
                      <div className="mt-auto flex items-center gap-1">
                        <ProductRating data={product} variant="single" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-2 mb-8">
                <button 
                  onClick={() => setPage(p => p + 1)} 
                  className="px-6 py-2.5 bg-blue-50 text-[#105DE4] font-bold text-[13px] rounded-full active:opacity-70 transition-opacity"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer Banner */}
        <div className="bg-[#F4F7FF] rounded-[20px] p-4 flex items-center justify-between mb-2 shadow-[0_2px_10px_rgba(16,93,228,0.05)] border border-blue-50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#105DE4] shadow-sm flex items-center justify-center shrink-0">
               <ShieldCheck size={24} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-[#0B1E36] text-[13px] font-extrabold mb-0.5 tracking-tight">Every Product is 100% Authentic</span>
              <span className="text-slate-500 text-[10px] leading-[1.3] pr-2 font-medium">
                All {brandData?.brandName || 'Brand'} products are scanned, verified and protected by Authentiks.
              </span>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-400 shrink-0" />
        </div>
      </div>

      <MobileNavbar />
    </div>
  );
}
