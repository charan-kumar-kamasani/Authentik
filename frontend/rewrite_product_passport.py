import re

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductPassport.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { ChevronLeft, Share, ShieldCheck, ScanLine, Calendar, FileText, ChevronDown, Globe, HeadphonesIcon, ShoppingCart, Bell, CheckCircle2, X, FlaskConical, Award, BookOpen, AlignLeft } from 'lucide-react';",
    "import { ChevronLeft, Share, ShieldCheck, ScanLine, Calendar, FileText, ChevronDown, Globe, HeadphonesIcon, ShoppingCart, Bell, CheckCircle2, X, FlaskConical, Award, BookOpen, AlignLeft, Info, ExternalLink, Phone, Mail } from 'lucide-react';"
)

# 2. Add Accordion components before ProductPassport
accordion_code = """
const AccordionItem = ({ title, subtitle, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-[16px] mb-3 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-[#105DE4] flex items-center justify-center shrink-0">
             <Icon size={24} strokeWidth={1.5} />
          </div>
          <div className="text-left">
             <h3 className="text-[15px] font-bold text-[#0B1E36] leading-tight">{title}</h3>
             {subtitle && <p className="text-[12px] font-medium text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-2 animate-in slide-in-from-top-2 duration-200">
          <div className="pt-2 border-t border-slate-50">
             {children}
          </div>
        </div>
      )}
    </div>
  );
};

const KeyValueRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-[13px] font-medium text-slate-500">{label}</span>
      <span className="text-[13px] font-bold text-[#0B1E36] text-right max-w-[60%]">{value}</span>
    </div>
  );
};

"""

content = content.replace("const ProductPassport = () => {", accordion_code + "const ProductPassport = () => {")

# 3. Replace the Content Card overlapping section with the new accordions
# The original code has:
# {/* Product Details Accordion */}
# all the way to
# {/* Quick Actions (Re Order & Price Alert) */}

start_marker = "{/* Product Details Accordion */}"
end_marker = "{/* Quick Actions (Re Order & Price Alert) */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

