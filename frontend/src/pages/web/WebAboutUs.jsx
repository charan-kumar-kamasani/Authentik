import React, { useState } from "react";
import {
    Globe2, ShieldCheck, Target, Lightbulb, Users, BarChart3,
    ArrowRight, Linkedin, Building2, MapPin
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

export default function WebAboutUs() {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-10 md:pt-16pb-20 px-6 overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-cyan-600" className="top-1/2 -right-32 opacity-15" />

                <div className="container mx-auto text-center relative z-10 max-w-5xl">
                    <SectionTag className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                        <Globe2 size={14} /> Our Mission
                    </SectionTag>

                    <h1 className="hero-slide-enter text-4xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.05]">
                        Building the Future of <span className="gradient-text">Trusted Products</span>
                    </h1>

                    <p className="hero-slide-enter-delay max-w-3xl mx-auto text-lg md:text-2xl font-bold text-gray-400 mb-10 leading-relaxed">
                        At Authentiks, we believe every product should be authentic, traceable, and directly connected to the brand that created it.
                    </p>

                    <p className="hero-slide-enter-delay-2 text-indigo-400 font-black italic flex items-center justify-center gap-2">
                        <ArrowRight size={18} /> We’re on a mission to bring trust, transparency, and intelligence to every physical product.
                    </p>
                </div>
            </section>

            {/* ═══════════════ OUR STORY ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 bg-white/[0.02]">
                <div className="container mx-auto max-w-4xl">
                    <div className="glass-effect p-10 md:p-16 rounded-[3rem] border border-white/5 relative overflow-hidden">
                        <Glow color="bg-red-600" className="-top-20 -right-20 opacity-10 blur-[100px]" />
                        <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-8">Our Story: Why We Built Authentiks</h3>

                        <div className="text-gray-400 font-bold space-y-6 text-lg leading-relaxed mix-blend-lighten">
                            <p>In today’s market, brands face two major challenges:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-300">
                                <li>Counterfeit products damaging trust and revenue</li>
                                <li>Over-dependence on marketplaces limiting direct customer relationships</li>
                            </ul>
                            <p>We saw brands losing control over their products, visibility into where products go, and access to their own customers.</p>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <h4 className="text-xl font-black text-indigo-400 uppercase tracking-widest italic flex flex-col sm:flex-row sm:items-center gap-3">
                                <ArrowRight size={20} className="shrink-0" />
                                <span>So we built Authentiks. <br /><span className="text-gray-300 normal-case tracking-normal font-bold text-base not-italic mt-2 block">A platform that doesn’t just authenticate products — but helps brands protect, track and grow through every unit they sell.</span></span>
                            </h4>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHAT WE DO / VISION / MISSION ═══════════════ */}
            <section className="py-24 px-6 relative">
                <Glow color="bg-emerald-600" className="top-1/2 left-1/2 -translate-x-1/2 opacity-10" />
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* WHAT WE DO */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                                <Lightbulb size={28} />
                            </div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">What We Do</h4>
                            <p className="text-gray-400 font-bold mb-6 text-sm flex-grow">Authentiks transforms every product into a secure, verifiable asset, a trackable unit across markets, a direct customer touchpoint, and a source of real-time data.</p>
                            <p className="text-blue-400 font-black italic flex items-center gap-2 text-sm"><ArrowRight size={16} /> Your product becomes intelligent.</p>
                        </div>

                        {/* VISION */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 transition-all flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
                                <Globe2 size={28} />
                            </div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">Our Vision</h4>
                            <p className="text-gray-400 font-bold mb-6 text-sm flex-grow">We envision a world where every product is uniquely identifiable, counterfeits are instantly detectable, brands have complete visibility, and customers can trust what they buy.</p>
                            <p className="text-purple-400 font-black italic flex items-center gap-2 text-sm"><ArrowRight size={16} /> The infrastructure for trust.</p>
                        </div>

                        {/* MISSION */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                                <Target size={28} />
                            </div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">Our Mission</h4>
                            <p className="text-gray-400 font-bold mb-6 text-sm flex-grow">To empower brands with control and intelligence. We help brands protect their products, track movement, build direct relationships, and make data-driven decisions.</p>
                            <p className="text-emerald-400 font-black italic flex items-center gap-2 text-sm"><ArrowRight size={16} /> Control and Intelligence.</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════ WHO WE ARE (COMPANY BACKING) ═══════════════ */}
            <section className="py-16 px-6 border-y border-white/5">
                <div className="container mx-auto max-w-4xl text-center">
                    <SectionTag><Building2 size={14} /> Who We Are</SectionTag>
                    <SectionTitle>Backed by Recomm Innovations Private Limited</SectionTitle>
                    <p className="text-gray-400 font-bold text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                        Authentiks is a product of Recomm Innovations Private Limited, a company focused on building scalable, technology-driven solutions for modern businesses.
                    </p>
                </div>
            </section>

            {/* ═══════════════ FOUNDER SECTION ═══════════════ */}
            <section className="py-24 px-6 relative">
                <Glow color="bg-indigo-600" className="bottom-0 right-0 opacity-10" />
                <div className="container mx-auto max-w-5xl">
                    <div className="glass-effect p-10 md:p-16 rounded-[3rem] border border-white/5 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">

                        <div className="shrink-0 text-center md:text-left relative z-10 w-full md:w-1/3">
                            <div className="w-32 h-32 md:w-48 md:h-48 mx-auto md:mx-0 rounded-full border-4 border-white/10 overflow-hidden bg-white/5 mb-6 shadow-2xl p-6 flex flex-col justify-end">
                                {/* Placeholder for founder image, using an icon graphic instead for now to fit the dark modern theme elegantly */}
                                <Users size={100} className="text-indigo-400/20 translate-y-4 mx-auto" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Ibadul Hassan</h3>
                            <p className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-6">Founder & Business Head</p>
                            <a href="https://www.linkedin.com/in/ibadul-hassan-6430b247/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#0077b5]/10 text-white px-4 py-2 rounded-full border border-[#0077b5]/30 hover:bg-[#0077b5]/20 hover:scale-105 transition-all text-sm font-bold">
                                <Linkedin size={16} /> Connect on LinkedIn
                            </a>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════ WHAT MAKES US DIFFERENT & APPROACH ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-black/20 to-transparent">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <SectionTitle className="text-3xl">Built for Real-World Execution</SectionTitle>
                            <p className="text-gray-400 font-bold mb-8">Unlike traditional software platforms, Authentiks is designed to work in the real world:</p>
                            <ul className="space-y-4 list-none text-gray-300 font-bold">
                                {["Unit-level unique QR (not just SKU)", "Printed and delivered to your doorstep", "No technical integration required", "Combines authentication + engagement + analytics"].map((t, i) => (
                                    <li key={i} className="flex items-center gap-3"><ShieldCheck className="text-emerald-400" size={20} /> {t}</li>
                                ))}
                            </ul>
                            <p className="text-indigo-400 font-black italic flex items-center gap-2 mt-8"><ArrowRight size={18} /> We don’t just provide tools — we provide outcomes.</p>
                        </div>
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 flex flex-col justify-center">
                            <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Our Approach: Simple. Scalable. Practical.</h4>
                            <p className="text-gray-400 font-bold mb-6">We believe adoption matters more than complexity.</p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-white font-black"><span className="w-2 h-2 rounded bg-indigo-500"></span> Easy to start</li>
                                <li className="flex items-center gap-3 text-white font-black"><span className="w-2 h-2 rounded bg-indigo-500"></span> Fast to deploy</li>
                                <li className="flex items-center gap-3 text-white font-black"><span className="w-2 h-2 rounded bg-indigo-500"></span> Built to scale with your business</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHERE WE'RE HEADED / FINAL CTA ═══════════════ */}
            <section className="py-32 px-6 relative overflow-hidden">
                <Glow color="bg-indigo-600" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[150px] w-full" />
                <div className="container mx-auto max-w-4xl text-center relative z-10 glass-effect p-12 md:p-20 rounded-[3rem] border border-white/10 shadow-2xl">
                    <SectionTag><BarChart3 size={14} /> Where We're Headed</SectionTag>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                        Building the Operating System for Physical Products
                    </h2>
                    <p className="text-indigo-400 font-black italic flex items-center justify-center gap-2 mb-10 text-lg mx-auto max-w-2xl text-center">
                        👉 The default layer for product authentication, tracking and customer engagement across industries.
                    </p>
                    <p className="text-gray-400 font-bold mb-12 text-lg">
                        From startups to global enterprises — Authentiks aims to power every product journey.
                    </p>

                    <div className="pt-12 border-t border-white/5">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Join Us in Creating a Trusted Product Ecosystem</h3>
                        <p className="text-gray-400 font-bold mb-8">Whether you're just starting out or scaling rapidly — Authentiks is built to grow with you.</p>
                        <button
                            onClick={() => setContactOpen(true)}
                            className="px-12 py-6 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm inline-flex items-center gap-3"
                        >
                            Let's Build Together
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            <WebFooter />
            <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </div>
    );
}
