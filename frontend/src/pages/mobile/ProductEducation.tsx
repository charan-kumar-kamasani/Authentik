import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share, FileText, CheckCircle, CheckCircle2, Smartphone, Globe, HeadphonesIcon, Settings2, Bell, MessageSquare, ShieldCheck, ShoppingCart, Info, Activity, Clock, ScanLine, Calendar, PlayCircle, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import API_BASE_URL from '../../config/api';

const ProductEducation = () => {
  const navigate = useNavigate();
  const rawData = useLocation().state as any;

  // Normalize data in case it comes from ScanHistory (raw MongoDB document) rather than a fresh scan payload
  const normalizeData = React.useCallback((d: any) => {
    if (!d) return null;
    if (d.productId && typeof d.productId === 'object') {
      const product = d.productId;
      const order = product.orderId || {};
      const template = d.templateData || {};
      
      return {
        ...d,
        productName: product.productName || order.productName || template.productName || d.productName,
        brand: d.brand || product.brand || order.brand,
        brandId: d.brandId || product.brandId,
        category: product.category || order.category || template.category || d.category,
        batchNo: product.batchNo || order.batchNo || d.batchNo,
        manufactureDate: product.manufactureDate || order.manufactureDate || d.manufactureDate,
        expiryDate: product.expiryDate || order.expiryDate || d.expiryDate,
        mfdOn: product.mfdOn?.month ? product.mfdOn : (order.mfdOn?.month ? order.mfdOn : d.mfdOn),
        bestBefore: product.bestBefore?.value ? product.bestBefore : (order.bestBefore?.value ? order.bestBefore : template.bestBefore),
        calculatedExpiryDate: product.calculatedExpiryDate || order.calculatedExpiryDate || template.calculatedExpiryDate || d.calculatedExpiryDate,
        productImage: product.productImage || order.productImage || template.productImage || d.productImage,
        manufacturedBy: product.manufacturedBy || order.manufacturedBy || template.manufacturedBy || d.manufacturedBy,
        marketedBy: product.marketedBy || order.marketedBy || template.marketedBy || d.marketedBy,
        countryOfOrigin: product.countryOfOrigin || order.countryOfOrigin || template.countryOfOrigin || d.countryOfOrigin,
        productInfo: product.productInfo || order.productInfo || template.productInfo || d.productInfo,
        description: product.description || order.description || template.description || d.description,
        dynamicFields: (product.dynamicFields && Object.keys(product.dynamicFields).length > 0) ? product.dynamicFields : ((order.dynamicFields && Object.keys(order.dynamicFields).length > 0) ? order.dynamicFields : template.dynamicFields),
        variants: (product.variants && product.variants.length > 0) ? product.variants : ((order.variants && order.variants.length > 0) ? order.variants : template.variants),
        orderLinks: (product.orderLinks && product.orderLinks.length > 0) ? product.orderLinks : ((order.orderLinks && order.orderLinks.length > 0) ? order.orderLinks : template.orderLinks),
        website: product.website || order.website || template.website || d.website,
        customerCare: product.customerCare || order.customerCare || template.customerCare || d.customerCare,
        educationContent: product.educationContent || order.educationContent || template.educationContent || d.educationContent,
      };
    }
    return d;
  }, []);

  const data = React.useMemo(() => normalizeData(rawData), [rawData, normalizeData]);

  const [recommendations, setRecommendations] = useState<any[]>(data?.recommendations || []);
  const [detailsOpen, setDetailsOpen] = useState(true);

  useEffect(() => {
    if ((!data?.recommendations || data.recommendations.length === 0) && (data?.brandId || data?.product?.brandId || data?.productId?.brandId || data?.brandId?._id)) {
      const bId = data.brandId?._id || data.brandId || data.product?.brandId || data.productId?.brandId;
      fetch(`${API_BASE_URL}/scan/recommendations/${bId}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.products) setRecommendations(resData.products.slice(0, 4));
          else if (Array.isArray(resData)) setRecommendations(resData.slice(0, 4));
        })
        .catch(err => console.error("Failed to fetch recommendations:", err));
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#001466] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-white text-xl font-bold mb-4">Passport Not Found</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white text-[#001466] rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  const scanDate = data.scannedAt || data.scanDate || data.createdAt ? new Date(data.scannedAt || data.scanDate || data.createdAt) : null;
  const scanDateStr = scanDate ? `${scanDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}\n${scanDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'N/A';
  
  const mfdDate = data.manufactureDate || (data.mfdOn?.month ? `${data.mfdOn.month}/${data.mfdOn.year}` : 'N/A');
  const expDate = data.expiryDate || data.calculatedExpiryDate || 'N/A';
  const batchNo = data.batchNo || 'N/A';

  // Dynamic Product Details mapping
  const extractVariants = () => {
    if (!data.variants || !Array.isArray(data.variants)) return {};
    return data.variants.reduce((acc: any, v: any) => {
      const key = v.variantLabel || v.variantName || v.name || 'Variant';
      if (v.value) acc[key] = v.value;
      return acc;
    }, {});
  };

  const dynFields = (data.dynamicFields && typeof data.dynamicFields === 'object' && !(data.dynamicFields instanceof Map)) 
    ? data.dynamicFields 
    : ((data.dynamicFields && data.dynamicFields.size > 0) ? Object.fromEntries(data.dynamicFields) : {});

  const mappedDynFields: any = {};
  if (dynFields) {
    Object.keys(dynFields).forEach(key => {
      const label = data.fieldLabels?.[key] || data.fieldLabels?.[key.toLowerCase()] || data.fieldLabels?.[key.toUpperCase()] || key;
      mappedDynFields[label] = dynFields[key];
    });
  }

  const rawDetails = {
    Brand: data.brand || data.companyName,
    'Product Name': data.productName,
    ...extractVariants(),
    Category: data.category || null,
    ...mappedDynFields,
    'Country of Origin': data.countryOfOrigin || null,
    'Manufactured By': data.manufacturedBy || null,
    'Marketed By': data.marketedBy || null,
    'Shelf Life': data.bestBefore?.value ? `${data.bestBefore.value} ${data.bestBefore.unit}` : null,
  };
  const filteredDetails = Object.entries(rawDetails).filter(([_, v]) => v !== undefined && v !== null && v !== '');

  // Mocking usage left for the Reorder widget
  const estimatedDaysTotal = 30; 
  const scanTime = new Date(data.createdAt || Date.now());
  const daysSinceScan = Math.floor((new Date().getTime() - scanTime.getTime()) / (1000 * 3600 * 24));
  const daysLeft = Math.max(0, estimatedDaysTotal - daysSinceScan);
  const percentageLeft = Math.max(0, Math.min(100, Math.round((daysLeft / estimatedDaysTotal) * 100)));

  return (
    <div className="min-h-screen bg-[#F5F7FA] relative pb-24 overflow-x-hidden font-sans">
      {/* Dark Blue Header Section */}
      <div className="bg-[#001466] text-white pt-8 pb-12 px-5 relative">
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-white text-[15px] font-bold tracking-wide">Product Education</h1>
          <button className="p-1 -mr-1 rounded-full hover:bg-white/10 transition-colors">
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
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#1A3385] border border-[#2B47A1] rounded-lg mb-2 self-start">
              <ShieldCheck size={10} className="text-blue-300" />
              <span className="text-[8px] font-bold tracking-wide text-white uppercase">100% Authentic</span>
            </div>
            
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[12px] font-bold tracking-wider text-white flex items-center gap-1.5">
                {data.companyName && (
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[#001466] font-black text-[8px]">
                    {data.companyName.charAt(0).toUpperCase()}
                  </div>
                )}
                {data.companyName || 'Brand'}
              </span>
              <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={10} className="text-white" strokeWidth={3} />
              </div>
            </div>
            
            <h2 className="text-[18px] font-bold leading-[1.1] mb-1 tracking-tight text-white">{data.productName}</h2>
            <p className="text-blue-100/90 text-[12px] mb-2 font-medium">{data.brand || 'Variant'}</p>
            
            <div className="flex flex-wrap gap-2">
              {data.variants?.slice(0, 3).map((v: any, idx: number) => (
                <span key={idx} className="px-2 py-0.5 bg-white text-[#001466] text-[9px] font-bold rounded">
                  {v.value}
                </span>
              ))}
              {!data.variants?.length && data.category && (
                <span className="px-2 py-0.5 bg-white text-[#001466] text-[9px] font-bold rounded">
                  {data.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card (Overlapping) */}
      <div className="px-4 -mt-6 relative z-10 space-y-3">
        
        {/* Tracking Grid */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex justify-between divide-x divide-slate-100">
          <div className="flex flex-col items-center flex-1 px-1">
            <ScanLine size={20} className="text-[#105DE4] mb-2" strokeWidth={1.5} />
            <h4 className="text-[10px] font-bold text-slate-900 mb-1">Scanned On</h4>
            <p className="text-[9px] text-slate-500 font-medium text-center leading-tight whitespace-pre-line">{scanDateStr}</p>
          </div>
          {mfdDate !== 'N/A' && (
            <div className="flex flex-col items-center flex-1 px-1">
              <Calendar size={20} className="text-[#105DE4] mb-2" strokeWidth={1.5} />
              <h4 className="text-[10px] font-bold text-slate-900 mb-1">Mfd On</h4>
              <p className="text-[9px] text-slate-500 font-medium text-center leading-tight">{mfdDate}</p>
            </div>
          )}
          {expDate !== 'N/A' && (
            <div className="flex flex-col items-center flex-1 px-1">
              <Calendar size={20} className="text-[#105DE4] mb-2" strokeWidth={1.5} />
              <h4 className="text-[10px] font-bold text-slate-900 mb-1">Expiry On</h4>
              <p className="text-[9px] text-slate-500 font-medium text-center leading-tight">{expDate}</p>
            </div>
          )}
          {batchNo !== 'N/A' && (
            <div className="flex flex-col items-center flex-1 px-1">
              <ShieldCheck size={20} className="text-[#105DE4] mb-2" strokeWidth={1.5} />
              <h4 className="text-[10px] font-bold text-slate-900 mb-1">Batch No.</h4>
              <p className="text-[9px] text-slate-500 font-medium text-center leading-tight">{batchNo}</p>
            </div>
          )}
        </div>

        {/* Education Content List */}
        <div className="space-y-4 pt-2">
          {(!data.educationContent || data.educationContent.length === 0) ? (
            <div className="bg-white rounded-[20px] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-blue-300" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1">No Resources Found</h3>
              <p className="text-[12px] text-slate-500 font-medium">There are currently no educational resources added for this product.</p>
            </div>
          ) : (
            data.educationContent.map((item: any, idx: number) => {
              const isVideo = item.url?.includes('youtube.com') || item.url?.includes('youtu.be') || item.url?.endsWith('.mp4');
              const isImage = item.url?.match(/\.(jpeg|jpg|gif|png)$/i);
              
              return (
                <div key={idx} className="bg-white rounded-[20px] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex gap-4 items-start relative overflow-hidden group">
                  <div className="w-12 h-12 bg-blue-50/80 rounded-[14px] flex items-center justify-center shrink-0 border border-blue-100/50">
                    {isVideo ? (
                      <PlayCircle size={24} className="text-[#105DE4]" strokeWidth={1.5} />
                    ) : isImage ? (
                      <ImageIcon size={24} className="text-[#105DE4]" strokeWidth={1.5} />
                    ) : (
                      <LinkIcon size={24} className="text-[#105DE4]" strokeWidth={1.5} />
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1 pb-1">
                    <h3 className="text-[14px] font-bold text-slate-900 mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-3">{item.description}</p>
                    )}
                    
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#105DE4] bg-blue-50/50 px-3 py-1.5 rounded-lg w-max"
                      >
                        {isVideo ? 'Watch Video' : isImage ? 'View Image' : 'Open Link'}
                        <ChevronRight size={14} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default ProductEducation;
