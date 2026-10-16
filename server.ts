import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
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

// -------------------------------------------------------------------
// Mailchimp Integration: Sync Leads to Mailchimp Audience
// -------------------------------------------------------------------
let cachedMailchimpListId: string | null = null;

function getMailchimpConfig(): { apiKey: string; dataCenter: string } | null {
  const rawKey = (process.env.MAILCHIMP_API_KEY || "").trim();
  if (!rawKey || rawKey.includes("your-mailchimp-key") || rawKey.length < 10) {
    return null;
  }

  // Mailchimp API keys end with -usX (e.g. abc123456789-us21)
  const parts = rawKey.split("-");
  const dataCenter = parts.length > 1 ? parts[parts.length - 1].trim().toLowerCase() : "us1";

  return { apiKey: rawKey, dataCenter };
}

async function resolveMailchimpListId(config: { apiKey: string; dataCenter: string }): Promise<string | null> {
  const envListId = (process.env.MAILCHIMP_AUDIENCE_ID || process.env.MAILCHIMP_LIST_ID || "").trim();
  if (envListId) return envListId;

  if (cachedMailchimpListId) return cachedMailchimpListId;

  try {
    const res = await fetch(`https://${config.dataCenter}.api.mailchimp.com/3.0/lists?count=10&fields=lists.id,lists.name`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${config.apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const data: any = await res.json();
      if (data.lists && data.lists.length > 0) {
        cachedMailchimpListId = data.lists[0].id;
        console.log(`[Mailchimp] Discovered default Audience: "${data.lists[0].name}" (ID: ${cachedMailchimpListId})`);
        return cachedMailchimpListId;
      }
    } else {
      const errText = await res.text();
      console.warn("[Mailchimp List Lookup Warning]:", res.status, errText);
    }
  } catch (e) {
    console.warn("[Mailchimp Lookup Exception]:", e);
  }
  return null;
}

export async function syncLeadToMailchimp({
  email,
  firstName,
  lastName = "",
  source = "lead_magnet",
  tags = ["Clover Heart Haven", "Lead Magnet"],
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  tags?: string[];
}): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  const config = getMailchimpConfig();
  if (!config) {
    // API key not configured yet
    return { success: false, skipped: true, error: "MAILCHIMP_API_KEY not configured." };
  }

  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Invalid email for Mailchimp sync." };
  }

  try {
    const listId = await resolveMailchimpListId(config);
    if (!listId) {
      console.warn("[Mailchimp Warning] No Mailchimp audience list ID found or created.");
      return { success: false, error: "No Mailchimp audience list available." };
    }

    // Subscriber hash is MD5 of lowercased email (required for upsert / PUT)
    const subscriberHash = crypto.createHash("md5").update(cleanEmail).digest("hex");

    const payload = {
      email_address: cleanEmail,
      status_if_new: "subscribed",
      merge_fields: {
        FNAME: firstName || "",
        LNAME: lastName || "",
        MMERGE3: source || "website",
      },
      tags: Array.isArray(tags) ? tags : ["Clover Heart Haven"],
    };

    const url = `https://${config.dataCenter}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${config.apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const respData: any = await response.json();
      console.log(`[Mailchimp Success] Synced lead "${cleanEmail}" (${firstName || "Anonymous"}) to list ${listId} (status: ${respData.status})`);
      return { success: true };
    } else {
      const errBody = await response.text();
      console.warn(`[Mailchimp API Error ${response.status}]:`, errBody);
      return { success: false, error: `Mailchimp error (${response.status})` };
    }
  } catch (err: any) {
    console.warn("[Mailchimp Sync Exception]:", err);
    return { success: false, error: err.message || "Failed to sync to Mailchimp" };
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

// Helper: Dual-write booking to Supabase (productionbookings & bookings)
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

  let prodSuccess = false;
  let bookingsSuccess = false;

  // 1. Write to productionbookings (and fallback production_bookings)
  try {
    const { error } = await db.from("productionbookings").insert(payload);
    if (!error) {
      console.log("[Supabase] Inserted booking to productionbookings");
      prodSuccess = true;
    } else {
      console.warn("[Supabase] Attempt on productionbookings gave:", error.message);
      const { error: fbError } = await db.from("production_bookings").insert(payload);
      if (!fbError) {
        console.log("[Supabase] Inserted booking to fallback production_bookings");
        prodSuccess = true;
      }
    }
  } catch (err) {
    console.warn("[Supabase] Error inserting to productionbookings:", err);
  }

  // 2. Dual-write to bookings table & ensure lead in leads table for backward compatibility
  try {
    let leadId: string | null = null;
    if (record.email && record.email.includes("@")) {
      const firstName = (record.name || "").trim().split(" ")[0] || "Client";
      const { data: leadData } = await db.from("leads").upsert(
        {
          first_name: firstName,
          email: record.email.trim(),
          phone: record.phone || undefined,
          utm_source: "clarity_call_intake",
          created_at: record.created_at,
        },
        { onConflict: "email" }
      ).select("id").maybeSingle();

      if (leadData?.id) leadId = leadData.id;
    }

    const { error: bookError } = await db.from("bookings").insert({
      lead_id: leadId,
      email: record.email || null,
      scheduled_at: record.selected_date,
      time_slot: record.selected_time,
      status: record.status || "confirmed",
      created_at: record.created_at,
    });

    if (!bookError) {
      console.log("[Supabase] Dual-write inserted to bookings table");
      bookingsSuccess = true;
    } else {
      console.warn("[Supabase] Dual-write to bookings gave:", bookError.message);
    }
  } catch (bookErr) {
    console.warn("[Supabase] Dual-write to bookings exception:", bookErr);
  }

  return { 
    success: prodSuccess || bookingsSuccess, 
    prodSuccess, 
    bookingsSuccess, 
    table: "dual_production_and_bookings" 
  };
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

// Helper: Update booking status across both tables
async function updateProductionBookingInSupabase(
  db: SupabaseClient,
  id: string,
  status: string,
  extra?: { newDate?: string; newTime?: string; reason?: string }
) {
  let prodUpdated = false;
  let bookingsUpdated = false;

  const updateFields: any = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (extra?.newDate) updateFields.selected_date = extra.newDate;
  if (extra?.newTime) updateFields.selected_time = extra.newTime;
  if (extra?.reason) {
    updateFields.notes = `Status: ${status} | Reason: ${extra.reason}`;
  }

  try {
    const { error } = await db
      .from("productionbookings")
      .update(updateFields)
      .or(`id.eq.${id},reference.eq.${id}`);
    if (!error) {
      prodUpdated = true;
    } else {
      const { error: fbErr } = await db
        .from("production_bookings")
        .update(updateFields)
        .or(`id.eq.${id},reference.eq.${id}`);
      if (!fbErr) prodUpdated = true;
    }
  } catch (e) {
    console.warn("Error updating productionbookings:", e);
  }

  // Dual-update bookings table as well
  try {
    const landingUpdate: any = { status };
    if (extra?.newDate) landingUpdate.scheduled_at = extra.newDate;
    if (extra?.newTime) landingUpdate.time_slot = extra.newTime;

    const { error } = await db
      .from("bookings")
      .update(landingUpdate)
      .or(`id.eq.${id},email.eq.${id}`);
    if (!error) bookingsUpdated = true;
  } catch (e) {
    console.warn("Error updating bookings:", e);
  }

  return prodUpdated || bookingsUpdated;
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

// Helper: Cancel booking on Cal.com v2
async function cancelCalcomBooking(
  bookingUid: string,
  cancellationReason?: string
): Promise<{ success: boolean; error?: string; status?: string }> {
  const apiKey = (process.env.CALCOM_API_KEY || "").replace(/^["']|["']$/g, "").trim();
  if (!apiKey || apiKey === "11") {
    return { success: false, error: "Cal.com API key not configured" };
  }

  try {
    const url = `https://api.cal.com/v2/bookings/${encodeURIComponent(bookingUid)}/cancel`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "cal-api-version": "2024-08-13",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cancellationReason: cancellationReason || "Requested by client",
      }),
    });

    if (response.ok) {
      const resJson: any = await response.json().catch(() => ({}));
      console.log(`[Cal.com Cancel Success] Cancelled booking ${bookingUid}:`, resJson.status || "cancelled");
      return { success: true, status: "cancelled" };
    }

    // Fallback attempt with cal-api-version: 2024-06-11
    try {
      const fbResponse = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "cal-api-version": "2024-06-11",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancellationReason: cancellationReason || "Requested by client",
        }),
      });
      if (fbResponse.ok) {
        return { success: true, status: "cancelled" };
      }
    } catch {}

    const errText = await response.text();
    console.warn(`[Cal.com Cancel Notice ${response.status}]:`, errText);
    return { success: false, error: `Cal.com cancel failed (${response.status})` };
  } catch (err: any) {
    console.error("[Cal.com Cancel Exception]:", err);
    return { success: false, error: err.message || "Failed to cancel Cal.com booking" };
  }
}

