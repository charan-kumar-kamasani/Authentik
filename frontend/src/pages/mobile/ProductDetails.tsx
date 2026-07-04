import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share, ShieldCheck, Star, ChevronDown, CheckCircle2, ChevronRight, Check, FileText, Info, FlaskConical, Award, BookOpen } from 'lucide-react';
import API_BASE_URL from '../../config/api';
import ProductHeroHeader from '../../components/ProductHeroHeader';
import { AccordionItem, KeyValueRow, CertificateViewer } from '../../components/AccordionComponents';

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
      additionalInfo: product.additionalInfo || order.additionalInfo || template.additionalInfo || d.additionalInfo || product.dynamicFields?.additionalInfo || order.dynamicFields?.additionalInfo,
    };
  }, []);

  const data = React.useMemo(() => normalizeData(rawData), [rawData, normalizeData]);
  const [showMoreDesc, setShowMoreDesc] = useState(false);
  const [openSection, setOpenSection] = useState<string>('Product Details');

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

  const defaultPrice = orderLinks.find((l: any) => l.price)?.price;
  const defaultMrp = orderLinks.find((l: any) => l.mrp)?.mrp;
  const defaultDiscount = orderLinks.find((l: any) => l.discount)?.discount;

  return (
    <div className="min-h-screen bg-[#001466] font-sans overflow-x-hidden pb-20">
      <ProductHeroHeader title="Product Details" data={data} />

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

        {/* Accordions */}
        <div className="mb-6">
          {/* 1. Product Details */}
          <AccordionItem title="Product Details" subtitle="View specifications and details" icon={FileText} isOpen={openSection === 'Product Details'} onToggle={() => setOpenSection(openSection === 'Product Details' ? '' : 'Product Details')}>
            <KeyValueRow label="Brand" value={data.brand || data.companyName} />
            <KeyValueRow label="Product Name" value={data.productName} />
            <KeyValueRow label="Category" value={data.category} />
            {data.variants?.map((v: any, i: number) => (
               <KeyValueRow key={i} label={v.variantName || v.variantLabel || 'Variant'} value={v.value} />
            ))}
            <KeyValueRow label="Batch No" value={data.batchNo} />
            <KeyValueRow label="MRP" value={data.mrp || data.dynamicFields?.mrp} />
            
            <KeyValueRow label="Country of Origin" value={data.countryOfOrigin} />
            <KeyValueRow label="Manufactured By" value={data.manufacturedBy} />
            <KeyValueRow label="Marketed By" value={data.marketedBy} />
            <KeyValueRow label="Serving Size" value={data.servingSize || data.dynamicFields?.servingSize || data.dynamicFields?.['Serving Size']} />
            <KeyValueRow label="Shelf Life" value={data.bestBefore?.value ? `${data.bestBefore.value} ${data.bestBefore.unit}` : null} />
            <KeyValueRow label="Warranty" value={data.warranty && (data.warranty.duration || data.warranty.warrantyType) ? `${data.warranty.duration || ''} ${data.warranty.durationUnit || ''} ${data.warranty.warrantyType || ''}`.trim() : null} />
            <KeyValueRow label="Storage Instructions" value={data.dynamicFields?.storageInstructions || data.dynamicFields?.['Storage Instructions']} />
          </AccordionItem>

          {/* 2. Description */}
          {desc && (
            <AccordionItem title="Description" subtitle="About this product" icon={Info} isOpen={openSection === 'Description'} onToggle={() => setOpenSection(openSection === 'Description' ? '' : 'Description')}>
              <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap">{desc}</p>
            </AccordionItem>
          )}

          {/* 3. Ingredients */}
          {data.ingredients && (
            <AccordionItem title="Ingredients" subtitle="What goes into this product" icon={FlaskConical} isOpen={openSection === 'Ingredients'} onToggle={() => setOpenSection(openSection === 'Ingredients' ? '' : 'Ingredients')}>
              <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap">{data.ingredients}</p>
            </AccordionItem>
          )}

          {/* 4. Additional Details */}
          {data.additionalInfo && (
            <AccordionItem title="Additional Details" subtitle="Manufacturing and other info" icon={FileText} isOpen={openSection === 'Additional Details'} onToggle={() => setOpenSection(openSection === 'Additional Details' ? '' : 'Additional Details')}>
              <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap">
                {data.additionalInfo}
              </p>
            </AccordionItem>
          )}

          {/* 5. Certifications and Lab Tests */}
          {(data.certificates && data.certificates.length > 0) && (
            <AccordionItem title="Certifications and Lab" subtitle="Verified certificates and lab tests" icon={Award} isOpen={openSection === 'Certifications and Lab'} onToggle={() => setOpenSection(openSection === 'Certifications and Lab' ? '' : 'Certifications and Lab')}>
               <div className="flex flex-col gap-3">
                 {data.certificates.map((cert: any, idx: number) => (
                    <CertificateViewer key={idx} cert={cert} />
                 ))}
               </div>
            </AccordionItem>
          )}

          {/* 5. Product Education */}
          {(data.educationContent && data.educationContent.length > 0) && (
            <AccordionItem title="Product Education" subtitle="Discover how to use this product" icon={BookOpen} isOpen={openSection === 'Product Education'} onToggle={() => setOpenSection(openSection === 'Product Education' ? '' : 'Product Education')}>
              <div className="flex flex-col gap-3">
                {data.educationContent.map((edu: any, idx: number) => {
                  const isVideo = edu.url?.includes('youtube.com') || edu.url?.includes('youtu.be') || edu.url?.endsWith('.mp4');
                  const isImage = edu.url?.match(/\.(jpeg|jpg|gif|png)$/i);
                  
                  return (
                    <div key={idx} className="flex flex-col gap-1 p-3 rounded-xl border border-slate-100 bg-slate-50">
                       <h4 className="text-[13px] font-bold text-[#0B1E36]">{edu.title || 'Guide'}</h4>
                       {edu.description && <p className="text-[12px] text-slate-600 leading-relaxed mb-1">{edu.description}</p>}
                       {edu.url && (
                         <a 
                           href={edu.url} 
                           target="_blank" 
                           rel="noreferrer"
                           className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#105DE4] bg-blue-100/50 px-3 py-1.5 rounded-lg w-max"
                         >
                           {isVideo ? 'Watch Video' : isImage ? 'View Image' : 'Open Link'}
                           <ChevronRight size={14} />
                         </a>
                       )}
                    </div>
                  );
                })}
              </div>
            </AccordionItem>
          )}
        </div>

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
              {orderLinks.map((link: any, idx: number) => {
                const displayPrice = link.price || defaultPrice;
                const displayMrp = link.price ? link.mrp : defaultMrp;
                const displayDiscount = link.price ? link.discount : defaultDiscount;
                
                return (
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
                      {displayPrice && <span className="text-[#0B1E36] font-black text-[15px] leading-none tracking-tight">₹{displayPrice}</span>}
                      
                      {/* Show MRP and Discount together below the price */}
                      {(displayMrp || displayDiscount) && (
                        <div className="flex items-center gap-1 mt-1">
                          {displayMrp && <span className="text-slate-400 text-[10px] font-medium line-through leading-none">₹{displayMrp}</span>}
                          {displayDiscount && <span className="text-[#16A34A] text-[9px] font-bold leading-none">{displayDiscount}</span>}
                        </div>
                      )}
                    </div>
                    
                    <a href={link.url || '#'} target="_blank" rel="noreferrer" className="bg-[#105DE4] text-white px-4 py-2 rounded-xl text-[12px] font-bold active:scale-95 transition-transform whitespace-nowrap shadow-[0_4px_12px_rgba(16,93,228,0.25)]">
                      Buy
                    </a>
                  </div>
                </div>
              )})}
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
