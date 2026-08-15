import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Grid, X, Heart, TrendingUp } from 'lucide-react';
import { TESTIMONIALS_45, TestimonialPerson } from '../data/testimonialsData';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const RealStoriesSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header & controls
      gsap.fromTo(
        '.stories-header',
        { y: 25, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );

      // Category filters
      gsap.fromTo(
        '.stories-categories > *',
        { y: 15, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
          },
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 0.6,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );

      // Story Cards
      gsap.fromTo(
        '.stories-card',
        { y: 30, opacity: 0, scale: 0.97 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const categories = ['All', 'Anxiety & Stress', 'Sleep & Vitality', 'Trauma & Recovery', 'Relationships', 'Burnout & Focus'];

  // Filtered stories based on category and search query
  const filteredStories = useMemo(() => {
    return TESTIMONIALS_45.filter((person) => {
      const matchesCategory = selectedCategory === 'All' || person.category === selectedCategory;
      const matchesSearch =
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.quote.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Ensure currentIndex stays within bounds when filters change
  useEffect(() => {
    if (currentIndex >= filteredStories.length) {
      setCurrentIndex(0);
    }
  }, [filteredStories, currentIndex]);

  const currentPerson: TestimonialPerson = filteredStories[currentIndex] || TESTIMONIALS_45[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredStories.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === filteredStories.length - 1 ? 0 : prev + 1));
  };

  const selectPersonById = (id: number) => {
    const idx = filteredStories.findIndex((p) => p.id === id);
    if (idx !== -1) {
      setCurrentIndex(idx);
    } else {
      setSelectedCategory('All');
      const globalIdx = TESTIMONIALS_45.findIndex((p) => p.id === id);
      if (globalIdx !== -1) {
        setCurrentIndex(globalIdx);
      }
    }
    setIsGridModalOpen(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGridModalOpen) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGridModalOpen, filteredStories]);

  return (
    <section 
      id="stories"
      ref={sectionRef} 
      className="relative w-full min-h-screen lg:h-screen lg:max-h-screen bg-[#142213] text-white p-3.5 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between transition-colors duration-300 overflow-visible lg:overflow-hidden"
    >
      {/* Background Ambient Green Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2a4227]/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full h-full relative z-10 flex flex-col justify-between my-auto">
        {/* Top Section Header with Controls */}
        <div className="stories-header flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2 sm:mb-3 shrink-0">
          <div>
            {/* Category Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#233821] text-[#b4c898] text-[10px] sm:text-xs font-semibold mb-1 border border-[#355231]">
              <TrendingUp size={12} className="text-[#a4bc87]" />
              <span>45 VERIFIED CLIENT STORIES</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-['Plus_Jakarta_Sans']">
              Real stories. Real health improvements.
            </h2>
          </div>

          {/* Navigation Controls & View All Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsGridModalOpen(true)}
              className="bg-[#21351e] hover:bg-[#2e4c2a] text-[#d2dbc8] hover:text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold border border-[#355231] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Grid size={13} />
              <span className="hidden xs:inline">Browse All 45</span>
              <span className="xs:hidden">All 45</span>
            </button>

            <div className="flex items-center gap-1.5 bg-[#1c2d1b] p-1 rounded-full border border-[#2d4629]">
              <button
                onClick={handlePrev}
                aria-label="Previous Story"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#273f24] hover:bg-[#395b35] text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-[11px] sm:text-xs font-bold text-[#b4c898] px-1 min-w-[42px] text-center">
                {String(currentIndex + 1).padStart(2, '0')}/{String(filteredStories.length).padStart(2, '0')}
              </span>

              <button
                onClick={handleNext}
                aria-label="Next Story"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#273f24] hover:bg-[#395b35] text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="stories-categories flex items-center gap-1.5 mb-2.5 sm:mb-3 overflow-x-auto pb-0.5 scrollbar-none shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#d2dbc8] text-[#1c2c19] shadow-xs font-bold'
                  : 'bg-[#1e301d] text-[#a4bc87] hover:bg-[#284226] hover:text-white border border-[#2e472a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Content Grid: Left Card (Metrics & Quote) | Right Card (Photo & Biometric Badge) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPerson.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 md:gap-5 items-stretch flex-1 min-h-0"
          >
            {/* Left Card: Health Metrics, Quote & Person Bio (Increased height on mobile) */}
            <div className="stories-card lg:col-span-7 bg-gradient-to-br from-[#f2f6ee] via-[#d2dbc8] to-[#9eb091] text-[#1c2c19] p-5 sm:p-6 md:p-7 rounded-[22px] sm:rounded-[28px] lg:rounded-[32px] flex flex-col justify-between shadow-xl relative overflow-hidden min-h-[270px] sm:min-h-[310px] lg:min-h-0 h-full">
              {/* Top Metrics Row */}
              <div className="grid grid-cols-2 gap-3 pb-3 sm:pb-4 border-b border-[#1c2c19]/15 shrink-0">
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-[#3d503a] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <span>{currentPerson.metric1Label}</span>
                    <span className="text-[#1c2c19] font-bold">↘</span>
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold font-['Plus_Jakarta_Sans'] text-[#1c2c19]">
                    {currentPerson.metric1Value}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-[#3d503a] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <span>{currentPerson.metric2Label}</span>
                    <span className="text-[#1c2c19] font-bold">↘</span>
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold font-['Plus_Jakarta_Sans'] text-[#1c2c19]">
                    {currentPerson.metric2Value}
                  </div>
                </div>
              </div>

              {/* Main Quote */}
              <div className="my-auto py-3 sm:py-4">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-relaxed text-[#1c2c19] font-['Plus_Jakarta_Sans'] lg:line-clamp-4">
                  "{currentPerson.quote}"
                </p>
              </div>

              {/* Person Meta Footer */}
              <div className="pt-3 border-t border-[#1c2c19]/15 flex items-center justify-between shrink-0">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                    {currentPerson.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#3b4e38] font-medium">
                    {currentPerson.age} yrs · {currentPerson.role} · {currentPerson.location}
                  </p>
                </div>

                <div className="px-2.5 py-0.5 rounded-full bg-[#1c2c19] text-[#d2dbc8] text-[10px] sm:text-[11px] font-semibold tracking-wide">
                  {currentPerson.category}
                </div>
              </div>
            </div>

            {/* Right Card: Portrait (Height increased by 30% on mobile: h-60/sm:h-72) */}
            <div className="stories-card lg:col-span-5 relative rounded-[22px] sm:rounded-[28px] lg:rounded-[32px] overflow-hidden h-60 sm:h-72 lg:h-full min-h-0 shadow-xl border border-white/10 group">
              <img
                src={currentPerson.image}
                alt={currentPerson.name}
                className="w-full h-full object-cover object-[center_15%] sm:object-[center_20%] transition-transform duration-700 group-hover:scale-105"
              />

              {/* Dark Gradient Overlay for Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10 pointer-events-none" />

              {/* Floating Glassmorphic Progress Badge (Bottom Left, Inline Layout) */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3.5 sm:left-3.5 sm:right-auto sm:max-w-[280px] bg-[#122011]/85 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-white/20 shadow-lg flex items-center justify-between gap-2.5">
                {/* Left: Metric Label & Big Number */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-[#b4c898] truncate">
                    <Heart size={10} className="text-[#a4bc87] fill-[#a4bc87] shrink-0" />
                    <span className="truncate">{currentPerson.chartLabel}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight font-['Plus_Jakarta_Sans']">
                    {currentPerson.chartAvg}
                  </div>
                </div>

                {/* Right: Slim Horizontal Trend Chart */}
                <div className="w-16 sm:w-20 lg:w-24 h-5 sm:h-6 shrink-0 pt-0.5">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a4bc87" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#a4bc87" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon
                      fill="url(#chartGrad)"
                      points={`0,30 ${currentPerson.chartData
                        .map((val, i) => `${(i / 6) * 100},${30 - (val / 100) * 25}`)
                        .join(' ')} 100,30`}
                    />
                    <polyline
                      fill="none"
                      stroke="#a4bc87"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={currentPerson.chartData
                        .map((val, i) => `${(i / 6) * 100},${30 - (val / 100) * 25}`)
                        .join(' ')}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick Thumbnail Carousel / Selector for All 45 People (Scrollbar Hidden) */}
        <div className="mt-2.5 sm:mt-3 pt-2 border-t border-[#253d22] flex items-center justify-between gap-3 overflow-x-auto scrollbar-none shrink-0">
          <div className="text-[11px] sm:text-xs text-[#a4bc87] font-medium shrink-0">
            Showing <span className="text-white font-bold">{currentIndex + 1}</span> of <span className="text-white font-bold">{filteredStories.length}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {filteredStories.slice(0, 8).map((person, idx) => (
              <button
                key={person.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] transition-all shrink-0 cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-[#d2dbc8] text-[#1c2c19] font-bold shadow-xs'
                    : 'bg-[#1b2c1a] text-[#8ea37a] hover:bg-[#263e24] hover:text-white border border-[#2b4429]'
                }`}
              >
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{person.name.split(' ')[0]}</span>
              </button>
            ))}

            {filteredStories.length > 8 && (
              <button
                onClick={() => setIsGridModalOpen(true)}
                className="text-[11px] text-[#b4c898] hover:text-white underline font-semibold px-1.5 shrink-0 cursor-pointer"
              >
                +{filteredStories.length - 8} more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Modal to Browse All 45 People */}
      {isGridModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-[#182717] text-white w-full max-w-5xl max-h-[92vh] rounded-2xl sm:rounded-3xl border border-white/15 p-4 sm:p-7 flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold font-['Plus_Jakarta_Sans'] text-white">
                  All 45 Verified Client Stories
                </h3>
                <p className="text-xs text-[#a4bc87] mt-0.5">
                  Explore real health outcomes and therapy journeys
                </p>
              </div>

              <button
                onClick={() => setIsGridModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search & Filter Controls */}
            <div className="py-3 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
              <div className="relative w-full sm:flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, issue, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111e10] text-white text-xs pl-9 pr-4 py-2 rounded-full border border-white/10 focus:outline-none focus:border-[#a4bc87]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#d2dbc8] text-[#1c2c19]'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Grid of All People */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-1 py-2">
              {filteredStories.map((person) => (
                <div
                  key={person.id}
                  onClick={() => selectPersonById(person.id)}
                  className="bg-[#20321f] hover:bg-[#2a4329] p-3.5 rounded-2xl border border-white/10 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#d2dbc8] transition-colors">
                        {person.name}
                      </h4>
                      <p className="text-[10px] text-[#a4bc87]">
                        {person.role} · {person.age}y
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2 italic mb-2">
                    "{person.quote}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#b4c898] pt-2 border-t border-white/10">
                    <span className="font-semibold">{person.metric1Label}: {person.metric1Value}</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-full">{person.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
