import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CloverStep {
  number: string;
  stepTotal: string;
  tag: string;
  title: string;
  description: string;
}

const CLOVER_STEPS: CloverStep[] = [
  {
    number: '01',
    stepTotal: '01 / 05',
    tag: '01 — UNDERSTAND',
    title: 'Understand.',
    description: "Understand what you're feeling instead of judging yourself for feeling it.",
  },
  {
    number: '02',
    stepTotal: '02 / 05',
    tag: '02 — REGULATE',
    title: 'Regulate.',
    description: "Learn ways to create more emotional calm when you're overwhelmed.",
  },
  {
    number: '03',
    stepTotal: '03 / 05',
    tag: '03 — DETACH',
    title: 'Detach.',
    description: 'Begin loosening unhealthy emotional patterns without forcing yourself to “stop caring.”',
  },
  {
    number: '04',
    stepTotal: '04 / 05',
    tag: '04 — REBUILD',
    title: 'Rebuild.',
    description: 'Reconnect with your identity, boundaries and self-worth.',
  },
  {
    number: '05',
    stepTotal: '05 / 05',
    tag: '05 — RECONNECT',
    title: 'Reconnect.',
    description: "Begin building a relationship with yourself that doesn't depend on someone else's attention.",
  },
];

// Duplicate steps for seamless continuous loop
const DISPLAY_STEPS = [...CLOVER_STEPS, ...CLOVER_STEPS, ...CLOVER_STEPS];

export const SupportSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollLeftStart = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header entrance animation
      gsap.fromTo(
        '.clover-header > *',
        { y: 35, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );

      // Cards container entrance
      gsap.fromTo(
        '.clover-cards-container',
        { y: 45, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Smooth infinite auto-scroll logic
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let speed = 0.65; // pixels per frame

    const autoScroll = () => {
      if (!isPaused && !isDragging && track) {
        track.scrollLeft += speed;

        // Reset scroll position for seamless infinite looping
        const maxScroll = track.scrollWidth / 3;
        if (track.scrollLeft >= maxScroll * 2) {
          track.scrollLeft -= maxScroll;
        } else if (track.scrollLeft <= 0) {
          track.scrollLeft += maxScroll;
        }
      }
      animationFrameId.current = requestAnimationFrame(autoScroll);
    };

    animationFrameId.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPaused, isDragging]);

  // Mouse Drag / Touch Swipe Handlers for manual horizontal control without buttons
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    dragStartX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftStart.current = trackRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5; // Drag sensitivity
    trackRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <section
      id="method"
      ref={sectionRef}
      className="w-full bg-[#182916] text-[#f4f2e8] py-16 sm:py-24 md:py-28 overflow-hidden transition-colors duration-300 relative select-none"
    >
      {/* Subtle ambient light gradient in top right */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2b4427]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#132212]/70 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Header Block */}
        <div className="clover-header max-w-3xl mb-12 sm:mb-16">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold tracking-widest uppercase text-[#a4bc87] mb-4 sm:mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#82c974] animate-pulse" />
            <span>THE CLOVER METHOD</span>
          </div>

          {/* Main Display Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[62px] font-bold text-white tracking-tight leading-[1.1] font-['Plus_Jakarta_Sans']">
            We don't believe healing should feel like another performance.
          </h2>
        </div>
      </div>

      {/* Horizontal Carousel Track - Full View Width */}
      <div className="clover-cards-container w-full relative">
        <div
          ref={trackRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            handleMouseUpOrLeave();
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className={`flex gap-5 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-none px-4 sm:px-8 md:px-12 py-4 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {DISPLAY_STEPS.map((step, idx) => (
            <div
              key={`${step.number}-${idx}`}
              className="group shrink-0 w-[85vw] sm:w-[360px] md:w-[410px] lg:w-[440px] h-[380px] sm:h-[420px] md:h-[450px] rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 md:p-9 bg-gradient-to-b from-[#233a1e]/90 via-[#1c2e18]/95 to-[#152312] border border-white/10 hover:border-[#82c974]/40 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle top inner highlight */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

              {/* Card Top Row: Tag & Counter */}
              <div className="flex items-center justify-between text-xs font-mono font-semibold tracking-wider text-[#a4bc87]/80">
                <span className="uppercase">{step.tag}</span>
                <span className="text-white/40">{step.stepTotal}</span>
              </div>

              {/* Card Center: Massive Headline Stat / Step Number */}
              <div className="my-auto py-3">
                <div className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white tracking-tight leading-none font-['Plus_Jakarta_Sans'] group-hover:text-[#a4bc87] transition-colors duration-300">
                  {step.number}
                </div>
              </div>

              {/* Card Bottom: Title & Descriptive Copy */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl md:text-[26px] font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-[#d2dbc8]/85 font-normal leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
