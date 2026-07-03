import re

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductPassport.tsx', 'r') as f:
    content = f.read()

# 1. Add CertificateViewer component
cert_viewer_code = """
const CertificateViewer = ({ cert }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const fileUrl = cert.image || cert.file || cert.url;
  
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 p-4 active:bg-slate-100 w-full text-left"
      >
        <div className="w-10 h-10 rounded-full bg-blue-100 text-[#105DE4] flex items-center justify-center shrink-0">
          {cert.isLabTest ? <FlaskConical size={20} strokeWidth={2} /> : <Award size={20} strokeWidth={2} />}
        </div>
        <div className="flex-1">
          <h4 className="text-[14px] font-bold text-[#0B1E36] leading-tight mb-1">{cert.name}</h4>
          <p className="text-[11px] text-slate-500 font-medium">Issued by {cert.issuer || 'N/A'}</p>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && fileUrl && (
        <div className="p-4 pt-0 border-t border-slate-100 animate-in slide-in-from-top-2">
          <a href={fileUrl} target="_blank" rel="noreferrer" className="block w-full rounded-lg overflow-hidden border border-slate-200">
             <img src={fileUrl} alt={cert.name} className="w-full h-auto object-contain bg-white max-h-[300px]" />
          </a>
        </div>
      )}
    </div>
  );
};
"""

content = content.replace("const ProductPassport = () => {", cert_viewer_code + "\nconst ProductPassport = () => {")

# 2. Update Product Details Accordion
old_product_details = """          {/* 1. Product Details */}
          <AccordionItem title="Product Details" subtitle="View specifications and details" icon={FileText} defaultOpen={true}>
            <KeyValueRow label="Brand" value={data.brand || data.companyName} />
            <KeyValueRow label="Product Name" value={data.productName} />
            <KeyValueRow label="Category" value={data.category} />
            {data.variants?.map((v, i) => (
               <KeyValueRow key={i} label={v.variantName || v.variantLabel || 'Variant'} value={v.value} />
            ))}
            <KeyValueRow label="Batch No" value={data.batchNo} />
            <KeyValueRow label="MRP" value={data.mrp || data.dynamicFields?.mrp} />
          </AccordionItem>"""

new_product_details = """          {/* 1. Product Details */}
          <AccordionItem title="Product Details" subtitle="View specifications and details" icon={FileText} defaultOpen={true}>
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
          </AccordionItem>"""

content = content.replace(old_product_details, new_product_details)


# 3. Update Certifications Accordion
old_certs = """          {/* 4. Certifications and Lab Tests */}
          {(data.certificates && data.certificates.length > 0) && (
            <AccordionItem title="Certifications and Lab" subtitle="Verified certificates and lab tests" icon={Award}>
               <div className="flex flex-col gap-3">
                 {data.certificates.map((cert, idx) => {
                   const fileUrl = cert.image || cert.file || cert.url;
                   return (
                     <a 
                       key={idx} 
                       href={fileUrl || '#'} 
                       target={fileUrl ? "_blank" : undefined}
                       rel={fileUrl ? "noreferrer" : undefined}
                       className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 active:bg-slate-100 transition-colors"
                     >
                       <div className="w-10 h-10 rounded-full bg-blue-100 text-[#105DE4] flex items-center justify-center shrink-0">
                         {cert.isLabTest ? <FlaskConical size={20} strokeWidth={2} /> : <Award size={20} strokeWidth={2} />}
                       </div>
                       <div className="flex-1">
                         <h4 className="text-[14px] font-bold text-[#0B1E36] leading-tight mb-1">{cert.name}</h4>
                         <p className="text-[11px] text-slate-500 font-medium">Issued by {cert.issuer || 'N/A'}</p>
                       </div>
                     </a>
                   );
                 })}
               </div>
            </AccordionItem>
          )}"""

new_certs = """          {/* 4. Certifications and Lab Tests */}
          {(data.certificates && data.certificates.length > 0) && (
            <AccordionItem title="Certifications and Lab" subtitle="Verified certificates and lab tests" icon={Award}>
               <div className="flex flex-col gap-3">
                 {data.certificates.map((cert: any, idx: number) => (
                    <CertificateViewer key={idx} cert={cert} />
                 ))}
               </div>
            </AccordionItem>
          )}"""

content = content.replace(old_certs, new_certs)


# 4. Update Additional Details Accordion
old_additional = """          {/* 7. Additional Details */}
          <AccordionItem title="Additional Details" subtitle="Manufacturing and other info" icon={FileText}>
            {(data.additionalInfo) && (
              <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap mb-4 pb-4 border-b border-slate-50">
                {data.additionalInfo}
              </p>
            )}
            <KeyValueRow label="Country of Origin" value={data.countryOfOrigin} />
            <KeyValueRow label="Manufactured By" value={data.manufacturedBy} />
            <KeyValueRow label="Marketed By" value={data.marketedBy} />
            <KeyValueRow label="SKU Number" value={data.skuNumber} />
            <KeyValueRow label="Quantity" value={data.quantity || data.dynamicFields?.quantity} />
            <KeyValueRow label="Serving Size" value={data.servingSize || data.dynamicFields?.servingSize || data.dynamicFields?.['Serving Size']} />
            <KeyValueRow label="Shelf Life" value={data.bestBefore?.value ? `${data.bestBefore.value} ${data.bestBefore.unit}` : null} />
            <KeyValueRow label="Warranty" value={data.warranty && (data.warranty.duration || data.warranty.warrantyType) ? `${data.warranty.duration || ''} ${data.warranty.durationUnit || ''} ${data.warranty.warrantyType || ''}`.trim() : null} />
            <KeyValueRow label="Storage Instructions" value={data.dynamicFields?.storageInstructions || data.dynamicFields?.['Storage Instructions']} />
          </AccordionItem>"""

new_additional = """          {/* 7. Additional Details */}
          {data.additionalInfo && (
            <AccordionItem title="Additional Details" subtitle="Manufacturing and other info" icon={FileText}>
              <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap">
                {data.additionalInfo}
              </p>
            </AccordionItem>
          )}"""

content = content.replace(old_additional, new_additional)

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductPassport.tsx', 'w') as f:
    f.write(content)

