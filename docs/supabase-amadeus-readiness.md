# Supabase + Amadeus Readiness

Use this checklist before testing saved plans, login, quote requests, testimonials, affiliate click tracking, or live travel search.

## Supabase

Create a Supabase project, then run:

```text
supabase/migrations/20260602000000_production_readiness.sql
```

Add these values to `.env.local` and to Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

In Supabase Auth settings, add these redirect URLs:

```text
http://localhost:3000/auth/callback
http://localhost:3021/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
https://your-custom-domain.com/auth/callback
```

## Amadeus

Keep local and Vercel Amadeus config on test mode until production access is approved:

```bash
AMADEUS_CLIENT_ID=your_key
AMADEUS_CLIENT_SECRET=your_secret
AMADEUS_ENV=test
AMADEUS_BASE_URL=
```

Do not use `AMADEUS_ENV=production` until Amadeus gives you production credentials and production access.

## Local Checks

Run:

```bash
pnpm check:readiness
```

This verifies:

- Node 22 is active.
- Amadeus token + Bangkok airport lookup work.
- Supabase env vars are present.
- Required Supabase tables exist when the service role key is configured.

## Product Smoke Test

After setup:

```bash
pnpm preview
```

Then test:

- Sign up and log in.
- Start a care plan.
- Search “New York” to “Bangkok” in Browse Travel.
- Select a flight, hotel, and clinic estimate.
- Reload and confirm the saved plan appears under My Plans.
- Submit a quote request and testimonial.
- Click a final itinerary booking link and confirm an `affiliate_clicks` row exists.
