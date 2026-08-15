import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Twitter, Mail, ArrowUpRight, Check } from 'lucide-react';
import { ContactModal } from './ContactModal';
import { APP_ASSETS } from '../constants/assets';
import logoImg from '../assets/images/original_logo.png';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState('General');
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Top link columns & newsletter form reveal
      gsap.fromTo(
        '.footer-top-block',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );

      // Giant 'clover heart haven' title scaling reveal
      gsap.fromTo(
        '.footer-brand-title',
        { scale: 0.9, y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.footer-brand-title',
            start: 'top 92%',
          },
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  const handleOpenModal = (topic: string) => {
    setModalTopic(topic);
    setIsModalOpen(true);
  };

  return (
    <footer ref={footerRef} className="w-full bg-[#142213] text-white pt-16 sm:pt-20 pb-8 px-4 sm:px-8 md:px-12 lg:px-16 border-t border-[#233821] overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Newsletter & Links Columns */}
        <div className="footer-top-block grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-[#253e23]">
          {/* Left Block: Brand, Tagline, Email Form & Socials */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Brand Logo & Title */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-10 sm:w-14 sm:h-12 flex items-center justify-center overflow-visible">
                  <img 
                    src={APP_ASSETS.logo} 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = logoImg;
                    }}
                    alt="Clover Heart Haven Logo" 
                    className="w-full h-full object-contain scale-125 hover:scale-135 transition-transform duration-300 filter drop-shadow-md"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] leading-tight">
                    Clover Heart Haven
                  </h3>
                  <div className="text-[11px] font-medium text-[#b4c898] uppercase tracking-widest">
                    Care Different ™
                  </div>
                </div>
              </div>

              {/* Email Input Form */}
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder="email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1e301d] border border-[#2e472a] focus:border-[#a4bc87] text-white placeholder-gray-400 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#d2dbc8] hover:bg-[#c2ccb8] text-[#1c2c19] text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shrink-0 shadow-md active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  {subscribed ? (
                    <>
                      <Check size={16} className="text-[#1c2c19]" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <span>Join for free</span>
                  )}
                </button>
              </form>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-[#1e301d] hover:bg-[#d2dbc8] text-white hover:text-[#1c2c19] border border-[#2e472a] flex items-center justify-center transition-all cursor-pointer"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#twitter"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full bg-[#1e301d] hover:bg-[#d2dbc8] text-white hover:text-[#1c2c19] border border-[#2e472a] flex items-center justify-center transition-all cursor-pointer"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenModal('General Inquiry');
                }}
                aria-label="Email Us"
                className="w-10 h-10 rounded-full bg-[#1e301d] hover:bg-[#d2dbc8] text-white hover:text-[#1c2c19] border border-[#2e472a] flex items-center justify-center transition-all cursor-pointer"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Right Columns: Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Find Therapy */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4">
                Find Therapy
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-[#a4bc87]">
                <li>
                  <button
                    onClick={() => onNavigate ? onNavigate('Service') : handleOpenModal('Individual Therapy')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Services & Techniques
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate ? onNavigate('Service') : handleOpenModal('Couples Therapy')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Couples Counseling
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate ? onNavigate('About') : handleOpenModal('Dr. Vance')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    About Dr. Elena Vance
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate ? onNavigate('Reviews') : handleOpenModal('Reviews')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Client Reviews & Stories
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4">
                Resources
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-[#a4bc87]">
                <li>
                  <a 
                    href="tel:988"
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1 text-[#f6ad55]"
                  >
                    Crisis Hotline (988)
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate ? onNavigate('About') : handleOpenModal('About')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Doctor Credentials & FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleOpenModal('Free Consultation')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Book Consultation
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate ? onNavigate('About') : handleOpenModal('FAQ')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Therapy Techniques FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#b4c898] uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-[#a4bc87]">
                <li>
                  <button 
                    onClick={() => onNavigate ? onNavigate('About') : handleOpenModal('About')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    About Practice
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigate ? onNavigate('Reviews') : handleOpenModal('Reviews')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Patient Testimonials
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate ? onNavigate('Contact') : handleOpenModal('General Inquiry')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Contact & Directions
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleOpenModal('Privacy Policy & HIPAA')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    HIPAA Privacy Pledge
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Massive Lower Branding Typography */}
        <div className="pt-8 sm:pt-12 text-center select-none overflow-hidden">
          <h1 className="footer-brand-title text-[10vw] md:text-[11vw] leading-[0.9] font-bold text-white tracking-tight font-['Plus_Jakarta_Sans'] opacity-95 flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
            <span>clover</span>
            <span className="text-[#a4bc87]">heart</span>
            <span>haven</span>
          </h1>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-8 pt-6 border-t border-[#1e301d] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8ea37a]">
          <div>
            © {new Date().getFullYear()} Clover Heart Haven Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#cookies" className="hover:text-white transition-colors">
              Cookie Preferences
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTopic={modalTopic}
      />
    </footer>
  );
};

