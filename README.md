# Deed — Campus Club Merch Marketplace

A production-ready, multi-tenant marketplace platform where campus clubs ("organizations") sell custom apparel to students. Built on **React + Vite** (frontend), **Express.js** (backend), **Supabase** (auth + database + storage), and **Stripe Connect** (payments).

---

## Live URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://deed-jet.vercel.app |
| Backend API (Render) | https://deed-api.onrender.com |
| Supabase Project | https://iyhkrcdcxsjltqkyohxe.supabase.co |

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Repository Structure](#repository-structure)
3. [User Roles](#user-roles)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Pages & Components](#frontend-pages--components)
7. [Environment Variables](#environment-variables)
8. [Local Development Setup](#local-development-setup)
9. [Database Migrations](#database-migrations)
10. [Deployment](#deployment)
11. [Stripe Setup](#stripe-setup)
12. [Supabase Storage Setup](#supabase-storage-setup)
13. [SendGrid Email Setup](#sendgrid-email-setup)
14. [Feature Reference](#feature-reference)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      React + Vite (Vercel)                   │
│  Public Pages │ Marketplace │ Login │ Admin Portal │ Vendor  │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST (JWT-authenticated)
┌──────────────────────────▼──────────────────────────────────┐
│                 Express.js Backend (Render)                   │
│  /checkout  /webhook  /admin/*  /discount  /vendor/send-email│
└──────────┬────────────────────────┬────────────────────────-─┘
           │                        │
    ┌──────▼──────┐         ┌───────▼──────┐
    │   Supabase   │         │    Stripe     │
    │  Auth + DB   │         │  Connect +    │
    │  + Storage   │         │  Checkout +   │
    │  + RLS       │         │  Webhooks     │
    └─────────────┘         └──────────────┘
```

**Key design decisions:**
- All sensitive operations (Stripe, refunds, user deletion) go through the Express backend — never directly from the browser
- Supabase Row Level Security (RLS) enforces data isolation at the database level
- Stripe Connect Standard accounts give each organization their own Stripe account with automatic fee splitting
- The frontend uses the Supabase anon key only; the service-role key lives exclusively on the server

---

## Repository Structure

```
apparel-site-main/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminClubsPanel.jsx      # Organization management
│   │   │   │   ├── AdminUsersPanel.jsx       # User/role management + delete
│   │   │   │   ├── AdminListingsPanel.jsx    # Listing review + edit modal
│   │   │   │   ├── AnalyticsPanel.jsx        # Revenue/KPI dashboard
│   │   │   │   ├── DiscountCodesPanel.jsx    # Discount code CRUD
│   │   │   │   └── StripeConnectCard.jsx     # Stripe Connect onboarding UI
│   │   │   ├── DiscountCodeInput.jsx         # Apply discount at checkout
│   │   │   ├── PhotoUpload.jsx               # Drag-and-drop image uploader
│   │   │   ├── MarketplaceSection.jsx        # Homepage marketplace preview
│   │   │   ├── Navbar.jsx                    # Global nav with Dashboard button
│   │   │   └── ...                           # Other shared components
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx               # Supabase auth state + signIn/signUp/signOut
│   │   ├── hooks/
│   │   │   └── useAuth.js                    # useContext(AuthContext) shorthand
│   │   ├── lib/
│   │   │   ├── supabase.js                   # Supabase client (anon key)
│   │   │   ├── api.js                        # Authenticated fetch helpers → Express
│   │   │   └── stripe.js                     # loadStripe() promise
│   │   └── pages/
│   │       ├── AdminDashboard.jsx            # /admin — full admin control panel
│   │       ├── ClubDashboard.jsx             # /club — vendor portal
│   │       ├── Login.jsx                     # /login — sign in + sign up
│   │       ├── Listings.jsx                  # /listings — public marketplace
│   │       ├── ListingDetail.jsx             # /listings/:id — buy page
│   │       ├── Home.jsx                      # / — marketing homepage
│   │       ├── DesignStudio.jsx              # /design-studio — 3D customizer
│   │       └── ...                           # Other public pages
│   ├── .env                                  # Local env vars (gitignored)
│   └── package.json
│
├── server/                        # Express.js backend
│   ├── jobs/
│   │   └── autoClose.js                      # node-cron: close expired listings
│   ├── lib/
│   │   ├── supabase.js                        # Service-role Supabase client
│   │   └── stripeClient.js                    # Stripe singleton
│   ├── middleware/
│   │   ├── requireAuth.js                     # Verify Supabase JWT → req.user
│   │   └── requireAdmin.js                    # Assert req.user.role === 'admin'
│   ├── routes/
│   │   ├── checkout.js                        # POST /checkout
│   │   ├── webhook.js                         # POST /webhook (Stripe events)
│   │   ├── refund.js                          # POST /admin/refund
│   │   ├── analytics.js                       # GET /admin/analytics
│   │   ├── connect.js                         # POST/GET /admin/connect/*
│   │   ├── deleteUser.js                      # DELETE /admin/delete-user
│   │   ├── discountCodes.js                   # /discount/* + /admin/discount-codes/*
│   │   └── sendEmail.js                       # POST /vendor/send-email
│   ├── index.js                               # App entry, CORS, route mounting
│   ├── .env                                   # Local env vars (gitignored)
│   └── package.json
│
└── supabase/
    └── migrations/
        ├── 001_schema.sql                     # Tables: clubs, users, listings, orders
        ├── 002_rls.sql                        # Row Level Security policies
        ├── 003_user_trigger.sql               # Auto-create public.users on signup
        ├── 004_add_email_to_users.sql         # Add email column to public.users
        ├── 005_photos.sql                     # Add image_urls to listings
        └── 006_discount_codes.sql             # discount_codes table + orders columns
```

---

## User Roles

| Role | DB Value | Access |
|------|----------|--------|
| **Admin** | `admin` | Full access — approve listings, manage users/orgs, view analytics, manage discount codes, trigger refunds, set up Stripe Connect |
| **Vendor** | `club_exec` | Vendor Portal (`/club`) — create listings, view own sales, email buyers |
| **User** | `student` | Browse approved listings, purchase via Stripe |
| **Anon** | — | Read-only: approved listings, organization names |

> **Important:** Vendors must be approved by an admin (`is_exec_approved = true`) before the Vendor Portal activates for them. The admin can approve via the Users tab.

---

## Database Schema

### `clubs` (Organizations)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `name` | text | Organization display name |
| `stripe_account_id` | text | Stripe Connect account ID |
| `created_at` | timestamptz | |

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | References `auth.users.id` |
| `email` | text | Synced from auth on signup |
| `role` | enum | `admin`, `club_exec`, `student` |
| `club_id` | uuid | References `clubs.id` (nullable) |
| `is_exec_approved` | boolean | Must be true for vendor access |

### `listings`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `club_id` | uuid | FK → clubs |
| `title` | text | |
| `description` | text | |
| `product_type` | text | T-Shirt, Hoodie, Hat, etc. |
| `price` | numeric | CAD per unit |
| `quantity_available` | integer | Decremented on purchase |
| `cost_per_unit` | numeric | Used for profit calculation |
| `platform_fee_percent` | numeric | Set by admin; locked after approval |
| `order_deadline` | timestamptz | Auto-close after this time |
| `pickup_location` | text | |
| `pickup_instructions` | text | |
| `pickup_date` | date | |
| `image_urls` | text[] | Public Supabase Storage URLs |
| `status` | enum | `pending`, `approved`, `closed` |
| `auto_closed` | boolean | Set by cron job |
| `created_at` | timestamptz | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `listing_id` | uuid | FK → listings |
| `buyer_name` | text | |
| `buyer_email` | text | |
| `student_id` | text | Optional |
| `size` | text | Optional |
| `quantity` | integer | |
| `total_paid` | numeric | After discount |
| `stripe_payment_intent` | text | Used for idempotency + refunds |
| `stripe_invoice_id` | text | |
| `refund_status` | enum | `none`, `partial`, `full` |
| `refund_amount` | numeric | |
| `refunded_at` | timestamptz | |
| `discount_code` | text | Applied code (if any) |
| `discount_amount` | numeric | Discount value in CAD |
| `created_at` | timestamptz | |

### `discount_codes`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `code` | text UNIQUE | Uppercase, e.g. `SAVE10` |
| `type` | text | `percent` or `fixed` |
| `value` | numeric | e.g. `10` for 10% or $10 |
| `max_uses` | integer | null = unlimited |
| `uses_count` | integer | |
| `expires_at` | timestamptz | null = never |
| `listing_id` | uuid | null = all listings |
| `created_at` | timestamptz | |

---

## API Endpoints

All authenticated endpoints expect `Authorization: Bearer <supabase_jwt>`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Health check |
| POST | `/checkout` | None (validated) | Create Stripe Checkout session |
| POST | `/webhook` | Stripe sig | Handle `checkout.session.completed`, `charge.refunded` |
| POST | `/admin/refund` | Admin | Trigger Stripe refund for an order |
| GET | `/admin/analytics` | Admin | Revenue/profit stats per club + global |
| POST | `/admin/connect/create` | Admin | Create Stripe Connect account for a club |
| GET | `/admin/connect/onboard-link/:clubId` | Admin | Get Stripe onboarding URL |
| DELETE | `/admin/delete-user` | Admin | Delete user from Supabase Auth |
| GET | `/admin/discount-codes` | Admin | List all discount codes |
| POST | `/admin/discount-codes` | Admin | Create a discount code |
| DELETE | `/admin/discount-codes/:id` | Admin | Delete a discount code |
| POST | `/discount/validate` | None | Validate a discount code for a listing |
| POST | `/vendor/send-email` | Vendor/Admin | Send bulk email to all buyers of a listing |

---

## Frontend Pages & Components

### Public Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | `Home.jsx` | Marketing landing page with marketplace preview |
| `/listings` | `Listings.jsx` | Browse approved listings; vendors can post from here |
| `/listings/:id` | `ListingDetail.jsx` | Listing details, photo gallery, order form with discount |
| `/login` | `Login.jsx` | Sign in / Create Account (User or Vendor) |
| `/design-studio` | `DesignStudio.jsx` | 3D apparel customizer |
| `/products` | `Products.jsx` | Product catalog |
| `/our-process` | `OurProcess.jsx` | How it works |
| `/our-team` | `OurTeam.jsx` | Team page |
| `/contact` | `Contact.jsx` | Contact form |

### Protected Pages
| Route | Role Required | Page | Description |
|-------|--------------|------|-------------|
| `/admin` | Admin | `AdminDashboard.jsx` | Full control panel |
| `/club` | Vendor (approved) | `ClubDashboard.jsx` | Vendor portal |

### Admin Dashboard Tabs
- **Review Listings** — Approve/reject/edit pending listings
- **Organizations** — Create and manage clubs + Stripe Connect onboarding
- **Users** — Manage roles, assign organizations, approve vendors, delete users
- **Orders** — View all orders with search/filter and refund buttons
- **Analytics** — Global KPIs and per-club revenue breakdown
- **Discount Codes** — Create and delete promo codes

### Vendor Dashboard Tabs
- **My Listings** — View status, create new listings with photos
- **Sales** — Orders table with revenue KPIs
- **Email Buyers** — Send bulk email to purchasers of a specific listing

---

## Environment Variables

### `client/.env`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=https://your-api.onrender.com
```

### `server/.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=https://your-frontend.vercel.app
PORT=4242

# Required for Email Buyers and Design Studio mockup requests
SENDGRID_API_KEY=SG.xxx
# Must be a verified SendGrid sender
SENDGRID_FROM_EMAIL=verified-sender@yourdomain.com
# Optional — defaults to info@deedleisure.ca
DESIGN_REQUEST_RECIPIENT=info@deedleisure.ca
```

> `.env` files are gitignored. Never commit secrets.

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- A Supabase project with migrations applied
- A Stripe account (test mode)

### 1. Clone and install

```bash
git clone https://github.com/humzam241241/deed.git
cd deed

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Configure environment variables

Copy and fill in both env files:
```bash
# client/.env
cp client/.env.example client/.env

# server/.env
cp server/.env.example server/.env
```

### 3. Apply database migrations

In your Supabase project, open the **SQL Editor** and run each file in order:

```
supabase/migrations/001_schema.sql
supabase/migrations/002_rls.sql
supabase/migrations/003_user_trigger.sql
supabase/migrations/004_add_email_to_users.sql
supabase/migrations/005_photos.sql
supabase/migrations/006_discount_codes.sql
```

### 4. Create your admin user

In Supabase SQL Editor:
```sql
-- After signing up via the UI, promote yourself to admin:
UPDATE public.users
SET role = 'admin', is_exec_approved = true
WHERE email = 'your@email.com';
```

### 5. Run locally

```bash
# Terminal 1 — Backend (port 4242)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4242

---

## Database Migrations

Migrations are plain SQL files in `supabase/migrations/`. Run them manually via the Supabase SQL Editor or Supabase CLI in order:

| File | Purpose |
|------|---------|
| `001_schema.sql` | Core tables: `clubs`, `users`, `listings`, `orders` |
| `002_rls.sql` | Row Level Security policies for all tables |
| `003_user_trigger.sql` | PostgreSQL trigger to auto-create `public.users` on signup |
| `004_add_email_to_users.sql` | Adds `email` column; backfills from `auth.users` |
| `005_photos.sql` | Adds `image_urls text[]` to `listings` |
| `006_discount_codes.sql` | Creates `discount_codes` table; adds discount columns to `orders` |

---

## Deployment

### Frontend — Vercel

1. Connect the GitHub repo to Vercel
2. Set **Root Directory** to `client`
3. Set **Framework Preset** to Vite
4. Add all `VITE_*` environment variables in Vercel project settings
5. The `vercel.json` at the root handles SPA routing (all routes → `index.html`)

### Backend — Render

1. Create a new **Web Service** on Render
2. Set **Root Directory** to `server`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node index.js`
5. Add all server environment variables in Render's Environment tab
6. After deploying, update `CLIENT_URL` to match your Vercel production URL
7. Add the Render service URL as `VITE_API_URL` in Vercel

---

## Stripe Setup

### Test Mode Keys
- Get publishable and secret keys from your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- Add them to `client/.env` and `server/.env` respectively

### Webhook Configuration
1. In Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-api.onrender.com/webhook`
3. Select events: `checkout.session.completed`, `charge.refunded`
4. Copy the signing secret → `STRIPE_WEBHOOK_SECRET` in `server/.env`

### Stripe Connect (for organizations)
1. Each organization needs a Stripe Connect Standard account
2. In the Admin Portal → Organizations tab → click "Set Up Stripe" next to a club
3. Admin follows the onboarding link to connect the club's Stripe account
4. Listings for that club can only be approved after the account is fully enabled (`charges_enabled` + `payouts_enabled`)

**Platform fee:** Set per listing before approval (`platform_fee_percent` field). Locked once a listing is approved. The fee is automatically deducted from each payment via Stripe's `application_fee_amount`.

---

## Supabase Storage Setup

Photo uploads require a public storage bucket:

1. In Supabase Dashboard → Storage → New Bucket
2. **Name:** `listing-images`
3. **Public:** ✅ Enable public access
4. No additional policies needed — the bucket is public read, and authenticated users can upload

---

## SendGrid Email Setup

The "Email Buyers" feature and Design Studio mockup requests use SendGrid:

1. Create a [SendGrid](https://sendgrid.com) account
2. Create an API key with **Mail Send** permissions
3. Verify a sender email address or domain
4. Add to `server/.env` (and Render environment variables):
   ```env
   SENDGRID_API_KEY=SG.xxx
   SENDGRID_FROM_EMAIL=verified-sender@yourdomain.com
   DESIGN_REQUEST_RECIPIENT=info@deedleisure.ca
   ```
5. Add the same variables in Render's Environment tab and redeploy the server.
6. Install the package on the server: `npm install @sendgrid/mail`

Without these variables, the endpoint returns a `503` with a clear error message — the rest of the app continues to work normally.

## Supabase Email Verification Setup

The account screen uses a six-digit email code after sign-up. In Supabase Dashboard, enable **Confirm email** under Authentication settings. Then edit **Auth → Email Templates → Confirm signup** to include `{{ .Token }}` in the email body, for example: `Your Deed Leisure verification code is {{ .Token }}`. The client verifies that code with Supabase Auth; no mail secret belongs in `client/.env`.

---

## Feature Reference

### Checkout Flow
1. User fills out the order form on `/listings/:id`
2. Optional discount code is validated against the server
3. Frontend calls `POST /checkout` with listing ID, buyer info, quantity, and discount code
4. Server validates: listing approved, deadline not passed, quantity available
5. Server creates a Stripe Checkout session with `application_fee_amount` and `transfer_data.destination`
6. User is redirected to Stripe's hosted checkout page
7. On payment, Stripe fires `checkout.session.completed` webhook
8. Webhook inserts the order and decrements listing quantity

### Auto-Close Logic
A `node-cron` job runs every 5 minutes on the Express server. It closes any listing where `status = 'approved'` and `order_deadline < now()`, setting `auto_closed = true`. Auto-closed listings cannot be reopened via the cron — only manually by an admin.

### Idempotent Webhooks
Before inserting an order, the webhook handler checks for an existing order with the same `stripe_payment_intent`. If found, it skips the insert. This prevents duplicate orders if Stripe retries the webhook.

### Row Level Security Summary
- **Admin:** Bypass all — full read/write via `current_user_role() = 'admin'`
- **Vendor (club_exec):** Insert/read `listings` where `club_id` matches their own; read `orders` for their club's listings
- **User (student):** Read `listings` where `status = 'approved'` only
- **Anonymous:** Read `clubs` names only (for the signup dropdown)
- **Orders:** Insert/update only via service-role key (server-side webhooks) — no JWT-based writes allowed

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Tailwind CSS |
| 3D Customizer | Three.js, @react-three/fiber, @react-three/drei |
| Backend | Express.js, Node.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage |
| Payments | Stripe Connect (Standard accounts) |
| Email | SendGrid |
| Scheduling | node-cron |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |
