import React, { useState } from 'react';
import { X, BookOpen, Check, Download, Mail, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface FreeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCall?: () => void;
}

export const FreeGuideModal: React.FC<FreeGuideModalProps> = ({
  isOpen,
  onClose,
  onBookCall,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#fafcf8] rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden border border-[#d2dbc8] my-8 flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Top Decorative Header */}
        <div className="bg-[#1c2c19] text-white px-6 py-6 sm:px-8 sm:py-7 border-b border-white/10 text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#82c974] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#a4bc87]">
              Complimentary Resource
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans'] text-white">
            The Gentle Healing & Clarity Guide
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
            A private self-reflection framework for women navigating emotional overwhelm and attachment transitions.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Take things completely at your own pace. Enter your email below to receive the free downloadable workbook and guided grounding prompts.
                </p>
                <div className="p-3.5 bg-[#f0f4ec] rounded-2xl border border-[#d2dbc8] space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-bold text-[#1c2c19]">
                    <Sparkles size={14} className="text-[#3c5d35]" />
                    <span>What's inside your free guide:</span>
                  </div>
                  <ul className="space-y-1 pl-5 list-disc text-slate-600 text-[11px] sm:text-xs">
                    <li>3 somatic grounding exercises for nervous system regulation</li>
                    <li>Untangling attachment anxiety & heartbreak triggers</li>
                    <li>Daily boundary phrases to protect your peace</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">First Name</label>
                <input
                  type="text"
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 mt-1 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19] bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Email Address <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 mt-1 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19] bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1c2c19] hover:bg-[#2b4427] text-white py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <BookOpen size={16} />
                <span>{loading ? 'Preparing your guide...' : 'Send Me the Free Guide'}</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck size={13} className="text-[#3c5d35]" />
                <span>100% confidential • Zero spam • Unsubscribe anytime</span>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-3">
              <div className="w-14 h-14 bg-[#d2dbc8]/60 text-[#1c2c19] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check size={30} className="text-[#233d20]" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                  Your Guide is on the Way!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  We've sent a copy to <strong className="text-slate-800">{email}</strong>. You can also download it right now:
                </p>
              </div>

              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  // Trigger direct dummy text download
                  const content = "Clover Heart Haven — The Gentle Healing & Clarity Guide\n\n1. Somatic Regulation\n2. Navigating Attachment Triggers\n3. Daily Boundary Rituals\n\nYou don't need to be strong right now. You need somewhere safe to begin.";
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = "Clover_Heart_Haven_Healing_Guide.txt";
                  a.click();
                }}
                className="inline-flex items-center justify-center gap-2 bg-[#3c5d35] hover:bg-[#2e472a] text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md cursor-pointer"
              >
                <Download size={15} />
                <span>Download Guide (Instant Access)</span>
              </a>

              {onBookCall && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">Ready to talk to someone when the time feels right?</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBookCall();
                    }}
                    className="text-xs font-bold text-[#1c2c19] hover:text-[#3c5d35] inline-flex items-center gap-1 cursor-pointer underline underline-offset-4"
                  >
                    <span>Book Your Free Private Clarity Call</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
