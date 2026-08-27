import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tag?: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Is Clover therapy?',
    answer:
      'Clover Heart Haven provides access to professional mental-health support through appropriately qualified clinicians. Your consultation will help determine whether our services are appropriate for your needs.',
    tag: 'Clinical Scope',
  },
  {
    id: 'faq-2',
    question: 'Do I have to commit to therapy?',
    answer:
      'No. The initial consultation is designed to help you understand your options and determine whether Clover is a suitable fit.',
    tag: 'Commitment',
  },
  {
    id: 'faq-3',
    question: "What if I don't know what's wrong?",
    answer:
      "That's okay. You don't need a perfect explanation before asking for help. Many people come to us simply feeling overwhelmed or disconnected without knowing the exact root cause.",
    tag: 'Getting Started',
  },
  {
    id: 'faq-4',
    question: 'Is the consultation confidential?',
    answer:
      'Yes, completely. All consultations and clinical records adhere to strict professional confidentiality standards and encrypted health-data privacy regulations.',
    tag: 'Privacy & Security',
  },
  {
    id: 'faq-5',
    question: 'Is this for emergencies?',
    answer:
      'Clover is not an emergency/crisis service. If you are in immediate danger or experiencing a mental-health emergency, contact your local emergency service or crisis resource immediately.',
    tag: 'Crisis Policy',
  },
];

interface FAQSectionProps {
  onOpenConsultation?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenConsultation }) => {
  // First item open by default for immediate preview
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="w-full min-h-screen bg-[#152514] text-[#f4f2e8] flex flex-col justify-center py-20 sm:py-28 md:py-32 px-4 sm:px-6 md:px-12 lg:px-20 relative overflow-hidden select-none border-t border-white/5"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-5 w-[600px] h-[600px] bg-[#22391e]/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-5 w-[500px] h-[500px] bg-[#1a2f18]/45 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle organic noise texture */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-8 border-b border-white/10">
          <div className="max-w-2xl">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase text-[#a4bc87] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#82c974] animate-pulse" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>

            {/* Display Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.15] font-['Plus_Jakarta_Sans']">
              Answers to help you take the next step.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-xs sm:text-sm text-[#d2dbc8]/80 max-w-xs leading-relaxed">
              Have a specific question not listed here? Our clinical team is always ready to guide you.
            </p>
            {onOpenConsultation && (
              <button
                type="button"
                onClick={onOpenConsultation}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#e8ede2] hover:bg-white text-[#132212] text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap"
              >
                <span>Ask Us Directly</span>
                <ArrowUpRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 sm:space-y-5">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-[22px] sm:rounded-[26px] border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-gradient-to-b from-[#22391e]/90 to-[#192b16]/95 border-[#82c974]/40 shadow-xl'
                    : 'bg-[#1a2c17]/60 hover:bg-[#1f341c]/80 border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(item.id)}
                  aria-expanded={isOpen}
                  className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-[#82c974]/80">
                      0{index + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                      {item.question}
                    </h3>
                  </div>

                  <div
                    className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#82c974] text-[#132212] rotate-180 shadow-md'
                        : 'bg-white/10 text-[#d2dbc8] hover:bg-white/20'
                    }`}
                  >
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 sm:px-8 pb-6 sm:pb-7 pt-1 sm:pt-2 pl-14 sm:pl-18 pr-6 sm:pr-12">
                        <p className="text-sm sm:text-base md:text-lg text-[#d2dbc8]/90 leading-relaxed font-normal">
                          {item.answer}
                        </p>
                        {item.tag && (
                          <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-[#a4bc87] uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#82c974]" />
                            <span>{item.tag}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
