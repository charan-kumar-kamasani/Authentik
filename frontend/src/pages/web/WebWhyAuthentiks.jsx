import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, ShieldCheck, TrendingUp, Users, Smartphone, BarChart3, Target, PackageSearch, RefreshCcw } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import DemoModal from "../../components/DemoModal";
import whyHeroImage from "../../assets/web/why_authentiks_web_banner.png";

export default function WebWhyAuthentiks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const missingKnowledge = [
    "Who bought the product.",
    "Whether the product is genuine.",
    "Where the product is being used.",
    "If the customer is satisfied.",
    "When the customer needs to buy again.",
    "Whether the customer becomes loyal."
  ];

  const modernNeeds = [
    "Register consumers",
    "Build first-party consumer relationships",
    "Deliver product information instantly",
    "Activate digital warranties",
    "Reward genuine customers",
    "Drive repeat purchases",
    "Understand consumer behavior",
    "Measure engagement after every sale"
  ];

  const features = [
    "Product Authentication",
    "Consumer Registration",
    "Digital Product Passport",
    "Warranty Activation",
    "Rewards & Loyalty",
    "Smart Reorder",
    "Marketplace Intelligence",
    "Price Alerts",
    "Consumer Intelligence",
    "Business Analytics"
  ];

  const continuousJourney = [
    "Verify authenticity",
    "Register ownership",
    "Deliver product information",
    "Activate warranty",
    "Reward engagement",
    "Encourage repeat purchases",
    "Collect valuable consumer insights",
    "Build long-term customer relationships"
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <WebHeader />

      {/* Hero Banner Image */}
      <section className="relative w-full cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[600px] overflow-hidden bg-slate-100">
          <img
            src={whyHeroImage}
            alt="Why Authentiks"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </section>

      {/* Introduction */}
      <section className="pt-20 pb-16 px-6 md:px-12 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
            Commerce Has Changed. <br className="hidden md:block" />
            <span className="text-blue-600">Has Your Brand?</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-6 leading-relaxed">
            Today's consumers purchase through marketplaces, quick commerce, retail stores, distributors, and offline channels. While these channels help brands grow sales, they rarely help brands build lasting customer relationships.
          </p>
          <div className="inline-block bg-blue-100/50 border border-blue-200 rounded-2xl p-6 mt-4 shadow-sm">
            <p className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
              Every product sold is an opportunity—but for most brands, that opportunity <span className="text-red-500">ends at checkout</span>.
            </p>
          </div>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">The Challenge Modern Brands Face</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">Products Reach Customers. Customer Relationships Don't Always Reach Brands.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-slate-50 rounded-[2rem] p-8 md:p-12 border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <PackageSearch className="text-blue-500" size={28} />
                Most brands know:
              </h3>
              <ul className="space-y-4">
                {["How many products they sold.", "Which distributor or marketplace sold them.", "Inventory movement across channels."].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <span className="font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50/50 rounded-[2rem] p-8 md:p-12 border border-red-100 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={28} />
                But they often don't know:
              </h3>
              <ul className="space-y-4">
                {missingKnowledge.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></div>
                    <span className="font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-center mt-12">
            <p className="text-2xl font-bold text-slate-800 italic">Without that visibility, every new purchase often starts from zero.</p>
          </div>
        </div>
      </section>

      {/* Traditional Authentication vs Modern Needs */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 font-semibold text-sm mb-6 border border-slate-700">
            THE EVOLUTION
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Traditional Authentication Solves Only One Problem</h2>
          <p className="text-xl text-slate-300 mb-16">Authentication verifies whether a product is genuine. <br className="hidden md:block" /><strong className="text-white">Modern brands need much more.</strong></p>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-[2.5rem] p-10 md:p-16 text-left backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-8 text-center text-blue-300">They need to:</h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {modernNeeds.map((need, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 shadow-lg">
                  <ShieldCheck className="text-blue-400 shrink-0" size={24} />
                  <span className="font-medium text-lg text-slate-200">{need}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-16 text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-wide">
            Authentication is the starting point—not the destination.
          </div>
        </div>
      </section>

      {/* From Products to Connected Business Assets */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">From Products to Connected Business Assets</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Every product already reaches a consumer. Authentiks ensures every product also creates a lasting digital connection between the brand and that consumer.
            </p>
          </div>

          <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-3xl mb-8 rotate-3 shadow-sm border border-blue-200">
                <Smartphone className="text-blue-600 w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">One secure QR unlocks a complete post-purchase experience:</h3>
              <p className="text-lg text-slate-500 font-medium italic">Every interaction becomes valuable business intelligence.</p>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-slate-700 font-semibold text-sm md:text-base text-center shadow-sm hover:shadow-md transition-shadow hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 cursor-default">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why First-Party Consumer Intelligence Matters */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">Why First-Party Consumer Intelligence Matters</h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                The brands that grow fastest don't just sell more products.<br/> <strong className="text-slate-800">They understand their consumers better.</strong>
              </p>
              
              <div className="bg-blue-600 rounded-3xl p-8 shadow-xl text-white transform -rotate-1 hover:rotate-0 transition-transform">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Target size={28} className="text-blue-300" />
                  With verified first-party consumer data, brands can:
                </h3>
                <ul className="space-y-4">
                  {[
                    "Build stronger customer relationships",
                    "Improve customer experience",
                    "Increase repeat purchases",
                    "Launch targeted campaigns",
                    "Make better product decisions",
                    "Understand regional demand",
                    "Measure engagement across products",
                    "Reduce dependence on intermediaries"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0"></div>
                      <span className="font-medium text-blue-50">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-50 rounded-[3rem] p-12 text-center border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>
               <BarChart3 size={64} className="text-blue-500 mx-auto mb-8 relative z-10" />
               <p className="text-3xl md:text-4xl font-black text-slate-800 leading-tight relative z-10">
                 Better consumer understanding leads to better business decisions.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Authentiks Is Different */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8">Why Authentiks Is Different</h2>
          <p className="text-xl text-slate-600 mb-16 leading-relaxed max-w-3xl mx-auto">
            Unlike traditional authentication platforms that stop after verification, Authentiks creates a continuous consumer journey.
          </p>
          
          <div className="bg-white rounded-3xl p-10 shadow-lg border border-slate-200">
             <h3 className="text-2xl font-bold text-slate-800 mb-10 flex items-center justify-center gap-3">
                <RefreshCcw size={28} className="text-blue-600" />
                Every scan becomes an opportunity to:
             </h3>
             <div className="grid sm:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
               {continuousJourney.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                   <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                     <CheckCircle2 size={18} />
                   </div>
                   <span className="font-semibold text-slate-700">{item}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* Industries & Conclusion */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">One Platform. Endless Possibilities.</h2>
          <p className="text-lg text-slate-600 mb-12 leading-relaxed">
            Whether you're a nutraceutical brand, electronics manufacturer, cosmetics company, pharmaceutical business, or consumer goods company, Authentiks adapts to your post-purchase strategy.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12 text-2xl font-black text-slate-800 mb-16">
            <span className="text-blue-600">Protect your products.</span>
            <span className="text-indigo-600">Know your consumers.</span>
            <span className="text-emerald-600">Strengthen your brand.</span>
          </div>
          
          <div className="inline-block px-8 py-3 bg-slate-100 rounded-full font-bold text-xl text-slate-700 shadow-sm border border-slate-200">
            Drive repeat business. All from one connected platform.
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 md:px-12 bg-white border-t border-slate-100">
         <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-700 to-blue-900 rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/3"></div>
            
            <div className="relative z-10 text-white flex flex-col items-center">
               <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight max-w-3xl leading-tight">The Sale Should Never Be the End of the Relationship.</h2>
               <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed">
                 Every product you sell has the potential to keep working for your brand. Let Authentiks help you unlock that potential.
               </p>
               
               <button onClick={() => setIsDialogOpen(true)} className="bg-white text-blue-800 px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg hover:scale-105 transform duration-200 flex items-center gap-2">
                 Book a Demo
               </button>
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
