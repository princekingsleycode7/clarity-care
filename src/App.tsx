import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ImpactStatsSection } from './components/ImpactStatsSection';
import { SupportSection } from './components/SupportSection';
import { WhatWeHelpWithSection } from './components/WhatWeHelpWithSection';
import { TherapistSection } from './components/TherapistSection';
import { BookingProcessSection } from './components/BookingProcessSection';
import { TransitionShowcaseSection } from './components/TransitionShowcaseSection';
import { RealStoriesSection } from './components/RealStoriesSection';
import { FAQSection } from './components/FAQSection';
import { MessageSection } from './components/MessageSection';
import { AboutPage } from './components/AboutPage';
import { ServicesPage } from './components/ServicesPage';
import { ReviewsPage } from './components/ReviewsPage';
import { ContactPage } from './components/ContactPage';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { AdminDashboard } from './components/AdminDashboard';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useAnalyticsTracker } from './hooks/useAnalyticsTracker';

// Helper to determine initial nav tab from current URL pathname
const getNavFromPath = (path: string): string => {
  const cleanPath = path.toLowerCase().replace(/\/$/, '');
  if (cleanPath === '/admin' || cleanPath === '/admin-dashboard') return 'Admin';
  if (cleanPath === '/landing-page' || cleanPath === '/landing') return 'LandingPage';
  if (cleanPath === '/about' || cleanPath === '/about-doctor') return 'About';
  if (cleanPath === '/services' || cleanPath === '/service' || cleanPath === '/techniques') return 'Service';
  if (cleanPath === '/reviews' || cleanPath === '/stories') return 'Reviews';
  if (cleanPath === '/contact' || cleanPath === '/book') return 'Contact';
  return 'Home';
};

const getPathFromNav = (nav: string): string => {
  switch (nav) {
    case 'Admin': return '/admin';
    case 'LandingPage': return '/landing-page';
    case 'About': return '/about';
    case 'Service': return '/services';
    case 'Reviews': return '/reviews';
    case 'Contact': return '/contact';
    default: return '/';
  }
};

