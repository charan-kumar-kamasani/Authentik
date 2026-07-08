import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, ShieldAlert, HeartHandshake, Truck, ShoppingBag, ArrowRight, CheckCircle2, Factory, ShieldCheck, Dumbbell, Sparkles, Coffee, Laptop, Gem, BarChart3, Package, Users, QrCode, Settings, Globe } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import logoShield from "../../assets/logo-shield.png";

export default function WebSolutions() {
  const [activeTab, setActiveTab] = useState("marketing");

  const personas = {
    marketing: {
      title: "Marketing Teams",
      icon: <Megaphone className="w-8 h-8" />,
      desc: "Drive growth with data-driven marketing.",
      benefits: [
        "Know your consumers.",
        "Create personalized campaigns.",
        "Increase loyalty.",
        "Measure engagement."
      ]
    },
    sales: {
      title: "Sales Teams",
      icon: <ShoppingBag className="w-8 h-8" />,
      desc: "Turn products into repeat purchase channels.",
      benefits: [
        "Increase repeat purchases.",
        "Drive customer lifetime value.",
        "Build stronger customer relationships."
      ]
    },
    operations: {
      title: "Operations Teams",
      icon: <Truck className="w-8 h-8" />,
      desc: "Gain complete supply chain visibility.",
      benefits: [
        "Track product movement.",
        "Monitor distribution.",
        "Improve visibility."
      ]
    },
    cx: {
      title: "Customer Experience",
      icon: <HeartHandshake className="w-8 h-8" />,
      desc: "Deliver post-purchase experiences that delight.",
      benefits: [
        "Simplify support.",
        "Manage warranties.",
        "Deliver exceptional post-purchase experiences."
      ]
    },
    protection: {
      title: "Brand Protection",
      icon: <ShieldAlert className="w-8 h-8" />,
      desc: "Secure your products and revenue.",
      benefits: [
        "Protect your products.",
        "Detect counterfeits.",
        "Monitor unauthorized distribution."
      ]
    },
    leadership: {
      title: "Leadership",
      icon: <BarChart3 className="w-8 h-8" />,
      desc: "Data to drive the whole business forward.",
      benefits: [
        "Gain real-time visibility into consumers, products, and business performance."
      ]
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <WebHeader />

      {/* Hero Section */}
      <section className="pt-20 pb-24 overflow-hidden relative border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
           <div>
             <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-4">Solutions</h3>
             <h1 className="text-4xl md:text-[56px] font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
               Built for Every Team
             </h1>
             <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
               One platform delivering measurable value across your organization.
             </p>
             
             <Link to="/contact-us">
                <button className="bg-blue-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2">
                   Book a Demo
                </button>
             </Link>
           </div>
           
           <div className="relative z-10 hidden lg:flex justify-end w-full">
             {/* Coded Dashboard Mockup from Landing Page */}
             <div className="w-full max-w-2xl bg-white rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100/50 overflow-hidden flex flex-col md:flex-row h-[350px] lg:h-[400px] transform lg:translate-x-8">
               {/* Sidebar */}
               <div className="hidden md:flex flex-col w-[180px] bg-[#f8fafc] border-r border-slate-100 p-5 shrink-0">
                 <div className="flex items-center gap-2 mb-8 text-blue-600 font-bold text-[15px]">
                   <img src={logoShield} className="w-6 h-6 object-contain" alt="Logo" /> Authentiks
                 </div>
                 <div className="space-y-1.5">
                   <div className="flex items-center gap-3 text-xs font-bold text-blue-700 bg-blue-100/80 px-3 py-2.5 rounded-lg"><BarChart3 size={16} strokeWidth={2.5}/> Dashboard</div>
                   <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 px-3 py-2.5 hover:bg-slate-100 rounded-lg"><Package size={16}/> Products</div>
                   <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 px-3 py-2.5 hover:bg-slate-100 rounded-lg"><Users size={16}/> Consumers</div>
                   <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 px-3 py-2.5 hover:bg-slate-100 rounded-lg"><QrCode size={16}/> Scans</div>
                   <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 px-3 py-2.5 hover:bg-slate-100 rounded-lg"><Settings size={16}/> Settings</div>
                 </div>
               </div>
               
               {/* Main Content */}
               <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-white overflow-hidden">
                 <h4 className="font-bold text-slate-800 text-[15px]">Dashboard Overview</h4>
                 
                 {/* Stats */}
                 <div className="grid grid-cols-2 gap-4 lg:gap-5">
                   {[
                     { title: "Total Scans", value: "1,25,430", trend: "+18.6%" },
                     { title: "Registered Consumers", value: "87,420", trend: "+22.4%" },
                     { title: "Repeat Consumers", value: "32,410", trend: "+16.2%" },
                     { title: "Countries", value: "12", trend: "+2" },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white border border-slate-100/60 rounded-xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                       <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 line-clamp-1">{stat.title}</div>
                       <div className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{stat.value}</div>
                       <div className="text-[10px] md:text-xs text-emerald-500 font-bold mt-1.5">{stat.trend}</div>
                     </div>
                   ))}
                 </div>
                 
                 {/* Charts Area */}
                 <div className="flex-1 grid grid-cols-2 gap-5 mt-2">
                   <div className="border border-slate-100/60 rounded-xl p-4 flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                      <div className="text-[10px] font-bold text-slate-400 mb-3">Scan Trend</div>
                      <div className="flex-1 relative w-full h-full overflow-hidden">
                         <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                           <path d="M0,50 L0,35 Q15,20 30,30 T60,20 T80,25 T100,10 L100,50 Z" fill="#eff6ff" />
                           <path d="M0,35 Q15,20 30,30 T60,20 T80,25 T100,10" fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                         </svg>
                      </div>
                   </div>
                   <div className="border border-slate-100/60 rounded-xl flex items-center justify-center bg-[#f8fafc] overflow-hidden relative shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                      <Globe size={160} className="text-blue-100 absolute -right-8 -bottom-8 opacity-70" strokeWidth={1} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-[10px] font-bold text-blue-600 tracking-wider">Global Reach</div>
                      </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* Who benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Who benefits from Authentiks?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our platform provides specialized capabilities for different teams across your organization, ensuring a unified approach to connected products.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
             {/* Tabs Sidebar */}
             <div className="lg:col-span-4 flex flex-col gap-2">
                {Object.keys(personas).map((key) => (
                   <button 
                     key={key}
                     onClick={() => setActiveTab(key)}
                     className={`flex items-center gap-4 px-6 py-4 rounded-xl text-left transition-all ${activeTab === key ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                   >
                     <div className={`${activeTab === key ? 'text-white' : 'text-blue-600'}`}>
                        {personas[key].icon}
                     </div>
                     <span className="font-bold text-lg">{personas[key].title}</span>
                   </button>
                ))}
             </div>
             
             {/* Tab Content */}
             <div className="lg:col-span-8 bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col gap-8">
                   <div className="flex items-center gap-4 text-blue-600">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                         {personas[activeTab].icon}
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900">{personas[activeTab].title}</h3>
                   </div>
                   
                   <p className="text-lg text-slate-700 leading-relaxed border-b border-slate-200 pb-8">
                      {personas[activeTab].desc}
                   </p>
                   
                   <div>
                      <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-green-500" /> Key Benefits
                      </h4>
                      <ul className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                         {personas[activeTab].benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                               <div className="mt-1 w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
                               <span className="text-slate-700 font-medium">{benefit}</span>
                            </li>
                         ))}
                      </ul>
                   </div>
                   
                   <div className="mt-4 pt-8 border-t border-slate-200">
                      <Link to="/contact-us" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors">
                         Discuss your specific use case <ArrowRight size={18} />
                      </Link>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Business Outcomes */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-16 text-center">Business Outcomes</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
            {[
              "Consumer Trust",
              "Revenue Growth",
              "Repeat Purchases",
              "Counterfeit Reduction",
              "Better Decision Making",
              "Stronger Consumer Relationships"
            ].map((outcome, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                <CheckCircle2 className="text-green-500 shrink-0" size={28} />
                <h4 className="text-lg font-bold text-slate-900">{outcome}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 bg-slate-50 border-t border-slate-100">
         <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-700 to-blue-900 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between text-left shadow-2xl relative overflow-hidden gap-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 text-white max-w-xl">
               <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to solve your toughest challenges?</h2>
               <p className="text-blue-100 text-lg">See how Authentiks can be tailored to your specific business needs.</p>
            </div>
            
            <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
              <Link to="/contact-us">
                <button className="w-full bg-white text-blue-800 px-8 py-3.5 rounded-lg font-bold hover:bg-slate-100 transition-colors shadow-lg flex items-center justify-center gap-2">
                  Book a Demo
                </button>
              </Link>
              <Link to="/contact-us">
                <button className="w-full bg-transparent border border-white text-white px-8 py-3.5 rounded-lg font-bold hover:bg-white/10 transition-colors flex items-center justify-center">
                  Contact Sales
                </button>
              </Link>
            </div>
         </div>
      </section>

      <WebFooter />
    </div>
  );
}
