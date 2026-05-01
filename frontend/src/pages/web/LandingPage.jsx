import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, ScanLine, CheckCircle2, AlertTriangle, BarChart3,
  QrCode, Truck, Package, Smartphone, Users, Globe2, Repeat,
  Lock, Brain, Sparkles, ArrowRight, ChevronLeft, ChevronRight,
  Quote, Star, Mail, MapPin, Phone, ExternalLink
} from 'lucide-react';
import WebHeader from '../../components/WebHeader';
import WebFooter from '../../components/WebFooter';
import ContactFormModal from '../../components/ContactFormModal';
import heroImage from '../../assets/web/image 1.png';
import banner1 from '../../assets/banners/banner_1.jpg';
import banner2 from '../../assets/banners/banner_2.jpg';
import banner3 from '../../assets/banners/banner_3.jpg';
import WebHeroSlider from '../../components/WebHeroSlider';

/* ═══════════════════════ HERO SLIDES ═══════════════════════ */
const heroSlides = [
  {
    tag: 'BANNER 1',
    tagColor: 'from-emerald-500 to-emerald-400',
    tagBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    glowColor: 'bg-emerald-500',
    title: <>Start Protecting Your Products <span className="gradient-text-green">From Day One</span></>,
    subtitle: 'Give every product a unique, secure identity with ready-to-use QR labels — no tech, no complexity.',
    cta: 'Start Your 90-Day Free Trial',
    banner: banner1,
  },
  {
    tag: 'BANNER 2',
    tagColor: 'from-blue-500 to-cyan-400',
    tagBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    glowColor: 'bg-blue-500',
    title: <>Turn Every Product Into a <span className="gradient-text-blue">Customer Acquisition</span> Channel</>,
    subtitle: 'Engage customers, offer rewards, and bring them back to your website — directly from your product.',
    highlight: 'Your product is now your marketing channel',
    cta: 'Start Your 90-Day Free Trial',
    banner: banner2,
  },
  {
    tag: 'BANNER 3',
    tagColor: 'from-red-500 to-orange-400',
    tagBg: 'bg-red-500/10 border-red-500/20 text-red-400',
    glowColor: 'bg-red-500',
    title: <>Track Every Product. Detect Every Fake. <span className="gradient-text-red">Act in Real Time.</span></>,
    subtitle: 'Gain full visibility across your supply chain with real-time scan data, alerts, and analytics.',
    highlight: 'Know where your products go — and where they leak',
    cta: 'Start Your 90-Day Free Trial',
    banner: banner3,
  },
];

/* ═══════════════════════ REUSABLE COMPONENTS ═══════════════════════ */

const Glow = ({ color, className }) => (
  <div className={`glow-bg h-72 w-72 ${color} ${className}`} />
);