// Helper: Reschedule booking on Cal.com v2
async function rescheduleCalcomBooking(
  bookingUid: string,
  newStartIso: string,
  reschedulingReason?: string
): Promise<{ success: boolean; error?: string; status?: string; data?: any }> {
  const apiKey = (process.env.CALCOM_API_KEY || "").replace(/^["']|["']$/g, "").trim();
  if (!apiKey || apiKey === "11") {
    return { success: false, error: "Cal.com API key not configured" };
  }

  try {
    const url = `https://api.cal.com/v2/bookings/${encodeURIComponent(bookingUid)}/reschedule`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "cal-api-version": "2024-08-13",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: newStartIso,
        reschedulingReason: reschedulingReason || "Requested by client",
      }),
    });

    if (response.ok) {
      const resJson: any = await response.json().catch(() => ({}));
      console.log(`[Cal.com Reschedule Success] Rescheduled booking ${bookingUid} to ${newStartIso}`);
      return { success: true, status: "rescheduled", data: resJson.data || resJson };
    }

    // Fallback attempt with 2024-06-11
    try {
      const fbResponse = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "cal-api-version": "2024-06-11",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: newStartIso,
          reschedulingReason: reschedulingReason || "Requested by client",
        }),
      });
      if (fbResponse.ok) {
        const fbJson: any = await fbResponse.json().catch(() => ({}));
        return { success: true, status: "rescheduled", data: fbJson.data || fbJson };
      }
    } catch {}

    const errText = await response.text();
    console.warn(`[Cal.com Reschedule Notice ${response.status}]:`, errText);
    return { success: false, error: `Cal.com reschedule failed (${response.status})` };
  } catch (err: any) {
    console.error("[Cal.com Reschedule Exception]:", err);
    return { success: false, error: err.message || "Failed to reschedule Cal.com booking" };
  }
}

// Helper: Verify Cal.com webhook signature with CALCOM_WEBHOOK_SECRET
function verifyCalcomWebhookSignature(req: any): boolean {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret || secret.trim() === "") {
    // If webhook secret is not configured in env, allow with warning
    return true;
  }
  const signature = req.headers["x-cal-signature-256"] || req.headers["cal-signature-256"];
  if (!signature) {
    console.warn("[Cal.com Webhook] Missing X-Cal-Signature-256 header when CALCOM_WEBHOOK_SECRET is active");
    return false;
  }
  try {
    const rawBody = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body);
    const expectedSig = crypto.createHmac("sha256", secret.trim()).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(String(signature), "hex"), Buffer.from(expectedSig, "hex"));
  } catch (err) {
    console.error("[Cal.com Webhook] Signature verification failed:", err);
    return false;
  }
}

