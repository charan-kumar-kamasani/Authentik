import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share, ShieldCheck, ScanLine, Calendar, FileText, ChevronDown, Globe, HeadphonesIcon, ShoppingCart, Bell, CheckCircle2, X, FlaskConical, Award, BookOpen, AlignLeft } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const ProductPassport = () => {
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
        skuNumber: product.skuNumber || order.skuNumber || template.skuNumber || d.skuNumber,
        mrp: product.mrp || order.mrp || template.mrp || d.mrp,
        servingSize: product.servingSize || order.servingSize || template.servingSize || d.servingSize,
        description: product.description || order.description || template.description || d.description,
        dynamicFields: (product.dynamicFields && Object.keys(product.dynamicFields).length > 0) ? product.dynamicFields : ((order.dynamicFields && Object.keys(order.dynamicFields).length > 0) ? order.dynamicFields : template.dynamicFields),
        variants: (product.variants && product.variants.length > 0) ? product.variants : ((order.variants && order.variants.length > 0) ? order.variants : template.variants),
        orderLinks: (product.orderLinks && product.orderLinks.length > 0) ? product.orderLinks : ((order.orderLinks && order.orderLinks.length > 0) ? order.orderLinks : template.orderLinks),
        website: product.website || order.website || template.website || d.website || product.dynamicFields?.website || order.dynamicFields?.website,
        customerCare: product.customerCare || order.customerCare || template.customerCare || d.customerCare || product.dynamicFields?.customerCare || order.dynamicFields?.customerCare || product.warranty?.customerCare || order.warranty?.customerCare,
        supportEmail: product.supportEmail || order.supportEmail || template.supportEmail || d.supportEmail || product.dynamicFields?.supportEmail || order.dynamicFields?.supportEmail || product.warranty?.supportEmail || order.warranty?.supportEmail,
        educationContent: product.educationContent || order.educationContent || template.educationContent || d.educationContent,
        ingredients: product.ingredients || order.ingredients || template.ingredients || d.ingredients,
        certificates: (product.certificates && product.certificates.length > 0) ? product.certificates : ((order.certificates && order.certificates.length > 0) ? order.certificates : (template.certificates || d.certificates)),
      };
    }
    return d;
  }, []);

  const data = React.useMemo(() => normalizeData(rawData), [rawData, normalizeData]);

  const [recommendations, setRecommendations] = useState<any[]>(data?.recommendations || []);
  const [openSection, setOpenSection] = useState<string>('details');
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [priceAlertAmount, setPriceAlertAmount] = useState('');

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
    'Net Weight': data.dynamicFields?.netWeight || data.dynamicFields?.['Net Weight'] || null,
    Category: data.category || null,
    ...mappedDynFields,
    'SKU Number': data.skuNumber || null,
    'MRP': data.mrp || data.dynamicFields?.mrp || null,
    'Serving Size': data.servingSize || data.dynamicFields?.servingSize || data.dynamicFields?.['Serving Size'] || null,
    'Country of Origin': data.countryOfOrigin || null,
    'Manufactured By': data.manufacturedBy || null,
    'Marketed By': data.marketedBy || null,
    'Shelf Life': data.bestBefore?.value ? `${data.bestBefore.value} ${data.bestBefore.unit}` : null,
    'Warranty': data.warranty && (data.warranty.duration || data.warranty.warrantyType) ? `${data.warranty.duration || ''} ${data.warranty.durationUnit || ''} ${data.warranty.warrantyType || ''}`.trim() : null,
    'Storage Instructions': data.dynamicFields?.storageInstructions || data.dynamicFields?.['Storage Instructions'] || null,
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
          <h1 className="text-[15px] font-bold tracking-wide">Product Passport</h1>
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

            <div
              className="flex items-center gap-1.5 mb-1.5 cursor-pointer active:opacity-70 transition-opacity"
              onClick={() => {
                const bId = data.brandId?._id || data.brandId || data.product?.brandId || data.productId?.brandId;
                if (bId) navigate(`/brand-portfolio/${bId}`);
              }}
            >
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

        {/* Product Details Accordion */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden mb-3 mt-3">
          <button
            onClick={() => setOpenSection(openSection === 'details' ? '' : 'details')}
            className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-[#105DE4]" strokeWidth={2} />
              <div className="flex flex-col">
                <h3 className="text-[14px] font-bold text-slate-900 text-left">Product Details</h3>
                <p className="text-[11px] text-slate-500 font-medium">View specifications and details</p>
              </div>
            </div>
            <ChevronRight size={18} className={`text-slate-400 transition-transform duration-300 ${openSection === 'details' ? 'rotate-90' : ''}`} />
          </button>

          {openSection === 'details' && (
            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
              <div className="pt-2 border-t border-slate-50 flex flex-col gap-3.5">
                {filteredDetails.map(([key, value], idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4">
                    <span className="text-[12px] text-slate-500 font-medium whitespace-nowrap">{key}</span>
                    <span className="text-[12px] font-bold text-slate-900 text-right leading-snug">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Links */}
        <div className="flex flex-col gap-3 mb-3">


          {/* Ingredients */}
          {data.ingredients && (
            <button
              onClick={() => navigate('/ingredients', { state: data })}
              className="bg-white rounded-[20px] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-transform text-left"
            >
              <div className="flex items-center gap-3">
                <FlaskConical size={20} className="text-[#105DE4]" strokeWidth={2} />
                <div className="flex flex-col">
                  <h3 className="text-[14px] font-bold text-slate-900">Ingredients</h3>
                  <p className="text-[11px] text-slate-500 font-medium">What goes into this product</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          )}

          {/* Certifications & Lab Tests */}
          {(data.certificates && data.certificates.length > 0) && (
            <button
              onClick={() => navigate('/certificates', { state: data })}
              className="bg-white rounded-[20px] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-transform text-left"
            >
              <div className="flex items-center gap-3">
                <Award size={20} className="text-[#105DE4]" strokeWidth={2} />
                <div className="flex flex-col">
                  <h3 className="text-[14px] font-bold text-slate-900">Certifications & Lab Tests</h3>
                  <p className="text-[11px] text-slate-500 font-medium">View quality reports</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          )}

          {/* Product Education */}
          {(data.educationContent && data.educationContent.length > 0) && (
            <button
              onClick={() => navigate('/product-education', { state: data })}
              className="bg-white rounded-[20px] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-transform text-left"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-[#105DE4]" strokeWidth={2} />
                <div className="flex flex-col">
                  <h3 className="text-[14px] font-bold text-slate-900">Product Education</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Discover how to use this product</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          )}

          {/* Visit Website */}
          {data.website && (
            <button
              onClick={() => window.open(data.website.startsWith('http') ? data.website : `https://${data.website}`, '_blank')}
              className="bg-white rounded-[20px] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-transform text-left"
            >
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-[#105DE4]" strokeWidth={2} />
                <div className="flex flex-col">
                  <h3 className="text-[14px] font-bold text-slate-900">Visit Website</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Learn more about {data.brand || 'the brand'}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          )}

          {/* Description */}
          {(data.productInfo || data.description) && (
            <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
              <button
                onClick={() => setOpenSection(openSection === 'description' ? '' : 'description')}
                className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlignLeft size={20} className="text-[#105DE4]" strokeWidth={2} />
                  <div className="flex flex-col">
                    <h3 className="text-[14px] font-bold text-slate-900 text-left">Description</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Read more about this product</p>
                  </div>
                </div>
                <ChevronRight size={18} className={`text-slate-400 transition-transform duration-300 ${openSection === 'description' ? 'rotate-90' : ''}`} />
              </button>
              {openSection === 'description' && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-2 border-t border-slate-50">
                    <p className="text-[13px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{data.productInfo || data.description}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Support */}
          {(data.customerCare || data.supportEmail) && (
            <button
              onClick={() => navigate('/consumer-support', { state: data })}
              className="bg-white rounded-[20px] p-4 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-transform text-left"
            >
              <div className="flex items-center gap-3">
                <HeadphonesIcon size={20} className="text-[#105DE4]" strokeWidth={2} />
                <div className="flex flex-col">
                  <h3 className="text-[14px] font-bold text-slate-900">Customer Support</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Get help or raise a query</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Quick Actions (Re Order & Price Alert) */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/smart-reorder/${data?.productId?._id || data?.productId || data?.product?._id || data?._id || 'unknown'}`, { state: data })}
            className="flex-1 bg-[#105DE4] rounded-[16px] p-3 text-left active:opacity-80 transition-opacity flex items-center shadow-[0_4px_15px_rgba(16,93,228,0.2)]"
          >
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <ShoppingCart size={16} className="text-white" strokeWidth={2.5} />
                <h4 className="text-[13px] font-bold text-white tracking-wide">Re Order</h4>
              </div>
              <p className="text-[9px] text-blue-100/90 font-medium leading-[1.2]">Never run out of your essentials</p>
            </div>
            <ChevronRight size={16} className="text-white shrink-0 opacity-80" />
          </button>

          <button
            onClick={() => setShowPriceAlert(true)}
            className="flex-1 bg-[#059669] rounded-[16px] p-3 text-left active:opacity-80 transition-opacity flex items-center shadow-[0_4px_15px_rgba(5,150,105,0.2)]"
          >
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Bell size={16} className="text-white" strokeWidth={2.5} />
                <h4 className="text-[13px] font-bold text-white tracking-wide">Price Alert</h4>
              </div>
              <p className="text-[9px] text-emerald-100/90 font-medium leading-[1.2]">Notify me when the price drops</p>
            </div>
            <ChevronRight size={16} className="text-white shrink-0 opacity-80" />
          </button>
        </div>

        {/* Recommendation For You */}
        {recommendations.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[15px] font-bold text-slate-900">Recommendation for You</h3>
              <button
                onClick={() => navigate(`/brand-portfolio/${data.brandId?._id || data.brandId}`)}
                className="text-[12px] font-bold text-[#105DE4] flex items-center gap-0.5"
              >
                View All <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
              {recommendations.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => navigate("/product-details", {
                    state: {
                      ...rec,
                      productName: rec.title || rec.productName,
                      productImage: rec.image || rec.productImage
                    }
                  })}
                  className="snap-start flex-shrink-0 w-[140px] bg-white rounded-[20px] p-3 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="w-full h-[110px] bg-slate-50/80 rounded-[12px] mb-3 relative flex items-center justify-center p-2">
                    <img src={rec.productImage || "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png"} className="w-full h-full object-contain mix-blend-multiply" alt={rec.productName} />
                    {rec.mrp && rec.price && (
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded border border-green-200">{Math.round(((rec.mrp - rec.price) / rec.mrp) * 100)}% OFF</span>
                    )}
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-900 leading-[1.3] mb-1 line-clamp-2">{rec.productName}</h4>
                  <p className="text-[9px] font-medium text-slate-500 mb-2 line-clamp-1">{rec.brand || rec.category}</p>
                  <div className="mt-auto flex items-center gap-1.5">
                    <span className="text-[13px] font-black text-slate-900 leading-none">₹{rec.price || rec.mrp || 0}</span>
                    {rec.mrp && rec.price && <span className="text-[10px] font-medium text-slate-400 line-through leading-none">₹{rec.mrp}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Price Alert Modal */}
      {showPriceAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <div className="relative">
                    <Bell size={24} className="text-[#059669]" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#059669] rounded-full flex items-center justify-center text-[8px] font-bold text-white">₹</div>
                  </div>
                </div>
                <button onClick={() => setShowPriceAlert(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
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

              <div className="bg-emerald-50 rounded-xl p-4 flex gap-3 mb-6 border border-emerald-100">
                <Bell size={20} className="text-[#059669] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-bold text-[#065F46] mb-0.5">We'll monitor all major platforms for you</h4>
                  <p className="text-[11px] text-[#065F46]/80 font-medium leading-relaxed">You'll get notified when the price drops on any of the listed platforms.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (priceAlertAmount) {
                      alert('Price Alert Set Successfully!');
                      setShowPriceAlert(false);
                      setPriceAlertAmount('');
                    }
                  }}
                  className="w-full bg-[#059669] text-white font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Set Price Alert
                </button>
                <button
                  onClick={() => setShowPriceAlert(false)}
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

function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default ProductPassport;
