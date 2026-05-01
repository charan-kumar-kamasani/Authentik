import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
    ShieldCheck, QrCode, Lock, Globe, Server, AlertTriangle, 
    Smartphone, BarChart3, TrendingUp, Cpu, Workflow, ArrowRight,
    Users, Briefcase, Zap, Star, LayoutDashboard, CheckCircle2
} from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";
import productBanner from '../../assets/banners/product_page.jpg';
import mobileProductBanner from '../../assets/banners/Mobile banner authentiks/Product.png';

// Product Step Images
import qr1 from '../../assets/demo_qrs/product/QR1.jpg';
import qr2 from '../../assets/demo_qrs/product/QR2.jpg';
import qr3 from '../../assets/demo_qrs/product/QR3.jpg';

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
            <section className="relative pt-8 md:pt-12 px-4 md:px-6 md:min-h-[85vh] flex items-center overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-blue-600" className="top-1/2 -right-32 opacity-15" />
                
                <div className="container mx-auto text-center relative z-10 ">
                    {/* Desktop Banner */}
                    <div 
                        onClick={() => setContactOpen(true)}
                        className="hidden md:block hero-slide-enter relative w-[88%] mx-auto mb-10 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/5 cursor-pointer group"
                    >
                        <div className="relative w-full" style={{ aspectRatio: '1672/800' }}>
                            <img 
                                src={productBanner} 
                                alt="Product Page banner" 
                                className="absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-in-out group-hover:scale-[1.01]"
                            />
                        </div>
                        <div className="absolute inset-0 pointer-events-none rounded-[2rem] ring-1 ring-inset ring-white/10 z-20" />
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white-[0.02] transition-colors z-20 pointer-events-none" />
                    </div>

                    {/* Mobile Banner & CTA */}
                    <div className="block md:hidden hero-slide-enter relative w-[94%] mx-auto mb-8">
                        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-white/10 mb-5">
                            <img 
                                src={mobileProductBanner} 
                                alt="Product Page banner" 
                                className="w-full h-auto object-contain"
                            />
                        </div>
                        <Link to="/live-demo" className="w-full">
                            <button
                                className="group w-full px-8 py-5 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:scale-[1.02] active:scale-95 text-xs flex items-center justify-center gap-3 mx-auto"
                            >
                                Live Demo
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHAT IS AUTHENTIKS? ═══════════════ */}
            <section className="py-12 md:py-12 px-6 border-t border-white/5 bg-white/[0.02]">
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

            {/* ═══════════════ FROM LABEL TO CUSTOMER TRUST ═══════════════ */}
            <section className="py-24 px-6 relative overflow-hidden">
                <Glow color="bg-indigo-600" className="top-0 left-1/4 opacity-10" />
                <Glow color="bg-blue-600" className="bottom-0 right-1/4 opacity-10" />
                
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <SectionTag className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                            From Label to Customer Trust
                        </SectionTag>
                        <SectionTitle>See How Authentiks Works on Your Product</SectionTitle>
                        <p className="text-gray-400 font-bold max-w-2xl mx-auto text-lg">
                            From printing to customer scan — every step is designed for security, durability, and brand trust.
                        </p>
                    </div>

                    {/* 🧩 STEP FLOW (3-CARD GRID) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        {[
                            {
                                step: "Step 1",
                                title: "Unique QR Code Creation",
                                img: qr1,
                                subTitle: "Unique QR Code Assigned to Every Product",
                                desc: "Each product gets a unique, encrypted QR code generated through Authentiks. This gives every item a secure digital identity that cannot be duplicated.",
                                highlights: ["One QR per product", "Linked to SKU, batch, and product data", "Ready for printing and packaging"],
                                borderColor: "border-blue-500/30",
                                tagColor: "bg-blue-500/10 text-blue-400"
                            },
                            {
                                step: "Step 2",
                                title: "Tamper-Proof Protection",
                                img: qr2,
                                subTitle: "Secure Scratch-Protected Label",
                                desc: "A hologram scratch layer protects the QR code, ensuring it cannot be scanned before purchase — eliminating misuse and fraud.",
                                highlights: ["Prevents unauthorized pre-scans", "Ensures only end customers verify", "Builds trust at point of sale"],
                                borderColor: "border-amber-500/30",
                                tagColor: "bg-amber-500/10 text-amber-400"
                            },
                            {
                                step: "Step 3",
                                title: "Customer Verification",
                                img: qr3,
                                subTitle: "Instant Scan & Verification",
                                desc: "Customers scratch and scan to instantly verify authenticity and engage directly with your brand.",
                                highlights: ["Real-time authenticity check", "Detect counterfeit attempts", "Enable offers, rewards & engagement"],
                                borderColor: "border-emerald-500/30",
                                tagColor: "bg-emerald-500/10 text-emerald-400"
                            }
                        ].map((item, i) => (
                            <div key={i} className={`glass-effect rounded-[2.5rem] overflow-hidden border ${item.borderColor} flex flex-col group hover:-translate-y-2 transition-all duration-300 bg-white/5`}>
                              <div className="h-72 overflow-hidden bg-slate-950 flex items-center justify-center relative p-2">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50" />
                                    <img 
                                        src={item.img} 
                                        alt={item.title} 
                                        className="max-w-[90%] max-h-[90%] object-contain rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group-hover:scale-110 transition-transform duration-700" 
                                    />
                                    <div className={`absolute top-6 left-6 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl ${item.tagColor} border border-white/10 backdrop-blur-xl z-20`}>
                                        {item.step}
                                    </div>
                                </div>
                                <div className="p-10 flex flex-col flex-grow">
                                    <h3 className="text-xl font-black text-white mb-4 leading-tight">{item.subTitle}</h3>
                                    <p className="text-gray-400 font-bold text-sm leading-relaxed mb-6 flex-grow">{item.desc}</p>
                                    
                                    <div className="space-y-3 pt-6 border-t border-white/5">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Highlights:</p>
                                        {item.highlights.map((h, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-300">
                                                <CheckCircle2 size={14} className="text-indigo-400" />
                                                {h}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 📏 LABEL SPECIFICATIONS */}
                    <div className="glass-effect rounded-[3rem] p-8 md:p-16 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10 items-center">
                            <div>
                                <SectionTag className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                                    Label Specifications
                                </SectionTag>
                                <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">
                                    Built for Real-World Conditions
                                </h3>
                                
                                <div className="space-y-8">
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <LayoutDashboard size={20} />
                                            </div>
                                            <h4 className="text-white font-black text-lg">Size</h4>
                                        </div>
                                        <p className="text-gray-400 font-bold ml-14">
                                            2.5 cm (H) × 2 cm (W) — compact and easy to fit across all product types.
                                        </p>
                                    </div>

                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <h4 className="text-white font-black text-lg">Material & Build</h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-14">
                                            {["High-quality industrial adhesive", "Scratch-enabled hologram layer", "Waterproof — withstands moisture & handling", "Non-tearable — tamper-resistant and durable"].map((spec, idx) => (
                                                <div key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                    {spec}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-white/[0.03] rounded-3xl p-8 border border-white/10">
                                    <h4 className="text-white font-black text-xl mb-6 flex items-center gap-3">
                                        <Globe size={20} className="text-blue-400" />
                                        Placement Flexibility
                                    </h4>
                                    <p className="text-gray-400 font-bold mb-6">Works seamlessly on:</p>
                                    <div className="flex flex-wrap gap-3 mb-8">
                                        {["Packaging boxes", "Apparel tags & footwear", "Bottles", "Containers", "Electronics"].map((p, idx) => (
                                            <span key={idx} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-gray-300">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-black italic">
                                        Custom sizes and designs available for enterprise brands.
                                    </div>
                                </div>

                                <div className="text-center p-8 bg-gradient-to-br from-indigo-600/20 to-transparent rounded-3xl border border-white/5">
                                    <p className="text-white font-black text-xl italic mb-2">
                                        “Every scan is not just a verification — it’s a customer connection.”
                                    </p>
                                    <p className="text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px]">Trust Line</p>
                                </div>
                            </div>
                        </div>
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
