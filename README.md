# Pulse Analytics

Pulse Analytics is a privacy-minded website analytics SaaS built with Next.js, Auth.js, Prisma, and PostgreSQL. It collects first-party page-view events from registered websites, groups anonymous activity into sessions, and presents traffic insights through an authenticated analytics dashboard.

## Overview

Pulse Analytics is designed for website owners and developers who want lightweight, self-hostable traffic analytics without storing raw visitor IP addresses.

The primary workflow is:

```text
Tracked Website
      |
      | browser page-view event
      v
POST /api/track
      |
      +--> validate tracking ID
      +--> verify exact registered origin
      +--> sanitize event data
      +--> apply rate limit
      +--> resolve visitor/session
      v
PostgreSQL
      |
      +--> Overview
      +--> Pages
      +--> Visitors
      +--> Sources
```

Users create an account, register a website, install the generated tracking snippet, and then view analytics for incoming traffic.

## Features

- Email/password registration and authentication
- Auth.js credential-based sessions using JWT strategy
- Password hashing with bcryptjs
- Multi-website management
- Unique tracking IDs for registered websites
- Browser page-view ingestion through `POST /api/track`
- Exact-origin validation against the registered website domain
- Payload size and content-type validation
- Server-side path, title, and referrer sanitization
- Anonymous visitor tracking
- 30-minute session grouping
- Device and browser classification
- Country detection from trusted Vercel request metadata when available
- PostgreSQL-backed ingestion rate limiting
- Overview analytics with selectable `24h`, `7d`, and `30d` ranges
- Pages, Visitors, Sources, and Settings dashboard views
- Recharts visualizations
- Tracking integration documentation and connection verification UI
- Database health endpoint
- Data-retention maintenance script

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Authentication | Auth.js / NextAuth v5 |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| PostgreSQL adapter | `@prisma/adapter-pg`, `pg` |
| Validation | Zod |
| Charts | Recharts |
| Password hashing | bcryptjs |
| Icons | Iconify |
| Formatting | Prettier |
| Deployment guidance | Vercel + PostgreSQL/Supabase |

## Architecture

```text
Authenticated User
      |
      +--> Next.js App Router dashboard
      |       |
      |       +--> Auth.js session
      |       +--> Prisma queries
      |       +--> PostgreSQL
      |
Tracked Website Browser
      |
      | POST /api/track
      v
Tracking API
      |
      +--> tracking ID lookup
      +--> origin check
      +--> sanitization
      +--> per-website rate limit
      +--> anonymous visitor upsert
      +--> session resolution
      +--> page-view insert
      |
      v
PostgreSQL
```

Analytics dashboard queries are scoped to the authenticated user and selected website. The tracking route only accepts events whose request origin matches the website registered for the supplied tracking ID.

## Project Structure

```text
pulse-analytics/
├── app/
│   ├── (auth)/                  # Login and registration
│   ├── (dashboard)/
│   │   ├── overview/
│   │   ├── pages/
│   │   ├── visitors/
│   │   ├── sources/
│   │   ├── websites/
│   │   ├── settings/
│   │   └── docs/
│   └── api/
│       ├── analytics/overview/  # Authenticated overview refresh API
│       ├── auth/                # Auth.js route handler
│       ├── health/              # Database/application health check
│       └── track/               # Public analytics ingestion endpoint
├── components/
│   ├── auth/
│   ├── charts/
│   ├── dashboard/
│   └── docs/
├── lib/
│   ├── analytics/               # Dashboard analytics queries
│   ├── auth/                    # Auth helpers
│   ├── db/                      # Prisma client
│   ├── tracking/                # Tracking, sanitization, rate limiting
│   └── validation/              # Zod schemas
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── scripts/
│   └── apply-retention.ts
├── docs/
│   ├── deployment.md
│   └── mvp-and-analytics-rules.md
├── auth.ts
├── .env.example
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20.9 or later
- npm
- A PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/Temiawaye/pulse-analytics.git
cd pulse-analytics
```

The repository currently uses `develop` as its default branch.

### 2. Install dependencies

```bash
npm install
```

Prisma Client generation also runs automatically through the `postinstall` script.

### 3. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Configure:

```env
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@POOLER_HOST:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://USER:PASSWORD@DIRECT_HOST:5432/postgres
AUTH_SECRET=replace-with-a-random-secret
ALLOW_DATABASE_SEED=false
```

Generate a strong Auth.js secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 4. Prepare the database

For local development migrations:

