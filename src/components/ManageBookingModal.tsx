import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  CalendarCheck2, 
  ArrowLeft,
  Trash2
} from 'lucide-react';

interface ManageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReference?: string;
}

export const ManageBookingModal: React.FC<ManageBookingModalProps> = ({
  isOpen,
  onClose,
  initialReference = '',
}) => {
  const [referenceInput, setReferenceInput] = useState(initialReference);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [booking, setBooking] = useState<any>(null);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Cancel state
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!isOpen) return null;

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanRef = referenceInput.trim();
    if (!cleanRef) {
      setErrorMessage('Please enter your booking reference or UID.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/cal/booking/${encodeURIComponent(cleanRef)}`);
      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        setBooking(data.booking);
      } else {
        setErrorMessage(data.error || 'No booking found matching this reference. Please check your reference UID.');
      }
    } catch (err: any) {
      setErrorMessage('Could not connect to the server to look up your booking.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotsForDate = async (dateStr: string) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/cal/slots?date=${encodeURIComponent(dateStr)}`);
      const data = await res.json();
      if (res.ok && data.slots && Array.isArray(data.slots)) {
        setRescheduleSlots(data.slots);
        if (data.slots.length > 0) {
          setRescheduleTime(data.slots[0]);
        } else {
          setRescheduleTime('');
        }
      }
    } catch {
      setRescheduleSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleStartReschedule = () => {
    setIsRescheduling(true);
    setIsCancelling(false);
    setErrorMessage('');
    setSuccessMessage('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    setRescheduleDate(tomorrowStr);
    fetchSlotsForDate(tomorrowStr);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      setErrorMessage('Please choose an available appointment date and time slot.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/cal/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingUid: booking.reference || booking.id,
          newDate: rescheduleDate,
          newTime: rescheduleTime,
          reason: rescheduleReason || 'Client self-service reschedule',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Your Clarity Call has been successfully rescheduled!');
        setBooking((prev: any) => ({
          ...prev,
          selected_date: rescheduleDate,
          selected_time: rescheduleTime,
          status: 'rescheduled',
        }));
        setIsRescheduling(false);
      } else {
        setErrorMessage(data.error || 'Could not reschedule appointment. Please try another time.');
      }
    } catch {
      setErrorMessage('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/cal/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingUid: booking.reference || booking.id,
          reason: cancelReason || 'Client self-service cancellation',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Your appointment has been cancelled.');
        setBooking((prev: any) => ({
          ...prev,
          status: 'cancelled',
        }));
        setIsCancelling(false);
      } else {
        setErrorMessage(data.error || 'Could not cancel appointment.');
      }
    } catch {
      setErrorMessage('Failed to connect to the server to cancel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#fafcf8] rounded-[28px] shadow-2xl overflow-hidden border border-[#d2dbc8] my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1c2c19] text-white px-5 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#82c974]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#a4bc87]">
              Manage Your Appointment
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Lookup Form */}
          {!booking && (
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Enter Booking Reference or Cal.com UID
                </label>
                <input
                  type="text"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  placeholder="e.g. 7198199 or CAL-123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c5d35]"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  You received this reference in your confirmation email or on screen after booking.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1c2c19] hover:bg-[#283f24] text-white py-3 rounded-full text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                <span>Find My Appointment</span>
              </button>
            </form>
          )}

          {/* Booking Details View */}
          {booking && !isRescheduling && !isCancelling && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#f0f4ec] border border-[#d2dbc8] space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#d2dbc8]/60 pb-2">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-[#1c2c19]">15-minute Free Clarity Call</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference:</span>
                  <span className="font-mono font-bold text-[#1c2c19]">{booking.reference || booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                    booking.status === 'rescheduled' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client Name:</span>
                  <span className="font-bold text-[#1c2c19]">{booking.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-[#1c2c19]">{booking.selected_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Time:</span>
                  <span className="font-bold text-[#1c2c19]">{booking.selected_time}</span>
                </div>
              </div>

              {booking.status !== 'cancelled' && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleStartReschedule}
                    className="flex-1 bg-[#1c2c19] hover:bg-[#283f24] text-white py-2.5 px-4 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={14} />
                    <span>Reschedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCancelling(true)}
                    className="flex-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 py-2.5 px-4 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Cancel Call</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setBooking(null)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 underline underline-offset-4 pt-2 cursor-pointer"
              >
                Look up a different booking
              </button>
            </div>
          )}

          {/* Reschedule View */}
          {booking && isRescheduling && (
            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="p-1 hover:bg-slate-100 rounded-full"
                >
                  <ArrowLeft size={16} />
                </button>
                <span>Select New Appointment Date & Time</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Select New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    fetchSlotsForDate(e.target.value);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#3c5d35]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Available Slots</label>
                {loadingSlots ? (
                  <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading Cal.com slots...</span>
                  </div>
                ) : rescheduleSlots.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs text-center">
                    No available slots on this day. Please pick another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setRescheduleTime(slot)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          rescheduleTime === slot
                            ? 'bg-[#3c5d35] text-white border-[#3c5d35]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Reason for Rescheduling (Optional)</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Schedule conflict"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !rescheduleTime}
                  className="flex-1 bg-[#1c2c19] hover:bg-[#283f24] text-white py-2.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <CalendarCheck2 size={14} />}
                  <span>Confirm Reschedule</span>
                </button>
              </div>
            </form>
          )}

          {/* Cancel View */}
          {booking && isCancelling && (
            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                <button
                  type="button"
                  onClick={() => setIsCancelling(false)}
                  className="p-1 hover:bg-slate-100 rounded-full"
                >
                  <ArrowLeft size={16} />
                </button>
                <span>Confirm Appointment Cancellation</span>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to cancel your <strong>15-minute Free Clarity Call</strong> scheduled for {booking.selected_date} at {booking.selected_time}?
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Reason for Cancellation (Optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Let us know why you need to cancel..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelling(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-rose-700 hover:bg-rose-800 text-white py-2.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
