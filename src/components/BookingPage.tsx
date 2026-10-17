import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  CalendarCheck2, 
  Download, 
  ExternalLink, 
  Info,
  FileText,
  RefreshCw, 
  AlertCircle,
  Timer,
  Loader2
} from 'lucide-react';
import { ManageBookingModal } from './ManageBookingModal';

interface BookingPageProps {
  onNavigate?: (page: string) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({ onNavigate }) => {
  // Query parameters parsing for email sequence links
  const [paramsLoaded, setParamsLoaded] = useState(false);
  const [sourceParam, setSourceParam] = useState('email_sequence');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Form state - streamlined to only date, time, and confidential details
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    selectedDate: '',
    selectedDateISO: '',
    selectedDateLabel: '',
    selectedTime: '10:00 AM',
    timezone: 'America/Los_Angeles',
    notes: '',
  });

  const [currentStep, setCurrentStep] = useState<1 | 2>(1); // 1 = Booking Form, 2 = Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [calcomSent, setCalcomSent] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  // Generate upcoming 30 available days
  const [dateOptions, setDateOptions] = useState<{
    dayName: string;
    dayNum: number;
    monthName: string;
    fullDate: string;
    isoDate: string;
    isToday: boolean;
    isTomorrow: boolean;
    isWeekend: boolean;
  }[]>([]);

  // Parse URL search parameters on mount (email nurturing prefill)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlEmail = searchParams.get('email') || searchParams.get('e') || searchParams.get('mail') || '';
      const urlName = searchParams.get('name') || searchParams.get('n') || searchParams.get('first_name') || searchParams.get('firstName') || '';
      const urlPhone = searchParams.get('phone') || searchParams.get('tel') || '';
      const urlSource = searchParams.get('source') || searchParams.get('utm_source') || 'email_sequence';
      const urlCampaign = searchParams.get('utm_campaign') || searchParams.get('campaign') || '';

      setSourceParam(urlSource);
      if (urlCampaign) setUtmCampaign(urlCampaign);

      setFormData(prev => ({
        ...prev,
        fullName: urlName ? decodeURIComponent(urlName) : prev.fullName,
        email: urlEmail ? decodeURIComponent(urlEmail) : prev.email,
        phone: urlPhone ? decodeURIComponent(urlPhone) : prev.phone,
      }));

      // Detect user local timezone
      try {
        const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detectedTz) {
          setFormData(prev => ({ ...prev, timezone: detectedTz }));
        }
      } catch (e) {
        // Fallback to America/Los_Angeles
      }
    } catch (e) {
      console.warn('Notice parsing booking URL parameters:', e);
    } finally {
      setParamsLoaded(true);
    }
  }, []);

  // Build calendar dates
  useEffect(() => {
    const dates: typeof dateOptions = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isoDate = d.toISOString().split('T')[0];
      const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

      dates.push({
        dayName,
        dayNum,
        monthName,
        fullDate,
        isoDate,
        isToday,
        isTomorrow,
        isWeekend
      });
    }

    setDateOptions(dates);

    // Default select tomorrow
    if (dates.length > 0) {
      setFormData(prev => ({
        ...prev,
        selectedDate: dates[0].fullDate,
        selectedDateISO: dates[0].isoDate,
        selectedDateLabel: `${dates[0].dayName}, ${dates[0].monthName} ${dates[0].dayNum}`
      }));
    }
  }, []);

  // Fetch real-time available slots from Cal.com
  const fetchCalSlots = async (dateISO: string) => {
    setIsLoadingSlots(true);
    try {
      const res = await fetch(`/api/cal/slots?date=${encodeURIComponent(dateISO)}&timezone=${encodeURIComponent(formData.timezone)}`);
      const data = await res.json();
      if (res.ok && data.slots && Array.isArray(data.slots)) {
        setAvailableSlots(data.slots);
        if (data.slots.length > 0) {
          setFormData(prev => ({ ...prev, selectedTime: data.slots[0] }));
        } else {
          setFormData(prev => ({ ...prev, selectedTime: '' }));
        }
      } else {
        setAvailableSlots([]);
      }
    } catch {
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (formData.selectedDateISO) {
      fetchCalSlots(formData.selectedDateISO);
    }
  }, [formData.selectedDateISO, formData.timezone]);

  const handleDateSelect = (d: (typeof dateOptions)[0]) => {
    setFormData(prev => ({
      ...prev,
      selectedDate: d.fullDate,
      selectedDateISO: d.isoDate,
      selectedDateLabel: `${d.dayName}, ${d.monthName} ${d.dayNum}`
    }));
  };

  // Helper to compute 15-minute session time range
  const getSessionTimeRange = () => {
    try {
      const dateStr = formData.selectedDateISO || new Date().toISOString().split('T')[0];
      const match = formData.selectedTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      let hours = 10;
      let minutes = 0;
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      }
      const start = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
      const end = new Date(start.getTime() + 15 * 60 * 1000); // 15-minute Free Clarity Call
      return { start, end };
    } catch {
      const now = new Date();
      return { start: now, end: new Date(now.getTime() + 900000) };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Please provide your full name so your therapist knows who they are meeting.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address to receive your private session link.');
      return;
    }

    if (!formData.selectedDate) {
      setErrorMessage('Please select an appointment date.');
      return;
    }

    if (!formData.selectedTime) {
      setErrorMessage('Please select an available time slot.');
      return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');

if (
  !formData.phone.trim().startsWith('+') ||
  !/^[1-9]\d{7,14}$/.test(phoneDigits)
) {
  setErrorMessage(
    'Enter your full phone number with the + and country code, such as +14155550192.'
  );
  return;
}

const internationalPhone = `+${phoneDigits}`;
    setIsSubmitting(true);

    try {
      const address = 'Telehealth Video Sanctuary';
      const notes = `Type: 15-minute Free Clarity Call | Source: ${sourceParam}${utmCampaign ? ` | Campaign: ${utmCampaign}` : ''}${formData.notes ? ` | Client Note: ${formData.notes}` : ''}`;

      const calRes = await fetch('/api/cal/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address,
          selectedDate: formData.selectedDate,
          selectedTime: formData.selectedTime,
          timezone: formData.timezone,
          notes,
          duration: 15,
        }),
      });

      const calData = await calRes.json().catch(() => ({}));

      if (calRes.ok && calData.success && calData.reference) {
        setBookingReference(calData.reference);
        setCalcomSent(Boolean(calData.calcomSent));

        // Register lead attribution via /api/leads asynchronously
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            firstName: formData.fullName.trim().split(' ')[0],
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            serviceInterest: '15-minute Free Clarity Call',
            source: sourceParam,
            utm_source: sourceParam,
            notes: `Booked 15-Min Clarity Call: ${formData.selectedDate} at ${formData.selectedTime} (${formData.timezone}) | Ref: ${calData.reference}`,
          }),
        }).catch(err => console.warn('Attribution lead log notice:', err));

        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errorDetail = calData.error || 'Cal.com could not confirm this appointment slot. Please choose another time.';
        setErrorMessage(errorDetail);
        if (calData.code === 'SLOT_TAKEN' && formData.selectedDateISO) {
          fetchCalSlots(formData.selectedDateISO);
        }
      }
    } catch (err: any) {
      setErrorMessage('Network connection error while contacting booking server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Calendar URL generator (15-minute block)
  const getGoogleCalendarUrl = () => {
    const { start, end } = getSessionTimeRange();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatGCalDate = (d: Date) => 
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const datesParam = `${formatGCalDate(start)}/${formatGCalDate(end)}`;
    const title = encodeURIComponent('15-minute Free Clarity Call — Clover Heart Haven');
    const details = encodeURIComponent(
      `1-Hour Private Consultation with Clover Heart Haven.\n` +
      `Booking Reference: ${bookingReference}\n` +
      `Attendee: ${formData.fullName}\n` +
      `Format: Private Video Sanctuary (Encrypted link sent to ${formData.email})\n\n` +
      `Need to reschedule? Email care@cloverhearthaven.com with at least 24 hours notice.`
    );
    const location = encodeURIComponent('Private Video Sanctuary (Check email for encrypted link)');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
  };

  // ICS Download for Apple Calendar & Outlook (60-minute duration)
  const handleDownloadIcs = () => {
    const { start, end } = getSessionTimeRange();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatIcsDate = (d: Date) => 
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Clover Heart Haven//Clarity Call//EN',
      'BEGIN:VEVENT',
      `SUMMARY:15-minute Free Clarity Call — Clover Heart Haven`,
      `DESCRIPTION:15-minute Free Clarity Call with Clover Heart Haven.\\nBooking Ref: ${bookingReference}\\nAttendee: ${formData.fullName}`,
      `LOCATION:Private Video Sanctuary`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `clover_clarity_call_${bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-[#f4f7f1] text-[#1c2c19] pt-24 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 transition-all duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Manage Booking Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => onNavigate ? onNavigate('Home') : window.location.assign('/')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#3e5939] hover:text-[#1c2c19] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Sanctuary
          </button>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setManageModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#2d4728]/20 hover:bg-[#eef4ec] text-xs font-semibold text-[#2d4728] transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw size={13} className="text-[#3b5936]" />
              Reschedule or Cancel Existing Session
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#526a4e]">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span className="font-semibold">Encrypted & HIPAA-Compliant</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Streamlined Booking Flow */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Header / Intro Banner */}
            <header className="space-y-3 pb-6 border-b border-[#2d4728]/15">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-xs font-semibold text-[#2d4728]">
                <Timer size={14} className="text-[#3b5936]" />
                15-Minute Free Clarity Call
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                Schedule Your Free Clarity Call
              </h1>

              <p className="text-base sm:text-lg text-[#4a5f47] max-w-2xl leading-relaxed">
                {formData.fullName 
                  ? `Welcome, ${formData.fullName.split(' ')[0]}. Select an available time below for your 15-minute clarity consultation.`
                  : 'A dedicated, unhurried 15-minute consultation with Dr. Elena Vance to explore your needs and discover if Clover Heart Haven is the right fit.'}
              </p>
            </header>

            {/* Main Booking Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* 1. Choose Date */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2e472a]">
                    1. Select Your Date
                  </label>
                  <span className="text-xs text-[#587352]">
                    Selected: <strong className="text-[#1c2c19]">{formData.selectedDateLabel || 'None'}</strong>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {dateOptions.slice(0, 14).map((d) => {
                      const isSelected = formData.selectedDateISO === d.isoDate;
                      return (
                        <button
                          key={d.isoDate}
                          type="button"
                          onClick={() => handleDateSelect(d)}
                          className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[82px] py-3 px-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                            isSelected
                              ? 'bg-[#1c2c19] text-white border-[#1c2c19] shadow-md scale-[1.02]'
                              : 'bg-[#fafcf8] hover:bg-[#eef4ec] border-[#2d4728]/15 text-[#1c2c19]'
                          }`}
                        >
                          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isSelected ? 'text-[#b8cca8]' : 'text-[#617b5d]'}`}>
                            {d.isTomorrow ? 'Tmrw' : d.dayName}
                          </span>
                          <span className="text-lg sm:text-xl font-bold my-0.5 font-mono">
                            {d.dayNum}
                          </span>
                          <span className={`text-[10px] ${isSelected ? 'text-[#e2ebd7]' : 'text-[#778f73]'}`}>
                            {d.monthName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[#71886c] mt-2 flex items-center gap-1">
                    <Info size={12} /> Scroll horizontally for upcoming available consultation dates.
                  </p>
                </div>
              </div>

              {/* 2. Choose Time Slot (Live from Cal.com) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2e472a]">
                    2. Select Time Slot (15 Minutes)
                  </label>
                  <div className="text-xs text-[#587352] flex items-center gap-1">
                    <Clock size={12} />
                    <span>Timezone: <strong>{formData.timezone.replace('_', ' ')}</strong></span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs space-y-4">
                  {isLoadingSlots ? (
                    <div className="p-8 text-center text-xs text-[#526a4e] flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-[#3b5936]" />
                      <span>Checking real-time calendar availability from Cal.com...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-6 rounded-xl bg-amber-50/70 border border-amber-200 text-center space-y-2">
                      <p className="text-sm font-semibold text-amber-900">No Open Slots on {formData.selectedDateLabel || 'this date'}</p>
                      <p className="text-xs text-amber-800 leading-relaxed max-w-md mx-auto">
                        All consultation slots for this date are filled or the therapist is not taking appointments. Please select another date above or retry.
                      </p>
                      <button
                        type="button"
                        onClick={() => formData.selectedDateISO && fetchCalSlots(formData.selectedDateISO)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100/50 cursor-pointer transition-colors shadow-2xs"
                      >
                        <RefreshCw size={12} /> Retry Availability
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Morning Slots */}
                      {availableSlots.some(s => s.includes('AM') && !s.startsWith('12:')) && (
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#5f7a5b] block mb-2">
                            Morning
                          </span>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableSlots
                              .filter(s => s.includes('AM') && !s.startsWith('12:'))
                              .map(slot => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, selectedTime: slot }))}
                                  className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${
                                    formData.selectedTime === slot
                                      ? 'bg-[#1c2c19] text-white border-[#1c2c19] shadow-xs'
                                      : 'bg-[#fafcf8] hover:bg-[#eef4ec] border-[#2d4728]/15 text-[#1c2c19]'
                                  }`}
                                >
                                  {slot}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Afternoon Slots */}
                      {availableSlots.some(s => s.includes('PM') && (s.startsWith('12:') || s.startsWith('1:') || s.startsWith('2:') || s.startsWith('3:') || s.startsWith('4:'))) && (
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#5f7a5b] block mb-2">
                            Afternoon
                          </span>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableSlots
                              .filter(s => s.includes('PM') && (s.startsWith('12:') || s.startsWith('1:') || s.startsWith('2:') || s.startsWith('3:') || s.startsWith('4:')))
                              .map(slot => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, selectedTime: slot }))}
                                  className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${
                                    formData.selectedTime === slot
                                      ? 'bg-[#1c2c19] text-white border-[#1c2c19] shadow-xs'
                                      : 'bg-[#fafcf8] hover:bg-[#eef4ec] border-[#2d4728]/15 text-[#1c2c19]'
                                  }`}
                                >
                                  {slot}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Evening Slots */}
                      {availableSlots.some(s => s.includes('PM') && !s.startsWith('12:') && !s.startsWith('1:') && !s.startsWith('2:') && !s.startsWith('3:') && !s.startsWith('4:')) && (
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#5f7a5b] block mb-2">
                            Late Afternoon / Evening
                          </span>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableSlots
                              .filter(s => s.includes('PM') && !s.startsWith('12:') && !s.startsWith('1:') && !s.startsWith('2:') && !s.startsWith('3:') && !s.startsWith('4:'))
                              .map(slot => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, selectedTime: slot }))}
                                  className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${
                                    formData.selectedTime === slot
                                      ? 'bg-[#1c2c19] text-white border-[#1c2c19] shadow-xs'
                                      : 'bg-[#fafcf8] hover:bg-[#eef4ec] border-[#2d4728]/15 text-[#1c2c19]'
                                  }`}
                                >
                                  {slot}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Confidential Details */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2e472a]">
                  3. Your Confidential Details
                </label>

                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1c2c19] mb-1.5 flex items-center gap-1.5">
                        <User size={14} className="text-[#3b5936]" /> Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sophia Miller"
                        value={formData.fullName}
                        onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#2d4728]/20 bg-[#fafcf8] text-sm text-[#1c2c19] focus:outline-none focus:ring-2 focus:ring-[#1c2c19]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1c2c19] mb-1.5 flex items-center gap-1.5">
                        <Mail size={14} className="text-[#3b5936]" /> Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. sophia@example.com"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#2d4728]/20 bg-[#fafcf8] text-sm text-[#1c2c19] focus:outline-none focus:ring-2 focus:ring-[#1c2c19]"
                      />
                      <span className="text-[11px] text-[#698464] mt-1 block">
                        Your private video link and calendar invite will be sent here.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">

 <div>

                  <label className="block text-xs font-bold text-[#1c2c19] mb-1.5 flex items-center gap-1.5">
  <Phone size={14} className="text-[#3b5936]" />
  Phone Number
