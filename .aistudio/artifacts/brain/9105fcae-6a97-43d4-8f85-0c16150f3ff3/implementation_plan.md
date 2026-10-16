# Production Readiness: Render Deployment, Cal.com Webhooks & Booking Lifecycle Management

Production deployment configuration for Render, real-time Cal.com webhook synchronization, client and admin cancellation and rescheduling flows, and dual-table Supabase persistence for the 15-minute Free Clarity Call.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and workflow decisions have been confirmed and are locked into this plan:

- **Database Single Source of Truth**: Confirmed **Dual-write to both `productionbookings` and `bookings` tables** in Supabase for backward compatibility across existing analytics and admin views.
- **Consultation Offering**: Standardized across all forms, modals, emails, and Cal.com lookups to **"15-minute Free Clarity Call"** (matching active Cal.com event type `7198199`).
- **Lead Destination Workflow**: Submitting the consultation form synchronously triggers **Supabase persistent storage** and **Cal.com automated reminders, ICS calendar invites, and video conferencing**.
- **Hosting & Webhooks**: Deployed on **Render** (using dynamic `$PORT` and `0.0.0.0` binding), using Cal.com webhooks (`BOOKING_CREATED`, `BOOKING_RESCHEDULED`, `BOOKING_CANCELLED`) with cryptographic HMAC signature verification.

---

## 1. Overview & Core Concept

- **What It Does**: Provides an end-to-end booking experience for Clover Heart Haven clients to schedule, reschedule, and cancel their 15-minute Free Clarity Calls. Webhook callbacks from Cal.com instantly sync appointment changes into Supabase, and the site runs reliably on Render with zero port-binding collisions.
- **Target Audience / Persona**: Prospective therapy clients seeking an introductory consultation, existing clients needing to manage their upcoming sessions, and practice administrators overseeing inquiries and bookings.
- **Key Value**: Guarantees zero dropped leads, verifiable Cal.com calendar synchronization, real-time automated reminders, and complete self-service appointment control without manual staff intervention.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **New Booking Flow**:
   - Client clicks "Book Free Clarity Call" on the landing page or navigation.
   - The consultation modal or booking page queries `/api/cal/slots?date=YYYY-MM-DD` and presents real-time Cal.com slots.
   - Upon slot selection and contact info submission (name, email, phone, notes), the backend reserves the slot via Cal.com API v2, sends reminders, and persists the record to both Supabase tables (`bookings` and `productionbookings`).
   - A truthful confirmation screen displays the actual Cal.com booking reference, meeting link, and details.

2. **Client Self-Service Management (Reschedule & Cancel)**:
   - Clients access their booking via confirmation link or booking lookup (`/manage-booking?ref=UID` or modal).
   - **Reschedule**: Client views available alternative slots fetched directly from Cal.com, selects a new time, and enters a reason. The backend calls Cal.com reschedule endpoint and updates Supabase.
   - **Cancel**: Client enters an optional cancellation reason, confirms the cancellation, and the backend releases the slot on Cal.com and marks the booking cancelled.

3. **Admin Dashboard Flow**:
   - Practice administrators log in via secure passcode/session.
   - The dashboard lists all bookings from both tables with live status badges (`Confirmed`, `Rescheduled`, `Cancelled`).
   - Quick action triggers allow admins to trigger emergency cancellations or reschedules directly from the dashboard.

### Visual Identity & Theme
- **Aesthetic Direction**: Warm, reassuring, serene clinical aesthetic tailored for compassionate mental health therapy.
- **Color Palette**:
  - Primary: Deep Forest Emerald (`#1B4332`, Tailwind `emerald-900`)
  - Accent / Highlights: Soft Sage (`#74C69D`, `emerald-400`) and Warm Honey Gold (`#D4A373`)
  - Backgrounds: Warm Linen & Off-White (`#FDFBF7`, `#F7F4EE`)
  - Status Indicators: Emerald for Confirmed, Amber for Rescheduled, Rose for Cancelled
- **Typography**: Editorial serif headings (`font-serif`, Cormorant Garamond / Playfair) paired with clean, readable sans-serif body typography (`Inter` / `sans-serif`).
- **Interactive Feedback**: Accessible spinners during Cal.com slot loading, clear inline validation on email and phone inputs, and clear modal notifications on cancellation or reschedule success.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Write Persistence**
  - *Chosen Approach*: Write simultaneously to `productionbookings` and `bookings` tables in Supabase with normalized error boundaries.
  - *Why*: Guarantees zero disruption to existing database triggers, admin dashboard views, or analytics pipelines while ensuring data consistency.
  - *Alternatives Considered*: Dropping one table in favor of the other was rejected to prevent breaking historical records and legacy queries.

