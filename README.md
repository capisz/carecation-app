# Carecation App

Carecation is a Next.js App Router application for planning medical travel.  
It combines flights, hotels, and clinic estimates into one itinerary so users can compare total trip cost vs. U.S. healthcare benchmarks.

## What this app does

- Guided care planning flow (`/intake`) for procedure, destination preferences, month, and budget.
- Account login/signup with Supabase Auth.
- Saved Carecation plans that can be revisited and edited across devices.
- Flight search (`/travel`) powered by Amadeus, with airport suggestions from city keywords.
- Hotel search (`/travel/hotels`) powered by Amadeus with fallback hotel options if live search is unavailable.
- Clinic browsing (`/results` and `/clinics`) with details and quote-to-itinerary actions.
- Itinerary builder (`/itinerary`) that combines:
  - Flight cost
  - Hotel cost
  - Healthcare estimate
  - Savings comparison vs. U.S. estimate
- Currency normalization to USD across travel and itinerary totals.
- Testimonials page (`/testimonials`) for user reviews and ratings.
- Provider application flow (`/providers`) for clinics/hospitals.
- Cookie consent, privacy, terms, support, and medical disclaimer pages.
- Affiliate handoff tracking for travel booking partner links.

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS + Radix UI components

## Getting started

### 1. Prerequisites

- Node.js 22 LTS. This repo includes `.nvmrc` and `.node-version` with `22`.
- pnpm. This project is pnpm-only; do not use npm or commit `package-lock.json`.

If you use `fnm`:

```bash
fnm install 22
fnm use 22
corepack enable
```

If localhost feels slow or opens the wrong app, check for old dev servers first:

```bash
lsof -nP -iTCP:3000-3010 -sTCP:LISTEN
kill <PID>
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create `.env.local` (or copy from `.env.example`):

```bash
cp .env.example .env.local
```

Required values:

```bash
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
AMADEUS_ENV=test
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

These are read server-side only in `lib/amadeus.ts`.
Supabase publishable keys are used by the browser auth client; the secret/service role key must stay server-side only.
Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` names are also supported.

### 4. Set up Supabase

Run all SQL files in order:

```bash
supabase/migrations/20260602000000_production_readiness.sql
supabase/migrations/20260602010000_harden_public_write_policies.sql
```

This creates profiles, saved plans, plan items, quote requests, provider applications, testimonials, affiliate clicks, audit events, and provider directory tables with row-level security.

To verify Supabase and Amadeus setup:

```bash
pnpm check:readiness
```

See `docs/supabase-amadeus-readiness.md` for the full setup checklist.

### 5. Run locally

```bash
pnpm dev
```

`pnpm dev` uses Webpack dev mode for local stability. If you specifically want Turbopack, run:

```bash
pnpm dev:turbo
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Production build

```bash
pnpm build
pnpm start
```

For a production preview on a less commonly used local port:

```bash
pnpm preview
```

Open [http://localhost:3021](http://localhost:3021).

## How to use (product flow)

1. Start at `/` and click **Begin your care plan**.
2. Complete `/intake`:
   - Procedure
   - Preferred destinations (multi-select)
   - Travel month
   - Budget
3. Continue to `/travel`:
   - Search flights by city name
   - Pick airports from dropdown suggestions
   - Select a flight and continue
4. Continue to `/travel/hotels`:
   - Select a hotel
   - Continue to clinic selection
5. Go to `/results` (Browse Care):
   - Open clinic details
   - Book quote to add healthcare estimate
6. Open `/itinerary`:
   - Review total estimated cost
   - Review savings comparison
   - Use partner booking links for travel booking

## API routes

- `POST /api/flights/search`
  - Input: `{ origin, destination, departDate, returnDate?, adults }`
- `POST /api/hotels/search`
  - Input: `{ cityCode, checkInDate, checkOutDate, adults }`
- `POST /api/locations/search`
  - Input: `{ keyword }`
- `POST /api/currency/convert`
  - Input: `{ amount, currency }`
- `POST /api/providers/submit`
  - Input: provider application payload
- `GET /api/plans`
  - Lists signed-in user's saved plans
- `POST /api/plans`
  - Saves a new plan from an itinerary snapshot
- `GET/PATCH/DELETE /api/plans/:id`
  - Reads, updates, or deletes one signed-in user's plan
- `GET/PUT /api/plans/active`
  - Loads or syncs the active saved plan
- `POST /api/affiliate/click`
  - Records outbound booking partner clicks
- `POST /api/quote-requests`
  - Stores clinic quote requests
- `GET/POST /api/testimonials`
  - Loads and submits testimonials

## Key project paths

- `app/travel/page.tsx` - flights UI and selection flow
- `app/travel/hotels/page.tsx` - hotels UI and selection flow
- `components/browse-care-content.tsx` - clinic browsing and quote selection
- `app/itinerary/page.tsx` - itinerary, totals, savings, booking links
- `lib/amadeus.ts` - Amadeus token + API service layer
- `lib/currency.ts` - currency conversion to USD
- `lib/itinerary-plan.ts` - local itinerary state persistence
- `lib/supabase/*` - Supabase client/server/admin helpers
- `supabase/migrations/*` - production database schema and RLS policies

## Deployment notes (Vercel)

- Add `AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`, `AMADEUS_ENV`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` in Vercel project environment variables. Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are also supported.
- Use `AMADEUS_ENV=production` only after receiving Amadeus production API access.
- Redeploy after env updates.
- This repo uses `pnpm` lockfile; Vercel will install and build with pnpm.
