import re

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductDetails.tsx', 'r') as f:
    content = f.read()

# Add import
import_statement = "import ProductHeroHeader from '../../components/ProductHeroHeader';\n"
content = content.replace("import { ChevronLeft, Share, ShieldCheck, CheckCircle2, ChevronRight, ChevronDown, Heart, Star, Navigation, MapPin } from 'lucide-react';", 
                          "import { ChevronLeft, Share, ShieldCheck, CheckCircle2, ChevronRight, ChevronDown, Heart, Star, Navigation, MapPin } from 'lucide-react';\n" + import_statement)

# Regex to find the header block. It starts with `{/* Header section (Dark Blue) */}` and ends before `{/* Main White Card */}`
header_start = content.find("{/* Header section (Dark Blue) */}")
header_end = content.find("{/* Main White Card */}")

new_header = """      <ProductHeroHeader title="Product Details" data={data} onShare={handleShare} />\n\n"""

content = content[:header_start] + new_header + content[header_end:]

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductDetails.tsx', 'w') as f:
    f.write(content)

