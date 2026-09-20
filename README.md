# Pulse Analytics

Pulse Analytics is a privacy-minded website analytics SaaS built with Next.js.
It will collect real page-view events, group anonymous activity into sessions,
and present useful traffic insights in an authenticated dashboard.

## Current status

The product rules and application foundation are complete. The dashboard routes
currently show intentional placeholders while the database, authentication,
ingestion, and reporting phases are implemented.

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

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Product definitions and wireframes are documented in
[`docs/mvp-and-analytics-rules.md`](docs/mvp-and-analytics-rules.md).
