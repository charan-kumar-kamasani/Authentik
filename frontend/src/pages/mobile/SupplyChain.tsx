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
  Shield
} from 'lucide-react';

export const isSupplyChainEnabled = (data?: any): boolean => {
  // 1. Check Vite / Process environment variables
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

  // 2. Check data payload flag from backend
  if (data?.showSupplyChain || data?.supplyChain) {
    return true;
  }

  return false;
};

export default function SupplyChain() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as any) || {};

  // Extract or fallback product & supply chain info
  const product = (data.productId && typeof data.productId === 'object') ? data.productId : data;
  const supplyChain = data.supplyChain || product.supplyChain || product.orderId?.supplyChain || {};

  const productName = data.productName || product.productName || 'Thandai';
  const brandName = data.brand || product.brand || 'Gulabs';
  const productImage = data.productImage || product.productImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
  const batchNo = supplyChain.batchNumber || data.batchNo || product.batchNo || '827278287';
  const manufactureDate = supplyChain.manufacturingDate || data.manufactureDate || product.manufactureDate || '15 Aug 2026, 08:30 AM';
  const categoryTag = data.category || product.category || 'Natural • Traditional • Refreshing';

  // Toggle for Timeline View vs Accordion View
  const [viewMode, setViewMode] = useState<'accordion' | 'timeline'>('accordion');

  // Accordions open state
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    '01': true,
    '02': false,
    '03': false,
    '04': false,
    '05': false,
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

  // 5 Main Supply Chain Sections Data
  const sections = [
    {
      id: '01',
      title: 'Manufacturing Details',
      subtitle: 'Details about manufacturing facility and production.',
      icon: Building2,
      bgColor: 'bg-[#105DE4]',
      iconColor: 'text-white',
      badgeText: 'Completed',
      badgeStyle: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      badgeIcon: CheckCircle2,
      details: [
        { label: 'Manufacturer Name', value: supplyChain.manufacturerName || `${brandName} Foods Pvt. Ltd.` },
        { label: 'Manufacturing Unit', value: supplyChain.manufacturingUnit || 'Unit 2 - Beverage & Dairy Facility' },
        { label: 'Location', value: supplyChain.manufacturingLocation || 'Jaipur, Rajasthan, India' },
        { label: 'Manufacturing Date', value: supplyChain.manufacturingDate || '15 Aug 2026' },
        { label: 'Batch / Lot No.', value: supplyChain.batchNumber || batchNo },
        { label: 'SKU / Product Code', value: supplyChain.skuCode || 'GLB-THN-500ML' },
        { label: 'Production Quantity', value: supplyChain.productionQuantity ? `${supplyChain.productionQuantity} ${supplyChain.productionQuantityUnit || 'Units'}` : '10,000 Bottles' },
        { label: 'Country of Manufacture', value: supplyChain.countryOfManufacture || 'India' },
      ],
    },
    {
      id: '02',
      title: 'Raw Material / Source Details',
      subtitle: 'Information about raw materials and their sources.',
      icon: Leaf,
      bgColor: 'bg-[#10B981]',
      iconColor: 'text-white',
      badgeText: 'Completed',
      badgeStyle: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      badgeIcon: CheckCircle2,
      details: [
        { label: 'Primary Ingredients Source', value: supplyChain.rawMaterialSource || 'Organic Farms - Almonds, Saffron & Cardamom' },
        { label: 'Country of Origin', value: supplyChain.countryOfOrigin || 'India' },
        { label: 'Supplier Name', value: supplyChain.supplierName || 'Apex Organic Sourcing Co.' },
        { label: 'Certifications', value: supplyChain.certifications || 'FSSAI Certified, NOP Organic Certified' },
      ],
    },
    {
      id: '03',
      title: 'Processing & Packaging Details',
      subtitle: 'Details of processing, quality checks and packaging.',
      icon: Settings,
      bgColor: 'bg-[#8B5CF6]',
      iconColor: 'text-white',
      badgeText: 'In Progress',
      badgeStyle: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
      badgeIcon: Clock,
      details: [
        { label: 'Processing Facility', value: supplyChain.processingLocation || 'Automated Sterilization & Blending Line 4' },
        { label: 'Packaging Unit', value: supplyChain.packagingUnit || 'Jaipur Bottling Plant' },
        { label: 'Packaging Location', value: supplyChain.packagingLocation || 'Jaipur, Rajasthan' },
        { label: 'Packaging Date', value: supplyChain.packagingDate || '16 Aug 2026' },
        { label: 'Packaging Type', value: supplyChain.packagingType || 'Glass Bottle (100% Recyclable)' },
        { label: 'Pack Size', value: supplyChain.packSize || '500 ml' },
        { label: 'Units Packed', value: supplyChain.numberOfUnitsPacked ? `${supplyChain.numberOfUnitsPacked} ${supplyChain.numberOfUnitsPackedUnit || 'Units'}` : '10,000 Bottles' },
      ],
    },
    {
      id: '04',
      title: 'Distribution Details',
      subtitle: 'Information about dispatch, logistics and delivery.',
      icon: Truck,
      bgColor: 'bg-[#F97316]',
      iconColor: 'text-white',
      badgeText: 'Partially Complete',
      badgeStyle: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
      badgeIcon: Clock,
      details: [
        { label: 'Dispatch Location', value: supplyChain.dispatchLocation || 'Central Logistics Warehouse, Jaipur' },
        { label: 'Distributor Name', value: supplyChain.distributorName || 'Authentik Express Logistics' },
        { label: 'Distribution Region', value: supplyChain.distributionLocation || 'North & Central India' },
        { label: 'Transport Mode', value: supplyChain.modeOfTransport || 'Cold Chain Express Truck' },
        { label: 'Expected Delivery Date', value: supplyChain.expectedDeliveryDate || '20 Aug 2026' },
        { label: 'Notes', value: supplyChain.notes || 'Temperature monitored under 5°C throughout transit.' },
      ],
    },
    {
      id: '05',
      title: 'Supporting Documents',
      subtitle: 'Certificates, invoices and other supporting documents.',
      icon: FileText,
      bgColor: 'bg-[#06B6D4]',
      iconColor: 'text-white',
      badgeText: '3 Documents',
      badgeStyle: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
      badgeIcon: FileCheck,
      documents: [
        { title: 'Quality Analysis Certificate (CoA)', size: '1.2 MB PDF', docNo: 'COA-2026-82727' },
        { title: 'Organic Origin Certificate', size: '850 KB PDF', docNo: 'ORG-IND-9941' },
        { title: 'Batch Safety & Inspection Clearance', size: '2.1 MB PDF', docNo: 'FSSAI-INSP-4412' },
      ],
    },
  ];

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
          Complete visibility from source to distribution
        </p>
      </div>

      {/* ================= 2. PRODUCT & BATCH CARD ================= */}
      <div className="px-4 relative z-20 -mt-7">
        <div className="bg-white rounded-3xl p-4 shadow-xl shadow-blue-900/10 border border-slate-100">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Product Info */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60');
                  }}
                />
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
                <span className="font-extrabold text-[#105DE4]">80% Complete</span>
                <span className="text-[10px] text-slate-400">|</span>
                <span className="text-[10.5px] text-slate-500 font-medium">Last Updated: 24 Aug 2026</span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className="h-full bg-gradient-to-r from-[#105DE4] to-[#2563EB] rounded-full transition-all duration-1000 shadow-xs"
                style={{ width: '80%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. TRACEABILITY SECTIONS ================= */}
      <div className="px-4 mt-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[16px] font-extrabold text-[#0B1E36]">Traceability Sections</h3>
          <button
            onClick={() => setViewMode(viewMode === 'accordion' ? 'timeline' : 'accordion')}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#105DE4] bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl border border-blue-200/60 transition-all active:scale-95"
          >
            <ArrowLeftRight size={13} />
            {viewMode === 'accordion' ? 'View as Timeline' : 'View as List'}
          </button>
        </div>

        {/* ACCORDION VIEW MODE */}
        {viewMode === 'accordion' ? (
          <div className="flex flex-col gap-3">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const BadgeIcon = sec.badgeIcon;
              const isOpen = !!openSections[sec.id];

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
                          {sec.id}
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
                      {sec.details && (
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
                      {sec.documents && (
                        <div className="flex flex-col gap-2 mt-2">
                          {sec.documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 border border-cyan-100">
                                  <FileText size={18} />
                                </div>
                                <div>
                                  <h5 className="text-[12.5px] font-bold text-[#0B1E36]">{doc.title}</h5>
                                  <p className="text-[10.5px] text-slate-400 font-medium">{doc.docNo} • {doc.size}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => alert(`Viewing document: ${doc.title}`)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#105DE4] bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                              >
                                <ExternalLink size={12} />
                                View
                              </button>
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
            {sections.map((sec) => {
              const Icon = sec.icon;
              return (
                <div key={sec.id} className="relative bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="absolute -left-6 top-4 w-6 h-6 rounded-full bg-[#105DE4] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md">
                    {sec.id}
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

                  {sec.details && (
                    <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl text-[11.5px]">
                      {sec.details.slice(0, 3).map((d, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-slate-500 font-medium">{d.label}:</span>
                          <span className="font-bold text-slate-800">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                All information is verified & secured
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">
                Every step is recorded securely on Authentiks to ensure complete transparency.
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
    </div>
  );
}
