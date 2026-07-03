import re

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/DemoResult.jsx', 'r') as f:
    content = f.read()

# We want to replace the Modals at the end of ResultAuthentic with conditional renders to the Full Screen Components.
# And append the Full Screen Components outside of ResultAuthentic.

# 1. Update imports
content = content.replace(
    'import { ChevronLeft, Share, FileText, BookOpen, MessageSquare, ShieldCheck, Gift, ChevronRight, XCircle, AlertTriangle, Headset, Flag, X, ShieldAlert, Calendar, Phone, MapPin, RefreshCcw, ScanLine, CheckCircle2, FlaskConical, Award } from "lucide-react";',
    'import { ChevronLeft, Share, FileText, BookOpen, MessageSquare, ShieldCheck, Gift, ChevronRight, XCircle, AlertTriangle, Headset, Flag, X, ShieldAlert, Calendar, Phone, MapPin, RefreshCcw, ScanLine, CheckCircle2, FlaskConical, Award, Star, ChevronDown, Check, Search, CheckCircle, QrCode, ExternalLink, Mail, Clock } from "lucide-react";'
)

# 2. Add sub-components at the end of the file
sub_components = """

function DemoProductDetails({ data, onBack }) {
  const [showMoreDesc, setShowMoreDesc] = React.useState(false);
  const variantName = data.variants?.[0]?.value || data.category || 'Standard';
  const benefitsList = data.keyBenefits ? data.keyBenefits.split(/\\n|,/).map((b) => b.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[#001466] font-sans overflow-x-hidden pb-20 fixed inset-0 z-[200] overflow-y-auto">
      <div className="px-5 pt-6 pb-2 flex items-center justify-between text-white sticky top-0 bg-[#001466] z-10">
        <button onClick={onBack} className="p-1 -ml-1 active:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
        <h1 className="text-[17px] font-bold tracking-wide">Product Details</h1>
        <button className="p-1 -mr-1 active:bg-white/10 rounded-full transition-colors">
          <Share size={22} strokeWidth={2.5} />
        </button>
      </div>

      <div className="px-5 pt-4 pb-8 flex gap-4 items-center">
        <div className="w-[140px] h-[160px] shrink-0 relative flex items-center justify-center -ml-2">
          <img src={data.productImage} alt={data.productName} className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-white text-[13px] font-bold flex items-center gap-1.5">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[#001466] font-black text-[10px]">
                {data.companyName.charAt(0).toUpperCase()}
              </div>
              {data.companyName}
            </span>
            <div className="w-4 h-4 bg-[#105DE4] rounded-full flex items-center justify-center">
              <Check size={10} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <h2 className="text-white text-[22px] font-bold leading-[1.1] mb-1 tracking-tight">{data.productName}</h2>
          {variantName && <p className="text-blue-100 text-[13px] font-medium mb-3">{variantName}</p>}
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 bg-[#FFE8D6] text-[#E07A25] text-[10px] font-extrabold rounded uppercase tracking-wide">
              {data.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-[#FFC107] fill-[#FFC107]" />
            <span className="text-white text-[14px] font-bold">4.8</span>
            <span className="text-blue-200 text-[11px]">(124 Reviews)</span>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] rounded-t-[24px] px-5 pt-6 pb-8 min-h-screen">
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
            <div className="flex flex-col items-center gap-1">
              <Search size={16} className="text-slate-400" />
              <span className="text-[8px] font-bold text-center leading-tight text-slate-600">Tracked from<br/>Source</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle size={16} className="text-slate-400" />
              <span className="text-[8px] font-bold text-center leading-tight text-slate-600">Third Party<br/>Verified</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <QrCode size={16} className="text-slate-400" />
              <span className="text-[8px] font-bold text-center leading-tight text-slate-600">Unique<br/>Identity</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            <h3 className="text-[#0B1E36] font-bold text-[15px] mb-2.5">About this Product</h3>
            <p className="text-slate-700 text-[13px] leading-[1.6] whitespace-pre-wrap">
              {showMoreDesc ? data.description : (data.description.length > 100 ? `${data.description.slice(0, 100)}...` : data.description)}
            </p>
            {data.description.length > 100 && (
              <button 
                onClick={() => setShowMoreDesc(!showMoreDesc)}
                className="text-[#105DE4] text-[12px] font-bold mt-1 flex items-center gap-0.5"
              >
                Read {showMoreDesc ? 'Less' : 'More'} <ChevronDown size={14} className={showMoreDesc ? 'rotate-180' : ''} />
              </button>
            )}
          </div>
        </div>

        {benefitsList.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[#0B1E36] font-bold text-[15px] mb-4">Key Benefits</h3>
            <div className="flex flex-col gap-3">
              {benefitsList.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                     <CheckCircle2 size={16} />
                   </div>
                   <span className="text-sm font-medium text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
}

function DemoIngredients({ data, onBack }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 font-sans fixed inset-0 z-[200] overflow-y-auto">
      <div className="bg-[#001466] text-white pt-6 pb-4 px-5 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-[16px] font-bold tracking-wide flex-1 text-center pr-6">Ingredients & Usage</h1>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FlaskConical size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Formulation</h2>
              <p className="text-xs font-medium text-slate-500">What goes into this product</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{data.ingredients}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Supplement Facts</h2>
              <p className="text-xs font-medium text-slate-500">Nutritional Information</p>
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {data.supplementFacts.map((fact, idx) => (
              <div key={idx} className={`flex justify-between p-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 last:border-0`}>
                <span className="text-[13px] font-semibold text-slate-700">{fact.label}</span>
                <span className="text-[13px] font-black text-[#001466]">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recommended Use</h2>
              <p className="text-xs font-medium text-slate-500">How to consume</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{data.recommendedUse}</p>
        </div>
      </div>
    </div>
  );
}

function DemoCertificates({ data, onBack }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 font-sans fixed inset-0 z-[200] overflow-y-auto">
      <div className="bg-[#001466] text-white pt-6 pb-4 px-5 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-[16px] font-bold tracking-wide flex-1 text-center pr-6">Certifications & Lab Tests</h1>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-4">
        {data.certificates.map((cert, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                {cert.isLabTest ? <FlaskConical size={20} strokeWidth={2.5} /> : <Award size={20} strokeWidth={2.5} />}
              </div>
              <div className="flex flex-col flex-1">
                <h2 className="text-[15px] font-bold text-slate-900 leading-tight">{cert.name}</h2>
                <span className="text-[11px] text-slate-500 font-medium">Issued by {cert.issuer} • {cert.date}</span>
              </div>
            </div>
            
            <a 
              href="#" onClick={(e) => { e.preventDefault(); alert("Simulating PDF download/view"); }}
              className="group relative block overflow-hidden rounded-xl border border-slate-100 bg-slate-50 aspect-video flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center flex-col gap-2">
                 {cert.isLabTest ? <FileText size={48} className="text-slate-300" /> : <Award size={48} className="text-slate-300" />}
                 <span className="text-slate-400 text-sm font-bold">Tap to View Certificate</span>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  <ExternalLink size={16} className="text-slate-900" />
                  <span className="text-sm font-bold text-slate-900">View Original</span>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoConsumerSupport({ data, onBack }) {
  const waNumber = data.warranty.customerCare.replace(/[^0-9]/g, '');
  
  return (
    <div className="min-h-screen max-h-[100dvh] bg-white font-sans flex flex-col relative overflow-hidden fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex items-center justify-between p-3 bg-white shrink-0 pt-6">
        <button onClick={onBack} className="p-1 -ml-1 text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="text-[16px] font-bold text-[#0B1E36] tracking-tight">Help & Support</h1>
        <div className="w-8" />
      </div>

      <div className="px-5 pt-2 flex-1 flex flex-col pb-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 shrink-0 mt-4">
          <div className="flex-1 max-w-[55%]">
            <h2 className="text-[#0B1E36] text-[18px] font-extrabold leading-[1.2] mb-2">
              We're here to help you!
            </h2>
            <p className="text-slate-500 text-[12px] leading-[1.5] font-medium pr-1">
              Choose your preferred way to reach out. Our support team will get back to you as soon as possible.
            </p>
          </div>
          <div className="w-[110px] h-[110px] shrink-0 bg-blue-50 rounded-full flex items-center justify-center">
             <Headset size={50} className="text-blue-500" />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="text-[#0B1E36] text-[15px] font-bold mb-3">Contact Us</h3>

          <div className="space-y-3">
            <a 
              href={`https://wa.me/${waNumber}`} 
              target="_blank" rel="noreferrer"
              className="flex items-center bg-[#F8FAFC] border border-slate-100 p-4 rounded-2xl active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                <MessageSquare size={22} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-[14px] font-bold text-[#0B1E36] leading-none mb-1">WhatsApp Chat</h4>
                <p className="text-[12px] text-slate-500 font-medium">Fastest response</p>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </a>

            <a 
              href={`mailto:${data.warranty.supportEmail}`}
              className="flex items-center bg-[#F8FAFC] border border-slate-100 p-4 rounded-2xl active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-[#EA4335]/10 text-[#EA4335] flex items-center justify-center shrink-0">
                <Mail size={22} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-[14px] font-bold text-[#0B1E36] leading-none mb-1">Email Support</h4>
                <p className="text-[12px] text-slate-500 font-medium">{data.warranty.supportEmail}</p>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </a>

            <a 
              href={`tel:${waNumber}`}
              className="flex items-center bg-[#F8FAFC] border border-slate-100 p-4 rounded-2xl active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-[#105DE4]/10 text-[#105DE4] flex items-center justify-center shrink-0">
                <Phone size={22} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-[14px] font-bold text-[#0B1E36] leading-none mb-1">Call Us</h4>
                <p className="text-[12px] text-slate-500 font-medium">Mon-Sat, 9AM to 6PM</p>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </a>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-bold text-slate-700 mb-1">Operating Hours</h4>
                <p className="text-[11px] text-slate-500 leading-[1.5]">
                  Our support team is available Monday through Saturday from 9:00 AM to 6:00 PM IST. 
                  Emails sent outside these hours will be addressed on the next business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"""
content += sub_components

# 3. Replace the Modal conditional renders inside ResultAuthentic with the new Full Screen components
modal_start = content.find('{/* Product Details Modal */}')
modal_end = content.find('<style>{`')

new_modals = """
      {showProductDetails && <DemoProductDetails data={data} onBack={() => setShowProductDetails(false)} />}
      {showIngredientsModal && <DemoIngredients data={data} onBack={() => setShowIngredientsModal(false)} />}
      {showCertsModal && <DemoCertificates data={data} onBack={() => setShowCertsModal(false)} />}
      {showSupportModal && <DemoConsumerSupport data={data} onBack={() => setShowSupportModal(false)} />}
"""

content = content[:modal_start] + new_modals + content[modal_end:]

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/DemoResult.jsx', 'w') as f:
    f.write(content)

