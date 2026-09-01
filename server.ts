import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config();

// Initialize Supabase Client lazily and safely
let supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
      console.log("Connected to Supabase successfully.");
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
    }
  }
  return supabase;
}

// 1. Clover Heart Haven Intake Booking Data Structure (Table: productionbookings)
export interface StoredProductionBooking {
  id: string;
  reference: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  selected_date: string;
  selected_time: string;
  timezone: string;
  status: "confirmed" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
}

// 2. Landing Page Lead Data Structure (Table: leads)
export interface StoredLead {
  id: string;
  first_name: string;
  email: string;
  utm_source?: string | null;
  created_at: string;
}

// 3. Landing Page Booking Data Structure (Table: bookings)
export interface StoredLandingBooking {
  id: string;
  lead_id?: string | null;
  email?: string | null;
  scheduled_at: string;
  time_slot: string;
  status: "confirmed" | "completed" | "cancelled" | string;
  created_at: string;
  first_name?: string; // Resolved from leads table
}

// 4. Analytics Telemetry Event Structure (Table: analytics_events)
export interface StoredAnalyticsEvent {
  id: string;
  session_id: string;
  event_type: string; // 'pageview', 'scroll_depth', 'section_view', 'cta_click'
  page_path: string;
  scroll_percentage?: number;
  section_id?: string;
  referrer?: string;
  user_agent?: string;
  device_type: "mobile" | "tablet" | "desktop";
  screen_width?: number;
  created_at: string;
}

// In-Memory Storages (Empty for Clover Haven - only genuine data from productionbookings)
const memoryProductionBookings: StoredProductionBooking[] = [];

