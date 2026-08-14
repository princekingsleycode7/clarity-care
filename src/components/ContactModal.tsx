import React, { useState } from 'react';
import { X, CheckCircle2, PhoneCall, Calendar, Clock, User, Mail, ShieldCheck } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'Gain Clarity',
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredTime: 'Morning (9am - 12pm)',
    topic: initialTopic,
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#fafcf8] rounded-3xl shadow-2xl overflow-hidden border border-[#d2dbc8]/50 p-6 sm:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#d2dbc8]/50 text-[#1c2c19] rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold text-[#1c2c19] mb-2 font-['Plus_Jakarta_Sans']">
              Call Request Received
            </h3>
            <p className="text-slate-600 text-sm max-w-xs mb-6">
              Thank you, <span className="font-semibold text-slate-800">{formData.name || 'friend'}</span>. One of our Clover Heart Haven specialists will reach out to you shortly.
            </p>
            <div className="w-full bg-[#f2f6ee] p-4 rounded-2xl text-left text-xs text-slate-600 space-y-1.5 mb-6">
              <p className="flex justify-between">
                <span className="text-slate-400">Preferred Time:</span>
                <span className="font-medium text-slate-800">{formData.preferredTime}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">Focus Area:</span>
                <span className="font-medium text-slate-800">{formData.topic}</span>
              </p>
            </div>
            <button
              onClick={handleReset}
              className="bg-[#1c2c19] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#283f24] transition-all shadow-md"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-[#eef4ea] text-[#1c2c19] rounded-2xl">
                <PhoneCall size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans']">
                  Request a Consultation
                </h3>
                <p className="text-xs text-slate-500">
                  Private & confidential phone consultation with our care team
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c2c19]/30 focus:border-[#1c2c19]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneCall size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c2c19]/30 focus:border-[#1c2c19]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c2c19]/30 focus:border-[#1c2c19]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Time
                  </label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c2c19]/30 focus:border-[#1c2c19] appearance-none"
                    >
                      <option>Morning (9am - 12pm)</option>
                      <option>Afternoon (12pm - 4pm)</option>
                      <option>Evening (4pm - 7pm)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Focus Area
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c2c19]/30 focus:border-[#1c2c19] appearance-none"
                    >
                      <option>Gain Clarity</option>
                      <option>Self-Awareness</option>
                      <option>Manage Stress</option>
                      <option>Anxiety & Relationship</option>
                      <option>General Therapy</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  How can we support you? (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Share anything you'd like us to know..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1c2c19]/30 focus:border-[#1c2c19]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#1c2c19] hover:bg-[#283f24] text-white py-3.5 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Confirm Call Request
                </button>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center pt-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                Your information is 100% confidential and HIPAA compliant.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