const SectionTag = ({ children, className = '' }) => (
  <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-[0.25em] mb-6 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-6 ${className}`}>
    {children}
  </h2>
);

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function LandingPage() {
  const [showContactForm, setShowContactForm] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'half-yearly' or 'yearly'

  const slide = heroSlides[activeSlide];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <WebHeader />

      {/* ═══════════════ HERO SECTION (Dynamic Slider) ═══════════════ */}
      <section className="relative pt-12 md:pt-16 px-4 md:px-6 min-h-[40vh] md:min-h-[85vh] flex items-center overflow-hidden">
        {/* Animated glows */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${slide.glowColor} rounded-full blur-[180px] opacity-15 transition-all duration-1000`} />
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-purple-600 rounded-full blur-[140px] opacity-10 animate-pulse-slow" />
        <div className="absolute bottom-20 left-[10%] w-48 h-48 bg-indigo-600 rounded-full blur-[120px] opacity-10 animate-pulse-slow" />

        {/* Hero background image */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10 pointer-events-none">
          <img src={heroImage} alt="" className="w-full h-full object-cover blur-2xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <WebHeroSlider
          slides={heroSlides}
          onCTA={() => setShowContactForm(true)}
          onSlideChange={(index) => setActiveSlide(index)}
        />
      </section>

      {/* ═══════════════ TRUST SECTION ═══════════════ */}
      <section className="py-12 md:py-12 px-6 relative">
        <Glow color="bg-indigo-600" className="top-0 left-1/2 -translate-x-1/2 opacity-10" />
        <div className="container mx-auto max-w-5xl text-center">
          <SectionTag><ShieldCheck size={14} /> Trusted Platform</SectionTag>
          <SectionTitle>Trusted by Growing Brands</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 mb-12">
            {[
              { value: '100+', label: 'Brands Onboarded', icon: Users, color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', iconColor: 'text-emerald-400' },
              { value: '50,000+', label: 'QR Codes Generated', icon: QrCode, color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20', iconColor: 'text-blue-400' },
              { value: 'Real-Time', label: 'Product Tracking Across India', icon: Globe2, color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/20', iconColor: 'text-purple-400' },
            ].map((stat, i) => (
              <div
                key={i}
                className={`group p-8 rounded-[2rem] bg-gradient-to-b ${stat.color} border ${stat.border} hover:scale-[1.03] transition-all duration-500 cursor-default`}
              >
                <div className={`mb-4 inline-flex p-3 rounded-2xl bg-white/5 ${stat.iconColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={28} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">{stat.value}</h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-400 font-bold flex items-center justify-center gap-2 text-base">
            <ArrowRight size={16} className="text-indigo-400" />
            Start small. Scale with confidence.
          </p>
        </div>
      </section>

      {/* ═══════════════ SECURITY & AUTHENTICITY ═══════════════ */}
      <section className="py-12 md:py-12 px-6 bg-gradient-to-b from-black/40 to-transparent relative overflow-hidden">
        <Glow color="bg-purple-600" className="-right-32 top-1/3 opacity-15" />
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionTag><Lock size={14} /> Security & Authenticity</SectionTag>
            <SectionTitle>Built for Secure Product Authentication</SectionTitle>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: QrCode, title: 'Unique QR for Every Unit', desc: 'Unique QR code for every unit produced — no two are alike', color: 'text-emerald-400', glow: 'group-hover:shadow-emerald-500/20' },
              { icon: ScanLine, title: 'First-Scan Validation', desc: 'First-scan validation ensures authenticity at the point of purchase', color: 'text-blue-400', glow: 'group-hover:shadow-blue-500/20' },
              { icon: AlertTriangle, title: 'Duplicate Detection', desc: 'Duplicate scans instantly detected and flagged in real-time', color: 'text-amber-400', glow: 'group-hover:shadow-amber-500/20' },
              { icon: Brain, title: 'Intelligent Backend', desc: 'Intelligent backend prevents misuse and unauthorized access', color: 'text-purple-400', glow: 'group-hover:shadow-purple-500/20' },
            ].map((item, i) => (
              <div
                key={i}
                className={`group glass-effect p-8 rounded-[2rem] text-center hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl ${item.glow} cursor-default`}
              >
                <div className={`mb-6 p-4 rounded-2xl bg-white/5 ${item.color} inline-flex group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon size={28} />
                </div>
                <h3 className="text-lg font-black text-white mb-3 tracking-tight">{item.title}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center mt-12 text-gray-400 font-bold flex items-center justify-center gap-2">
            <ArrowRight size={16} className="text-indigo-400" />
            Every product carries a secure identity that cannot be reused without detection.
          </p>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-12 md:py-12 px-6 relative overflow-hidden">
        <Glow color="bg-cyan-600" className="-left-40 top-1/2 opacity-10" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <SectionTag><Sparkles size={14} /> How It Works</SectionTag>
            <SectionTitle>From Factory to Customer — In 4 Simple Steps</SectionTitle>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[72px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-purple-500/30" />

            {[
              {
                step: '01',
                icon: QrCode,
                title: 'Order QR Codes',
                desc: 'Share your Product Details, SKU & quantity',
                color: 'text-emerald-400',
                stepBg: 'bg-emerald-500/20 border-emerald-500/30',
                ring: 'ring-emerald-500/20'
              },
              {
                step: '02',
                icon: Package,
                title: 'We Generate & Deliver',
                desc: 'Serialized, tamper-proof scratch off labels shipped to your doorstep',
                color: 'text-blue-400',
                stepBg: 'bg-blue-500/20 border-blue-500/30',
                ring: 'ring-blue-500/20'
              },
              {
                step: '03',
                icon: Truck,
                title: 'Apply to Products',
                desc: 'No integration required — peel, stick, done',
                color: 'text-amber-400',
                stepBg: 'bg-amber-500/20 border-amber-500/30',
                ring: 'ring-amber-500/20'
              },
              {
                step: '04',
                icon: Smartphone,
                title: 'Customers Scan & Engage',
                desc: 'Authenticate, interact and connect with your brand',
                color: 'text-purple-400',
                stepBg: 'bg-purple-500/20 border-purple-500/30',
                ring: 'ring-purple-500/20'
              },
            ].map((item, i) => (
              <div key={i} className="group flex flex-col items-center text-center relative">
                {/* Step number bubble */}
                <div className={`relative z-10 w-16 h-16 rounded-full ${item.stepBg} border flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 ring-4 ${item.ring}`}>
                  <item.icon size={24} className={item.color} />
                </div>
                {/* Step label */}
                <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${item.color} mb-3`}>Step {item.step}</div>
                <h3 className="text-lg font-black text-white mb-3 tracking-tight">{item.title}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ ROI / VALUE SECTION ═══════════════ */}
      <section className="py-12 md:py-12 px-6 bg-gradient-to-b from-black/40 to-transparent relative overflow-hidden">
        <Glow color="bg-emerald-600" className="-right-32 top-1/4 opacity-10" />
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — Text */}
            <div>
              <SectionTag><BarChart3 size={14} /> ROI Calculator</SectionTag>
              <SectionTitle>Turn Product Scans Into Revenue</SectionTitle>
              <p className="text-gray-400 font-medium text-lg leading-relaxed mb-8">
                If <span className="text-white font-black">1,000 products</span> are scanned:
              </p>

              <div className="space-y-5">
                {[
                  { icon: Users, value: '400+', label: 'customers engage with your brand', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { icon: Globe2, value: '100–200', label: 'users visit your website', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { icon: Repeat, value: '50–100', label: 'potential repeat customers', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { icon: AlertTriangle, value: 'Instant', label: 'alerts if duplicate/fake scans detected', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group cursor-default">
                    <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <span className="text-white font-black text-lg">{item.value}</span>
                      <span className="text-gray-400 font-medium ml-2">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Revenue card */}
            <div className="glass-effect rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500 rounded-full blur-[100px] opacity-20" />
              <div className="relative z-10">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-6">Monthly Investment</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">₹10K</span>
                  <span className="text-gray-500 font-bold">/month</span>
                </div>
                <p className="text-gray-400 font-medium mb-8">Can generate far more in repeat revenue</p>

                <div className="space-y-4 mb-10">
                  {['Direct customer acquisition', 'Website traffic from products', 'Repeat purchase potential', 'Anti-counterfeit protection'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span className="text-gray-300 font-medium text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm shadow-lg shadow-emerald-500/25"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING PLANS ═══════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <Glow color="bg-indigo-600" className="-left-40 top-1/2 opacity-10" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <SectionTag><Sparkles size={14} /> Pricing Plans</SectionTag>
            <SectionTitle>Scale Your Protection & Engagement</SectionTitle>
            
            {/* 🔁 TOGGLE */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-black uppercase tracking-widest transition-colors duration-300 ${billingCycle === 'half-yearly' ? 'text-white' : 'text-gray-500'}`}>Half-Yearly</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'yearly' ? 'half-yearly' : 'yearly')}
                className="w-16 h-8 bg-white/10 rounded-full relative p-1 transition-all border border-white/10"
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-lg ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'}`} />
              </button>
              <div className="flex flex-col items-start">
                <span className={`text-sm font-black uppercase tracking-widest transition-colors duration-300 ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>Yearly</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Save 20%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: 'starter',
                tier: 'STARTER',
                tag: 'Best for: Small brands starting authentication',
                price: billingCycle === 'yearly' ? '4,000' : '5,000',
                credits: '₹5,000 QR Credits Included',
                color: 'from-emerald-500 to-emerald-600',
                borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
                tagBg: 'bg-emerald-500/10 text-emerald-400',
                saveColor: 'text-emerald-400',
                saveIcon: '🟢',
                features: [
                  { category: 'Includes:', items: [
                    'Unique QR for every product',
                    'First-scan authentication',
                    'Basic scan tracking',
                    'Dashboard access'
                  ]},
                  { category: '🔒 Privacy-first analytics', items: [
                    'No personal user data',
                    'City-level scan insights'
                  ]}
                ]
              },
              {
                id: 'growth',
                tier: 'GROWTH',
                badge: '⭐ MOST POPULAR',
                tag: 'Best for: Brands building customer engagement',
                price: billingCycle === 'yearly' ? '8,000' : '10,000',
                credits: '₹10,000 QR Credits Included',
                color: 'from-blue-500 to-cyan-500',
                borderColor: 'border-blue-500/20 hover:border-blue-500/40',
                tagBg: 'bg-blue-500/10 text-blue-400',
                saveColor: 'text-blue-400',
                saveIcon: '🔵',
                highlighted: true,
                features: [
                  { category: 'Includes everything in Starter +', items: [
                    'Coupon & rewards engine',
                    'Customer data capture (consent-based)',
                    'Redirect to website',
                    'Counterfeit alerts',
                    'Advanced scan analytics'
                  ]},
                  { category: '✨ AI Pulse Insights', items: [
                    'Customer behavior analysis',
                    'Scan trends & patterns',
                    'Actionable growth suggestions'
                  ]},
                  { category: '📊 Smart data access (consent-driven)', items: [
                    'Name & Age Group',
                    'Gender & Contact Number',
                    'Exportable reports'
                  ]}
                ]
              },
              {
                id: 'enterprise',
                tier: 'ENTERPRISE',
                tag: 'Best for: Large brands & scale operations',
                price: billingCycle === 'yearly' ? '16,000' : '20,000',
                credits: '₹20,000 QR Credits Included',
                color: 'from-purple-500 to-indigo-600',
                borderColor: 'border-purple-500/20 hover:border-purple-500/40',
                tagBg: 'bg-purple-500/10 text-purple-400',
                saveColor: 'text-purple-400',
                saveIcon: '🟣',
                features: [
                  { category: 'Includes everything in Growth +', items: [
                    'Real-time counterfeit alerts',
                    'Advanced analytics & insights',
                    'Batch-level tracking',
                    'API integrations',
                    'Priority support'
                  ]},
                  { category: '🚀 Advanced AI Pulse', items: [
                    'Predictive demand insights',
                    'Fraud detection patterns',
                    'Region-wise performance tracking',
                    'Automated growth recommendations'
                  ]}
                ]
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`group glass-effect rounded-[2.5rem] p-8 md:p-10 border ${plan.borderColor} transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden flex flex-col ${plan.highlighted ? 'ring-1 ring-blue-500/40 bg-blue-500/5' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                    {plan.badge}
                  </div>
                )}
                
                <div className={`inline-flex px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest ${plan.tagBg} mb-6 w-fit`}>
                  {plan.tier}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">₹{plan.price}</span>
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">/ month</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-black mt-1 tracking-widest uppercase italic">({billingCycle === 'yearly' ? 'Yearly' : 'Half-Yearly'})</p>
                </div>

                <div className="mb-8 space-y-2">
                  <div className={`text-xs font-black uppercase tracking-widest ${plan.saveColor} flex items-center gap-2`}>
                    <span>{plan.saveIcon === '🟢' ? '💚' : plan.saveIcon === '🔵' ? '💙' : '💜'} Save 20% with yearly</span>
                  </div>
                  <div className="text-white font-black text-sm uppercase tracking-widest bg-white/5 py-3 px-4 rounded-xl border border-white/10 flex items-center gap-2">
                    <Sparkles size={16} className={plan.saveColor} />
                    + {plan.credits}
                  </div>
                </div>

                <p className="text-sm text-gray-400 font-bold mb-8 leading-relaxed italic">{plan.tag}</p>

                <div className="space-y-8 mb-10 flex-grow">
                  {plan.features.map((section, j) => (
                    <div key={j}>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 opacity-80">{section.category}</h4>
                      <ul className="space-y-3">
                        {section.items.map((item, k) => (
                          <li key={k} className="flex items-start gap-3">
                            <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${plan.saveColor}`} />
                            <span className="text-gray-300 font-bold text-sm leading-tight">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowContactForm(true)}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm bg-gradient-to-r ${plan.color} text-white hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-3`}
                >
                  Contact Sales
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* ⚡ TRUST LINE */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <ShieldCheck size={24} className="text-blue-400" />
              <p className="text-gray-300 font-black italic tracking-tight text-sm md:text-base">
                “Customer data is shared only with user consent to ensure privacy and compliance.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PRODUCT ADVANTAGE ═══════════════ */}
      <section className="py-12 md:py-12 px-6 bg-gradient-to-b from-black/40 to-transparent relative overflow-hidden">
        <Glow color="bg-indigo-600" className="-left-32 top-1/3 opacity-10" />
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <SectionTag><Package size={14} /> Product Advantage</SectionTag>
            <SectionTitle>More Than Software — A Complete Solution</SectionTitle>
          </div>

          <div className="glass-effect rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600 rounded-full blur-[120px] opacity-15 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {[
                { icon: QrCode, label: 'QR Generation', desc: 'Unique serialized codes for every product unit' },
                { icon: Package, label: 'Printing & Scratch Labels', desc: 'Premium tamper-proof labels, printed and ready' },
                { icon: Truck, label: 'Doorstep Delivery', desc: 'Labels shipped directly to your warehouse' },
                { icon: Users, label: 'Customer Engagement Tools', desc: 'Rewards, coupons, and direct interaction' },
                { icon: BarChart3, label: 'Real-Time Analytics', desc: 'Live scan data, geo-tracking, and insights' },
                { icon: ShieldCheck, label: 'One Platform', desc: 'No multiple vendors — everything in one place' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-all group cursor-default">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all shrink-0">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base mb-1 tracking-tight">{item.label}</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-gray-400 font-bold flex items-center justify-center gap-2">
                <ArrowRight size={16} className="text-indigo-400" />
                No multiple vendors. One platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-12 md:py-12 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <SectionTag><Quote size={14} /> Testimonials</SectionTag>
            <SectionTitle>What Our Clients Say</SectionTitle>
          </div>

          {/* Infinite scrolling marquee */}
          <div className="relative">
            {/* Gradient fade edges */}
            <div className="testimonial-marquee-track">
              {[...Array(2)].map((_, setIdx) => (
                <div key={setIdx} className="testimonial-marquee-set">
                  {[
                    {
                      name: 'Rahul Mehta',
                      title: 'Head of Operations',
                      company: 'Leading FMCG Brand',
                      initial: 'R',
                      color: 'from-emerald-500 to-teal-500',
                      quote: 'We were facing increasing issues with duplicate products in key markets. After implementing Authentiks, we started receiving real-time alerts on suspicious scans. Within the first month itself, we identified multiple counterfeit sources and were able to act quickly. It has significantly strengthened our brand protection.'
                    },
                    {
                      name: 'Ankit Sharma',
                      title: 'Supply Chain Manager',
                      company: 'Consumer Electronics Company',
                      initial: 'A',
                      color: 'from-blue-500 to-cyan-500',
                      quote: 'Authentiks gave us visibility we never had before. Today, we can clearly see where our products are being scanned and identify unusual patterns across regions. This has helped us reduce distributor-level leakage and improve our overall supply chain control.'
                    },
                    {
                      name: 'Priya Nair',
                      title: 'Founder',
                      company: 'D2C Skincare Brand',
                      initial: 'P',
                      color: 'from-purple-500 to-pink-500',
                      quote: 'We initially started using Authentiks for product authentication, but the real value came from customer engagement. Every scan is now an opportunity for us to connect with our customers and build loyalty. We\'ve already started seeing better engagement and repeat interactions.'
                    },
                    {
                      name: 'Karthik Reddy',
                      title: 'Brand Manager',
                      company: 'Apparel & Fashion Brand',
                      initial: 'K',
                      color: 'from-amber-500 to-orange-500',
                      quote: 'Counterfeit products were impacting our brand trust. With Authentiks, customers can instantly verify authenticity before purchase. This has improved customer confidence and helped us reinforce our premium positioning in the market.'
                    },
                    {
                      name: 'Dr. Amit Verma',
                      title: 'Director',
                      company: 'Pharmaceutical Distribution Company',
                      initial: 'A',
                      color: 'from-red-500 to-rose-500',
                      quote: 'In our industry, authenticity is critical. Authentiks has added an extra layer of security by enabling product verification at multiple levels. The ability to track and validate products gives us much better control and peace of mind.'
                    },
                    {
                      name: 'Neha Kapoor',
                      title: 'Co-Founder',
                      company: 'Emerging D2C Brand',
                      initial: 'N',
                      color: 'from-indigo-500 to-violet-500',
                      quote: 'As a growing brand, we needed something simple yet scalable. Authentiks was easy to implement and started delivering insights almost immediately. It feels like having an enterprise-level system without heavy investment.'
                    },
                  ].map((t, i) => (
                    <div key={i} className="testimonial-card glass-effect rounded-[2rem] p-8 border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col min-w-[380px] max-w-[400px] mx-3 shrink-0">
                      <div className="flex justify-center gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                        ))}
                      </div>

                      <Quote size={24} className="text-indigo-500/30 mb-3 shrink-0" />

                      <blockquote className="text-sm font-medium text-gray-300 leading-relaxed mb-6 italic flex-grow">
                        "{t.quote}"
                      </blockquote>

                      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                          {t.initial}
                        </div>
                        <div>
                          <div className="font-black text-white text-sm">{t.name}</div>
                          <div className="text-xs text-gray-500 font-bold">{t.title}, {t.company}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Marquee animation CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
          .testimonial-marquee-track {
            display: flex;
            width: max-content;
            animation: testimonialScroll 40s linear infinite;
          }
          .testimonial-marquee-track:hover {
            animation-play-state: paused;
          }
          .testimonial-marquee-set {
            display: flex;
            flex-shrink: 0;
          }
          @keyframes testimonialScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}} />
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-20 md:py-32 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-[3rem] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent" />
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600 rounded-full blur-[160px] opacity-25" />
            <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-purple-600 rounded-full blur-[120px] opacity-20" />

            <div className="glass-effect rounded-[3rem] p-12 md:p-20 text-center relative z-10">
              <SectionTag>
                <Sparkles size={14} /> Ready to Start?
              </SectionTag>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                Ready to Protect<br />Your Heritage?
              </h2>

              <p className="text-gray-400 font-medium mb-4 max-w-lg mx-auto leading-relaxed text-lg">
                Stop losing customers to marketplaces.
              </p>
              <p className="text-gray-300 font-bold mb-10 max-w-lg mx-auto text-lg">
                Start building your own customer channel.
              </p>

              <button
                onClick={() => setShowContactForm(true)}
                className="group px-12 md:px-16 py-6 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:shadow-[0_0_120px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 text-base flex items-center gap-3 mx-auto"
              >
                Start Your 90-Day Free Trial
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <WebFooter />
      <ContactFormModal isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
    </div>
  );
}
