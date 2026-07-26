# Migration Guide: Firebase → Supabase (Frontend on Vercel)

This document separates and consolidates the migration steps for moving from Firebase (Auth + Firestore + Functions) to Supabase and deploying the frontend on Vercel.

Overview
- Scope: migrate Auth, Firestore data, and Cloud Functions logic to Supabase and Vercel.
- Goal: minimal downtime, preserve user data, and secure access with Row-Level Security (RLS).

Prerequisites
- Supabase account and project created.
- Supabase CLI or access to Supabase dashboard.
- Supabase service role key (for server-side migration only).
- Local repo with the migration script: `scripts/migrate_firestore_to_supabase.js`.

High-level steps (separated)
1) Create Supabase project & tables
2) Configure Auth
3) Export Firestore data
4) Import data into Supabase (use migration script)
5) Update frontend code (auth + DB calls)
6) Port server/cloud functions to serverless or Supabase functions
7) Test locally
8) Configure Vercel and deploy

Detailed steps

1) Create Supabase project & tables
- Create tables with sensible column names and timestamps (e.g., `created_at`, `updated_at`).
- Minimal SQL example (run in Supabase SQL editor):

  CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    userId text,
    name text,
    email text,
    fitnessGoal text,
    activityLevel text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz
  );

  CREATE TABLE workouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    userId text,
    type text,
    duration numeric,
    caloriesBurned numeric,
    created_at timestamptz DEFAULT now()
  );

  -- Create `meals`, `plans`, `analytics`, `reports`, and `tests` similarly.

2) Configure Auth
- Enable Email/Password provider in Supabase Auth settings.
- Configure site URL / email templates and redirect URLs for production and preview.
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your environment variables.

3) Export Firestore data
- Export collections to JSON using Firestore export tools or a custom script.
- Place exports in `firestore-export/` folder and name them `users.json`, `workouts.json`, etc.

4) Import data into Supabase
- Use the migration script included: `scripts/migrate_firestore_to_supabase.js`.
- Export must be an array of documents per collection file.
- Set env vars for the script (service role key required):

  # Linux / macOS
  export SUPABASE_URL="https://xyz.supabase.co"
  export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"

  # Windows PowerShell
  $env:SUPABASE_URL = "https://xyz.supabase.co"
  $env:SUPABASE_SERVICE_ROLE_KEY = "<service-role-key>"

  node scripts/migrate_firestore_to_supabase.js

- Verify imported rows in Supabase table browser.

5) Update frontend code
- Replace Firebase initialization and API calls with Supabase client.
- Files updated in repo as an example:
  - `lib/supabase.ts` (new client)
  - `contexts/auth-context.tsx` (uses `supabase.auth`)
  - `lib/firestore.ts` (now uses Supabase `from(..)` calls)
  - `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `app/(auth)/reset-password/page.tsx` (auth flows)

6) Port Cloud Functions
Options:
- Vercel Serverless (Next.js API routes): implement the functions using Supabase admin (service role key) in `app/api` or `pages/api`.
- Supabase Edge Functions: write functions in JavaScript/TypeScript and deploy to Supabase functions.

Notes:
- Move analytic jobs (scheduled) to either Cron on a serverless platform or Supabase scheduled jobs.
- Replace Firestore `FieldValue.serverTimestamp()` with DB-managed `now()` when inserting server-side.

7) Test locally
- Add environment variables to local `.env.local` (do not commit secrets).
- Run:

  pnpm install
  pnpm dev

- Or with npm:

  npm install
  npm run dev

8) Deploy to Vercel
- Connect your repo in Vercel.
- Add environment variables in the Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Any server-side variables for API routes: `SUPABASE_SERVICE_ROLE_KEY` (only for server side)
- Deploy and verify authentication, DB reads/writes, and analytics functions.

Post-migration checks
- Verify user login flows across devices and email verification flows.
- Verify data integrity (counts, date fields) for key collections.
- Run permission tests: ensure RLS policies allow only intended access.

Rollback plan
- Keep a snapshot of Firestore exports until Supabase is fully validated.
- If issues encountered, redeploy frontend pointing back to Firebase (keep both sets of env vars for testing).

Support files in this repo
- `lib/supabase.ts` — Supabase client wrapper
- `lib/firestore.ts` — Replaced Firestore helpers (keeps same exported function names)
- `scripts/migrate_firestore_to_supabase.js` — Data import helper (requires `SUPABASE_SERVICE_ROLE_KEY`)

If you want, I can:
- Generate SQL migration files for each table.
- Convert `functions/src/index.ts` into Vercel API routes now.
- Walk through the Vercel environment variable setup and trigger the first CI deploy.

---
Document created: `docs/MIGRATION_SUPABASE.md`