</label>

<input
  type="tel"
  required
  autoComplete="tel"
  inputMode="tel"
  placeholder="+14155550192"
  value={formData.phone}
  onChange={e =>
    setFormData(prev => ({ ...prev, phone: e.target.value }))
  }
  className="w-full px-3.5 py-2.5 rounded-xl border border-[#2d4728]/20 bg-[#fafcf8] text-sm text-[#1c2c19] focus:outline-none focus:ring-2 focus:ring-[#1c2c19]"
/>

<span className="text-[11px] text-[#698464] mt-1 block">
  Include +, your country code, and your number. Example: +14155550192.
</span>





                   
                
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1c2c19] mb-1.5 flex items-center gap-1.5">
                        <FileText size={14} className="text-[#3b5936]" /> Brief Note / Context (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Anything you'd like to mention in advance..."
                        value={formData.notes}
                        onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#2d4728]/20 bg-[#fafcf8] text-sm text-[#1c2c19] focus:outline-none focus:ring-2 focus:ring-[#1c2c19]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reassurance Callout */}
              <div className="p-4 rounded-xl bg-[#eef4ec] border border-[#2d4728]/15 text-xs text-[#2c4728] flex items-center gap-3">
                <ShieldCheck size={20} className="text-emerald-700 shrink-0" />
                <div className="leading-relaxed">
                  <strong>Zero-Risk Commitment:</strong> 100% confidential under clinical ethics. Free cancellation or rescheduling up to 24 hours prior. We provide Superbills for PPO insurance reimbursement.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-[#ff4a1c] hover:bg-[#e23b10] disabled:bg-gray-400 text-white font-bold text-base transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 group uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Reserving Your Clarity Call...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck2 size={20} />
                    <span>Confirm & Reserve My Clarity Call</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>

          </div>
        )}

        {/* STEP 2: Instant Booking Confirmation Screen */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-400">
            
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#2d4728]/20 shadow-xl space-y-6 text-center sm:text-left">
              
              {/* Success Badge */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#2d4728]/10 pb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                      15-Minute Clarity Call Confirmed
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                      You&apos;re All Set, {formData.fullName.split(' ')[0]}!
                    </h2>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#f4f7f1] border border-[#2d4728]/15 text-xs text-center sm:text-right">
                  <span className="text-[#647f60] block text-[10px] uppercase font-mono">Booking Reference</span>
                  <strong className="font-mono text-sm text-[#1c2c19]">{bookingReference}</strong>
                </div>
              </div>

              {/* Consultation Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#fafcf8] border border-[#2d4728]/15 text-sm">
                <div className="space-y-2">
                  <div className="text-xs text-[#5f7a5b] font-bold uppercase tracking-wider">Date & Time</div>
                  <div className="flex items-center gap-2 text-[#1c2c19] font-semibold text-base">
                    <Calendar size={18} className="text-[#3b5936]" />
                    <span>{formData.selectedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2c4728] font-medium text-xs">
                    <Clock size={16} className="text-[#3b5936]" />
                    <span>{formData.selectedTime} ({formData.timezone.replace('_', ' ')})</span>
                  </div>
                </div>

                <div className="space-y-2 sm:border-l sm:border-[#2d4728]/15 sm:pl-4">
                  <div className="text-xs text-[#5f7a5b] font-bold uppercase tracking-wider">Duration & Format</div>
                  <div className="flex items-center gap-2 text-[#1c2c19] font-semibold text-base">
                    <Timer size={18} className="text-[#3b5936]" />
                    <span>15 Minutes (Complimentary)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#587352]">
                    <Video size={14} className="text-[#3b5936]" />
                    <span>Encrypted Video Sanctuary link sent to {formData.email}</span>
                  </div>
                </div>
              </div>

              {/* One-Click Calendar Integration */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2e472a] block">
                  Add to Your Calendar:
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c2c19] text-white text-xs sm:text-sm font-bold hover:bg-[#283e24] transition-all cursor-pointer shadow-xs"
                  >
                    <CalendarCheck2 size={16} className="text-[#a4bc87]" />
                    Add to Google Calendar (15 Min)
                    <ExternalLink size={12} className="opacity-70" />
                  </a>

                  <button
                    onClick={handleDownloadIcs}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#2d4728]/20 text-[#1c2c19] text-xs sm:text-sm font-bold hover:bg-[#eef4ec] transition-all cursor-pointer shadow-xs"
                  >
                    <Download size={16} className="text-[#3b5936]" />
                    Download Apple / Outlook (.ics)
                  </button>

                  <button
                    onClick={() => setManageModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#eef4ec] border border-[#2d4728]/20 text-[#2d4728] text-xs sm:text-sm font-bold hover:bg-[#dce9d8] transition-all cursor-pointer shadow-xs"
                  >
                    <RefreshCw size={14} className="text-[#3b5936]" />
                    Manage / Reschedule / Cancel
                  </button>
                </div>
              </div>

              {/* Next Steps Guide */}
              <div className="p-5 rounded-2xl bg-[#eef4ec] border border-[#2d4728]/15 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[#2d4728]/10">
                  <strong className="font-bold text-[#1c2c19] flex items-center gap-2">
                    <Sparkles size={16} className="text-[#3b5936]" />
                    What happens next?
                  </strong>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={12} />
                    {calcomSent ? 'Cal.com Reminders Active' : 'Cal.com Sync Active'}
                  </span>
                </div>
                <ol className="space-y-2 list-decimal list-inside text-[#2f482d] leading-relaxed">
                  <li>
                    A calendar invitation and video link have been created and sent to <strong>{formData.email}</strong> and your therapist.
                  </li>
                  <li>
                    Cal.com automated reminders will be sent to both parties 24 hours and 1 hour before the session.
                  </li>
                  <li>
                    No preparation is necessary. Come as you are—this is an unhurried space to breathe, be heard, and feel supported.
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate ? onNavigate('Home') : window.location.assign('/')}
                  className="px-5 py-2.5 rounded-xl bg-[#1c2c19] text-white text-xs sm:text-sm font-bold hover:bg-[#283e24] transition-all cursor-pointer"
                >
                  Return to Sanctuary Home
                </button>

                <button
                  onClick={() => onNavigate ? onNavigate('About') : window.location.assign('/about')}
                  className="px-5 py-2.5 rounded-xl bg-transparent border border-[#2d4728]/20 text-[#1c2c19] text-xs sm:text-sm font-semibold hover:bg-[#eef4ec] transition-all cursor-pointer"
                >
                  Read About Dr. Elena Vance
                </button>
              </div>

            </div>

          </div>
        )}

        {/* Self-service Client Reschedule/Cancel Modal */}
        <ManageBookingModal
          isOpen={manageModalOpen}
          onClose={() => setManageModalOpen(false)}
          initialReference={bookingReference}
        />

      </div>
    </div>
  );
};

