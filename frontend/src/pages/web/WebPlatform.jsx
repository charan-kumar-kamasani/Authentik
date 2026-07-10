import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Layers, Network, ShieldCheck, LineChart, ChevronRight, Shield, User, FileText, Gift, ShoppingCart, BarChart3, AlertTriangle, AlertCircle, Puzzle, Lock } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import DemoModal from "../../components/DemoModal";
import platformHeroImage from "../../assets/banners/new_banners/platform.png";

export default function WebPlatform() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const capabilities = [
    {
      num: "1",
      title: "Product Authentication",
      desc: "Assign every product a unique digital identity that consumers can instantly verify.",
      listTitle: "Benefits",
      list: ["Eliminate counterfeit risks", "Build consumer trust", "Verify product authenticity", "Protect brand reputation"],
      icon: <Shield className="w-6 h-6" />
    },
    {
      num: "2",
      title: "Consumer Registration",
      desc: "Transform anonymous product purchases into verified customer relationships.",
      listTitle: "Benefits",
      list: ["First-party consumer data", "Verified customer profiles", "Ownership registration", "Better customer engagement"],
      icon: <User className="w-6 h-6" />
    },
    {
      num: "3",
      title: "Digital Product Passport",
      desc: "Give every product a secure digital identity with complete product information.",
      listTitle: "Includes",
      list: ["Ingredients", "Lab Reports", "Certificates", "User Manuals", "Manufacturing Details", "Warranty Information"],
      icon: <FileText className="w-6 h-6" />
    },
    {
      num: "4",
      title: "Warranty & Ownership",
      desc: "Digitally activate warranties and simplify ownership management.",
      icon: <ShieldCheck className="w-6 h-6" />
    },
    {
      num: "5",
      title: "Consumer Engagement",
      desc: "Create personalized experiences with",
      list: ["Rewards", "Coupons", "Loyalty", "Campaigns", "Notifications"],
      icon: <Gift className="w-6 h-6" />
    },
    {
      num: "6",
      title: "Smart Reorder",
      desc: "Enable consumers to reorder through trusted online marketplaces with a single click.",
      icon: <ShoppingCart className="w-6 h-6" />
    },
    {
      num: "7",
      title: "Consumer Intelligence Dashboard",
      desc: "Make better business decisions using",
      list: ["Consumer Demographics", "Location Analytics", "Product Performance", "Engagement Analytics", "Repeat Customers", "Market Trends"],
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      num: "8",
      title: "Counterfeit Intelligence",
      desc: "Detect suspicious activity and duplicate scans in real time.",
      icon: <AlertCircle className="w-6 h-6" />
    },
    {
      num: "9",
      title: "Integrations",
      desc: "Connect seamlessly with",
      list: ["ERP", "CRM", "Marketing Platforms", "APIs", "Warehouse Systems"],
      icon: <Puzzle className="w-6 h-6" />
    },
    {
      num: "10",
      title: "Enterprise Security",
      desc: "Built with enterprise-grade security and powered by Cloudflare infrastructure.",
      icon: <Lock className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <WebHeader />

      {/* Hero Banner */}
      <section className="relative w-full cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[600px] overflow-hidden bg-slate-100">
          <img
            src={platformHeroImage}
            alt="Authentiks Platform Overview"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </section>

      {/* Capabilities List */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
             <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
               Platform Overview
             </h2>
             <p className="text-slate-600 max-w-2xl mx-auto">
               Authentiks combines authentication, digital identity, consumer engagement, and business intelligence into one unified platform.
             </p>
          </div>

          <div className="space-y-6">
             {capabilities.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                   <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      {item.icon}
                   </div>
                   <div className="flex-1 text-left">
                      <h4 className="text-lg font-bold text-slate-900 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed mb-3">
                        {item.desc}
                      </p>
                      {item.list && (
                        <div className="mt-3">
                          {item.listTitle && <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider mb-2 block">{item.listTitle}</span>}
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-sm text-slate-600">
                            {item.list.map((li, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-blue-500"></span> {li}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                   </div>
                   
                   {/* Tiny UI Skeleton Graphic matching design */}
                   <div className="hidden md:flex flex-col w-36 h-[68px] bg-[#f8fafc] rounded-lg border border-slate-100 p-3 justify-between shrink-0 ml-4 lg:ml-12 group-hover:bg-slate-50 transition-colors self-center">
                     <div>
                       <div className="h-1.5 bg-slate-200 rounded-full w-full mb-1.5"></div>
                       <div className="h-1.5 bg-slate-200 rounded-full w-[65%]"></div>
                     </div>
                     <div className="flex justify-between items-end mt-2">
                       <div className="h-4 w-4 bg-blue-100 rounded-sm"></div>
                       <div className="h-2.5 w-10 bg-slate-200 rounded-sm"></div>
                     </div>
                   </div>

                   <div className="shrink-0 text-slate-300 group-hover:text-blue-600 transition-colors ml-2 hidden md:block self-center">
                      <ChevronRight size={20} />
                   </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 bg-white">
         <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-700 to-blue-900 rounded-3xl p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="w-20 h-20 bg-blue-600/30 border border-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm mb-6 z-10">
               <ShieldCheck size={40} className="text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 z-10 max-w-2xl leading-tight">
              All the tools you need to build trust, know your consumers and grow your brand—on one platform.
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 z-10 mt-4">
              <Link to="/contact-us">
                <button className="w-full sm:w-auto bg-white text-blue-800 px-8 py-3.5 rounded-lg font-bold hover:bg-slate-100 transition-colors shadow-lg flex items-center justify-center gap-2">
                  Book a Demo <ChevronRight size={18} />
                </button>
              </Link>
              <Link to="/solutions">
                <button className="w-full sm:w-auto bg-transparent border border-white text-white px-8 py-3.5 rounded-lg font-bold hover:bg-white/10 transition-colors flex items-center justify-center">
                  Explore Solutions
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
