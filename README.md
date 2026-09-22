# Pulse Analytics

Pulse Analytics is a privacy-minded website analytics SaaS built with Next.js.
It will collect real page-view events, group anonymous activity into sessions,
and present useful traffic insights in an authenticated dashboard.

## Current status

The product rules, application foundation, PostgreSQL data model,
authentication, website management, direct event ingestion, and analytics
query layer are complete. The responsive dashboard renders real database
results across Overview, Pages, Visitors, Sources, and Settings. Overview
metrics and recent activity refresh every 30 seconds while the page is visible.

## Event ingestion

`POST /api/track` accepts validated `page_view` events from a website's exact
registered origin. It strips query strings, derives device and browser details
on the server, groups activity into 30-minute sessions, limits payload size,
and applies a database-backed per-website rate limit. Raw IP addresses are not
stored; the limiter uses a secret-keyed hash that cannot be reversed without
the server secret.

The complete visitor-data inventory, retention windows, deletion behavior,
and operator responsibilities are documented in
[`docs/privacy-and-retention.md`](docs/privacy-and-retention.md).

## Direct API integration

Send page views from browser code to the public ingestion endpoint:

```js
await fetch("https://your-analytics-domain.example/api/track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    trackingId: "site_your_tracking_id",
    event: "page_view",
    path: window.location.pathname,
    anonymousId: "a-persisted-random-browser-id",
  }),
});
```

The dashboard integration guide provides complete TypeScript and JavaScript
clients that create and persist the anonymous ID. Localhost requests are
accepted; register the exact local hostname and port, such as
`localhost:3001`, as its own website before testing.

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
does not delete unrelated user data. It runs only when
`ALLOW_DATABASE_SEED=true`; keep that flag disabled when the database contains
production traffic.

Production provisioning, migrations, health monitoring, retention scheduling,
and portfolio installation are covered in
[`docs/deployment.md`](docs/deployment.md). `GET /api/health` verifies both the
application and its database connection without exposing credentials.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Product definitions and wireframes are documented in
[`docs/mvp-and-analytics-rules.md`](docs/mvp-and-analytics-rules.md).
