import React, { useState, useEffect, useRef } from 'react';
import feelingBetterBg from '../assets/images/user_bg.jpg';
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
    <section ref={sectionRef} className="relative w-full min-h-screen flex flex-col justify-between p-4 sm:p-8 md:p-12 lg:p-16 overflow-hidden text-white transition-all duration-300">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${feelingBetterBg})`,
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
        {/* Split Typography Headline */}
        <div className="w-full">
          {/* Row 1: 'feeling better' on left, 'starts' on right */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 w-full">
            <h2 className="msg-headline text-4xl sm:text-6xl md:text-7xl lg:text-[90px] xl:text-[105px] font-normal text-white tracking-tight leading-none font-['Plus_Jakarta_Sans'] drop-shadow-md">
              feeling better
            </h2>
            <h2 className="msg-headline text-4xl sm:text-6xl md:text-7xl lg:text-[90px] xl:text-[105px] font-normal text-white tracking-tight leading-none font-['Plus_Jakarta_Sans'] drop-shadow-md">
              starts
            </h2>
          </div>

          {/* Row 2: 'with a single message' */}
          <div className="flex justify-end w-full -mt-1 sm:-mt-3 md:-mt-5">
            <h2 className="msg-headline text-4xl sm:text-6xl md:text-7xl lg:text-[90px] xl:text-[105px] font-normal text-white tracking-tight leading-none font-['Plus_Jakarta_Sans'] drop-shadow-md">
              with a single message
            </h2>
          </div>
        </div>

        {/* Sub-content & CTA Row */}
        <div className="msg-subcontent mt-8 sm:mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Left Column: Subtext & Action Pills */}
          <div className="lg:col-span-8 flex flex-col items-start space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 text-xs sm:text-sm text-white/90 max-w-2xl">
              <span className="sm:col-span-4 text-xs font-semibold text-white/90 tracking-tight leading-tight">
                You deserve to be happy
              </span>
              <p className="sm:col-span-8 font-normal leading-relaxed text-white/80 text-xs sm:text-sm">
                Much more than live sessions and messaging. It's a complete happiness toolbox. Get matched with a qualified therapist within a minute.
              </p>
            </div>

            {/* Action Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleOpenModal('Individual Therapy')}
                className="bg-white hover:bg-[#eef4ea] text-[#1c2c19] text-xs sm:text-sm font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Individual Therapy</span>
                <span className="text-base leading-none">→</span>
              </button>

              <button
                onClick={() => handleOpenModal('Couples Therapy')}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs sm:text-sm font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Couples Therapy
              </button>
            </div>
          </div>

          {/* Right Column: Press / Media Logos */}
          <div className="lg:col-span-4 flex flex-wrap items-center justify-start lg:justify-end gap-4 sm:gap-5 text-white/80 text-xs sm:text-sm font-bold tracking-wider uppercase pt-4 lg:pt-0">
            <span className="hover:text-white transition-colors cursor-default">OCBS</span>
            <span className="hover:text-white transition-colors cursor-default font-serif lowercase italic text-sm sm:text-base">the new york times</span>
            <span className="hover:text-white transition-colors cursor-default tracking-widest text-[10px] sm:text-[11px]">Bloomberg</span>
            <span className="hover:text-white transition-colors cursor-default tracking-widest text-[10px] sm:text-[11px]">MOTHERBOARD</span>
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


