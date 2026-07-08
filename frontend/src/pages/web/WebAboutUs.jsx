import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Eye, MapPin, BarChart3, Users, Briefcase, Handshake, Shield, Target, Lightbulb, TrendingUp, Calendar, CalendarCheck2, Globe, Linkedin, Phone, Settings, Activity } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import aboutHeroImage from "../../assets/web/about_us_hero.png";
import ibadulImage from "../../assets/web/founders/main.png";
import charanImage from "../../assets/web/founders/charan.png";
import rajeevImage from "../../assets/web/founders/image.png";

export default function WebAboutUs() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <WebHeader />

      {/* Hero Section */}
      <section className="pt-20 pb-16 overflow-hidden relative bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-4">About Us</h3>
            <h1 className="text-4xl md:text-[52px] font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Building the <span className="text-blue-600">Digital Identity Layer</span> for Physical Products
            </h1>
            <p className="text-lg text-slate-600 mb-12 leading-relaxed max-w-xl">
              Authentiks empowers brands to transform every physical product into a connected digital asset—bridging the gap between products and consumers through authentication, intelligence, and engagement.
            </p>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Our Mission</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    To help brands build trusted, data-driven relationships with consumers through connected products.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                  <Eye size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Our Vision</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    A future where every physical product has a secure digital identity and every brand owns its consumer relationship.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 hidden lg:block">
            <div className="relative w-full h-full flex items-center justify-end">
               <img src={aboutHeroImage} alt="Authentiks About Us" className="w-[120%] max-w-none h-auto -translate-y-4 translate-x-8" />
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">What We Believe</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { icon: <Shield size={24}/>, title: "Trust should be built into every product." },
               { icon: <Eye size={24}/>, title: "Consumers deserve transparency." },
               { icon: <BarChart3 size={24}/>, title: "Brands deserve first-party customer intelligence." },
               { icon: <Handshake size={24}/>, title: "Every interaction should create value." }
             ].map((item, idx) => (
               <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                 <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                   {item.icon}
                 </div>
                 <h3 className="font-bold text-slate-900 text-lg leading-snug">{item.title}</h3>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-16 text-center">Leadership</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Ibadul */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-10 flex flex-col sm:flex-row gap-8 shadow-sm hover:shadow-md transition-shadow">
               <div className="shrink-0 flex justify-center sm:justify-start">
                 <div className="w-36 h-36 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden relative">
                   <img src={ibadulImage} alt="Ibadul Hassan" className="w-full h-full object-cover" />
                 </div>
               </div>
               <div className="flex-1">
                 <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4 sm:gap-0">
                   <div className="text-center sm:text-left">
                     <h3 className="text-2xl font-bold text-blue-700 mb-1">Ibadul Hassan</h3>
                     <p className="text-slate-500 font-bold text-sm tracking-wide">Co-Founder & Business Head</p>
                   </div>
                   <div className="flex justify-center sm:justify-start">
                     <a href="#" className="text-blue-600 bg-blue-50 p-2.5 rounded-xl hover:bg-blue-100 transition-colors"><Linkedin size={20}/></a>
                   </div>
                 </div>
                 <p className="text-[15px] text-slate-600 leading-relaxed text-center sm:text-left">
                   Business leader with 16+ years of experience across operations, strategy, business development, supply chain, and growth. Passionate about helping brands build scalable businesses through technology and consumer intelligence.
                 </p>
               </div>
            </div>
            
            {/* Charan */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-10 flex flex-col sm:flex-row gap-8 shadow-sm hover:shadow-md transition-shadow">
               <div className="shrink-0 flex justify-center sm:justify-start">
                 <div className="w-36 h-36 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden relative">
                   <img src={charanImage} alt="Charan Kumar Kamasani" className="w-full h-full object-cover" />
                 </div>
               </div>
               <div className="flex-1">
                 <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4 sm:gap-0">
                   <div className="text-center sm:text-left">
                     <h3 className="text-2xl font-bold text-blue-700 mb-1">Charan Kumar Kamasani</h3>
                     <p className="text-slate-500 font-bold text-sm tracking-wide">Co-Founder & Technology</p>
                   </div>
                   <div className="flex justify-center sm:justify-start">
                     <a href="#" className="text-blue-600 bg-blue-50 p-2.5 rounded-xl hover:bg-blue-100 transition-colors"><Linkedin size={20}/></a>
                   </div>
                 </div>
                 <p className="text-[15px] text-slate-600 leading-relaxed text-center sm:text-left">
                   Technology leader focused on building secure, scalable, enterprise-grade platforms that simplify digital product identity and deliver exceptional user experiences.
                 </p>
               </div>
            </div>
          </div>
          
          {/* Mentor */}
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row gap-10 shadow-sm max-w-5xl mx-auto items-center md:items-start">
             <div className="shrink-0">
                <div className="w-40 h-40 rounded-full bg-slate-200 border-4 border-white shadow-md mx-auto overflow-hidden relative">
                   <img src={rajeevImage} alt="Rajeev Mecheri" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                   <div className="absolute inset-0 bg-slate-300 hidden flex-col justify-end items-center"><div className="w-20 h-20 rounded-full bg-slate-400 mb-1"></div><div className="w-32 h-16 bg-slate-400 rounded-t-full"></div></div>
                </div>
             </div>
             
             <div className="flex-1 text-center md:text-left">
                <div className="mb-2">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">Our Mentor & Strategic Advisor</div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-3xl font-bold text-slate-900">Rajeev Mecheri</h3>
                    <a href="#" className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 inline-flex self-center md:self-auto"><Linkedin size={18}/></a>
                  </div>
                </div>
                <div className="space-y-4 text-[15px] text-slate-600 leading-relaxed mt-4">
                  <p>
                    Rajeev Mecheri is an accomplished entrepreneur and business leader with extensive experience in building and scaling technology-driven businesses.
                  </p>
                  <p>
                    As Mentor and Strategic Advisor to Authentiks, he provides guidance on product strategy, enterprise partnerships, business growth, and long-term vision. His mentorship continues to play a key role in shaping Authentiks' journey as a Consumer Intelligence Platform.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-16 text-center">Our Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { icon: <ShieldCheck size={32}/>, title: "Integrity" },
              { icon: <Users size={32}/>, title: "Consumer First" },
              { icon: <Lightbulb size={32}/>, title: "Innovation" },
              { icon: <Target size={32}/>, title: "Ownership" },
              { icon: <Handshake size={32}/>, title: "Collaboration" }
            ].map((value, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  {value.icon}
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{value.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="pb-24 pt-12 px-6 md:px-12 bg-white">
         <div className="max-w-6xl mx-auto bg-[#0d47a1] rounded-[32px] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex items-center gap-8 text-white w-full md:w-auto">
               <div className="hidden sm:flex w-24 h-24 bg-white/10 border border-white/20 rounded-2xl items-center justify-center backdrop-blur-sm shrink-0">
                  <ShieldCheck size={40} className="text-white opacity-90" />
               </div>
               <div className="max-w-xl text-center md:text-left">
                  <h2 className="text-[28px] md:text-3xl font-bold mb-4 leading-tight">Ready to Build Stronger Consumer Relationships?</h2>
                  <p className="text-blue-100 text-lg">Let's connect and create impact together.</p>
               </div>
            </div>
            
            <div className="relative z-10 shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-4">
               <Link to="/contact-us" className="w-full sm:w-auto">
                 <button className="w-full md:w-auto bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg flex items-center justify-center gap-2">
                   <Calendar size={20}/> Book a Demo
                 </button>
               </Link>
               <Link to="/contact-us" className="w-full sm:w-auto">
                 <button className="w-full md:w-auto bg-blue-800 border border-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                   <Phone size={20}/> Talk to Sales
                 </button>
               </Link>
            </div>
         </div>
      </section>

      <WebFooter />
    </div>
  );
}
