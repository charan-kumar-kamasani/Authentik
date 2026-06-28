import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Calendar, Box, Tag, ArrowRight, ShieldCheck, ChevronDown, CheckCircle2 } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const SmartReorder = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAllLinks, setShowAllLinks] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/scan/smart-reorder/${productId}`);
        const result = await response.json();
        if (response.ok) {
          setData(result);
        }
      } catch (err) {
        console.error("Failed to fetch smart reorder data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchData();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001b79] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#001b79] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-white text-xl font-bold mb-4">Product Not Found</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white text-[#001b79] rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  // Parse Usage Data dynamically from dynamicFields
  const dyn = data.dynamicFields || {};
  
  // Try to find fields like Total Servings, Quantity, Capacity
  const getDynamicValue = (keywords: string[]) => {
    const key = Object.keys(dyn).find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
    return key ? dyn[key] : null;
  };

  const totalCapacity = getDynamicValue(['serving', 'quantity', 'capacity', 'weight']) || '1 Unit';
  
  // Calculate a generic usage if we don't have real usage data
  // (In a real app, this would come from a backend usage tracker)
  const scanDate = new Date(data.createdAt);
  const now = new Date();
  const daysSinceScan = Math.floor((now.getTime() - scanDate.getTime()) / (1000 * 3600 * 24));
  
  // Mocking usage left based on days since scan (just for visual representation of dynamic data)
  const estimatedDaysTotal = 30; // Assume 1 month life
  const daysLeft = Math.max(0, estimatedDaysTotal - daysSinceScan);
  const percentageLeft = Math.round((daysLeft / estimatedDaysTotal) * 100);

  const nextReorderDate = new Date(now.getTime() + daysLeft * 24 * 60 * 60 * 1000);

  const displayedLinks = showAllLinks ? data.orderLinks : data.orderLinks?.slice(0, 3);

  const calculateDiscount = (mrp: any, price: any) => {
    if (!mrp || !price || mrp <= price) return null;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24 overflow-x-hidden">
      {/* Dark Blue Header Section */}
      <div className="bg-[#001b79] text-white pt-12 pb-32 px-5 relative rounded-b-[2.5rem]">
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-lg font-semibold tracking-wide">Smart Reorder</h1>
          <button className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors">
            <Info size={24} />
          </button>
        </div>

        {/* Product Header Content */}
        <div className="flex gap-5 items-start">
          <div className="w-28 h-36 flex-shrink-0 bg-white/10 rounded-2xl p-2 relative">
            <img 
              src={data.productImage || "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png"} 
              alt={data.productName} 
              className="w-full h-full object-contain rounded-xl drop-shadow-2xl"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1.5 text-blue-200">
              {data.companyName && <span className="text-sm font-semibold tracking-wider">{data.companyName}</span>}
              <CheckCircle2 size={14} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold leading-tight mb-1">{data.productName}</h2>
            <p className="text-blue-200 text-sm mb-4">{data.brand || data.category}</p>
            
            <div className="flex flex-wrap gap-2">
              {data.variants?.slice(0, 3).map((v: any, idx: number) => (
                <span key={idx} className="px-2.5 py-1 bg-white text-[#001b79] text-[10px] font-black uppercase tracking-wider rounded-md">
                  {v.value}
                </span>
              ))}
              {!data.variants?.length && (
                <span className="px-2.5 py-1 bg-white text-[#001b79] text-[10px] font-black uppercase tracking-wider rounded-md">
                  {totalCapacity}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card (Overlapping) */}
      <div className="px-4 -mt-24 relative z-10">
        
        {/* Usage Stats Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex divide-x divide-slate-100 mb-4">
          <div className="flex-1 pr-4 flex flex-col items-center text-center">
            <h3 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Usage Left</h3>
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-600 transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray={`${percentageLeft}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-800">{percentageLeft}%</span>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">~{daysLeft} Days Left</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">(Based on avg usage)</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 pl-4 flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Next Reorder Suggested</h3>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Calendar size={18} />
              <span className="text-sm font-bold">
                {nextReorderDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">In {daysLeft} days</p>
          </div>
        </div>

        {/* Coupons Banner */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Tag size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Coupons & Offers</h4>
              <p className="text-xs text-slate-500 font-medium">Auto-applied at checkout</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-sm font-semibold text-blue-600">
            View <ChevronRight size={16} />
          </button>
        </div>

        {/* Where to Buy Section */}
        {data.orderLinks && data.orderLinks.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Where to Buy</h3>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
                  <ShieldCheck size={12} /> Authentic Sellers
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {displayedLinks.map((link: any, idx: number) => {
                const discount = calculateDiscount(data.mrp, data.price);
                const isBrandStore = link.title.toLowerCase().includes(data.brand?.toLowerCase() || 'official');
                
                return (
                  <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {/* Mock logo based on name */}
                        {link.title.toLowerCase().includes('amazon') ? (
                          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="w-8 object-contain" />
                        ) : link.title.toLowerCase().includes('flipkart') ? (
                          <img src="https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg" alt="Flipkart" className="w-6 object-contain" />
                        ) : (
                          <Box size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{link.title}</h4>
                          {isBrandStore && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase rounded">Official</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Delivered in 2-4 days</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {discount && (
                          <div className="flex items-center gap-1.5 justify-end mb-0.5">
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 rounded">{discount}% OFF</span>
                            <span className="text-[11px] text-slate-400 line-through font-medium">₹{data.mrp}</span>
                          </div>
                        )}
                        <p className="text-sm font-black text-slate-900">₹{data.price || data.mrp || 'Check'}</p>
                      </div>
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
                      >
                        Buy Now
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {data.orderLinks.length > 3 && (
              <button 
                onClick={() => setShowAllLinks(!showAllLinks)}
                className="w-full mt-4 py-2 flex items-center justify-center gap-1 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              >
                {showAllLinks ? 'View Less' : 'View More Platforms'}
                <ChevronDown size={16} className={`transform transition-transform ${showAllLinks ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Usage Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Your Usage Summary</h3>
          <div className="flex items-center justify-between text-center divide-x divide-slate-100">
            <div className="flex-1 px-2 flex flex-col items-center">
              <Calendar size={18} className="text-blue-500 mb-2" />
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Purchased</p>
              <p className="text-xs font-bold text-slate-800">{scanDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="flex-1 px-2 flex flex-col items-center">
              <Box size={18} className="text-blue-500 mb-2" />
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Quantity</p>
              <p className="text-xs font-bold text-slate-800">1 x {totalCapacity}</p>
            </div>
          </div>
        </div>

        {/* Authentic Guarantee */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <ShieldCheck size={24} className="text-blue-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-0.5">100% Authentic Guarantee</h4>
            <p className="text-xs text-blue-700/80 font-medium">Every reorder from our authorized sellers is verified and protected by {data.companyName || 'Authentiks'}.</p>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50 pb-safe">
        <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-[0.98]">
          Update & Save Reorder Settings
        </button>
      </div>

    </div>
  );
};

export default SmartReorder;

// ChevronRight Component (Inline since lucide-react might not have it imported above)
function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
