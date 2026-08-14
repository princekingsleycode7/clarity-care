import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './Navbar';
import { ContactModal } from './ContactModal';
import heroBgImage from '../assets/images/hero_custom_bg.png';
import therapistAvatar from '../assets/images/licensed_therapist_session_1786464568739.jpg';
import supportAvatar from '../assets/images/therapy_support_woman_1786464396553.jpg';
import { Star, ShieldCheck, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export const Hero: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('Gain Clarity');
  const [activeNav, setActiveNav] = useState('Home');
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
    setIsModalOpen(true);
  };

  return (
    <div ref={heroRef} className="relative w-full h-screen min-h-[600px] flex flex-col justify-between overflow-hidden">
      {/* Background Image Container */}
      <div 
        className="relative w-full h-full flex flex-col justify-between px-3 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 transition-all duration-500 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBgImage})`,
          backgroundPosition: 'center 35%',
        }}
      >
        {/* Soft Dimming & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Floating Top Header Navigation */}
        <div className="relative z-20">
          <Navbar
            onContactClick={() => {
              setSelectedTopic('Gain Clarity');
              setIsModalOpen(true);
            }}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
          />
        </div>

        {/* Active Tab Preview Banner (If navigated away from Home) */}
        {activeNav !== 'Home' && (
          <div className="relative z-20 my-auto mx-auto max-w-md bg-[#1c2c19]/90 text-white p-5 rounded-2xl backdrop-blur-md shadow-xl border border-white/20 text-center animate-fade-in">
            <h3 className="text-lg font-bold mb-1 font-['Plus_Jakarta_Sans']">
              {activeNav} Section
            </h3>
            <p className="text-xs text-gray-300 mb-3">
              Explore our personalized counseling services, compassionate care plans, and client testimonials.
            </p>
            <button
              onClick={() => setActiveNav('Home')}
              className="text-xs bg-white text-[#1c2c19] font-semibold px-3.5 py-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
            >
              Back to Hero View
            </button>
          </div>
        )}

        {/* Bottom Hero Content Grid */}
        <div className="relative z-20 mt-auto pt-6 sm:pt-10 pb-4 sm:pb-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
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
                setSelectedTopic('General Therapy');
                setIsModalOpen(true);
              }}
              className="bg-white hover:bg-[#eef4ea] text-[#1c2c19] text-xs sm:text-sm font-bold px-5 py-2.5 sm:px-6 sm:py-3 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Request A Call</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Consultation Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTopic={selectedTopic}
      />
    </div>
  );
};

