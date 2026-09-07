import React, { useState, useEffect } from 'react';
import { 
  Cookie, 
  ShieldCheck, 
  Sliders, 
  Check, 
  CheckCircle2, 
  X, 
  ArrowLeft, 
  RotateCcw, 
  Lock, 
  Info, 
  ExternalLink,
  Sparkles,
  BarChart3,
  Megaphone,
  Layers,
  HelpCircle,
  Clock,
  Printer
} from 'lucide-react';

interface CookiesPageProps {
  onNavigate?: (page: string) => void;
}

export interface CookiePreferencesState {
  necessary: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const DEFAULT_PREFERENCES: CookiePreferencesState = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
  timestamp: new Date().toISOString()
};

export const getStoredCookiePreferences = (): CookiePreferencesState => {
  try {
    const raw = localStorage.getItem('clover_cookie_preferences');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PREFERENCES, ...parsed, necessary: true };
    }
  } catch (e) {
    // Fallback if localStorage blocked
  }
  return DEFAULT_PREFERENCES;
};

export const saveStoredCookiePreferences = (prefs: CookiePreferencesState) => {
  try {
    const payload = { ...prefs, necessary: true, timestamp: new Date().toISOString() };
    localStorage.setItem('clover_cookie_preferences', JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('clover_cookies_updated', { detail: payload }));
  } catch (e) {
    // Graceful error handle
  }
};

