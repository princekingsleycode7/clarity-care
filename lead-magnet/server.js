import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('.'));

// Enable CORS for your landing page domain and local development
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.ALLOWED_ORIGIN && process.env.ALLOWED_ORIGIN !== '*') {
      const allowed = [
        process.env.ALLOWED_ORIGIN,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ];
      if (allowed.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    }
    return callback(null, true);
  },
  methods: ['POST', 'GET']
}));

// Initialize API Clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('re_xxxxxxxx')) 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

if (!resend) {
  console.warn('Resend API key not set or placeholder. Email dispatching will be skipped.');
}

async function sendEmailSafe({ to, subject, html }) {
  if (!resend) {
    console.warn(`[Resend Skipped] Email to ${to} skipped — Resend not configured.`);
    return;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: 'Clover Heart Haven <support@cloverhearthaven.com>', // must be a verified domain in Resend
      to,
      subject,
      html
    });
    if (error) {
      console.error('[Resend Error]:', error);
    } else {
      console.log(`[Resend Success] Email sent successfully to ${to} (Email ID: ${data?.id || 'sent'})`);
    }
    return data;
  } catch (err) {
    console.error('[Resend Exception]:', err);
    // swallow — never throw
  }
}

// -------------------------------------------------------------------
// Mailchimp Synchronization Helper
// -------------------------------------------------------------------
let cachedMailchimpListId = null;

function getMailchimpConfig() {
  const rawKey = (process.env.MAILCHIMP_API_KEY || '').trim();
  if (!rawKey || rawKey.includes('your-mailchimp-key') || rawKey.length < 10) {
    return null;
  }
  const parts = rawKey.split('-');
  const dataCenter = parts.length > 1 ? parts[parts.length - 1].trim().toLowerCase() : 'us1';
  return { apiKey: rawKey, dataCenter };
}

async function resolveMailchimpListId(config) {
  const envListId = (process.env.MAILCHIMP_AUDIENCE_ID || process.env.MAILCHIMP_LIST_ID || '').trim();
  if (envListId) return envListId;
  if (cachedMailchimpListId) return cachedMailchimpListId;

  try {
    const res = await fetch(`https://${config.dataCenter}.api.mailchimp.com/3.0/lists?count=10&fields=lists.id,lists.name`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${config.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.lists && data.lists.length > 0) {
        cachedMailchimpListId = data.lists[0].id;
        console.log(`[Mailchimp] Discovered Audience: "${data.lists[0].name}" (ID: ${cachedMailchimpListId})`);
        return cachedMailchimpListId;
      }
    }
  } catch (e) {
    console.warn('[Mailchimp Lookup Exception]:', e);
  }
  return null;
}

async function syncLeadToMailchimp({ email, firstName, lastName = '', source = 'lead_magnet', tags = ['Clover Heart Haven', 'Lead Magnet'] }) {
  const config = getMailchimpConfig();
  if (!config) return { success: false, skipped: true };

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) return { success: false };

  try {
    const listId = await resolveMailchimpListId(config);
    if (!listId) return { success: false, error: 'No audience list' };

    const subscriberHash = crypto.createHash('md5').update(cleanEmail).digest('hex');
    const payload = {
      email_address: cleanEmail,
      status_if_new: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
        LNAME: lastName || '',
        MMERGE3: source || 'website',
      },
      tags: Array.isArray(tags) ? tags : ['Clover Heart Haven'],
    };

    const url = `https://${config.dataCenter}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${config.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[Mailchimp Success] Synced lead "${cleanEmail}" (${firstName || 'Anonymous'}) to Mailchimp.`);
      return { success: true };
    } else {
      const errBody = await response.text();
      console.warn(`[Mailchimp API Error ${response.status}]:`, errBody);
      return { success: false };
    }
  } catch (err) {
    console.warn('[Mailchimp Sync Exception]:', err);
    return { success: false };
  }
}

