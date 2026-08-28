import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Share2,
  ShieldCheck,
  Building2,
  Leaf,
  Settings,
  Truck,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  Clock,
  Layers,
  ArrowLeftRight,
  BadgeCheck,
  FileCheck,
  ExternalLink,
  Home as HomeIcon,
  History,
  QrCode,
  Gift,
  Shield,
  Maximize2
} from 'lucide-react';
import ProductImageModal from '../../components/ProductImageModal';

export const isSupplyChainEnabled = (data?: any): boolean => {
  if (!data) return false;

  // 0. Demo QR codes & mock preview
  if (data.isDemo || (typeof data.qrCode === 'string' && data.qrCode.startsWith('DEMO-'))) {
    return true;
  }

  // 1. Check direct supply chain flag or data in payload/product/template
  if (
    data.showSupplyChain ||
    data.supplyChain ||
    data.productId?.supplyChain ||
    data.orderId?.supplyChain ||
    data.templateData?.supplyChain
  ) {
    return true;
  }

  // 2. Check Vite / Process environment variables
  const viteEnv = (import.meta as any).env?.VITE_TEST_SUPPLY_SHOW || (import.meta as any).env?.TEST_SUPPLY_SHOW;
  
  // Extract user phone from localStorage if present
  let userPhone = '';
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      userPhone = String(userInfo.mobile || userInfo.phone || userInfo.phoneNumber || '').trim();
    }
  } catch (e) {
    // Ignore parse error
  }

  const payloadPhone = String(data?.scannedBy || data?.originalScan?.scannedBy || data?.userPhone || '').trim();

  if (viteEnv) {
    const val = String(viteEnv).trim().toLowerCase();
    
    // Explicit boolean or wildcard values
    if (val === 'true' || val === '1' || val === 'yes' || val === 'all') {
      return true;
    }

    // Phone numbers list (e.g. "6301421560,9884139144")
    const allowedPhones = val.split(',').map(p => p.replace(/[^0-9]/g, '').trim()).filter(Boolean);
    if (allowedPhones.length > 0) {
      const cleanUserPhone = userPhone.replace(/[^0-9]/g, '');
      const cleanPayloadPhone = payloadPhone.replace(/[^0-9]/g, '');

      // Check if logged in user's phone or scan payload phone matches allowed numbers
      const isMatched = allowedPhones.some(ap => {
        if (!ap) return false;
        return (cleanUserPhone && (cleanUserPhone.includes(ap) || ap.includes(cleanUserPhone))) ||
               (cleanPayloadPhone && (cleanPayloadPhone.includes(ap) || ap.includes(cleanPayloadPhone)));
      });

      if (isMatched) return true;

      // If user phone is not in localStorage yet, return true if env var exists so test scan previews work out of the box!
      if (!cleanUserPhone && !cleanPayloadPhone) {
        return true;
      }

      return isMatched;
    }

    return true;
  }

  return false;
};

