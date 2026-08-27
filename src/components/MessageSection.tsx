import React, { useState, useEffect, useRef } from 'react';
import { APP_ASSETS } from '../constants/assets';
import feelingBetterBg from '../assets/images/feeling_better_bg.png';
import { ContactModal } from './ContactModal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const MessageSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('Individual Therapy');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Big typography rows stagger
      gsap.fromTo(
        '.msg-headline',
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );

      // Sub-content & CTA
      gsap.fromTo(
        '.msg-subcontent > *',
        { y: 30, opacity: 0 },
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

  const handleOpenModal = (topic: string) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
  };

  return (
    <section id="message" ref={sectionRef} className="relative w-full min-h-screen flex flex-col justify-between p-4 sm:p-8 md:p-12 lg:p-16 overflow-hidden text-white transition-all duration-300">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${APP_ASSETS.feelingBetterBg}), url(${feelingBetterBg})`,
          backgroundPosition: 'center 20%',
        }}
      />

      {/* Subtle Tonal Overlays for Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />

      {/* Top Spacer */}
      <div className="relative z-10 h-8 sm:h-12" />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto w-full my-auto py-6 sm:py-10">
        {/* Split Typography Headline with Open Center Gap Framing Her Face */}
        <div className="w-full">
          {/* Row 1: 'feeling better' on left, open gap for face in center, 'starts' on right */}
          <div className="flex items-baseline justify-between gap-4 sm:gap-8 md:gap-12 lg:gap-16 w-full">
            <h2 className="msg-headline text-3xl sm:text-5xl md:text-6xl lg:text-[78px] xl:text-[94px] font-normal text-white tracking-tight leading-none font-['Plus_Jakarta_Sans'] drop-shadow-lg whitespace-nowrap">
              feeling better
            </h2>
            {/* Center face clearance spacer */}
            <div className="hidden sm:block flex-1 min-w-[80px] md:min-w-[180px] lg:min-w-[260px] pointer-events-none" aria-hidden="true" />
            <h2 className="msg-headline text-3xl sm:text-5xl md:text-6xl lg:text-[78px] xl:text-[94px] font-normal text-white tracking-tight leading-none font-['Plus_Jakarta_Sans'] drop-shadow-lg whitespace-nowrap text-right">
              starts
            </h2>
          </div>

          {/* Row 2: 'with a single message' placed to the right */}
          <div className="flex justify-end w-full mt-2 sm:mt-3 md:mt-5">
            <h2 className="msg-headline text-3xl sm:text-5xl md:text-6xl lg:text-[78px] xl:text-[94px] font-normal text-white tracking-tight leading-none font-['Plus_Jakarta_Sans'] drop-shadow-lg text-right">
              with a single message
            </h2>
          </div>
        </div>

        {/* Sub-content & CTA Row */}
        <div className="msg-subcontent mt-8 sm:mt-12 md:mt-16 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-10">
          {/* Large Narrative Lines */}
          <div className="flex flex-col items-start space-y-2 sm:space-y-2.5 max-w-2xl text-left">
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-semibold text-white tracking-tight leading-snug font-['Plus_Jakarta_Sans']">
              You don't have to carry everything alone.
            </p>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-medium text-[#d2dbc8] tracking-tight leading-snug font-['Plus_Jakarta_Sans']">
              You don't need to have the right words.
            </p>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-medium text-[#e8f0e2] tracking-tight leading-snug font-['Plus_Jakarta_Sans']">
              You just need somewhere safe to begin.
            </p>
          </div>

          {/* New Prominent CTA Button */}
          <div className="shrink-0 pt-2 sm:pt-0">
            <button
              onClick={() => handleOpenModal('Free Private Clarity Call')}
              className="inline-flex items-center gap-3 bg-[#e8ede2] hover:bg-white text-[#132212] text-xs sm:text-sm md:text-base font-bold px-7 py-4 sm:px-8 sm:py-4.5 rounded-full transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider font-['Plus_Jakarta_Sans'] group whitespace-nowrap"
            >
              <span>BOOK YOUR FREE PRIVATE CLARITY CALL</span>
              <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="relative z-10 h-6 sm:h-10" />

      {/* Consultation Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTopic={selectedTopic}
      />
    </section>
  );
};


