# Pulse Analytics

Pulse Analytics is a privacy-minded website analytics SaaS built with Next.js.
It will collect real page-view events, group anonymous activity into sessions,
and present useful traffic insights in an authenticated dashboard.

## Current status

The product rules, application foundation, PostgreSQL data model,
authentication, website management, and event ingestion are complete.
Analytics views remain intentional placeholders while reporting is
implemented.

## Event ingestion

`POST /api/track` accepts validated `page_view` events from a website's exact
registered origin. It strips query strings, derives device and browser details
on the server, groups activity into 30-minute sessions, limits payload size,
and applies a database-backed per-website rate limit. Raw IP addresses are not
stored; the limiter uses a secret-keyed hash that cannot be reversed without
the server secret.

## Local setup

Requirements:

- Node.js 20.9 or newer
- npm

Copy `.env.example` to `.env.local`, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Do not commit `.env.local`
or any production credentials.

## Database

The application uses Prisma with PostgreSQL. For a serverless provider such as
Supabase, configure a transaction-pooler URL as `DATABASE_URL` and a direct or
session-pooler URL as `DIRECT_URL`.

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
```

`db:deploy` applies committed migrations. The development seed is repeatable:
it replaces only the website with tracking ID `site_demo_pulse_analytics` and
does not delete unrelated user data.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Product definitions and wireframes are documented in
[`docs/mvp-and-analytics-rules.md`](docs/mvp-and-analytics-rules.md).
