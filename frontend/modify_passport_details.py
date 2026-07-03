import re

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductPassport.tsx', 'r') as f:
    content = f.read()

# Make sure additionalInfo is extracted in normalizeData
normalize_data_start = "additionalInfo: product.additionalInfo || order.additionalInfo || template.additionalInfo || d.additionalInfo || product.dynamicFields?.additionalInfo || order.dynamicFields?.additionalInfo,"
if "additionalInfo: product.additionalInfo" not in content:
    content = content.replace("educationContent: product.educationContent", normalize_data_start + "\n        educationContent: product.educationContent")


# Update Additional Details Accordion to include the additionalInfo text
additional_details_old = """          {/* 7. Additional Details */}
          <AccordionItem title="Additional Details" subtitle="Manufacturing and other info" icon={FileText}>
            <KeyValueRow label="Country of Origin" value={data.countryOfOrigin} />"""

additional_details_new = """          {/* 7. Additional Details */}
          <AccordionItem title="Additional Details" subtitle="Manufacturing and other info" icon={FileText}>
            {(data.additionalInfo) && (
              <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap mb-4 pb-4 border-b border-slate-50">
                {data.additionalInfo}
              </p>
            )}
            <KeyValueRow label="Country of Origin" value={data.countryOfOrigin} />"""

content = content.replace(additional_details_old, additional_details_new)


# Update Certifications and Lab Accordion to make them links/files directly
certs_old = """          {/* 4. Certifications and Lab Tests */}
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
          )}"""

certs_new = """          {/* 4. Certifications and Lab Tests */}
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

content = content.replace(certs_old, certs_new)

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductPassport.tsx', 'w') as f:
    f.write(content)

