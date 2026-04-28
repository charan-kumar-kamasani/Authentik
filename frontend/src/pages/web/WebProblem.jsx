import React, { useState } from "react";
import {
    AlertTriangle, TrendingDown, Users, EyeOff, PackageX, Link2Off,
    Newspaper, Activity, IndianRupee, ArrowRight, ShieldCheck, Zap, PlayCircle
} from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";
import problemBanner from "../../assets/banners/Problem.jpg";

const Glow = ({ color, className }) => (
    <div className={`absolute rounded-full blur-[100px] pointer-events-none mix-blend-screen h-72 w-72 ${color} ${className}`} />
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

export default function WebProblem() {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col font-sans">
            <WebHeader />

            {/* ═══════════════ BANNER SECTION ═══════════════ */}
            <section className="relative pt-12 px-6 min-h-[85vh] flex items-center overflow-hidden">
                <Glow color="bg-red-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-orange-600" className="top-1/2 -right-32 opacity-15" />

                <div className="container mx-auto text-center relative z-10 ">
                    <div
                        onClick={() => setContactOpen(true)}
                        className="hero-slide-enter relative w-[94%] mx-auto mb-10 rounded-[2rem] overflow-hidden shadow-2xl shadow-red-500/20 border border-white/5 cursor-pointer group"
                    >
                        <div className="relative w-full" style={{ aspectRatio: '1672/741' }}>
                            <img
                                src={problemBanner}
                                alt="The Problem"
                                className="absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-in-out group-hover:scale-[1.01]"
                            />
                        </div>
                        <div className="absolute inset-0 pointer-events-none rounded-[2rem] ring-1 ring-inset ring-white/10 z-20" />
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white-[0.02] transition-colors z-20 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* ═══════════════ THE REALITY (DATA-DRIVEN) ═══════════════ */}
            <section className="py-24 px-6 relative">
                <Glow color="bg-red-600" className="top-0 left-1/4 opacity-10" />
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <SectionTag className="bg-red-500/10 border-red-500/20 text-red-400">
                            <Activity size={14} /> The Reality
                        </SectionTag>
                        <SectionTitle>Counterfeiting Is Not Small — It’s Massive</SectionTitle>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {[
                            { stat: "25–30%", desc: "Of products sold in India are counterfeit or fake" },
                            { stat: "35%", desc: "Of Indians encountered fake products in just one year" },
                            { stat: "9 out of 10", desc: "Urban consumers have bought a fake product at least once" }
                        ].map((item, i) => (
                            <div key={i} className="glass-effect p-10 rounded-[2rem] border border-white/5 bg-white/5 text-center flex flex-col items-center justify-center">
                                <h3 className="text-5xl font-black text-white mb-4">{item.stat}</h3>
                                <p className="text-gray-400 font-bold text-lg">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
                        <div className="px-6 py-3 rounded-xl bg-black/40 border border-red-500/20 text-red-400 font-bold flex items-center gap-3">
                            <ArrowRight size={16} /> This is not an edge case.
                        </div>
                        <div className="px-6 py-3 rounded-xl bg-black/40 border border-red-500/20 text-red-400 font-bold flex items-center gap-3">
                            <ArrowRight size={16} /> This is the default reality of the market.
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ THE 5 PROBLEMS ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-black/20 to-transparent relative">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* PROBLEM 1 */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-white">Counterfeits Are Everywhere</h3>
                            </div>
                            <h4 className="text-xl font-bold text-gray-300 mb-6">Fake Products Are Growing Faster Than Real Ones</h4>
                            <p className="text-sm font-bold text-gray-400 mb-4">Industries most affected:</p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex justify-between border-b border-white/10 pb-2 text-gray-300 font-bold"><span>Apparel</span><span className="text-red-400">~31% fake</span></li>
                                <li className="flex justify-between border-b border-white/10 pb-2 text-gray-300 font-bold"><span>FMCG</span><span className="text-red-400">~28% fake</span></li>
                                <li className="flex justify-between border-b border-white/10 pb-2 text-gray-300 font-bold"><span>Pharma</span><span className="text-red-400">~20% fake</span></li>
                            </ul>
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-bold italic text-sm">
                                👉 Counterfeiting is no longer just luxury — it’s everyday products: food, medicines, cosmetics.
                            </div>
                        </div>

                        {/* PROBLEM 2 */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-white">Marketplaces Own Your Customers</h3>
                            </div>
                            <h4 className="text-xl font-bold text-gray-300 mb-6">You Build the Brand. They Own the Data.</h4>
                            <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 font-bold">
                                53% of counterfeit purchases happen via online platforms.
                            </div>
                            <ul className="space-y-3 mb-6">
                                {["You don’t control customer data", "You can’t build relationships", "You depend on platforms for growth"].map((p, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300 font-bold">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/50 shrink-0" /> {p}
                                    </li>
                                ))}
                            </ul>
                            <div className="text-orange-400 font-bold italic text-sm border-l-2 border-orange-500 pl-4 py-1">
                                👉 You’re not building a brand — you’re building their ecosystem.
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* PROBLEM 3 */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group flex flex-col">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center text-gray-400">
                                    <EyeOff size={24} />
                                </div>
                                <h3 className="text-xl font-black text-white">Zero Visibility After Sale</h3>
                            </div>
                            <h4 className="text-lg font-bold text-gray-300 mb-4">You Have No Idea What Happens Post-Sale</h4>
                            <ul className="space-y-3 mb-6 flex-grow">
                                {["Where your product is being sold", "Where counterfeit activity is happening", "Which markets are growing"].map((p, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400 font-bold">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500/50 shrink-0" /> {p}
                                    </li>
                                ))}
                            </ul>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold italic text-sm">
                                👉 You’re making business decisions blind.
                            </div>
                        </div>

                        {/* PROBLEM 4 */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group flex flex-col">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                                    <PackageX size={24} />
                                </div>
                                <h3 className="text-xl font-black text-white">Distribution Leakages</h3>
                            </div>
                            <h4 className="text-lg font-bold text-gray-300 mb-4">Uncontrolled Movement = Hidden Losses</h4>
                            <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10 mb-6 flex-grow space-y-3">
                                <p className="text-xs text-yellow-500 font-black uppercase tracking-widest">Real Examples:</p>
                                <p className="text-sm font-bold text-gray-300">₹1.8 crore worth of fake FMCG goods seized in Bengaluru.</p>
                                <p className="text-sm font-bold text-gray-300">Fake products replicating brands like detergents, tea, and cleaners.</p>
                            </div>
                            <div className="text-yellow-400 font-bold italic text-sm">
                                👉 If fake supply chains exist… your real supply chain is already compromised.
                            </div>
                        </div>

                        {/* PROBLEM 5 */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group flex flex-col">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Link2Off size={24} />
                                </div>
                                <h3 className="text-xl font-black text-white">No Customer Connection</h3>
                            </div>
                            <h4 className="text-lg font-bold text-gray-300 mb-4">You Lose the Customer After First Sale</h4>
                            <ul className="space-y-3 mb-6 flex-grow">
                                {["No direct engagement", "No data capture", "No repeat strategy"].map((p, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400 font-bold">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/50 shrink-0" /> {p}
                                    </li>
                                ))}
                            </ul>
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold italic text-sm">
                                👉 Every product sold = lost opportunity.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ REAL INCIDENTS ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <SectionTag className="bg-white/10 border-white/20 text-white">
                            <Newspaper size={14} /> Breaking News
                        </SectionTag>
                        <SectionTitle>Real Incidents Happening Now</SectionTitle>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        {[
                            {
                                title: "Fake Dairy Floods India: Counterfeit Milk, Ghee and Paneer Cases Surge 2.5X, Raising Safety Fears",
                                videoId: "vZy6e458f_4"
                            },
                            {
                                title: "Delhi Police Busts Fake Consumer Goods Racket in Burari | India Today News",
                                videoId: "N0ZTMju6DNY"
                            },
                            {
                                title: "India Today Probe: Killer Syrup Plant Exposed; Fake Medicine Racket Uncovered",
                                videoId: "t4sDzmRKkNE"
                            },
                            {
                                title: "Undercover in India's Most Notorious Black Market",
                                videoId: "NXnh4Obknvo"
                            },
                            {
                                title: "Counterfeit Mafia Exposed: Fake Scotch, Medicines & $24M Bank Heist | BODY TO BEIING",
                                videoId: "nv9Ov_KJLpg"
                            },
                            {
                                title: "India Today Exposes Fake Ghee Scam: Adulterated Products Sold In Branded Packaging",
                                videoId: "kOlaUqvE5hQ"
                            },
                            {
                                title: "Fake Nescafe ENO Coffee: 20 लाख की नकली NesCafe Eno पकड़ी",
                                videoId: "rK1ums7QxxU"
                            },
                            {
                                title: "Fake Medicine Racket Busted In Delhi’s Bhagirath Place",
                                videoId: "NiO4cEpyETk"
                            }
                        ].map((video, i) => (
                            <a
                                key={i}
                                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass-effect rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 group overflow-hidden flex flex-col hover:-translate-y-1 shadow-lg shadow-black/20"
                            >
                                <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                                    <img
                                        src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                                        alt={video.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform duration-300">
                                            <PlayCircle className="text-white fill-white" size={24} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 flex-grow flex flex-col">
                                    <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Watch Now
                                    </p>
                                    <h4 className="text-sm font-bold text-gray-200 leading-snug line-clamp-3 group-hover:text-white transition-colors">{video.title}</h4>
                                </div>
                            </a>
                        ))}
                    </div>

                    <div className="glass-effect p-8 rounded-3xl border border-red-500/30 bg-red-500/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <ul className="space-y-4">
                                {["Over 1.5 lakh fake FMCG sachets seized in Delhi", "Spurious medicine rackets operating across multiple cities", "Fake food and beverage products being manufactured at scale", "Counterfeit drug networks spreading across states"].map((p, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300 font-bold">
                                        <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" /> {p}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex flex-col gap-3 justify-center items-center md:items-start pl-0 md:pl-12 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0">
                                <p className="text-xl font-black text-red-400 flex gap-2"><ArrowRight /> This is organized.</p>
                                <p className="text-xl font-black text-red-400 flex gap-2"><ArrowRight /> This is scalable.</p>
                                <p className="text-xl font-black text-red-400 flex gap-2"><ArrowRight /> And it directly impacts your brand.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ ROOT CAUSE & COST ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-black/40">
                <div className="container mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <SectionTag className="bg-gray-500/10 border-gray-500/20 text-gray-400">
                                Root Cause
                            </SectionTag>
                            <h3 className="text-3xl font-black text-white mb-6">Products Are Invisible After They Leave You</h3>
                            <p className="text-gray-400 font-bold mb-6">Today’s products:</p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex gap-3 font-bold text-gray-300"><div className="mt-1.5 w-2 h-2 rounded-full bg-gray-500" /> Cannot verify themselves</li>
                                <li className="flex gap-3 font-bold text-gray-300"><div className="mt-1.5 w-2 h-2 rounded-full bg-gray-500" /> Cannot communicate</li>
                                <li className="flex gap-3 font-bold text-gray-300"><div className="mt-1.5 w-2 h-2 rounded-full bg-gray-500" /> Cannot provide insights</li>
                            </ul>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold italic">
                                👉 In a digital world, your product is still offline and blind.
                            </div>
                        </div>

                        <div>
                            <SectionTag className="bg-red-500/10 border-red-500/20 text-red-400">
                                The Cost of Doing Nothing
                            </SectionTag>
                            <h3 className="text-3xl font-black text-white mb-6">What This Is Really Costing You</h3>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                    <TrendingDown className="text-red-400" /> <span className="text-gray-300 font-bold">Revenue loss (fake products)</span>
                                </li>
                                <li className="flex items-center gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                    <IndianRupee className="text-orange-400" /> <span className="text-gray-300 font-bold">Margin loss (marketplaces)</span>
                                </li>
                                <li className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <Users className="text-blue-400" /> <span className="text-gray-300 font-bold">Data loss (no customer ownership)</span>
                                </li>
                                <li className="flex items-center gap-4 p-4 rounded-xl bg-gray-500/5 border border-gray-500/10">
                                    <ShieldCheck className="text-gray-400" /> <span className="text-gray-300 font-bold">Brand damage (trust erosion)</span>
                                </li>
                            </ul>
                            <div className="text-red-400 font-black italic text-lg">
                                👉 These losses compound every single month.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ THE SOLUTION ═══════════════ */}
            <section className="py-24 px-6 border-t border-white/5 relative overflow-hidden">
                <Glow color="bg-indigo-600" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 w-[800px] h-[800px]" />
                
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <SectionTag className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                        The Shift Happening Now
                    </SectionTag>
                    <SectionTitle>Smart Brands Are Taking Back Control</SectionTitle>
                    <p className="text-xl text-gray-300 font-bold mb-12">
                        Modern brands are moving towards product-level authentication, direct-to-customer engagement, real-time visibility, and data-driven decision making.
                    </p>
                    
                    <div className="inline-block p-1 rounded-full bg-gradient-to-r from-red-500 via-gray-500 to-indigo-500 mb-16">
                        <div className="px-8 py-4 rounded-full bg-black text-white font-black uppercase tracking-widest">
                            The old system is broken.
                        </div>
                    </div>

                    <h3 className="text-4xl font-black text-white mb-8">What If Every Product Could…</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 font-bold text-indigo-300">Prove it’s real?</div>
                        <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 font-bold text-cyan-300">Show where it’s scanned?</div>
                        <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 font-bold text-blue-300">Connect to your customer?</div>
                        <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 font-bold text-purple-300">Generate business insights?</div>
                    </div>
                    <p className="text-2xl text-indigo-400 font-black italic mb-24">👉 That’s what a smart product ecosystem looks like.</p>

                    {/* Transition to Authentiks */}
                    <div className="glass-effect p-12 rounded-[3rem] border border-white/10 shadow-2xl shadow-indigo-500/20">
                        <Zap className="mx-auto text-indigo-400 mb-6" size={48} />
                        <h3 className="text-3xl font-black text-white mb-8">This Is Exactly What Authentiks Enables</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl"><ShieldCheck className="text-indigo-400"/> <span className="font-bold text-white">Unique identity for every product</span></div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl"><Activity className="text-indigo-400"/> <span className="font-bold text-white">Real-time tracking</span></div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl"><Users className="text-indigo-400"/> <span className="font-bold text-white">Customer engagement via scan</span></div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl"><AlertTriangle className="text-indigo-400"/> <span className="font-bold text-white">Instant counterfeit detection</span></div>
                        </div>
                        <div className="text-2xl text-white font-black uppercase tracking-widest bg-gradient-to-r from-indigo-500 to-cyan-500 text-transparent bg-clip-text">
                            From Product → Platform
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FINAL CTA ═══════════════ */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative rounded-[3rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-cyan-600/20 to-black" />
                        <div className="glass-effect rounded-[3rem] p-12 md:p-20 text-center relative z-10 border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.2)]">
                            <h2 className="text-3xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                                Stop Losing Control of Your Products
                            </h2>
                            <p className="text-indigo-200 font-bold mb-10 text-xl">
                                Start protecting, tracking, and growing your brand today.
                            </p>
                            <button
                                onClick={() => setContactOpen(true)}
                                className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 text-sm md:text-base inline-flex items-center gap-3"
                            >
                                👉 Unlock 90 Days of Premium Features
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
