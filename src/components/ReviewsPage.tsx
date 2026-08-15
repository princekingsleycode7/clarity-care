import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  Heart, 
  MessageSquareQuote, 
  CheckCircle2, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Sparkles,
  X
} from 'lucide-react';
import { TESTIMONIALS_45 } from '../data/testimonialsData';

interface ReviewsPageProps {
  onBookConsultation: () => void;
  onNavigate: (page: string) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onBookConsultation, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    role: '',
    category: 'Anxiety & Stress',
    rating: 5,
    quote: '',
  });
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  const categories = ['All', 'Anxiety & Stress', 'Burnout & Focus', 'Sleep & Vitality', 'Trauma & Recovery', 'Relationships'];

  const filteredReviews = selectedCategory === 'All'
    ? TESTIMONIALS_45
    : TESTIMONIALS_45.filter(r => r.category === selectedCategory);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
  };

  return (
    <div className="w-full bg-[#f6f9f3] text-[#1c2c19] pt-24 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-14 sm:space-y-20">

        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-xs font-semibold text-[#2d4728] uppercase tracking-wider">
            <Star size={14} className="text-[#a4bc87] fill-[#a4bc87]" /> Verified Client Experiences & Transformations
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
            Stories of Hope, Breakthrough & Healing
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Real reflections from people who dared to begin their healing journey with Clover Heart Haven.
          </p>
        </section>

        {/* Aggregate Ratings & Highlights */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#d2dbc8] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 space-y-2 border-b sm:border-b-0 sm:border-r border-slate-100">
            <div className="flex justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={22} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-3xl font-extrabold text-[#1c2c19] font-['Plus_Jakarta_Sans']">4.98 / 5.0</p>
            <p className="text-xs text-slate-500 font-medium">Overall Client Satisfaction</p>
          </div>

          <div className="p-4 space-y-2 border-b sm:border-b-0 lg:border-r border-slate-100">
            <p className="text-3xl font-extrabold text-[#1c2c19] font-['Plus_Jakarta_Sans']">340+</p>
            <p className="text-xs text-slate-500 font-medium">Individuals & Couples Guided</p>
            <div className="inline-flex items-center gap-1 text-[11px] text-[#3c5d35] font-semibold">
              <ShieldCheck size={14} /> 100% Confidential
            </div>
          </div>

          <div className="p-4 space-y-2 border-b sm:border-b-0 sm:border-r border-slate-100">
            <p className="text-3xl font-extrabold text-[#1c2c19] font-['Plus_Jakarta_Sans']">94%</p>
            <p className="text-xs text-slate-500 font-medium">Reported Anxiety Reduction</p>
            <div className="inline-flex items-center gap-1 text-[11px] text-[#3c5d35] font-semibold">
              <TrendingUp size={14} /> Within 6–8 Weeks
            </div>
          </div>

          <div className="p-4 space-y-2 flex flex-col justify-center items-center">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-[#1c2c19] text-white hover:bg-[#2b4427] px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Share Your Story</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-1">Submit an anonymous reflection</p>
          </div>
        </section>

        {/* Category Filters */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-[#1c2c19] text-white border-[#1c2c19] shadow-sm'
                    : 'bg-white text-slate-600 border-[#e2ebd9] hover:bg-[#f0f4ec]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => (
              <div 
                key={rev.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2ebd9] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-4">
                  {/* Rating & Category Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f4f8f1] text-[#2c4724] border border-[#d2dbc8]">
                      {rev.category}
                    </span>
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <MessageSquareQuote size={28} className="text-[#d2dbc8] absolute -top-2 -left-1 opacity-40" />
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-6 italic">
                      "{rev.quote}"
                    </p>
                  </div>

                  {/* Verified Health Metrics Progress */}
                  <div className="p-3.5 bg-[#fafcf8] rounded-2xl border border-[#e2ebd9] space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">{rev.metric1Label}</span>
                      <span className="font-bold text-[#1c2c19]">{rev.metric1Value}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">{rev.metric2Label}</span>
                      <span className="font-bold text-[#3c5d35]">{rev.metric2Value}</span>
                    </div>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <img 
                    src={rev.image} 
                    alt={rev.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#d2dbc8]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#1c2c19]">{rev.name}, {rev.age}</h4>
                    <p className="text-[11px] text-slate-500">{rev.role} • {rev.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-[#1c2c19] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-xl border border-white/10 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold font-['Plus_Jakarta_Sans']">
            Your healing story starts today
          </h2>
          <p className="text-xs sm:text-sm text-[#d2dbc8] max-w-lg mx-auto font-light">
            Take the first step with zero judgment. Schedule your complimentary 15-minute consultation.
          </p>
          <button
            onClick={onBookConsultation}
            className="bg-white text-[#1c2c19] hover:bg-[#f0f4ec] px-8 py-4 rounded-full text-sm font-bold transition-all shadow-md hover:scale-105 cursor-pointer"
          >
            Schedule Free Consultation
          </button>
        </section>

      </div>

      {/* Share Your Story Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-[#d2dbc8]">
            <button
              onClick={() => {
                setIsSubmitModalOpen(false);
                setReviewSubmitted(false);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X size={20} />
            </button>

            {reviewSubmitted ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 bg-[#d2dbc8]/50 text-[#1c2c19] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1c2c19]">Thank You for Sharing</h3>
                <p className="text-xs text-slate-600">
                  Your reflection has been received and helps encourage others on their path to mental wellness.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitModalOpen(false);
                    setReviewSubmitted(false);
                  }}
                  className="bg-[#1c2c19] text-white px-6 py-2.5 rounded-full text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-[#1c2c19]">Share Your Experience</h3>
                <p className="text-xs text-slate-500">
                  You can use your initials or remain anonymous if preferred.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Your Name or Pseudonym</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., Sarah M."
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Area of Growth / Category</label>
                  <select 
                    value={reviewForm.category}
                    onChange={(e) => setReviewForm({...reviewForm, category: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Your Reflection & Feedback</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="How has therapy supported your journey and well-being?"
                    value={reviewForm.quote}
                    onChange={(e) => setReviewForm({...reviewForm, quote: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1c2c19] text-white py-3 rounded-full text-xs font-bold hover:bg-[#2b4427] transition-all cursor-pointer"
                >
                  Submit Reflection
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
