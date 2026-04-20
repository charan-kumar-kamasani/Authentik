import React, { useState } from 'react';
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";
import { 
    CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight,
    ScanLine, Smartphone, Link, TrendingUp, Users, RefreshCw,
    ChevronLeft
} from 'lucide-react';

// Demo QR Images
import authenticImg from '../../assets/demo_qrs/authentic.jpg';
import alertImg from '../../assets/demo_qrs/alert.jpg';

const Glow = ({ color, className }) => (
    <div className={`glow-bg h-72 w-72 ${color} ${className}`} />
);

const SectionTag = ({ children, className = '' }) => (
    <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-[11px] font-black uppercase tracking-[0.25em] mb-6 ${className}`}>
        {children}
    </div>
);

export default function WebLiveDemo() {
    const [contactOpen, setContactOpen] = useState(false);

    // Dynamic URLs based on environment (fallback to production for demo)
    const baseUrl = import.meta.env.VITE_WEBSITE_URL || 'https://authentiks.in';
    
    // DEMO DATA
    // Standard scanner will pick up these simple IDs, and the backend interceptor
    // will mock the response without requiring a complex URL redirect scheme.
    const genuineUrl = `DEMO-GENUINE-QR`;
    const duplicateUrl = `DEMO-DUPLICATE-QR`;
    const fakeUrl = `DEMO-FAKE-QR`;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-12 md:pt-12 pb-20 px-6 overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-teal-600" className="top-1/2 -right-32 opacity-15" />
                
                <div className="container mx-auto text-center relative z-10 max-w-5xl">
                    <SectionTag className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hero-slide-enter">
                        <ScanLine size={14} /> Interactive Experience
                    </SectionTag>

                    <h1 className="hero-slide-enter text-4xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.05]">
                        Experience <span className="gradient-text">Authentiks</span> Live
                    </h1>
                    
                    <p className="hero-slide-enter-delay max-w-3xl mx-auto text-lg md:text-2xl font-bold text-gray-400 mb-10 leading-relaxed">
                        Scan the codes below using your smartphone's camera to see exactly what your customers will see.
                    </p>

                    <div className="hero-slide-enter-delay flex justify-center mb-4">
                        <button
                            onClick={() => setContactOpen(true)}
                            className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm flex items-center gap-3"
                        >
                            Start 90-Day Free Trial
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════ QR INTERACTIVE SHOWCASE ═══════════════ */}
            <section className="py-12 px-6 relative z-10">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        
                        {/* 1. GENUINE PRODUCT */}
                        <div className="glass-effect rounded-[2.5rem] p-8 border border-emerald-500/30 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 ring-1 ring-emerald-500/10 hover:ring-emerald-500/40">
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500 rounded-full blur-[80px] opacity-20" />
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Genuine Product</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">First-time Scan</p>
                                </div>
                            </div>
                            
                            <div className="bg-white p-2 rounded-3xl mx-auto w-fit mb-8 shadow-xl relative group-hover:scale-105 transition-transform overflow-hidden">
                                <img 
                                    src={authenticImg} 
                                    alt="Genuine QR" 
                                    className="w-[220px] h-[220px] object-contain rounded-2xl" 
                                />
                            </div>

                            <p className="text-sm font-bold text-gray-400 text-center leading-relaxed">
                                Experience the seamless verification, detailed product specs, and customer reward capture flow.
                            </p>
                        </div>

                        {/* 2. DUPLICATE PRODUCT */}
                        <div className="glass-effect rounded-[2.5rem] p-8 border border-amber-500/30 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 ring-1 ring-amber-500/10 hover:ring-amber-500/40">
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500 rounded-full blur-[80px] opacity-20" />
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Duplicate Scan</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Already Verified</p>
                                </div>
                            </div>
                            
                            <div className="bg-white p-2 rounded-3xl mx-auto w-fit mb-8 shadow-xl relative group-hover:scale-105 transition-transform overflow-hidden">
                                <img 
                                    src={alertImg} 
                                    alt="Duplicate QR" 
                                    className="w-[220px] h-[220px] object-contain rounded-2xl" 
                                />
                            </div>

                            <p className="text-sm font-bold text-gray-400 text-center leading-relaxed">
                                See how we instantly warn consumers if a QR code has already been scanned previously.
                            </p>
                        </div>

                        {/* 3. FAKE PRODUCT */}
                        <div className="glass-effect rounded-[2.5rem] p-8 border border-red-500/30 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 ring-1 ring-red-500/10 hover:ring-red-500/40">
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500 rounded-full blur-[80px] opacity-20" />
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                                    <ShieldAlert size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Fake Product</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Non-Authentiks QR</p>
                                </div>
                            </div>
                            
                            <div className="bg-white p-2 rounded-3xl mx-auto w-fit mb-8 shadow-xl relative group-hover:scale-105 transition-transform overflow-hidden">
                                <img 
                                    src={authenticImg} 
                                    alt="Fake QR" 
                                    className="w-[220px] h-[220px] object-contain rounded-2xl" 
                                />
                            </div>

                            <p className="text-sm font-bold text-gray-400 text-center leading-relaxed border-t border-red-500/20 pt-3 mt-1">
                                <span className="text-white">Instruction:</span> Scan this QR code, then use the Web Scanner on the homepage to detect that it's unrecognized.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ EXPERIENCE BREAKDOWN ═══════════════ */}
            <section className="py-24 px-6 border-y border-white/5 bg-[#04081c]">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <SectionTag className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">The Anatomy</SectionTag>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.05] mb-6">
                                What Happens Post-Scan?
                            </h2>
                            <p className="text-gray-400 font-bold mb-10 text-lg">
                                We transform a simple verification moment into a comprehensive brand interaction.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: CheckCircle2, title: "Instant Trust", desc: "Customer sees definitive proof of authenticity with dynamic visual cues that cannot be screen-recorded or mocked.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                    { icon: Link, title: "Rich Data Extraction", desc: "We securely fetch batch details, manufacturing dates, and pricing directly from your ERP via our secure ledger.", color: "text-blue-400", bg: "bg-blue-500/10" },
                                    { icon: Users, title: "Consumer Bonding", desc: "Post-verification, the user is presented with warranty registration or loyalty coupons, capturing their PII data for you.", color: "text-purple-400", bg: "bg-purple-500/10" },
                                    { icon: TrendingUp, title: "Real-time Telemetry", desc: "The scan location, device type, and timestamp are instantly beamed to your Admin Dashboard heatmaps.", color: "text-orange-400", bg: "bg-orange-500/10" }
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                        <div className={`mt-1 shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${feature.bg} ${feature.color}`}>
                                            <feature.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-lg mb-1">{feature.title}</h4>
                                            <p className="text-gray-400 font-medium text-sm leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* MOCKUP UI */}
                        <div className="relative mx-auto w-full max-w-md">
                            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                            <div className="bg-[#0f172a] rounded-[2.5rem] border-[6px] border-[#1e293b] overflow-hidden relative shadow-2xl z-10 h-[600px] flex flex-col">
                                {/* Status bar */}
                                <div className="h-6 w-full bg-black/40 px-6 flex justify-between items-center z-20 absolute top-0 left-0 right-0 backdrop-blur-md">
                                    <span className="text-[10px] text-white font-medium">9:41</span>
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                                    </div>
                                </div>
                                
                                {/* App content */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar pt-0 pb-10 bg-[#F5F5F5]">
                                    {/* App Header */}
                                    <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-30">
                                      <div className="text-[#0D4E96]"><ChevronLeft size={20} /></div>
                                      <h4 className="text-[#0D4E96] font-bold text-sm">Scan Result</h4>
                                      <div className="w-5"></div>
                                    </div>

                                    <div className="mt-4 mx-4 bg-[#2CA4D6] rounded-t-[16px] p-4 text-center text-white relative shadow-md z-10">
                                      <div className="flex flex-row justify-center items-center gap-2">
                                        <div className="bg-white rounded-full">
                                          <img src="/logo.svg" alt="Auth" className="w-10 h-10 object-contain m-1" />
                                        </div>
                                        <div className="text-left">
                                          <h2 className="text-[16px] font-bold leading-tight">Authentic Product</h2>
                                          <p className="text-[11px] opacity-90 font-medium">This product has been verified as genuine</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="mx-4 bg-white shadow-sm rounded-b-[16px] pb-4">
                                      <div className="bg-white pb-6 flex flex-col items-center relative gap-3">
                                        <div className="w-full bg-[#1F2642] py-2 text-center h-[36px]">
                                          <h3 className="text-white font-bold text-[16px] leading-[20px]">ALPHALITE Panther</h3>
                                        </div>
                                        <div className="relative group">
                                          <div className="relative h-[200px] w-full max-w-[200px] rounded-[1.5rem] overflow-hidden bg-white shadow-2xl border-4 border-white shadow-indigo-200/50">
                                            <img src="https://res.cloudinary.com/dx4i1w3uf/image/upload/v1776596909/alphali_nig1vq.jpg" alt="product" className="w-full h-full object-contain" />
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="px-3 space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                              { l: "Brand", v: "Alphalite" },
                                              { l: "Category", v: "Sporting Goods" },
                                              { l: "Batch #", v: "ALPHA-2478" },
                                              { l: "Mfd on", v: "Feb 2026" },
                                              { l: "Color", v: "Black" },
                                              { l: "Size", v: "10 UK" },
                                              { l: "MRP (Maximum Retail Price)", v: "₹36,999.00" },
                                              { l: "Model / Series", v: "Panther" },
                                              { l: "SKU/Model Number", v: "AL2468" },
                                              { l: "Material", v: "High-density mesh" }
                                            ].map((item, i) => (
                                              <div key={i} className="bg-[#259DCF] rounded-[16px] p-3 shadow-lg text-left">
                                                <p className="text-white/80 text-[8px] font-black uppercase tracking-wider mb-0.5">{item.l}</p>
                                                <p className="text-white text-[11px] font-black leading-tight">{item.v}</p>
                                              </div>
                                            ))}
                                        </div>

                                        <div className="mt-8 border-t border-gray-100 pt-5 text-left pb-10">
                                          <h4 className="text-[#333] font-black text-[14px] mb-3 ml-1 uppercase tracking-tight">Additional Info:</h4>
                                          <div className="bg-[#F2F2F2] p-5 rounded-[20px] shadow-sm space-y-6 border border-gray-200/50">
                                            <div>
                                              <p className="text-[#444] text-[13px] font-bold leading-[1.6]">
                                                ALPHALITE Performance Series: Panther - Neon Blue
                                              </p>
                                              <p className="text-[#666] text-[12px] font-medium leading-[1.6] mt-1">
                                                Experience the intersection of high-performance athletics and cutting-edge digital security. The ALPHALITE Performance Series isn't just a sneaker; it's a verified piece of technology designed for those who demand intelligence as much as they demand speed.
                                              </p>
                                            </div>
                                            
                                            <div>
                                              <p className="text-[#333] text-[10px] font-black uppercase tracking-wider opacity-60 mb-2">Key Benefits</p>
                                              <div className="space-y-3">
                                                <div>
                                                  <p className="text-[#444] text-[12px] font-bold">Design & Aesthetics</p>
                                                  <p className="text-[#666] text-[11px] font-medium leading-relaxed">A sleek, low-top aerodynamic profile finished in a deep carbon black.</p>
                                                </div>
                                                <div>
                                                  <p className="text-[#444] text-[12px] font-bold">Smart Midsole</p>
                                                  <p className="text-[#666] text-[11px] font-medium leading-relaxed">Features integrated neon-blue electroluminescent piping along the midsole, providing a signature "glow".</p>
                                                </div>
                                                <div>
                                                  <p className="text-[#444] text-[12px] font-bold">Breathable Mesh</p>
                                                  <p className="text-[#666] text-[11px] font-medium leading-relaxed">Constructed with a high-density engineered mesh upper for maximum breathability.</p>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="space-y-5 pt-3">
                                              {[
                                                { label: "Manufactured by", val: "ALPHALITE SPORTS" },
                                                { label: "Country of Origin", val: "Made in India" },
                                                { label: "Website", val: "www.alphalite.com" },
                                                { label: "Customer Care", val: "1600800800" },
                                                { label: "Support Email", val: "care@alphalite.com" }
                                              ].map((f, idx) => (
                                                <div key={idx} className="border-b border-gray-300/30 pb-4 last:border-0 last:pb-0">
                                                  <p className="text-[#333] text-[10px] font-black uppercase tracking-wider opacity-60 mb-1">{f.label}</p>
                                                  <p className="text-[#0D4E96] text-[14px] font-black">{f.val}</p>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="px-4 mt-2">
                                      <button className="w-full bg-gradient-to-r from-[#0E5CAB] to-[#1F2642] text-white rounded-[30px] font-bold text-[15px] uppercase tracking-widest text-center py-4 shadow-[0_10px_25px_rgba(14,92,171,0.3)] transform transition-transform active:scale-95">
                                            Review Product
                                      </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FINAL CTA ═══════════════ */}
            <section className="py-24 px-6 relative overflow-hidden">
                <Glow color="bg-indigo-600" className="top-0 left-1/2 -translate-x-1/2 opacity-20" />
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                        The Technology Speaks for Itself.
                    </h2>
                    <p className="text-gray-400 font-bold mb-10 text-lg">
                        Ready to integrate Authentiks into your packaging lines?
                    </p>
                    <button 
                        onClick={() => setContactOpen(true)}
                        className="px-12 py-6 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm inline-flex items-center gap-3"
                    >
                        Contact Our Team
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            <WebFooter />
            <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </div>
    );
}

// Helper icon component
const ChevronRight = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6"/>
    </svg>
);
