import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Zap, Calendar, Target, TrendingUp, AlertTriangle,
    ArrowRight, Mail, CheckCircle2,
    BrainCircuit, BarChart3, Users, Lightbulb, Activity, MapPin,
    ShieldAlert, Box, FileText, MoveRight
} from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";
import aiPulseBanner from "../../assets/banners/AI Pulse.jpg";
import mobileAIPulseBanner from '../../assets/banners/Mobile banner authentiks/AI Pulse.png';

// Reusable styling components
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

export default function WebAIPulse() {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col font-sans">
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
                                src={aiPulseBanner}
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
                                src={mobileAIPulseBanner} 
                                alt="AI Pulse Page banner" 
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

            {/* <section className="relative pt-24 pb-16 px-6 min-h-[85vh] flex items-center overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-cyan-600" className="top-1/2 -right-32 opacity-15" />
                <Glow color="bg-blue-600" className="bottom-0 left-1/2 transform -translate-x-1/2 opacity-10 w-96 h-96" />
                
                <div className="container mx-auto max-w-5xl text-center relative z-10 flex flex-col items-center">
                    <SectionTag className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 backdrop-blur-md">
                        <BrainCircuit size={14} className="animate-pulse" /> AI-Powered Intelligence
                    </SectionTag>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white tracking-tighter leading-[1.05] mb-8 drop-shadow-sm">
                        AI Pulse — Your Weekly <br className="hidden md:block" /> Growth Intelligence
                    </h1>
                    
                    <p className="text-gray-400 font-bold max-w-3xl mx-auto text-lg md:text-xl leading-relaxed mb-12">
                        Powered by <span className="text-indigo-400">Authentiks Intelligence</span>, AI Pulse analyzes your product data every week and delivers clear insights, risks, and action plans — so you always know what to do next.
                    </p>
                    
                    <button
                        onClick={() => setContactOpen(true)}
                        className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-full font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95 text-sm md:text-base inline-flex items-center gap-3 border border-white/10"
                    >
                        👉 Start Your 90-Day Free Trial
                        <ArrowRight size={18} className="animate-bounce-x" />
                    </button>
                    
                    <div className="w-full max-w-5xl mt-16 relative rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] border border-white/5 group">
                        <img 
                            src={aiPulseBanner} 
                            alt="AI Pulse Overview" 
                            className="w-full h-auto object-contain transition-transform duration-1000 ease-in-out group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 pointer-events-none rounded-[2rem] ring-1 ring-inset ring-white/10 z-20" />
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white-[0.02] transition-colors z-20 pointer-events-none" />
                    </div>
                </div>
            </section> */}


            {/* ═══════════════ WHAT IS AI PULSE? ═══════════════ */}
            <section className="py-12 md:py-12 px-6 border-t border-white/5 bg-white/[0.02] relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 rounded-[3rem] blur-[60px]" />
                            <div className="p-10 rounded-[3rem] border border-white/10 relative z-10 bg-black/40 backdrop-blur-xl">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-lg line-through opacity-50">No dashboards to analyze.</h4>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-lg line-through opacity-50">No data to interpret.</h4>
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />
                                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-lg">Just clear insights + clear actions.</h4>
                                            <p className="text-indigo-300/80 font-bold text-sm mt-1">Delivered directly to your inbox every week.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionTag className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                                <Zap size={14} /> What is AI Pulse?
                            </SectionTag>
                            <SectionTitle>Automatically Generated from Real Interactions</SectionTitle>
                            <p className="text-gray-400 font-bold mb-8 text-lg">
                                AI Pulse is your AI-powered weekly business report, automatically generated from real customer interactions with your products.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ HOW IT WORKS ═══════════════ */}
            <section className="py-24 px-6 relative">
                <Glow color="bg-cyan-600" className="top-1/4 -right-32 opacity-10" />
                <Glow color="bg-indigo-600" className="bottom-1/4 -left-32 opacity-10" />

                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-20 md:mb-24">
                        <SectionTag className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                            <Calendar size={14} /> How It Works
                        </SectionTag>
                        <SectionTitle>From Scans to Strategy</SectionTitle>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-14 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-emerald-500/20 z-0" />

                        {/* Step 1 */}
                        <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm relative z-10 flex flex-col hover:border-indigo-500/30 transition-colors">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 mx-auto md:mx-0">
                                <MapPin size={28} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">1. Data Collection</h3>
                            <p className="text-xs font-black text-indigo-400 mb-6 uppercase tracking-widest bg-indigo-500/10 inline-block px-3 py-1 rounded-full w-fit">Always On</p>
                            <p className="text-gray-400 font-bold mb-4 text-sm">Every scan from your product captures:</p>
                            <ul className="space-y-3 mt-auto">
                                {["Customer location", "Product engagement", "Repeat interactions"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-bold">
                                        <CheckCircle2 size={16} className="text-indigo-400 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Step 2 */}
                        <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm relative z-10 flex flex-col hover:border-cyan-500/30 transition-colors mt-0 md:-mt-8">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 mx-auto md:mx-0">
                                <BrainCircuit size={28} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">2. AI Analysis</h3>
                            <p className="text-xs font-black text-cyan-400 mb-6 uppercase tracking-widest bg-cyan-500/10 inline-block px-3 py-1 rounded-full w-fit">Weekly</p>
                            <p className="text-gray-400 font-bold mb-4 text-sm">Every week, AI Pulse analyzes:</p>
                            <ul className="space-y-3 mt-auto">
                                {["Performance trends", "Product-wise engagement", "City-wise demand", "Growth & drop patterns"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-bold">
                                        <CheckCircle2 size={16} className="text-cyan-400 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Step 3 */}
                        <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm relative z-10 flex flex-col hover:border-emerald-500/30 transition-colors">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 mx-auto md:mx-0">
                                <Mail size={28} />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">3. Weekly Report</h3>
                            <p className="text-xs font-black text-emerald-400 mb-6 uppercase tracking-widest bg-emerald-500/10 inline-block px-3 py-1 rounded-full w-fit">Delivered Mondays</p>
                            <p className="text-gray-400 font-bold mb-4 text-sm">You receive a ready-to-use intelligence report with:</p>
                            <ul className="space-y-3 mt-auto">
                                {["What’s working", "What’s not", "What to do next"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-bold">
                                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHAT YOU RECEIVE ═══════════════ */}
            <section className="py-24 px-6 border-y border-white/5 bg-gradient-to-b from-black/20 to-transparent">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <SectionTag className="bg-amber-500/10 border-amber-500/20 text-amber-400">
                            <Mail size={14} /> Inside the Inbox
                        </SectionTag>
                        <SectionTitle>What You Receive Every Week</SectionTitle>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Executive Summary */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 bg-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Executive Summary</h3>
                            </div>
                            <p className="text-sm font-bold text-gray-400 mb-6">A quick overview of your performance:</p>
                            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 border-l-4 border-l-indigo-500 relative">
                                <p className="text-white/90 font-medium leading-relaxed italic relative z-10">
                                    "Your brand saw a <span className="text-emerald-400 font-bold">14% growth</span> in engagement this week, driven by strong performance in <span className="text-white font-bold">Chennai</span>. However, repeat interactions declined, indicating a <span className="text-amber-400 font-bold">retention opportunity</span>."
                                </p>
                            </div>
                        </div>

                        {/* Key Metrics Snapshot */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 bg-white/5 relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <BarChart3 size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Key Metrics Snapshot</h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                    { label: "Total Scans", val: "12,450", trend: "+12%" },
                                    { label: "Growth %", val: "14%", trend: "Up" },
                                    { label: "Top Product", val: "Alpha Plus", trend: "" },
                                    { label: "Top City", val: "Chennai", trend: "" },
                                    { label: "Repeat Rate", val: "22%", trend: "-2%" }
                                ].map((metric, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-black/30 border border-white/5 flex flex-col">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-black mb-1">{metric.label}</p>
                                        <p className="text-lg font-black text-white">{metric.val}</p>
                                        {metric.trend && (
                                            <p className={`text-xs font-bold mt-1 ${metric.trend.startsWith('+') || metric.trend === 'Up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {metric.trend}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Key Insights */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-white/5 bg-white/5 relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <Target size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Key Insights</h3>
                            </div>
                            <ul className="space-y-4">
                                {["Identify your strongest markets", "Understand top-performing products", "Track engagement trends"].map((insight, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5">
                                        <Lightbulb size={16} className="text-cyan-400 shrink-0" />
                                        {insight}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* AI Recommendations */}
                        <div className="glass-effect p-10 rounded-[2.5rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent relative overflow-hidden group">
                            <div className="absolute top-0 right-0 px-4 py-1 bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">🔥 Core Value</div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <TrendingUp size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">AI Recommendations</h3>
                            </div>
                            <p className="text-sm font-bold text-gray-400 mb-6">Clear, actionable suggestions like:</p>
                            <ul className="space-y-4">
                                {[
                                    "Increase focus on high-performing markets",
                                    "Push top-performing products",
                                    "Improve retention with offers or campaigns"
                                ].map((rec, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-white bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                                        <MoveRight size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Alerts & Risks (Full Width) */}
                    <div className="mt-8 glass-effect p-10 rounded-[2.5rem] border border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                                    <ShieldAlert size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">⚠️ Alerts & Risks</h3>
                            </div>
                            <p className="text-sm font-bold text-gray-400 mb-6 md:mb-0">Proactive detection to protect your brand.</p>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                            {[
                                "Detect unusual scan activity",
                                "Identify potential counterfeit risks",
                                "Monitor sudden drops or spikes"
                            ].map((alert, i) => (
                                <div key={i} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-100 flex items-start gap-2">
                                    <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                    {alert}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ WHY AI PULSE IS DIFFERENT & WHO IS IT FOR ═══════════════ */}
            <section className="py-24 px-6 relative">
                <Glow color="bg-indigo-600" className="top-0 left-1/4 opacity-10" />

                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Why it's different */}
                        <div>
                            <SectionTag className="bg-blue-500/10 border-blue-500/20 text-blue-400">
                                <Target size={14} /> The Difference
                            </SectionTag>
                            <SectionTitle>Data vs. Direction</SectionTitle>

                            <div className="mb-8">
                                <p className="text-xl font-bold text-gray-400 line-through mb-2">Most tools give you data.</p>
                                <p className="text-2xl font-black text-indigo-400 mb-8">AI Pulse gives you direction.</p>
                            </div>

                            <p className="text-gray-300 font-bold mb-6">Instead of spending hours analyzing dashboards, you get:</p>

                            <div className="space-y-4 mb-10">
                                {["Weekly clarity", "Actionable insights", "Faster decision-making"].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <span className="text-white font-bold">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/20">
                                <h4 className="text-indigo-400 font-black mb-3 flex items-center gap-2">
                                    <Lightbulb size={18} /> Simple. Powerful. Automatic.
                                </h4>
                                <ul className="space-y-2">
                                    {["No manual analysis", "No complex tools", "No data expertise needed"].map((t, i) => (
                                        <li key={i} className="text-gray-300 text-sm font-bold flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> {t}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-4 text-white font-black italic flex gap-2 items-center text-sm">
                                    👉 Just open your inbox and grow your business
                                </p>
                            </div>
                        </div>

                        {/* Built for Decision Makers */}
                        <div className="lg:pl-10">
                            <SectionTag className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                                <Users size={14} /> Built For
                            </SectionTag>
                            <SectionTitle>Designed for Decision Makers</SectionTitle>

                            <div className="grid grid-cols-2 gap-4 mt-10">
                                {[
                                    { title: "Founders", icon: <BrainCircuit size={20} /> },
                                    { title: "Growth Teams", icon: <TrendingUp size={20} /> },
                                    { title: "Marketing Heads", icon: <Target size={20} /> },
                                    { title: "Operations Leaders", icon: <Activity size={20} /> }
                                ].map((role, i) => (
                                    <div key={i} className="glass-effect p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center hover:border-emerald-500/30 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 mb-4">
                                            {role.icon}
                                        </div>
                                        <h4 className="text-white font-black">{role.title}</h4>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4 text-emerald-300">
                                <Users size={24} className="shrink-0" />
                                <p className="font-black text-lg italic">
                                    👉 Anyone who wants to make smarter decisions faster
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ FINAL CTA ═══════════════ */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative rounded-[3rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-cyan-600/20 to-black" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>

                        <div className="glass-effect rounded-[3rem] p-12 md:p-20 text-center relative z-10 border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.2)]">
                            <h2 className="text-3xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                                Turn Your Weekly Data into Growth Decisions
                            </h2>
                            <p className="text-indigo-200 font-bold mb-10 text-xl">
                                Let AI do the analysis — you focus on execution.
                            </p>
                            <button
                                onClick={() => setContactOpen(true)}
                                className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 text-sm md:text-base inline-flex items-center gap-3"
                            >
                                👉 Start Your Free 90-Day Trial
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
