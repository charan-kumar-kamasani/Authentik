import React from "react";
import { MoveRight, Target, Eye, ShieldCheck, Heart, Zap, Globe, Users, Lightbulb } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import techBg from "../../assets/web/hero_image.png";

const Glow = ({ color, className }) => (
  <div className={`glow-bg h-64 w-64 ${color} ${className}`} />
);

const ValueCard = ({ icon: Icon, title, description }) => (
  <div className="glass-effect p-8 rounded-[2rem] hover:border-indigo-500/30 transition-all group">
    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-black text-white mb-3 tracking-tight uppercase">{title}</h3>
    <p className="text-sm font-bold text-gray-400 leading-relaxed">{description}</p>
  </div>
);

export default function WebAboutUs() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
      <WebHeader />

      {/* Hero Banner */}
      <section className="relative pt-32 pb-20 px-6 border-b border-white/5 overflow-hidden">
        <Glow color="bg-indigo-600" className="-top-24 -left-24 opacity-20" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-none">
              Securing the <br /><span className="gradient-text">Future</span> of Brands.
            </h1>
            <p className="text-xl text-gray-400 font-bold leading-relaxed">
              Authentiks is your dedicated partner in eliminating counterfeits and building absolute consumer trust.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full -z-10 opacity-30 grayscale pointer-events-none hidden md:block">
           <img src={techBg} alt="" className="w-full h-full object-cover blur-2xl" />
        </div>
      </section>

      {/* Content Section */}
      <main className="flex-grow py-24 px-6">
        <div className="container mx-auto">
          {/* Main Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-32">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-indigo-400 mb-6">
                Our Story
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">Eliminating Doubt, <br />Ensuring Authenticity</h2>
            </div>
            <div className="space-y-6 text-gray-400 font-bold text-lg leading-relaxed">
              <p>
                Authentiks was born from a simple mission: to give every single product a voice of truth. In a world where $2.3 trillion is lost to counterfeits annually, staying genuine isn't just a preference—it's survival.
              </p>
              <p>
                We provide brands with advanced cryptographic QR technology that integrates seamlessly into their production. Our tamper-proof, peel-and-scan labels empower consumers to verify authenticity in seconds, without ever needing to download an app.
              </p>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
            <div className="glass-effect p-12 rounded-[3rem] relative overflow-hidden group">
              <div className="text-indigo-400 mb-8 group-hover:scale-110 transition-transform"><Target size={48} /></div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Our Mission</h3>
              <p className="text-gray-400 font-bold text-lg leading-relaxed">
                To protect global brands and their consumers by ensuring every product sold is genuine, traceable, and trusted, effectively eliminating counterfeit goods from the marketplace.
              </p>
            </div>
            <div className="glass-effect p-12 rounded-[3rem] relative overflow-hidden group">
              <div className="text-purple-400 mb-8 group-hover:scale-110 transition-transform"><Eye size={48} /></div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Our Vision</h3>
              <p className="text-gray-400 font-bold text-lg leading-relaxed">
                To build a future where authenticity is verified instantly at every point of sale, and consumers never have to question the integrity of what they buy.
              </p>
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">Core Values</h2>
              <div className="h-1.5 w-20 bg-indigo-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ValueCard 
                icon={ShieldCheck} 
                title="Trust First" 
                description="Trust is at the core of everything we do—for brands, consumers, and partners alike."
              />
              <ValueCard 
                icon={Zap} 
                title="Integrity by Design" 
                description="We build systems that are secure, transparent, and fundamentally impossible to manipulate."
              />
              <ValueCard 
                icon={Users} 
                title="Consumer Power" 
                description="We give every customer the power to verify heritage and authenticity in seconds."
              />
              <ValueCard 
                icon={Globe} 
                title="Brand Protection" 
                description="We respect the effort and craftsmanship behind every genuine product and safeguard its reputation."
              />
              <ValueCard 
                icon={Lightbulb} 
                title="Simplicity at Scale" 
                description="Complex problems deserve simple, reliable solutions that work across millions of products."
              />
              <ValueCard 
                icon={Heart} 
                title="Innovation with Purpose" 
                description="We use cutting-edge technology to solve real-world problems with measurable impact."
              />
            </div>
          </div>
        </div>
      </main>

      <WebFooter />
    </div>
  );
}
