import React from 'react';
import { ShieldCheck, ScanFace, CheckCircle2, AlertTriangle, BarChart3, Globe2, Layers, Cpu, Smartphone, Briefcase } from 'lucide-react';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';

// Use the existing hero image as a background accent if needed, 
// but we'll focus on a more technical, atmospheric vibe
import heroImage from '../../assets/web/image 1.png';

const Glow = ({ color, className }) => (
  <div className={`glow-bg h-64 w-64 ${color} ${className}`} />
);

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div className="glass-effect p-8 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2">
    <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
      <Icon size={32} />
    </div>
    <h3 className="text-xl font-black text-white mb-3 tracking-tighter uppercase">{title}</h3>
    <p className="text-sm font-bold text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const IndustryItem = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-default group">
    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 group-hover:text-white transition-colors">
      <Icon size={24} />
    </div>
    <span className="font-bold text-gray-300 text-sm md:text-base group-hover:text-white transition-colors tracking-tight">{title}</span>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <WebHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto text-center relative z-10">
          <Glow color="bg-indigo-600" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-8 animate-bounce">
            <ShieldCheck size={14} />
            World Class Brand Protection
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9] max-w-5xl mx-auto">
            Absolute <span className="gradient-text">Trust</span>.<br />
            Zero <span className="text-slate-500">Counterfeits</span>.
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium text-gray-400 mb-12 leading-relaxed">
            Authentiks uses advanced cryptographic QR technology to prove every product you sell is genuine. Secure your brand, protect your customers.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 text-sm">
              Launch Enterprise Panel
            </button>
            <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all text-sm">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Hero Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20 pointer-events-none">
          <img src={heroImage} alt="" className="w-full h-full object-cover blur-3xl" />
        </div>
      </section>

      {/* Stats/Problem Section */}
      <section className="py-24 px-6 bg-black/40">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20">
              <div className="text-red-400 mb-4"><AlertTriangle size={32} /></div>
              <h4 className="text-4xl font-black text-white mb-2 tracking-tighter">$2.3 TRILLION</h4>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Global Counterfeit Market</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20">
              <div className="text-indigo-400 mb-4"><BarChart3 size={32} /></div>
              <h4 className="text-4xl font-black text-white mb-2 tracking-tighter">10% REVENUE</h4>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Average Loss for Brands</p>
            </div>
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20">
              <div className="text-purple-400 mb-4"><Globe2 size={32} /></div>
              <h4 className="text-4xl font-black text-white mb-2 tracking-tighter">1 OF 5</h4>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Products Sold Online are Fake</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 relative overflow-hidden">
        <Glow color="bg-purple-600" className="-right-32 top-1/2 opacity-20" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">How It Works</h2>
            <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={Layers} 
              title="Secure Buy" 
              description="Choose products protected by Authentiks secure QR labels at point of purchase."
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Instant Scan" 
              description="Simply scan the unique code using any smartphone camera. No app required."
            />
            <FeatureCard 
              icon={CheckCircle2} 
              title="Live Verify" 
              description="Instantly receive cryptographic proof of the products genuine origin and details."
            />
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-32 px-6 bg-black/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase mb-6 leading-none">
                Serving the Worlds <br /><span className="text-indigo-500">Fastest</span> Industries
              </h2>
              <p className="text-gray-400 font-bold leading-relaxed">
                From high-end fashion to critical pharmaceuticals, Authentiks adaptive protection scale to meet the demands of any global supply chain.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
              <div className="w-4 h-1 bg-indigo-500 rounded-full" />
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {[
              { title: "FMCG", icon: Cpu },
              { title: "Pharmaceuticals", icon: ShieldCheck },
              { title: "Fashion & Luxury", icon: Briefcase },
              { title: "Electronics", icon: Smartphone },
              { title: "Automotive Parts", icon: Layers },
              { title: "Cosmetic & Beauty", icon: CheckCircle2 }
            ].map((item, i) => (
              <IndustryItem key={i} title={item.title} icon={item.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="glass-effect rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <Glow color="bg-indigo-600" className="-top-24 -left-24 opacity-30" />
            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter">Ready to protect <br />your heritage?</h2>
            <p className="text-gray-400 font-bold mb-10 max-w-lg mx-auto leading-relaxed">
              Join hundreds of premium brands leveraging Authentiks to build absolute customer trust.
            </p>
            <button className="px-12 py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 text-base">
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      <WebFooter />
    </div>
  );
}
