import React, { useEffect, useState } from "react";
import { getPlans, getBillingConfig } from '../../config/api';
import {
    Check, Shield, Zap, TrendingUp, Globe, Star, X,
    Users, BarChart3, Repeat, AlertTriangle, QrCode, Lock, ArrowRight,
    Package, Truck, Smartphone, Gift, Crown, Sparkles
} from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";
import pricingBanner from "../../assets/banners/Pricing.jpg";

/* ═══════════════════════ REUSABLE COMPONENTS ═══════════════════════ */

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

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function WebPricing() {
    const [contactOpen, setContactOpen] = useState(false);
    const [selectedPlanName, setSelectedPlanName] = useState('');
    const [billingCycle, setBillingCycle] = useState('yearly'); // 'halfYearly' | 'yearly'

    // Static display data with pricing
    const pricingDisplayData = [
        {
            id: 'starter',
            name: 'STARTER',
            color: 'from-green-500 to-emerald-400',
            borderColor: 'border-green-500/20 hover:border-green-500/40',
            accentColor: 'text-green-400',
            bgGlow: 'bg-green-500/20',
            shadowColor: 'shadow-green-500/10',
            headerStyle: 'bg-green-500/10 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]',
            halfYearlyMonthly: 5000,
            yearlyMonthly: 4000,
            bonusQR: 5000,
            bestFor: 'Small brands starting authentication',
            includes: [
                'Unique QR for every product',
                'First-scan authentication',
                'Basic scan tracking',
                'Dashboard access'
            ],
            sections: [
                {
                    title: '🔒 Privacy-first analytics',
                    color: 'text-green-400',
                    features: [
                        'No personal user data',
                        'City-level scan insights'
                    ]
                }
            ]
        },
        {
            id: 'growth',
            name: 'GROWTH',
            isPopular: true,
            color: 'from-blue-600 to-indigo-400',
            borderColor: 'border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20 hover:border-blue-500/50',
            accentColor: 'text-blue-400',
            bgGlow: 'bg-blue-500/20',
            shadowColor: 'shadow-blue-500/20',
            headerStyle: 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]',
            halfYearlyMonthly: 10000,
            yearlyMonthly: 8000,
            bonusQR: 10000,
            bestFor: 'Brands building customer engagement',
            includes: [
                'Includes everything in Starter +',
                'Coupon & rewards engine',
                'Customer data capture (consent-based)',
                'Redirect to website',
                'Counterfeit alerts',
                'Advanced scan analytics'
            ],
            sections: [
                {
                    title: '✨ AI Pulse Insights',
                    color: 'text-blue-400',
                    features: [
                        'Customer behavior analysis',
                        'Scan trends & patterns',
                        'Actionable growth suggestions'
                    ]
                },
                {
                    title: '📊 Smart data access (consent-driven)',
                    color: 'text-blue-400',
                    features: [
                        'Name & Age Group',
                        'Gender & Contact Number',
                        'Exportable reports'
                    ]
                }
            ]
        },
        {
            id: 'enterprise',
            name: 'ENTERPRISE',
            color: 'from-purple-600 to-fuchsia-400',
            borderColor: 'border-purple-500/20 hover:border-purple-500/40',
            accentColor: 'text-purple-400',
            bgGlow: 'bg-purple-500/20',
            shadowColor: 'shadow-purple-500/10',
            headerStyle: 'bg-purple-500/10 border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]',
            halfYearlyMonthly: 20000,
            yearlyMonthly: 16000,
            bonusQR: 20000,
            bestFor: 'Large brands & scale operations',
            includes: [
                'Includes everything in Growth +',
                'Real-time counterfeit alerts',
                'Advanced analytics & insights',
                'Batch-level tracking',
                'API integrations',
                'Priority support'
            ],
            sections: [
                {
                    title: '🚀 Advanced AI Pulse',
                    color: 'text-purple-400',
                    features: [
                        'Predictive demand insights',
                        'Fraud detection patterns',
                        'Region-wise performance tracking',
                        'Automated growth recommendations'
                    ]
                }
            ]
        }
    ];

    const comparisonFeatures = [
        { name: "Authentication & Tracking", starter: "Basic", growth: "Advanced", enterprise: "Advanced" },
        { name: "Analytics & Insights", starter: "Basic", growth: "Advanced", enterprise: "Advanced" },
        { name: "Location Insights", starter: "City", growth: "Detailed", enterprise: "Detailed" },
        { name: "Engagement (Coupons, Redirects)", starter: "❌", growth: "Full", enterprise: "Full" },
        { name: "Data Export", starter: "❌", growth: "Full", enterprise: "Full" },
        { name: "Customer Data (Consent)", starter: "❌", growth: "Full", enterprise: "Full" },
        { name: "Counterfeit Detection", starter: "❌", growth: "Alerts", enterprise: "Real-time" },
        { name: "AI Pulse", starter: "❌", growth: "Insights", enterprise: "Predictive" },
        { name: "Advanced Capabilities (Batch, API, Support)", starter: "❌", growth: "❌", enterprise: "Full" }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-12 px-6 min-h-[85vh] flex items-center overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-cyan-600" className="top-1/2 -right-32 opacity-15" />

                <div className="container mx-auto text-center relative z-10 ">
                    <div
                        onClick={() => setContactOpen(true)}
                        className="hero-slide-enter relative w-[94%] mx-auto mb-10 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/5 cursor-pointer group"
                    >
                        <div className="relative w-full" style={{ aspectRatio: '1672/741' }}>
                            <img
                                src={pricingBanner}
                                alt="Pricing banner"
                                className="absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-in-out group-hover:scale-[1.01]"
                            />
                        </div>
                        <div className="absolute inset-0 pointer-events-none rounded-[2rem] ring-1 ring-inset ring-white/10 z-20" />
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white-[0.02] transition-colors z-20 pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* ═══════════════ CHOOSE YOUR PLAN ═══════════════ */}
            <section className="py-12 px-6 relative" id="pricing-plans">
                <Glow color="bg-indigo-600" className="-top-32 left-1/2 -translate-x-1/2 opacity-15" />
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <SectionTitle>Choose Your Plan</SectionTitle>

                        {/* Billing Toggle: Half-Yearly | Yearly */}
                        <div className="inline-flex items-center p-1.5 bg-white/5 rounded-full border border-white/10 relative mt-4">
                            <div
                                className={`absolute inset-y-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-300 shadow-md bg-white ${billingCycle === 'halfYearly' ? 'left-1.5' : 'left-[calc(50%+4.5px)]'}`}
                            />
                            <button
                                onClick={() => setBillingCycle('halfYearly')}
                                className={`relative z-10 px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-colors ${billingCycle === 'halfYearly' ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                Half-Yearly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`relative z-10 px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-colors flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                Yearly (Save 20%)
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        {pricingDisplayData.map((plan, idx) => {
                            const isYearly = billingCycle === 'yearly';
                            const monthlyPrice = isYearly ? plan.yearlyMonthly : plan.halfYearlyMonthly;
                            const cycleText = isYearly ? '(Yearly)' : '(Half-Yearly)';
                            const saveLabel = isYearly ? `Save 20% with yearly` : null;

                            return (
                                <div key={idx} className={`glass-effect rounded-[2.5rem] p-8 md:p-10 border relative transition-all duration-500 hover:-translate-y-2 group flex flex-col ${plan.borderColor} ${plan.shadowColor} ${isYearly ? 'ring-1 ring-white/10' : ''}`}>
                                    {plan.isPopular && (
                                        <>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)] flex items-center gap-2 border border-blue-400/30">
                                                    <Star size={12} fill="currentColor" />
                                                    Most Popular
                                                    <Star size={12} fill="currentColor" />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Background Glow Container (clipped) */}
                                    <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                                        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 transition-opacity group-hover:opacity-40 ${plan.bgGlow}`} />
                                    </div>

                                    <div className={`mb-8 mt-2 p-6 rounded-3xl border relative overflow-hidden ${plan.headerStyle}`}>
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                                        <div className="flex items-center justify-between mb-2 relative z-10">
                                            <h3 className={`text-xl font-black uppercase tracking-wider ${plan.accentColor}`}>{plan.name}</h3>
                                        </div>

                                        {/* Price display */}
                                        <div className="flex flex-col gap-1 mt-6 relative z-10">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">
                                                    ₹{monthlyPrice.toLocaleString()}
                                                </span>
                                                <span className="text-gray-400 font-bold text-sm tracking-widest uppercase">
                                                    / month
                                                </span>
                                            </div>
                                            <div className="text-sm font-bold text-gray-400 mt-1">
                                                {cycleText}
                                            </div>
                                        </div>
                                        {/* Yearly benefits badges */}
                                        {isYearly && (
                                            <div className="mt-6 flex flex-col gap-3 relative z-10">
                                                <div className={`inline-flex items-center gap-2 text-sm font-black animate-in slide-in-from-left duration-300 ${plan.accentColor}`}>
                                                    {plan.id === 'starter' ? '🟢' : plan.id === 'growth' ? '🔵' : '🟣'} {saveLabel}
                                                </div>
                                                <div className="inline-flex items-center gap-2 text-sm font-black text-white/90 animate-in slide-in-from-left duration-300" style={{ animationDelay: '100ms' }}>
                                                    <span className={plan.accentColor}>+</span> ₹{plan.bonusQR.toLocaleString()} QR Credits Included
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-8 bg-white/[0.03] rounded-2xl p-5 border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Best For:</p>
                                        <p className="text-sm font-bold text-white leading-relaxed">{plan.bestFor}</p>
                                    </div>

                                    <div className="flex-grow">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                                            Includes:
                                        </p>
                                        <ul className="space-y-3 mb-8">
                                            {plan.includes.map((f, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-300">
                                                    <div className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${plan.accentColor.replace('text-', 'bg-')}/40`} />
                                                    <span className="leading-tight">{f}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {plan.sections && plan.sections.map((section, si) => (
                                            <div key={si} className="mb-8 last:mb-0">
                                                <p className={`text-sm font-black mb-4 flex items-center gap-2 ${section.color}`}>
                                                    {section.title}
                                                </p>
                                                <ul className="space-y-3">
                                                    {section.features.map((f, fi) => (
                                                        <li key={fi} className="flex items-start gap-3 text-sm font-bold text-gray-400">
                                                            <div className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${plan.accentColor.replace('text-', 'bg-')}/20`} />
                                                            <span className="leading-tight">{f}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => { setSelectedPlanName(plan.name); setContactOpen(true); }}
                                        className={`w-full py-4 mt-8 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${plan.isPopular
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:brightness-110'
                                            : `bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-${plan.accentColor.split('-')[1]}-500/50`
                                            }`}
                                    >
                                        👉 Contact Sales
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* ⚡ TRUST LINE */}
                    <div className="mt-20 text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-gray-400">
                            <span className="text-xl">⚡</span>
                            “Customer data is shared only with user consent to ensure privacy and compliance.”
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ COMPARISON TABLE ═══════════════ */}
            <section className="py-24 px-6 overflow-x-hidden border-y border-white/5">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <SectionTag><BarChart3 size={14} /> Full Comparison</SectionTag>
                        <SectionTitle>Compare Plan Features</SectionTitle>
                    </div>

                    <div className="w-full overflow-x-auto pb-4">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="p-6 text-sm font-black text-white uppercase tracking-widest w-1/3">Features</th>
                                    <th className="p-6 text-sm font-black text-green-400 uppercase tracking-widest w-[22%] text-center">🟢 Starter</th>
                                    <th className="p-6 text-sm font-black text-blue-400 uppercase tracking-widest w-[22%] text-center">🔵 Growth ⭐</th>
                                    <th className="p-6 text-sm font-black text-purple-400 uppercase tracking-widest w-[22%] text-center">🟣 Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-bold">
                                {comparisonFeatures.map((f, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-6 text-gray-300 text-sm tracking-tight">{f.name}</td>
                                        <td className={`p-6 text-center text-sm ${f.starterClass || ''}`}>{f.starter}</td>
                                        <td className={`p-6 text-center text-sm ${f.growthClass || ''}`}>{f.growth}</td>
                                        <td className={`p-6 text-center text-sm ${f.enterpriseClass || ''}`}>{f.enterprise}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ═══════════════ LABELS PRICING ═══════════════ */}
            <section className="py-24 px-6 bg-gradient-to-b from-transparent to-black/40 relative">
                <Glow color="bg-indigo-600" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 blur-[150px] w-full" />
                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="text-center mb-16">
                        <SectionTag className="bg-purple-500/10 border-purple-500/20 text-purple-400"><QrCode size={14} /> Label Pricing</SectionTag>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.05] mb-4">
                            Serialized QR Labels —<br />Delivered to Your Doorstep
                        </h2>
                        <p className="text-gray-400 font-bold text-lg">Pricing from ₹3 → ₹1 per label (volume-based)</p>
                    </div>

                    <div className="glass-effect rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl shadow-indigo-500/5 mb-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.03]">
                                    <th className="px-8 py-6 text-xs font-black text-purple-400 uppercase tracking-widest">Quantity Range</th>
                                    <th className="px-8 py-6 text-xs font-black text-purple-400 uppercase tracking-widest text-right">Price per QR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-bold">
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6 text-white tracking-tight">1,000 – 5,000 units</td>
                                    <td className="px-8 py-6 text-right text-gray-300"><span className="text-xl text-white font-black">₹3</span>/QR</td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6 text-white tracking-tight">5,001 – 50,000 units</td>
                                    <td className="px-8 py-6 text-right text-gray-300"><span className="text-xl text-white font-black">₹2</span>/QR</td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6 text-white tracking-tight">50,001 + units</td>
                                    <td className="px-8 py-6 text-right text-gray-300"><span className="text-xl text-white font-black">₹1</span>/QR</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-sm font-bold text-gray-300">
                        <div className="flex items-center justify-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <Check size={18} className="text-emerald-400" /> Unique QR for every product unit
                        </div>
                        <div className="flex items-center justify-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <Check size={18} className="text-emerald-400" /> Tamper-proof & scratch-enabled
                        </div>
                        <div className="flex items-center justify-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <Check size={18} className="text-emerald-400" /> Ready-to-use delivery
                        </div>
                    </div>

                    <div className="text-center font-black italic text-lg flex items-center justify-center gap-3 border border-indigo-500/30 bg-indigo-500/10 p-6 rounded-2xl max-w-xl mx-auto shadow-lg shadow-indigo-500/10">
                        <ArrowRight size={20} className="text-indigo-400" />
                        <span className="text-white">Use your annual credits to offset label costs</span>
                    </div>
                </div>
            </section>

            {/* ═══════════════ ROI SECTION ═══════════════ */}
            <section className="py-20 px-6 bg-gradient-to-b from-black/40 to-transparent relative">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div>
                            <SectionTag className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"><BarChart3 size={14} /> ROI Calculator</SectionTag>
                            <SectionTitle>What Happens When Customers Scan Your Product?</SectionTitle>
                            <p className="text-gray-400 font-medium text-lg leading-relaxed mb-8 border-l-2 border-emerald-500/30 pl-4 py-1">
                                If <span className="text-white font-black">1,000 products</span> are scanned:
                            </p>

                            <div className="space-y-4 font-bold text-sm md:text-base">
                                {[
                                    { icon: Users, value: '400+', label: 'customers engage with your brand', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                    { icon: Globe, value: '100–200', label: 'users visit your website', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                                    { icon: Repeat, value: '50–100', label: 'potential repeat customers', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                                    { icon: AlertTriangle, value: 'Instant', label: 'alerts if duplicate/fake scans detected', color: 'text-red-400', bg: 'bg-red-500/10' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group">
                                        <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <span className="text-white font-black text-lg">{item.value}</span>
                                            <span className="text-gray-400 font-medium ml-2">{item.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-effect rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden flex flex-col items-center text-center justify-center h-full min-h-[300px]">
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20" />
                            <div className="relative z-10 w-full">
                                <h3 className="text-xl md:text-2xl font-black text-white mb-6 tracking-tight">The Authentiks Advantage</h3>
                                <div className="text-7xl font-black text-white tracking-tighter mb-4">10x</div>
                                <p className="text-gray-400 font-bold mb-6 text-lg flex flex-col gap-2">
                                    <span>Your ₹10K/month can generate</span>
                                    <span className="text-emerald-400">far more in repeat revenue.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════ HOW IT WORKS ═══════════════ */}
            <section className="py-24 px-6 overflow-hidden">
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="text-center mb-16">
                        <SectionTag>How It Works</SectionTag>
                        <SectionTitle>From Product to Customer in 4 Steps</SectionTitle>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                        {/* Connecting line (desktop) */}
                        <div className="hidden md:block absolute top-[72px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-purple-500/30" />

                        {[
                            { step: '01', icon: QrCode, title: 'Place your order', color: 'text-emerald-400', stepBg: 'bg-emerald-500/20 border-emerald-500/30', ring: 'ring-emerald-500/20' },
                            { step: '02', icon: Package, title: 'We generate & deliver', color: 'text-blue-400', stepBg: 'bg-blue-500/20 border-blue-500/30', ring: 'ring-blue-500/20' },
                            { step: '03', icon: Truck, title: 'Apply to products', color: 'text-amber-400', stepBg: 'bg-amber-500/20 border-amber-500/30', ring: 'ring-amber-500/20' },
                            { step: '04', icon: Smartphone, title: 'Customers scan & engage', color: 'text-purple-400', stepBg: 'bg-purple-500/20 border-purple-500/30', ring: 'ring-purple-500/20' },
                        ].map((item, i) => (
                            <div key={i} className="group flex flex-col items-center text-center relative">
                                <div className={`relative z-10 w-16 h-16 rounded-full ${item.stepBg} border flex items-center justify-center mb-6 ring-4 ${item.ring}`}>
                                    <item.icon size={24} className={item.color} />
                                </div>
                                <h3 className="text-sm font-black text-white mb-2 uppercase tracking-widest">{item.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ FINAL CTA ═══════════════ */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative rounded-[3rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-blue-600/10 to-transparent" />
                        <div className="glass-effect rounded-[3rem] p-12 md:p-20 text-center relative z-10">
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                                Ready to Turn Every Product<br />Into a Sales Channel?
                            </h2>
                            <p className="text-gray-400 font-bold mb-2">Stop losing customers to marketplaces.</p>
                            <p className="text-white font-black mb-10 text-lg">Start owning your customer journey.</p>
                            <button
                                onClick={() => setContactOpen(true)}
                                className="px-12 py-6 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm inline-flex items-center gap-3"
                            >
                                Start Your 90-Day Experience
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTNOTE */}
            <div className="container mx-auto px-6 py-8 text-center border-t border-white/5">
                <p className="text-xs text-gray-600 font-bold max-w-3xl mx-auto leading-relaxed">
                    90-day access includes limited-time premium features. QR credits applicable only on annual plans and valid for 12 months. Label printing and delivery charged separately. Terms apply.
                </p>
            </div>

            <WebFooter />
            <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} planName={selectedPlanName} />
        </div>
    );
}