- **Decision 2: Cal.com Webhooks with HMAC Verification**
  - *Chosen Approach*: Implement `POST /api/cal/webhook` verifying `X-Cal-Signature-256` using `CALCOM_WEBHOOK_SECRET`, falling back to payload validation in development.
  - *Why*: Allows two-way sync so that if a client cancels or reschedules inside Google Calendar or Cal.com directly, Supabase is immediately kept up to date.
  - *Alternatives Considered*: Periodic polling was rejected due to unnecessary API rate limit usage and synchronization delays.

- **Decision 3: Render Deployment Configuration**
  - *Chosen Approach*: Bind Express to `process.env.PORT || 3000` with host `0.0.0.0`, add a dedicated health check endpoint `GET /api/health`, and ensure both `tsx server.ts` and compiled production serving work seamlessly.
  - *Why*: Render automatically assigns dynamic random ports and kills containers that fail HTTP health checks or bind to `localhost`.
  - *Alternatives Considered*: Hardcoding port 3000 fails Render boot checks.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Clover Heart Haven Client                       │
│   (Vite + React 18 + Tailwind CSS + Lucide Icons)                      │
│                                                                        │
│   ┌────────────────────┐  ┌───────────────────┐  ┌─────────────────┐   │
│   │ Consultation Modal │  │   Booking Page    │  │ Admin Dashboard │   │
│   └─────────┬──────────┘  └─────────┬─────────┘  └────────┬────────┘   │
└─────────────┼───────────────────────┼─────────────────────┼────────────┘
              │                       │                     │
              ▼                       ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Express Backend (server.ts on Render)                │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Health & Readiness: GET /api/health (0.0.0.0:${PORT})          │   │
│   │ Slots Query:        GET /api/cal/slots?date=YYYY-MM-DD         │   │
│   │ Create Booking:     POST /api/cal/book                         │   │
│   │ Reschedule:         POST /api/cal/reschedule                   │   │
│   │ Cancel:             POST /api/cal/cancel                       │   │
│   │ Webhook Ingestion:  POST /api/cal/webhook                      │   │
│   └───────────────┬─────────────────────────────┬──────────────────┘   │
└───────────────────┼─────────────────────────────┼──────────────────────┘
                    │                             │
                    ▼                             ▼
┌───────────────────────────────┐   ┌────────────────────────────────────┐
│      Cal.com API v2 & Hooks   │   │       Supabase Database            │
│                               │   │                                    │
│ - Event Type: 7198199         │   │ ┌────────────────────────────────┐ │
│ - /v2/slots/available         │   │ │ Table: productionbookings      │ │
│ - /v2/bookings                │   │ ├────────────────────────────────┤ │
│ - /v2/bookings/{uid}/cancel   │   │ │ Table: bookings                │ │
│ - /v2/bookings/{uid}/resched  │   │ ├────────────────────────────────┤ │
│ - Webhook events dispatch     │   │ │ Table: leads                   │ │
│                               │   │ └────────────────────────────────┘ │
└───────────────────────────────┘   └────────────────────────────────────┘
```

### Data Model & State Strategy

- **Booking Payload & Schema**:
  ```typescript
  interface UnifiedBookingRecord {
    reference: string;           // Cal.com Booking UID
    name: string;
    email: string;
    phone?: string;
    address?: string;
    selected_date: string;       // YYYY-MM-DD
    selected_time: string;       // HH:MM AM/PM
    start_time_iso?: string;
    end_time_iso?: string;
    timezone: string;
    status: 'confirmed' | 'rescheduled' | 'cancelled';
    notes?: string;
    cal_booking_id?: number | string;
    created_at?: string;
  }
  ```

- **Webhook Event Handling**:
  - `BOOKING_CREATED`: Updates status to `confirmed` in both `productionbookings` and `bookings`.
  - `BOOKING_RESCHEDULED`: Updates start time, end time, and status to `rescheduled`.
  - `BOOKING_CANCELLED`: Updates status to `cancelled` and appends cancellation reason to notes.

### Interactive Component & State Mapping

1. `ConsultationOnboardingModal.tsx` & `BookingPage.tsx`:
   - Connected to shared `useCalcomSlots` hook.
   - Submits to `POST /api/cal/book`. Displays genuine Cal.com confirmation details.
2. `ManageBookingModal.tsx` / Booking Lookup:
   - Lets clients enter their booking reference or email.
   - Provides live reschedule picker and one-click cancel modal with reason field.
3. `AdminDashboard.tsx`:
   - Displays real-time status badges with interactive "Cancel Booking" and "Reschedule" dialogs.
