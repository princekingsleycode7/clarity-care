import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, X, Sliders } from 'lucide-react';
import { getStoredCookiePreferences, saveStoredCookiePreferences, CookiePreferencesState } from './CookiesPage';

interface CookieBannerProps {
  onNavigateToCookies: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigateToCookies }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made an explicit cookie choice
    try {
      const stored = localStorage.getItem('clover_cookie_preferences');
      if (!stored) {
        // Small delay so it does not abruptly pop in on initial frame
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignored
    }
  }, []);

  const handleAcceptAll = () => {
    const allOn: CookiePreferencesState = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    saveStoredCookiePreferences(allOn);
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    const essentialOnly: CookiePreferencesState = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    saveStoredCookiePreferences(essentialOnly);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Cookie consent banner" className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-400">
      <div className="p-4 sm:p-5 rounded-2xl bg-[#142213] text-white border border-[#2e472a] shadow-2xl backdrop-blur-md space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b4c898]">
            <Cookie size={16} className="text-[#a4bc87]" />
            Your Privacy & Cookies
          </div>
          <button
            onClick={handleEssentialOnly}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss and keep essential only"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-[#cfdec8] leading-relaxed">
          We use strictly necessary cookies to keep our sanctuary secure. With your permission, we also use optional cookies to remember your timezone and understand how our resources help you.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleAcceptAll}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#d2dbc8] hover:bg-white text-[#1c2c19] text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap text-center"
          >
            Accept All
          </button>
          <button
            onClick={handleEssentialOnly}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#1e301d] hover:bg-[#283e24] border border-[#2e472a] text-[#b4c898] hover:text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap text-center"
          >
            Essential Only
          </button>
          <button
            onClick={() => {
              setIsVisible(false);
              onNavigateToCookies();
            }}
            className="w-full sm:w-auto px-2 py-1 text-xs text-[#a4bc87] hover:text-white underline transition-colors cursor-pointer text-center sm:text-left flex items-center justify-center gap-1"
          >
            <Sliders size={12} />
            Customize
          </button>
        </div>
      </div>
    </aside>
  );
};
