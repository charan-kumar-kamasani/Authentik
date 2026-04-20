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
            color: 'from-emerald-500 to-emerald-400',
            borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
            bgGlow: 'bg-emerald-500',
            iconColor: 'text-emerald-400',
            monthlyRate: 5000,
            halfYearlyPrice: 30000,
            yearlyOriginal: 60000,
            yearlyDiscounted: 50000,
            yearlySaveAmount: 10000,
            yearlyBonusQR: 10000,
            subtitle: 'Start Protecting Your Products from Day One',
            bestFor: 'Small brands entering authentication',
            includesPrefix: 'Includes:',
            features: [
                'Unique QR for every product unit',
                'First-scan authentication',
                'Basic scan tracking',
                'Dashboard access'
            ],
            highlights: [
                'Prevent fake products',
                'Start tracking real customer scans'
            ]
        },
        {
            id: 'growth',
            name: 'GROWTH',
            isPopular: true,
            color: 'from-blue-500 to-cyan-400',
            borderColor: 'border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20 hover:border-blue-500/50',
            bgGlow: 'bg-blue-500',
            iconColor: 'text-blue-400',
            monthlyRate: 10000,
            halfYearlyPrice: 60000,
            yearlyOriginal: 120000,
            yearlyDiscounted: 100000,
            yearlySaveAmount: 20000,
            yearlyBonusQR: 20000,
            subtitle: 'Drive Repeat Sales & Own Your Customers',
            bestFor: 'Growing brands needing direct engagement',
            includesPrefix: 'Everything in Starter, plus:',
            features: [
                'Coupon & rewards engine',
                'Customer data capture',
                'Redirect traffic to your website',
                'Location-based scan insights'
            ],
            highlights: [
                'Convert scans into customers',
                'Reduce dependency on marketplaces',
                'Build your own customer database'
            ]
        },
        {
            id: 'enterprise',
            name: 'ENTERPRISE',
            color: 'from-red-500 to-orange-400',
            borderColor: 'border-red-500/20 hover:border-red-500/40',
            bgGlow: 'bg-red-500',
            iconColor: 'text-red-400',
            monthlyRate: 20000,
            halfYearlyPrice: 120000,
            yearlyOriginal: 240000,
            yearlyDiscounted: 200000,
            yearlySaveAmount: 40000,
            yearlyBonusQR: 40000,
            subtitle: 'Gain Complete Control Over Your Market',
            bestFor: 'Large operations scaling supply chain',
            includesPrefix: 'Everything in Growth, plus:',
            features: [
                'Real-time counterfeit alerts',
                'Advanced analytics & insights',
                'Batch-level tracking',
                'Geo heatmaps & fraud detection',
                'API integrations',
                'Priority support'
            ],
            highlights: [
                'Detect fake products instantly',
                'Track product movement across regions',
                'Make data-driven business decisions'
            ]
        }
    ];

    const comparisonFeatures = [
        { name: "Unique QR per unit", starter: "✅", growth: "✅", enterprise: "✅" },
        { name: "Authentication", starter: "✅", growth: "✅", enterprise: "✅" },
        { name: "Scan tracking", starter: "✅", growth: "✅", enterprise: "✅" },
        { name: "Coupons & rewards", starter: "❌", growth: "✅", enterprise: "✅" },
        { name: "Customer data capture", starter: "❌", growth: "✅", enterprise: "✅" },
        { name: "Website redirection", starter: "❌", growth: "✅", enterprise: "✅" },
        { name: "Counterfeit alerts", starter: "❌", starterClass: "text-gray-600", growth: "Limited", growthClass: "text-gray-600", enterprise: "✅" },
        { name: "Geo-location", starter: "❌", starterClass: "text-gray-600", growth: "Limited", enterprise: "✅" },
        { name: "API integration", starter: "❌", starterClass: "text-gray-600", growth: "❌", growthClass: "text-gray-600", enterprise: "✅" }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* ═══════════════ HERO SECTION ═══════════════ */}
            <section className="relative pt-10 md:pt-10 pb-20 px-6 overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-32 -left-32 opacity-20" />
                <Glow color="bg-cyan-600" className="top-1/2 -right-32 opacity-15" />

                <div className="container mx-auto text-center relative z-10 max-w-5xl">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] mb-8 hero-slide-enter">
                        🔥 High Impact ROI
                    </div>

                    <h1 className="hero-slide-enter text-4xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.05]">
                        Turn Every Product Into <span className="gradient-text">Revenue</span>,<br />
                        Not Just Inventory
                    </h1>

                    <p className="hero-slide-enter-delay max-w-3xl mx-auto text-lg md:text-2xl font-bold text-gray-400 mb-10 leading-relaxed">
                        Protect your products, capture customers, and drive repeat sales — with one complete solution delivered to your doorstep.
                    </p>

                    <div className="hero-slide-enter-delay flex flex-col items-center mb-12">
                        <div className="glass-effect rounded-2xl px-8 py-5 border-emerald-500/30 relative overflow-hidden group mb-8">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-50 block" />
                            <h3 className="relative z-10 text-xl md:text-2xl font-black text-white mb-2 tracking-tight">
                                Get ₹60,000 Worth of Premium Features — <span className="text-emerald-400 tracking-tighter">Complimentary for 90 Days</span>
                            </h3>
                            <p className="relative z-10 text-sm font-bold text-gray-300 flex items-center justify-center gap-2">
                                <ArrowRight size={16} className="text-emerald-400" />
                                No commitment. Experience full impact before you pay.
                            </p>
                        </div>

                        <button
                            onClick={() => setContactOpen(true)}
                            className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-sm flex items-center gap-3"
                        >
                            Start 90-Day Experience
                            <ArrowRight size={18} />
                        </button>
                    </div>


                </div>
            </section>

            {/* ═══════════════ CHOOSE YOUR PLAN ═══════════════ */}
            <section className="py-12 px-6 relative" id="pricing-plans">
                <Glow color="bg-indigo-600" className="-top-32 left-1/2 -translate-x-1/2 opacity-15" />
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <SectionTitle>Choose Your Plan</SectionTitle>

                        {/* Billing Toggle: Half-Yearly / Yearly */}
                        <div className="inline-flex items-center p-1.5 bg-white/5 rounded-full border border-white/10 relative mt-4">
                            <div
                                className={`absolute inset-y-1.5 w-1/2 rounded-full transition-all duration-300 shadow-md ${billingCycle === 'halfYearly' ? 'left-1.5 bg-white' : 'left-[calc(50%-6px)] bg-gradient-to-r from-amber-400 to-orange-500'}`}
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
                                <Crown size={14} /> Yearly
                                {billingCycle === 'halfYearly' && <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[9px] border border-amber-500/30 animate-pulse">BEST VALUE</span>}
                            </button>
                        </div>

                        {billingCycle === 'yearly' && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest animate-in fade-in duration-500">
                                <Sparkles size={14} /> Yearly plans include discounts + bonus QR credits!
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricingDisplayData.map((plan, idx) => {
                            const isYearly = billingCycle === 'yearly';
                            const displayPrice = isYearly ? plan.yearlyDiscounted : plan.halfYearlyPrice;
                            const originalPrice = isYearly ? plan.yearlyOriginal : null;
                            const perMonth = isYearly ? Math.round(plan.yearlyDiscounted / 12) : Math.round(plan.halfYearlyPrice / 6);

                            return (
                                <div key={idx} className={`glass-effect rounded-[2.5rem] p-8 md:p-10 border relative overflow-hidden transition-all duration-500 hover:-translate-y-2 group flex flex-col ${plan.borderColor} ${isYearly ? 'ring-1 ring-amber-500/10' : ''}`}>
                                    {plan.isPopular && (
                                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400" />
                                    )}

                                    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 ${plan.bgGlow}`} />

                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-black text-white uppercase tracking-wider">{plan.name}</h3>
                                            <div className="flex items-center gap-2">
                                                {plan.isPopular && <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 tracking-widest">Most Popular</span>}
                                            </div>
                                        </div>

                                        <p className="text-sm font-bold text-gray-400 mb-6 min-h-[40px] opacity-80 leading-relaxed border-b border-white/5 pb-4">
                                            {plan.subtitle}
                                        </p>

                                        {/* Price display */}
                                        <div className="flex flex-col gap-1">
                                            {isYearly && originalPrice && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg text-gray-500 font-bold line-through">₹{originalPrice.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                                    ₹{displayPrice.toLocaleString()}
                                                </span>
                                                <span className="text-gray-500 font-bold text-sm tracking-widest uppercase">
                                                    /{isYearly ? 'year' : '6 months'}
                                                </span>
                                            </div>
                                            <div className="text-sm font-bold text-gray-500 mt-1">
                                                ≈ ₹{perMonth.toLocaleString()}/month
                                            </div>
                                        </div>

                                        {/* Yearly benefits badges */}
                                        {isYearly && (
                                            <div className="mt-4 flex flex-col gap-2">
                                                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg w-fit animate-in slide-in-from-left duration-300">
                                                    <Sparkles size={12} /> Save ₹{plan.yearlySaveAmount.toLocaleString()} Discount
                                                </div>
                                                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-2 rounded-lg w-fit animate-in slide-in-from-left duration-300" style={{ animationDelay: '100ms' }}>
                                                    <Gift size={12} /> + ₹{plan.yearlyBonusQR.toLocaleString()} Free QR Credits
                                                </div>
                                                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg w-fit animate-in slide-in-from-left duration-300" style={{ animationDelay: '200ms' }}>
                                                    <Crown size={12} /> Total Value: ₹{(plan.yearlySaveAmount + plan.yearlyBonusQR).toLocaleString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-8 bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Best For:</p>
                                        <p className="text-sm font-bold text-white">{plan.bestFor}</p>
                                    </div>

                                    <div className="flex-grow">
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
                                            {plan.includesPrefix}
                                        </p>
                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((f, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-300">
                                                    <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-white/10 text-white`}>•</div>
                                                    <span className="leading-tight">{f}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="space-y-2 mt-auto mb-8 border-l-2 border-indigo-500/30 pl-4 py-1">
                                            {plan.highlights.map((h, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm font-black text-white italic list-none">
                                                    <Check size={16} className={plan.iconColor + " shrink-0 mt-0.5"} />
                                                    <span className="leading-tight">{h}</span>
                                                </li>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { setSelectedPlanName(plan.name); setContactOpen(true); }}
                                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${plan.isPopular
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:brightness-110'
                                            : 'bg-white text-black hover:bg-gray-200 shadow-md shadow-white/5'
                                            }`}
                                    >
                                        Get Started
                                    </button>
                                </div>
                            );
                        })}
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
                                    <th className="p-6 text-sm font-black text-emerald-400 uppercase tracking-widest w-[22%] text-center">Starter</th>
                                    <th className="p-6 text-sm font-black text-blue-400 uppercase tracking-widest w-[22%] text-center">Growth</th>
                                    <th className="p-6 text-sm font-black text-red-400 uppercase tracking-widest w-[22%] text-center">Enterprise</th>
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
