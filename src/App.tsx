import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ImpactStatsSection } from './components/ImpactStatsSection';
import { SupportSection } from './components/SupportSection';
import { TherapistSection } from './components/TherapistSection';
import { RealStoriesSection } from './components/RealStoriesSection';
import { MessageSection } from './components/MessageSection';
import { AboutPage } from './components/AboutPage';
import { ServicesPage } from './components/ServicesPage';
import { ReviewsPage } from './components/ReviewsPage';
import { ContactPage } from './components/ContactPage';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { useSmoothScroll } from './hooks/useSmoothScroll';

export default function App() {
  useSmoothScroll();

  const [activeNav, setActiveNav] = useState<string>('Home');
  const [activeSection, setActiveSection] = useState<string>('Home Sanctuary');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState<boolean>(false);
  const [consultationTopic, setConsultationTopic] = useState<string>('Gain Clarity');

  // Track active section on Home page scroll
  useEffect(() => {
    if (activeNav !== 'Home') {
      return;
    }

    const sectionNames: Record<string, string> = {
      home: 'Home Sanctuary',
      impact: 'Impact & Growth',
      support: 'Guidance & Support',
      therapist: 'Dr. Elena & Practice',
      stories: 'Verified Client Stories',
      message: 'Wellness Journey',
    };

    const sectionElements = Object.keys(sectionNames)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            const name = sectionNames[entry.target.id];
            if (name) {
              setActiveSection(name);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-15% 0px -40% 0px',
        threshold: [0.25, 0.5, 0.75],
      }
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      sectionElements.forEach((el) => observer.unobserve(el));
    };
  }, [activeNav]);

  const handleOpenConsultation = (topic?: string) => {
    if (topic) setConsultationTopic(topic);
    setIsConsultationModalOpen(true);
  };

  const handleNavChange = (nav: string) => {
    setActiveNav(nav);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <ImpactStatsSection />
            <SupportSection />
            <TherapistSection />
            <RealStoriesSection />
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
