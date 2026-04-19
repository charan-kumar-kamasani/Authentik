import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function WebHeroSlider({ slides, onCTA, onSlideChange }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveSlide(index);
    if (onSlideChange) onSlideChange(index);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, onSlideChange]);

  const nextSlide = useCallback(() => {
    goToSlide((activeSlide + 1) % slides.length);
  }, [activeSlide, goToSlide, slides.length]);

  const prevSlide = useCallback(() => {
    goToSlide((activeSlide - 1 + slides.length) % slides.length);
  }, [activeSlide, goToSlide, slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[activeSlide];

  return (
    <div className="container mx-auto text-center relative z-10 ">
      {/* Banner Image Carousel */}
      <div
        onClick={onCTA}
        className="hero-slide-enter relative w-full  mx-auto mb-10 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/5 cursor-pointer group"
      >
        <div className="relative w-full" style={{ aspectRatio: '1672/741' }}>
          {slides.map((s, i) => (
            <img
              key={i}
              src={s.banner}
              alt={`Banner ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-in-out group-hover:scale-[1.01] ${i === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            />
          ))}
        </div>
        <div className="absolute inset-0 pointer-events-none rounded-[2rem] ring-1 ring-inset ring-white/10 z-20" />
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white-[0.02] transition-colors z-20 pointer-events-none" />
      </div>

      {/* Slide Navigation Dots */}
      <div className="flex items-center justify-center gap-4 mb-10 relative z-30">
        <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <ChevronLeft size={18} />
        </button>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); goToSlide(i); }}
            className={`h-2 rounded-full transition-all duration-500 ${i === activeSlide ? 'w-10 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
          />
        ))}
        <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Global CTA Button */}
      {/* <div className="hero-slide-enter-delay-2 flex flex-col items-center gap-6 mb-8 relative z-30">
        <button
          onClick={onCTA}
          className="group px-10 md:px-14 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:shadow-[0_0_80px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-95 text-sm flex items-center gap-3"
        >
          Start Your 90-Day Free Trial
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div> */}
    </div>
  );
}
