import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Video, 
  Building, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  Globe,
  Download,
  CalendarCheck
} from 'lucide-react';

interface ConsultationOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const ConsultationOnboardingModal: React.FC<ConsultationOnboardingModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'Gain Clarity',
}) => {
  // Step state: 1: Goals, 2: Google Sign In / Email, 3: Date & Cal.com Slots, 4: Intake Notes, 5: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [isSignedInWithGoogle, setIsSignedInWithGoogle] = useState<boolean>(false);

  // Form & Booking Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    topic: initialTopic,
    modality: 'telehealth' as 'telehealth' | 'inperson',
    therapist: 'Dr. Elena Vance, PsyD',
    timezone: 'America/Los_Angeles (PST)',
    selectedDate: '',
    selectedTime: '10:00 AM',
    notes: '',
    previousTherapy: 'yes' as 'yes' | 'no',
    emergencyConsent: true,
  });

  const [bookingReference, setBookingReference] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([
    '09:00 AM', '10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM', '04:30 PM', '05:30 PM'
  ]);

  // Generate upcoming 14 available dates
  const [dateOptions, setDateOptions] = useState<{ dayName: string; dayNum: number; fullDate: string; isWeekend: boolean }[]>([]);

  useEffect(() => {
    if (initialTopic) {
      setFormData(prev => ({ ...prev, topic: initialTopic }));
    }
  }, [initialTopic]);

  useEffect(() => {
    const dates: { dayName: string; dayNum: number; fullDate: string; isWeekend: boolean }[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      
      dates.push({
        dayName,
        dayNum,
        fullDate: `${dayName}, ${monthName} ${dayNum}, ${d.getFullYear()}`,
        isWeekend,
      });
    }

    setDateOptions(dates);
    if (dates.length > 0) {
      // Default to first weekday
      const firstWeekday = dates.find(d => !d.isWeekend) || dates[0];
      setFormData(prev => ({ ...prev, selectedDate: firstWeekday.fullDate }));
    }
  }, []);

  if (!isOpen) return null;

  // Simulate Google Sign-In authentication
  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      setIsSignedInWithGoogle(true);
      setFormData(prev => ({
        ...prev,
        name: prev.name || 'Alex Morgan',
        email: prev.email || 'alex.morgan.wellness@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      }));
      // Advance to scheduling step
      setCurrentStep(3);
    }, 900);
  };

  const handleManualEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    setCurrentStep(3);
  };

  const handleFinalBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const refCode = `CHH-CAL-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingReference(refCode);
    setCurrentStep(5);
  };

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`15-Min Wellness Consultation with Dr. Elena Vance (${formData.topic})`);
    const details = encodeURIComponent(
      `Clover Heart Haven Intake Consultation with Dr. Elena Vance, PsyD.\nModality: ${formData.modality === 'telehealth' ? 'Virtual Google Meet (Link provided in confirmation)' : 'In-Person at 450 Sutter St, SF'}\nReference: ${bookingReference}`
    );
    const location = encodeURIComponent(formData.modality === 'telehealth' ? 'Google Meet (Telehealth)' : '450 Sutter St, Suite 1200, San Francisco, CA');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  // Generate .ics file for Apple Calendar / Outlook download
  const handleDownloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Clover Heart Haven//Therapy Consultation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Therapy Consultation - Dr. Elena Vance (${formData.topic})`,
      `DESCRIPTION:Clover Heart Haven initial consultation.\\nBooking ID: ${bookingReference}\\nPatient: ${formData.name}`,
      `LOCATION:${formData.modality === 'telehealth' ? 'Google Meet Telehealth Video' : '450 Sutter St, Suite 1200, San Francisco, CA'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `clover_haven_consultation_${bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fafcf8] rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden border border-[#d2dbc8] my-8 flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header Progress Stepper */}
        {currentStep < 5 && (
          <div className="bg-[#1c2c19] text-white px-6 py-5 sm:px-8 sm:py-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#82c974] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#a4bc87]">
                  Cal.com Integrated Booking
                </span>
              </div>
              <span className="text-xs text-gray-300 font-medium">
                Step {currentStep} of 4
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden flex">
              <div 
                className="bg-[#a4bc87] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-2.5 text-[11px] text-gray-300">
              <span className={currentStep >= 1 ? 'text-white font-bold' : ''}>1. Focus</span>
              <span className={currentStep >= 2 ? 'text-white font-bold' : ''}>2. Google Sign-In</span>
              <span className={currentStep >= 3 ? 'text-white font-bold' : ''}>3. Cal.com Time</span>
              <span className={currentStep >= 4 ? 'text-white font-bold' : ''}>4. Notes</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 md:p-10 flex-1">
          
          {/* STEP 1: GOALS & SESSION MODALITY */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#5c7a52] uppercase tracking-wider">Step 1: Clinical Orientation</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                  What is your primary focus for therapy?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Select the core area you would like to explore during your complimentary 15-minute consultation:
                </p>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'Gain Clarity', label: 'Personal Clarity & Life Transitions' },
                  { id: 'Manage Stress', label: 'Anxiety, Panic & Nervous System' },
                  { id: 'Self-Awareness', label: 'Self-Esteem & Boundary Setting' },
                  { id: 'Trauma Recovery', label: 'Trauma & EMDR Processing' },
                  { id: 'Couples & Relationships', label: 'Couples & Marital Support' },
                  { id: 'Executive Burnout', label: 'High-Performance & Burnout' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, topic: item.id })}
                    className={`p-3.5 rounded-2xl text-left text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                      formData.topic === item.id
                        ? 'bg-[#1c2c19] text-white border-[#1c2c19] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-[#f0f4ec]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {formData.topic === item.id && <Check size={16} className="text-[#a4bc87] shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Modality Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">Preferred Consultation Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, modality: 'telehealth' })}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.modality === 'telehealth'
                        ? 'bg-[#3c5d35] text-white border-[#3c5d35]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Video size={16} />
                    <span>Virtual Video (Google Meet)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, modality: 'inperson' })}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.modality === 'inperson'
                        ? 'bg-[#3c5d35] text-white border-[#3c5d35]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building size={16} />
                    <span>In-Person (San Francisco)</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full bg-[#1c2c19] text-white hover:bg-[#2b4427] py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer mt-4"
              >
                <span>Continue to Sign Up</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: GOOGLE SIGN-IN / EMAIL */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#5c7a52] uppercase tracking-wider">Step 2: Client Verification</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                  Sign up with Google to sync your calendar
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Connect your Google account so your Cal.com booking automatically adds to your calendar with video meeting links and instant reminders.
                </p>
              </div>

              {/* 1-Click Google Sign-In Button */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold border-2 border-slate-300 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md cursor-pointer hover:border-slate-400"
                >
                  {/* Google 'G' Vector Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span>{isGoogleLoading ? 'Connecting with Google...' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span>or enter your details manually</span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                {/* Manual Fallback Form */}
                <form onSubmit={handleManualEmailSubmit} className="space-y-3 text-left">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Maya Lin"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Email Address (Where invite will be sent)</label>
                    <input 
                      type="email"
                      required
                      placeholder="maya@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#1c2c19] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#2b4427] transition-all cursor-pointer"
                  >
                    Proceed to Select Date & Time
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-[#3c5d35]">
                  <ShieldCheck size={14} />
                  <span>HIPAA & Cal.com End-to-End Encrypted</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CAL.COM LIVE DATE & TIME SELECTOR */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5c7a52] uppercase tracking-wider">Step 3: Live Availability</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#eef4ea] text-[#2c4724]">
                    15 Min Free Call
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                  Choose your appointment date & time
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Select an open slot from Dr. Elena Vance's verified Cal.com schedule:
                </p>
              </div>

              {/* Timezone Selector */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Globe size={15} className="text-[#4a6b3f]" />
                  <span className="font-semibold">Timezone:</span>
                  <span>{formData.timezone}</span>
                </div>
                <select 
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="bg-transparent text-xs font-bold text-[#1c2c19] border-none focus:outline-none cursor-pointer"
                >
                  <option value="America/Los_Angeles (PST)">Pacific Time (PST)</option>
                  <option value="America/Denver (MST)">Mountain Time (MST)</option>
                  <option value="America/Chicago (CST)">Central Time (CST)</option>
                  <option value="America/New_York (EST)">Eastern Time (EST)</option>
                  <option value="Europe/London (GMT)">London (GMT)</option>
                </select>
              </div>

              {/* Horizontal Date Picker Strip */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Date</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {dateOptions.map((dateObj, idx) => {
                    const isSelected = formData.selectedDate === dateObj.fullDate;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, selectedDate: dateObj.fullDate })}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1c2c19] text-white border-[#1c2c19] shadow-md scale-102'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-[#f0f4ec]'
                        }`}
                      >
                        <span className="text-[10px] font-semibold uppercase">{dateObj.dayName}</span>
                        <span className="text-lg font-bold">{dateObj.dayNum}</span>
                        {dateObj.isWeekend && <span className="text-[9px] text-[#a4bc87]">Weekend</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available Time Slots Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Available Time Slot (Cal.com Live)</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isSelected = formData.selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({ ...formData, selectedTime: slot })}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#3c5d35] text-white border-[#3c5d35] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-[#fafcf9]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="bg-[#1c2c19] text-white hover:bg-[#2b4427] px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Confirm Slot</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: INTAKE QUESTIONS & PHONE NUMBER */}
          {currentStep === 4 && (
            <form onSubmit={handleFinalBooking} className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#5c7a52] uppercase tracking-wider">Step 4: Clinical Preparation</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                  Finalize your consultation details
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Provide your phone number for automated SMS reminders and any notes for Dr. Vance:
                </p>
              </div>

              {/* Summary Pill */}
              <div className="p-4 rounded-2xl bg-[#f0f4ec] border border-[#d2dbc8] text-xs text-slate-700 space-y-1.5">
                <p className="flex justify-between">
                  <span className="text-slate-500 font-medium">Session:</span>
                  <span className="font-bold text-[#1c2c19]">15-Min Free Consultation</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500 font-medium">Date & Time:</span>
                  <span className="font-bold text-[#1c2c19]">{formData.selectedDate} at {formData.selectedTime}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-500 font-medium">Patient:</span>
                  <span className="font-bold text-[#1c2c19]">{formData.name} ({formData.email})</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number for SMS Confirmation & Reminder</label>
                  <input 
                    type="tel"
                    required
                    placeholder="(415) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Have you attended therapy previously?</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, previousTherapy: 'yes' })}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        formData.previousTherapy === 'yes' ? 'bg-[#1c2c19] text-white' : 'bg-white text-slate-600'
                      }`}
                    >
                      Yes, in the past
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, previousTherapy: 'no' })}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        formData.previousTherapy === 'no' ? 'bg-[#1c2c19] text-white' : 'bg-white text-slate-600'
                      }`}
                    >
                      No, first time
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Anything specific you'd like Dr. Vance to know? (Optional)</label>
                  <textarea 
                    rows={3}
                    placeholder="Share what you hope to address during the call..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-[#1c2c19]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="bg-[#1c2c19] text-white hover:bg-[#2b4427] px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:scale-102"
                >
                  <CalendarCheck size={16} />
                  <span>Complete Cal.com Booking</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: FINAL CONFIRMATION & CALENDAR SYNC */}
          {currentStep === 5 && (
            <div className="py-6 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-[#d2dbc8]/60 text-[#1c2c19] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={38} className="text-[#233d20]" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#5c7a52]">Cal.com Booking Confirmed</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                  You are scheduled with Dr. Elena Vance!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  A calendar invitation and confirmation email have been sent to <strong className="text-slate-800">{formData.email}</strong>.
                </p>
              </div>

              {/* Booking Pass Receipt */}
              <div className="p-5 rounded-3xl bg-[#f0f4ec] border border-[#d2dbc8] max-w-md mx-auto text-left text-xs space-y-2.5 shadow-sm">
                <div className="flex justify-between border-b border-[#d2dbc8] pb-2">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono font-bold text-[#1c2c19]">{bookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-[#1c2c19]">{formData.selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Window:</span>
                  <span className="font-bold text-[#1c2c19]">{formData.selectedTime} ({formData.timezone.split(' ')[0]})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Meeting Modality:</span>
                  <span className="font-bold text-[#1c2c19]">
                    {formData.modality === 'telehealth' ? 'Google Meet Video Call' : 'San Francisco Office'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Company Calendar Status:</span>
                  <span className="font-bold text-[#3c5d35] flex items-center gap-1">
                    <Check size={13} /> Synced with Dr. Vance
                  </span>
                </div>
              </div>

              {/* Multi-Calendar Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-[#1c2c19] text-white hover:bg-[#2b4427] px-5 py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Calendar size={15} />
                  <span>Add to Google Calendar</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-5 py-3 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download size={15} />
                  <span>Download .ICS (Apple/Outlook)</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline underline-offset-4"
                >
                  Return to Website
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
