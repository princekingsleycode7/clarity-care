import React, { useState, useEffect, useRef } from 'react';
import therapistImg from '../assets/images/licensed_therapist_session_1786464568739.jpg';
import { ContactModal } from './ContactModal';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  fullReview: string;
  rating: number;
}

export const TherapistSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredTestimonial, setHoveredTestimonial] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left image & Google rating badge
      gsap.fromTo(
        '.therapist-image-box',
        { x: -30, opacity: 0, scale: 0.96 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );

      // Right column elements
      gsap.fromTo(
        '.therapist-content > *',
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );

      // Bottom ticker
      gsap.fromTo(
        '.therapist-ticker',
        { y: 20, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'bottom 90%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          clearProps: 'all',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      quote: '"GAME CHANGER FOR YOUR ENERGY AND HEALTH"',
      author: 'INES K.',
      role: 'Verified Client',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      fullReview: 'Clarity Care changed my daily routine and mental clarity completely. My therapist is attentive and deeply empathetic.',
      rating: 5,
    },
    {
      id: 2,
      quote: '"IT WORKS!"',
      author: 'SAMSARA L.',
      role: 'Verified Client',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      fullReview: 'I was hesitant at first, but having private sessions at my own pace made all the difference.',
      rating: 5,
    },
    {
      id: 3,
      quote: '"TRANSFORMATIVE CARE FOR MY MIND AND PEACE"',
      author: 'MARCUS P.',
      role: 'Verified Client',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      fullReview: 'A safe space to discuss anxiety and life goals. Truly transformative guidance.',
      rating: 5,
    },
    {
      id: 4,
      quote: '"BEST THERAPY EXPERIENCE EVER"',
      author: 'CLARA M.',
      role: 'Verified Client',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      fullReview: 'Compassionate, flexible, and completely confidential. I recommend Clarity Care to everyone.',
      rating: 5,
    },
  ];

  return (
    <section ref={sectionRef} className="w-full bg-[#f4f2e8] text-[#1f1a14] py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12 lg:px-16 border-t border-[#e2decb] overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* LEFT COLUMN: Therapist Image with Floating Google Rating */}
        <div className="lg:col-span-6 w-full flex justify-center lg:justify-start relative order-2 lg:order-1">
          <div className="therapist-image-box relative w-full max-w-lg lg:max-w-none aspect-[1.15/1] sm:aspect-[1.2/1] rounded-[32px] sm:rounded-[44px] overflow-hidden shadow-xl border border-black/5">
            <img
              src={therapistImg}
              alt="Licensed therapist listening attentively"
              className="w-full h-full object-cover object-center"
            />

            {/* Floating Google Rating Badge */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-100 flex items-center gap-3 animate-fade-in">
              {/* Google Colored 'G' Icon */}
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 p-1">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Google Rating
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-bold text-slate-900">4.9</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Reviews, Headline, Text, Buttons */}
        <div className="therapist-content lg:col-span-6 flex flex-col items-start pr-0 lg:pl-4 order-1 lg:order-2">
          {/* Avatar stack & Star Rating */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f4f2e8] object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt="Client avatar"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f4f2e8] object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                alt="Client avatar"
              />
              <img
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[#f4f2e8] object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                alt="Client avatar"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 text-[#1f1a14]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-[#1f1a14] text-[#1f1a14]" />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-[#5a554a] mt-0.5 block">
                4.9/5 based on 2k reviews
              </span>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-bold text-[#1f1a14] tracking-tight leading-[1.08] font-['Plus_Jakarta_Sans'] mb-4 sm:mb-5">
            Talk to a licensed therapist privately at your own pace.
          </h2>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-[#4f5649] font-normal leading-relaxed mb-8 max-w-lg">
            Support for stress, anxiety, and life challenges — without judgment. No hotline feel. Just a conversation that meets you where you are.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#ff4a1c] hover:bg-[#e23b10] text-white text-xs sm:text-sm font-bold px-6 py-3.5 sm:px-7 sm:py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              BOOK A SESSION
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-transparent hover:bg-[#1c2c19]/5 text-[#1c2c19] border border-[#1c2c19] text-xs sm:text-sm font-bold px-6 py-3.5 sm:px-7 sm:py-3.5 rounded-xl transition-all duration-200 cursor-pointer uppercase tracking-wider"
            >
              BROWSE THERAPIST
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Ticker / Trusted Banner with Popping Review Cards */}
      <div className="therapist-ticker max-w-7xl mx-auto mt-12 sm:mt-16 pt-6 border-t border-[#e0dac7] flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-semibold text-[#5a554a]">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5 text-[#1f1a14]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="fill-[#1f1a14] text-[#1f1a14]" />
            ))}
          </div>
          <span className="uppercase tracking-wider text-[11px] sm:text-xs">
            10765+ TRUSTED THERAPIST
          </span>
        </div>

        {/* Testimonials Interactive Hover Items */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3 text-[11px] sm:text-xs text-[#6e685a] uppercase tracking-wider">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="relative group cursor-pointer py-1 px-2 rounded-lg transition-colors hover:bg-[#1c2c19]/5"
              onMouseEnter={() => setHoveredTestimonial(t.id)}
              onMouseLeave={() => setHoveredTestimonial(null)}
            >
              <div className="flex items-center gap-1.5">
                {/* Micro avatar thumbnail */}
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-[#1c2c19]/30 transition-transform group-hover:scale-125"
                />
                <span className="text-[#1f1a14] font-medium group-hover:text-[#ff4a1c] transition-colors">
                  {t.quote}
                </span>
                <span className="text-[#888273] font-normal">
                  {t.author}
                </span>
              </div>

              {/* Animated Pop-over Card on Hover */}
              <AnimatePresence>
                {hoveredTestimonial === t.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.75, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 6 }}
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 22,
                      mass: 0.8,
                    }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-64 sm:w-72 bg-[#1c2c19] text-white p-4 rounded-2xl shadow-2xl border border-white/20 z-50 pointer-events-none"
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <img
                        src={t.avatar}
                        alt={t.author}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-[#d2dbc8] shadow-md shrink-0"
                      />
                      <div>
                        <div className="font-bold text-xs text-white font-['Plus_Jakarta_Sans']">
                          {t.author}
                        </div>
                        <div className="text-[10px] text-[#d2dbc8] font-medium">
                          {t.role}
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5 text-amber-400">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-200 leading-snug font-normal normal-case tracking-normal bg-white/5 p-2.5 rounded-xl border border-white/10">
                      {t.fullReview}
                    </p>

                    {/* Arrow Pointer */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#1c2c19]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTopic="General Therapy"
      />
    </section>
  );
};

