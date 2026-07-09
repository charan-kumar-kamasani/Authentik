import os

files = [
    '/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/web/WebPrivacyPolicy.jsx',
    '/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/web/WebTermsConditions.jsx',
    '/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/web/WebSecurityPolicy.jsx'
]

replacements = [
    ('bg-[#020617]', 'bg-slate-50'),
    ('text-slate-200', 'text-slate-800'),
    ('text-white', 'text-slate-900'),
    ('text-gray-400', 'text-slate-600'),
    ('border-white/10', 'border-slate-200'),
    ('prose-invert', ''),
    ('text-indigo-300', 'text-indigo-700'),
    ('bg-indigo-500/10', 'bg-indigo-50'),
    ('bg-emerald-500/10', 'bg-emerald-50'),
    ('text-emerald-300', 'text-emerald-700'),
    ('bg-rose-500/10', 'bg-rose-50'),
    ('text-rose-300', 'text-rose-700'),
]

for file in files:
    if os.path.exists(file):
        with open(file, 'r') as f:
            content = f.read()
        
        for old, new in replacements:
            content = content.replace(old, new)
            
        with open(file, 'w') as f:
            f.write(content)
        print(f"Updated {file}")

