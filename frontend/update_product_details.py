import re

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductDetails.tsx', 'r') as f:
    content = f.read()

# 1. Imports
import_statement = "import ProductHeroHeader from '../../components/ProductHeroHeader';\nimport { AccordionItem, KeyValueRow, CertificateViewer } from '../../components/AccordionComponents';\n"
content = content.replace(
    "import { ChevronLeft, Share, ShieldCheck, Star, ChevronDown, CheckCircle2, ChevronRight, Check } from 'lucide-react';",
    "import { ChevronLeft, Share, ShieldCheck, Star, ChevronDown, CheckCircle2, ChevronRight, Check, FileText, Info, FlaskConical, Award, BookOpen } from 'lucide-react';\n" + import_statement
)

# 2. Add openSection state
content = content.replace(
    "const [showMoreDesc, setShowMoreDesc] = useState(false);",
    "const [showMoreDesc, setShowMoreDesc] = useState(false);\n  const [openSection, setOpenSection] = useState<string>('Product Details');"
)

# 3. Replace Header
header_start = content.find("{/* Header */}")
header_end = content.find("{/* Main White Card */}")

new_header = """      <ProductHeroHeader title="Product Details" data={data} />\n\n"""
content = content[:header_start] + new_header + content[header_end:]

# 4. Replace About section with accordions
about_start = content.find("{/* About Section */}")
about_end = content.find("{/* Key Benefits */}")

accordions = """        {/* Accordions */}
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

          {/* 4. Certifications and Lab Tests */}
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
          {data.educationContent && (
            <AccordionItem title="Product Education" subtitle="Discover how to use this product" icon={BookOpen} isOpen={openSection === 'Product Education'} onToggle={() => setOpenSection(openSection === 'Product Education' ? '' : 'Product Education')}>
               <p className="text-[13px] text-slate-700 leading-[1.6] whitespace-pre-wrap">{data.educationContent}</p>
            </AccordionItem>
          )}
        </div>

"""
content = content[:about_start] + accordions + content[about_end:]

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductDetails.tsx', 'w') as f:
    f.write(content)

