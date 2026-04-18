import React, { useState } from "react";
import { 
    Factory, Sparkles, Shirt, Pill, Monitor, Wine, Rocket, 
    CheckCircle2, ArrowRight, Activity, Building2
} from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";

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

export default function WebIndustries() {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-24 md:pt-36 pb-20 px-6 overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-cyan-600" className="top-1/2 -right-32 opacity-15" />
                
                <div className="container mx-auto text-center relative z-10 max-w-5xl">
                    <h1 className="hero-slide-enter text-4xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.05]">
                        Built for Every Industry That <span className="gradient-text-blue">Sells Physical Products</span>
                    </h1>
                    
                    <p className="hero-slide-enter-delay max-w-3xl mx-auto text-lg md:text-2xl font-bold text-gray-400 mb-6 leading-relaxed">
                        From startups to large enterprises — Authentiks helps brands protect their products, track their movement, and connect directly with customers.
                    </p>

                    <p className="hero-slide-enter-delay text-indigo-400 font-black italic flex items-center justify-center gap-2 mb-10">
                        <ArrowRight size={18} /> One platform. Multiple industries. Endless possibilities.
                    </p>

                    <div className="hero-slide-enter-delay-2 flex flex-col items-center">
                        <button 
                            onClick={() => setContactOpen(true)}
                            className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm flex items-center gap-3"
                        >
                            Start Your 90-Day Free Trial
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════ OVERVIEW ═══════════════ */}
            <section className="py-20 px-6 border-t border-white/5 bg-white/[0.02]">
                <div className="container mx-auto max-w-4xl text-center">
                    <SectionTag><Building2 size={14} /> Global Application</SectionTag>
                    <SectionTitle>If You Make It, We Make It Smart</SectionTitle>
                    <p className="text-gray-400 font-bold mb-10 text-lg">Authentiks works across industries where:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {[
                            "Counterfeits are a risk",
                            "Customer trust matters",
                            "Distribution visibility is limited",
                            "Direct customer connection is valuable"
                        ].map((text, i) => (
                            <div key={i} className="glass-effect p-6 rounded-2xl flex items-center gap-4 border border-white/5 hover:border-indigo-500/30 transition-colors">
                                <Activity size={24} className="text-indigo-400 shrink-0" />
                                <span className="text-gray-300 font-bold">{text}</span>
                            </div>
                        ))}
                    </div>
                    <h4 className="mt-12 text-xl font-black text-indigo-400 italic">
                        👉 If you sell physical products, Authentiks is built for you.
                    </h4>
                </div>
            </section>

            {/* ═══════════════ INDUSTRIES GRID ═══════════════ */}
            <section className="py-24 px-6 relative">
                <Glow color="bg-emerald-600" className="top-1/4 -right-32 opacity-10" />
                <Glow color="bg-purple-600" className="bottom-1/4 -left-32 opacity-10" />
                
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[
                            {
                                icon: Factory, title: "FMCG", sub: "High Volume. Low Visibility. High Risk.", color: "emerald",
                                challenges: ["Difficult to track product movement", "Counterfeits in local markets", "No direct connection with customers"],
                                solutions: ["Unique QR for every unit", "Track scan locations across regions", "Engage customers through product scans"],
                                highlight: "Turn high-volume sales into actionable insights"
                            },
                            {
                                icon: Sparkles, title: "Cosmetics & Personal Care", sub: "Trust is Everything", color: "pink",
                                challenges: ["Fake products damage brand reputation", "Customers unsure about authenticity", "Heavy dependency on marketplaces"],
                                solutions: ["Instant product authentication", "Build customer confidence", "Drive traffic to your own platform"],
                                highlight: "Protect your brand and build loyalty"
                            },
                            {
                                icon: Shirt, title: "Apparel & Fashion", sub: "Brand Value at Risk", color: "amber",
                                challenges: ["Counterfeit replicas in the market", "Limited visibility post-sale", "No engagement after purchase"],
                                solutions: ["Unique identity for each product", "Post-purchase engagement via QR", "Customer data collection"],
                                highlight: "Extend your brand experience beyond purchase"
                            },
                            {
                                icon: Pill, title: "Pharma & Healthcare", sub: "Safety and Authenticity Are Critical", color: "blue",
                                challenges: ["Fake medicines pose serious risks", "Strict compliance and traceability needs", "Limited end-user verification"],
                                solutions: ["Unit-level authentication", "Batch tracking and monitoring", "Customer-level verification"],
                                highlight: "Ensure safety and compliance at scale"
                            },
                            {
                                icon: Monitor, title: "Electronics & Consumer Goods", sub: "High Value. High Counterfeit Risk.", color: "cyan",
                                challenges: ["Fake or refurbished products sold as new", "Warranty fraud", "Lack of traceability"],
                                solutions: ["Secure product verification", "Link QR to warranty registration", "Track product journey"],
                                highlight: "Protect revenue and customer trust"
                            },
                            {
                                icon: Wine, title: "Alcohol & Premium Products", sub: "Regulated and High-Risk Market", color: "purple",
                                challenges: ["Counterfeit products in circulation", "Strict compliance requirements", "Need for track-and-trace"],
                                solutions: ["Secure labeling with scratch layer", "Track distribution channels", "Detect anomalies quickly"],
                                highlight: "Bring transparency to a regulated industry"
                            },
                            {
                                icon: Rocket, title: "D2C & Startup Brands", sub: "Growth Without Dependency", color: "orange",
                                challenges: ["Heavy reliance on marketplaces", "High commission margins", "No direct customer relationship"],
                                solutions: ["Drive customers to your own website", "Offer coupons and rewards via scan", "Build your own customer database"],
                                highlight: "Turn products into your marketing channel",
                                className: "lg:col-span-2"
                            }
                        ].map((ind, i) => (
                            <div key={i} className={`glass-effect p-8 md:p-12 rounded-[2.5rem] border border-white/5 hover:border-${ind.color}-500/30 transition-all duration-500 flex flex-col ${ind.className || ''}`}>
                                <div className={`w-16 h-16 rounded-2xl bg-${ind.color}-500/10 border border-${ind.color}-500/20 flex items-center justify-center mb-6 text-${ind.color}-400`}>
                                    <ind.icon size={32} />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{ind.title}</h3>
                                <p className={`text-sm font-black uppercase tracking-widest text-${ind.color}-400 mb-8`}>{ind.sub}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 flex-grow">
                                    <div>
                                        <h4 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">Challenges:</h4>
                                        <ul className="space-y-3">
                                            {ind.challenges.map((c, j) => (
                                                <li key={j} className="flex items-start gap-3 text-sm text-gray-400 font-bold">
                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500/50 shrink-0" />
                                                    {c}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-4">How Authentiks Helps:</h4>
                                        <ul className="space-y-3">
                                            {ind.solutions.map((s, j) => (
                                                <li key={j} className="flex items-start gap-3 text-sm text-gray-300 font-bold">
                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500/50 shrink-0" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className={`pt-6 border-t border-white/5 text-${ind.color}-400 font-black italic flex items-center gap-2`}>
                                    <ArrowRight size={18} /> {ind.highlight}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHY AUTHENTIKS WORKS ACROSS INDUSTRIES ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-black/40 to-transparent">
                <div className="container mx-auto max-w-4xl text-center">
                    <SectionTag><CheckCircle2 size={14} /> Universal Solution</SectionTag>
                    <SectionTitle>One Platform. Multiple Use Cases.</SectionTitle>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-left">
                        {[
                            "Unique identity for every product",
                            "Physical QR labels delivered to you",
                            "Real-time tracking and analytics",
                            "Customer engagement built-in"
                        ].map((text, i) => (
                            <div key={i} className="glass-effect p-6 rounded-2xl flex items-center gap-4 border border-white/10 shadow-lg">
                                <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                                <span className="text-white font-bold">{text}</span>
                            </div>
                        ))}
                    </div>
                    
                    <h4 className="mt-10 text-xl font-black text-indigo-400 uppercase tracking-widest italic">
                        👉 Adaptable to any product-based business
                    </h4>
                </div>
            </section>

            {/* ═══════════════ FINAL CTA ═══════════════ */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative rounded-[3rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-blue-600/10 to-transparent" />
                        <div className="glass-effect rounded-[3rem] p-12 md:p-20 text-center relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                                No Matter Your Industry —<br />Your Products Deserve Intelligence
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
