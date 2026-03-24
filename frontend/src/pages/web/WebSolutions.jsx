import React from "react";
import { Fingerprint, Scan, Cpu, ShieldCheck, BarChart, Zap, Globe, Layers, CheckCircle2 } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import techBg from "../../assets/web/hero_image.png";

const Glow = ({ color, className }) => (
  <div className={`glow-bg h-64 w-64 ${color} ${className}`} />
);

const SolutionBlock = ({ icon: Icon, title, description, benefits, reverse }) => (
  <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 py-20 px-6`}>
    <div className="flex-1">
      <div className="glass-effect p-12 rounded-[3rem] relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 p-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
          <Icon size={120} />
        </div>
        <div className="relative z-10 text-indigo-400 mb-6 group-hover:scale-110 transition-transform origin-left">
          <Icon size={48} />
        </div>
        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">{title}</h3>
        <p className="text-gray-400 font-bold text-lg leading-relaxed mb-8">{description}</p>
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-4 text-center lg:text-left">What it solves</p>
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="flex-1 hidden lg:block opacity-20 hover:opacity-30 transition-opacity grayscale hover:grayscale-0 duration-700">
       <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10">
          <img src={techBg} alt="" className="w-full h-full object-cover blur-3xl opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Icon size={160} className="text-white/20" />
          </div>
       </div>
    </div>
  </div>
);

export default function WebSolutions() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
      <WebHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden border-b border-white/5">
        <Glow color="bg-indigo-600" className="-top-24 -left-24 opacity-20" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-black uppercase tracking-widest text-indigo-400 mb-6">
                Our Technology
              </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-none">
              High-Performance <br /><span className="gradient-text uppercase">Security</span> Solutions.
            </h1>
            <p className="text-xl text-gray-400 font-bold leading-relaxed max-w-2xl">
              Authentiks offers a complete ecosystem designed to prevent counterfeits, protect reputation, and build consumer trust at global scale.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Detail */}
      <main className="container mx-auto">
        <SolutionBlock 
          icon={Fingerprint}
          title="Product Authentication"
          description="Every product is assigned a unique, cryptographic QR identity generated in our secure vault. No two codes are ever the same."
          benefits={["Counterfeit and duplicate prevention", "Instant supply chain visibility", "Absolute consumer verification"]}
        />
        
        <SolutionBlock 
          icon={Layers}
          title="Tamper-Proof QR Labels"
          reverse={true}
          description="Our labels are engineered with tamper-evident materials that cannot be peeled or reused without visible destruction."
          benefits={["Multi-scan detection", "Anti-reuse protocols", "Grey market mitigation"]}
        />

        <SolutionBlock 
          icon={Cpu}
          title="Enterprise QR Portal"
          description="Manage millions of identities from a single glass pane. Order, activate, and track every batch from production to the end consumer."
          benefits={["Real-time activation controls", "Batch verification tracking", "API-driven automation"]}
        />

        <SolutionBlock 
          icon={BarChart}
          title="Scan Intelligence"
          reverse={true}
          description="Our engine analyzes scan patterns globally to identify high-risk zones and suspicious behavior in real-time."
          benefits={["Heat-map of counterfeit activity", "Instant brand abuse alerts", "Consumer engagement analytics"]}
        />

        {/* Scalability Grid */}
        <section className="py-24 px-6 border-t border-white/5">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">Built for Scale</h2>
              <p className="text-gray-400 font-bold">From luxury boutiques to global pharmaceutical giants.</p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {['Fashion', 'Electronics', 'Pharma', 'Automotive', 'FMCG'].map((industry, i) => (
                <div key={i} className="glass-effect p-8 rounded-3xl text-center border border-white/5 hover:border-indigo-500/50 transition-all group">
                   <div className="text-gray-500 group-hover:text-indigo-400 transition-colors mb-4 flex justify-center">
                      <Zap size={24} />
                   </div>
                   <p className="text-sm font-black uppercase tracking-tight text-white">{industry}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Final CTA/Why */}
        <section className="py-24 px-6 overflow-hidden relative">
          <Glow color="bg-indigo-600" className="-bottom-24 -right-24 opacity-10" />
           <div className="glass-effect p-16 rounded-[4rem] border border-white/10 text-center max-w-4xl mx-auto relative z-10">
              <ShieldCheck size={64} className="text-indigo-500 mx-auto mb-8" />
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-8 italic">The Gold Standard in Brand Security.</h2>
              <div className="flex flex-wrap justify-center gap-4">
                 {[
                   "Secure Cryptographic QR",
                   "No-App Verification",
                   "Real-Time Alerts",
                   "Scalable Infrastructure"
                 ].map((pill, i) => (
                   <span key={i} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-indigo-400">
                     {pill}
                   </span>
                 ))}
              </div>
           </div>
        </section>
      </main>

      <WebFooter />
    </div>
  );
}
