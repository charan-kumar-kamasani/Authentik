import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, CheckCircle2, ChevronRight, Shield, ShieldCheck, Mail, Phone, MessageCircle, QrCode, Factory, Smartphone, Package, Gift, BarChart3, Users, Globe, Settings, Store, Pill, Sparkles, ShoppingBag, HeartPulse, Monitor, ShoppingBasket, Gem, ShieldPlus, Cloud, Lock, Network, Database, Activity, Target, X } from "lucide-react";
import WebHeader from "../../components/WebHeader";
import WebFooter from "../../components/WebFooter";
import DemoModal from "../../components/DemoModal";
import heroImage from "../../assets/web/hero_image.png";
import logoShield from "../../assets/logo-shield.png";
import h_b0 from "../../assets/banners/new_banners/h_b0.png";
import h_b1 from "../../assets/banners/new_banners/h_b1.png";
import h_b2 from "../../assets/banners/new_banners/h_b2.png";
import h_b3 from "../../assets/banners/new_banners/h_b3.png";

const AnimatedCounter = ({ end, suffix = "", prefix = "", duration = 2500, useKMSuffix = false }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, hasAnimated]);

  const displayCount = useKMSuffix ? (
    count >= 1000000 
      ? (count / 1000000).toFixed(count % 1000000 >= 100000 ? 1 : 0).replace(/\.0$/, '') + "M" 
      : count >= 1000 
        ? Math.floor(count / 1000) + "K" 
        : count
  ) : count;

  return <span ref={ref}>{prefix}{displayCount}{suffix}</span>;
};

