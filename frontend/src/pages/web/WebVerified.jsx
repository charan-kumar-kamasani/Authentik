import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, CheckCircle2, ArrowRight, Zap, Award, ExternalLink } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";

// Product and Banner Images
import allicinImg from "../../assets/Verified Products/Allicin.jpg";
import coralCalciumImg from "../../assets/Verified Products/Coral Calcium.jpg";
import creatineImg from "../../assets/Verified Products/Creatine.jpg";
import fvm55Img from "../../assets/Verified Products/FVM-55.jpg";
import fitMassImg from "../../assets/Verified Products/Fit-Mass.jpg";
import fitPreImg from "../../assets/Verified Products/Fit-Pre.jpg";
import fitWheyImg from "../../assets/Verified Products/Fit-Whey.jpg";
import gvImg from "../../assets/Verified Products/GV.jpg";
import livGuardImg from "../../assets/Verified Products/Liv Guard.jpg";
import livPurImg from "../../assets/Verified Products/LivPur+.jpg";
import multiDetoxImg from "../../assets/Verified Products/Multi Detox.jpg";
import vitaPurImg from "../../assets/Verified Products/VitaPur+.jpg";
import verifiedBanner from "../../assets/banners/Verified.jpg";
import mobileVerifiedBanner from "../../assets/banners/Mobile banner authentiks/Verified.jpg";

const Glow = ({ color, className }) => (
    <div className={`glow-bg h-72 w-72 ${color} ${className}`} />
);

const SectionTag = ({ children, className = '' }) => (
    <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-[11px] font-black uppercase tracking-[0.25em] mb-6 ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ children, className = '' }) => (
    <h2 className={`text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-6 ${className}`}>
        {children}
    </h2>
);