// -------------------------------------------------------------------
// 1. LEAD CAPTURE & FREE GUIDE DISPATCH
// -------------------------------------------------------------------
app.post('/api/leads', async (req, res) => {
  const { firstName, email, source } = req.body;

  if (!email || !firstName) {
    return res.status(400).json({ error: 'First name and email are required.' });
  }

  try {
    // A. Store or Update Lead in Database
    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .upsert({ email, first_name: firstName, utm_source: source || 'direct' }, { onConflict: 'email' })
      .select()
      .single();

    if (dbError) throw dbError;

    console.log(`[Lead Success] Lead captured: ${firstName} <${email}> (Source: ${source || 'direct'}, Lead ID: ${lead.id})`);

    // B. Send Instant Transactional Email with Free Guide PDF
    await sendEmailSafe({
      to: email,
      subject: 'Why You Still Miss Them — Your Free Guide',
      html: `
        <p>Hi ${firstName},</p>
        <p>Thank you for reaching out to Clover Heart Haven. Here is your copy of <strong>Why You Still Miss Them</strong>.</p>
        <p><a href="https://res.cloudinary.com/dsgk1zlj1/image/upload/v1786751973/guide.pdf">Download Your PDF Guide Here</a></p>
        <p>Take your time reading through it. We are here whenever you're ready.</p>
        <p>Warmly,<br>The Clover Heart Haven Team</p>
      `
    });

    // C. Async Step: Pre-generate AI personalized email sequence (Background task)
    if (lead?.id) {
      generatePersonalizedFollowup(lead.id, firstName, source).catch(console.error);
    }

    // D. Async Step: Sync Lead to Mailchimp Audience
    syncLeadToMailchimp({
      email,
      firstName,
      source: source || 'direct',
      tags: ['Clover Heart Haven', 'Lead Magnet', source || 'direct'],
    }).catch(console.error);

    return res.status(201).json({ success: true, message: 'Lead captured and guide sent.' });

  } catch (err) {
    console.error('Lead endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error processing lead.' });
  }
});

// -------------------------------------------------------------------
// 2. APPOINTMENT BOOKING ENDPOINT
// -------------------------------------------------------------------
app.post(['/api/bookings', '/api/vi/bookings', '/api/v1/bookings'], async (req, res) => {
  const { date, time, email } = req.body;

  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required for booking.' });
  }

  try {
    let leadId = null;

    // Link booking to existing lead if email is present
    if (email) {
      const { data: lead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (lead) leadId = lead.id;
    }

    // Insert booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        lead_id: leadId,
        email: email || null,
        scheduled_at: date,
        time_slot: time,
        status: 'confirmed'
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    console.log(`[Booking Success] Booking confirmed for ${email || 'Guest'} on ${date} at ${time} (Booking ID: ${booking?.id || 'created'})`);

    // Send confirmation email if email provided
    if (email) {
      await sendEmailSafe({
        to: email,
        subject: 'Confirmed: Your Clover Heart Haven Call',
        html: `<p>Your 1-hour private session has been scheduled for <strong>${date} at ${time}</strong>.</p>`
      });

      // Sync lead with Booked status to Mailchimp
      syncLeadToMailchimp({
        email,
        source: 'landing_booking_completion',
        tags: ['Clover Heart Haven', 'Booked Client', '1-Hour Consultation']
      }).catch(console.error);
    }

    return res.status(201).json({ success: true, message: 'Booking confirmed.' });

  } catch (err) {
    console.error('Booking endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error processing booking.' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { date, time, email, name, timezone, startIso } = req.body;

  if ((!date || !time) && !startIso) {
    return res.status(400).json({ error: 'Date, time, and email are required.' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // 1. Combine date and time into an ISO 8601 string (e.g., "2026-08-30T09:00:00Z")
    let startIsoString = startIso;
    if (!startIsoString) {
      const parsed = new Date(`${date} ${time}`);
      if (!isNaN(parsed.getTime())) {
        startIsoString = parsed.toISOString();
      } else {
        startIsoString = new Date(date).toISOString();
      }
    }

    // 2. Post booking directly to Cal.com API v2
    const calResponse = await fetch('https://api.cal.com/v2/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
        'Content-Type': 'application/json',
        'cal-api-version': '2024-08-13'
      },
      body: JSON.stringify({
        start: startIsoString,
        eventTypeId: Number(process.env.CAL_EVENT_TYPE_ID),
        attendee: {
          name: name || 'Guest',
          email: email,
          timeZone: timezone || 'Africa/Lagos'
        }
      })
    });

    const calData = await calResponse.json();

    if (!calResponse.ok) {
      console.error('Cal.com API error:', calData);
      return res.status(calResponse.status).json({ error: calData.message || 'Failed to create Cal.com booking' });
    }

    // 3. Link booking to existing lead in Supabase
    let leadId = null;
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (lead) leadId = lead.id;

    // 4. Save booking record in Supabase
    const bookingPayload = {
      lead_id: leadId,
      email: email,
      scheduled_at: date || startIsoString,
      time_slot: time || 'Cal.com Event',
      status: 'confirmed'
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingPayload);

    if (bookingError) {
      console.warn('Warning saving booking to database:', bookingError.message);
    } else {
      console.log(`[Cal.com Booking Success] Booking confirmed for ${name || 'Guest'} <${email}> on ${date || startIsoString} at ${time || ''} (Cal Booking ID: ${calData.data?.id || 'created'})`);
    }

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed.',
      calBooking: calData.data
    });

  } catch (err) {
    console.error('Booking endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error processing booking.' });
  }
});


