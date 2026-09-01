import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Smartphone, 
  Monitor, 
  Search, 
  Download, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  Mail, 
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Lock,
  Activity,
  Target,
  Sparkles,
  Tag
} from 'lucide-react';

interface ProductionBooking {
  id: string;
  reference: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  selected_date: string;
  selected_time: string;
  timezone?: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

interface Lead {
  id: string;
  first_name: string;
  email: string;
  utm_source?: string | null;
  created_at: string;
}

interface LandingBooking {
  id: string;
  lead_id?: string | null;
  email?: string | null;
  first_name?: string;
  scheduled_at: string;
  time_slot: string;
  status: string;
  created_at: string;
}

interface ScrollMilestone {
  milestone: string;
  percentage: number;
  count: number;
}

interface AnalyticsData {
  isSupabaseConnected: boolean;
  stats: {
    totalVisitors: number;
    totalPageviews: number;
    totalCloverBookings: number;
    totalLeads: number;
    totalLandingBookings: number;
    conversionRate: string;
  };
  scrollFunnel: ScrollMilestone[];
  sectionViews: Record<string, number>;
  deviceCounts: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  productionBookings: ProductionBooking[];
  leads: Lead[];
  landingBookings: LandingBooking[];
  recentActivity: Array<{
    id: string;
    session_id: string;
    event_type: string;
    page_path: string;
    scroll_percentage?: number;
    device_type: string;
    created_at: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<
    'chh_bookings' | 'landing_leads' | 'landing_bookings' | 'analytics' | 'supabase'
  >('chh_bookings');
  
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>(
    () => sessionStorage.getItem('chh_admin_pass') || 'clover2026'
  );
  const [passcode, setPasscode] = useState<string>(
    () => sessionStorage.getItem('chh_admin_pass') || 'clover2026'
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>('');

  const sqlSchemaText = `-- Complete Supabase Schema for Clover Heart Haven & Landing Page
-- 1. Clover Heart Haven Intake Bookings Table (productionbookings)
CREATE TABLE IF NOT EXISTS public.productionbookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255),
    selected_date VARCHAR(100) NOT NULL,
    selected_time VARCHAR(50) NOT NULL,
    timezone VARCHAR(100) DEFAULT 'America/Los_Angeles',
    status VARCHAR(50) DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Landing Page Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    utm_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Landing Page Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    email TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    page_path VARCHAR(255) DEFAULT '/',
    scroll_percentage INTEGER,
    section_id VARCHAR(100),
    referrer TEXT,
    user_agent TEXT,
    device_type VARCHAR(50),
    screen_width INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.productionbookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert productionbookings" ON public.productionbookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon insert leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon insert bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon insert analytics" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow select productionbookings" ON public.productionbookings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update productionbookings" ON public.productionbookings FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow select leads" ON public.leads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow select bookings" ON public.bookings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update bookings" ON public.bookings FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow select analytics" ON public.analytics_events FOR SELECT TO anon, authenticated USING (true);`;

  const fetchData = async (overridePass?: string) => {
    const activePass = overridePass !== undefined ? overridePass : passcode;
    setIsLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`/api/admin/data?passcode=${encodeURIComponent(activePass)}`, {
        headers: { 'x-admin-passcode': activePass }
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Incorrect admin passcode / PIN. Default is clover2026');
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setIsAuthenticated(true);
        setPasscode(activePass);
        sessionStorage.setItem('chh_admin_pass', activePass);
      } else {
        setAuthError('Could not fetch admin data from server.');
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setAuthError('Network error connecting to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(passcodeInput.trim());
  };

  const handleLock = () => {
    sessionStorage.removeItem('chh_admin_pass');
    setIsAuthenticated(false);
  };

  // Status update for Clover Heart Haven Intake Bookings
  const handleUpdateCloverStatus = async (bookingId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-passcode': passcode 
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            productionBookings: prev.productionBookings.map(b => 
              (b.id === bookingId || b.reference === bookingId) ? { ...b, status: newStatus } : b
            )
          };
        });
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Status update for Landing Page Bookings
  const handleUpdateLandingBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/landing-bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-passcode': passcode 
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            landingBookings: prev.landingBookings.map(b => 
              b.id === bookingId ? { ...b, status: newStatus } : b
            )
          };
        });
      }
    } catch (err) {
      console.error('Status update failed for landing booking:', err);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Export CSV for Clover Heart Haven Bookings
  const handleExportCloverCsv = () => {
    if (!data?.productionBookings) return;
    const headers = ['Reference', 'Name', 'Phone', 'Address', 'Email', 'Scheduled Date', 'Scheduled Time', 'Status', 'Notes', 'Created At'];
    const rows = data.productionBookings.map(b => [
      `"${b.reference}"`,
      `"${b.name}"`,
      `"${b.phone}"`,
      `"${b.address.replace(/"/g, '""')}"`,
      `"${b.email || ''}"`,
      `"${b.selected_date}"`,
      `"${b.selected_time}"`,
      `"${b.status}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(b.created_at).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `clover_haven_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for Landing Page Leads
  const handleExportLeadsCsv = () => {
    if (!data?.leads) return;
    const headers = ['Lead ID', 'First Name', 'Email', 'UTM Campaign Source', 'Captured At'];
    const rows = data.leads.map(l => [
      `"${l.id}"`,
      `"${l.first_name}"`,
      `"${l.email}"`,
      `"${l.utm_source || 'direct'}"`,
      `"${new Date(l.created_at).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `landing_page_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for Landing Page Bookings
  const handleExportLandingBookingsCsv = () => {
    if (!data?.landingBookings) return;
    const headers = ['Booking ID', 'Lead ID', 'Lead Name', 'Email', 'Scheduled At', 'Time Slot', 'Status', 'Created At'];
    const rows = data.landingBookings.map(b => [
      `"${b.id}"`,
      `"${b.lead_id || ''}"`,
      `"${b.first_name || ''}"`,
      `"${b.email || ''}"`,
      `"${b.scheduled_at}"`,
      `"${b.time_slot}"`,
      `"${b.status || 'confirmed'}"`,
      `"${new Date(b.created_at).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `landing_page_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Clover Heart Haven Bookings
  const filteredCloverBookings = (data?.productionBookings || []).filter(b => {
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      (b.email && b.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter Landing Page Leads
  const filteredLeads = (data?.leads || []).filter(l => {
    const matchesSearch = 
      l.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.utm_source && l.utm_source.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Filter Landing Page Bookings
  const filteredLandingBookings = (data?.landingBookings || []).filter(b => {
    const matchesSearch = 
      (b.email && b.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.first_name && b.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.time_slot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.status && b.status.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f7faf5] text-[#1c2c19] font-['Plus_Jakarta_Sans'] pb-20 selection:bg-[#c2d7b5]">
      
      {/* Top Header Bar */}
      <header className="bg-[#1c2c19] text-white sticky top-0 z-40 shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#a4bc87] text-[#1c2c19] flex items-center justify-center font-bold text-lg shadow-inner">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Clover Admin Sanctuary</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-[#a4bc87] font-semibold uppercase tracking-wider">
                  Internal Control
                </span>
              </div>
              <p className="text-xs text-[#d2dbc8]/80">Unified Database & Telemetry Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Status Pill */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
              data?.isSupabaseConnected 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <Database size={13} />
              <span>{data?.isSupabaseConnected ? 'Supabase Live' : 'Local Dev Cache'}</span>
            </div>

            <button
              onClick={() => fetchData()}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer hover:rotate-180 duration-500"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={handleLock}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Lock Admin Session"
            >
              <Lock size={12} />
              <span>Lock</span>
            </button>

            <a
              href="/"
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-1.5 transition-all"
            >
              <span>View Site</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </header>

      {/* PIN Authentication Screen if Locked */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto px-4 pt-20">
          <div className="bg-white rounded-3xl p-8 border border-[#d2dbc8] shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#1c2c19] text-[#a4bc87] flex items-center justify-center mx-auto shadow-md">
              <Lock size={28} />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-[#1c2c19]">Admin Passcode Required</h2>
              <p className="text-xs text-slate-600">
                Enter your secure administrator PIN or passcode to access the live analytics and bookings hub.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Security PIN / Passcode
                </label>
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter PIN (e.g. clover2026)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2b4c24] text-sm font-mono tracking-widest text-slate-800"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium">{authError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#1c2c19] hover:bg-[#2c4724] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Unlock Admin Hub</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Default system PIN is <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">clover2026</code> (configurable via <code className="font-mono text-slate-600">ADMIN_PASSCODE</code>)
            </div>
          </div>
        </div>
      ) : (
        /* Main Container */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* KPI Overview Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Clover Haven Bookings */}
          <div className="bg-white p-5 rounded-3xl border border-[#d2dbc8] shadow-sm hover:shadow-md transition-shadow space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clover Haven Intakes</span>
              <div className="w-8 h-8 rounded-full bg-[#eef6ec] text-[#234b1d] flex items-center justify-center">
                <Calendar size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1c2c19]">
              {data?.stats?.totalCloverBookings ?? 0}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Table: productionbookings</span>
            </p>
          </div>

          {/* Landing Page Leads */}
          <div className="bg-white p-5 rounded-3xl border border-[#d2dbc8] shadow-sm hover:shadow-md transition-shadow space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Landing Leads</span>
              <div className="w-8 h-8 rounded-full bg-[#fdf4ea] text-[#9c581e] flex items-center justify-center">
                <Target size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1c2c19]">
              {data?.stats?.totalLeads ?? 0}
            </div>
            <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <Sparkles size={12} />
              <span>Table: leads</span>
            </p>
          </div>

          {/* Landing Page Bookings */}
          <div className="bg-white p-5 rounded-3xl border border-[#d2dbc8] shadow-sm hover:shadow-md transition-shadow space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Landing Bookings</span>
              <div className="w-8 h-8 rounded-full bg-[#edf2fb] text-[#255294] flex items-center justify-center">
                <Calendar size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1c2c19]">
              {data?.stats?.totalLandingBookings ?? 0}
            </div>
            <p className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
              <Clock size={12} />
              <span>Table: bookings</span>
            </p>
          </div>

          {/* Total Visitors */}
          <div className="bg-white p-5 rounded-3xl border border-[#d2dbc8] shadow-sm hover:shadow-md transition-shadow space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visitors & Hits</span>
              <div className="w-8 h-8 rounded-full bg-[#f0f4ec] text-[#2c4724] flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1c2c19]">
              {data?.stats?.totalVisitors ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Activity size={12} className="text-[#3c5d35]" />
              <span>{data?.stats?.totalPageviews ?? 0} pageviews logged</span>
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white p-5 rounded-3xl border border-[#d2dbc8] shadow-sm hover:shadow-md transition-shadow space-y-2 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conversion</span>
              <div className="w-8 h-8 rounded-full bg-[#f3f7f0] text-[#36592d] flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1c2c19]">
              {data?.stats?.conversionRate ?? '0.0'}%
            </div>
            <p className="text-[11px] text-slate-500">Across both channels</p>
          </div>

        </section>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#d2dbc8] gap-3 pb-1">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            
            {/* Tab 1: Clover Heart Haven Bookings */}
            <button
              onClick={() => { setActiveTab('chh_bookings'); setSearchQuery(''); }}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'chh_bookings'
                  ? 'border-[#1c2c19] text-[#1c2c19]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar size={16} />
              <span>Clover Haven Bookings</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800">
                {data?.productionBookings?.length ?? 0}
              </span>
            </button>

            {/* Tab 2: Landing Page Leads */}
            <button
              onClick={() => { setActiveTab('landing_leads'); setSearchQuery(''); }}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'landing_leads'
                  ? 'border-[#1c2c19] text-[#1c2c19]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Target size={16} />
              <span>Landing Page Leads</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800">
                {data?.leads?.length ?? 0}
              </span>
            </button>

            {/* Tab 3: Landing Page Bookings */}
            <button
              onClick={() => { setActiveTab('landing_bookings'); setSearchQuery(''); }}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'landing_bookings'
                  ? 'border-[#1c2c19] text-[#1c2c19]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock size={16} />
              <span>Landing Bookings</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-800">
                {data?.landingBookings?.length ?? 0}
              </span>
            </button>

            {/* Tab 4: Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'border-[#1c2c19] text-[#1c2c19]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp size={16} />
              <span>Visitor Flow & Scroll Depth</span>
            </button>

            {/* Tab 5: Supabase Setup */}
            <button
              onClick={() => setActiveTab('supabase')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'supabase'
                  ? 'border-[#1c2c19] text-[#1c2c19]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database size={16} />
              <span>Database Schemas</span>
            </button>
          </div>

          {/* CSV Export Action Button based on Tab */}
          <div>
            {activeTab === 'chh_bookings' && (
              <button
                onClick={handleExportCloverCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 shadow-sm transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Export Clover CSV</span>
              </button>
            )}
            {activeTab === 'landing_leads' && (
              <button
                onClick={handleExportLeadsCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 shadow-sm transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Export Leads CSV</span>
              </button>
            )}
            {activeTab === 'landing_bookings' && (
              <button
                onClick={handleExportLandingBookingsCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 shadow-sm transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Export Bookings CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: CLOVER HEART HAVEN INTAKE BOOKINGS */}
        {activeTab === 'chh_bookings' && (
          <section className="space-y-4">
            
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, phone, address, ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2c4724] text-slate-800 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2c4724] shadow-sm cursor-pointer"
                >
                  <option value="all">All Statuses ({data?.productionBookings?.length ?? 0})</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings Card Feed */}
            {filteredCloverBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#f0f4ec] text-[#2c4724] flex items-center justify-center mx-auto">
                  <Calendar size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-700">No Clover Heart Haven bookings found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search criteria or filter to see more appointments.'
                    : 'Appointments scheduled via the clinic consultation modal will populate here in real-time.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCloverBookings.map((b) => (
                  <div
                    key={b.id || b.reference}
                    className="bg-white rounded-3xl p-5 border border-[#d2dbc8] shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      
                      {/* Header Badge & Reference */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f0f4ec] text-[#2c4724] border border-[#d2dbc8]">
                          {b.reference}
                        </span>

                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      {/* Client Info */}
                      <div>
                        <h4 className="text-base font-bold text-[#1c2c19]">{b.name}</h4>
                        <p className="text-xs text-slate-500">
                          Intake logged {new Date(b.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Appointment Time Banner */}
                      <div className="bg-[#f7faf5] rounded-2xl p-3 border border-[#e4ebd9] space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1c2c19]">
                          <Calendar size={13} className="text-[#3c5d35]" />
                          <span>{b.selected_date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Clock size={13} className="text-slate-400" />
                          <span>{b.selected_time} ({b.timezone || 'America/Los_Angeles'})</span>
                        </div>
                      </div>

                      {/* Contact & Location Details */}
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-[#2c4724] shrink-0 mt-0.5" />
                          <span className="leading-snug">{b.address}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-[#2c4724] shrink-0" />
                          <a href={`tel:${b.phone}`} className="hover:underline font-semibold text-[#1c2c19]">
                            {b.phone}
                          </a>
                        </div>

                        {b.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-[#2c4724] shrink-0" />
                            <a href={`mailto:${b.email}`} className="hover:underline truncate text-slate-600">
                              {b.email}
                            </a>
                          </div>
                        )}

                        {b.notes && (
                          <div className="pt-2 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                            "{b.notes}"
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Status Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-semibold text-slate-400">Set Status:</div>
                      <div className="flex items-center gap-1.5">
                        {b.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateCloverStatus(b.id, 'completed')}
                            className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateCloverStatus(b.id, 'cancelled')}
                            className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        {b.status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateCloverStatus(b.id, 'confirmed')}
                            className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            Reconfirm
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: LANDING PAGE LEADS (Table: leads) */}
        {activeTab === 'landing_leads' && (
          <section className="space-y-4">
            
            {/* Search Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search lead name, email, UTM source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2c4724] text-slate-800 shadow-sm"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing <strong className="text-slate-800">{filteredLeads.length}</strong> lead magnet subscribers from table <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">leads</code>
              </div>
            </div>

            {/* Leads Table View */}
            {filteredLeads.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#fdf4ea] text-[#9c581e] flex items-center justify-center mx-auto">
                  <Target size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-700">No Landing Page leads found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Lead magnet opt-ins submitted from your campaigns will appear in this dedicated list.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#d2dbc8] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f7faf5] border-b border-[#d2dbc8] text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-5">First Name</th>
                        <th className="py-3.5 px-5">Email Address</th>
                        <th className="py-3.5 px-5">Campaign / UTM Source</th>
                        <th className="py-3.5 px-5">Captured At</th>
                        <th className="py-3.5 px-5 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-5 font-bold text-[#1c2c19] flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#eef6ec] text-[#2c4724] flex items-center justify-center text-xs font-extrabold uppercase">
                              {lead.first_name.charAt(0)}
                            </div>
                            <span>{lead.first_name}</span>
                          </td>
                          <td className="py-3.5 px-5">
                            <a href={`mailto:${lead.email}`} className="text-[#2c4724] hover:underline font-medium">
                              {lead.email}
                            </a>
                          </td>
                          <td className="py-3.5 px-5">
                            {lead.utm_source ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                                <Tag size={10} />
                                {lead.utm_source}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">direct</span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-slate-500">
                            {new Date(lead.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <a
                              href={`mailto:${lead.email}?subject=Welcome%20from%20Clover%20Heart%20Haven`}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1c2c19] hover:bg-[#2c4724] text-white text-[11px] font-bold shadow-sm transition-all"
                            >
                              <Mail size={11} />
                              <span>Email Lead</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: LANDING PAGE BOOKINGS (Table: bookings) */}
        {activeTab === 'landing_bookings' && (
          <section className="space-y-4">
            
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search email, lead name, slot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2c4724] text-slate-800 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2c4724] shadow-sm cursor-pointer"
                >
                  <option value="all">All ({data?.landingBookings?.length ?? 0})</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Landing Bookings Cards */}
            {filteredLandingBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#edf2fb] text-[#255294] flex items-center justify-center mx-auto">
                  <Clock size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-700">No landing page bookings found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Appointments submitted from the lead magnet flow (table <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">bookings</code>) will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLandingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl p-5 border border-[#d2dbc8] shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#255294]" />
                          <span>Landing Booking</span>
                        </span>

                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status || 'confirmed'}
                        </span>
                      </div>

                      {/* Scheduled Time Block */}
                      <div className="bg-[#f0f4f8] rounded-2xl p-3 border border-slate-200 space-y-1">
                        <div className="text-xs font-bold text-slate-900">
                          {new Date(b.scheduled_at).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          <span>Time Slot: {b.time_slot}</span>
                        </div>
                      </div>

                      {/* Lead Details */}
                      <div className="space-y-1 text-xs">
                        {b.first_name && (
                          <div className="font-bold text-[#1c2c19]">
                            Lead Name: <span className="font-normal text-slate-700">{b.first_name}</span>
                          </div>
                        )}
                        {b.email && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail size={13} className="text-slate-400" />
                            <a href={`mailto:${b.email}`} className="text-[#2c4724] hover:underline font-semibold">
                              {b.email}
                            </a>
                          </div>
                        )}
                        {b.lead_id && (
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            Lead UUID: {b.lead_id}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Quick Status Toggles */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">Update:</span>
                      <div className="flex items-center gap-1.5">
                        {b.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateLandingBookingStatus(b.id, 'completed')}
                            className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Completed
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateLandingBookingStatus(b.id, 'cancelled')}
                            className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        {b.status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateLandingBookingStatus(b.id, 'confirmed')}
                            className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: ANALYTICS & SCROLL DEPTH */}
        {activeTab === 'analytics' && (
          <section className="space-y-6">
            
            {/* Scroll Depth Funnel Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-[#d2dbc8] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1c2c19]">Visitor Scroll Depth Retention Funnel</h3>
                  <p className="text-xs text-slate-500">Tracks how far visitors read through your sanctuary narrative</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#f0f4ec] text-[#2c4724] text-xs font-bold">
                  Live Telemetry
                </div>
              </div>

              <div className="space-y-4">
                {(data?.scrollFunnel || []).map((step, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{step.milestone}</span>
                      <span className="text-[#2c4724] font-bold">{step.percentage}% ({step.count} visitors)</span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#2c4724] to-[#739a67] rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(step.percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Views Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#d2dbc8] shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-[#1c2c19] uppercase tracking-wider">Top Viewed Sanctuary Sections</h4>
                <div className="space-y-2">
                  {Object.entries(data?.sectionViews || {}).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No section engagement logged yet.</p>
                  ) : (
                    Object.entries(data?.sectionViews || {}).map(([sec, count]) => (
                      <div key={sec} className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                        <span className="font-semibold text-slate-700 capitalize">{sec.replace(/-/g, ' ')}</span>
                        <span className="font-mono bg-[#f0f4ec] px-2 py-0.5 rounded text-[#2c4724] font-bold">{count} views</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Live Event Stream */}
              <div className="bg-white p-6 rounded-3xl border border-[#d2dbc8] shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-[#1c2c19] uppercase tracking-wider">Recent Telemetry Activity</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(data?.recentActivity || []).map((evt) => (
                    <div key={evt.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-700">{evt.event_type}</span>
                        {evt.scroll_percentage && (
                          <span className="text-slate-400">({evt.scroll_percentage}%)</span>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono">
                        {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </section>
        )}

        {/* TAB 5: SUPABASE DATABASE SCHEMAS */}
        {activeTab === 'supabase' && (
          <section className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#d2dbc8] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1c2c19]">Multi-Table Supabase Architecture</h3>
                  <p className="text-xs text-slate-500">
                    Supports <code className="font-mono text-slate-800">productionbookings</code>, <code className="font-mono text-slate-800">leads</code>, and <code className="font-mono text-slate-800">bookings</code> in one project.
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1c2c19] hover:bg-[#2c4724] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copied SQL to Clipboard!' : 'Copy Complete SQL'}</span>
                </button>
              </div>

              {/* Table Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#f7faf5] p-4 rounded-2xl border border-[#d2dbc8] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1c2c19]">
                    <Calendar size={14} className="text-emerald-700" />
                    <span>productionbookings</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Direct Clover clinic intakes. Stores patient address, contact phone, notes, references, and slot times.
                  </p>
                </div>

                <div className="bg-[#f7faf5] p-4 rounded-2xl border border-[#d2dbc8] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1c2c19]">
                    <Target size={14} className="text-amber-700" />
                    <span>leads</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Landing page lead magnet opt-ins. Stores first name, email, and UTM attribution source.
                  </p>
                </div>

                <div className="bg-[#f7faf5] p-4 rounded-2xl border border-[#d2dbc8] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1c2c19]">
                    <Clock size={14} className="text-blue-700" />
                    <span>bookings</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Landing page appointments. Links lead_id, email, scheduled_at, time_slot, and status.
                  </p>
                </div>
              </div>

              {/* SQL Code Snippet Block */}
              <div className="relative">
                <pre className="bg-[#121c10] text-[#a4bc87] p-5 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-white/10 max-h-96">
                  {sqlSchemaText}
                </pre>
              </div>
            </div>
          </section>
        )}

      </main>
      )}
    </div>
  );
};
