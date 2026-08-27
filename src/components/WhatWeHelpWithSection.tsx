import React from 'react';
import ScrollFloat from './ScrollFloat';
import ScrollReveal from './ScrollReveal';

export const WhatWeHelpWithSection: React.FC = () => {
  return (
    <section
      id="what-we-help-with"
      className="w-full bg-[#182916] text-[#f4f2e8] min-h-screen flex flex-col justify-center items-center py-24 sm:py-32 md:py-40 px-4 sm:px-6 md:px-12 lg:px-20 relative overflow-hidden select-none border-t border-white/5"
    >
      {/* Ambient background soft light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#233a1e]/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full flex flex-col items-center text-center relative z-10">
        {/* Centered Large Block of Text */}
        <div className="w-full max-w-5xl mx-auto space-y-8 sm:space-y-10">
          <div className="w-full">
            <ScrollFloat
              animationDuration={1.2}
              ease="back.inOut(2)"
              scrollStart="top bottom-=10%"
              scrollEnd="bottom center"
              stagger={0.02}
              containerClassName="w-full"
              textClassName="text-3xl sm:text-5xl md:text-6xl lg:text-[66px] xl:text-[72px] font-bold text-white tracking-tight leading-[1.12] font-['Plus_Jakarta_Sans'] uppercase text-center"
            >
              YOU DON'T HAVE TO HAVE EVERYTHING FIGURED OUT BEFORE ASKING FOR HELP.
            </ScrollFloat>
          </div>

          <p className="text-lg sm:text-xl md:text-2xl text-[#a4bc87] font-medium tracking-tight">
            Clover can speak to areas such as:
          </p>

          <div className="w-full">
            <ScrollReveal
              baseOpacity={0}
              enableBlur={true}
              baseRotation={5}
              blurStrength={10}
              containerClassName="w-full"
              textClassName="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-normal text-[#d2dbc8] leading-[1.6] sm:leading-[1.65] font-['Plus_Jakarta_Sans'] text-center"
            >
              Heartbreak & relationship transitions, Emotional overwhelm, Overthinking, Self-worth struggles, Attachment-related relationship patterns, Difficulty letting go, Loneliness, Relationship anxiety, Boundaries, and Rebuilding after emotionally difficult relationships.
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
