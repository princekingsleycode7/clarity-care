import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Sparkles, Phone, Calendar, ArrowRight, Heart } from 'lucide-react';
import { APP_ASSETS } from '../constants/assets';
import logoImg from '../assets/images/original_logo.png';

interface NavbarProps {
  onContactClick: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onContactClick,
  activeNav,
  setActiveNav,
  activeSection = 'Home',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if scrolled beyond top threshold
      if (currentScrollY > 70) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Determine scroll direction
      if (currentScrollY > lastScrollY.current + 8 && currentScrollY > 140) {
        setIsScrollingDown(true); // scrolling down
      } else if (currentScrollY < lastScrollY.current - 5) {
        setIsScrollingDown(false); // scrolling up
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'Home', label: 'Home' },
    { id: 'About', label: 'About Doctor' },
    { id: 'Service', label: 'Services & Techniques' },
    { id: 'Reviews', label: 'Reviews & Stories' },
    { id: 'Contact', label: 'Contact Us' },
  ];

  // Helper label for active section in floating capsule
  const getDisplayActiveName = () => {
    if (activeNav !== 'Home') {
      const found = navItems.find(item => item.id === activeNav);
      return found ? found.label : activeNav;
    }
    if (activeSection && activeSection !== 'Home') {
      return activeSection;
    }
    return 'Home Sanctuary';
  };

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    
    // If clicking Home and already on Home, smooth scroll to top
    if (id === 'Home' && activeNav === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. TOP HEADER (When at the very top of the page) */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 pointer-events-none px-3 sm:px-6 pt-3 sm:pt-4 ${
          isScrolled 
            ? 'opacity-0 -translate-y-8 pointer-events-none' 
            : 'opacity-100 translate-y-0 pointer-events-auto'
        }`}
      >
        <nav className="mx-auto max-w-6xl w-full bg-[#1c2c19]/90 backdrop-blur-md text-white rounded-full px-4 py-2 sm:px-6 sm:py-2.5 flex items-center justify-between shadow-xl border border-white/15">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('Home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <div className="w-9 h-8 sm:w-11 sm:h-9 flex items-center justify-center overflow-visible">
              <img 
                src={APP_ASSETS.logo} 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = logoImg;
                }}
                alt="Clover Heart Haven Logo" 
                className="w-full h-full object-contain scale-125 group-hover:scale-135 transition-transform duration-300 filter drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white font-['Plus_Jakarta_Sans'] group-hover:text-[#d2dbc8] transition-colors leading-tight">
                Clover Heart Haven
              </span>
              <span className="text-[9px] text-[#a4bc87] font-medium hidden sm:block tracking-wide">
                Holistic Psychological Care
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-xs font-medium transition-all relative py-1 cursor-pointer ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a4bc87] rounded-full animate-fade-in" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onContactClick}
              className="bg-white text-[#1c2c19] hover:bg-[#eef4ea] px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Calendar size={13} className="text-[#3c5d35]" />
              <span>Book Consultation</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-gray-200 hover:text-white rounded-lg focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* 2. MINIMIZED FLOATING STICKY "PILL / CAPSULE" (Follows as you scroll down) */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out pointer-events-auto ${
          !isScrolled 
            ? 'opacity-0 -translate-y-12 pointer-events-none' 
            : isScrollingDown && !isHovered
              ? 'opacity-90 -translate-y-2 scale-95'
              : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <div className="bg-[#1c2c19]/95 backdrop-blur-xl text-white rounded-full p-1.5 sm:p-2 flex items-center gap-2 sm:gap-3 shadow-2xl border border-white/20 hover:border-[#a4bc87]/50 transition-all duration-300 max-w-[95vw]">
          
          {/* Minimized Logo Emblem */}
          <button
            onClick={() => handleNavClick('Home')}
            className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/10 transition-colors group cursor-pointer"
            title="Return to Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center overflow-visible">
              <img 
                src={APP_ASSETS.logo} 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = logoImg;
                }}
                alt="Logo" 
                className="w-full h-full object-contain scale-135 group-hover:rotate-6 transition-transform filter drop-shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-bold text-xs hidden md:inline-block font-['Plus_Jakarta_Sans'] text-white">
              Clover Heart
            </span>
          </button>

          {/* Active Section / Page Indicator Pill (Pie/Capsule badge) */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-[#d2dbc8]">
            <span className="w-2 h-2 rounded-full bg-[#82c974] animate-pulse" />
            <span className="truncate max-w-[130px] sm:max-w-[200px] text-white">
              {getDisplayActiveName()}
            </span>
          </div>

          {/* Quick Nav Pills (Desktop) */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#a4bc87] text-[#1c2c19] shadow-sm font-bold'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.id}
                </button>
              );
            })}
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onContactClick}
            className="bg-white text-[#1c2c19] hover:bg-[#eef4ea] px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Book Now
          </button>

          {/* Mobile Menu Opener on Minimized Bar */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 text-gray-200 hover:text-white rounded-full bg-white/5"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* 3. MOBILE MENU SLIDE-DOWN OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-50 bg-[#1c2c19] text-white rounded-3xl p-5 shadow-2xl border border-white/20 animate-fade-in space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a4bc87]">Navigation Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between ${
                  activeNav === item.id
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {activeNav === item.id && <span className="w-2 h-2 rounded-full bg-[#82c974]" />}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              onContactClick();
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 bg-white text-[#1c2c19] py-3 rounded-2xl text-xs font-bold text-center shadow-lg"
          >
            Book Free Consultation
          </button>
        </div>
      )}
    </>
  );
};
