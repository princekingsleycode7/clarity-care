import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface TransitionShowcaseSectionProps {
  onOpenConsultation?: () => void;
}

const SECTION_IMAGE_URL = 'https://res.cloudinary.com/dsgk1zlj1/image/upload/v1787864598/Gemini_Generated_Image_7ksg0w7ksg0w7ksg_anl1fz.jpg';

export const TransitionShowcaseSection: React.FC<TransitionShowcaseSectionProps> = ({ onOpenConsultation }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Smooth scroll parallax and reveal effect
      gsap.fromTo(
        textContainerRef.current,
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 0.6,
          },
          y: 0,
          opacity: 1,
          ease: 'power2.out',
        }
      );

      // Parallax zoom and expand on image
      gsap.fromTo(
        imageRef.current,
        { scale: 1.12, y: 20 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          scale: 1.0,
          y: -20,
          ease: 'none',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="healing"
      ref={sectionRef}
      className="w-full min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#132212] text-[#f4f2e8] select-none"
    >
      {/* Subtle Noise Texture Layer */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-[#233a1e]/45 rounded-full blur-[120px] pointer-events-none" />

      {/* TOP PART: Centered Headline, Narrative Block & CTA */}
      <div
        ref={textContainerRef}
        className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-10 text-center flex flex-col items-center"
      >
        {/* Main Display Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.15] font-['Plus_Jakarta_Sans'] mb-6 sm:mb-8 max-w-3xl">
          Clover doesn't tell you to “get over it.”
        </h2>

        {/* Narrative Lines */}
        <div className="space-y-2.5 sm:space-y-3.5 text-base sm:text-lg md:text-xl text-[#d2dbc8]/90 max-w-2xl leading-relaxed font-normal mb-8 sm:mb-10">
          <p className="text-white/95 font-medium">
            We understand that healing isn't a switch.
          </p>
          <p className="text-[#c1ceb6]">
            Some days you'll feel okay.
          </p>
          <p className="text-[#c1ceb6]">
            Some days a memory can bring everything back.
          </p>
          <p className="text-[#c1ceb6]">
            Some days you'll wonder whether you're actually making progress.
          </p>
          <p className="pt-2 text-white/95 font-medium">
            That's why Clover isn't about pretending you don't care anymore.
          </p>
          <p className="text-[#e2ebd9] font-medium">
            It's about helping you understand yourself well enough to stop being controlled by the pain.
          </p>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onOpenConsultation}
          className="inline-flex items-center gap-3 bg-[#e8ede2] hover:bg-white text-[#132212] text-xs sm:text-sm md:text-base font-bold px-8 py-4 sm:px-9 sm:py-4.5 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98] cursor-pointer tracking-wider font-['Plus_Jakarta_Sans'] group uppercase"
        >
          <span>I'M READY TO BEGIN</span>
          <ArrowRight size={18} className="text-[#132212] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* BOTTOM PART: Full-Width Image with Seamless Top Fade */}
      <div
        ref={imageWrapperRef}
        className="relative w-full h-[45vh] sm:h-[50vh] md:h-[55vh] overflow-hidden flex items-end justify-center z-10 mt-4"
      >
        {/* The Cloudinary Image */}
        <img
          ref={imageRef}
          src={SECTION_IMAGE_URL}
          alt="Clover Heart Haven Sanctuary"
          className="absolute inset-0 w-full h-full object-cover object-center will-change-transform"
          referrerPolicy="no-referrer"
        />

        {/* Seamless Smooth Gradient Overlay (Fading from solid dark green top into the photo) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#132212] via-[#132212]/75 via-25% to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#132212]/80 to-transparent pointer-events-none" />
      </div>
    </section>
  );
};

export default TransitionShowcaseSection;
