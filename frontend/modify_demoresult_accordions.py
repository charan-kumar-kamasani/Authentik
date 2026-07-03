import re

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/DemoResult.jsx', 'r') as f:
    content = f.read()

# Add the AccordionItem and KeyValueRow components just before export default function DemoResult
accordion_components = """
const AccordionItem = ({ title, subtitle, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
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
        <div className="px-5 pb-5 pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

const KeyValueRow = ({ label, value }) => (
  <div className="flex justify-between py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-[13px] font-medium text-slate-500">{label}</span>
    <span className="text-[13px] font-bold text-[#0B1E36] text-right max-w-[60%]">{value}</span>
  </div>
);

"""

content = content.replace("export default function DemoResult", accordion_components + "export default function DemoResult")

# Find the Action Menu Cards block and replace it
action_menu_start = content.find("{/* Action Menu Cards */}")
warranty_banner_start = content.find("{/* Warranty Claim Banner */}")

accordions_jsx = """{/* Accordions */}
        <div className="flex flex-col gap-3 pb-2 pt-1">
          {/* 1. Product Details */}
          <AccordionItem title="Product Details" subtitle="View specifications and details" icon={FileText} defaultOpen={true}>
            <KeyValueRow label="Brand" value={data.brand} />
            <KeyValueRow label="Product Name" value={data.productName} />
            <KeyValueRow label="Flavour" value={data.variants.find(v => v.variantName === 'Flavor')?.value || 'N/A'} />
            <KeyValueRow label="Weight" value={data.variants.find(v => v.variantName === 'Net Weight')?.value || 'N/A'} />
            <KeyValueRow label="batchNo" value={data.batchNo} />
          </AccordionItem>

          {/* 2. Description */}
          <AccordionItem title="Description" subtitle="About this product" icon={Info}>
            <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap">{data.description}</p>
            <h4 className="text-[13px] font-bold text-[#0B1E36] mt-4 mb-2">Key Benefits</h4>
            <div className="flex flex-col gap-2">
               {data.keyBenefits.split('\\n').map((benefit, idx) => (
                 <div key={idx} className="flex items-start gap-2">
                   <CheckCircle2 size={16} className="text-[#105DE4] shrink-0 mt-0.5" />
                   <span className="text-[13px] font-medium text-slate-700">{benefit}</span>
                 </div>
               ))}
            </div>
          </AccordionItem>

          {/* 3. Ingredients */}
          <AccordionItem title="Ingredients" subtitle="What goes into this product" icon={FlaskConical}>
            <h4 className="text-[13px] font-bold text-[#0B1E36] mb-2">Formulation</h4>
            <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap mb-4">{data.ingredients}</p>
            
            <h4 className="text-[13px] font-bold text-[#0B1E36] mb-2">Supplement Facts</h4>
            <div className="border border-slate-100 rounded-xl overflow-hidden mb-4">
              {data.supplementFacts.map((fact, idx) => (
                <div key={idx} className={`flex justify-between p-2.5 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 last:border-0`}>
                  <span className="text-[12px] font-semibold text-slate-600">{fact.label}</span>
                  <span className="text-[12px] font-bold text-[#0B1E36]">{fact.value}</span>
                </div>
              ))}
            </div>

            <h4 className="text-[13px] font-bold text-[#0B1E36] mb-2">Recommended Use</h4>
            <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap">{data.recommendedUse}</p>
          </AccordionItem>

          {/* 4. Certifications and Lab */}
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

          {/* 5. Product Education */}
          <AccordionItem title="Product Education" subtitle="Learn more about usage" icon={BookOpen}>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
               <h4 className="text-[13px] font-bold text-[#105DE4] mb-1">How to verify?</h4>
               <p className="text-[12px] text-slate-600 leading-relaxed">This product has been securely verified using Authentiks anti-counterfeit technology. Always ensure the holographic seal is intact before purchase.</p>
            </div>
          </AccordionItem>

          {/* 6. Website */}
          <AccordionItem title="Website" subtitle="Visit our official store" icon={Globe}>
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
              <span className="text-[13px] font-medium text-slate-700">{data.dynamicFields.website}</span>
              <a href={`https://${data.dynamicFields.website}`} target="_blank" rel="noreferrer" className="text-[#105DE4]">
                <ExternalLink size={18} />
              </a>
            </div>
          </AccordionItem>

          {/* 7. Additional Details */}
          <AccordionItem title="Additional Details" subtitle="Manufacturing and other info" icon={FileText}>
            <KeyValueRow label="Manufactured By" value={data.dynamicFields.manufacturedBy} />
            <KeyValueRow label="MRP" value={data.dynamicFields.mrp} />
            <KeyValueRow label="Warranty" value={`${data.warranty.duration} ${data.warranty.durationUnit} ${data.warranty.warrantyType}`} />
            <div className="mt-3">
              <h4 className="text-[13px] font-bold text-[#0B1E36] mb-1">Quality Assurance</h4>
              <p className="text-[12px] text-slate-600 leading-relaxed">{data.warranty.description}</p>
            </div>
          </AccordionItem>

          {/* 8. Customer Support */}
          <AccordionItem title="Customer Support" subtitle="Get in touch with us" icon={Headset}>
            <div className="flex flex-col gap-3">
              <a href={`tel:${data.warranty.customerCare.replace(/[^0-9]/g, '')}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-[#F8FAFC]">
                 <div className="w-10 h-10 rounded-full bg-blue-100 text-[#105DE4] flex items-center justify-center shrink-0">
                   <Phone size={18} />
                 </div>
                 <div>
                   <h4 className="text-[13px] font-bold text-[#0B1E36]">Call Us</h4>
                   <p className="text-[12px] text-slate-500 font-medium">{data.warranty.customerCare}</p>
                 </div>
              </a>
              <a href={`mailto:${data.warranty.supportEmail}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-[#F8FAFC]">
                 <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                   <Mail size={18} />
                 </div>
                 <div>
                   <h4 className="text-[13px] font-bold text-[#0B1E36]">Email Support</h4>
                   <p className="text-[12px] text-slate-500 font-medium">{data.warranty.supportEmail}</p>
                 </div>
              </a>
            </div>
          </AccordionItem>
        </div>
        
        """

content = content[:action_menu_start] + accordions_jsx + content[warranty_banner_start:]

# Remove the conditional rendering lines for Modals since we replaced them with accordions
content = re.sub(r'\{showProductDetails\s*&&\s*<DemoProductDetails[^>]+>\s*\}', '', content)
content = re.sub(r'\{showIngredientsModal\s*&&\s*<DemoIngredients[^>]+>\s*\}', '', content)
content = re.sub(r'\{showCertsModal\s*&&\s*<DemoCertificates[^>]+>\s*\}', '', content)
content = re.sub(r'\{showSupportModal\s*&&\s*<DemoConsumerSupport[^>]+>\s*\}', '', content)

# Remove the actual component definitions of the full screen modals (DemoProductDetails etc.) at the end of the file.
func_start = content.find("function DemoProductDetails")
if func_start != -1:
    content = content[:func_start]

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/DemoResult.jsx', 'w') as f:
    f.write(content)

