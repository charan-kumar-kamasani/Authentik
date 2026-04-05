import React, { useEffect, useState } from "react";
import { getPlans, getBillingConfig } from '../../config/api';
import { Check, Shield, Zap, TrendingUp, Globe, Star, X } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import ContactFormModal from "../../components/ContactFormModal";

const Glow = ({ color, className }) => (
  <div className={`glow-bg h-64 w-64 ${color} ${className}`} />
);

const PricingCard = ({ plan, cycle, isIndia, onChoose }) => {
  const currentPricing = plan.pricing?.[cycle] || {};
  const price = currentPricing.pricePerQr || plan.pricePerQr || 0;
  const saveText = currentPricing.saveText || plan.saveText;
  const validity = currentPricing.validity || plan.planValidity;
  const isPopular = plan.isPopular;

  return (
    <div className={`glass-effect p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden transition-all duration-500 hover:scale-[1.02] border border-white/5 ${isPopular ? 'border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.1)]' : ''}`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-violet-600 text-white text-[10px] font-black uppercase px-5 py-1.5 rounded-bl-2xl tracking-widest shadow-lg">
          Best Value
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black text-white tracking-tighter">{isIndia ? `₹${price}` : `$${price}`}</span>
          <span className="text-gray-500 text-sm font-bold">/unit</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 min-h-[24px]">
          {saveText && saveText !== "-" && (
            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Save {isIndia ? "₹" : "$"}{saveText}
            </span>
          )}
          {validity && validity !== "-" && (
            <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {validity} Days
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-4 mb-10 flex-grow">
        {plan.features?.map((f, i) => {
          const val = f.value;
          const name = f.featureId?.name;
          if (!name) return null;
          
          const isCheck = val === true || val === "true";
          const isCross = !val || val === false || val === "false";
          
          return (
            <li key={i} className={`flex items-start gap-3 text-sm font-bold ${isCross ? 'text-gray-600' : 'text-gray-300'}`}>
              {isCross ? (
                <X size={18} className="text-gray-600 shrink-0 mt-0.5" />
              ) : (
                <Check size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              )}
              <span className={isCross ? 'line-through opacity-70' : ''}>
                {name}
                {(!isCheck && !isCross) && <span className="ml-1 text-indigo-400/80 font-black tracking-tight">: {val}</span>}
              </span>
            </li>
          );
        })}
        {(!plan.features || plan.features.length === 0) && (
          <li className="text-gray-500 text-xs italic">Individual unit authentication</li>
        )}
      </ul>

      <button 
        onClick={() => onChoose(plan.name)} 
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
          isPopular 
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] shadow-lg shadow-indigo-500/20' 
            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 shadow-sm'
        }`}
      >
        Choose Plan
      </button>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, description }) => (
  <div className="glass-effect p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/20 transition-all group">
    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all border border-indigo-500/10">
      <Icon size={28} />
    </div>
    <h4 className="text-white font-black uppercase tracking-tight mb-2 text-sm">{title}</h4>
    <p className="text-xs text-gray-400 font-bold leading-relaxed">{description}</p>
  </div>
);

export default function WebPricing() {
    const [isIndia, setIsIndia] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [selectedPlanName, setSelectedPlanName] = useState('');
    const [plans, setPlans] = useState([]);
    const [billingConfig, setBillingConfig] = useState(null);
    const [selectedCycle, setSelectedCycle] = useState('yearly');
    
    useEffect(() => {
        // Find user location
        fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => setIsIndia(data.country_code === "IN"))
            .catch(() => setIsIndia(false));
            
        // Fetch Admin Config
        getBillingConfig().then(setBillingConfig).catch(e => console.error(e));
        
        // Fetch Plans
        getPlans().then(data => {
            const allPlans = data.plans || data;
            setPlans(allPlans);
        }).catch(e => console.error(e));
    }, []);

    const CYCLES = [
      { key: 'monthly', label: billingConfig?.monthlyLabel || 'Monthly' },
      { key: 'quarterly', label: billingConfig?.quarterlyLabel || 'Quarterly' },
      { key: 'yearly', label: billingConfig?.yearlyLabel || 'Yearly' }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
            <WebHeader />

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <Glow color="bg-indigo-600" className="-top-24 -left-24 opacity-20" />
                <Glow color="bg-violet-600" className="top-1/2 -right-24 opacity-10" />
                
                <div className="container mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 uppercase leading-[0.9]">
                        Transparent <span className="gradient-text">Pricing</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-bold max-w-2xl mx-auto mb-10 leading-relaxed opacity-80">
                        Enterprise-grade product authentication. Zero platform fees. Pay only for the protection you use.
                    </p>
                    
                    {/* Billing Cycle Switch */}
                    <div className="inline-flex p-1.5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shadow-inner relative group">
                      {CYCLES.map(c => (
                        <button
                          key={c.key}
                          onClick={() => setSelectedCycle(c.key)}
                          className={`relative px-8 py-3.5 rounded-[1.2rem] text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 z-10 ${
                            selectedCycle === c.key ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {c.label}
                          {c.key === 'yearly' && (
                            <span className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg border border-emerald-400/50">BEST</span>
                          )}
                        </button>
                      ))}
                      {/* Sliding indicator */}
                      <div 
                        className="absolute top-1.5 bottom-1.5 left-1.5 bg-indigo-600/90 rounded-[1.2rem] transition-all duration-500 shadow-lg shadow-indigo-500/20 border border-indigo-400/30"
                        style={{
                          width: `calc(100% / 3 - 4px)`,
                          transform: `translateX(${CYCLES.findIndex(c => c.key === selectedCycle) * 100}%)`
                        }}
                      />
                    </div>
                </div>
            </section>

            {/* Pricing Plans */}
            <section className="py-20 px-6 relative">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {plans.map((p, index) => (
                          <PricingCard 
                            key={p._id || index}
                            plan={p}
                            cycle={selectedCycle}
                            isIndia={isIndia}
                            onChoose={(name) => { setSelectedPlanName(name); setContactOpen(true); }}
                          />
                        ))}
                    </div>
                    
                    <p className="text-center mt-12 text-gray-500 font-black italic opacity-60">
                        {isIndia ? "Just 1 prevented counterfeit case can save ₹10-50 lakhs." : "Preventing just one counterfeit batch can save $50k - $200k in brand equity."}
                    </p>
                </div>
            </section>

            {/* Full Suite Features */}
            <section className="py-32 px-6 border-y border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/[0.01]" />
                <div className="container mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Core Protection Engine</h2>
                        <p className="text-gray-400 font-bold max-w-xl mx-auto">Every plan comes with our enterprise-grade security stack as standard.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        <FeatureItem icon={Zap} title="Unique QR Generation" description="Advanced cryptographic generation ensuring every label is one-of-a-kind and practically un-cloneable." />
                        <FeatureItem icon={TrendingUp} title="Scan Analysis" description="Real-time geo-located verification patterns to instantly detect and map high-risk counterfeit hotspots." />
                        <FeatureItem icon={Shield} title="Anti-Counterfeit" description="Instant push alerts and automated reporting when duplicate or unauthorized scan attempts are detected." />
                        <FeatureItem icon={Star} title="Brand Engagement" description="Convert standard authentication checks into a premium direct-to-consumer digital touchpoint." />
                    </div>
                </div>
            </section>

            {/* Protection that Scales */}
            <section className="py-32 px-6 background-grid">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8 text-center md:text-left">
                        <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                            Protection that <br /><span className="gradient-text">Scales</span> with You.
                        </h2>
                        <div className="flex flex-col items-center md:items-end gap-3 translate-y-[-10px]">
                          <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-[10px]">
                            AUTHENTIK GLOBAL NETWORK <Globe size={14} />
                          </div>
                          <p className="text-xs text-gray-500 font-bold">Safeguarding billions of units in 40+ countries.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { t: "Real-Time Verification", d: "Confirm every product unit as genuine at the point of scan with millisecond response times." },
                            { t: "Grey Market Detection", d: "Identify parallel sales, unauthorized cross-border distribution, and territory violations automatically." },
                            { t: "Market Intelligence", d: "Track regional demand signals, scan densities, and consumer behavior patterns in a live dashboard." },
                            { t: "Enhanced Loyalty", d: "Turn the authentication moment into a secure marketing bridge to reward your genuine customers." }
                        ].map((item, i) => (
                            <div key={i} className="glass-effect p-10 rounded-[2.5rem] border border-white/5 flex items-start gap-8 group hover:border-indigo-500/20 transition-all duration-500">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2.5 group-hover:scale-150 transition-all shadow-[0_0_15px_rgba(99,102,241,0.6)]"></div>
                                <div>
                                    <h4 className="text-white font-black uppercase tracking-tight mb-3 text-lg">{item.t}</h4>
                                    <p className="text-gray-400 font-bold text-sm leading-relaxed opacity-80">{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <WebFooter />
            <ContactFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} planName={selectedPlanName} />
        </div>
    );
}
