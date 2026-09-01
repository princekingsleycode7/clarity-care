-- =========================================================================
-- CLOVER HEART HAVEN & LANDING PAGE — COMPLETE SUPABASE DATABASE SCHEMA
-- Tables: productionbookings, leads, bookings, analytics_events
-- =========================================================================

-- 1. CLOVER HEART HAVEN INTAKE BOOKINGS TABLE
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
    status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prod_bookings_created_at ON public.productionbookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prod_bookings_status ON public.productionbookings(status);
CREATE INDEX IF NOT EXISTS idx_prod_bookings_reference ON public.productionbookings(reference);

-- 2. LANDING PAGE LEADS TABLE (Lead Magnet Captures)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    utm_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- 3. LANDING PAGE BOOKINGS TABLE (Lead Magnet Appointments)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    email TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed', -- 'confirmed', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_lead_id ON public.bookings(lead_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- 4. ANALYTICS EVENTS TABLE (Visitor Telemetry & Scroll Depth)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'pageview', 'scroll_depth', 'section_view', 'cta_click'
    page_path VARCHAR(255) DEFAULT '/',
    scroll_percentage INTEGER,       -- 25, 50, 75, 100
    section_id VARCHAR(100),
    referrer TEXT,
    user_agent TEXT,
    device_type VARCHAR(50),         -- 'mobile', 'tablet', 'desktop'
    screen_width INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.productionbookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anonymous Insert Policies (Client intakes & tracking)
CREATE POLICY "Allow anon insert to productionbookings" ON public.productionbookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon insert to leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon insert to bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon insert to analytics_events" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Read & Manage Policies
CREATE POLICY "Allow select on productionbookings" ON public.productionbookings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update on productionbookings" ON public.productionbookings FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow select on leads" ON public.leads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update on leads" ON public.leads FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow select on bookings" ON public.bookings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update on bookings" ON public.bookings FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow select on analytics_events" ON public.analytics_events FOR SELECT TO anon, authenticated USING (true);
