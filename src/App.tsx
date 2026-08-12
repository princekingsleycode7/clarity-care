import { Hero } from './components/Hero';
import { ImpactStatsSection } from './components/ImpactStatsSection';
import { SupportSection } from './components/SupportSection';
import { TherapistSection } from './components/TherapistSection';
import { RealStoriesSection } from './components/RealStoriesSection';
import { MessageSection } from './components/MessageSection';
import { Footer } from './components/Footer';
import { useSmoothScroll } from './hooks/useSmoothScroll';

export default function App() {
  useSmoothScroll();

  return (
    <main className="min-h-screen bg-[#e4e9df] antialiased selection:bg-[#1c2c19] selection:text-white overflow-x-hidden">
      <Hero />
      <ImpactStatsSection />
      <SupportSection />
      <TherapistSection />
      <RealStoriesSection />
      <MessageSection />
      <Footer />
    </main>
  );
}