export default function WebVerified() {
    const [contactOpen, setContactOpen] = useState(false);

    const verifiedProducts = [
        {
            name: "Allicin",
            desc: "Premium Allicin Supplement",
            img: allicinImg,
            category: "Wellness & Health",
            badge: "Verified"
        },
        {
            name: "Coral Calcium",
            desc: "High-Quality Coral Calcium",
            img: coralCalciumImg,
            category: "Nutritional Health",
            badge: "Verified"
        },
        {
            name: "Creatine",
            desc: "Pure Muscle Recovery",
            img: creatineImg,
            category: "Fitness & Training",
            badge: "Verified"
        },
        {
            name: "FVM-55",
            desc: "Advanced Formula FVM-55",
            img: fvm55Img,
            category: "Wellness & Health",
            badge: "Verified"
        },
        {
            name: "Fit-Mass",
            desc: "Maximum Muscle Gainer",
            img: fitMassImg,
            category: "Fitness & Training",
            badge: "Verified"
        },
        {
            name: "Fit-Pre",
            desc: "Explosive Pre-Workout",
            img: fitPreImg,
            category: "Fitness & Training",
            badge: "Verified"
        },
        {
            name: "Fit-Whey",
            desc: "Premium Whey Protein",
            img: fitWheyImg,
            category: "Fitness & Training",
            badge: "Verified"
        },
        {
            name: "GV",
            desc: "Essential Daily Nutrition",
            img: gvImg,
            category: "Wellness & Health",
            badge: "Verified"
        },
        {
            name: "Liv Guard",
            desc: "Ultimate Liver Protection",
            img: livGuardImg,
            category: "Wellness & Health",
            badge: "Verified"
        },
        {
            name: "LivPur+",
            desc: "Advanced Liver Detox",
            img: livPurImg,
            category: "Wellness & Health",
            badge: "Verified"
        },
        {
            name: "Multi Detox",
            desc: "Complete Body Cleanse",
            img: multiDetoxImg,
            category: "Wellness & Health",
            badge: "Verified"
        },
        {
            name: "VitaPur+",
            desc: "Daily Vitamin Complex",
            img: vitaPurImg,
            category: "Wellness & Vitamins",
            badge: "Verified"
        }
    ];

    const trustPoints = [
        {
            title: "Prevent counterfeit products",
            desc: "Lock down every unit with serialized encrypted QR codes, ensuring only legitimate items reach your consumers.",
            icon: ShieldCheck,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            borderColor: "border-emerald-500/20"
        },
        {
            title: "Build customer trust",
            desc: "Provide customers a transparent, instantly verifiable history of authenticity right upon product first-scan.",
            icon: Award,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            borderColor: "border-blue-500/20"
        },
        {
            title: "Track product authenticity",
            desc: "Actively trace unauthorized scan attempts, duplicate prints, and location discrepancies instantly in the dashboard.",
            icon: Zap,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            borderColor: "border-purple-500/20"
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-8 md:pt-12 px-4 md:px-6 md:min-h-[85vh] flex items-center overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-blue-600" className="top-1/2 -right-32 opacity-15" />

                <div className="container mx-auto text-center relative z-10">
                    {/* Desktop Banner */}
                    <div
                        onClick={() => setContactOpen(true)}
                        className="hidden md:block hero-slide-enter relative w-[88%] mx-auto mb-10 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/5 cursor-pointer group"
                    >
                        <div className="relative w-full" style={{ aspectRatio: '1672/800' }}>
                            <img
                                src={verifiedBanner}
                                alt="Verified page banner"
                                className="absolute inset-0 w-full h-full object-fit transition-all duration-1000 ease-in-out group-hover:scale-[1.01]"
                            />
                        </div>
                        <div className="absolute inset-0 pointer-events-none rounded-[2rem] ring-1 ring-inset ring-white/10 z-20" />
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white-[0.02] transition-colors z-20 pointer-events-none" />
                    </div>

                    {/* Mobile Banner & CTA */}
                    <div className="block md:hidden hero-slide-enter relative w-[94%] mx-auto mb-8">
                        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-white/10 mb-5">
                            <img
                                src={mobileVerifiedBanner}
                                alt="Verified page banner"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                        <button
                            onClick={() => setContactOpen(true)}
                            className="group w-full px-8 py-6 bg-indigo-600 text-white rounded-full font-[900] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:scale-[1.02] active:scale-95 text-xl flex items-center justify-center gap-3 mx-auto"
                        >
                            Book a Demo
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════ 2. PRODUCT GRID (CORE SECTION) ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 bg-white/[0.01] relative overflow-hidden" id="verified-products">
                <Glow color="bg-cyan-600" className="top-1/4 -right-32 opacity-10" />
                <Glow color="bg-indigo-600" className="bottom-1/4 -left-32 opacity-10" />

                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <SectionTag className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                            🧱 Verified Products
                        </SectionTag>
                        <SectionTitle>Our Product Suite</SectionTitle>
                        <p className="text-gray-400 font-bold max-w-2xl mx-auto text-lg leading-relaxed mb-8">
                            Discover high-quality, securely verified products powered by Authentiks intelligence.
                        </p>
                        <a 
                            href="https://fitdnanutrition.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-500/10 text-cyan-400 rounded-full font-bold hover:bg-cyan-500/20 border border-cyan-500/30 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                        >
                            Visit FitDNA Nutrition <ExternalLink size={18} />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 justify-center">
                        {verifiedProducts.map((p, i) => (
                            <a 
                                key={i} 
                                href="https://fitdnanutrition.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="glass-effect rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col group hover:-translate-y-2 hover:border-cyan-500/40 transition-all duration-500 bg-white/5 shadow-xl hover:shadow-cyan-500/10 cursor-pointer"
                            >
                                <div className="aspect-square bg-slate-950 flex items-center justify-center relative p-6 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-black/20 opacity-40 pointer-events-none" />
                                    <img
                                        src={p.img}
                                        alt={p.name}
                                        className="max-w-[85%] max-h-[85%] object-contain rounded-2xl shadow-2xl transition-transform duration-700 ease-in-out group-hover:scale-105"
                                    />
                                    <span className="absolute top-6 left-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 bg-[#020617]/80 text-cyan-400 backdrop-blur-md">
                                        {p.badge}
                                    </span>
                                </div>
                                <div className="p-8 md:p-10 flex flex-col flex-grow relative">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">{p.category}</span>
                                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight leading-snug group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                                    <p className="text-gray-400 font-bold text-sm leading-relaxed flex-grow">{p.desc}</p>
                                    
                                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-sm font-black text-white/90">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={16} className="text-cyan-400" /> Inspected & Authenticated
                                        </div>
                                        <ExternalLink size={16} className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ 3. TRUST SECTION ═══════════════ */}
            <section className="py-24 px-6 border-y border-white/5 bg-gradient-to-b from-transparent via-indigo-950/10 to-black/30 relative">
                <Glow color="bg-purple-600" className="top-1/3 -right-32 opacity-10" />

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="text-center mb-16 md:mb-20">
                        <SectionTag className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                            🛡 Trust Section
                        </SectionTag>
                        <SectionTitle>Why Verification Matters</SectionTitle>
                        <p className="text-gray-400 font-bold max-w-2xl mx-auto text-lg leading-relaxed">
                            Protecting your brand integrity and cementing absolute loyalty.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {trustPoints.map((point, i) => (
                            <div key={i} className={`glass-effect rounded-[2rem] p-8 md:p-10 border ${point.borderColor} flex flex-col hover:-translate-y-1 transition-all duration-300 bg-white/5 group`}>
                                <div className={`w-14 h-14 rounded-2xl ${point.bg} ${point.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <point.icon size={26} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight">{point.title}</h3>
                                <p className="text-sm md:text-base font-bold text-gray-400 leading-relaxed flex-grow">
                                    {point.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ 4. BOTTOM CTA ═══════════════ */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative rounded-[3rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-blue-600/10 to-transparent" />
                        <div className="glass-effect rounded-[3rem] p-12 md:p-20 text-center relative z-10">
                            <SectionTag className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                                🚀 Bottom CTA
                            </SectionTag>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                                Protect your products with Authentiks
                            </h2>
                            <p className="text-gray-400 font-bold mb-10 text-lg">
                                Experience continuous growth, bulletproof authentication, and elevated direct-to-consumer relationship.
                            </p>
                            <button
                                onClick={() => setContactOpen(true)}
                                className="px-12 py-6 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm inline-flex items-center gap-3"
                            >
                                👉 Book a Demo
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