async function startServer(app: express.Express = express()) {
  const PORT = Number(process.env.PORT) || 3000;

  // CORS middleware allowing cross-origin requests from landing pages and local previews
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, x-admin-password, Authorization, x-cal-signature-256"
    );
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  // Parse JSON and retain raw buffer for webhook signature validation
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
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

  // Helper: Retrieve Cal.com API key from any secret / environment variable alias
  const getCalcomApiKey = (): string => {
    const raw =
      process.env.CALCOM_API_KEY ||
      process.env.CAL_COM_API_KEY ||
      process.env.CAL_API_KEY ||
      process.env.CALCOM_KEY ||
      process.env.CAL_KEY ||
      process.env.CALCOM_TOKEN ||
      process.env.CAL_COM_TOKEN ||
      process.env.CAL_API ||
      process.env.CALCOM_API ||
      process.env.CALCOM_API_TOKEN ||
      "";
    const cleaned = raw.replace(/^["']|["']$/g, "").trim();
    return cleaned;
  };

  // Helper: Normalize raw phone number string to valid international E.164 format for Cal.com
  const normalizeE164Phone = (rawPhone?: string): string | undefined => {
    if (!rawPhone) return undefined;
    const trimmed = rawPhone.trim();
    if (
      !trimmed ||
      /^(not provided|none|n\/a|na|no|null|undefined|pending intake)$/i.test(trimmed)
    ) {
      return undefined;
    }
    // If starts with '+', strip formatting characters (spaces, dashes, parentheses)
    if (trimmed.startsWith("+")) {
      const cleaned = "+" + trimmed.replace(/\D/g, "");
      if (cleaned.length >= 8 && cleaned.length <= 16) {
        return cleaned;
      }
    }
    const digits = trimmed.replace(/\D/g, "");
    if (!digits || digits.length < 7) {
      return undefined;
    }
    // US / Canada standard 10 digits (e.g. 4155550192) -> +14155550192
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    // 11 digits starting with 1 (e.g. 14155550192) -> +14155550192
    if (digits.length === 11 && digits.startsWith("1")) {
      return `+${digits}`;
    }
    // 11 digits starting with 0 (e.g. Nigeria 080... or UK 07...)
    if (digits.length === 11 && digits.startsWith("0")) {
      if (/^0[789][01]/.test(digits)) {
        return `+234${digits.slice(1)}`;
      }
      if (digits.startsWith("07")) {
        return `+44${digits.slice(1)}`;
      }
    }
    if (digits.length >= 10 && digits.length <= 15) {
      return `+${digits}`;
    }
    return undefined;
  };

  let cachedCalcomEventTypeId: number | null = null;
  let cachedCalcomEventTypeName: string | null = null;

  // Helper: Dynamically discover or retrieve Cal.com event type ID as a valid integer
  const resolveCalcomEventType = async (
    apiKey: string
  ): Promise<{ id: number; title: string; slug?: string } | null> => {
    const rawEnvEventType = (
      process.env.CALCOM_EVENT_TYPE_ID ||
      process.env.CAL_EVENT_TYPE_ID ||
      ""
    )
      .replace(/^["']|["']$/g, "")
      .trim();

    // If already cached as a number, return it
    if (typeof cachedCalcomEventTypeId === "number") {
      return {
        id: cachedCalcomEventTypeId,
        title: cachedCalcomEventTypeName || "Discovered Event",
      };
    }

    // If an integer number was explicitly set in environment, use it
    if (/^\d+$/.test(rawEnvEventType) && rawEnvEventType !== "11") {
      const numId = parseInt(rawEnvEventType, 10);
      cachedCalcomEventTypeId = numId;
      cachedCalcomEventTypeName = "Configured Event Type";
      return { id: numId, title: "Configured Event Type" };
    }

    if (!apiKey) return null;

    // Auto-discover event types from Cal.com account using API key v2
    try {
      const v2Res = await fetch("https://api.cal.com/v2/event-types", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "cal-api-version": "2024-06-11",
          "Content-Type": "application/json",
        },
      });

      if (v2Res.ok) {
        const v2Data = await v2Res.json();
        const eventTypesList: any[] = [];
        if (v2Data?.data?.eventTypeGroups && Array.isArray(v2Data.data.eventTypeGroups)) {
          for (const grp of v2Data.data.eventTypeGroups) {
            if (Array.isArray(grp.eventTypes)) {
              eventTypesList.push(...grp.eventTypes);
            }
          }
        }
        if (Array.isArray(v2Data?.data)) {
          eventTypesList.push(...v2Data.data);
        }

        if (eventTypesList.length > 0) {
          // If rawEnvEventType matches an event type's slug or id string
          let match = rawEnvEventType
            ? eventTypesList.find(
                (et: any) =>
                  String(et.id) === rawEnvEventType ||
                  (et.slug && et.slug.toLowerCase() === rawEnvEventType.toLowerCase())
              )
            : null;

          // Otherwise look for Clarity / Consultation / Sanctuary meeting
          if (!match) {
            match =
              eventTypesList.find((et: any) =>
                /clarity|consult|haven|clover|session/i.test(
                  et.title || et.slug || ""
                )
              ) || eventTypesList[0];
          }

          if (match && typeof match.id === "number") {
            cachedCalcomEventTypeId = match.id;
            cachedCalcomEventTypeName = match.title || match.slug || "Free Clarity Call";
            console.log(
              `[Cal.com] Successfully resolved event type "${cachedCalcomEventTypeName}" (ID: ${cachedCalcomEventTypeId})`
            );
            return {
              id: cachedCalcomEventTypeId,
              title: cachedCalcomEventTypeName,
              slug: match.slug,
            };
          }
        }
      } else {
        console.warn(`[Cal.com] GET /v2/event-types returned status ${v2Res.status}`);
      }
    } catch (discoveryErr) {
      console.warn("[Cal.com] Event type auto-discovery notice:", discoveryErr);
    }

    return null;
  };

  // Helper: Book directly in Cal.com so Cal.com dispatches confirmation, ICS calendar invites, and automated reminders
  const createCalcomBooking = async (params: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    selectedDate?: string;
    selectedTime?: string;
    startIso?: string;
    timezone?: string;
    notes?: string;
    duration?: number;
  }): Promise<{
    success: boolean;
    reference: string;
    meetingUrl?: string;
    calData?: any;
    error?: string;
    calcomSent: boolean;
  }> => {
    const apiKey = getCalcomApiKey();
    const fallbackRef = `CHH-CAL-${Math.floor(100000 + Math.random() * 900000)}`;

    if (!apiKey) {
      console.log(
        "[Cal.com] Note: CALCOM_API_KEY is not configured in secrets. Booking stored locally."
      );
      return {
        success: false,
        reference: fallbackRef,
        calcomSent: false,
        error: "No Cal.com API key configured",
      };
    }

    const {
      name,
      email,
      phone = "",
      address = "Telehealth Sanctuary",
      selectedDate,
      selectedTime = "10:00 AM",
      startIso,
      timezone = "America/Los_Angeles",
      notes = "",
    } = params;

    // Calculate clean start date ISO
    let startIsoString = startIso;
    if (!startIsoString) {
      try {
        let hours = 10;
        let minutes = 0;
        if (selectedTime) {
          const [timePart, modifier] = selectedTime.split(" ");
          if (timePart) {
            const parts = timePart.split(":");
            hours = parseInt(parts[0], 10) || 10;
            minutes = parseInt(parts[1], 10) || 0;
            if (modifier === "PM" && hours < 12) hours += 12;
            if (modifier === "AM" && hours === 12) hours = 0;
          }
        }
        const ymd = formatYMD(selectedDate || new Date().toISOString());
        const localDate = new Date(
          `${ymd}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
        );
        startIsoString = !isNaN(localDate.getTime())
          ? localDate.toISOString()
          : new Date().toISOString();
      } catch {
        startIsoString = new Date().toISOString();
      }
    }

    const resolved = await resolveCalcomEventType(apiKey);
    const eventTypeId = resolved
      ? resolved.id
      : (parseInt(process.env.CALCOM_EVENT_TYPE_ID || "", 10) || 7198199);

    let v2ErrorMessage = "";

    // 1. Try Cal.com v2 Bookings API (Recommended official API - sends confirmation & reminder emails)
    try {
      console.log(
        `[Cal.com] Initiating v2 booking for ${email} at ${startIsoString} (Event Type: ${eventTypeId})...`
      );
      const cleanPhone = normalizeE164Phone(phone);
      console.log(
        `[Cal.com] Initiating v2 booking for ${email} at ${startIsoString} (Event Type: ${eventTypeId}, Clean Phone: ${cleanPhone || "None"})...`
      );

      const requestBody: any = {
        start: startIsoString,
        eventTypeId: Number(eventTypeId),
        attendee: {
          name: name || "Client",
          email: email,
          timeZone: timezone,
          ...(cleanPhone ? { phoneNumber: cleanPhone } : {}),
        },
        metadata: {
          notes: notes || "Client Consultation",
          phone: phone || cleanPhone || "",
          address: address || "",
          source: "Clover Heart Haven Sanctuary",
        },
      };

      let v2Res = await fetch("https://api.cal.com/v2/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "cal-api-version": "2024-08-13",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      let v2Data = await v2Res.json().catch(() => ({}));

      // If Cal.com rejected specifically because of phone number validation format, retry without phoneNumber
      if (
        !v2Res.ok &&
        v2Res.status === 400 &&
        (JSON.stringify(v2Data).includes("invalid_number") ||
          JSON.stringify(v2Data).includes("phoneNumber") ||
          JSON.stringify(v2Data).includes("smsReminderNumber") ||
          JSON.stringify(v2Data).includes("responses"))
      ) {
        console.warn(
          "[Cal.com Phone Notice] Cal.com rejected phone format. Retrying booking with email only so client appointment is preserved..."
        );
        const fallbackRequestBody = {
          start: startIsoString,
          eventTypeId: Number(eventTypeId),
          attendee: {
            name: name || "Client",
            email: email,
            timeZone: timezone,
          },
          metadata: {
            notes: notes || "Client Consultation",
            phone: phone || "",
            address: address || "",
            source: "Clover Heart Haven Sanctuary",
          },
        };

        const retryRes = await fetch("https://api.cal.com/v2/bookings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "cal-api-version": "2024-08-13",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fallbackRequestBody),
        });

        if (retryRes.ok) {
          v2Res = retryRes;
          v2Data = await retryRes.json().catch(() => ({}));
          console.log("[Cal.com] Retry without phone number succeeded!");
        }
      }

      if (v2Res.ok) {
        const bookingId =
          v2Data?.data?.uid || v2Data?.data?.id || fallbackRef;
        const meetingUrl =
          v2Data?.data?.meetingUrl || v2Data?.data?.videoCallUrl || "";
        console.log(
          `[Cal.com Success] Booking created on Cal.com! ID: ${bookingId}. Cal.com confirmation and reminder emails scheduled.`
        );
        return {
          success: true,
          reference: String(bookingId),
          meetingUrl,
          calData: v2Data,
          calcomSent: true,
        };
      } else {
        v2ErrorMessage =
          v2Data?.error?.message ||
          v2Data?.message ||
          (typeof v2Data?.error === "string" ? v2Data.error : "") ||
          `Cal.com rejected booking (Status ${v2Res.status})`;
        console.warn(
          `[Cal.com v2 Notice] Response status ${v2Res.status}:`,
          JSON.stringify(v2Data)
        );
      }
    } catch (v2Err: any) {
      v2ErrorMessage = v2Err?.message || "Cal.com network error";
      console.warn("[Cal.com v2 Network Warning]:", v2Err);
    }

    return {
      success: false,
      reference: fallbackRef,
      calcomSent: false,
      error: v2ErrorMessage || "Cal.com booking creation failed",
    };
  };

  // 1. API: Get Cal.com Available Slots
  app.get("/api/cal/slots", async (req, res) => {
    try {
      const apiKey = getCalcomApiKey();
      const resolved = apiKey ? await resolveCalcomEventType(apiKey) : null;
      const eventTypeId =
        req.query.eventTypeId ||
        (resolved ? resolved.id : null) ||
        process.env.CALCOM_EVENT_TYPE_ID;
      const dateStr = (req.query.date as string) || new Date().toISOString();
      const timezone = (req.query.timezone as string) || "America/Los_Angeles";

      if (apiKey && eventTypeId) {
        try {
          const ymd = formatYMD(dateStr);
          const startOfDay = `${ymd}T00:00:00.000Z`;
          const endOfDay = `${ymd}T23:59:59.999Z`;

          // Call Cal.com API v2 slots endpoint
          const v2SlotsUrl = `https://api.cal.com/v2/slots/available?startTime=${encodeURIComponent(
            startOfDay
          )}&endTime=${encodeURIComponent(endOfDay)}&eventTypeId=${encodeURIComponent(
            String(eventTypeId)
          )}`;

          const calRes = await fetch(v2SlotsUrl, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "cal-api-version": "2024-06-11",
              "Content-Type": "application/json",
            },
          });

          if (calRes.ok) {
            const data = await calRes.json();
            const slotsMap = data?.data?.slots || data?.slots || {};
            const daySlots = slotsMap[ymd] || [];

            if (Array.isArray(daySlots) && daySlots.length > 0) {
              const formattedSlots = daySlots.map(
                (s: { time: string } | string) => {
                  const timeStr = typeof s === "string" ? s : s.time;
                  const dateObj = new Date(timeStr);
                  return isNaN(dateObj.getTime())
                    ? timeStr
                    : dateObj.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: timezone,
                      });
                }
              );
              return res.json({
                success: true,
                source: "calcom_api",
                date: ymd,
                slots: formattedSlots,
              });
            } else if (Array.isArray(daySlots) && daySlots.length === 0) {
              return res.json({
                success: true,
                source: "calcom_api",
                date: ymd,
                slots: [],
              });
            }
          }
        } catch (apiErr) {
          console.warn("Cal.com API v2 slots fetch warning:", apiErr);
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

  // Cal.com Connection Status Diagnostic Endpoint
  app.get("/api/cal/status", async (_req, res) => {
    const apiKey = getCalcomApiKey();
    const isPlaceholder = apiKey === "11" || (apiKey.length > 0 && apiKey.length < 8);
    const hasKey = !!apiKey && !isPlaceholder;
    let eventInfo = null;
    if (hasKey) {
      eventInfo = await resolveCalcomEventType(apiKey);
    }
    return res.json({
      success: true,
      hasApiKey: hasKey,
      isPlaceholder,
      apiKeyMasked: hasKey
        ? `${apiKey.substring(0, 4)}...${apiKey.slice(-3)}`
        : apiKey
        ? `"${apiKey}" (Placeholder)`
        : null,
      eventTypeId: eventInfo ? eventInfo.id : null,
      eventTypeName: eventInfo ? eventInfo.title : null,
      calcomLink: process.env.VITE_CALCOM_LINK && process.env.VITE_CALCOM_LINK !== "11" ? process.env.VITE_CALCOM_LINK : null,
      remindersEnabled: hasKey,
    });
  });

  // 2. API: Clover Heart Haven Direct Consultation Booking (Dual-Write to Supabase & Live Cal.com)
  app.post("/api/cal/book", async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        address,
        selectedDate,
        selectedTime,
        startIso,
        timezone = "America/Los_Angeles",
        notes = "",
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: "Full name is required.",
          code: "VALIDATION_ERROR",
        });
      }

      if (!email || !email.includes("@")) {
        return res.status(400).json({
          success: false,
          error: "A valid email address is required so you receive your calendar invite and video link.",
          code: "VALIDATION_ERROR",
        });
      }

      const rawPhone = (phone && typeof phone === "string") ? phone.trim() : "";
      const isPlaceholderPhone = /^(not provided|none|n\/a|na|no|null|undefined)$/i.test(rawPhone);
      const phoneForCalcom = isPlaceholderPhone ? "" : rawPhone;
      const storedPhone = (rawPhone && !isPlaceholderPhone) ? rawPhone : "Not provided";

      const apiKey = getCalcomApiKey();

      // Execute genuine Cal.com booking
      const calResult = await createCalcomBooking({
        name: name.trim(),
        email: email.trim(),
        phone: phoneForCalcom,
        address: address ? address.trim() : "Telehealth Sanctuary",
        selectedDate,
        selectedTime,
        startIso,
        timezone,
        notes: notes || "15-minute Free Clarity Call",
      });

      // Strict integrity check: If Cal.com API is active and rejected the booking, fail visibly
      if (!calResult.success && apiKey && apiKey !== "11") {
        const isConflict =
          calResult.error &&
          (calResult.error.toLowerCase().includes("taken") ||
            calResult.error.toLowerCase().includes("conflict") ||
            calResult.error.toLowerCase().includes("busy"));

        return res.status(isConflict ? 409 : 400).json({
          success: false,
          error:
            calResult.error ||
            "Cal.com could not confirm this appointment slot. Please choose another time.",
          code: isConflict ? "SLOT_TAKEN" : "CALCOM_REJECTED",
        });
      }

      const finalReference = calResult.reference;

      const bookingRecord: StoredProductionBooking = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        reference: finalReference,
        name: name.trim(),
        phone: storedPhone,
        address: address ? address.trim() : "Telehealth Sanctuary",
        email: email.trim(),
        selected_date: selectedDate || "Upcoming Session",
        selected_time: selectedTime || "10:00 AM",
        timezone,
        status: "confirmed",
        notes: notes
          ? `${notes} | Cal.com UID: ${finalReference} | Synced: ${calResult.calcomSent}`
          : `Cal.com UID: ${finalReference} | Synced: ${calResult.calcomSent}`,
        created_at: new Date().toISOString(),
      };

      memoryProductionBookings.unshift(bookingRecord);

      const db = getSupabase();
      let savedToSupabase = false;
      if (db) {
        const result = await insertProductionBookingToSupabase(db, bookingRecord);
        savedToSupabase = result.success;
        if (!savedToSupabase) {
          console.error(
            `[SUPABASE WARNING] Cal.com confirmed booking ${finalReference}, but Supabase dual-write failed!`
          );
        }
      }

      if (email && email.includes("@")) {
        syncLeadToMailchimp({
          email: email.trim(),
          firstName: name.trim().split(" ")[0] || "Patient",
          lastName:
            name.trim().split(" ").length > 1
              ? name.trim().split(" ").slice(1).join(" ")
              : "",
          source: "clover_clarity_intake",
          tags: ["Clover Heart Haven", "Clarity Call", "Booked Client"],
        }).catch((e) => console.warn("Mailchimp booking sync warning:", e));
      }

      return res.json({
        success: true,
        reference: finalReference,
        calBookingUid: finalReference,
        calcomSent: calResult.calcomSent,
        meetingUrl: calResult.meetingUrl,
        persisted: savedToSupabase,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        selectedDate,
        selectedTime,
      });
    } catch (err: any) {
      console.error("Error in /api/cal/book:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to process appointment booking.",
      });
    }
  });

  // API: Cancel Booking (via Cal.com & Dual-Write to Supabase)
  app.post("/api/cal/cancel", async (req, res) => {
    try {
      const { bookingUid, reference, id, reason = "Client requested cancellation" } = req.body;
      const targetUid = (bookingUid || reference || id || "").trim();

      if (!targetUid) {
        return res.status(400).json({
          success: false,
          error: "Booking reference or UID is required to cancel an appointment.",
        });
      }

      console.log(`[Cancel Action] Cancelling booking ${targetUid} (Reason: ${reason})`);

      // 1. Cancel on Cal.com
      const calCancelResult = await cancelCalcomBooking(targetUid, reason);

      // 2. Update status in memory
      const memBooking = memoryProductionBookings.find(
        (b) => b.reference === targetUid || b.id === targetUid
      );
      if (memBooking) {
        memBooking.status = "cancelled";
        memBooking.notes = memBooking.notes ? `${memBooking.notes} | Cancelled: ${reason}` : `Cancelled: ${reason}`;
      }

      // 3. Update status in Supabase (both tables)
      const db = getSupabase();
      let dbUpdated = false;
      if (db) {
        dbUpdated = await updateProductionBookingInSupabase(db, targetUid, "cancelled", { reason });
      }

      return res.json({
        success: true,
        status: "cancelled",
        bookingUid: targetUid,
        calcomCancelled: calCancelResult.success,
        calcomError: calCancelResult.error,
        persisted: dbUpdated,
        message: "Your appointment has been cancelled successfully.",
      });
    } catch (err: any) {
      console.error("Error in /api/cal/cancel:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to cancel appointment.",
      });
    }
  });

  // API: Reschedule Booking (via Cal.com & Dual-Write to Supabase)
  app.post("/api/cal/reschedule", async (req, res) => {
    try {
      const {
        bookingUid,
        reference,
        id,
        newStartIso,
        newDate,
        newTime,
        reason = "Client requested reschedule",
      } = req.body;

      const targetUid = (bookingUid || reference || id || "").trim();

      if (!targetUid) {
        return res.status(400).json({
          success: false,
          error: "Booking reference or UID is required to reschedule.",
        });
      }

      if (!newStartIso && (!newDate || !newTime)) {
        return res.status(400).json({
          success: false,
          error: "A new appointment date and time are required for rescheduling.",
        });
      }

      let finalStartIso = newStartIso;
      if (!finalStartIso && newDate && newTime) {
        try {
          const match = newTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
          let hours = 10;
          let minutes = 0;
          if (match) {
            hours = parseInt(match[1], 10);
            minutes = parseInt(match[2], 10);
            const ampm = match[3].toUpperCase();
            if (ampm === "PM" && hours < 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;
          }
          finalStartIso = `${formatYMD(newDate)}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00.000Z`;
        } catch {
          finalStartIso = new Date().toISOString();
        }
      }

      console.log(`[Reschedule Action] Rescheduling booking ${targetUid} to ${finalStartIso}`);

      // 1. Reschedule on Cal.com
      const calRescheduleResult = await rescheduleCalcomBooking(targetUid, finalStartIso, reason);

      // 2. Update memory store
      const memBooking = memoryProductionBookings.find(
        (b) => b.reference === targetUid || b.id === targetUid
      );
      if (memBooking) {
        memBooking.status = "rescheduled" as any;
        if (newDate) memBooking.selected_date = newDate;
        if (newTime) memBooking.selected_time = newTime;
        memBooking.notes = memBooking.notes ? `${memBooking.notes} | Rescheduled: ${reason}` : `Rescheduled: ${reason}`;
      }

      // 3. Update Supabase (both tables)
      const db = getSupabase();
      let dbUpdated = false;
      if (db) {
        dbUpdated = await updateProductionBookingInSupabase(
          db,
          targetUid,
          "rescheduled",
          { newDate, newTime, reason }
        );
      }

      return res.json({
        success: true,
        status: "rescheduled",
        bookingUid: targetUid,
        newStartIso: finalStartIso,
        newDate,
        newTime,
        calcomRescheduled: calRescheduleResult.success,
        calcomError: calRescheduleResult.error,
        persisted: dbUpdated,
        message: "Your appointment has been rescheduled successfully.",
      });
    } catch (err: any) {
      console.error("Error in /api/cal/reschedule:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to reschedule appointment.",
      });
    }
  });

  // API: Cal.com Webhook Ingestion (Real-time updates from Cal.com)
  app.post("/api/cal/webhook", async (req, res) => {
    try {
      if (!verifyCalcomWebhookSignature(req)) {
        console.warn("[Cal.com Webhook] Rejecting unsigned / invalid webhook payload (401)");
        return res.status(401).json({ success: false, error: "Invalid webhook signature" });
      }

      const rawEvent = (req.body.triggerEvent || req.body.event || req.body.type || "").toString();
      const triggerEvent = rawEvent.toUpperCase();
      const payload = req.body.payload || req.body.data || req.body;
      const bookingUid = payload?.uid || payload?.bookingUid || payload?.id || req.body.uid;

      console.log(`[Cal.com Webhook] Received ${triggerEvent} for UID: ${bookingUid}`);

      const db = getSupabase();

      if (triggerEvent.includes("CANCEL")) {
        const reason = payload?.cancellationReason || "Cancelled via Cal.com";
        const mem = memoryProductionBookings.find((b) => b.reference === bookingUid || b.id === bookingUid);
        if (mem) {
          mem.status = "cancelled";
          mem.notes = mem.notes ? `${mem.notes} | Webhook Cancelled: ${reason}` : `Webhook Cancelled: ${reason}`;
        }
        if (db && bookingUid) {
          await updateProductionBookingInSupabase(db, String(bookingUid), "cancelled", { reason });
        }
      } else if (triggerEvent.includes("RESCHEDULE")) {
        const startTime = payload?.startTime || payload?.start;
        const reason = payload?.rescheduleReason || "Rescheduled via Cal.com";
        let newDateStr = "";
        let newTimeStr = "";
        if (startTime) {
          const d = new Date(startTime);
          if (!isNaN(d.getTime())) {
            newDateStr = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
            newTimeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
          }
        }
        const mem = memoryProductionBookings.find((b) => b.reference === bookingUid || b.id === bookingUid);
        if (mem) {
          mem.status = "rescheduled" as any;
          if (newDateStr) mem.selected_date = newDateStr;
          if (newTimeStr) mem.selected_time = newTimeStr;
        }
        if (db && bookingUid) {
          await updateProductionBookingInSupabase(db, String(bookingUid), "rescheduled", {
            newDate: newDateStr || undefined,
            newTime: newTimeStr || undefined,
            reason,
          });
        }
      } else if (triggerEvent.includes("CREATED") || triggerEvent.includes("BOOKING_REQUESTED")) {
        const attendee = Array.isArray(payload?.attendees) && payload.attendees.length > 0
          ? payload.attendees[0]
          : payload?.attendee || {};
        const clientName = attendee.name || payload?.name || "Client";
        const clientEmail = attendee.email || payload?.email || "";
        const clientPhone = attendee.phoneNumber || payload?.phone || "";
        const startTime = payload?.startTime || payload?.start;

        let dateFormatted = "Upcoming Session";
        let timeFormatted = "10:00 AM";
        if (startTime) {
          const d = new Date(startTime);
          if (!isNaN(d.getTime())) {
            dateFormatted = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
            timeFormatted = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
          }
        }

        const newRecord: StoredProductionBooking = {
          id: `webhook_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          reference: String(bookingUid || `CAL-${Date.now()}`),
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          address: "Telehealth Sanctuary",
          selected_date: dateFormatted,
          selected_time: timeFormatted,
          timezone: attendee.timeZone || "America/Los_Angeles",
          status: "confirmed",
          notes: "Created via Cal.com Webhook",
          created_at: new Date().toISOString(),
        };

        const existingIdx = memoryProductionBookings.findIndex(
          (b) => b.reference === newRecord.reference
        );
        if (existingIdx >= 0) {
          memoryProductionBookings[existingIdx].status = "confirmed";
        } else {
          memoryProductionBookings.unshift(newRecord);
        }

        if (db) {
          await insertProductionBookingToSupabase(db, newRecord);
        }
      }

      return res.json({
        success: true,
        acknowledged: true,
        triggerEvent,
        bookingUid,
      });
    } catch (err: any) {
      console.error("[Cal.com Webhook Exception]:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to process webhook" });
    }
  });

  // API: Get Booking by UID or Reference (for client & admin lookup)
  app.get("/api/cal/booking/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      if (!uid) {
        return res.status(400).json({ success: false, error: "Missing booking UID" });
      }

      let booking: any = memoryProductionBookings.find(
        (b) => b.reference.toLowerCase() === uid.toLowerCase() || b.id.toLowerCase() === uid.toLowerCase()
      );

      if (!booking) {
        const db = getSupabase();
        if (db) {
          const { data } = await db
            .from("productionbookings")
            .select("*")
            .or(`reference.eq.${uid},id.eq.${uid}`)
            .maybeSingle();
          if (data) booking = data;
        }
      }

      if (!booking) {
        const apiKey = getCalcomApiKey();
        if (apiKey && apiKey !== "11") {
          try {
            const calRes = await fetch(`https://api.cal.com/v2/bookings/${encodeURIComponent(uid)}`, {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "cal-api-version": "2024-08-13",
              },
            });
            if (calRes.ok) {
              const calData: any = await calRes.json();
              const b = calData.data || calData;
              booking = {
                id: b.id || b.uid,
                reference: b.uid || uid,
                name: b.attendee?.name || (b.attendees?.[0]?.name) || "Client",
                email: b.attendee?.email || (b.attendees?.[0]?.email) || "",
                phone: b.attendee?.phoneNumber || "",
                selected_date: b.start ? new Date(b.start).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "Upcoming Session",
                selected_time: b.start ? new Date(b.start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "10:00 AM",
                status: b.status || "confirmed",
                notes: b.description || "",
              };
            }
          } catch {}
        }
      }

      if (!booking) {
        return res.status(404).json({ success: false, error: "Booking not found" });
      }

      return res.json({ success: true, booking });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || "Failed to look up booking" });
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

      // Async Step: Synchronize lead immediately to Mailchimp Audience
      syncLeadToMailchimp({
        email: resolvedEmail,
        firstName: resolvedFirstName,
        source: resolvedSource,
        tags: ["Clover Heart Haven", "Lead Magnet", resolvedSource],
      }).catch((e) => console.warn("Background Mailchimp sync warning:", e));

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
        phone,
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
      const finalPhone = phone || "";

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

      // Post booking to Cal.com so Cal.com schedules calendar invite, host notification, and automated reminder emails
      if (finalEmail) {
        createCalcomBooking({
          name: finalName,
          email: finalEmail,
          phone: finalPhone,
          selectedDate: finalDate,
          selectedTime: finalTime,
          startIso,
          timezone,
          notes: "Lead Magnet Clarity Call",
        }).catch((calErr) => console.warn("Cal.com background booking sync note:", calErr));
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

        // Sync lead with Booked tag to Mailchimp
        syncLeadToMailchimp({
          email: finalEmail,
          firstName: finalName,
          source: "landing_booking_completion",
          tags: ["Clover Heart Haven", "Booked Client", "1-Hour Consultation"],
        }).catch((e) => console.warn("Background Mailchimp booking sync warning:", e));
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

      const mailchimpConf = getMailchimpConfig();
      const mailchimpStatus = {
        isConfigured: !!mailchimpConf,
        dataCenter: mailchimpConf?.dataCenter || null,
        listId: cachedMailchimpListId || process.env.MAILCHIMP_AUDIENCE_ID || process.env.MAILCHIMP_LIST_ID || null,
      };

      const calcomApiKey = getCalcomApiKey();
      const isPlaceholder = calcomApiKey === "11" || (calcomApiKey.length > 0 && calcomApiKey.length < 8);
      const hasCalcomKey = !!calcomApiKey && !isPlaceholder;
      const calcomStatus = {
        isConfigured: hasCalcomKey,
        isPlaceholder,
        apiKeyMasked: hasCalcomKey
          ? `${calcomApiKey.substring(0, 4)}...${calcomApiKey.slice(-3)}`
          : calcomApiKey
          ? `"${calcomApiKey}" (Placeholder / Incomplete)`
          : null,
        eventTypeId: cachedCalcomEventTypeId || (process.env.CALCOM_EVENT_TYPE_ID !== "11" ? process.env.CALCOM_EVENT_TYPE_ID : null) || null,
        eventTypeName: cachedCalcomEventTypeName || null,
        link: process.env.VITE_CALCOM_LINK && process.env.VITE_CALCOM_LINK !== "11" ? process.env.VITE_CALCOM_LINK : null,
        remindersEnabled: hasCalcomKey,
      };

      return res.json({
        success: true,
        isSupabaseConnected: !!getSupabase(),
        mailchimp: mailchimpStatus,
        calcom: calcomStatus,
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

  // 10. API: Admin Test Mailchimp Sync Endpoint
  app.post("/api/admin/mailchimp/test-sync", async (req, res) => {
    try {
      if (!verifyAdminRequest(req, res)) return;
      const { email = "test@cloverhearthaven.com", firstName = "Clover", source = "admin_test" } = req.body;

      const result = await syncLeadToMailchimp({
        email,
        firstName,
        source,
        tags: ["Clover Heart Haven", "Admin Test"],
      });

      return res.json({ success: result.success, skipped: result.skipped, error: result.error });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || "Failed test sync" });
    }
  });

  // 11. API: Admin Test & Verify Cal.com API Connection
  app.post("/api/admin/calcom/test-verify", async (req, res) => {
    try {
      if (!verifyAdminRequest(req, res)) return;
      const apiKey = getCalcomApiKey();
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: "No CALCOM_API_KEY found in your Secrets. Please add CALCOM_API_KEY to your project secrets.",
        });
      }

      if (apiKey === "11" || apiKey.length < 8) {
        return res.status(400).json({
          success: false,
          error: `The current secret key "${apiKey}" is a placeholder and not a valid Cal.com API key. Real Cal.com API keys start with "cal_live_...". Please generate an API key in Cal.com (Settings > Developer > API Keys) and paste it into Secrets.`,
        });
      }

      // Live ping to Cal.com API v2
      try {
        const pingRes = await fetch("https://api.cal.com/v2/me", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "cal-api-version": "2024-08-13",
          },
        });

        if (pingRes.status === 401) {
          return res.status(400).json({
            success: false,
            error: "Cal.com rejected the API key (401 Unauthorized: Invalid Access Token). Please verify that you copied the complete key (starts with 'cal_live_...') from Cal.com Settings > Developer > API Keys.",
          });
        }

        if (!pingRes.ok) {
          return res.status(400).json({
            success: false,
            error: `Cal.com API returned status ${pingRes.status}. Please check your API key in Cal.com.`,
          });
        }
      } catch (networkErr: any) {
        console.warn("[Cal.com verify warning]:", networkErr);
      }

      const eventInfo = await resolveCalcomEventType(apiKey);
      const configuredEventId = process.env.CALCOM_EVENT_TYPE_ID;
      if (!eventInfo && (!configuredEventId || configuredEventId === "11")) {
        return res.json({
          success: true,
          apiKeyMasked: `${apiKey.substring(0, 4)}...${apiKey.slice(-3)}`,
          eventTypeId: null,
          eventTypeName: null,
          remindersEnabled: false,
          warning: "API key is valid, but no Event Type was found in your Cal.com account. Please create an Event Type in your Cal.com Dashboard (e.g. '15-Min Consultation') and attach a Reminder Workflow to it so reminders can be sent.",
          message: "API key verified. Note: You still need to create an Event Type in Cal.com to send reminders.",
        });
      }

      return res.json({
        success: true,
        apiKeyMasked: `${apiKey.substring(0, 4)}...${apiKey.slice(-3)}`,
        eventTypeId: eventInfo ? eventInfo.id : configuredEventId,
        eventTypeName: eventInfo ? eventInfo.title : "Default Event",
        remindersEnabled: true,
        message: "Cal.com API connection verified! Live calendar invitations and reminder workflows are active.",
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || "Failed Cal.com verification" });
    }
  });

  // Admin: Cancel Booking on Cal.com & Dual-Write to Supabase
  app.post("/api/admin/bookings/:id/cancel", async (req, res) => {
    try {
      if (!verifyAdminRequest(req, res)) return;
      const { id } = req.params;
      const { reason = "Cancelled by practice administrator" } = req.body;

      const calCancelResult = await cancelCalcomBooking(id, reason);

      const memBooking = memoryProductionBookings.find(
        (b) => b.id === id || b.reference === id
      );
      if (memBooking) {
        memBooking.status = "cancelled";
        memBooking.notes = memBooking.notes ? `${memBooking.notes} | Admin Cancel: ${reason}` : `Admin Cancel: ${reason}`;
      }

      const db = getSupabase();
      let dbUpdated = false;
      if (db) {
        dbUpdated = await updateProductionBookingInSupabase(db, id, "cancelled", { reason });
      }

      return res.json({
        success: true,
        status: "cancelled",
        bookingUid: id,
        calcomCancelled: calCancelResult.success,
        calcomError: calCancelResult.error,
        persisted: dbUpdated,
        message: "Booking cancelled successfully.",
      });
    } catch (err: any) {
      console.error("Error in admin cancel booking:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to cancel booking" });
    }
  });

  // Admin: Reschedule Booking on Cal.com & Dual-Write to Supabase
  app.post("/api/admin/bookings/:id/reschedule", async (req, res) => {
    try {
      if (!verifyAdminRequest(req, res)) return;
      const { id } = req.params;
      const { newStartIso, newDate, newTime, reason = "Rescheduled by practice administrator" } = req.body;

      if (!newStartIso && (!newDate || !newTime)) {
        return res.status(400).json({ success: false, error: "New appointment date and time are required." });
      }

      let finalStartIso = newStartIso;
      if (!finalStartIso && newDate && newTime) {
        try {
          const match = newTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
          let hours = 10;
          let minutes = 0;
          if (match) {
            hours = parseInt(match[1], 10);
            minutes = parseInt(match[2], 10);
            const ampm = match[3].toUpperCase();
            if (ampm === "PM" && hours < 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;
          }
          finalStartIso = `${formatYMD(newDate)}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00.000Z`;
        } catch {
          finalStartIso = new Date().toISOString();
        }
      }

      const calRescheduleResult = await rescheduleCalcomBooking(id, finalStartIso, reason);

      const memBooking = memoryProductionBookings.find(
        (b) => b.id === id || b.reference === id
      );
      if (memBooking) {
        memBooking.status = "rescheduled" as any;
        if (newDate) memBooking.selected_date = newDate;
        if (newTime) memBooking.selected_time = newTime;
        memBooking.notes = memBooking.notes ? `${memBooking.notes} | Admin Rescheduled: ${reason}` : `Admin Rescheduled: ${reason}`;
      }

      const db = getSupabase();
      let dbUpdated = false;
      if (db) {
        dbUpdated = await updateProductionBookingInSupabase(
          db,
          id,
          "rescheduled",
          { newDate, newTime, reason }
        );
      }

      return res.json({
        success: true,
        status: "rescheduled",
        bookingUid: id,
        newStartIso: finalStartIso,
        calcomRescheduled: calRescheduleResult.success,
        calcomError: calRescheduleResult.error,
        persisted: dbUpdated,
        message: "Booking rescheduled successfully.",
      });
    } catch (err: any) {
      console.error("Error in admin reschedule booking:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to reschedule booking" });
    }
  });

  // Health check endpoint for Render deployment & uptime monitoring
  app.get("/api/health", (_req, res) => {
    const apiKey = getCalcomApiKey();
    res.json({
      status: "healthy",
      service: "clover-heart-haven",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      supabaseConnected: !!getSupabase(),
      calcomConfigured: !!apiKey && apiKey !== "11",
      version: "2.0.0",
    });
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
