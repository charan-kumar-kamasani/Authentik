import React, { useState } from "react";
import { 
    Workflow, QrCode, ShieldCheck, Printer, Package, Smartphone, 
    BarChart3, AlertTriangle, CheckCircle2, Zap, Clock, HelpCircle, ArrowRight,
    TrendingUp, Lock, ChevronDown
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

const MicroFaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div 
            className={`glass-effect p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${isOpen ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 hover:border-indigo-500/20'}`}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex justify-between items-center gap-4">
                <h4 className="text-lg font-black text-white">{question}</h4>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-indigo-500 text-white rotate-180' : 'bg-white/5 text-gray-400'}`}>
                    <ChevronDown size={16} />
                </div>
            </div>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="text-indigo-400 font-bold flex items-center gap-2 pt-2 border-t border-white/5">
                        <ArrowRight size={16}/> {answer}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function WebHowItWorks() {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-10 md:pt-16 pb-20 px-6 overflow-hidden">
                <Glow color="bg-emerald-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-blue-600" className="top-1/2 -right-32 opacity-15" />
                
                <div className="container mx-auto text-center relative z-10 max-w-5xl">
                    <SectionTag className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                        <Workflow size={14} /> Full Connectivity
                    </SectionTag>

                    <h1 className="hero-slide-enter text-4xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.05] uppercase">
                        From Product Creation to Customer Connection — <span className="gradient-text-green">Fully Connected</span>
                    </h1>
                    
                    <p className="hero-slide-enter-delay max-w-3xl mx-auto text-lg md:text-2xl font-bold text-gray-400 mb-6 leading-relaxed">
                        Authentiks gives every product a unique identity, tracks its journey and turns every scan into insight and engagement.
                    </p>

                    <p className="hero-slide-enter-delay text-emerald-400 font-black italic flex items-center justify-center gap-2 mb-10">
                        <ArrowRight size={18} /> Simple to start. Powerful to scale.
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
            <section className="py-16 px-6 border-t border-white/5 bg-white/[0.02]">
                <div className="container mx-auto max-w-5xl text-center">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">One Platform. Complete Control.</h3>
                    <p className="text-gray-400 font-bold mb-8">From the moment your product is created to when it reaches the customer — Authentiks ensures:</p>
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm font-black text-gray-300 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-indigo-400"/> Authenticity</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-indigo-400"/> Traceability</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-indigo-400"/> Customer Interaction</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-indigo-400"/> Data Visibility</span>
                    </div>
                </div>
            </section>

            {/* ═══════════════ STEP-BY-STEP FLOW ═══════════════ */}
            <section className="py-24 px-6 relative">
                <Glow color="bg-indigo-600" className="top-1/3 left-1/2 -translate-x-1/2 opacity-10" />
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="text-center mb-16">
                        <SectionTitle>Step-By-Step Flow</SectionTitle>
                    </div>

                    <div className="space-y-6">
                        {[
                            { 
                                step: '1', title: 'Order Your QR Codes', icon: QrCode, color: 'emerald',
                                desc: "You share product (SKU) details and quantity required. We handle everything else."
                            },
                            { 
                                step: '2', title: 'Unique QR Generated for Every Unit', icon: ShieldCheck, color: 'blue',
                                desc: "Each product gets a unique identity. Even within the same SKU, no two codes are the same. Secure backend mapping ensures traceability. Not batch-level. Unit-level intelligence."
                            },
                            { 
                                step: '3', title: 'Printed, Secured & Delivered', icon: Printer, color: 'amber',
                                desc: "QR labels printed in ready-to-use format. Optional scratch layer for added protection. Delivered directly to your factory or warehouse. No setup. No multiple vendors."
                            },
                            { 
                                step: '4', title: 'Apply to Your Products', icon: Package, color: 'purple',
                                desc: "Stick labels on packaging or product. No technical integration required. Works with your existing process."
                            },
                            { 
                                step: '5', title: 'Customer Scans the Product', icon: Smartphone, color: 'indigo',
                                desc: "✅ First Scan: Product verified as authentic, Brand message / landing page shown. \n⚠️ Multiple Scans: Marked as suspicious, Logged in backend. Every scan tells a story."
                            },
                            { 
                                step: '6', title: 'Real-Time Tracking & Insights', icon: BarChart3, color: 'cyan',
                                desc: "Your dashboard shows scan locations (map view), authentic vs duplicate scans, customer engagement, and product performance. Turn scans into decisions."
                            },
                            { 
                                step: '7', title: 'Detect & Act on Counterfeits', icon: AlertTriangle, color: 'red',
                                desc: "Get alerts on unusual scan patterns. Identify high-risk regions. Track affected batches. Act before damage spreads."
                            }
                        ].map((s, i) => (
                            <div key={i} className="glass-effect p-8 md:p-10 rounded-[2rem] border border-white/5 flex flex-col md:flex-row gap-8 items-start group hover:border-white/20 transition-all">
                                <div className={`w-16 h-16 rounded-2xl bg-${s.color}-500/10 border border-${s.color}-500/30 flex items-center justify-center shrink-0`}>
                                    <h3 className={`text-2xl font-black text-${s.color}-400`}>0{s.step}</h3>
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-3 flex items-center gap-3">
                                        {s.title}
                                        <s.icon size={20} className={`text-${s.color}-400 opacity-50`} />
                                    </h3>
                                    <p className="text-gray-400 font-bold leading-relaxed whitespace-pre-line">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ TRUST & SECURITY (CRITICAL BLOCK) ═══════════════ */}
            <section className="py-24 px-6 border-y border-white/5 bg-gradient-to-b from-black/40 to-transparent relative">
                <Glow color="bg-red-600" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 w-[800px] blur-[200px]" />
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <SectionTag className="bg-red-500/10 border-red-500/20 text-red-500">
                        <Lock size={14} /> Critical Security Block
                    </SectionTag>
                    <SectionTitle>Built to Prevent Misuse — Not Just Detect It</SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-left">
                        {[
                            "Unique QR per unit",
                            "Cannot be reused without detection",
                            "Backend validation for every scan",
                            "Duplicate activity flagged instantly"
                        ].map((text, i) => (
                            <div key={i} className="glass-effect p-6 rounded-2xl flex items-center gap-4 border border-red-500/10">
                                <ShieldCheck size={24} className="text-red-400 shrink-0" />
                                <span className="text-white font-bold">{text}</span>
                            </div>
                        ))}
                    </div>
                    
                    <h4 className="mt-10 text-xl font-black text-red-400 uppercase tracking-widest italic flex items-center justify-center gap-2">
                        <ArrowRight size={20} /> Your brand stays protected at every stage
                    </h4>
                </div>
            </section>

            {/* ═══════════════ GRIDS: DIFFERENT / IMPACT / TIME ═══════════════ */}
            <section className="py-24 px-6 relative">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* WHY THIS IS DIFFERENT */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 hover:-translate-y-2 transition-all">
                            <SectionTag className="bg-indigo-500/10 border-indigo-500/20 mb-8"><Zap size={14} className="text-indigo-400"/> Differentiator</SectionTag>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Not Just Software — A Complete Execution System</h3>
                            <p className="text-gray-500 font-bold mb-6 text-sm">Most solutions: <br/><span className="text-red-400">❌ Only generate QR</span></p>
                            <p className="font-bold text-gray-300 mb-2">Authentiks:</p>
                            <ul className="space-y-2 mb-8">
                                {["Generates", "Prints", "Secures", "Delivers", "Tracks", "Engages"].map((item, i) =>(
                                    <li key={i} className="flex items-center gap-2 text-white font-black"><CheckCircle2 size={16} className="text-emerald-400"/> {item}</li>
                                ))}
                            </ul>
                            <div className="text-indigo-400 font-black italic flex gap-2"><ArrowRight size={16}/> Everything handled in one place</div>
                        </div>

                        {/* BUSINESS IMPACT */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 hover:-translate-y-2 transition-all">
                            <SectionTag className="bg-blue-500/10 border-blue-500/20 mb-8"><TrendingUp size={14} className="text-blue-400"/> Results</SectionTag>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">What Happens After You Start</h3>
                            <ul className="space-y-4 mb-8">
                                <li className="font-bold text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">Customers trust your products</li>
                                <li className="font-bold text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">You get direct traffic from scans</li>
                                <li className="font-bold text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">Counterfeits become visible</li>
                                <li className="font-bold text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">You gain real market data</li>
                            </ul>
                            <div className="text-blue-400 font-black italic flex gap-2"><ArrowRight size={16}/> Your product becomes your data engine</div>
                        </div>

                        {/* TIME TO GO LIVE */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 hover:-translate-y-2 transition-all">
                            <SectionTag className="bg-emerald-500/10 border-emerald-500/20 mb-8"><Clock size={14} className="text-emerald-400"/> Deployment</SectionTag>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Start in Days — Not Months</h3>
                            <ul className="space-y-4 mb-8 text-gray-300 font-bold">
                                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> No integration required</li>
                                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> No technical dependency</li>
                                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Fast onboarding</li>
                            </ul>
                            <div className="text-emerald-400 font-black italic flex gap-2"><ArrowRight size={16}/> Go live almost immediately</div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════ COMMON QUESTIONS (MICRO FAQ) ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 bg-white/[0.02]">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-16">
                        <SectionTag><HelpCircle size={14} /> Micro FAQ</SectionTag>
                        <SectionTitle>Common Questions</SectionTitle>
                    </div>

                    <div className="space-y-6">
                        <MicroFaqItem 
                            question="Do I need any technical setup?" 
                            answer="No — plug-and-play" 
                        />
                        <MicroFaqItem 
                            question="Can QR codes be copied?" 
                            answer="Copies are detected instantly through scan behavior" 
                        />
                        <MicroFaqItem 
                            question="Can I track my products geographically?" 
                            answer="Yes — real-time location insights" 
                        />
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
                                Ready to See Authentiks in Action?
                            </h2>
                            <p className="text-gray-400 font-bold mb-10 text-lg">
                                Start with zero complexity and full control over your products.
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
