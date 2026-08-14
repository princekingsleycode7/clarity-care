import React, { useEffect, useRef } from 'react';
import { Users, Heart, Sprout } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ImpactStatsSection: React.FC = () => {
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
    <section ref={sectionRef} className="w-full bg-[#d2dbc8] text-[#1c2c19] py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12 lg:px-16 transition-colors duration-300 overflow-hidden">
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

        {/* Right Side: Mission Statement & Core Value Pills */}
        <div className="flex flex-col items-start space-y-6 max-w-2xl">
          <p className="stat-text text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] font-semibold text-[#1c2c19] leading-[1.22] tracking-tight font-['Plus_Jakarta_Sans']">
            At Clover Heart Haven, we're dedicated to helping individuals live more fulfilling lives. Our licensed therapists bring empathy.
          </p>

          {/* Values Row with Dividers */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-[#1c2c19] text-xs sm:text-sm font-semibold">
            {/* Value 1 */}
            <div className="stat-value flex items-center gap-2">
              <Users size={18} className="text-[#1c2c19]" />
              <span>Compassion</span>
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[#1c2c19]/30" />

            {/* Value 2 */}
            <div className="stat-value flex items-center gap-2">
              <Heart size={18} className="text-[#1c2c19]" />
              <span>Integrity</span>
            </div>

            <div className="hidden sm:block w-[1px] h-4 bg-[#1c2c19]/30" />

            {/* Value 3 */}
            <div className="stat-value flex items-center gap-2">
              <Sprout size={18} className="text-[#1c2c19]" />
              <span>Mind Growth</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

