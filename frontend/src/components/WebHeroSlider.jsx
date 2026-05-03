import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import AnimatedCTA from './AnimatedCTA';

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

  useEffect(() => {
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="container mx-auto text-center relative z-10">
      {/* ═══════════════ DESKTOP SLIDER ═══════════════ */}
      <div className="hidden md:block relative w-full lg:w-[94%] mx-auto mb-6 md:mb-10">
        <div
          onClick={onCTA}
          className="hero-slide-enter relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/5 cursor-pointer group"
        >
          <div className="relative w-full bg-[#020617]/50" style={{ aspectRatio: '1672/741' }}>
            {slides.map((s, i) => (
              <img
                key={i}
                src={s.banner}
                alt={`Banner ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-in-out group-hover:scale-[1.01] ${i === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              />
            ))}
          </div>
          <div className="absolute inset-0 pointer-events-none rounded-[2rem] ring-1 ring-inset ring-white/10 z-20" />
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white-[0.02] transition-colors z-20 pointer-events-none" />
        </div>
      </div>

      {/* ═══════════════ MOBILE SLIDER ═══════════════ */}
      <div className="block md:hidden relative w-[96%] mx-auto mb-6">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-white/10 mb-4 bg-[#020617]/50" style={{ aspectRatio: '1.2/1' }}>
          {slides.map((s, i) => (
            <img
              key={i}
              src={s.mobileBanner || s.banner}
              alt={`Mobile Banner ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-in-out ${i === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            />
          ))}
        </div>

        <AnimatedCTA onClick={onCTA} className="w-full" />
      </div>
    </div>
  );
}
