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

  const slide = heroSlides[activeSlide];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      <WebHeader />

      {/* ═══════════════ HERO SECTION (Dynamic Slider) ═══════════════ */}
      <section className="relative pt-12 px-6 min-h-[85vh] flex items-center overflow-hidden">
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

      {/* ═══════════════ USE CASE SECTION (Segmented Selling) ═══════════════ */}
      <section className="py-12 md:py-12 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <SectionTag><Users size={14} /> Use Cases</SectionTag>
            <SectionTitle>Built for Every Type of Brand</SectionTitle>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                tier: 'Small Brands',
                color: 'from-emerald-500 to-emerald-600',
                borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
                iconBg: 'bg-emerald-500/10',
                iconColor: 'text-emerald-400',
                tagBg: 'bg-emerald-500/10 text-emerald-400',
                desc: 'Protect products and build customer trust from day one',
                features: ['QR-based authentication', 'Instant product verification', 'Zero tech knowledge needed', 'Build consumer confidence'],
              },
              {
                tier: 'Growing D2C Brands',
                color: 'from-blue-500 to-cyan-500',
                borderColor: 'border-blue-500/20 hover:border-blue-500/40',
                iconBg: 'bg-blue-500/10',
                iconColor: 'text-blue-400',
                tagBg: 'bg-blue-500/10 text-blue-400',
                desc: 'Drive direct sales and reduce dependency on marketplaces',
                features: ['Customer engagement tools', 'Direct website traffic', 'Reward-based retention', 'Marketplace independence'],
                highlighted: true,
              },
              {
                tier: 'Enterprises',
                color: 'from-red-500 to-orange-500',
                borderColor: 'border-red-500/20 hover:border-red-500/40',
                iconBg: 'bg-red-500/10',
                iconColor: 'text-red-400',
                tagBg: 'bg-red-500/10 text-red-400',
                desc: 'Track product movement and detect counterfeits at scale',
                features: ['Supply chain visibility', 'Real-time analytics', 'Counterfeit detection', 'Enterprise-grade security'],
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`group glass-effect rounded-[2.5rem] p-8 md:p-10 border ${item.borderColor} transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden ${item.highlighted ? 'ring-1 ring-blue-500/20' : ''}`}
              >
                {item.highlighted && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                )}
                <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${item.tagBg} mb-6`}>
                  {item.tier}
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">{item.tier}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed mb-8">{item.desc}</p>

                <div className="space-y-3 mb-8">
                  {item.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <CheckCircle2 size={14} className={item.iconColor} />
                      <span className="text-gray-300 font-medium text-sm">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowContactForm(true)}
                  className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs bg-gradient-to-r ${item.color} text-white hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
                >
                  Get Started
                </button>
              </div>
            ))}
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

      {/* ═══════════════ TESTIMONIAL ═══════════════ */}
      <section className="py-12 md:py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <SectionTag><Quote size={14} /> Testimonials</SectionTag>
            <SectionTitle>What Our Clients Say</SectionTitle>
          </div>

          <div className="glass-effect rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500 rounded-full blur-[100px] opacity-10" />
            <Quote size={48} className="text-indigo-500/20 mx-auto mb-6" />

            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
              ))}
            </div>

            <blockquote className="text-xl md:text-2xl font-medium text-gray-200 leading-relaxed mb-10 italic max-w-2xl mx-auto">
              "Authentiks helped us connect directly with our customers and track our products better. The QR-based authentication gave our brand the trust factor we needed."
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg">
                A
              </div>
              <div className="text-left">
                <div className="font-black text-white">Authentiks Partner</div>
                <div className="text-sm text-gray-500 font-bold">Verified Brand</div>
              </div>
            </div>
          </div>
        </div>
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