export default function LandingPage() {
  const banners = [h_b0, h_b1, h_b2, h_b3];
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <WebHeader />

      {/* Hero Banner Carousel */}
      <section className="relative w-full cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[600px] overflow-hidden bg-slate-100">
          {banners.map((banner, index) => (
              <img
                key={index}
                src={banner}
                alt={`Banner ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${
                  index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              />
            ))}
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {banners.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
                    index === currentBanner ? "w-8 bg-blue-600" : "w-2 bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-blue-600 mb-3"><AnimatedCounter end={50} suffix="+" /></div>
              <div className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-500">Brands</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-blue-600 mb-3"><AnimatedCounter end={2000000} useKMSuffix suffix="+" /></div>
              <div className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-500">Total Product Secured</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-blue-600 mb-3"><AnimatedCounter end={1000000} useKMSuffix suffix="+"  /></div>
              <div className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-500">Product Scanned</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-black text-blue-600 mb-3"><AnimatedCounter end={60} suffix="%" prefix="~" /></div>
              <div className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-500">Scan Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4">BEYOND THE SALE. BEYOND THE MARKETPLACE.</h3>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Every Sale Is an Opportunity.<br/>Don't Lose the Relationship.</h2>
            <p className="text-slate-400 text-lg">
              Marketplaces and quick commerce platforms drive sales.<br />
              But they own the customer relationship, not you.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-24 text-center">
            <div className="mb-12">
              <h4 className="text-lg md:text-xl font-bold text-slate-200 mb-8 uppercase tracking-wide">Selling Across Leading Marketplaces</h4>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { name: "Amazon", domain: "amazon.in" },
                  { name: "Flipkart", domain: "flipkart.com" },
                  { name: "Myntra", domain: "myntra.com" },
                  { name: "Nykaa", domain: "nykaa.com" },
                  { name: "Tata CLiQ", domain: "tatacliq.com" },
                  { name: "Meesho", domain: "meesho.com" }
                ].map(mp => (
                  <span key={mp.name} className="flex items-center gap-2.5 px-5 py-2.5 md:px-6 md:py-3 bg-slate-800/80 rounded-xl text-sm md:text-base font-semibold border border-slate-700/50 shadow-sm transition-all hover:bg-slate-800">
                    <img src={`https://www.google.com/s2/favicons?domain=${mp.domain}&sz=64`} alt={mp.name} className="w-5 h-5 md:w-6 md:h-6 rounded object-contain bg-white" />
                    {mp.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-bold text-slate-200 mb-8 uppercase tracking-wide">And Quick Commerce Platforms</h4>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { name: "Zepto", domain: "zeptonow.com" },
                  { name: "Blinkit", domain: "blinkit.com" },
                  { name: "Swiggy Instamart", domain: "swiggy.com" },
                  { name: "BigBasket", domain: "bigbasket.com" },
                  { name: "Jio Mart", domain: "jiomart.com" }
                ].map(mp => (
                  <span key={mp.name} className="flex items-center gap-2.5 px-5 py-2.5 md:px-6 md:py-3 bg-slate-800/80 rounded-xl text-sm md:text-base font-semibold border border-slate-700/50 shadow-sm transition-all hover:bg-slate-800">
                    <img src={`https://www.google.com/s2/favicons?domain=${mp.domain}&sz=64`} alt={mp.name} className="w-5 h-5 md:w-6 md:h-6 rounded object-contain bg-white" />
                    {mp.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-24">
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full"></div>
              <h4 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">Without Authentiks</h4>
              <ul className="space-y-4">
                {[
                  "Marketplace owns the customer relationship",
                  "Anonymous purchases",
                  "Limited post-purchase engagement",
                  "One-time transactions",
                  "Limited customer insights"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <X className="text-red-400 mt-1 shrink-0" size={20} />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
              <h4 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3">With Authentiks</h4>
              <ul className="space-y-4">
                {[
                  "Brand builds direct consumer relationships",
                  "Verified consumer registration",
                  "Digital Product Passport & engagement",
                  "Long-term customer loyalty",
                  "First-party consumer intelligence"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="text-emerald-400 mt-1 shrink-0" size={20} />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold text-white mb-12 uppercase tracking-wide">The Numbers Don't Lie</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                <div className="text-5xl font-black text-blue-500 mb-4">60%+</div>
                <p className="text-slate-300 text-lg">of global ecommerce sales are driven by online marketplaces.</p>
              </div>
              <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                <div className="text-5xl font-black text-blue-500 mb-4">5–7×</div>
                <p className="text-slate-300 text-lg">more expensive to acquire a new customer than to retain an existing one.</p>
              </div>
              <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                <div className="text-5xl font-black text-blue-500 mb-4">80%</div>
                <p className="text-slate-300 text-lg">of consumers are more likely to purchase from brands that deliver personalized experiences.</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 mt-12 text-center text-slate-500 text-sm">
            <p className="font-semibold mb-3 text-slate-400">Sources:</p>
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8">
              <span>Digital Commerce 360 / Statista — Global Marketplace Trends 2024</span>
              <span className="hidden md:inline text-slate-700">•</span>
              <span>Harvard Business Review & Bain & Company — The Value of Customer Retention</span>
              <span className="hidden md:inline text-slate-700">•</span>
              <span>Epsilon — 2023 Personalization Report</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-3">One Platform. Complete Consumer Intelligence.</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 max-w-2xl mx-auto leading-tight">
              Everything You Need to Build Stronger Relationships with Your Consumers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: "Product Authentication",
                desc: "Protect your brand with secure, unique digital identities for every product.",
                icon: "shield"
              },
              {
                title: "Consumer Registration",
                desc: "Convert anonymous buyers into verified first-party consumers.",
                icon: "user"
              },
              {
                title: "Digital Product Passport",
                desc: "Provide instant access to product information, certifications, manuals, lab reports, and more.",
                icon: "file"
              },
              {
                title: "Consumer Engagement",
                desc: "Deliver rewards, offers, campaigns, and personalized experiences.",
                icon: "gift"
              },
              {
                title: "Smart Reorder",
                desc: "Drive repeat purchases through preferred online marketplaces.",
                icon: "shopping-cart"
              },
              {
                title: "Consumer Intelligence",
                desc: "Understand consumer behavior with real-time insights and analytics.",
                icon: "bar-chart"
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col items-center text-center group cursor-pointer">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield size={28} strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-[18px] text-slate-900 mb-3">{item.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/platform">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                Explore Platform
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-3">How It Works</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 leading-tight">
              Simple for Consumers.<br/>Powerful for Brands.
            </h2>
            
            <div className="space-y-6">
              {[
                "Generate Secure QR Identity",
                "Apply During Manufacturing",
                "Consumer Scans Product",
                "Instant Authentication",
                "Consumer Registration",
                "Real-Time Intelligence",
                "Engagement & Repeat Purchases"
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 font-medium text-lg">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex justify-center items-center py-10">
             {/* Coded Circular Diagram */}
             <div className="relative w-full max-w-[400px] aspect-square mx-auto">
               {/* Center Shield (Using Logo Shield) */}
               <div className="absolute inset-0 m-auto w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/20 z-10 bg-white">
                 <div className="absolute inset-2 bg-blue-50 rounded-full blur-md"></div>
                 <img src={logoShield} alt="Authentiks Shield" className="w-[80%] h-[80%] object-contain relative z-10" />
               </div>
               
               {/* Dashed Circle */}
               <div className="absolute inset-8 rounded-full border-[1.5px] border-dashed border-blue-200 animate-[spin_60s_linear_infinite]"></div>

               {/* Orbiting Icons */}
               {[
                 { Icon: QrCode },
                 { Icon: Factory },
                 { Icon: Smartphone },
                 { Icon: Store },
                 { Icon: Gift },
               ].map((item, i) => {
                 // Arrange exactly like design: Top, Right, Bottom-Right, Bottom-Left, Left
                 // 0 = Top, 1 = Right, 2 = Bottom-Right, 3 = Bottom-Left, 4 = Left
                 const rad = (i * 72 - 90) * (Math.PI / 180);
                 const radius = 45; // 45% distance from center
                 const top = `calc(50% + ${Math.sin(rad) * radius}%)`;
                 const left = `calc(50% + ${Math.cos(rad) * radius}%)`;
                 
                 return (
                   <div key={i} className="absolute w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] border border-blue-50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-20" style={{ top, left }}>
                     <item.Icon size={20} className="text-blue-600" strokeWidth={2} />
                   </div>
                 );
               })}
             </div>
          </div>
        </div>
      </section>

      {/* Actionable Intelligence Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-3">Actionable Consumer Intelligence</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 leading-tight">
              Real-time Insights.<br/>Smarter Decisions.
            </h2>
            
            <div className="space-y-5">
              {[
                "Consumer Profiles",
                "Geographic Insights",
                "Product Performance",
                "Repeat Purchases",
                "Campaign Analytics",
                "Counterfeit Alerts",
                "Market Intelligence",
                "Scan Analytics"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </div>
                  <span className="text-slate-700 text-lg font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center lg:justify-end w-full">
            {/* Coded Dashboard Mockup */}
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100/50 overflow-hidden flex flex-col md:flex-row h-[350px] lg:h-[400px] transform lg:translate-x-8">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-[180px] bg-[#f8fafc] border-r border-slate-100 p-5 shrink-0">
                <div className="flex items-center gap-2 mb-8 text-blue-600 font-bold text-[15px]">
                  <img src={logoShield} className="w-6 h-6 object-contain" alt="Logo" /> Authentiks
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 text-xs font-bold text-blue-700 bg-blue-100/80 px-3 py-2.5 rounded-lg"><BarChart3 size={16} strokeWidth={2.5}/> Dashboard</div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 px-3 py-2.5 hover:bg-slate-100 rounded-lg"><Package size={16}/> Products</div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 px-3 py-2.5 hover:bg-slate-100 rounded-lg"><Users size={16}/> Consumers</div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 px-3 py-2.5 hover:bg-slate-100 rounded-lg"><QrCode size={16}/> Scans</div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 px-3 py-2.5 hover:bg-slate-100 rounded-lg"><Settings size={16}/> Settings</div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-white overflow-hidden">
                <h4 className="font-bold text-slate-800 text-[15px]">Dashboard Overview</h4>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:gap-5">
                  {[
                    { title: "Total Scans", value: "1,25,430", trend: "+18.6%" },
                    { title: "Registered Consumers", value: "87,420", trend: "+22.4%" },
                    { title: "Repeat Consumers", value: "32,410", trend: "+16.2%" },
                    { title: "Countries", value: "12", trend: "+2" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100/60 rounded-xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 line-clamp-1">{stat.title}</div>
                      <div className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{stat.value}</div>
                      <div className="text-[10px] md:text-xs text-emerald-500 font-bold mt-1.5">{stat.trend}</div>
                    </div>
                  ))}
                </div>
                
                {/* Charts Area */}
                <div className="flex-1 grid grid-cols-2 gap-5 mt-2">
                  <div className="border border-slate-100/60 rounded-xl p-4 flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                     <div className="text-[10px] font-bold text-slate-400 mb-3">Scan Trend</div>
                     <div className="flex-1 relative w-full h-full overflow-hidden">
                        <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                          <path d="M0,50 L0,35 Q15,20 30,30 T60,20 T80,25 T100,10 L100,50 Z" fill="#eff6ff" />
                          <path d="M0,35 Q15,20 30,30 T60,20 T80,25 T100,10" fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </svg>
                     </div>
                  </div>
                  <div className="border border-slate-100/60 rounded-xl flex items-center justify-center bg-[#f8fafc] overflow-hidden relative shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                     <Globe size={160} className="text-blue-100 absolute -right-8 -bottom-8 opacity-70" strokeWidth={1} />
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-[10px] font-bold text-blue-600 tracking-wider">Global Reach</div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security Section */}
      <section className="bg-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 text-white">
          <div className="shrink-0 w-32 h-32 lg:w-48 lg:h-48 flex items-center justify-center relative">
             {/* Glow behind the shield */}
             <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full"></div>
             <img src={logoShield} alt="Authentiks Security" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Enterprise-Grade Security with Cloudflare</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl">
              We protect your data and your consumers with industry-leading security standards.
            </p>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-10 text-center">
              {[
                { title: "Global Edge Protection", icon: Cloud },
                { title: "SSL/TLS Encryption", icon: Lock },
                { title: "Secure APIs", icon: Network },
                { title: "Encrypted Data Storage", icon: Database },
                { title: "Continuous Monitoring", icon: Activity },
                { title: "High Platform Availability", icon: Target }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center">
                  <feature.icon className="text-white mb-4 opacity-90" size={28} strokeWidth={1.5} />
                  <h4 className="font-semibold text-[13px] leading-snug">{feature.title}</h4>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center lg:text-left">
              <Link to="/security-policy">
                <button className="bg-white/20 text-white border border-white/30 px-6 py-2.5 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2 mx-auto lg:mx-0">
                   View Security Policy <ChevronRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h3 className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-16">Trusted Across Industries</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-10">
            {[
              { name: "Pharmaceuticals", Icon: Pill },
              { name: "Nutraceuticals", Icon: ShieldPlus },
              { name: "FMCG", Icon: ShoppingBag },
              { name: "Cosmetics", Icon: Sparkles },
              { name: "Healthcare", Icon: HeartPulse },
              { name: "Electronics", Icon: Monitor },
              { name: "Luxury", Icon: Gem },
              { name: "Food & Beverage", Icon: ShoppingBasket }
            ].map((industry, i) => (
              <div key={i} className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-[72px] h-[72px] rounded-full border border-blue-100 bg-white shadow-[0_4px_20px_-4px_rgba(59,130,246,0.1)] flex items-center justify-center mb-5 group-hover:-translate-y-1 transition-transform duration-300">
                  <industry.Icon className="text-blue-500" size={28} strokeWidth={1.5} />
                </div>
                <span className="font-bold text-[13px] text-slate-600">{industry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#0b1b36] py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight max-w-xl">
              Build Stronger Consumer Relationships
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Transform every product into a trusted digital touchpoint.
            </p>
              <button onClick={() => setIsDialogOpen(true)} className="bg-white text-[#0b1b36] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                Book a Demo <ChevronRight size={18} />
              </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center"><Mail size={20}/></div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Email</div>
                <div className="font-semibold whitespace-nowrap">hello@authentiks.in</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center"><Phone size={20}/></div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Phone</div>
                <div className="font-semibold whitespace-nowrap">+91 93425 01819</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center"><MessageCircle size={20}/></div>
              <div>
                <div className="text-xs text-gray-400 font-medium">WhatsApp</div>
                <div className="font-semibold whitespace-nowrap">Chat with us</div>
              </div>
            </div>
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
