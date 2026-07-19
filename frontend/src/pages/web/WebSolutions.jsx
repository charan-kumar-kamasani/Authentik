import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, Users, QrCode, ShieldAlert, 
  Gem, ShoppingBag, Globe, Megaphone, 
  BarChart3, Laptop, CheckCircle2
} from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import DemoModal from "../../components/DemoModal";
import solutionsHeroImage from "../../assets/web/solutions_web_banner.png";

export default function WebSolutions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const capabilities = [
    {
      title: "Product Authentication",
      subtitle: "Protect Every Product with Confidence",
      icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
      desc: "Give every product a unique digital identity that enables consumers to instantly verify authenticity while helping your brand detect duplicate and suspicious scans.",
      whatYouCanDo: [
        "Verify genuine products",
        "Prevent counterfeits",
        "Detect duplicate scans",
        "Build consumer trust",
        "Monitor authentication activity"
      ]
    },
    {
      title: "Consumer Registration",
      subtitle: "Know Who Buys Your Products",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      desc: "Transform anonymous purchases into verified consumer relationships through secure product registration.",
      whatYouCanDo: [
        "Register product owners",
        "Build first-party consumer database",
        "Capture purchase information",
        "Understand customer demographics",
        "Create direct brand relationships"
      ]
    },
    {
      title: "Digital Product Passport",
      subtitle: "Deliver Complete Product Transparency",
      icon: <QrCode className="w-8 h-8 text-blue-600" />,
      desc: "Provide consumers instant access to everything about a product—from ingredients and certifications to user manuals and sustainability information.",
      whatYouCanDo: [
        "Product information",
        "Ingredients & composition",
        "Certifications",
        "Lab reports",
        "User manuals",
        "Product specifications"
      ]
    },
    {
      title: "Digital Warranty Management",
      subtitle: "Make Warranty Registration Effortless",
      icon: <ShieldAlert className="w-8 h-8 text-blue-600" />,
      desc: "Replace paper warranty cards with a seamless digital experience that improves customer satisfaction and simplifies warranty management.",
      whatYouCanDo: [
        "Instant warranty activation",
        "Extended warranty programs",
        "Warranty status",
        "Service history",
        "Digital proof of ownership"
      ]
    },
    {
      title: "Rewards & Loyalty",
      subtitle: "Turn Every Purchase Into Long-Term Loyalty",
      icon: <Gem className="w-8 h-8 text-blue-600" />,
      desc: "Reward verified customers with personalized loyalty experiences that encourage repeat engagement and brand advocacy.",
      whatYouCanDo: [
        "Reward points",
        "Cashback campaigns",
        "Referral programs",
        "Exclusive offers",
        "Consumer engagement"
      ]
    },
    {
      title: "Smart Reorder",
      subtitle: "Bring Customers Back at the Right Time",
      icon: <ShoppingBag className="w-8 h-8 text-blue-600" />,
      desc: "Help consumers repurchase products effortlessly through intelligent reminders and preferred buying links.",
      whatYouCanDo: [
        "Automated reorder reminders",
        "Purchase links",
        "Personalized recommendations",
        "Repeat purchase campaigns",
        "Consumer retention"
      ]
    },
    {
      title: "Marketplace Intelligence",
      subtitle: "Guide Consumers to the Right Purchase Channels",
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      desc: "Direct consumers to your preferred marketplaces while understanding where your products are available online.",
      whatYouCanDo: [
        "Marketplace buying links",
        "Preferred seller recommendations",
        "Marketplace visibility",
        "Better buying experience"
      ],
      exclusive: true
    },
    {
      title: "Price Alerts",
      subtitle: "Engage Consumers When They're Ready to Buy",
      icon: <Megaphone className="w-8 h-8 text-blue-600" />,
      desc: "Notify interested consumers about price drops, exclusive offers, and promotional campaigns to maximize conversions.",
      whatYouCanDo: [
        "Price drop notifications",
        "Promotional campaigns",
        "Personalized offers",
        "Better conversion opportunities"
      ],
      exclusive: true
    },
    {
      title: "Consumer Intelligence",
      subtitle: "Understand Every Consumer Interaction",
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      desc: "Every scan becomes valuable business intelligence that helps you understand your consumers better.",
      whatYouCanDo: [
        "Consumer demographics",
        "Geographic insights",
        "Product engagement",
        "Scan analytics",
        "Behaviour trends",
        "Consumer segmentation"
      ]
    },
    {
      title: "Analytics Dashboard",
      subtitle: "Make Better Business Decisions",
      icon: <Laptop className="w-8 h-8 text-blue-600" />,
      desc: "Track performance across your products, consumers, and engagement through one centralized dashboard.",
      whatYouCanDo: [
        "Authentication reports",
        "Consumer analytics",
        "Product performance",
        "Engagement trends",
        "Business insights",
        "Executive dashboards"
      ]
    }
  ];

  const outcomes = [
    "Protect your brand from counterfeits",
    "Build direct consumer relationships",
    "Collect first-party consumer intelligence",
    "Increase repeat purchases",
    "Improve customer engagement",
    "Simplify warranty management",
    "Deliver digital product experiences",
    "Make smarter business decisions"
  ];

  const industries = [
    "Nutraceuticals & Supplements",
    "Cosmetics & Personal Care",
    "Consumer Electronics",
    "Pharmaceuticals",
    "Food & Beverage",
    "Home & Lifestyle",
    "Fashion & Accessories",
    "Appliances",
    "Luxury Goods"
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <WebHeader />

      {/* Hero Banner */}
      <section className="relative w-full cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[600px] overflow-hidden bg-slate-100">
          <img
            src={solutionsHeroImage}
            alt="Authentiks Solutions Overview"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </section>

      {/* Hero Section with Text */}
      <section className="pt-20 pb-16 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm mb-6">
            INTRODUCTION
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            One Platform. <br className="hidden md:block" />
            <span className="text-blue-600">Endless Possibilities.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Every product is an opportunity to build trust, collect valuable consumer insights, increase repeat purchases, and strengthen your brand.
          </p>
          <p className="text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Authentiks brings together every post-purchase capability into one intelligent platform, helping brands create exceptional consumer experiences while unlocking measurable business value.
          </p>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Complete Post-Purchase Platform</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Everything you need to transform your physical products into intelligent business assets.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                {cap.exclusive && (
                  <div className="absolute top-6 right-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-sm z-10">
                    Exclusive Authentiks Capability
                  </div>
                )}
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-6 border border-slate-100 group-hover:scale-110 transition-transform z-10 relative">
                  {cap.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">{cap.title}</h3>
                <h4 className="text-blue-600 font-semibold mb-4 relative z-10">{cap.subtitle}</h4>
                <p className="text-slate-600 mb-8 leading-relaxed h-auto md:h-[80px] relative z-10">
                  {cap.desc}
                </p>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 relative z-10">
                  <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-500" /> What You Can Do
                  </h5>
                  <ul className="space-y-3">
                    {cap.whatYouCanDo.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></div>
                        <span className="text-sm font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Brands Choose Authentiks */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/50 text-blue-300 font-semibold text-sm mb-6 border border-blue-800">
            WHY BRANDS CHOOSE AUTHENTIKS
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-16">One Platform. Multiple Business Outcomes.</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {outcomes.map((outcome, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex items-start gap-4 text-left hover:bg-slate-800 transition-colors shadow-lg">
                <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={24} />
                <span className="font-semibold text-slate-200">{outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white text-slate-600 font-semibold text-sm mb-6 border border-slate-200">
            INDUSTRIES
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Built for Every Consumer Brand</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-16">
            Whether you manufacture or sell products, Authentiks adapts to your business.
          </p>

          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {industries.map((industry, idx) => (
              <div key={idx} className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-700 font-semibold shadow-sm hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-default">
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 md:px-12 bg-white">
         <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-700 to-blue-900 rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/3"></div>
            
            <div className="relative z-10 text-white flex flex-col items-center">
               <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight max-w-3xl">Transform Every Product Into a Connected Business Asset.</h2>
               <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl">Protect your products. Know your consumers. Build lasting relationships.</p>
               
               <button onClick={() => setIsDialogOpen(true)} className="bg-white text-blue-800 px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg hover:scale-105 transform duration-200">
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
