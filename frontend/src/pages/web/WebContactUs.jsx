import React from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Shield } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import techBg from "../../assets/web/hero_image.png";

const Glow = ({ color, className }) => (
  <div className={`glow-bg h-64 w-64 ${color} ${className}`} />
);

const InputField = ({ label, type = "text", placeholder }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-bold placeholder:text-gray-600"
    />
  </div>
);

export default function WebContactUs() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden flex flex-col">
      <WebHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <Glow color="bg-indigo-600" className="-top-24 -left-24 opacity-20" />
        <div className="container mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-black uppercase tracking-widest text-indigo-400 mb-6">
            Contact Support
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase">
            Let's <span className="gradient-text">Connect</span>.
          </h1>
          <p className="text-xl text-gray-400 font-bold max-w-2xl mx-auto">
            Our team of brand protection experts is ready to help you secure your future.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto py-12 px-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-start">
          
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 leading-tight">Securing Your <br />Brand Starts Here.</h2>
              <p className="text-gray-400 font-bold text-lg leading-relaxed">
                Whether you're a small boutique or a global enterprise, we have the tools to ensure your products remain genuine.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                { icon: Mail, title: "Email Us", val: "support@authentiks.com" },
                { icon: Phone, title: "Call Us", val: "+1 (555) AUTH-NOW" },
                { icon: MapPin, title: "Global Headquarters", val: "Silicon Valley, CA" }
              ].map((item, i) => (
                <div key={i} className="glass-effect p-6 rounded-3xl border border-white/5 flex gap-6 items-center group hover:bg-white/[0.03] transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                    <item.icon size={28} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">{item.title}</h4>
                    <p className="text-white font-black text-lg">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-effect p-8 rounded-[2rem] border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
               <Shield size={120} className="absolute -right-8 -bottom-8 text-indigo-500/5" />
               <p className="text-sm font-bold text-gray-300 relative z-10 leading-relaxed">
                 <span className="text-indigo-400 font-black uppercase block mb-2">Technical Support</span> 
                 Already an Enterprise client? Access your dedicated support portal for 24/7 priority assistance and real-time activation support.
               </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-effect p-10 md:p-12 rounded-[3.5rem] border border-white/10 relative">
             <Glow color="bg-indigo-600" className="-top-12 -right-12 opacity-10" />
             <div className="mb-10 text-center lg:text-left">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Send a Message</h3>
                <p className="text-gray-500 font-bold text-sm">Typical response time: Under 2 hours.</p>
             </div>
             
             <form className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <InputField label="Full Name" placeholder="John Doe" />
                   <InputField label="Email Address" type="email" placeholder="john@company.com" />
                </div>
                <InputField label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Your Message</label>
                  <textarea 
                    rows={5}
                    placeholder="How can we help your brand today?"
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-bold placeholder:text-gray-600 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 group"
                >
                  Dispatch Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
             </form>
          </div>

        </div>
      </main>

      <WebFooter />
    </div>
  );
}
