import React, { useState, useEffect, useRef } from 'react';
import { ContactModal } from './ContactModal';
import { FreeGuideModal } from './FreeGuideModal';
import { APP_ASSETS } from '../constants/assets';
import heroBgImage from '../assets/images/hero_custom_bg.png';
import { ArrowRight, BookOpen } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onOpenConsultation: (topic?: string) => void;
  onNavigate?: (nav: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenConsultation }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroPinRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLHeadingElement>(null);
  const revealedContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial entrance on load
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.2,
          clearProps: 'opacity,y',
        }
      );

      gsap.fromTo(
        subheadlineRef.current,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.38,
          clearProps: 'opacity,y',
        }
      );

      // 2. Parallax Pinned Scroll Timeline with GSAP MatchMedia & Lenis
      const mm = gsap.matchMedia();

      // Mobile screens (< 640px)
      mm.add('(max-width: 639px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroWrapperRef.current,
            start: 'top top',
            end: '+=100%',
            pin: heroPinRef.current,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          headingRef.current,
          {
            scale: 0.62,
            y: -230,
            transformOrigin: 'left bottom',
            ease: 'power2.inOut',
            duration: 0.7,
          },
          0
        );

        tl.to(
          subheadlineRef.current,
          {
            scale: 0.85,
            y: -230,
            transformOrigin: 'left bottom',
            ease: 'power2.inOut',
            duration: 0.7,
          },
          0
        );

        tl.fromTo(
          revealedContentRef.current,
          {
            opacity: 0,
            y: -170,
            pointerEvents: 'none',
          },
          {
            opacity: 1,
            y: -225,
            pointerEvents: 'auto',
            ease: 'power2.out',
            duration: 0.75,
          },
          0.15
        );
      });

      // Tablet and Desktop screens (>= 640px)
      mm.add('(min-width: 640px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroWrapperRef.current,
            start: 'top top',
            end: '+=90%',
            pin: heroPinRef.current,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          headingRef.current,
          {
            scale: 0.72,
            y: -150,
            transformOrigin: 'left bottom',
            ease: 'power2.inOut',
            duration: 0.7,
          },
          0
        );

        tl.to(
          subheadlineRef.current,
          {
            scale: 0.8,
            y: -150,
            transformOrigin: 'left bottom',
            ease: 'power2.inOut',
            duration: 0.7,
          },
          0
        );

        tl.fromTo(
          revealedContentRef.current,
          {
            opacity: 0,
            y: -90,
            pointerEvents: 'none',
          },
          {
            opacity: 1,
            y: -140,
            pointerEvents: 'auto',
            ease: 'power2.out',
            duration: 0.75,
          },
          0.15
        );
      });
    }, heroWrapperRef);

    return () => ctx.revert();
  }, []);

  const handleBookCall = () => {
    if (onOpenConsultation) {
      onOpenConsultation('Private Clarity Call');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div id="home" ref={heroWrapperRef} className="relative w-full">
      {/* Pinned Viewport Container */}
      <div 
        ref={heroPinRef}
        className="relative w-full h-screen min-h-[600px] flex flex-col justify-center overflow-hidden"
      >
        {/* Background Image Container (Stays perfectly pinned in place, centered on the subject on mobile & tablet) */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-[position:72%_15%] sm:bg-[position:70%_20%] md:bg-[position:68%_22%] lg:bg-[position:62%_25%] xl:bg-[position:center_25%] transition-all duration-500"
          style={{
            backgroundImage: `url(${APP_ASSETS.heroBg}), url(${heroBgImage})`,
          }}
        >
          {/* Directional Gradients: High contrast for text, fully transparent over the face */}
          {/* Left-to-right gradient on large screens to protect left text while keeping the right subject clean and luminous */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 via-40% to-transparent to-70% pointer-events-none" />
          <div className="hidden md:block lg:hidden absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 via-45% to-transparent to-75% pointer-events-none" />
          
          {/* Bottom-to-top gradient that fades out before reaching her face in the upper viewport */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-35% to-transparent to-55% pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 flex flex-col justify-start pt-[70vh] sm:pt-[65vh] pb-4 sm:pb-6">
          <div className="max-w-3xl flex flex-col items-start text-left space-y-3 sm:space-y-4">
            
            {/* Header Group: Headline & Subheadline */}
            <div className="space-y-1.5 sm:space-y-3">
              <h1 
                ref={headingRef}
                className="hero-title text-[48px] sm:text-4xl md:text-5xl lg:text-[70px] xl:text-[80px] font-bold text-white tracking-tight leading-[1.08] font-['Plus_Jakarta_Sans'] drop-shadow-md will-change-transform"
              >
                You don't need to be strong right now.
              </h1>

              <h2 
                ref={subheadlineRef}
                className="hero-subheadline text-[16.5px] sm:text-2xl md:text-3xl lg:text-[30px] font-medium text-[#d2dbc8] tracking-tight leading-snug font-['Plus_Jakarta_Sans'] drop-shadow-sm will-change-transform"
              >
                You need somewhere safe to begin.
              </h2>
            </div>

            {/* Scroll-Revealed Content: Body Text + Dual CTAs + Microcopy */}
            <div 
              ref={revealedContentRef}
              className="space-y-3 sm:space-y-4 pt-1 w-full max-w-xl will-change-transform opacity-0 pointer-events-none"
            >
              {/* Body narrative text */}
              <p className="text-white/95 text-xs sm:text-sm md:text-[15px] font-normal leading-relaxed drop-shadow-sm font-['Plus_Jakarta_Sans']">
                Clover Heart Haven is a calm, professional space for women carrying heartbreak, emotional overwhelm, attachment pain and self-doubt — helping you understand what you're feeling and take your next step with support.
              </p>

              {/* Action Call & Secondary Options */}
              <div className="space-y-2 sm:space-y-2.5 pt-0.5 sm:pt-1">
                {/* Primary CTA */}
                <button
                  id="cta-btn"
                  onClick={handleBookCall}
                  className="w-full sm:w-auto bg-[#ffffff] hover:bg-[#f0f5ec] text-[#1c2c19] text-xs sm:text-sm font-extrabold px-5 py-3 sm:px-7 sm:py-4 rounded-full transition-all duration-300 shadow-2xl hover:shadow-[#ffffff]/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 tracking-wide uppercase font-['Plus_Jakarta_Sans']"
                >
                  <span>BOOK YOUR FREE PRIVATE CLARITY CALL</span>
                  <ArrowRight size={16} className="text-[#1c2c19]" />
                </button>

                {/* Microcopy underneath */}
                <p className="text-[11px] sm:text-xs text-[#d2dbc8] font-medium tracking-wide flex items-center gap-1.5 pl-1">
                  <span>15–20 minutes</span>
                  <span>•</span>
                  <span>Private</span>
                  <span>•</span>
                  <span>No pressure</span>
                </p>

                {/* Secondary CTA */}
                <div className="pt-0.5 sm:pt-1">
                  <button
                    type="button"
                    onClick={() => setIsGuideModalOpen(true)}
                    className="group text-xs sm:text-sm font-medium text-white/90 hover:text-white inline-flex items-center gap-1.5 cursor-pointer underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all pb-1"
                  >
                    <BookOpen size={14} className="text-[#d2dbc8] group-hover:scale-110 transition-transform" />
                    <span>I'm not ready to book — Give Me the Free Guide.</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Free Guide Download Modal */}
      <FreeGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onBookCall={handleBookCall}
      />

      {/* Booking Onboarding Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTopic="Private Clarity Call"
      />
    </div>
  );
};


