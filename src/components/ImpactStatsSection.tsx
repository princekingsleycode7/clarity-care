import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ImpactStatsSectionProps {
  onOpenConsultation?: () => void;
}

export const ImpactStatsSection: React.FC<ImpactStatsSectionProps> = ({ onOpenConsultation }) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate left circles
      gsap.fromTo(
        '.stat-circle',
        { scale: 0.7, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
          scale: 1,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'back.out(1.6)',
          clearProps: 'all',
        }
      );

      // Animate main statement
      gsap.fromTo(
        '.stat-text',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );

      // Animate values
      gsap.fromTo(
        '.stat-value',
        { y: 20, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="impact" ref={sectionRef} className="w-full bg-[#d2dbc8] text-[#1c2c19] py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12 lg:px-16 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
        {/* Left Side: Overlapping Dark Green Stat Circles */}
        <div className="flex items-center justify-center shrink-0">
          {/* Main Large Circle */}
          <div className="stat-circle w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 bg-[#1c2c19] text-white rounded-full flex flex-col items-center justify-center p-4 text-center shadow-md">
            <span className="text-4xl sm:text-5xl md:text-6xl font-normal font-['Plus_Jakarta_Sans'] tracking-tight mb-1">
              12+
            </span>
            <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-tight max-w-[110px]">
              Years Of Experience
            </span>
          </div>

          {/* Secondary Overlapping Circle */}
          <div className="stat-circle w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 bg-[#1c2c19] text-white rounded-full flex flex-col items-center justify-center p-3 text-center shadow-md -ml-5 sm:-ml-7">
            <span className="text-2xl sm:text-3xl md:text-4xl font-normal font-['Plus_Jakarta_Sans'] tracking-tight mb-0.5">
              95%
            </span>
            <span className="text-[10px] sm:text-xs text-slate-300 font-medium leading-tight max-w-[85px]">
              Happy Clients
            </span>
          </div>
        </div>

        {/* Right Side: Emotional Narrative & Understanding */}
        <div className="flex flex-col items-start space-y-6 max-w-2xl">
          {/* Staggered Repetition Thought Loops */}
          <div className="space-y-2.5 stat-text">
            <p className="text-xl sm:text-2xl md:text-[26px] font-semibold text-[#1c2c19] leading-snug tracking-tight font-['Plus_Jakarta_Sans']">
              But you're still checking your phone.
            </p>
            <div className="space-y-1.5 text-base sm:text-lg md:text-xl text-[#2d4029] font-medium leading-snug">
              <p>Still replaying the conversation.</p>
              <p>Still wondering what you did wrong.</p>
              <p>Still thinking about what could have been.</p>
              <p>Still trying to understand why letting go feels harder than it should.</p>
            </div>
          </div>

          {/* Pivot & Validation Statement */}
          <div className="stat-text pt-2 border-l-2 border-[#1c2c19]/30 pl-4 space-y-2">
            <p className="text-sm sm:text-base text-[#465a41] italic font-medium">
              And maybe you're tired of people telling you: <span className="font-semibold text-[#1c2c19]">“Just move on.”</span>
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#1c2c19] leading-snug font-['Plus_Jakarta_Sans']">
              You don't need another person telling you to move on.
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#2d4728] leading-snug font-['Plus_Jakarta_Sans']">
              You need space to understand what you're carrying.
            </p>
          </div>

          {/* Call to Action: Talk To Someone */}
          <div className="stat-value pt-2">
            <button
              type="button"
              onClick={onOpenConsultation}
              className="inline-flex items-center gap-2 bg-[#1c2c19] hover:bg-[#283d24] text-white text-xs sm:text-sm md:text-base font-bold px-6 py-3.5 sm:px-7 sm:py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer tracking-wide font-['Plus_Jakarta_Sans'] group"
            >
              <span>Talk To Someone</span>
              <ArrowRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

