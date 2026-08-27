import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Ear, Stethoscope, Compass, Sparkles, ArrowRight } from 'lucide-react';
import ShinyText from './ShinyText';

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const STEPS: ProcessStep[] = [
  {
    number: '01',
    title: "You tell us what's going on",
    description: 'No perfect explanation required.',
    icon: MessageSquare,
  },
  {
    number: '02',
    title: 'We listen',
    description: 'Your experience is heard without judgment.',
    icon: Ear,
  },
  {
    number: '03',
    title: 'We understand your needs',
    description: "A qualified clinician determines whether Clover's services are appropriate for you.",
    icon: Stethoscope,
  },
  {
    number: '04',
    title: 'You decide your next step',
    description: "If ongoing therapy is appropriate, you'll discuss the available options.",
    icon: Compass,
  },
  {
    number: '05',
    title: 'You begin your work',
    description: 'At your pace, within the appropriate professional framework.',
    icon: Sparkles,
  },
];

interface BookingProcessSectionProps {
  onOpenConsultation?: () => void;
}

export const BookingProcessSection: React.FC<BookingProcessSectionProps> = ({ onOpenConsultation }) => {
  return (
    <section
      id="booking-process"
      className="w-full bg-[#182916] text-[#f4f2e8] py-20 sm:py-28 md:py-32 px-4 sm:px-6 md:px-12 lg:px-20 relative overflow-hidden select-none border-t border-white/5"
    >
      {/* Ambient background glows */}
      <div className="absolute top-10 right-[-10%] w-[600px] h-[600px] bg-[#2a4524]/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-[-10%] w-[500px] h-[500px] bg-[#122011]/60 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Noise Texture Layer */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 sm:mb-20 pb-8 border-b border-white/10">
          <div className="max-w-2xl">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase text-[#a4bc87] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#82c974] animate-pulse" />
              <span>THE CONSULTATION JOURNEY</span>
            </div>

            {/* Display Title with ShinyText Effect */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.15] font-['Plus_Jakarta_Sans']">
              <ShinyText
                text="What happens when you book?"
                speed={2.5}
                delay={0.5}
                color="#f4f2e8"
                shineColor="#82c974"
                spread={120}
                direction="left"
                yoyo={false}
                pauseOnHover={false}
              />
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-xs sm:text-sm text-[#d2dbc8]/80 max-w-xs leading-relaxed">
              Clear, transparent, and completely free of pressure from your very first conversation.
            </p>
            {onOpenConsultation && (
              <button
                type="button"
                onClick={onOpenConsultation}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#e8ede2] hover:bg-white text-[#132212] text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 cursor-pointer whitespace-nowrap"
              >
                <span>Book Call</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Steps Grid / Pathway */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative bg-gradient-to-b from-[#21351e]/80 to-[#192b16]/90 border border-white/10 hover:border-[#82c974]/40 rounded-[24px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
              >
                <div>
                  {/* Top row: Number and Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-sm sm:text-base font-bold text-[#82c974] tracking-wider">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[#d2dbc8] group-hover:bg-[#82c974] group-hover:text-[#132212] transition-colors duration-300">
                      <Icon size={18} />
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug font-['Plus_Jakarta_Sans'] mb-3">
                    {step.title}
                  </h3>
                </div>

                {/* Step Description */}
                <p className="text-xs sm:text-sm text-[#d2dbc8]/85 leading-relaxed font-normal pt-2 border-t border-white/5">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BookingProcessSection;