export default function App() {
  useSmoothScroll();
  useAnalyticsTracker();

  const [activeNav, setActiveNav] = useState<string>(() => {
    return getNavFromPath(window.location.pathname);
  });
  const [activeSection, setActiveSection] = useState<string>('Home Sanctuary');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState<boolean>(false);
  const [consultationTopic, setConsultationTopic] = useState<string>('Gain Clarity');

  // Handle browser forward/back buttons and URL routing
  useEffect(() => {
    const handlePopState = () => {
      setActiveNav(getNavFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track active section on Home page scroll with high precision
  useEffect(() => {
    if (activeNav !== 'Home') {
      return;
    }

    const sections: { id: string; name: string }[] = [
      { id: 'home', name: 'Home Sanctuary' },
      { id: 'impact', name: 'Impact & Growth' },
      { id: 'method', name: 'The Clover Method' },
      { id: 'what-we-help-with', name: 'What We Help With' },
      { id: 'therapist', name: 'Dr. Elena & Practice' },
      { id: 'booking-process', name: 'What Happens When You Book' },
      { id: 'healing', name: 'Healing & Clarity' },
      { id: 'stories', name: '45 Client Stories' },
      { id: 'faq', name: 'Frequently Asked Questions' },
      { id: 'message', name: 'Feeling Better' },
    ];

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const viewportHeight = window.innerHeight;
          const scrollBottom = scrollY + viewportHeight;
          const docHeight = document.documentElement.scrollHeight;

          // If at the very top of the page
          if (scrollY < 120) {
            setActiveSection('Home Sanctuary');
            ticking = false;
            return;
          }

          // If at the very bottom of the page
          if (scrollBottom >= docHeight - 80) {
            setActiveSection('Feeling Better');
            ticking = false;
            return;
          }

          // Focus line at 38% down the viewport
          const focusLine = viewportHeight * 0.38;

          let currentActiveName = 'Home Sanctuary';
          let found = false;

          for (const s of sections) {
            const el = document.getElementById(s.id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= focusLine && rect.bottom > focusLine) {
                currentActiveName = s.name;
                found = true;
                break;
              }
            }
          }

          // Fallback if between sections
          if (!found) {
            let maxOverlap = 0;
            for (const s of sections) {
              const el = document.getElementById(s.id);
              if (el) {
                const rect = el.getBoundingClientRect();
                const visibleTop = Math.max(0, rect.top);
                const visibleBottom = Math.min(viewportHeight, rect.bottom);
                const overlap = Math.max(0, visibleBottom - visibleTop);
                if (overlap > maxOverlap) {
                  maxOverlap = overlap;
                  currentActiveName = s.name;
                }
              }
            }
          }

          setActiveSection(currentActiveName);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeNav]);

  const handleOpenConsultation = (topic?: string) => {
    if (topic) setConsultationTopic(topic);
    setIsConsultationModalOpen(true);
  };

  const handleNavChange = (nav: string) => {
    setActiveNav(nav);
    const targetPath = getPathFromNav(nav);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If viewing the unlinked /admin route, display the standalone Admin Dashboard
  if (activeNav === 'Admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-[#e4e9df] antialiased selection:bg-[#1c2c19] selection:text-white overflow-x-hidden font-['Plus_Jakarta_Sans']">
      {/* Global Persistent Floating & Minimized Capsule Navbar */}
      <Navbar
        onContactClick={() => handleOpenConsultation('Free Initial Consultation')}
        activeNav={activeNav}
        setActiveNav={handleNavChange}
        activeSection={activeSection}
      />

      {/* Main Content Router View */}
      <main className="w-full">
        {activeNav === 'Home' && (
          <div className="w-full">
            <Hero 
              onOpenConsultation={handleOpenConsultation}
              onNavigate={handleNavChange}
            />
            <ImpactStatsSection onOpenConsultation={() => handleOpenConsultation('Talk To Someone - Clarity Consultation')} />
            <SupportSection />
            <WhatWeHelpWithSection />
            <TherapistSection />
            <BookingProcessSection onOpenConsultation={() => handleOpenConsultation('Booking Consultation Process')} />
            <TransitionShowcaseSection onOpenConsultation={() => handleOpenConsultation('Clarity Consultation')} />
            <RealStoriesSection />
            <FAQSection onOpenConsultation={() => handleOpenConsultation('FAQ Inquiry - Private Consultation')} />
            <MessageSection />
          </div>
        )}

        {activeNav === 'About' && (
          <AboutPage 
            onBookConsultation={() => handleOpenConsultation('About Dr. Elena Vance Consultation')}
            onNavigate={handleNavChange}
          />
        )}

        {activeNav === 'Service' && (
          <ServicesPage 
            onBookConsultation={() => handleOpenConsultation('Specialized Therapy Inquiry')}
            onNavigate={handleNavChange}
          />
        )}

        {activeNav === 'Reviews' && (
          <ReviewsPage 
            onBookConsultation={() => handleOpenConsultation('Consultation Request from Reviews')}
            onNavigate={handleNavChange}
          />
        )}

        {activeNav === 'LandingPage' && (
          <LandingPage 
            onBookConsultation={handleOpenConsultation}
            onNavigate={handleNavChange}
          />
        )}

        {activeNav === 'Contact' && (
          <ContactPage 
            onScheduleSuccess={() => setIsConsultationModalOpen(false)}
            onOpenOnboarding={() => handleOpenConsultation('Contact Hub Cal.com Booking')}
          />
        )}
      </main>

      {/* Global Comprehensive Footer with connected navigation */}
      <Footer onNavigate={handleNavChange} />

      {/* Global Instant Booking & Consultation Modal */}
      <ContactModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        initialTopic={consultationTopic}
      />
    </div>
  );
}