new_accordions = """{/* Accordions */}
        <div className="flex flex-col gap-3 mb-3 mt-3">
          {/* 1. Product Details */}
          <AccordionItem title="Product Details" subtitle="View specifications and details" icon={FileText} defaultOpen={true}>
            <KeyValueRow label="Brand" value={data.brand || data.companyName} />
            <KeyValueRow label="Product Name" value={data.productName} />
            <KeyValueRow label="Category" value={data.category} />
            {data.variants?.map((v, i) => (
               <KeyValueRow key={i} label={v.variantName || v.variantLabel || 'Variant'} value={v.value} />
            ))}
            <KeyValueRow label="Batch No" value={data.batchNo} />
            <KeyValueRow label="MRP" value={data.mrp || data.dynamicFields?.mrp} />
          </AccordionItem>

          {/* 2. Description */}
          {(data.productInfo || data.description) && (
            <AccordionItem title="Description" subtitle="About this product" icon={Info}>
              <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap">{data.productInfo || data.description}</p>
              {data.keyBenefits && (
                <>
                  <h4 className="text-[13px] font-bold text-[#0B1E36] mt-4 mb-2">Key Benefits</h4>
                  <div className="flex flex-col gap-2">
                     {data.keyBenefits.split('\\n').map((benefit, idx) => (
                       <div key={idx} className="flex items-start gap-2">
                         <CheckCircle2 size={16} className="text-[#105DE4] shrink-0 mt-0.5" />
                         <span className="text-[13px] font-medium text-slate-700">{benefit}</span>
                       </div>
                     ))}
                  </div>
                </>
              )}
            </AccordionItem>
          )}

          {/* 3. Ingredients */}
          {data.ingredients && (
            <AccordionItem title="Ingredients" subtitle="What goes into this product" icon={FlaskConical}>
              <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap">{data.ingredients}</p>
            </AccordionItem>
          )}

          {/* 4. Certifications and Lab Tests */}
          {(data.certificates && data.certificates.length > 0) && (
            <AccordionItem title="Certifications and Lab" subtitle="Verified certificates and lab tests" icon={Award}>
               <div className="flex flex-col gap-3">
                 {data.certificates.map((cert, idx) => (
                   <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                     <div className="w-10 h-10 rounded-full bg-blue-100 text-[#105DE4] flex items-center justify-center shrink-0">
                       {cert.isLabTest ? <FlaskConical size={18} /> : <Award size={18} />}
                     </div>
                     <div className="flex-1">
                       <h4 className="text-[13px] font-bold text-[#0B1E36] leading-tight mb-0.5">{cert.name}</h4>
                       <p className="text-[11px] text-slate-500 font-medium">Issued by {cert.issuer} • {cert.date}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </AccordionItem>
          )}

          {/* 5. Product Education */}
          {(data.educationContent && data.educationContent.length > 0) && (
            <AccordionItem title="Product Education" subtitle="Discover how to use this product" icon={BookOpen}>
              <div className="flex flex-col gap-3">
                {data.educationContent.map((edu, idx) => (
                  <div key={idx} className="flex flex-col gap-1 p-3 rounded-xl border border-slate-100 bg-slate-50">
                     <h4 className="text-[13px] font-bold text-[#0B1E36]">{edu.title || 'Guide'}</h4>
                     <p className="text-[12px] text-slate-600 leading-relaxed">{edu.description}</p>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}

          {/* 6. Website */}
          {data.website && (
            <AccordionItem title="Website" subtitle="Visit our official store" icon={Globe}>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                <span className="text-[13px] font-medium text-slate-700">{data.website}</span>
                <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" rel="noreferrer" className="text-[#105DE4]">
                  <ExternalLink size={18} />
                </a>
              </div>
            </AccordionItem>
          )}

          {/* 7. Additional Details */}
          <AccordionItem title="Additional Details" subtitle="Manufacturing and other info" icon={FileText}>
            <KeyValueRow label="Country of Origin" value={data.countryOfOrigin} />
            <KeyValueRow label="Manufactured By" value={data.manufacturedBy} />
            <KeyValueRow label="Marketed By" value={data.marketedBy} />
            <KeyValueRow label="SKU Number" value={data.skuNumber} />
            <KeyValueRow label="Quantity" value={data.quantity || data.dynamicFields?.quantity} />
            <KeyValueRow label="Serving Size" value={data.servingSize || data.dynamicFields?.servingSize || data.dynamicFields?.['Serving Size']} />
            <KeyValueRow label="Shelf Life" value={data.bestBefore?.value ? `${data.bestBefore.value} ${data.bestBefore.unit}` : null} />
            <KeyValueRow label="Warranty" value={data.warranty && (data.warranty.duration || data.warranty.warrantyType) ? `${data.warranty.duration || ''} ${data.warranty.durationUnit || ''} ${data.warranty.warrantyType || ''}`.trim() : null} />
            <KeyValueRow label="Storage Instructions" value={data.dynamicFields?.storageInstructions || data.dynamicFields?.['Storage Instructions']} />
          </AccordionItem>

          {/* 8. Customer Support */}
          {(data.customerCare || data.supportEmail) && (
            <AccordionItem title="Customer Support" subtitle="Get in touch with us" icon={HeadphonesIcon}>
              <div className="flex flex-col gap-3">
                {data.customerCare && (
                  <a href={`tel:${data.customerCare.replace(/[^0-9]/g, '')}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-[#F8FAFC]">
                     <div className="w-10 h-10 rounded-full bg-blue-100 text-[#105DE4] flex items-center justify-center shrink-0">
                       <Phone size={18} />
                     </div>
                     <div>
                       <h4 className="text-[13px] font-bold text-[#0B1E36]">Call Us</h4>
                       <p className="text-[12px] text-slate-500 font-medium">{data.customerCare}</p>
                     </div>
                  </a>
                )}
                {data.supportEmail && (
                  <a href={`mailto:${data.supportEmail}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-[#F8FAFC]">
                     <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                       <Mail size={18} />
                     </div>
                     <div>
                       <h4 className="text-[13px] font-bold text-[#0B1E36]">Email Support</h4>
                       <p className="text-[12px] text-slate-500 font-medium">{data.supportEmail}</p>
                     </div>
                  </a>
                )}
              </div>
            </AccordionItem>
          )}
        </div>
        
        """

content = content[:start_idx] + new_accordions + content[end_idx:]

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductPassport.tsx', 'w') as f:
    f.write(content)

