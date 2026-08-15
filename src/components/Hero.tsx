import React, { useState, useEffect, useRef } from 'react';
import { ContactModal } from './ContactModal';
import { APP_ASSETS } from '../constants/assets';
import heroBgImage from '../assets/images/hero_custom_bg.png';
import therapistAvatar from '../assets/images/licensed_therapist_session_1786464568739.jpg';
import supportAvatar from '../assets/images/therapy_support_woman_1786464396553.jpg';
import { Star, ShieldCheck, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

interface HeroProps {
  onOpenConsultation: (topic?: string) => void;
  onNavigate?: (nav: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenConsultation, onNavigate }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('Gain Clarity');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-badge',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.1,
          clearProps: 'all',
        }
      );

      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.3,
          clearProps: 'all',
        }
      );

      gsap.fromTo(
        '.hero-desc',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.5,
          clearProps: 'all',
        }
      );

      gsap.fromTo(
        '#cta-btn',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
          delay: 0.6,
          clearProps: 'all',
        }
      );

      gsap.fromTo(
        '.hero-social-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.7,
          clearProps: 'all',
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const badges = [
    { id: 'Gain Clarity', label: 'Gain Clarity' },
    { id: 'Self-Awareness', label: 'Self-Awareness' },
    { id: 'Manage Stress', label: 'Manage Stress' },
  ];

  const handleBadgeClick = (topicLabel: string) => {
    setSelectedTopic(topicLabel);
    if (onOpenConsultation) {
      onOpenConsultation(topicLabel);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div id="home" ref={heroRef} className="relative w-full h-screen min-h-[620px] flex flex-col justify-between overflow-hidden">
      {/* Background Image Container */}
      <div 
        className="relative w-full h-full flex flex-col justify-between px-3 py-2 sm:px-6 sm:py-4 md:px-8 md:py-6 transition-all duration-500 bg-cover bg-center"
        style={{
          backgroundImage: `url(${APP_ASSETS.heroBg}), url(${heroBgImage})`,
          backgroundPosition: 'center 35%',
        }}
      >
        {/* Soft Dimming & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Top spacer to provide room for fixed floating navbar */}
        <div className="h-16 sm:h-20" />

        {/* Bottom Hero Content Grid */}
        <div className="relative z-20 mt-auto pt-6 sm:pt-10 pb-6 sm:pb-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Left Column: Badges, Headline & Trust Card */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-3 sm:space-y-4">
            {/* Pill Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {badges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge.label)}
                  className="hero-badge bg-[#d2dbc8] hover:bg-[#e2eadd] text-[#1c2c19] text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  {badge.label}
                </button>
              ))}
            </div>

            {/* Main Headline */}
            <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-[50px] xl:text-[56px] font-bold text-white tracking-tight leading-[1.08] font-['Plus_Jakarta_Sans'] drop-shadow-md max-w-2xl">
              Your Path to Wellness <br className="hidden sm:inline" />
              Starts Today
            </h1>

            {/* Floating Client Rating & Avatar Card */}
            <div className="hero-social-card flex items-center gap-3 bg-[#122011]/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 shadow-lg text-white">
              <div className="flex -space-x-2">
                <img
                  src={therapistAvatar}
                  alt="Therapist"
                  className="w-7 h-7 rounded-full object-cover border-2 border-[#122011]"
                />
                <img
                  src={supportAvatar}
                  alt="Client"
                  className="w-7 h-7 rounded-full object-cover border-2 border-[#122011]"
                />
                <div className="w-7 h-7 rounded-full bg-[#355231] text-[#d2dbc8] text-[10px] font-bold flex items-center justify-center border-2 border-[#122011]">
                  +23k
                </div>
              </div>

              <div className="text-xs">
                <div className="flex items-center gap-1 text-[#f5d061]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-current" />
                  ))}
                  <span className="text-white font-bold ml-1 text-[11px]">4.9 / 5.0</span>
                </div>
                <p className="text-[10px] text-gray-300 font-medium">Over 23,000+ sessions booked</p>
              </div>
            </div>
          </div>

          {/* Right Column: Description & Action Call */}
          <div className="lg:col-span-5 flex flex-col items-start justify-end space-y-3 lg:pl-4">
            <p className="hero-desc text-white/95 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-sm sm:max-w-md drop-shadow-sm font-['Plus_Jakarta_Sans']">
              Build resilience and rediscover your inner strength. Whether you're facing anxiety, burnout, relationship stress, or simply seeking personal clarity.
            </p>

            {/* Request A Call Button */}
            <button
              id="cta-btn"
              onClick={() => {
                if (onOpenConsultation) {
                  onOpenConsultation('General Therapy');
                } else {
                  setIsModalOpen(true);
                }
              }}
              className="bg-white hover:bg-[#eef4ea] text-[#1c2c19] text-xs sm:text-sm font-bold px-5 py-2.5 sm:px-6 sm:py-3 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Request A Call</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Fallback modal if not controlled from parent */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTopic={selectedTopic}
      />
    </div>
  );
};
