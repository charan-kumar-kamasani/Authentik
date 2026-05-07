import React, { useEffect, useRef, useState } from 'react';
import { Shield, Lock, CheckCircle2, Bot, Globe2, Server, Check } from 'lucide-react';

// Custom hook for smooth scroll reveal animations
function useScrollReveal() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return [ref, isVisible];
}

const WebSecurityInfrastructure = () => {
  const [headerRef, headerVisible] = useScrollReveal();
  const [gridRef, gridVisible] = useScrollReveal();
  const [footerRef, footerVisible] = useScrollReveal();

  const securityFeatures = [
    {
      icon: Shield,
      title: "Cloudflare Protected",
      description: "Protected against DDoS attacks, malicious traffic, and suspicious requests using Cloudflare infrastructure.",
      color: "from-orange-500 to-amber-500",
      glowColor: "group-hover:shadow-orange-500/20",
      iconColor: "text-orange-400"
    },
    {
      icon: Lock,
      title: "SSL/TLS Encrypted",
      description: "All platform communication is secured using modern SSL/TLS encryption standards.",
      color: "from-blue-500 to-cyan-500",
      glowColor: "group-hover:shadow-blue-500/20",
      iconColor: "text-blue-400"
    },
    {
      icon: CheckCircle2,
      title: "HTTPS Secured",
      description: "Secure HTTPS connections enforced across the entire platform.",
      color: "from-emerald-500 to-teal-500",
      glowColor: "group-hover:shadow-emerald-500/20",
      iconColor: "text-emerald-400"
    },
    {
      icon: Bot,
      title: "Bot Protection Enabled",
      description: "Protection against spam bots, scraping activity, and automated malicious traffic.",
      color: "from-purple-500 to-pink-500",
      glowColor: "group-hover:shadow-purple-500/20",
      iconColor: "text-purple-400"
    },
    {
      icon: Globe2,
      title: "Global CDN Infrastructure",
      description: "Fast and reliable global content delivery with secure traffic routing.",
      color: "from-indigo-500 to-blue-500",
      glowColor: "group-hover:shadow-indigo-500/20",
      iconColor: "text-indigo-400"
    },
    {
      icon: Server,
      title: "Security Best Practices",
      description: "Modern authentication, infrastructure monitoring, and secure access practices implemented.",
      color: "from-rose-500 to-red-500",
      glowColor: "group-hover:shadow-rose-500/20",
      iconColor: "text-rose-400"
    }
  ];

  const trustIndicators = [
    "TLS 1.3 Enabled",
    "HSTS Security Headers",
    "Secure Authentication",
    "Infrastructure Monitoring"
  ];

  return (
    <section className="py-20 md:py-32 px-6 relative overflow-hidden bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
      {/* Subtle Background Glows for Dark Mode Premium Feel */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 transform ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-sm backdrop-blur-md">
            <Shield className="w-4 h-4 text-emerald-500" />
            Trusted Infrastructure
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-[1.1]">
            Enterprise-Grade <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Security & Infrastructure</span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            We implement modern infrastructure and security best practices to help ensure secure, reliable, and protected platform access.
          </p>
        </div>

        {/* Security Cards Grid */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20"
        >
          {securityFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                style={{ transitionDelay: `${idx * 100}ms` }}
                className={`group relative p-8 md:p-10 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-2xl dark:shadow-none ${feature.glowColor} ${
                  gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                {/* Subtle animated glowing border effect */}
                <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-10 transition-opacity duration-500 pointer-events-none ${feature.color}`} />
                
                {/* Icon wrapper */}
                <div className="mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 inline-flex group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-none">
                  <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                  {feature.title}
                </h3>
                
                <p className="text-base text-slate-600 dark:text-gray-400 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators Footer */}
        <div 
          ref={footerRef}
          className={`pt-10 border-t border-slate-200 dark:border-white/10 transition-all duration-1000 delay-500 ${
            footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {trustIndicators.map((indicator, idx) => (
              <div key={idx} className="flex items-center gap-3 group cursor-default">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  {indicator}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebSecurityInfrastructure;
