import React from 'react';
import { 
  Heart, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  MessageSquare,
  Clock,
  Compass
} from 'lucide-react';

interface LandingPageProps {
  onBookConsultation?: (topic?: string) => void;
  onNavigate?: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onBookConsultation,
  onNavigate,
}) => {
  const handleBook = (topic: string = 'Landing Page Private Consultation') => {
    if (onBookConsultation) {
      onBookConsultation(topic);
    }
  };

  return (
    <div className="w-full bg-[#132212] text-[#f4f2e8] min-h-screen pt-24 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 transition-all duration-300 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-0 w-[650px] h-[650px] bg-[#22391e]/40 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-[-10%] w-[600px] h-[600px] bg-[#1a2e18]/40 rounded-full blur-[130px] pointer-events-none" />

      {/* Noise Texture layer */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24 relative z-10">
        {/* Landing Page Hero Header */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-6 sm:pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase text-[#a4bc87]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#82c974] animate-pulse" />
            <span>CLOVER HEART HAVEN LANDING PAGE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-bold text-white tracking-tight leading-[1.12] font-['Plus_Jakarta_Sans']">
            Your Safe Place to Begin Understanding What You Carry.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#d2dbc8]/90 leading-relaxed font-normal max-w-3xl mx-auto">
            Welcome to the Clover Heart Haven dedicated landing page. Ready to be populated with your customized copy, campaign details, and specific focus areas.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => handleBook('Landing Page Direct Booking')}
              className="inline-flex items-center gap-3 bg-[#e8ede2] hover:bg-white text-[#132212] text-xs sm:text-sm md:text-base font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider font-['Plus_Jakarta_Sans'] group"
            >
              <span>BOOK YOUR FREE PRIVATE CLARITY CALL</span>
              <ArrowRight size={18} className="text-[#132212] group-hover:translate-x-1 transition-transform" />
            </button>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('Home')}
                className="inline-flex items-center gap-2 bg-transparent border border-white/25 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold px-6 py-4 rounded-full transition-all cursor-pointer"
              >
                <span>Explore Full Sanctuary</span>
              </button>
            )}
          </div>
        </section>

        {/* Feature / Highlight Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1b2d18]/80 border border-white/10 rounded-[28px] p-8 space-y-4 hover:border-[#82c974]/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#82c974]/20 border border-[#82c974]/30 flex items-center justify-center text-[#82c974]">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Clinical Privacy & Safety
            </h3>
            <p className="text-sm text-[#d2dbc8]/85 leading-relaxed">
              Every consultation is strictly confidential, one-on-one, and guided by qualified mental health practitioners.
            </p>
          </div>

          <div className="bg-[#1b2d18]/80 border border-white/10 rounded-[28px] p-8 space-y-4 hover:border-[#82c974]/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#82c974]/20 border border-[#82c974]/30 flex items-center justify-center text-[#82c974]">
              <Compass size={24} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Paced, Evidence-Based Guidance
            </h3>
            <p className="text-sm text-[#d2dbc8]/85 leading-relaxed">
              No pressure and no rush. We provide compassionate support rooted in modern psychological science.
            </p>
          </div>

          <div className="bg-[#1b2d18]/80 border border-white/10 rounded-[28px] p-8 space-y-4 hover:border-[#82c974]/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#82c974]/20 border border-[#82c974]/30 flex items-center justify-center text-[#82c974]">
              <Calendar size={24} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Free Initial Clarity Call
            </h3>
            <p className="text-sm text-[#d2dbc8]/85 leading-relaxed">
              Understand your options and see whether Clover is the right fit without long-term commitments.
            </p>
          </div>
        </section>

        {/* Content Placeholder Area */}
        <section className="bg-gradient-to-b from-[#21351e]/80 to-[#192b16]/90 border border-white/15 rounded-[32px] p-8 sm:p-12 md:p-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#a4bc87]">
            <Sparkles size={14} /> Ready For Custom Copy
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
            Landing Page Section Ready
          </h2>
          <p className="text-sm sm:text-base text-[#d2dbc8]/90 max-w-2xl mx-auto leading-relaxed">
            Whenever you're ready, provide the specific headlines, copy, bullet points, or visual assets you would like placed on this landing page.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleBook('Landing Page Consultation')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#132212] font-bold text-sm hover:bg-[#eef4ea] transition-all shadow-lg hover:scale-105 cursor-pointer"
            >
              <span>Get in Touch</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
