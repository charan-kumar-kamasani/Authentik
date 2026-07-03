import re

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/SmartReorder.tsx', 'r') as f:
    content = f.read()

# Add import
import_statement = "import ProductHeroHeader from '../../components/ProductHeroHeader';\n"
content = content.replace("import { ChevronLeft, Share, ShieldCheck, Star, ChevronRight, Check, Tag, Bell, X } from 'lucide-react';", 
                          "import { ChevronLeft, Share, ShieldCheck, Star, ChevronRight, Check, Tag, Bell, X } from 'lucide-react';\n" + import_statement)

# Regex to find the header block. It starts with `{/* Header */}` and ends before `{/* Main White Card */}`
header_start = content.find("{/* Header */}")
header_end = content.find("{/* Main White Card */}")

new_header = """      <ProductHeroHeader title="Smart Re Order" data={data} />\n\n"""

content = content[:header_start] + new_header + content[header_end:]

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/SmartReorder.tsx', 'w') as f:
    f.write(content)

