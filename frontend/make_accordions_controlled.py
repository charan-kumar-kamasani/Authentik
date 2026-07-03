import re

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductPassport.tsx', 'r') as f:
    content = f.read()

# 1. Update AccordionItem definition
old_def = """const AccordionItem = ({ title, subtitle, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-[16px] mb-3 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors"
      >"""

new_def = """const AccordionItem = ({ title, subtitle, icon: Icon, children, isOpen, onToggle }) => {
  return (
    <div className="bg-white rounded-[16px] mb-3 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
      <button 
        onClick={onToggle} 
        className="w-full flex items-center justify-between p-4 bg-white active:bg-slate-50 transition-colors"
      >"""

content = content.replace(old_def, new_def)

# 2. Update default state
content = content.replace("const [openSection, setOpenSection] = useState<string>('details');", "const [openSection, setOpenSection] = useState<string>('Product Details');")

# 3. Replace individual accordion invocations
replacements = {
    '<AccordionItem title="Product Details" subtitle="View specifications and details" icon={FileText} defaultOpen={true}>':
    '<AccordionItem title="Product Details" subtitle="View specifications and details" icon={FileText} isOpen={openSection === \'Product Details\'} onToggle={() => setOpenSection(openSection === \'Product Details\' ? \'\' : \'Product Details\')}>',

    '<AccordionItem title="Description" subtitle="About this product" icon={Info}>':
    '<AccordionItem title="Description" subtitle="About this product" icon={Info} isOpen={openSection === \'Description\'} onToggle={() => setOpenSection(openSection === \'Description\' ? \'\' : \'Description\')}>',

    '<AccordionItem title="Ingredients" subtitle="What goes into this product" icon={FlaskConical}>':
    '<AccordionItem title="Ingredients" subtitle="What goes into this product" icon={FlaskConical} isOpen={openSection === \'Ingredients\'} onToggle={() => setOpenSection(openSection === \'Ingredients\' ? \'\' : \'Ingredients\')}>',

    '<AccordionItem title="Certifications and Lab" subtitle="Verified certificates and lab tests" icon={Award}>':
    '<AccordionItem title="Certifications and Lab" subtitle="Verified certificates and lab tests" icon={Award} isOpen={openSection === \'Certifications and Lab\'} onToggle={() => setOpenSection(openSection === \'Certifications and Lab\' ? \'\' : \'Certifications and Lab\')}>',

    '<AccordionItem title="Product Education" subtitle="Discover how to use this product" icon={BookOpen}>':
    '<AccordionItem title="Product Education" subtitle="Discover how to use this product" icon={BookOpen} isOpen={openSection === \'Product Education\'} onToggle={() => setOpenSection(openSection === \'Product Education\' ? \'\' : \'Product Education\')}>',

    '<AccordionItem title="Website" subtitle="Visit our official store" icon={Globe}>':
    '<AccordionItem title="Website" subtitle="Visit our official store" icon={Globe} isOpen={openSection === \'Website\'} onToggle={() => setOpenSection(openSection === \'Website\' ? \'\' : \'Website\')}>',

    '<AccordionItem title="Additional Details" subtitle="Manufacturing and other info" icon={FileText}>':
    '<AccordionItem title="Additional Details" subtitle="Manufacturing and other info" icon={FileText} isOpen={openSection === \'Additional Details\'} onToggle={() => setOpenSection(openSection === \'Additional Details\' ? \'\' : \'Additional Details\')}>',

    '<AccordionItem title="Customer Support" subtitle="Get in touch with us" icon={HeadphonesIcon}>':
    '<AccordionItem title="Customer Support" subtitle="Get in touch with us" icon={HeadphonesIcon} isOpen={openSection === \'Customer Support\'} onToggle={() => setOpenSection(openSection === \'Customer Support\' ? \'\' : \'Customer Support\')}>'
}

for old_str, new_str in replacements.items():
    content = content.replace(old_str, new_str)

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductPassport.tsx', 'w') as f:
    f.write(content)

