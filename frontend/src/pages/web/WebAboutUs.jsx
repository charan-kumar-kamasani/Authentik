import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Eye, MapPin, BarChart3, Users, Briefcase, Handshake, Shield, Target, Lightbulb, TrendingUp, Calendar, CalendarCheck2, Globe, Linkedin, Phone, Settings, Activity } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import DemoModal from "../../components/DemoModal";
import aboutHeroImage from "../../assets/banners/new_banners/about_us.png";
import ibadulImage from "../../assets/web/founders/main.png";
import charanImage from "../../assets/web/founders/charan.png";
import rajeevImage from "../../assets/web/founders/image.png";

export default function WebAboutUs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <WebHeader />

      {/* Hero Banner */}
      <section className="relative w-full cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[600px] overflow-hidden bg-slate-100">
          <img
            src={aboutHeroImage}
            alt="About Us"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </section>

      {/* Why Authentiks Exists */}
      <section className="pt-20 pb-16 overflow-hidden relative bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-4 text-center">Why Authentiks Exists</h3>
            <h1 className="text-4xl md:text-[42px] font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight text-center">
              Brands own the product—but not the <span className="text-blue-600">consumer relationship</span>. Authentiks changes that.
            </h1>
            <div className="text-lg text-slate-600 mb-12 leading-relaxed space-y-4">
              <p>
                Modern businesses invest heavily in acquiring customers, building products, and growing distribution. Yet once a product reaches the consumer, brands often lose visibility and ownership of the relationship.
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium text-slate-700">
                <li>Marketplaces own customer data.</li>
                <li>Retailers own the transaction.</li>
                <li>Distributors own the supply chain.</li>
              </ul>
              <p>
                Our Consumer Intelligence Platform transforms every physical product into a secure digital identity, enabling brands to authenticate products, register consumers, collect first-party data, deliver engaging post-purchase experiences, and make smarter business decisions through real-time insights.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-12 mt-12 pt-12 border-t border-slate-100">
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h4>
                  <p className="text-base text-slate-600 leading-relaxed">
                    To help every brand build trusted, data-driven relationships with consumers by transforming physical products into connected digital assets.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                  <Eye size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h4>
                  <p className="text-base text-slate-600 leading-relaxed">
                    A future where every physical product has a secure digital identity, every consumer can trust what they buy, and every brand truly owns its customer relationship.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Brands Choose Authentiks */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Brands Choose Authentiks</h2>
          <div className="text-lg text-slate-600 space-y-6 max-w-3xl mx-auto leading-relaxed">
            <p>
              Brands choose Authentiks because we help them move beyond product authentication.
            </p>
            <p>
              We enable them to build direct consumer relationships, capture first-party intelligence, protect brand integrity, and create meaningful post-purchase experiences—all through one connected platform.
            </p>
            <p>
              Our solution combines enterprise-grade security, scalable technology, and actionable insights, helping brands make every product work harder long after it has been sold.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-16 text-center">Leadership</h2>
          
          {/* Rajeev */}
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row gap-10 shadow-sm max-w-5xl mx-auto items-center md:items-start mb-8">
             <div className="shrink-0">
                <div className="w-48 h-48 rounded-full bg-slate-200 border-4 border-white shadow-md mx-auto overflow-hidden relative">
                   <img src={rajeevImage} alt="Rajeev Mecheri" className="w-full h-full object-cover object-top" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                   <div className="absolute inset-0 bg-slate-300 hidden flex-col justify-end items-center"><div className="w-24 h-24 rounded-full bg-slate-400 mb-1"></div><div className="w-36 h-20 bg-slate-400 rounded-t-full"></div></div>
                </div>
             </div>
             
             <div className="flex-1 text-center md:text-left">
                <div className="mb-2">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">Mentor & Strategic Advisor</div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900">Rajeev Mecheri</h3>
                      <p className="text-sm font-medium text-slate-500 mt-1">Serial Entrepreneur • Angel Investor • Technology Leader</p>
                    </div>
                    <a href="https://www.linkedin.com/in/rajeevmecheri/" target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 inline-flex self-center md:self-auto transition-colors"><Linkedin size={18}/></a>
                  </div>
                </div>
                <div className="space-y-4 text-[15px] text-slate-600 leading-relaxed mt-4">
                  <p>
                    Rajeev Mecheri is one of India's most respected technology entrepreneurs and startup mentors. Over the past three decades, he has built and scaled multiple technology companies, led successful global exits, invested in innovative startups and contributed extensively to the entrepreneurial ecosystem through organizations including The Chennai Angels, TiE, EO and YPO.
                  </p>
                  <p>
                    At Authentiks, Rajeev serves as Mentor and Strategic Advisor, helping shape our long-term vision, product strategy and enterprise growth. His mentorship reflects our commitment to building a globally trusted Consumer Intelligence Platform that enables brands to create secure, connected and intelligent product experiences.
                  </p>
                </div>
             </div>
          </div>
          
          {/* Ibadul */}
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row gap-10 shadow-sm max-w-5xl mx-auto items-center md:items-start mb-8">
             <div className="shrink-0">
                <div className="w-48 h-48 rounded-full bg-slate-200 border-4 border-white shadow-md mx-auto overflow-hidden relative">
                   <img src={ibadulImage} alt="Ibadul Hassan" className="w-full h-full object-cover object-top" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                   <div className="absolute inset-0 bg-slate-300 hidden flex-col justify-end items-center"><div className="w-24 h-24 rounded-full bg-slate-400 mb-1"></div><div className="w-36 h-20 bg-slate-400 rounded-t-full"></div></div>
                </div>
             </div>
             
             <div className="flex-1 text-center md:text-left">
                <div className="mb-2">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">Co-Founder & Business Head</div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-3xl font-bold text-slate-900">Ibadul Hassan</h3>
                    <a href="https://www.linkedin.com/in/ibadul-hassan-6430b247/" target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 inline-flex self-center md:self-auto transition-colors"><Linkedin size={18}/></a>
                  </div>
                </div>
                <div className="space-y-4 text-[15px] text-slate-600 leading-relaxed mt-4">
                  <p>
                    Hassan is the Co-Founder & Business Head of Authentiks, where he leads business strategy, product innovation, and enterprise growth. With over 18 years of cross-functional leadership experience, he has worked with both global enterprises and high-growth startups, driving initiatives across operations, supply chain, digital transformation, customer experience and business development.
                  </p>
                  <p>
                    Driven by the belief that brands should own their customer relationships—not just their sales—he co-founded Authentiks to redefine how physical products connect with consumers. His focus is on building a platform that enables brands to authenticate products, capture first-party consumer intelligence and create meaningful post-purchase experiences at scale.
                  </p>
                </div>
             </div>
          </div>

          {/* Charan */}
          <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row gap-10 shadow-sm max-w-5xl mx-auto items-center md:items-start mb-8">
             <div className="shrink-0">
                <div className="w-48 h-48 rounded-full bg-slate-200 border-4 border-white shadow-md mx-auto overflow-hidden relative">
                   <img src={charanImage} alt="Charan Kumar" className="w-full h-full object-cover object-top" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                   <div className="absolute inset-0 bg-slate-300 hidden flex-col justify-end items-center"><div className="w-24 h-24 rounded-full bg-slate-400 mb-1"></div><div className="w-36 h-20 bg-slate-400 rounded-t-full"></div></div>
                </div>
             </div>
             
             <div className="flex-1 text-center md:text-left">
                <div className="mb-2">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">Co-Founder & Technology Head</div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-3xl font-bold text-slate-900">Charan Kumar</h3>
                    <a href="https://www.linkedin.com/in/charan-kumar-kamasani" target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 inline-flex self-center md:self-auto transition-colors"><Linkedin size={18}/></a>
                  </div>
                </div>
                <div className="space-y-4 text-[15px] text-slate-600 leading-relaxed mt-4">
                  <p>
                    Charan is the Co-Founder & Head of Technology at Authentiks, leading the platform's technology vision, product engineering and architecture. With expertise in full-stack development, cloud technologies, APIs and scalable application development, he focuses on building secure, high-performance systems that enable brands to connect every physical product with its digital identity.
                  </p>
                  <p>
                    At Authentiks, Charan drives the development of the Consumer Intelligence Platform, ensuring every component—from product authentication and digital product passports to analytics and enterprise integrations—is built with scalability, security and reliability at its core.
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <ShieldCheck size={32}/>, title: "Trust by Design", desc: "Trust is built into every product through secure digital identities and verified consumer experiences." },
              { icon: <Users size={32}/>, title: "Consumer First", desc: "Technology should simplify ownership, improve transparency, and create meaningful experiences for consumers." },
              { icon: <Lightbulb size={32}/>, title: "Innovation with Purpose", desc: "Every feature we build is designed to solve real business challenges while delivering measurable value." },
              { icon: <Handshake size={32}/>, title: "Long-Term Partnerships", desc: "We believe the strongest businesses are built through trust, collaboration, and lasting relationships." }
            ].map((value, idx) => (
              <div key={idx} className="flex flex-col text-center gap-4 bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  {value.icon}
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{value.title}</h4>
                <p className="text-slate-600 text-[15px] leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Building the Future & CTA Bottom */}
      <section className="pb-24 pt-12 px-6 md:px-12 bg-white">
         
         <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Building the Future</h2>
            <div className="text-[17px] text-slate-600 space-y-4 leading-relaxed">
              <p>The future of commerce is not just about selling products.</p>
              <p>It is about creating trusted, connected experiences that continue long after the purchase.</p>
              <p>At Authentiks, we are building the digital infrastructure that enables every physical product to become a source of trust, intelligence, and lifelong consumer engagement.</p>
              <p className="font-bold text-slate-800">Because every product should do more than reach a consumer.<br/>It should build a relationship.</p>
            </div>
         </div>

         <div className="max-w-6xl mx-auto bg-[#0d47a1] rounded-[32px] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex items-center gap-8 text-white w-full md:w-auto">
               <div className="hidden sm:flex w-24 h-24 bg-white/10 border border-white/20 rounded-2xl items-center justify-center backdrop-blur-sm shrink-0">
                  <ShieldCheck size={40} className="text-white opacity-90" />
               </div>
               <div className="max-w-xl text-center md:text-left">
                  <h2 className="text-[28px] md:text-3xl font-bold mb-4 leading-tight">Ready to Build Smarter Consumer Relationships?</h2>
                  <p className="text-blue-100 text-lg">Transform every product into a connected digital asset and unlock the power of consumer intelligence.</p>
               </div>
            </div>
            
            <div className="relative z-10 shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-4">
               <Link to="/contact-us" className="w-full sm:w-auto">
                 <button className="w-full md:w-auto bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg flex items-center justify-center gap-2">
                   <Calendar size={20}/> Book a Demo
                 </button>
               </Link>
            </div>
         </div>
      </section>

      <WebFooter />

      <DemoModal 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </div>
  );
}
