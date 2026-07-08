import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Check, ArrowRight, ShieldCheck, Lock, Activity, Cloud, TrendingUp, RefreshCw, BarChart3, Star, Rocket, Building2, Calendar, MessageSquare, Network } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import plansHeroImage from "../../assets/web/plans_hero.png";

export default function WebPricing() {
  
  // Using generic images for the placeholders since the user will add them later
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <WebHeader />

      {/* Hero Section */}
      <section className="pt-20 pb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-blue-600 font-bold text-[11px] uppercase tracking-[0.2em] mb-4">Plans</h3>
            <h1 className="text-4xl md:text-[52px] font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Flexible Plans for Every Stage of Growth
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl">
              Whether you're launching your first connected product or scaling across millions of units, Authentiks grows with your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-8">
               <div className="flex gap-4 items-center">
                  <ShieldCheck className="text-blue-600" size={32} strokeWidth={1.5} />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Enterprise Security</h4>
                    <p className="text-slate-500 text-xs">Powered by Cloudflare</p>
                  </div>
               </div>
               <div className="flex gap-4 items-center">
                  <Lock className="text-blue-600" size={32} strokeWidth={1.5} />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Your Data. Always Secure.</h4>
                    <p className="text-slate-500 text-xs">Built with privacy by design.</p>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="relative z-10 hidden lg:block">
             <div className="relative w-full h-full flex items-center justify-end">
               <img src={plansHeroImage} alt="Authentiks Plans" className="w-[120%] max-w-none h-auto -translate-y-4 translate-x-8" />
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 -mt-12 relative z-20">
         <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-3 gap-8">
            
            {/* Starter */}
            <div className="bg-white rounded-[32px] border border-green-100 shadow-sm p-8 flex flex-col h-full hover:shadow-xl transition-shadow relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
               <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-4 rotate-3 shadow-lg shadow-green-500/20">
                     <Rocket size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-green-600 tracking-wider">STARTER</h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium">For brands beginning their digital product journey.</p>
               </div>
               
               <div className="bg-green-50/50 rounded-2xl p-6 mb-8 border border-green-100">
                  <h4 className="font-bold text-green-700 text-sm mb-4">Ideal for</h4>
                  <ul className="space-y-3">
                     <li className="flex gap-2 text-sm text-slate-700 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div> Emerging Brands</li>
                     <li className="flex gap-2 text-sm text-slate-700 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div> Pilot Projects</li>
                     <li className="flex gap-2 text-sm text-slate-700 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div> Authentication</li>
                  </ul>
               </div>
               
               <div className="flex-1">
                  <h4 className="font-bold text-green-700 text-sm mb-4">Includes</h4>
                  <ul className="space-y-4">
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-green-500 shrink-0" size={18}/> Product Authentication</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-green-500 shrink-0" size={18}/> Secure QR Identity</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-green-500 shrink-0" size={18}/> Duplicate Detection</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-green-500 shrink-0" size={18}/> Verification Dashboard</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-green-500 shrink-0" size={18}/> Basic Analytics</li>
                  </ul>
               </div>
               
               <div className="mt-8">
                  <button className="w-full py-4 rounded-xl border-2 border-green-500 text-green-600 font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                     <MessageSquare size={18} /> Contact Sales
                  </button>
               </div>
            </div>
            
            {/* Growth - Recommended */}
            <div className="bg-white rounded-[32px] border-2 border-blue-600 shadow-2xl p-8 flex flex-col h-full relative transform lg:-translate-y-4">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Recommended
               </div>
               
               <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 -rotate-3 shadow-xl shadow-blue-600/30">
                     <Star size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-blue-600 tracking-wider">GROWTH</h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Ideal for brands focused on building direct consumer relationships.</p>
               </div>
               
               <div className="flex-1">
                  <h4 className="font-bold text-blue-700 text-sm mb-4">Everything in Starter, plus</h4>
                  <ul className="space-y-4">
                     <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 className="text-blue-600 shrink-0 fill-blue-100" size={18}/> Consumer Registration</li>
                     <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 className="text-blue-600 shrink-0 fill-blue-100" size={18}/> Product Passport</li>
                     <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 className="text-blue-600 shrink-0 fill-blue-100" size={18}/> Consumer Intelligence</li>
                     <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 className="text-blue-600 shrink-0 fill-blue-100" size={18}/> Warranty Management</li>
                     <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 className="text-blue-600 shrink-0 fill-blue-100" size={18}/> Consumer Engagement</li>
                     <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 className="text-blue-600 shrink-0 fill-blue-100" size={18}/> Smart Reorder</li>
                     <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 className="text-blue-600 shrink-0 fill-blue-100" size={18}/> Campaign Management</li>
                     <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle2 className="text-blue-600 shrink-0 fill-blue-100" size={18}/> Location Analytics</li>
                  </ul>
               </div>
               
               <div className="mt-8">
                  <button className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                     <MessageSquare size={18} /> Contact Sales
                  </button>
               </div>
            </div>
            
            {/* Enterprise */}
            <div className="bg-white rounded-[32px] border border-purple-100 shadow-sm p-8 flex flex-col h-full hover:shadow-xl transition-shadow relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-purple-600"></div>
               <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white mb-4 rotate-3 shadow-lg shadow-purple-600/20">
                     <Building2 size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-purple-600 tracking-wider">ENTERPRISE</h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Built for enterprise-scale deployments.</p>
               </div>
               
               <div className="flex-1">
                  <h4 className="font-bold text-purple-800 text-sm mb-4">Everything in Growth, plus</h4>
                  <ul className="space-y-4">
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-purple-600 shrink-0" size={18}/> Advanced Analytics</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-purple-600 shrink-0" size={18}/> AI Insights</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-purple-600 shrink-0" size={18}/> API Access</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-purple-600 shrink-0" size={18}/> ERP Integration</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-purple-600 shrink-0" size={18}/> CRM Integration</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-purple-600 shrink-0" size={18}/> Custom Dashboards</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-purple-600 shrink-0" size={18}/> Dedicated Success Manager</li>
                     <li className="flex gap-3 text-sm text-slate-700"><CheckCircle2 className="text-purple-600 shrink-0" size={18}/> Priority Support</li>
                  </ul>
               </div>
               
               <div className="mt-8">
                  <button className="w-full py-4 rounded-xl border-2 border-purple-600 text-purple-700 font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                     <MessageSquare size={18} /> Contact Sales
                  </button>
               </div>
            </div>

         </div>
      </section>

      {/* Compare Plans Table */}
      <section className="py-24 bg-white relative">
         <div className="max-w-6xl mx-auto px-6 md:px-12">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Compare Plans</h2>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                     <tr>
                        <th className="w-1/3 py-6 px-4 border-b-2 border-slate-100 text-sm font-bold text-slate-500 uppercase tracking-wider">Features</th>
                        <th className="w-1/5 py-6 px-4 border-b-2 border-slate-100 text-center text-sm font-black text-green-600 uppercase tracking-wider">Starter</th>
                        <th className="w-1/5 py-6 px-4 border-b-2 border-slate-100 text-center text-sm font-black text-blue-600 uppercase tracking-wider bg-blue-50/50 rounded-t-xl">Growth</th>
                        <th className="w-1/5 py-6 px-4 border-b-2 border-slate-100 text-center text-sm font-black text-purple-600 uppercase tracking-wider">Enterprise</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {[
                        { name: "Product Authentication", icon: <ShieldCheck size={16}/>, s: true, g: true, e: true },
                        { name: "Unique QR Identity", icon: <Activity size={16}/>, s: true, g: true, e: true },
                        { name: "Duplicate Scan Detection", icon: <Activity size={16}/>, s: true, g: true, e: true },
                        { name: "Consumer Registration", icon: <ShieldCheck size={16}/>, s: false, g: true, e: true },
                        { name: "Digital Product Passport", icon: <ShieldCheck size={16}/>, s: false, g: true, e: true },
                        { name: "Warranty Management", icon: <ShieldCheck size={16}/>, s: false, g: true, e: true },
                        { name: "Rewards & Engagement", icon: <Star size={16}/>, s: false, g: true, e: true },
                        { name: "Smart Reorder", icon: <Activity size={16}/>, s: false, g: true, e: true },
                        { name: "Consumer Intelligence Dashboard", icon: <BarChart3 size={16}/>, s: false, g: true, e: true },
                        { name: "API Access & Integrations", icon: <Network size={16}/>, s: false, g: false, e: true },
                        { name: "Advanced Analytics & AI", icon: <BarChart3 size={16}/>, s: false, g: false, e: true },
                        { name: "Dedicated Support & SLAs", icon: <ShieldCheck size={16}/>, s: false, g: false, e: true },
                     ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                           <td className="py-4 px-4 flex items-center gap-3 text-sm font-medium text-slate-700">
                              <span className="text-slate-400">{row.icon}</span> {row.name}
                           </td>
                           <td className="py-4 px-4 text-center">
                              {row.s ? <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto shadow-sm"><Check size={14} strokeWidth={3}/></div> : <span className="text-slate-300">—</span>}
                           </td>
                           <td className="py-4 px-4 text-center bg-blue-50/50">
                              {row.g ? <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm"><Check size={14} strokeWidth={3}/></div> : <span className="text-slate-300">—</span>}
                           </td>
                           <td className="py-4 px-4 text-center">
                              {row.e ? <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto shadow-sm"><Check size={14} strokeWidth={3}/></div> : <span className="text-slate-300">—</span>}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      {/* Flat Pricing Strip */}
      <section className="py-16 bg-white border-y border-slate-100">
         <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Flat QR Pricing</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Every plan includes secure QR labels at a flat rate of ₹1 per QR label, ensuring predictable costs as you scale.
            </p>
         </div>
      </section>


      {/* CTA Bottom */}
      <section className="py-24 px-6 md:px-12 bg-slate-50">
         <div className="max-w-6xl mx-auto bg-[#0d47a1] rounded-[32px] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 text-white max-w-xl">
               <h2 className="text-[28px] font-bold mb-6 leading-tight">Why Contact Sales?</h2>
               <p className="text-blue-100 mb-4">Every deployment is tailored based on:</p>
               <ul className="space-y-2 mb-8">
                 <li className="flex items-center gap-2 text-blue-50"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Number of Products</li>
                 <li className="flex items-center gap-2 text-blue-50"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Annual Production Volume</li>
                 <li className="flex items-center gap-2 text-blue-50"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Platform Modules</li>
                 <li className="flex items-center gap-2 text-blue-50"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Integration Requirements</li>
                 <li className="flex items-center gap-2 text-blue-50"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Business Objectives</li>
               </ul>
            </div>
            
            <div className="relative z-10 shrink-0 flex flex-col gap-4 w-full md:w-auto min-w-[200px]">
               <button className="w-full bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg flex items-center justify-center gap-2">
                 <MessageSquare size={20}/> Contact Sales
               </button>
            </div>
         </div>
      </section>

      <WebFooter />
    </div>
  );
}
