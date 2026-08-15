import React, { useState, useEffect, useRef } from 'react';
import supportImage from '../assets/images/therapy_support_woman_1786464396553.jpg';
import { ContactModal } from './ContactModal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const SupportSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left text content
      gsap.fromTo(
        '.support-content > *',
        { y: 35, opacity: 0 },
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

      // Right image card
      gsap.fromTo(
        '.support-image-card',
        { x: 30, opacity: 0, scale: 0.96 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="support" ref={sectionRef} className="w-full bg-[#f4f2e8] text-[#1f1a14] py-14 sm:py-20 md:py-24 px-4 sm:px-8 md:px-12 lg:px-16 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Text & Stats & CTA */}
        <div className="support-content lg:col-span-6 xl:col-span-6 flex flex-col items-start pr-0 lg:pr-4">
          {/* Eyebrow Label */}
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#635f54] mb-3 sm:mb-4">
            JOIN 23,000+ PEOPLE WHO STARTED
          </span>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] xl:text-[54px] font-bold text-[#1f1a14] tracking-tight leading-[1.1] font-['Plus_Jakarta_Sans'] mb-4 sm:mb-5">
            You don't have to handle everything alone.
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-[#4f5649] font-normal leading-relaxed mb-8 max-w-lg">
            Taking the first step doesn't mean everything changes overnight. It just means you're starting somewhere.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-md pt-2">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                4.9
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#6b7264] uppercase mt-1">
                AVERAGE RATING
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                40+
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#6b7264] uppercase mt-1">
                LICENSED THERAPIST
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                100%
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#6b7264] uppercase mt-1">
                CONFIDENTIAL
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High Quality Rounded Image */}
        <div className="lg:col-span-6 xl:col-span-6 w-full flex justify-center lg:justify-end">
          <div className="support-image-card relative w-full max-w-lg lg:max-w-none aspect-[1.15/1] sm:aspect-[1.2/1] rounded-[32px] sm:rounded-[44px] lg:rounded-[48px] overflow-hidden shadow-xl border border-black/5">
            <img
              src={supportImage}
              alt="Woman resting thoughtfully on bed with book"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTopic="General Therapy"
      />
    </section>
  );
};

