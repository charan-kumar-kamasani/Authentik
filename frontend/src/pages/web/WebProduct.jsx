import React, { useState } from "react";
import { 
    ShieldCheck, QrCode, Lock, Globe, Server, AlertTriangle, 
    Smartphone, BarChart3, TrendingUp, Cpu, Workflow, ArrowRight,
    Users, Briefcase, Zap, Star, LayoutDashboard
} from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";
import productBanner from '../../assets/banners/product_page.jpg';

const Glow = ({ color, className }) => (
  <div className={`glow-bg h-72 w-72 ${color} ${className}`} />
);

const SectionTag = ({ children, className = '' }) => (
  <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-[11px] font-black uppercase tracking-[0.25em] mb-6 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.05] mb-6 ${className}`}>
    {children}
  </h2>
);

export default function WebProduct() {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-12 px-6 min-h-[85vh] flex items-center overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-blue-600" className="top-1/2 -right-32 opacity-15" />
                
                <div className="container mx-auto text-center relative z-10 ">
                    <div 
                        onClick={() => setContactOpen(true)}
                        className="hero-slide-enter relative w-full mx-auto mb-10 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/5 cursor-pointer group"
                    >
                        <div className="relative w-full" style={{ aspectRatio: '1672/741' }}>
                            <img 
                                src={productBanner} 
                                alt="Product Page banner" 
                                className="absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-in-out group-hover:scale-[1.01]"
                            />
                        </div>
                        <div className="absolute inset-0 pointer-events-none rounded-[2rem] ring-1 ring-inset ring-white/10 z-20" />
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white-[0.02] transition-colors z-20 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHAT IS AUTHENTIKS? ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 bg-white/[0.02]">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <SectionTag className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                                <Zap size={14} /> What is Authentiks?
                            </SectionTag>
                            <SectionTitle>More Than QR Codes — A Complete Product Intelligence Platform</SectionTitle>
                            <p className="text-gray-400 font-bold mb-8 text-lg">Authentiks is an end-to-end solution that enables brands to:</p>
                            
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Assign a unique identity to every product unit",
                                    "Detect counterfeit activity in real time",
                                    "Turn product scans into customer engagement",
                                    "Gain actionable insights through data and analytics"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                                        </div>
                                        <span className="text-gray-300 font-bold leading-tight">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="inline-flex items-center gap-3 text-indigo-400 font-black italic">
                                <ArrowRight size={18} /> From factory to customer — everything is connected.
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 rounded-[3rem] blur-[60px]" />
                            <div className="glass-effect p-12 rounded-[3rem] border border-white/10 relative z-10">
                                <div className="aspect-square bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                                  <div className="absolute w-full h-[2px] bg-indigo-500/50 animate-scan pointer-events-none" />
                                  <QrCode size={120} className="text-indigo-400/80" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ CORE CAPABILITIES ═══════════════ */}
            <section className="py-24 px-6 relative">
                <Glow color="bg-cyan-600" className="top-1/4 -right-32 opacity-10" />
                <Glow color="bg-indigo-600" className="bottom-1/4 -left-32 opacity-10" />
                
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-20 md:mb-32">
                        <SectionTag className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                            <Cpu size={14} /> Core Capabilities
                        </SectionTag>
                        <SectionTitle>The Power Inside Authentiks</SectionTitle>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ShieldCheck, title: "1. Product Authentication", sub: "Ensure every product is genuine",
                                points: ["Unique QR code for every unit", "First-scan authentication logic", "Duplicate scan detection", "Real-time counterfeit alerts"],
                                highlight: "Know instantly if your product is being copied"
                            },
                            {
                                icon: QrCode, title: "2. QR Code Serialization", sub: "Every product gets its own identity",
                                points: ["Serialized QR generation", "Batch-level tracking", "Secure backend mapping", "No reuse without detection"],
                                highlight: "Not just SKU-level — unit-level intelligence"
                            },
                            {
                                icon: Zap, title: "3. Print, Label & Deliver", sub: "Zero operational hassle",
                                points: ["QR labels printed with scratch layer", "Ready-to-use format", "Delivered directly to warehouse", "Fully managed process"],
                                highlight: "No need for multiple vendors"
                            },
                            {
                                icon: Smartphone, title: "4. Customer Engagement", sub: "Turn scans into relationships",
                                points: ["Redirect users to your website", "Offer coupons & rewards", "Capture customer data", "Direct communication channel"],
                                highlight: "Reduce dependency on marketplaces"
                            },
                            {
                                icon: BarChart3, title: "5. Analytics Dashboard", sub: "Make smarter business decisions",
                                points: ["Scan data by location", "Authentic vs duplicate metrics", "Customer behavior insights", "Product performance tracking"],
                                highlight: "Data that drives growth"
                            },
                            {
                                icon: AlertTriangle, title: "6. Real-Time Alerts", sub: "Act before damage spreads",
                                points: ["Suspicious scan detection", "Geo-based fraud alerts", "Batch-level anomaly tracking", "High-frequency scan locks"],
                                highlight: "Stop counterfeit at the source"
                            }
                        ].map((cap, i) => (
                            <div key={i} className="glass-effect p-8 rounded-[2rem] border border-white/5 group hover:border-indigo-500/30 transition-all duration-500 flex flex-col">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all text-gray-400">
                                    <cap.icon size={28} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2 tracking-tight">{cap.title}</h3>
                                <p className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-widest">{cap.sub}</p>
                                
                                <ul className="space-y-3 mb-8 flex-grow">
                                    {cap.points.map((p, j) => (
                                        <li key={j} className="flex items-start gap-3 text-sm text-gray-300 font-bold leading-tight">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500/50 shrink-0" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                                
                                <div className="pt-4 border-t border-white/5 flex items-start gap-2 text-indigo-400 text-sm font-black italic">
                                    <ArrowRight size={16} className="shrink-0 mt-0.5" />
                                    {cap.highlight}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ HOW IT WORKS (Condensed) ═══════════════ */}
            <section className="py-24 px-6 border-y border-white/5 bg-gradient-to-b from-black/20 to-transparent">
                <div className="container mx-auto max-w-6xl text-center relative z-10">
                    <SectionTag><Workflow size={14} /> How It Works</SectionTag>
                    <SectionTitle>Simple. Scalable. Powerful.</SectionTitle>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-16 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20" />
                        
                        {[
                            { title: 'Order Labels', desc: 'Share product details & qty' },
                            { title: 'We Generate', desc: 'Secure QR labels shipped' },
                            { title: 'Apply', desc: 'Integrate into packaging' },
                            { title: 'Scan', desc: 'Customers authenticate' },
                            { title: 'Track', desc: 'Monitor from dashboard' }
                        ].map((step, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-2xl glass-effect border border-white/10 flex items-center justify-center text-xl font-black text-white mb-4">
                                    0{i+1}
                                </div>
                                <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">{step.title}</h4>
                                <p className="text-xs text-gray-400 font-bold">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ THE DIFFERENCE / IMPACT / SECURITY ═══════════════ */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Box 1 */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col">
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Differentiation</h3>
                            <p className="text-sm font-bold text-gray-400 mb-6 tracking-wide">Built for Real-World Brands</p>
                            <ul className="space-y-4 mb-8 flex-grow">
                                {["Unit-level unique QR", "Physical label + scratch system", "Duplicate scan intelligence", "Customer engagement layer", "No-tech onboarding"].map((t, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                        <ShieldCheck size={18} className="text-emerald-400 shrink-0" /> {t}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-emerald-400 font-black italic flex gap-2"><ArrowRight size={16}/> From creation to customer</p>
                        </div>

                        {/* Box 2 */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all flex flex-col">
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Business Impact</h3>
                            <p className="text-sm font-bold text-gray-400 mb-6 tracking-wide">Drive Growth & Protect Brand</p>
                            <ul className="space-y-4 mb-8 flex-grow">
                                {["Increase direct customer traffic", "Reduce counterfeit losses", "Improve customer trust", "Build your own customer DB"].map((t, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                        <TrendingUp size={18} className="text-blue-400 shrink-0" /> {t}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-blue-400 font-black italic flex gap-2"><ArrowRight size={16}/> Your product becomes growth engine</p>
                        </div>

                        {/* Box 3 */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 transition-all flex flex-col">
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Security</h3>
                            <p className="text-sm font-bold text-gray-400 mb-6 tracking-wide">Designed to Prevent Fraud</p>
                            <ul className="space-y-4 mb-8 flex-grow">
                                {["Unique identity every product", "Backend validation system", "Duplicate scan detection", "Secure data handling"].map((t, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                        <Lock size={18} className="text-purple-400 shrink-0" /> {t}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-purple-400 font-black italic flex gap-2"><ArrowRight size={16}/> Verified scans, tracked anomalies</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHO IS THIS FOR ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-black/40">
                <div className="container mx-auto max-w-5xl text-center">
                    <SectionTag><Users size={14} /> Who is this for?</SectionTag>
                    <SectionTitle>Built for Brands of All Sizes</SectionTitle>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
                        <div className="glass-effect p-8 rounded-2xl border border-white/5 group">
                            <h4 className="text-indigo-400 font-black text-xl mb-4">Startups & D2C</h4>
                            <p className="text-gray-400 font-bold leading-relaxed">Build trust from day one and acquire direct customers through product packaging without marketplace dependency.</p>
                        </div>
                        <div className="glass-effect p-8 rounded-2xl border border-white/5 group">
                            <h4 className="text-blue-400 font-black text-xl mb-4">Growing Brands</h4>
                            <p className="text-gray-400 font-bold leading-relaxed">Drive repeat purchases, offer rewards, and protect your expanding market share against copycats.</p>
                        </div>
                        <div className="glass-effect p-8 rounded-2xl border border-white/5 group">
                            <h4 className="text-emerald-400 font-black text-xl mb-4">Enterprises</h4>
                            <p className="text-gray-400 font-bold leading-relaxed">Monitor vast distribution networks, track SKU movement globally, and actively prevent massive counterfeit revenue leakages.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FINAL CTA ═══════════════ */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative rounded-[3rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-blue-600/10 to-transparent" />
                        <div className="glass-effect rounded-[3rem] p-12 md:p-20 text-center relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                                Ready to Turn Your Products Into a Competitive Advantage?
                            </h2>
                            <p className="text-gray-400 font-bold mb-10 text-lg">
                                Start protecting, tracking, and growing your brand with Authentiks.
                            </p>
                            <button
                                onClick={() => setContactOpen(true)}
                                className="px-12 py-6 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm inline-flex items-center gap-3"
                            >
                                Start Your 90-Day Free Trial
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <WebFooter />
            <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </div>
    );
}
