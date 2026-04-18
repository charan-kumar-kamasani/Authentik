import React, { useState } from "react";
import { 
    Mail, MapPin, MessageSquare, ArrowRight, Phone, Building2, CheckCircle2
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

export default function WebContactUs() {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-24 md:pt-36 pb-20 px-6 overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-blue-600" className="top-1/2 -right-32 opacity-15" />
                
                <div className="container mx-auto text-center relative z-10 max-w-5xl">
                    <SectionTag className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                        <MessageSquare size={14} /> Get in Touch
                    </SectionTag>

                    <h1 className="hero-slide-enter text-4xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.05]">
                        Let’s Build a <span className="gradient-text">Smarter Product Ecosystem</span> for Your Brand
                    </h1>
                    
                    <p className="hero-slide-enter-delay max-w-3xl mx-auto text-lg md:text-2xl font-bold text-gray-400 mb-10 leading-relaxed">
                        Whether you’re a startup, growing D2C brand, or enterprise — our team will help you get started with Authentiks in the fastest way possible.
                    </p>

                    <div className="hero-slide-enter-delay flex flex-col items-center">
                        <button 
                            onClick={() => setContactOpen(true)}
                            className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm flex items-center gap-3"
                        >
                            Request Demo & Pricing
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════ CONTACT INFO GRID ═══════════════ */}
            <section className="py-20 px-6 border-t border-white/5 bg-white/[0.02]">
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {/* QUICK CONTACT */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 flex flex-col h-full hover:border-indigo-500/30 transition-colors">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Quick Contact</h3>
                            <p className="text-gray-400 font-bold mb-8">Prefer to reach us directly?</p>
                            
                            <ul className="space-y-6 flex-grow">
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Email</span>
                                        <span className="text-white font-bold text-sm">support@authentiks.in</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">WhatsApp</span>
                                        <span className="text-white font-bold text-sm">+91 9342501819</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* COMPANY DETAILS */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 flex flex-col h-full hover:border-indigo-500/30 transition-colors">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Company</h3>
                            <p className="text-gray-400 font-bold mb-6 text-sm">Authentiks is a product by Recomm Innovations Private Limited, focused on building next-generation product intelligence and authentication systems for global brands.</p>
                            
                            <div className="flex items-start gap-4 mt-auto">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <div className="text-sm font-bold text-gray-300 leading-relaxed">
                                    2nd Floor, F Block, Plot no: 264, Door no: F/22,<br/>
                                    VOC Nagar Main Rd, Anna Nagar,<br/>
                                    Chennai, Tamil Nadu 600102
                                </div>
                            </div>
                        </div>

                        {/* WHY BRANDS CONTACT US */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 flex flex-col h-full hover:border-indigo-500/30 transition-colors">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Why Brands Contact Us</h3>
                            <p className="text-gray-400 font-bold mb-6 text-sm">What you can expect:</p>
                            
                            <ul className="space-y-4 mb-8 flex-grow">
                                {[
                                    "Personalized demo within 24 hours",
                                    "Pricing based on your production scale",
                                    "Implementation guidance",
                                    "Quick onboarding plan"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                        <span className="text-gray-300 font-bold text-sm">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="pt-6 border-t border-white/5 text-indigo-400 font-black italic flex items-center gap-2 text-sm">
                                <ArrowRight size={16} /> No tech complexity. Just results.
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════ FINAL CTA ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                        Ready to Protect and Grow Your Brand?
                    </h2>
                    <p className="text-gray-400 font-bold mb-10 text-lg">
                        Stop losing revenue to counterfeits and marketplaces.
                    </p>
                    <button
                        onClick={() => setContactOpen(true)}
                        className="px-12 py-6 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm inline-flex items-center gap-3"
                    >
                        Start Your 90-Day Free Trial
                        <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            <WebFooter />
            <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </div>
    );
}
