import React, { useEffect, useState } from "react";
import { Check, Shield, Zap, TrendingUp, Globe, AlertCircle, Info, Star } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import techBg from "../../assets/web/hero_image.png";

const Glow = ({ color, className }) => (
  <div className={`glow-bg h-64 w-64 ${color} ${className}`} />
);

const PricingCard = ({ title, price, description, features, highlighted, badge }) => (
  <div className={`glass-effect p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden transition-all duration-500 hover:scale-[1.02] border border-white/5 ${highlighted ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : ''}`}>
    {highlighted && <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black uppercase px-4 py-1 rounded-bl-xl tracking-widest">{badge || "Most Popular"}</div>}
    <div className="mb-8">
      <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black text-white tracking-tighter">{price}</span>
        {price !== "Custom" && <span className="text-gray-500 font-bold">/unit</span>}
      </div>
      <p className="text-sm text-gray-400 font-bold mt-2">{description}</p>
    </div>
    <ul className="space-y-4 mb-8 flex-grow">
      {features.map((feature, i) => (
        <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-300">
          <Check size={18} className="text-indigo-400 shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${highlighted ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
      Choose Plan
    </button>
  </div>
);

const FeatureItem = ({ icon: Icon, title, description }) => (
  <div className="glass-effect p-6 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-all group">
    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
      <Icon size={24} />
    </div>
    <h4 className="text-white font-black uppercase tracking-tight mb-2 text-sm">{title}</h4>
    <p className="text-xs text-gray-400 font-bold leading-relaxed">{description}</p>
  </div>
);

export default function WebPricing() {
    const [isIndia, setIsIndia] = useState(false);
    
    useEffect(() => {
        fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => {
                if (data.country_code === "IN") {
                    setIsIndia(true);
                }
            })
            .catch(() => setIsIndia(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-24 -left-24 opacity-20" />
                <div className="container mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase">
                        Transparent <span className="gradient-text">Pricing</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-bold max-w-2xl mx-auto mb-4">
                        Enterprise-grade product authentication. Zero platform fees. Pay only for the protection you use.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-black italic">
                        "Don't Just Sell Products. Own the Data Behind Them."
                    </div>
                </div>
            </section>

            {/* Pricing Plans */}
            <section className="py-20 px-6">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <PricingCard 
                            title="Starter"
                            price={isIndia ? "₹0" : "$0.00"}
                            description="Perfect for emerging brands testing the market."
                            features={[
                                "Unique QR Code Generation",
                                "Basic Scan Verification",
                                "Standard Tamper-Proof Labels",
                                "Email Support",
                                "Up to 10k Products/mo"
                            ]}
                        />
                        <PricingCard 
                            title="Growth"
                            price={isIndia ? "₹2" : "$0.03"}
                            description="Optimized for scaling production lines."
                            highlighted={true}
                            badge="Best Value"
                            features={[
                                "Everything in Starter",
                                "Advanced Scan Intelligence",
                                "Priority QR Activation",
                                "Geo-Location Insights",
                                "Up to 100k Products/mo"
                            ]}
                        />
                        <PricingCard 
                            title="Enterprise"
                            price={isIndia ? "₹3" : "Custom"}
                            description="For global supply chains requiring deep security."
                            features={[
                                "Custom Security Features",
                                "API Integration Access",
                                "Dedicated Account Manager",
                                "Anti-Grey Market Alerts",
                                "Unlimited Volume"
                            ]}
                        />
                    </div>
                    
                    <p className="text-center mt-12 text-gray-500 font-bold italic">
                        {isIndia ? "Just 1 prevented counterfeit case can save ₹10-50 lakhs." : "Preventing just one counterfeit batch can save $50k - $200k in brand equity."}
                    </p>
                </div>
            </section>

            {/* What's Included */}
            <section className="py-24 px-6 border-y border-white/5 bg-white/[0.01]">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">Full Suite of Features</h2>
                        <p className="text-gray-400 font-bold">Every plan comes with our core protection engine.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <FeatureItem 
                            icon={Zap} 
                            title="Unique QR Generation" 
                            description="Advanced cryptographic generation ensuring every label is one-of-a-kind."
                        />
                        <FeatureItem 
                            icon={TrendingUp} 
                            title="Scan Analysis" 
                            description="Real-time verification patterns to detect high-risk counterfeit activity."
                        />
                        <FeatureItem 
                            icon={Shield} 
                            title="Anti-Counterfeit" 
                            description="Instant alerts when duplicate or unauthorized scans are detected."
                        />
                        <FeatureItem 
                            icon={Star} 
                            title="Brand Engagement" 
                            description="Optional coupons and direct-to-consumer digital touchpoints."
                        />
                    </div>
                </div>
            </section>

            {/* Why Brands Trust */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6 text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                            Protection that <br /><span className="gradient-text">Scales</span> with You.
                        </h2>
                        <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-xs">
                          TRUSTED BY GLOBAL LEADERS <Globe size={16} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { t: "Real-Time Verification", d: "Confirm every product unit as genuine at the point of scan." },
                            { t: "Grey Market Detection", d: "Identify parallel sales and unauthorized distribution channels." },
                            { t: "Market Intelligence", d: "Track region-wise demand signals and consumer behavior." },
                            { t: "Enhanced Loyalty", d: "Convert authentication into a secure marketing channel." }
                        ].map((item, i) => (
                            <div key={i} className="glass-effect p-8 rounded-[2rem] border border-white/5 flex items-start gap-6 group hover:border-indigo-500/20 transition-all">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 group-hover:scale-150 transition-all shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                <div>
                                    <h4 className="text-white font-black uppercase tracking-tight mb-2">{item.t}</h4>
                                    <p className="text-gray-400 font-bold text-sm leading-relaxed">{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <WebFooter />
        </div>
    );
}
