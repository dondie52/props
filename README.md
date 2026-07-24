# PropManage BW

Property management SaaS for Botswana landlords.

**Stack:** Next.js 14 (App Router) · Tailwind CSS · Supabase · Inter  
**Live:** [props-blue-phi.vercel.app](https://props-blue-phi.vercel.app)

## Getting started

```bash
npm ci
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (publishable) key |
| `NEXT_PUBLIC_DEMO_VIDEO_URL` | Optional external demo video link on the marketing home page |

## Deploy

This app needs a Node server (middleware, server actions, API routes). Deploy on **Vercel** (or similar), not GitHub Pages static hosting. Set the env vars above in the host dashboard.

## Project layout

```
src/app/           # App Router pages (landing, auth, dashboard, tenant, admin)
src/components/    # UI and layout
src/lib/           # Supabase clients, dashboard data, reports
supabase/          # Migrations and seed
```