export const CookiesPage: React.FC<CookiesPageProps> = ({ onNavigate }) => {
  const [preferences, setPreferences] = useState<CookiePreferencesState>(() => getStoredCookiePreferences());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('controls');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleToggle = (key: keyof CookiePreferencesState) => {
    if (key === 'necessary') return; // Cannot toggle necessary
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    saveStoredCookiePreferences(preferences);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleAcceptAll = () => {
    const allOn: CookiePreferencesState = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    setPreferences(allOn);
    saveStoredCookiePreferences(allOn);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly: CookiePreferencesState = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    setPreferences(essentialOnly);
    saveStoredCookiePreferences(essentialOnly);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    saveStoredCookiePreferences(DEFAULT_PREFERENCES);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const cookieInventory = [
    {
      name: '__haven_session',
      category: 'Strictly Necessary',
      purpose: 'Maintains your secure browsing session, CSRF protection, and server routing.',
      duration: 'Session (expires on close)',
      provider: 'Clover Heart Haven (First Party)'
    },
    {
      name: 'sb-auth-token',
      category: 'Strictly Necessary',
      purpose: 'Encrypted JSON Web Token enabling client booking state and account authentication.',
      duration: '30 Days',
      provider: 'Supabase / Auth Service'
    },
    {
      name: 'clover_cookie_preferences',
      category: 'Strictly Necessary',
      purpose: 'Stores your active cookie consent choices and category toggles locally.',
      duration: '1 Year',
      provider: 'Clover Heart Haven (Local Storage)'
    },
    {
      name: 'haven_pref_tz',
      category: 'Functional',
      purpose: 'Remembers your local timezone so therapy appointment slots display accurately.',
      duration: '6 Months',
      provider: 'Clover Heart Haven'
    },
    {
      name: 'haven_topic_draft',
      category: 'Functional',
      purpose: 'Saves your draft intake thoughts in your browser so you do not lose progress if reloaded.',
      duration: '7 Days (Local Storage)',
      provider: 'Clover Heart Haven'
    },
    {
      name: '_haven_analytics_id',
      category: 'Analytics & Performance',
      purpose: 'Anonymized identifier allowing us to measure aggregate page visits and resource usage.',
      duration: '90 Days',
      provider: 'Clover Heart Haven Telemetry'
    },
    {
      name: 'utm_source_ref',
      category: 'Marketing & Attribution',
      purpose: 'Tracks which educational article or partner recommended our recovery ebook.',
      duration: '30 Days',
      provider: 'Clover Heart Haven Attribution'
    }
  ];

  return (
    <div className="w-full bg-[#f6f9f3] text-[#1c2c19] pt-24 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 transition-all duration-300">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate ? onNavigate('Home') : window.history.back()}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#3e5939] hover:text-[#1c2c19] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Sanctuary
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate ? onNavigate('Privacy') : null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#2d4728]/15 text-xs font-semibold text-[#1c2c19] hover:bg-[#eaf1e6] transition-all cursor-pointer shadow-xs"
            >
              <ShieldCheck size={14} className="text-[#a4bc87]" />
              <span>View Privacy Policy</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#2d4728]/15 text-xs font-semibold text-[#1c2c19] hover:bg-[#eaf1e6] transition-all cursor-pointer shadow-xs"
              title="Print Cookie Policy"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Hero Header */}
        <header className="space-y-4 pb-6 border-b border-[#2d4728]/15">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-xs font-semibold text-[#2d4728]">
            <Cookie size={14} className="text-[#a4bc87]" />
            Interactive Privacy & Cookie Controls
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1c2c19] font-['Plus_Jakarta_Sans']">
            Cookie Preferences & Transparency
          </h1>
          <p className="text-base sm:text-lg text-[#4a5f47] max-w-3xl leading-relaxed">
            We believe in complete autonomy. Customize exactly which cookies and storage mechanisms are enabled during your visit to Clover Heart Haven.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#62775f] pt-2">
            <span><strong>Active Status:</strong> {preferences.analytics && preferences.marketing ? 'All Cookies Enabled' : preferences.functional ? 'Customized Balance' : 'Essential Only'}</span>
            <span>•</span>
            <span><strong>Last Saved:</strong> {new Date(preferences.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </header>

        {/* Real-time Save Confirmation Toast */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check size={18} />
              </div>
              <div>
                <strong className="block font-bold text-sm">Cookie Preferences Successfully Saved</strong>
                <p className="text-xs text-emerald-800">Your privacy choices have been updated and are active immediately across this session.</p>
              </div>
            </div>
            <button 
              onClick={() => setSaveSuccess(false)} 
              className="p-1.5 text-emerald-700 hover:text-emerald-900 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Global Quick Action Buttons */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#eaf1e6] border border-[#2d4728]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-bold text-[#1c2c19] flex items-center gap-2">
              <Sliders size={18} className="text-[#3b5936]" />
              Quick Action Controls
            </h2>
            <p className="text-xs sm:text-sm text-[#465a43]">
              Choose a preset or fine-tune individual categories below.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleRejectNonEssential}
              className="px-4 py-2 rounded-xl bg-white border border-[#2d4728]/20 text-[#1c2c19] text-xs font-bold hover:bg-[#dce7d6] transition-all cursor-pointer shadow-2xs"
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 rounded-xl bg-[#1c2c19] text-white text-xs font-bold hover:bg-[#283e24] transition-all cursor-pointer shadow-2xs"
            >
              Accept All Cookies
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white border border-[#2d4728]/20 text-[#465a43] hover:text-[#1c2c19] hover:bg-[#dce7d6] transition-all cursor-pointer"
              title="Reset to default settings"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Interactive Category Cards */}
        <div className="space-y-6">
          
          {/* Category 1: Strictly Necessary */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-[#1c2c19] flex items-center justify-center shrink-0 mt-0.5">
                  <Lock size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-[#1c2c19]">
                      1. Strictly Necessary & Security Cookies
                    </h3>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1c2c19] text-white">
                      Always Active (Required)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#465a43] leading-relaxed">
                    These cookies are essential for our website to function properly and securely. They enable core security features, prevent cross-site forgery (CSRF), remember your consent preferences, and authenticate booking requests.
                  </p>
                </div>
              </div>

              {/* Locked Toggle */}
              <div className="shrink-0 flex items-center gap-2 cursor-not-allowed opacity-75">
                <div className="w-12 h-6.5 rounded-full bg-[#1c2c19] flex items-center justify-end px-1">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs">
                    <Check size={12} className="text-[#1c2c19]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f7faf5] border border-[#2d4728]/10 text-xs text-[#3a5038] flex items-center gap-2">
              <Info size={15} className="shrink-0 text-[#2d4728]" />
              Cannot be disabled. Without these cookies, basic page navigation and appointment submission would fail.
            </div>
          </div>

          {/* Category 2: Functional & Personalization */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-[#1c2c19] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={20} className="text-[#3b5936]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-[#1c2c19]">
                      2. Functional & Experience Preferences
                    </h3>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${preferences.functional ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                      {preferences.functional ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#465a43] leading-relaxed">
                    These cookies allow our platform to remember choices you make—such as your local timezone for scheduling, your preferred consultation topic, and preserving draft notes so you do not lose intake progress.
                  </p>
                </div>
              </div>

              {/* Interactive Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={preferences.functional}
                onClick={() => handleToggle('functional')}
                className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1c2c19] ${
                  preferences.functional ? 'bg-[#1c2c19]' : 'bg-[#c5d3bf]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs flex items-center justify-center ${
                  preferences.functional ? 'translate-x-6' : 'translate-x-1'
                }`}>
                  {preferences.functional ? <Check size={11} className="text-[#1c2c19]" /> : null}
                </div>
              </button>
            </div>
          </div>

          {/* Category 3: Analytics & Performance */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-[#1c2c19] flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 size={20} className="text-[#3b5936]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-[#1c2c19]">
                      3. Analytics & Performance Measurement
                    </h3>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${preferences.analytics ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                      {preferences.analytics ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#465a43] leading-relaxed">
                    These cookies collect aggregate, fully anonymized information about how visitors navigate our sanctuary. They tell us which articles help readers most, detect broken links, and optimize page load speeds. No personal identifying information is stored.
                  </p>
                </div>
              </div>

              {/* Interactive Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={preferences.analytics}
                onClick={() => handleToggle('analytics')}
                className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1c2c19] ${
                  preferences.analytics ? 'bg-[#1c2c19]' : 'bg-[#c5d3bf]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs flex items-center justify-center ${
                  preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                }`}>
                  {preferences.analytics ? <Check size={11} className="text-[#1c2c19]" /> : null}
                </div>
              </button>
            </div>
          </div>

          {/* Category 4: Marketing & Communication Attribution */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1c2c19]/5 border border-[#1c2c19]/10 text-[#1c2c19] flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone size={20} className="text-[#3b5936]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-[#1c2c19]">
                      4. Marketing & Resource Attribution
                    </h3>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${preferences.marketing ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                      {preferences.marketing ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#465a43] leading-relaxed">
                    Used strictly to attribute which educational newsletter or article brought you to our lead magnet, ensuring you do not receive duplicate ebook follow-ups. We NEVER use these to sell ad space or share your profile with third-party networks.
                  </p>
                </div>
              </div>

              {/* Interactive Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={preferences.marketing}
                onClick={() => handleToggle('marketing')}
                className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1c2c19] ${
                  preferences.marketing ? 'bg-[#1c2c19]' : 'bg-[#c5d3bf]'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs flex items-center justify-center ${
                  preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                }`}>
                  {preferences.marketing ? <Check size={11} className="text-[#1c2c19]" /> : null}
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Save Preferences Floating/Fixed Action Banner */}
        <div className="p-6 rounded-2xl bg-white border border-[#2d4728]/20 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="block text-sm font-bold text-[#1c2c19]">Ready to Apply Your Choices?</strong>
            <p className="text-xs text-[#465a43]">Changes take effect immediately and are stored locally in your browser.</p>
          </div>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1c2c19] hover:bg-[#283e24] text-white text-sm font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} className="text-[#a4bc87]" />
            Save My Preferences
          </button>
        </div>

        {/* Complete Cookie Inventory Table */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <Layers size={18} className="text-[#3b5936]" />
            Complete Cookie & Storage Inventory
          </h2>
          <p className="text-xs sm:text-sm text-[#465a43]">
            For full transparency, here is the complete breakdown of digital identifiers, keys, and tokens used across our domain.
          </p>

          <div className="overflow-x-auto rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#f0f5ed] border-b border-[#2d4728]/15 text-[#1c2c19] font-bold">
                <tr>
                  <th className="p-3.5">Cookie / Key</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Purpose</th>
                  <th className="p-3.5">Lifespan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d4728]/10 text-[#30472e]">
                {cookieInventory.map((c, i) => (
                  <tr key={i} className="hover:bg-[#fbfdfa] transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-[#1c2c19]">
                      {c.name}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-[#eef4ec] text-[11px] font-semibold text-[#2c4728]">
                        {c.category}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs text-xs sm:text-sm text-[#465a43]">
                      {c.purpose}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-xs text-[#587352]">
                      {c.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Browser Instructions Guide */}
        <section className="p-6 sm:p-7 rounded-2xl bg-white border border-[#2d4728]/15 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-[#1c2c19] font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <HelpCircle size={18} className="text-[#3b5936]" />
            How to Control Cookies in Your Web Browser
          </h2>
          <p className="text-xs sm:text-sm text-[#465a43] leading-relaxed">
            In addition to our preference manager, most web browsers allow you to manage or delete stored cookies directly through their settings menus:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#f7faf5] border border-[#2d4728]/10">
              <strong className="block font-bold text-[#1c2c19] mb-1">Google Chrome</strong>
              <p className="text-[#465a43]">Settings → Privacy & Security → Cookies and other site data</p>
            </div>
            <div className="p-3 rounded-xl bg-[#f7faf5] border border-[#2d4728]/10">
              <strong className="block font-bold text-[#1c2c19] mb-1">Apple Safari</strong>
              <p className="text-[#465a43]">Preferences → Privacy → Manage Website Data / Block All Cookies</p>
            </div>
            <div className="p-3 rounded-xl bg-[#f7faf5] border border-[#2d4728]/10">
              <strong className="block font-bold text-[#1c2c19] mb-1">Mozilla Firefox</strong>
              <p className="text-[#465a43]">Options → Privacy & Security → Enhanced Tracking Protection</p>
            </div>
            <div className="p-3 rounded-xl bg-[#f7faf5] border border-[#2d4728]/10">
              <strong className="block font-bold text-[#1c2c19] mb-1">Microsoft Edge</strong>
              <p className="text-[#465a43]">Settings → Site Permissions → Cookies and site data</p>
            </div>
          </div>
          <p className="text-xs text-[#5b7355] pt-1">
            We fully recognize and honor automated Global Privacy Control (GPC) and Do Not Track (DNT) header signals transmitted by privacy-focused browsers.
          </p>
        </section>

      </div>
    </div>
  );
};
