import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  AlertCircle, 
  ArrowRight,
  Send,
  Video,
  Building
} from 'lucide-react';

interface ContactPageProps {
  onScheduleSuccess?: () => void;
  onOpenOnboarding?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onScheduleSuccess, onOpenOnboarding }) => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [consultationType, setConsultationType] = useState<'telehealth' | 'inperson'>('telehealth');
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceInterest: 'Individual Counseling',
    urgency: 'Standard (Within 24 hrs)',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactFaqs = [
    {
      q: 'How fast will I receive a reply after submitting this form?',
      a: 'Our clinical intake team responds to all inquiries within 2 to 4 business hours Monday through Friday, and within 12 hours on weekends.'
    },
    {
      q: 'Is the 15-minute consultation truly 100% free with no obligation?',
      a: 'Yes, absolutely. The free consultation is a dedicated 15-minute video or phone call with Dr. Elena Vance to discuss your goals, answer your questions, and ensure we are the right fit before scheduling any paid sessions.'
    },
    {
      q: 'Where is your physical clinic located for in-person appointments?',
      a: 'Our peaceful private office is located at 450 Sutter Street, Suite 1200, San Francisco, CA 94108. Secure parking is available directly adjacent to the building.'
    },
    {
      q: 'What should I do in an immediate mental health emergency?',
      a: 'If you or a loved one are experiencing an active mental health crisis, please immediately dial 988 (National Suicide & Crisis Lifeline, available 24/7) or call 911, or go to the nearest emergency medical room.'
    }
  ];

  return (
    <div className="w-full bg-[#f6f9f3] text-[#1c2c19] pt-24 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">

        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-xs font-semibold text-[#2d4728] uppercase tracking-wider">
            <Mail size={14} className="text-[#a4bc87]" /> Connect with Clover Heart Haven
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
            We Are Here to Listen & Walk Beside You
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Whether you want to schedule a free 15-minute introductory call or have questions about our therapy programs, we welcome your message.
          </p>
        </section>

        {/* Urgent Crisis Support Banner */}
        <section className="bg-[#fff9f0] border border-[#fbd38d] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-5xl mx-auto shadow-sm">
          <div className="flex items-start gap-3.5">
            <AlertCircle size={24} className="text-[#c05621] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#7b341e]">In Immediate Need of 24/7 Crisis Support?</h4>
              <p className="text-xs text-[#9c4221] leading-relaxed">
                If you are experiencing severe distress or suicidal thoughts, please call or text <strong>988</strong> anytime for free, confidential help.
              </p>
            </div>
          </div>
          <a 
            href="tel:988"
            className="shrink-0 bg-[#c05621] text-white hover:bg-[#9c4221] px-4 py-2 rounded-full text-xs font-bold transition-colors"
          >
            Call 988 Lifeline
          </a>
        </section>

        {/* Contact Info Grid + Interactive Scheduling / Inquiry Form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto items-start">
          
          {/* Left Column: Direct Info & Clinic Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2ebd9] shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                Direct Clinic Contacts
              </h3>

              <div className="space-y-4">
                <a 
                  href="tel:4158905423" 
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#fafcf8] hover:bg-[#f0f4ec] border border-[#e2ebd9] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1c2c19] text-white flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1c2c19] group-hover:text-[#3c5d35]">Direct Phone / SMS</p>
                    <p className="text-xs text-slate-600">(415) 890-5423</p>
                    <span className="text-[10px] text-slate-400">Mon–Fri: 8:00 AM – 6:30 PM PST</span>
                  </div>
                </a>

                <a 
                  href="mailto:care@cloverhearthaven.com" 
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#fafcf8] hover:bg-[#f0f4ec] border border-[#e2ebd9] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1c2c19] text-white flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1c2c19] group-hover:text-[#3c5d35]">Encrypted Clinical Email</p>
                    <p className="text-xs text-slate-600">care@cloverhearthaven.com</p>
                    <span className="text-[10px] text-slate-400">HIPAA-Compliant Inquiries</span>
                  </div>
                </a>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#fafcf8] border border-[#e2ebd9]">
                  <div className="w-10 h-10 rounded-full bg-[#1c2c19] text-white flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1c2c19]">San Francisco Office</p>
                    <p className="text-xs text-slate-600 leading-tight">450 Sutter Street, Suite 1200<br/>San Francisco, CA 94108</p>
                    <span className="text-[10px] text-slate-400">Validated parking on site</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#fafcf8] border border-[#e2ebd9]">
                  <div className="w-10 h-10 rounded-full bg-[#1c2c19] text-white flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1c2c19]">Practice Hours</p>
                    <p className="text-xs text-slate-600">Monday – Friday: 8:00 AM – 7:00 PM</p>
                    <p className="text-xs text-slate-600">Saturday: 9:00 AM – 3:00 PM (Telehealth)</p>
                  </div>
                </div>
              </div>
            </div>

              <div className="bg-[#1c2c19] text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm border border-white/10">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d2dbc8]">
                <ShieldCheck size={16} /> Privacy & Confidentiality Pledge
              </div>
              <p className="text-xs text-[#d2dbc8] leading-relaxed">
                All communications sent to Clover Heart Haven are strictly protected under federal HIPAA privacy laws. Your information is never sold, shared, or distributed.
              </p>
            </div>
          </div>

          {/* Right Column: Appointment & Message Hub */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#d2dbc8] shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-5 animate-fade-in">
                <div className="w-16 h-16 bg-[#d2dbc8]/50 text-[#1c2c19] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                  Consultation Request Received
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-slate-800">{formData.fullName || 'friend'}</span>. Dr. Elena Vance or our intake team will reach out to you via <span className="font-semibold text-slate-800">{formData.email || 'email'}</span> within 2 to 4 hours with your consultation confirmation and calendar invite.
                </p>
                <div className="p-4 bg-[#f6f9f3] rounded-2xl max-w-sm mx-auto text-left text-xs text-slate-600 space-y-1">
                  <p><strong>Selected Modality:</strong> {consultationType === 'telehealth' ? 'Virtual Video Call' : 'In-Person (San Francisco)'}</p>
                  <p><strong>Preferred Time:</strong> {selectedDate} at {selectedSlot}</p>
                  <p><strong>Focus Area:</strong> {formData.serviceInterest}</p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-[#1c2c19] text-white hover:bg-[#2b4427] px-6 py-2.5 rounded-full text-xs font-bold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                      Request a Free 15-Minute Consultation
                    </h3>
                    {onOpenOnboarding && (
                      <button
                        type="button"
                        onClick={onOpenOnboarding}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c2c19] text-white text-[11px] font-bold hover:bg-[#2e472a] transition-all cursor-pointer shadow-sm w-fit"
                      >
                        <span>Cal.com Live Booker</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Sign up with Google or select your preferred session format and time slot below:
                  </p>
                </div>

                {/* Google Sign-In Fast-Track Button */}
                {onOpenOnboarding && (
                  <div className="bg-[#f2f6ee] border border-[#d2dbc8] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-[#1c2c19]">One-Click Sign-In via Google</p>
                        <p className="text-[11px] text-slate-500">Auto-sync with Google Calendar & Google Meet</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenOnboarding}
                      className="bg-white hover:bg-slate-50 text-[#1c2c19] border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      Sign In & Schedule
                    </button>
                  </div>
                )}

                {/* Modality Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType('telehealth')}
                    className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      consultationType === 'telehealth'
                        ? 'bg-[#1c2c19] text-white border-[#1c2c19] shadow-sm'
                        : 'bg-[#fafcf8] text-slate-700 border-[#e2ebd9] hover:bg-[#f0f4ec]'
                    }`}
                  >
                    <Video size={16} />
                    <span>Telehealth Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultationType('inperson')}
                    className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      consultationType === 'inperson'
                        ? 'bg-[#1c2c19] text-white border-[#1c2c19] shadow-sm'
                        : 'bg-[#fafcf8] text-slate-700 border-[#e2ebd9] hover:bg-[#f0f4ec]'
                    }`}
                  >
                    <Building size={16} />
                    <span>In-Person (SF Office)</span>
                  </button>
                </div>

                {/* Slot Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Preferred Time Window</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Morning (9–12)', 'Afternoon (1–4)', 'Evening (5–7)'].map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer text-center ${
                          selectedSlot === slot
                            ? 'bg-[#3c5d35] text-white border-[#3c5d35]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Eleanor Rigby"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Primary Focus</label>
                    <select 
                      value={formData.serviceInterest}
                      onChange={(e) => setFormData({...formData, serviceInterest: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                    >
                      <option value="Individual Counseling">Individual Counseling</option>
                      <option value="Couples & Marital Therapy">Couples & Marital Therapy</option>
                      <option value="Anxiety & Panic Relief">Anxiety & Panic Relief</option>
                      <option value="Trauma & EMDR">Trauma & EMDR Recovery</option>
                      <option value="Executive Burnout">Executive Burnout Support</option>
                      <option value="Mindfulness & Somatics">Mindfulness & Somatics</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Brief note on what brings you in (Optional & Confidential)</label>
                  <textarea 
                    rows={3}
                    placeholder="Share what you hope to achieve or any questions you have..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1c2c19] text-white hover:bg-[#2b4427] py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-101"
                >
                  <Send size={16} />
                  <span>Submit Consultation Request</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Contact FAQ Accordion */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e2ebd9] shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
              Contact & Scheduling FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {contactFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="rounded-2xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 sm:p-5 bg-white hover:bg-[#fafcf9] flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-xs sm:text-sm text-[#1c2c19]">
                      {faq.q}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={`text-[#4a6b3f] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-[#fafcf8] animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};