```bash
npm run db:migrate
```

For an environment where committed migrations should be applied without creating new migration files:

```bash
npm run db:deploy
```

### 5. Optional: seed development data

Seeding is guarded by `ALLOW_DATABASE_SEED`.

```env
ALLOW_DATABASE_SEED=true
```

Then run:

```bash
npm run db:seed
```

Keep this disabled for production traffic.

### 6. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `APP_URL` | Base application URL used for generated installation links and canonical URLs |
| `DATABASE_URL` | Runtime PostgreSQL connection string; suitable for a pooled/serverless connection |
| `DIRECT_URL` | Direct or session-mode PostgreSQL URL used by Prisma CLI migration workflows |
| `AUTH_SECRET` | Secret used by Auth.js; required in production |
| `ALLOW_DATABASE_SEED` | Explicit opt-in safeguard for the development seed |

Do not commit `.env.local` or production credentials.

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm run format` | Format the repository with Prettier |
| `npm run format:check` | Check formatting without modifying files |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run `prisma migrate dev` |
| `npm run db:deploy` | Apply committed migrations |
| `npm run db:seed` | Run the configured Prisma seed |
| `npm run db:retention` | Run the analytics retention maintenance script |

## Usage

1. Register an account.
2. Sign in.
3. Add a website and its exact domain/host.
4. Copy the generated tracking snippet from the dashboard.
5. Add the snippet to the website being monitored.
6. Visit the tracked site to generate page views.
7. Use Overview, Pages, Visitors, and Sources to inspect traffic.
8. Use Settings and the documentation area to manage the integration.

When testing locally, register the exact local hostname and port used by the tracked website.

## API / Integration

### `POST /api/track`

Receives browser page-view events.

The request must originate from the exact website domain registered for the supplied tracking ID.

The route:

- accepts `application/json` or `text/plain`
- rejects payloads larger than 8 KB
- validates the event payload
- strips/sanitizes tracked URL information
- derives browser/device information on the server
- groups activity into 30-minute sessions
- applies a per-website rate limit
- persists the visitor, session, and page-view data in PostgreSQL

A successful event returns:

```http
HTTP/1.1 202 Accepted
```

The endpoint intentionally returns a small empty response body.

### `GET /api/analytics/overview`

Returns authenticated overview data for a website.

Query parameters:

| Parameter | Values |
| --- | --- |
| `website` | Website ID owned by the signed-in user |
| `range` | `24h`, `7d`, or `30d` |

Example:

```text
/api/analytics/overview?website=website_id&range=7d
```

The response includes summary metrics, recent activity, and a refresh timestamp.

### `GET /api/health`

Checks that the application can reach PostgreSQL.

Successful response:

```json
{
  "status": "ok",
  "database": "reachable"
}
```

A database failure returns HTTP `503`.

## Privacy and Data Handling

The tracking implementation is intentionally limited to analytics data needed by the dashboard.

- Raw visitor IP addresses are not stored as analytics records.
- Rate limiting uses a keyed identity hash instead of persisting a raw address.
- Query strings are removed from tracked paths.
- Referrer and page-title values are sanitized.
- Website origin checks restrict a tracking ID to its registered domain.
- Old analytics and rate-limit data can be cleaned with the retention script.

See `docs/mvp-and-analytics-rules.md` for the repository's detailed product and analytics rules.

## Deployment

Deployment guidance in the repository targets Vercel with PostgreSQL, including Supabase-hosted PostgreSQL.

For production:

1. Configure `APP_URL`, `AUTH_SECRET`, `DATABASE_URL`, and `DIRECT_URL`.
2. Keep `ALLOW_DATABASE_SEED` unset or `false`.
3. Install dependencies with `npm ci`.
4. Apply committed migrations with `npm run db:deploy`.
5. Verify the application with `npm run build`.
6. Confirm `GET /api/health` returns HTTP 200.
7. Schedule the retention script in a trusted job runner if retention automation is required.

The repository's deployment runbook is available in `docs/deployment.md`.

## Screenshots

> Screenshots can be added here to showcase the Overview, Pages, Visitors, Sources, Websites, and integration documentation views.

## Contributing

1. Create a feature branch from the appropriate base branch.
2. Make a focused change.
3. Run formatting, linting, type checking, and build checks as appropriate.
4. Commit using a descriptive message.
5. Push the branch.
6. Open a pull request.

## License

No project license file is currently present in the repository.

## Author

Maintained by [Temiawaye](https://github.com/Temiawaye).
