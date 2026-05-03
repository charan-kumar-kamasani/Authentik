import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function AnimatedCTA({ onClick, className = "" }) {
  const [ctaType, setCtaType] = useState('trial'); // 'trial' or 'demo'

  useEffect(() => {
    const interval = setInterval(() => {
      setCtaType(prev => prev === 'trial' ? 'demo' : 'trial');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`group relative h-[60px] overflow-hidden rounded-full font-[900] tracking-widest transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 text-sm flex items-center justify-center gap-3 ${className}`}
    >
      {/* Background Layers for Smooth Gradient Transition */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-1000 ease-in-out ${ctaType === 'trial' ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transition-opacity duration-1000 ease-in-out ${ctaType === 'demo' ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Text Layers for Smooth Fade */}
      <span className="relative z-10 flex items-center gap-3 text-white">
        <span className="relative h-6 w-48">
          <span className={`absolute inset-0 transition-all duration-1000 ease-in-out ${ctaType === 'trial' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            Start Your Free Trial
          </span>
          <span className={`absolute inset-0 transition-all duration-1000 ease-in-out ${ctaType === 'demo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Book a Live Demo
          </span>
        </span>
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </span>
    </button>
  );
}
