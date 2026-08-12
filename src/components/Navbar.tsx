import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onContactClick: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onContactClick,
  activeNav,
  setActiveNav,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'Home', label: 'Home' },
    { id: 'About', label: 'About' },
    { id: 'Service', label: 'Service' },
    { id: 'Reviews', label: 'Reviews' },
  ];

  return (
    <header className="relative w-full z-30 pt-1 sm:pt-1.5 px-2 sm:px-4">
      <nav className="mx-auto max-w-5xl w-full bg-[#1c2c19]/90 backdrop-blur-md text-white rounded-full px-3.5 py-1 sm:px-5 sm:py-1.5 flex items-center justify-between shadow-lg border border-white/10 transition-all duration-300">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveNav('Home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-5 h-5 flex items-center justify-center text-[#d2dbc8] group-hover:rotate-12 transition-transform duration-300">
            <svg 
              className="w-4 h-4" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 3C9.5 3 7.5 5 7.5 7.5C7.5 10 12 12 12 12C12 12 16.5 10 16.5 7.5C16.5 5 14.5 3 12 3Z" fill="#d2dbc8" fillOpacity="0.2"/>
              <path d="M12 21C9.5 21 7.5 19 7.5 16.5C7.5 14 12 12 12 12C12 12 16.5 14 16.5 16.5C16.5 19 14.5 21 12 21Z" fill="#d2dbc8" fillOpacity="0.2"/>
              <path d="M3 12C3 9.5 5 7.5 7.5 7.5C10 7.5 12 12 12 12C12 12 10 16.5 7.5 16.5C5 16.5 3 14.5 3 12Z" fill="#d2dbc8" fillOpacity="0.2"/>
              <path d="M21 12C21 9.5 19 7.5 16.5 7.5C14 7.5 12 12 12 12C12 12 14 16.5 16.5 16.5C19 16.5 21 14.5 21 12Z" fill="#d2dbc8" fillOpacity="0.2"/>
            </svg>
          </div>
          <span className="font-semibold text-xs sm:text-sm tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Clarity Care
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`text-xs font-medium transition-all relative py-0.5 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d2dbc8] rounded-full animate-fade-in" />
                )}
              </button>
            );
          })}
        </div>

        {/* Contact Us Button */}
        <div className="hidden sm:block">
          <button
            onClick={onContactClick}
            className="bg-white text-[#1c2c19] hover:bg-[#eef4ea] px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer"
          >
            Contact Us
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onContactClick}
            className="sm:hidden bg-white text-[#1c2c19] px-3.5 py-1.5 rounded-full text-xs font-semibold"
          >
            Contact
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-gray-200 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-5xl bg-[#1c2c19] text-white rounded-2xl p-4 shadow-2xl border border-white/10 flex flex-col gap-3 animate-fade-in">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                setMobileMenuOpen(false);
              }}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeNav === item.id
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onContactClick();
              setMobileMenuOpen(false);
            }}
            className="w-full mt-1 bg-white text-[#1c2c19] py-2.5 rounded-xl text-sm font-semibold text-center"
          >
            Contact Us
          </button>
        </div>
      )}
    </header>
  );
};