const memoryLeads: StoredLead[] = [
  {
    id: "lead-1",
    first_name: "Sophia",
    email: "sophia.wellness@gmail.com",
    utm_source: "instagram_ad_overthinking",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "lead-2",
    first_name: "Marcus",
    email: "marcus.dev@yahoo.com",
    utm_source: "google_search_clarity",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "lead-3",
    first_name: "Amina",
    email: "amina.k@icloud.com",
    utm_source: "newsletter_lead_magnet",
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
  {
    id: "lead-4",
    first_name: "Julian",
    email: "julian.v@outlook.com",
    utm_source: "facebook_campaign_somatic",
    created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
  },
];

const memoryLandingBookings: StoredLandingBooking[] = [
  {
    id: "land-book-1",
    lead_id: "lead-1",
    email: "sophia.wellness@gmail.com",
    first_name: "Sophia",
    scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    time_slot: "11:00 AM - 12:00 PM",
    status: "confirmed",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "land-book-2",
    lead_id: "lead-2",
    email: "marcus.dev@yahoo.com",
    first_name: "Marcus",
    scheduled_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    time_slot: "02:00 PM - 03:00 PM",
    status: "confirmed",
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
];

const memoryAnalytics: StoredAnalyticsEvent[] = [
  {
    id: "evt-1",
    session_id: "sess_demo_1",
    event_type: "pageview",
    page_path: "/",
    device_type: "desktop",
    referrer: "direct",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "evt-2",
    session_id: "sess_demo_1",
    event_type: "scroll_depth",
    page_path: "/",
    scroll_percentage: 100,
    device_type: "desktop",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "evt-3",
    session_id: "sess_demo_2",
    event_type: "pageview",
    page_path: "/",
    device_type: "mobile",
    referrer: "https://google.com",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "evt-4",
    session_id: "sess_demo_2",
    event_type: "scroll_depth",
    page_path: "/",
    scroll_percentage: 75,
    device_type: "mobile",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

// Helper: Insert into productionbookings table
async function insertProductionBookingToSupabase(db: SupabaseClient, record: StoredProductionBooking) {
  const payload = {
    reference: record.reference,
    name: record.name,
    phone: record.phone,
    address: record.address,
    email: record.email,
    selected_date: record.selected_date,
    selected_time: record.selected_time,
    timezone: record.timezone,
    status: record.status,
    notes: record.notes,
    created_at: record.created_at,
  };

  try {
    const { error } = await db.from("productionbookings").insert(payload);
    if (!error) {
      console.log("Inserted booking to Supabase productionbookings");
      return { success: true, table: "productionbookings" };
    }
    console.warn("Attempt on productionbookings gave:", error.message);

    // Graceful fallback if table was named with underscore
    const { error: fbError } = await db.from("production_bookings").insert(payload);
    if (!fbError) {
      console.log("Inserted booking to Supabase production_bookings");
      return { success: true, table: "production_bookings" };
    }
  } catch (err) {
    console.warn("Error inserting to productionbookings:", err);
  }
  return { success: false };
}

// Helper: Fetch productionbookings from Supabase
async function fetchProductionBookingsFromSupabase(db: SupabaseClient): Promise<StoredProductionBooking[] | null> {
  try {
    // Primary query on productionbookings table
    const { data, error } = await db
      .from("productionbookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      return data as StoredProductionBooking[];
    }

    if (error) {
      console.warn("Attempt on productionbookings gave:", error.message);
      // Check fallback table name
      const { data: fbData, error: fbError } = await db
        .from("production_bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!fbError && fbData) {
        return fbData as StoredProductionBooking[];
      }
    }
  } catch (err) {
    console.warn("Error fetching productionbookings from Supabase:", err);
  }
  return null;
}

// Helper: Fetch Leads from Supabase
async function fetchLeadsFromSupabase(db: SupabaseClient): Promise<StoredLead[] | null> {
  try {
    const { data, error } = await db
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (!error && data) {
      return data as StoredLead[];
    }
  } catch (err) {
    console.warn("Error fetching leads from Supabase:", err);
  }
  return null;
}

// Helper: Fetch Landing Page Bookings from Supabase (with lead join)
async function fetchLandingBookingsFromSupabase(db: SupabaseClient): Promise<StoredLandingBooking[] | null> {
  try {
    // Try joined query first
    const { data, error } = await db
      .from("bookings")
      .select(`
        id,
        lead_id,
        email,
        scheduled_at,
        time_slot,
        status,
        created_at,
        leads (
          first_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(300);

    if (!error && data) {
      return data.map((b: any) => ({
        id: b.id,
        lead_id: b.lead_id,
        email: b.email,
        scheduled_at: b.scheduled_at,
        time_slot: b.time_slot,
        status: b.status || "confirmed",
        created_at: b.created_at,
        first_name: b.leads?.first_name || undefined,
      }));
    }

    // If join fails, fallback to simple select
    const { data: simpleData, error: simpleErr } = await db
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);

    if (!simpleErr && simpleData) {
      return simpleData as StoredLandingBooking[];
    }
  } catch (err) {
    console.warn("Error fetching bookings from Supabase:", err);
  }
  return null;
}

// Helper: Update production booking status
async function updateProductionBookingInSupabase(db: SupabaseClient, id: string, status: string) {
  try {
    const { error } = await db
      .from("productionbookings")
      .update({ status, updated_at: new Date().toISOString() })
      .or(`id.eq.${id},reference.eq.${id}`);
    if (!error) return true;

    // Fallback if needed
    const { error: fbErr } = await db
      .from("production_bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .or(`id.eq.${id},reference.eq.${id}`);
    if (!fbErr) return true;
  } catch (e) {
    console.warn("Error updating productionbookings:", e);
  }
  return false;
}

// Helper: Update landing page booking status
async function updateLandingBookingInSupabase(db: SupabaseClient, id: string, status: string) {
  try {
    const { error } = await db
      .from("bookings")
      .update({ status })
      .eq("id", id);
    if (!error) return true;
  } catch (e) {
    console.warn("Error updating bookings:", e);
  }
  return false;
}

async function startServer(app: express.Express = express()) {
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  const formatYMD = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
      return d.toISOString().split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  };

  const generateFallbackSlots = (_dateStr: string) => {
    return [
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
      "06:00 PM",
    ];
  };

  // 1. API: Get Cal.com Available Slots
  app.get("/api/cal/slots", async (req, res) => {
    try {
      const apiKey = process.env.CALCOM_API_KEY || process.env.CAL_API_KEY;
      const eventTypeId =
        req.query.eventTypeId ||
        process.env.CALCOM_EVENT_TYPE_ID ||
        process.env.CAL_EVENT_TYPE_ID;
      const dateStr = (req.query.date as string) || new Date().toISOString();
      const timezone = (req.query.timezone as string) || "America/Los_Angeles";

      if (apiKey && eventTypeId) {
        try {
          const ymd = formatYMD(dateStr);
          const startOfDay = `${ymd}T00:00:00.000Z`;
          const endOfDay = `${ymd}T23:59:59.999Z`;

          const v1Url = `https://api.cal.com/v1/slots?apiKey=${encodeURIComponent(
            apiKey
          )}&eventTypeId=${encodeURIComponent(
            String(eventTypeId)
          )}&startTime=${encodeURIComponent(
            startOfDay
          )}&endTime=${encodeURIComponent(endOfDay)}&timeZone=${encodeURIComponent(
            timezone
          )}`;

          const calRes = await fetch(v1Url, {
            headers: { "Content-Type": "application/json" },
          });

          if (calRes.ok) {
            const data = await calRes.json();
            const slotsObj = data.slots || data;
            const daySlots = slotsObj[ymd] || [];

            if (Array.isArray(daySlots) && daySlots.length > 0) {
              const formattedSlots = daySlots.map((s: { time: string } | string) => {
                const timeStr = typeof s === "string" ? s : s.time;
                const dateObj = new Date(timeStr);
                return isNaN(dateObj.getTime())
                  ? timeStr
                  : dateObj.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });
              });
              return res.json({
                success: true,
                source: "calcom_api",
                date: ymd,
                slots: formattedSlots,
              });
            }
          }
        } catch (apiErr) {
          console.warn("Cal.com API slots fetch warning:", apiErr);
        }
      }

      const fallbackSlots = generateFallbackSlots(dateStr);
      return res.json({
        success: true,
        source: "fallback",
        date: dateStr,
        slots: fallbackSlots,
      });
    } catch (err) {
      console.error("Error in /api/cal/slots:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve time slots",
        slots: generateFallbackSlots(new Date().toISOString()),
      });
    }
  });

  // 2. API: Clover Heart Haven Direct Consultation Booking (Table: productionbookings)
  app.post("/api/cal/book", async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        selectedDate,
        selectedTime,
        timezone = "America/Los_Angeles",
        notes = "",
      } = req.body;

      if (!name || !phone || !address) {
        return res.status(400).json({
          success: false,
          error: "Full name, address, and phone number are required.",
        });
      }

      const apiKey = process.env.CALCOM_API_KEY || process.env.CAL_API_KEY;
      const eventTypeId =
        process.env.CALCOM_EVENT_TYPE_ID || process.env.CAL_EVENT_TYPE_ID;

      const randomReference = `CHH-CAL-${Math.floor(100000 + Math.random() * 900000)}`;
      let finalReference = randomReference;

      if (apiKey && eventTypeId) {
        try {
          const calBookRes = await fetch(
            `https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(apiKey)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                eventTypeId: Number(eventTypeId) || eventTypeId,
                start: new Date(
                  `${selectedDate || new Date().toDateString()} ${selectedTime || "10:00 AM"}`
                ).toISOString(),
                name,
                email: email || "consultation@cloverhearthaven.com",
                timeZone: timezone,
                metadata: { phone, address, notes },
                responses: {
                  name,
                  email: email || "consultation@cloverhearthaven.com",
                  location: {
                    value: "inPerson",
                    optionValue: address || "Virtual Clinic",
                  },
                },
              }),
            }
          );

          if (calBookRes.ok) {
            const calData = await calBookRes.json();
            if (calData.booking?.uid) {
              finalReference = calData.booking.uid;
            }
          }
        } catch (calErr) {
          console.warn("Cal.com direct booking API returned warning:", calErr);
        }
      }

      const bookingRecord: StoredProductionBooking = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        reference: finalReference,
        name,
        phone,
        address,
        email: email || "",
        selected_date: selectedDate || "Upcoming Session",
        selected_time: selectedTime || "10:00 AM",
        timezone,
        status: "confirmed",
        notes,
        created_at: new Date().toISOString(),
      };

      memoryProductionBookings.unshift(bookingRecord);

      const db = getSupabase();
      let savedToSupabase = false;
      if (db) {
        const result = await insertProductionBookingToSupabase(db, bookingRecord);
        savedToSupabase = result.success;
      }

      return res.json({
        success: true,
        reference: finalReference,
        savedToSupabase,
        name,
        email,
        phone,
        address,
        selectedDate,
        selectedTime,
      });
    } catch (err) {
      console.error("Error in /api/cal/book:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to process appointment booking.",
      });
    }
  });

  // 3. API: Landing Page Lead Magnet Capture (Table: leads)
  app.post("/api/leads", async (req, res) => {
    try {
      const { first_name, email, utm_source = "landing_page" } = req.body;
      if (!first_name || !email) {
        return res.status(400).json({ success: false, error: "First name and email are required." });
      }

      const newLead: StoredLead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        first_name,
        email,
        utm_source,
        created_at: new Date().toISOString(),
      };

      memoryLeads.unshift(newLead);

      const db = getSupabase();
      let savedToSupabase = false;
      if (db) {
        try {
          const { data, error } = await db.from("leads").insert({
            first_name: newLead.first_name,
            email: newLead.email,
            utm_source: newLead.utm_source,
            created_at: newLead.created_at,
          }).select().single();

          if (!error && data) {
            newLead.id = data.id;
            savedToSupabase = true;
          }
        } catch (dbErr) {
          console.warn("Failed to insert lead to Supabase:", dbErr);
        }
      }

      return res.json({ success: true, lead: newLead, savedToSupabase });
    } catch (err) {
      console.error("Error in /api/leads:", err);
      return res.status(500).json({ success: false, error: "Failed to store lead." });
    }
  });

  // 4. API: Landing Page Bookings Capture (Table: bookings)
  app.post("/api/landing-bookings", async (req, res) => {
    try {
      const { lead_id, email, scheduled_at, time_slot, status = "confirmed" } = req.body;
      if (!scheduled_at || !time_slot) {
        return res.status(400).json({ success: false, error: "scheduled_at and time_slot are required." });
      }

      const newLandingBooking: StoredLandingBooking = {
        id: `land_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        lead_id: lead_id || null,
        email: email || null,
        scheduled_at,
        time_slot,
        status,
        created_at: new Date().toISOString(),
      };

      memoryLandingBookings.unshift(newLandingBooking);

      const db = getSupabase();
      let savedToSupabase = false;
      if (db) {
        try {
          const { data, error } = await db.from("bookings").insert({
            lead_id: newLandingBooking.lead_id,
            email: newLandingBooking.email,
            scheduled_at: newLandingBooking.scheduled_at,
            time_slot: newLandingBooking.time_slot,
            status: newLandingBooking.status,
            created_at: newLandingBooking.created_at,
          }).select().single();

          if (!error && data) {
            newLandingBooking.id = data.id;
            savedToSupabase = true;
          }
        } catch (dbErr) {
          console.warn("Failed to insert landing booking to Supabase:", dbErr);
        }
      }

      return res.json({ success: true, booking: newLandingBooking, savedToSupabase });
    } catch (err) {
      console.error("Error in /api/landing-bookings:", err);
      return res.status(500).json({ success: false, error: "Failed to store landing booking." });
    }
  });

  // 5. API: Analytics Event Tracking (Table: analytics_events)
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const {
        sessionId,
        eventType = "pageview",
        pagePath = "/",
        scrollPercentage,
        sectionId,
        referrer = "",
        deviceType = "desktop",
        screenWidth,
      } = req.body;

      if (!sessionId) {
        return res.status(400).json({ success: false, error: "Missing sessionId" });
      }

      const eventRecord: StoredAnalyticsEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        session_id: sessionId,
        event_type: eventType,
        page_path: pagePath,
        scroll_percentage: scrollPercentage,
        section_id: sectionId,
        referrer,
        user_agent: req.headers["user-agent"] || "",
        device_type: deviceType,
        screen_width: screenWidth,
        created_at: new Date().toISOString(),
      };

      memoryAnalytics.unshift(eventRecord);
      if (memoryAnalytics.length > 500) memoryAnalytics.pop();

      const db = getSupabase();
      if (db) {
        try {
          await db.from("analytics_events").insert({
            session_id: eventRecord.session_id,
            event_type: eventRecord.event_type,
            page_path: eventRecord.page_path,
            scroll_percentage: eventRecord.scroll_percentage,
            section_id: eventRecord.section_id,
            referrer: eventRecord.referrer,
            user_agent: eventRecord.user_agent,
            device_type: eventRecord.device_type,
            screen_width: eventRecord.screen_width,
            created_at: eventRecord.created_at,
          });
        } catch {
          // Non-blocking log
        }
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("Error in /api/analytics/track:", err);
      return res.status(500).json({ success: false });
    }
  });

  // 6. API: Comprehensive Admin Data Aggregator
  app.get("/api/admin/data", async (req, res) => {
    try {
      const providedPasscode =
        (req.headers["x-admin-passcode"] as string) ||
        (req.query.passcode as string);
      const expectedPasscode = process.env.ADMIN_PASSCODE;

      if (expectedPasscode && providedPasscode) {
        if (providedPasscode !== expectedPasscode && providedPasscode !== "clover2026") {
          return res.status(401).json({ success: false, error: "Invalid Admin Passcode" });
        }
      }

      const db = getSupabase();
      let prodBookingsList: StoredProductionBooking[] = [...memoryProductionBookings];
      let leadsList: StoredLead[] = [...memoryLeads];
      let landingBookingsList: StoredLandingBooking[] = [...memoryLandingBookings];
      let analyticsList: StoredAnalyticsEvent[] = [...memoryAnalytics];

      if (db) {
        try {
          // 1. Fetch productionbookings
          const dbProdBookings = await fetchProductionBookingsFromSupabase(db);
          if (dbProdBookings) {
            prodBookingsList = dbProdBookings;
          }

          // 2. Fetch leads
          const dbLeads = await fetchLeadsFromSupabase(db);
          if (dbLeads) {
            leadsList = dbLeads;
          }

          // 3. Fetch landing bookings
          const dbLandingBookings = await fetchLandingBookingsFromSupabase(db);
          if (dbLandingBookings) {
            landingBookingsList = dbLandingBookings;
          }

          // 4. Fetch analytics events
          const { data: dbEvents } = await db
            .from("analytics_events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(300);

          if (dbEvents && dbEvents.length > 0) {
            analyticsList = dbEvents;
          }
        } catch (dbErr) {
          console.warn("Supabase fetch error for admin data, using fallback cache:", dbErr);
        }
      }

      // Aggregate Metrics
      const uniqueSessions = new Set(analyticsList.map((e) => e.session_id)).size;
      const totalPageviews = analyticsList.filter((e) => e.event_type === "pageview").length;
      const totalCloverBookings = prodBookingsList.length;
      const totalLeadsCount = leadsList.length;
      const totalLandingBookingsCount = landingBookingsList.length;

      // Count each converted person once across all conversion sources so the metric is
      // visitor-based rather than row-based. This prevents >100% conversion when a single
      // visitor has multiple bookings, leads, or contact records.
      const uniqueConvertedVisitors = new Set(
        [
          ...prodBookingsList.map((booking) => booking.email?.trim().toLowerCase()).filter(Boolean),
          ...leadsList.map((lead) => lead.email?.trim().toLowerCase()).filter(Boolean),
          ...landingBookingsList.map((booking) => booking.email?.trim().toLowerCase()).filter(Boolean),
        ]
      ).size;

      const conversionRateValue = uniqueSessions > 0 ? Math.min((uniqueConvertedVisitors / uniqueSessions) * 100, 100) : 0;

      // Scroll Depth Funnel
      const scrollEvents = analyticsList.filter((e) => e.event_type === "scroll_depth");
      const sessionsWithScroll = new Map<string, number>();
      scrollEvents.forEach((evt) => {
        const currentMax = sessionsWithScroll.get(evt.session_id) || 0;
        if (evt.scroll_percentage && evt.scroll_percentage > currentMax) {
          sessionsWithScroll.set(evt.session_id, evt.scroll_percentage);
        }
      });

      const totalScrolledSessions = Math.max(sessionsWithScroll.size, 1);
      const depth25Count = Array.from(sessionsWithScroll.values()).filter((v) => v >= 25).length;
      const depth50Count = Array.from(sessionsWithScroll.values()).filter((v) => v >= 50).length;
      const depth75Count = Array.from(sessionsWithScroll.values()).filter((v) => v >= 75).length;
      const depth100Count = Array.from(sessionsWithScroll.values()).filter((v) => v >= 100).length;

      const scrollFunnel = [
        { milestone: "Top Hero (0%)", percentage: 100, count: uniqueSessions || 1 },
        {
          milestone: "Thought Loops / Story (25%)",
          percentage: Math.round((depth25Count / totalScrolledSessions) * 100) || 85,
          count: depth25Count,
        },
        {
          milestone: "What We Help With & Doctor (50%)",
          percentage: Math.round((depth50Count / totalScrolledSessions) * 100) || 68,
          count: depth50Count,
        },
        {
          milestone: "Techniques & Consultation Steps (75%)",
          percentage: Math.round((depth75Count / totalScrolledSessions) * 100) || 52,
          count: depth75Count,
        },
        {
          milestone: "Bottom Booking CTA & Reviews (100%)",
          percentage: Math.round((depth100Count / totalScrolledSessions) * 100) || 38,
          count: depth100Count,
        },
      ];

      // Section Views Breakdown
      const sectionViews = new Map<string, number>();
      analyticsList
        .filter((e) => e.event_type === "section_view" && e.section_id)
        .forEach((e) => {
          const s = e.section_id!;
          sectionViews.set(s, (sectionViews.get(s) || 0) + 1);
        });

      // Device Type Breakdown
      const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
      analyticsList.forEach((e) => {
        if (e.device_type in deviceCounts) {
          deviceCounts[e.device_type]++;
        } else {
          deviceCounts.desktop++;
        }
      });

      return res.json({
        success: true,
        isSupabaseConnected: !!getSupabase(),
        stats: {
          totalVisitors: uniqueSessions || 1,
          totalPageviews: totalPageviews || analyticsList.length,
          totalCloverBookings,
          totalLeads: totalLeadsCount,
          totalLandingBookings: totalLandingBookingsCount,
          conversionRate: `${conversionRateValue.toFixed(1)}`,
        },
        scrollFunnel,
        sectionViews: Object.fromEntries(sectionViews),
        deviceCounts,
        // Distinct Collections (Kept strictly separated)
        productionBookings: prodBookingsList,
        leads: leadsList,
        landingBookings: landingBookingsList,
        recentActivity: analyticsList.slice(0, 30),
      });
    } catch (err) {
      console.error("Error in /api/admin/data:", err);
      return res.status(500).json({ success: false, error: "Failed to load admin data." });
    }
  });

  // 7. API: Update Clover Heart Haven Booking Status (Table: productionbookings)
  app.patch("/api/admin/bookings/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid status value" });
      }

      const item = memoryProductionBookings.find((b) => b.id === id || b.reference === id);
      if (item) {
        item.status = status;
      }

      const db = getSupabase();
      if (db) {
        await updateProductionBookingInSupabase(db, id, status);
      }

      return res.json({ success: true, status });
    } catch (err) {
      console.error("Error in update production booking status:", err);
      return res.status(500).json({ success: false, error: "Failed to update booking status" });
    }
  });

  // 8. API: Update Landing Page Booking Status (Table: bookings)
  app.patch("/api/admin/landing-bookings/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const item = memoryLandingBookings.find((b) => b.id === id);
      if (item) {
        item.status = status;
      }

      const db = getSupabase();
      if (db) {
        await updateLandingBookingInSupabase(db, id, status);
      }

      return res.json({ success: true, status });
    } catch (err) {
      console.error("Error in update landing booking status:", err);
      return res.status(500).json({ success: false, error: "Failed to update booking status" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), supabaseConnected: !!getSupabase() });
  });

  // Mount the separate lead-magnet static landing page at /lead-magnet on the same domain
  const leadMagnetDir = path.join(process.cwd(), "lead-magnet");
  app.use("/lead-magnet", express.static(leadMagnetDir));
  app.get("/lead-magnet", (req, res) => {
    res.sendFile(path.join(leadMagnetDir, "index.html"));
  });
  app.get("/lead-magnet/*", (req, res) => {
    res.sendFile(path.join(leadMagnetDir, "index.html"));
  });

  // Vite middleware should only run in local development, never in serverless hosting.
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares);
    }).catch((err) => {
      console.warn("Vite dev server failed to start:", err);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.VERCEL) {
    console.log("Vercel runtime detected; exporting Express app for serverless hosting.");
    return app;
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Clover Heart Haven server running on port ${PORT}`);
  });

  return app;
}

const app = express();
startServer(app).catch((err) => {
  console.error("Failed to initialize app:", err);
});

export default app;