//
// 3. Get available slots
//
app.get('/api/availability', async (req, res) => {
  try {
    const eventTypeId = process.env.CAL_EVENT_TYPE_ID;
    const timezone = req.query.timezone || 'Africa/Lagos';

    // Set a rolling window for availability (e.g., next 14 days)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    // Fetch availability from Cal.com
    const response = await fetch(`https://api.cal.com/v2/slots?eventTypeId=${eventTypeId}&start=${start}&end=${end}&timeZone=${timezone}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CAL_API_KEY}`,
        'cal-api-version': '2024-09-04'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cal.com slots error:', data);
      return res.status(response.status).json({ error: 'Failed to fetch availability', details: data });
    }

    console.log(`[Availability Success] Fetched slots for timezone ${timezone} (${start} to ${end})`);
    return res.status(200).json(data);

  } catch (err) {
    console.error('Availability route error:', err);
    return res.status(500).json({ error: 'Internal server error fetching available times.' });
  }
});

// -------------------------------------------------------------------
// 3. AI PERSONALIZATION HELPER ENGINE
// -------------------------------------------------------------------
async function generatePersonalizedFollowup(leadId, firstName, utmSource) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your-openai-api-key')) {
    console.warn(`[OpenAI Skipped] AI sequence generation skipped for ${firstName} (OpenAI API key is placeholder or unset).`);
    return;
  }

  try {
    const prompt = `Write a gentle, highly empathetic Day-2 follow-up email for ${firstName}, who just downloaded the guide "Why You Still Miss Them". 
  They came from ad channel: "${utmSource}". 
  Keep it concise, compassionate, non-salesy, and focused on self-compassion. Include a single placeholder for a free clarity call booking link.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const generatedCopy = completion.choices[0].message.content;

    // Save personalized copy to sequence queue in database
    await supabase.from('email_queue').insert({
      lead_id: leadId,
      email_type: 'followup_day_2',
      subject: `Checking in, ${firstName}`,
      body_html: generatedCopy,
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000) // Scheduled 24h later
    });

    console.log(`[AI Follow-up Success] Queued Day-2 follow-up email for ${firstName} (Lead ID: ${leadId})`);
  } catch (err) {
    console.error('[OpenAI Error]:', err.message || err);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Funnel API engine running on port ${PORT}`));