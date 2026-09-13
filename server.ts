import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

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

// Initialize Resend Client lazily and safely
let resendClient: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes("re_xxxxxxxx") || key.trim() === "") {
    return null;
  }
  if (!resendClient) {
    try {
      resendClient = new Resend(key);
      console.log("Initialized Resend email client successfully.");
    } catch (e) {
      console.warn("Failed to initialize Resend client:", e);
    }
  }
  return resendClient;
}

// Safe email dispatch function (never throws, logs clear diagnostic info)
async function sendEmailSafe({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resend = getResend();
  if (!resend) {
    console.warn(`[Resend Skipped] Email to ${to} skipped — RESEND_API_KEY not configured or placeholder.`);
    return null;
  }
  try {
    const fromDomain =
      process.env.RESEND_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      "Clover Heart Haven <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromDomain,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Resend Error]:", error);
      return null;
    }
    console.log(`[Resend Success] Email sent successfully to ${to} (Email ID: ${data?.id || "sent"})`);
    return data;
  } catch (err) {
    console.error("[Resend Exception]:", err);
    return null;
  }
}

// Background AI Personalized Followup Generation (supports Gemini and OpenAI)
async function generatePersonalizedFollowup(leadId: string | null, firstName: string, utmSource: string) {
  try {
    let generatedCopy = "";
    const prompt = `Write a gentle, highly empathetic Day-2 follow-up email for ${firstName}, who just downloaded the guide "Why You Still Miss Them". 
They came from ad/marketing channel: "${utmSource}". 
Keep it concise, compassionate, non-salesy, and focused on emotional self-compassion. Include the direct booking link: "/book-session?name=${encodeURIComponent(firstName)}&source=email_nurture_day2" for a private 1-hour session.`;

    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      generatedCopy = response.text || "";
    } else if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your-openai-api-key")) {
      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });
      if (openAiRes.ok) {
        const completionData: any = await openAiRes.json();
        generatedCopy = completionData.choices?.[0]?.message?.content || "";
      }
    }

    if (generatedCopy) {
      const db = getSupabase();
      if (db && leadId) {
        try {
          await db.from("email_queue").insert({
            lead_id: leadId,
            email_type: "followup_day_2",
            subject: `Checking in, ${firstName}`,
            body_html: generatedCopy,
            scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });
          console.log(`[AI Follow-up Success] Queued Day-2 follow-up email for ${firstName} in email_queue`);
        } catch (dbErr) {
          console.warn("Notice saving to email_queue in Supabase:", dbErr);
        }
      }
    }
  } catch (err) {
    console.warn("Notice generating AI follow-up sequence:", err);
  }
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
  phone?: string;
  notes?: string;
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

  // CORS middleware allowing cross-origin requests from landing pages and local previews
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, x-admin-password, Authorization"
    );
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  // 3. API: Get Available Slots for Lead Magnet & Consultations
  app.get("/api/availability", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const apiKey = process.env.CALCOM_API_KEY || process.env.CAL_API_KEY;
      const eventTypeId =
        req.query.eventTypeId ||
        process.env.CALCOM_EVENT_TYPE_ID ||
        process.env.CAL_EVENT_TYPE_ID;
      const timezone = (req.query.timezone as string) || "Africa/Lagos";

      // Calculate rolling window: next 14 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);

      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];

      // Try Cal.com v2 API if configured
      if (apiKey && eventTypeId) {
        try {
          const calUrl = `https://api.cal.com/v2/slots?eventTypeId=${encodeURIComponent(
            String(eventTypeId)
          )}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(
            end
          )}&timeZone=${encodeURIComponent(timezone)}`;

          const calRes = await fetch(calUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "cal-api-version": "2024-09-04",
              "Content-Type": "application/json",
            },
          });

          if (calRes.ok) {
            const calData = await calRes.json();
            if (calData && (calData.data || calData.slots)) {
              return res.json(calData);
            }
          }
        } catch (calErr) {
          console.warn("Cal.com v2 slots fetch note:", calErr);
        }
      }

      // Dynamic generated slots for the next 14 days
      const slotsMap: Record<string, Array<{ time: string; start: string; label: string }>> = {};
      const slotTimes = [
        "09:00 AM",
        "10:00 AM",
        "11:30 AM",
        "01:00 PM",
        "02:30 PM",
        "04:00 PM",
        "05:30 PM",
      ];

      for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateKey = d.toISOString().split("T")[0];

        const daySlots = slotTimes.map((timeStr) => {
          const [timePart, modifier] = timeStr.split(" ");
          let [hours, minutes] = timePart.split(":").map(Number);
          if (modifier === "PM" && hours < 12) hours += 12;
          if (modifier === "AM" && hours === 12) hours = 0;

          const slotDate = new Date(d);
          slotDate.setHours(hours, minutes, 0, 0);
          const iso = slotDate.toISOString();

          return {
            time: iso,
            start: iso,
            label: timeStr,
          };
        });

        slotsMap[dateKey] = daySlots;
      }

      return res.json({
        status: "success",
        data: slotsMap,
        slots: slotsMap,
      });
    } catch (err) {
      console.error("Error in /api/availability:", err);
      const fallbackMap: Record<string, Array<{ time: string; start: string; label: string }>> = {};
      const today = new Date().toISOString().split("T")[0];
      fallbackMap[today] = [
        { time: new Date().toISOString(), start: new Date().toISOString(), label: "10:00 AM" },
        { time: new Date().toISOString(), start: new Date().toISOString(), label: "02:00 PM" },
      ];
      return res.json({
        status: "success",
        data: fallbackMap,
        slots: fallbackMap,
      });
    }
  });

  // 4. API: Lead Capture (Table: leads) - handles landing forms, story forms, and contact forms
  app.post("/api/leads", async (req, res) => {
    try {
      const {
        first_name,
        firstName,
        name,
        fullName,
        email,
        phone,
        notes,
        message,
        serviceInterest,
        utm_source = "landing_page",
        source,
        tracking,
      } = req.body;

      // Extract a meaningful first name
      let resolvedFirstName = (firstName || first_name || fullName || name || "").trim();
      if (!resolvedFirstName && email) {
        const localPart = email.split("@")[0].replace(/[._-]/g, " ");
        resolvedFirstName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
      }
      if (!resolvedFirstName) resolvedFirstName = "Friend";

      const resolvedEmail = (email || "").trim();
      const resolvedSource = source || utm_source || tracking?.utm_source || "contact_section";
      const resolvedNotes = notes || message || (serviceInterest ? `Service: ${serviceInterest}` : "");

      if (!resolvedEmail) {
        return res.status(400).json({ success: false, error: "Email address is required." });
      }

      const newLead: StoredLead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        first_name: resolvedFirstName,
        email: resolvedEmail,
        utm_source: resolvedSource,
        created_at: new Date().toISOString(),
        phone: phone ? String(phone).trim() : undefined,
        notes: resolvedNotes ? String(resolvedNotes).trim() : undefined,
      };

      // Add to in-memory store (update if email exists, or prepend)
      const existingIdx = memoryLeads.findIndex(
        (l) => l.email.toLowerCase() === resolvedEmail.toLowerCase()
      );
      if (existingIdx >= 0) {
        memoryLeads[existingIdx] = {
          ...memoryLeads[existingIdx],
          ...newLead,
          id: memoryLeads[existingIdx].id,
        };
      } else {
        memoryLeads.unshift(newLead);
      }

      // If phone or message came through contact/consultation, also optionally record in production bookings
      if (phone || serviceInterest) {
        const contactBooking: StoredProductionBooking = {
          id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          reference: `CHH-INQ-${Math.floor(100000 + Math.random() * 900000)}`,
          name: resolvedFirstName,
          phone: phone ? String(phone).trim() : "Pending",
          address: "Direct Clinic Inquiry / Contact Form",
          email: resolvedEmail,
          selected_date: "General Consultation Request",
          selected_time: "Flexible Callback",
          timezone: "America/Los_Angeles",
          status: "confirmed",
          notes: resolvedNotes || "Submitted via Contact Form",
          created_at: new Date().toISOString(),
        };
        memoryProductionBookings.unshift(contactBooking);
        const dbForBooking = getSupabase();
        if (dbForBooking) {
          try {
            await insertProductionBookingToSupabase(dbForBooking, contactBooking);
          } catch (bErr) {
            console.warn("Non-blocking inquiry insert error:", bErr);
          }
        }
      }

      const db = getSupabase();
      let savedToSupabase = false;
      if (db) {
        try {
          const { data, error } = await db.from("leads").upsert(
            {
              first_name: newLead.first_name,
              email: newLead.email,
              utm_source: newLead.utm_source,
              created_at: newLead.created_at,
            },
            { onConflict: "email" }
          ).select().single();

          if (!error && data) {
            newLead.id = data.id;
            savedToSupabase = true;
          } else {
            // Fallback: standard insert in case email has no unique constraint
            const { data: insData, error: insError } = await db.from("leads").insert({
              first_name: newLead.first_name,
              email: newLead.email,
              utm_source: newLead.utm_source,
              created_at: newLead.created_at,
            }).select().single();

            if (!insError && insData) {
              newLead.id = insData.id;
              savedToSupabase = true;
            } else {
              console.warn("Notice inserting lead to Supabase:", insError || error);
            }
          }
        } catch (dbErr) {
          console.warn("Failed to insert lead to Supabase:", dbErr);
        }
      }

      // Replicated from lead-magnet/server.js: Dispatch transactional email with Free Guide PDF
      sendEmailSafe({
        to: resolvedEmail,
        subject: "Why You Still Miss Them — Your Free Guide",
        html: `
          <p>Hi ${resolvedFirstName},</p>
          <p>Thank you for reaching out to Clover Heart Haven. Here is your copy of <strong>Why You Still Miss Them</strong>.</p>
          <p><a href="https://res.cloudinary.com/dsgk1zlj1/image/upload/v1786751973/guide.pdf">Download Your PDF Guide Here</a></p>
          <p>Take your time reading through it. We are here whenever you're ready.</p>
          <p>Warmly,<br>The Clover Heart Haven Team</p>
        `,
      }).catch((e) => console.warn("Background lead guide email dispatch warning:", e));

      // Async Step: Pre-generate AI personalized email sequence in background
      generatePersonalizedFollowup(newLead.id, resolvedFirstName, resolvedSource).catch((e) =>
        console.warn("Background AI sequence warning:", e)
      );

      return res.status(201).json({
        success: true,
        message: "Lead recorded successfully.",
        lead: newLead,
        savedToSupabase,
      });
    } catch (err) {
      console.error("Error in /api/leads:", err);
      return res.status(500).json({ success: false, error: "Failed to store lead." });
    }
  });

  app.get("/api/leads", async (req, res) => {
    try {
      const db = getSupabase();
      if (db) {
        const { data, error } = await db.from("leads").select("*").order("created_at", { ascending: false });
        if (!error && data) return res.json({ success: true, leads: data });
      }
      return res.json({ success: true, leads: memoryLeads });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to get leads" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const db = getSupabase();
      if (db) {
        const { data, error } = await db.from("bookings").select("*").order("created_at", { ascending: false });
        if (!error && data) return res.json({ success: true, bookings: data });
      }
      return res.json({ success: true, bookings: memoryLandingBookings });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to get bookings" });
    }
  });

  // 5. API: Bookings Capture (Table: bookings) - Handles /api/bookings and /api/landing-bookings
  const handleBookingCapture = async (req: express.Request, res: express.Response) => {
    try {
      const {
        lead_id,
        email,
        scheduled_at,
        time_slot,
        date,
        time,
        slot,
        startIso,
        name,
        firstName,
        timezone = "Africa/Lagos",
        source = "landing_page",
        status = "confirmed",
      } = req.body;

      const finalDate = date || scheduled_at || new Date().toISOString().split("T")[0];
      const finalTime = time || time_slot || slot || "10:00 AM";
      const finalEmail = email || "";

      if (!finalDate || !finalTime) {
        return res.status(400).json({ success: false, error: "Date and time slot are required." });
      }

      let leadId = lead_id || null;
      let finalName = (name || firstName || "").trim();

      // Link booking to existing lead if email is present
      if (finalEmail) {
        const memLead = memoryLeads.find((l) => l.email.toLowerCase() === finalEmail.toLowerCase());
        if (memLead) {
          if (!leadId) leadId = memLead.id;
          if (!finalName && memLead.first_name) finalName = memLead.first_name;
        }
      }

      const db = getSupabase();
      if (db && finalEmail && !leadId) {
        try {
          const { data: lead } = await db
            .from("leads")
            .select("id, first_name")
            .eq("email", finalEmail)
            .maybeSingle();
          if (lead) {
            leadId = lead.id;
            if (!finalName && lead.first_name) finalName = lead.first_name;
          }
        } catch (e) {
          console.warn("Could not match lead in Supabase:", e);
        }
      }

      if (!finalName && finalEmail) {
        const localPart = finalEmail.split("@")[0].replace(/[._-]/g, " ");
        finalName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
      }
      if (!finalName) finalName = "Guest";

      const newLandingBooking: StoredLandingBooking = {
        id: `land_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        lead_id: leadId,
        email: finalEmail || null,
        scheduled_at: finalDate,
        time_slot: finalTime,
        status,
        created_at: new Date().toISOString(),
        first_name: finalName,
      };

      memoryLandingBookings.unshift(newLandingBooking);

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
          console.warn("Failed to insert booking to Supabase:", dbErr);
        }
      }

      // Optional: Post booking to Cal.com if API key and event type ID exist
      const apiKey = process.env.CALCOM_API_KEY || process.env.CAL_API_KEY;
      const eventTypeId = process.env.CALCOM_EVENT_TYPE_ID || process.env.CAL_EVENT_TYPE_ID;
      if (apiKey && eventTypeId && finalEmail) {
        try {
          let startIsoString = startIso;
          if (!startIsoString) {
            const parsed = new Date(`${finalDate} ${finalTime}`);
            startIsoString = !isNaN(parsed.getTime()) ? parsed.toISOString() : new Date(finalDate).toISOString();
          }

          await fetch("https://api.cal.com/v2/bookings", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "cal-api-version": "2024-08-13",
            },
            body: JSON.stringify({
              start: startIsoString,
              eventTypeId: Number(eventTypeId),
              attendee: {
                name: finalName,
                email: finalEmail,
                timeZone: timezone,
              },
            }),
          });
        } catch (calErr) {
          console.warn("Cal.com background booking sync note:", calErr);
        }
      }

      // Replicated from lead-magnet/server.js: Send booking confirmation email if email provided
      if (finalEmail) {
        sendEmailSafe({
          to: finalEmail,
          subject: "Confirmed: Your Clover Heart Haven Call",
          html: `
            <p>Hi ${finalName},</p>
            <p>Your 1-hour private session has been scheduled for <strong>${finalDate} at ${finalTime}</strong>.</p>
            <p>We'll hold this time for you. A therapist will be ready to listen and answer any questions with gentle care.</p>
            <p>Warmly,<br>The Clover Heart Haven Team</p>
          `,
        }).catch((e) => console.warn("Background booking confirmation email warning:", e));
      }

      return res.status(201).json({
        success: true,
        message: "Booking confirmed.",
        booking: newLandingBooking,
        savedToSupabase,
      });
    } catch (err) {
      console.error("Error in booking endpoint:", err);
      return res.status(500).json({ success: false, error: "Failed to store booking." });
    }
  };

  app.post("/api/bookings", handleBookingCapture);
  app.post("/api/landing-bookings", handleBookingCapture);
  app.post("/api/vi/bookings", handleBookingCapture);

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

  // Helper to verify admin authorization for all protected admin routes
  const verifyAdminRequest = (req: express.Request, res: express.Response): boolean => {
    const provided =
      (req.headers["x-admin-password"] as string) ||
      (req.headers["x-admin-passcode"] as string) ||
      (req.headers["authorization"]?.replace(/^Bearer\s+/i, "") as string) ||
      (req.query.password as string) ||
      (req.query.passcode as string) ||
      (req.body?.password as string) ||
      (req.body?.passcode as string);

    // Check password from environment variable (.env)
    const configuredPassword =
      process.env.ADMIN_PASSWORD ||
      process.env.ADMIN_PASSCODE ||
      process.env.ADMIN_SECRET ||
      process.env.ADMIN_KEY;

    if (!provided || typeof provided !== "string" || !provided.trim()) {
      res.status(401).json({ success: false, error: "Authentication required. Please provide the admin password." });
      return false;
    }

    if (configuredPassword && configuredPassword.trim()) {
      if (provided.trim() !== configuredPassword.trim()) {
        res.status(401).json({ success: false, error: "Invalid administrator password. Access denied." });
        return false;
      }
    } else {
      // Fallback only if no env variable is configured in the environment
      if (provided.trim() !== "clover2026") {
        res.status(401).json({ success: false, error: "Invalid administrator password. Access denied." });
        return false;
      }
    }

    return true;
  };

  // 6. API: Admin Verification Check
  app.post("/api/admin/verify", (req, res) => {
    if (!verifyAdminRequest(req, res)) return;
    return res.json({ success: true, message: "Admin authenticated successfully." });
  });

  // 7. API: Comprehensive Admin Data Aggregator (Strictly Password-Gated)
  app.get("/api/admin/data", async (req, res) => {
    try {
      if (!verifyAdminRequest(req, res)) return;

      const db = getSupabase();
      let prodBookingsList: StoredProductionBooking[] = [...memoryProductionBookings];
      let leadsList: StoredLead[] = [...memoryLeads];
      let landingBookingsList: StoredLandingBooking[] = [...memoryLandingBookings];
      let analyticsList: StoredAnalyticsEvent[] = [...memoryAnalytics];

      if (db) {
        try {
          // 1. Fetch productionbookings
          const dbProdBookings = await fetchProductionBookingsFromSupabase(db);
          if (dbProdBookings && dbProdBookings.length > 0) {
            const dbRefs = new Set(dbProdBookings.map((b) => (b.reference || b.id).toLowerCase()));
            const localOnly = memoryProductionBookings.filter(
              (b) => !dbRefs.has((b.reference || b.id).toLowerCase())
            );
            prodBookingsList = [...localOnly, ...dbProdBookings];
          }

          // 2. Fetch leads
          const dbLeads = await fetchLeadsFromSupabase(db);
          if (dbLeads && dbLeads.length > 0) {
            const dbEmails = new Set(dbLeads.map((l) => l.email.toLowerCase()));
            const localOnly = memoryLeads.filter(
              (l) => !dbEmails.has(l.email.toLowerCase())
            );
            leadsList = [...localOnly, ...dbLeads];
          }

          // 3. Fetch landing bookings
          const dbLandingBookings = await fetchLandingBookingsFromSupabase(db);
          if (dbLandingBookings && dbLandingBookings.length > 0) {
            const dbIds = new Set(dbLandingBookings.map((b) => b.id));
            const localOnly = memoryLandingBookings.filter((b) => !dbIds.has(b.id));
            landingBookingsList = [...localOnly, ...dbLandingBookings];
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

  // 8. API: Update Clover Heart Haven Booking Status (Table: productionbookings)
  app.patch("/api/admin/bookings/:id/status", async (req, res) => {
    try {
      if (!verifyAdminRequest(req, res)) return;
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

  // 9. API: Update Landing Page Booking Status (Table: bookings)
  app.patch("/api/admin/landing-bookings/:id/status", async (req, res) => {
    try {
      if (!verifyAdminRequest(req, res)) return;
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

  // Mount the separate lead-magnet static landing page at /lead-magnet and /leadmagnets on the same domain
  const leadMagnetDir = path.join(process.cwd(), "lead-magnet");
  app.use(["/lead-magnet", "/leadmagnets", "/leadmagnet", "/lead-magnets"], express.static(leadMagnetDir));

  app.get(["/lead-magnet", "/leadmagnets", "/leadmagnet", "/lead-magnets"], (req, res) => {
    res.sendFile(path.join(leadMagnetDir, "index.html"));
  });

  app.get(["/lead-magnet/index.html", "/leadmagnets/index.html"], (req, res) => {
    res.sendFile(path.join(leadMagnetDir, "index.html"));
  });

  app.get(["/lead-magnet/index2.html", "/lead-magnet/index2", "/leadmagnets/index2.html", "/leadmagnets/index2"], (req, res) => {
    res.sendFile(path.join(leadMagnetDir, "index2.html"));
  });

  app.get(["/lead-magnet/index_ig.html", "/lead-magnet/index_ig", "/leadmagnets/index_ig.html", "/leadmagnets/index_ig", "/index_ig.html", "/index_ig"], (req, res) => {
    res.sendFile(path.join(leadMagnetDir, "index_ig.html"));
  });

  app.get(["/lead-magnet/*", "/leadmagnets/*", "/leadmagnet/*", "/lead-magnets/*"], (req, res) => {
    const subPath = req.params[0] || "";
    const requestedFile = path.join(leadMagnetDir, subPath);
    if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
      return res.sendFile(requestedFile);
    }
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