export default function SupplyChain() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as any) || {};
  const [showImageModal, setShowImageModal] = useState(false);

  // Extract real product and order data
  const product = (data.productId && typeof data.productId === 'object') ? data.productId : (data.product || data);
  const order = (product.orderId && typeof product.orderId === 'object') ? product.orderId : (data.orderId && typeof data.orderId === 'object' ? data.orderId : {});
  const template = data.templateData || {};

  // Extract real supply chain object
  const supplyChain = data.supplyChain || product.supplyChain || order.supplyChain || template.supplyChain || {};

  // Real product header details
  const productName = data.productName || product.productName || order.productName || template.productName || 'Product Details';
  const brandName = data.brand || product.brand || order.brand || data.companyName || product.companyName || 'Verified Brand';
  const productImage = data.productImage || product.productImage || order.productImage || template.productImage || (data.images && data.images[0]) || 'https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png';
  const batchNo = supplyChain.batchNumber || data.batchNo || product.batchNo || order.batchNo || 'Standard Batch';
  
  // Format real manufacture date
  const rawMfd = supplyChain.manufacturingDate || data.manufactureDate || product.manufactureDate || order.manufactureDate || (data.mfdOn?.month ? `${data.mfdOn.month}/${data.mfdOn.year || ''}`.trim() : null);
  const manufactureDate = rawMfd || 'Not Specified';

  // Real category / tags
  const categoryTag = data.category || product.category || order.category || template.category || 'Authentik Verified Product';

  // Toggle for Timeline View vs Accordion View
  const [viewMode, setViewMode] = useState<'accordion' | 'timeline'>('accordion');

  // Accordions open state - initialize open for all
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    '01': true,
    '02': true,
    '03': true,
    '04': true,
    '05': true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName} - Supply Chain Traceability`,
          text: `Check out the complete supply chain and authenticity details for ${productName} by ${brandName}.`,
          url: window.location.href,
        });
      } catch (e) {
        console.log('Share error', e);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Helper to filter valid key-value pairs
  const cleanDetails = (items: { label: string; value: any }[]) => {
    return items.filter(
      (item) => item.value !== null && item.value !== undefined && String(item.value).trim() !== ''
    );
  };

  // 1. Manufacturing Details
  const mfgRawDetails = [
    { label: 'Manufacturer Name', value: supplyChain.manufacturerName },
    { label: 'Manufacturing Unit', value: supplyChain.manufacturingUnit },
    { label: 'Manufacturing Location', value: supplyChain.manufacturingLocation },
    { label: 'Manufacturing Date', value: supplyChain.manufacturingDate },
    { label: 'Batch / Lot No.', value: supplyChain.batchNumber || data.batchNo || product.batchNo || order.batchNo },
    { label: 'SKU / Product Code', value: supplyChain.skuCode || data.skuNumber || product.skuNumber || order.skuNumber },
    {
      label: 'Production Quantity',
      value: supplyChain.productionQuantity
        ? `${supplyChain.productionQuantity} ${supplyChain.productionQuantityUnit || 'Units'}`
        : null,
    },
    { label: 'Country of Manufacture', value: supplyChain.countryOfManufacture },
  ];
  const mfgDetails = cleanDetails(mfgRawDetails);

  // 2. Raw Material / Source Details
  const rawMatDetails = cleanDetails([
    { label: 'Raw Material Source', value: supplyChain.rawMaterialSource },
    { label: 'Country of Origin', value: supplyChain.countryOfOrigin },
    { label: 'Supplier Name', value: supplyChain.supplierName },
    { label: 'Certifications', value: supplyChain.certifications },
  ]);

  // 3. Processing & Packaging Details
  const packDetails = cleanDetails([
    { label: 'Processing Facility', value: supplyChain.processingLocation },
    { label: 'Packaging Unit', value: supplyChain.packagingUnit },
    { label: 'Packaging Location', value: supplyChain.packagingLocation },
    { label: 'Packaging Date', value: supplyChain.packagingDate },
    { label: 'Packaging Type', value: supplyChain.packagingType },
    { label: 'Pack Size', value: supplyChain.packSize },
    {
      label: 'Units Packed',
      value: supplyChain.numberOfUnitsPacked
        ? `${supplyChain.numberOfUnitsPacked} ${supplyChain.numberOfUnitsPackedUnit || 'Units'}`
        : null,
    },
  ]);

  // 4. Distribution Details
  const distDetails = cleanDetails([
    { label: 'Dispatch Location', value: supplyChain.dispatchLocation },
    { label: 'Distributor Name', value: supplyChain.distributorName },
    { label: 'Distribution Location', value: supplyChain.distributionLocation },
    { label: 'Mode of Transport', value: supplyChain.modeOfTransport },
    { label: 'Expected Delivery Date', value: supplyChain.expectedDeliveryDate },
    { label: 'Notes', value: supplyChain.notes },
  ]);

  // 5. Supporting Documents / Certificates
  const realDocuments: Array<{ title: string; size: string; docNo?: string; url?: string }> = [];

  // If user uploaded a supporting document in supply chain
  if (supplyChain.supportingDocument) {
    const docUrl = typeof supplyChain.supportingDocument === 'string' ? supplyChain.supportingDocument : (supplyChain.supportingDocument.url || '');
    const docName = supplyChain.supportingDocumentName || (typeof supplyChain.supportingDocument === 'string' ? 'Batch Supporting Document' : (supplyChain.supportingDocument.name || 'Supporting Document'));
    realDocuments.push({
      title: docName,
      size: 'Uploaded Document',
      docNo: 'DOC-' + (batchNo !== 'Standard Batch' ? batchNo : 'VERIFIED'),
      url: docUrl,
    });
  }

  // If product/order/scan has certificates
  const certsList = (Array.isArray(data.certificates) && data.certificates.length > 0)
    ? data.certificates
    : (Array.isArray(product.certificates) && product.certificates.length > 0)
    ? product.certificates
    : (Array.isArray(order.certificates) && order.certificates.length > 0)
    ? order.certificates
    : [];

  certsList.forEach((c: any, i: number) => {
    const certTitle = typeof c === 'string' ? c : (c.name || `Certificate ${i + 1}`);
    const certUrl = typeof c === 'string' ? '' : (c.image || c.url || '');
    realDocuments.push({
      title: certTitle,
      size: 'Verified Certificate',
      docNo: `CERT-0${i + 1}`,
      url: certUrl,
    });
  });

  // Calculate dynamic section list
  const allSections = [
    {
      id: '01',
      title: 'Manufacturing Details',
      subtitle: 'Details about manufacturing facility, production, and batch info.',
      icon: Building2,
      bgColor: 'bg-[#105DE4]',
      iconColor: 'text-white',
      badgeText: mfgDetails.length >= 3 ? 'Completed' : 'Recorded',
      badgeStyle: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      badgeIcon: CheckCircle2,
      hasData: mfgDetails.length > 0,
      details: mfgDetails,
    },
    {
      id: '02',
      title: 'Raw Material / Source Details',
      subtitle: 'Information about ingredients, origin, and suppliers.',
      icon: Leaf,
      bgColor: 'bg-[#10B981]',
      iconColor: 'text-white',
      badgeText: rawMatDetails.length >= 2 ? 'Completed' : 'Recorded',
      badgeStyle: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      badgeIcon: CheckCircle2,
      hasData: rawMatDetails.length > 0,
      details: rawMatDetails,
    },
    {
      id: '03',
      title: 'Processing & Packaging Details',
      subtitle: 'Facility packaging, pack configuration, and dates.',
      icon: Settings,
      bgColor: 'bg-[#8B5CF6]',
      iconColor: 'text-white',
      badgeText: packDetails.length >= 3 ? 'Completed' : 'Recorded',
      badgeStyle: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      badgeIcon: CheckCircle2,
      hasData: packDetails.length > 0,
      details: packDetails,
    },
    {
      id: '04',
      title: 'Distribution Details',
      subtitle: 'Logistics, distributor, and delivery schedule.',
      icon: Truck,
      bgColor: 'bg-[#F97316]',
      iconColor: 'text-white',
      badgeText: distDetails.length >= 3 ? 'Completed' : 'Recorded',
      badgeStyle: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
      badgeIcon: CheckCircle2,
      hasData: distDetails.length > 0,
      details: distDetails,
    },
    {
      id: '05',
      title: 'Supporting Documents & Certificates',
      subtitle: 'Compliance certificates and supporting files.',
      icon: FileText,
      bgColor: 'bg-[#06B6D4]',
      iconColor: 'text-white',
      badgeText: realDocuments.length > 0 ? `${realDocuments.length} Document${realDocuments.length > 1 ? 's' : ''}` : '',
      badgeStyle: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
      badgeIcon: FileCheck,
      hasData: realDocuments.length > 0,
      documents: realDocuments,
    },
  ];

  // ONLY RENDER SECTIONS THAT HAVE ACTUAL DATA (HIDE EMPTY SECTIONS)
  const sections = allSections.filter(s => s.hasData);

  // Dynamic progress calculation
  const completedSectionsCount = sections.length;
  const progressPercentage = completedSectionsCount > 0 ? Math.round((completedSectionsCount / allSections.length) * 100) : 0;
  const lastUpdatedDate = data.scannedAt
    ? new Date(data.scannedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* ================= 1. HEADER SECTION ================= */}
      <div className="relative bg-gradient-to-b from-[#082866] via-[#0D4E96] to-[#0A3A7C] text-white pt-5 pb-12 px-4 overflow-hidden rounded-b-[32px] shadow-xl">
        {/* Subtle background glow graphics */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Navbar Row */}
        <div className="flex items-center justify-between relative z-10 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all border border-white/20"
            aria-label="Go Back"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Shield Badge Icon in Center */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#07255E] border-2 border-blue-400/40 p-1 flex items-center justify-center shadow-lg">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0D4E96] to-[#1D74E3] flex items-center justify-center border border-white/30">
                <Truck size={24} className="text-white" />
              </div>
            </div>
            {/* Verified checkmark badge */}
            <div className="absolute -bottom-0.5 -right-0.5 bg-[#105DE4] text-white rounded-full p-0.5 border-2 border-[#0A3A7C]">
              <CheckCircle2 size={15} className="fill-white text-[#105DE4]" />
            </div>
          </div>

          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all border border-white/20"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Section Pill Badge */}
        <div className="flex justify-center relative z-10 mb-2">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-blue-100 shadow-inner">
            <Layers size={12} className="text-blue-300" />
            TRACEABILITY & SUPPLY CHAIN
          </div>
        </div>

        {/* Page Title & Subtitle */}
        <h1 className="text-2xl font-black text-center text-white tracking-tight relative z-10">
          Supply Chain Details
        </h1>
        <p className="text-xs text-center text-blue-100/80 font-medium mt-1 relative z-10">
          Verified product origin and distribution timeline
        </p>
      </div>

      {/* ================= 2. PRODUCT & BATCH CARD ================= */}
      <div className="px-4 relative z-20 -mt-7">
        <div className="bg-white rounded-3xl p-4 shadow-xl shadow-blue-900/10 border border-slate-100">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Product Info */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setShowImageModal(true)}
                className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm cursor-pointer relative group"
                title="Tap to view full image"
              >
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute('src', 'https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png');
                  }}
                />
                <div className="absolute bottom-0.5 right-0.5 bg-black/50 text-white p-0.5 rounded-full opacity-70 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={9} strokeWidth={2.5} />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-bold text-slate-600">{brandName}</span>
                  <BadgeCheck size={14} className="text-[#105DE4] fill-blue-50" />
                </div>
                <h2 className="text-[17px] font-extrabold text-[#0B1E36] leading-tight">
                  {productName}
                </h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {categoryTag}
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10.5px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  100% Authentic
                </div>
              </div>
            </div>

            {/* Right: Batch Info Box */}
            <div className="bg-[#EEF4FF] border border-[#D4E4FF] rounded-2xl p-3 text-right flex flex-col justify-between shrink-0 min-w-[120px]">
              <div className="flex justify-end mb-1">
                <div className="w-7 h-7 rounded-lg bg-[#105DE4] text-white flex items-center justify-center shadow-xs">
                  <Layers size={14} />
                </div>
              </div>
              <div>
                <span className="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-wider block">Batch No.</span>
                <span className="text-[13px] font-black text-[#0B1E36] block font-mono">{batchNo}</span>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-blue-200/60">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Created On</span>
                <span className="text-[10px] font-bold text-slate-700 block">{manufactureDate}</span>
              </div>
            </div>
          </div>

          {/* Traceability Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11.5px] mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#0B1E36]">
                <ShieldCheck size={15} className="text-[#105DE4]" />
                <span>Traceability Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#105DE4]">
                  {completedSectionsCount > 0 ? `${completedSectionsCount} Stage${completedSectionsCount > 1 ? 's' : ''} Verified` : 'Initiation Pending'}
                </span>
                <span className="text-[10px] text-slate-400">|</span>
                <span className="text-[10.5px] text-slate-500 font-medium">Last Updated: {lastUpdatedDate}</span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className="h-full bg-gradient-to-r from-[#105DE4] to-[#2563EB] rounded-full transition-all duration-1000 shadow-xs"
                style={{ width: `${Math.max(progressPercentage, 10)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. TRACEABILITY SECTIONS ================= */}
      <div className="px-4 mt-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[16px] font-extrabold text-[#0B1E36]">
            {sections.length > 0 ? 'Traceability Sections' : 'Traceability Status'}
          </h3>
          {sections.length > 1 && (
            <button
              onClick={() => setViewMode(viewMode === 'accordion' ? 'timeline' : 'accordion')}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#105DE4] bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl border border-blue-200/60 transition-all active:scale-95"
            >
              <ArrowLeftRight size={13} />
              {viewMode === 'accordion' ? 'View as Timeline' : 'View as List'}
            </button>
          )}
        </div>

        {sections.length === 0 ? (
          /* NO SECTIONS STATE */
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#105DE4] flex items-center justify-center mx-auto mb-3">
              <Layers size={24} />
            </div>
            <h4 className="text-[16px] font-extrabold text-[#0B1E36]">No Supply Chain Records</h4>
            <p className="text-[12.5px] text-slate-500 mt-1 max-w-xs mx-auto">
              Supply chain and tracking details have not been provided for this product batch yet.
            </p>
          </div>
        ) : viewMode === 'accordion' ? (
          /* ACCORDION VIEW MODE */
          <div className="flex flex-col gap-3">
            {sections.map((sec, index) => {
              const Icon = sec.icon;
              const BadgeIcon = sec.badgeIcon;
              const isOpen = openSections[sec.id] !== false;
              const displayIndex = String(index + 1).padStart(2, '0');

              return (
                <div
                  key={sec.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200"
                >
                  {/* Section Header Button */}
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      {/* Icon with Number Badge */}
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-2xl ${sec.bgColor} ${sec.iconColor} flex items-center justify-center shadow-md`}>
                          <Icon size={20} />
                        </div>
                        <span className="absolute -bottom-1 -right-1 bg-white text-[9.5px] font-black text-slate-700 px-1 py-0.2 rounded-md border border-slate-200 shadow-xs">
                          {displayIndex}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-[14px] font-extrabold text-[#0B1E36] leading-snug">
                            {sec.title}
                          </h4>
                        </div>
                        <p className="text-[11.5px] text-slate-500 font-medium leading-tight mt-0.5 line-clamp-1">
                          {sec.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right Badge & Chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2.5 py-1 rounded-full border ${sec.badgeStyle}`}>
                        <BadgeIcon size={12} />
                        {sec.badgeText}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </button>

                  {/* Expandable Accordion Body */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100/80 bg-slate-50/50">
                      {sec.details && sec.details.length > 0 && (
                        <div className="grid grid-cols-1 gap-2.5 mt-2">
                          {sec.details.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100">
                              <span className="text-[12px] font-semibold text-slate-500">{item.label}</span>
                              <span className="text-[12.5px] font-bold text-[#0B1E36] text-right">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Supporting Documents List */}
                      {sec.documents && sec.documents.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2">
                          {sec.documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-100">
                                  <FileText size={18} />
                                </div>
                                <div>
                                  <h5 className="text-[12.5px] font-bold text-[#0B1E36]">{doc.title}</h5>
                                  <p className="text-[10.5px] text-slate-400 font-medium">
                                    {doc.docNo ? `${doc.docNo} • ` : ''}{doc.size}
                                  </p>
                                </div>
                              </div>
                              {doc.url ? (
                                <button
                                  onClick={() => window.open(doc.url, '_blank')}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#105DE4] bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                                >
                                  <ExternalLink size={12} />
                                  View
                                </button>
                              ) : (
                                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                  Verified
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* TIMELINE VIEW MODE */
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#105DE4] before:via-[#10B981] before:to-slate-300">
            {sections.map((sec, index) => {
              const Icon = sec.icon;
              const displayIndex = String(index + 1).padStart(2, '0');
              return (
                <div key={sec.id} className="relative bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="absolute -left-6 top-4 w-6 h-6 rounded-full bg-[#105DE4] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md">
                    {displayIndex}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${sec.bgColor} text-white`}>
                        <Icon size={14} />
                      </div>
                      <h4 className="text-[14px] font-extrabold text-[#0B1E36]">{sec.title}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sec.badgeStyle}`}>
                      {sec.badgeText}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 font-medium mb-3">{sec.subtitle}</p>

                  {sec.details && sec.details.length > 0 ? (
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl text-[11.5px]">
                      {sec.details.slice(0, 4).map((d, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-slate-500 font-medium">{d.label}:</span>
                          <span className="font-bold text-slate-800 text-right">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : sec.documents && sec.documents.length > 0 ? (
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl text-[11.5px]">
                      {sec.documents.map((d, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">{d.title}</span>
                          {d.url ? (
                            <button
                              onClick={() => window.open(d.url, '_blank')}
                              className="text-[#105DE4] font-bold text-[11px] hover:underline"
                            >
                              View
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold text-[10.5px]">Verified</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* ================= 4. SECURITY VERIFICATION BANNER ================= */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#105DE4] text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-[#0B1E36]">
                Authentiks Verified Traceability
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">
                Every supply chain entry is cryptographically linked and logged to ensure authenticity and consumer safety.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 5. BOTTOM NAVIGATION BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 px-6 py-2 z-50 flex items-center justify-around shadow-lg">
        <button onClick={() => navigate('/home')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#105DE4] transition-colors">
          <HomeIcon size={20} />
          <span className="text-[10px] font-semibold">Home</span>
        </button>
        <button onClick={() => navigate('/scan-history')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#105DE4] transition-colors">
          <History size={20} />
          <span className="text-[10px] font-semibold">History</span>
        </button>
        
        {/* Floating Center Scan Button */}
        <button onClick={() => navigate('/scan')} className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-[#0D4E96] to-[#105DE4] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border-4 border-white active:scale-95 transition-transform">
          <QrCode size={22} />
        </button>

        <button onClick={() => navigate('/rewards')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#105DE4] transition-colors">
          <Gift size={20} />
          <span className="text-[10px] font-semibold">Rewards</span>
        </button>
        <button onClick={() => navigate('/warranty')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-[#105DE4] transition-colors">
          <Shield size={20} />
          <span className="text-[10px] font-semibold">Warranty</span>
        </button>
      </div>

      {/* Product Image Full View Lightbox */}
      <ProductImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={productImage}
        productName={productName}
        brand={brandName}
      />
    </div>
  );
}
