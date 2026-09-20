# Production deployment runbook

Phase 11 is complete only after every item below is performed against real
production services and a real tracked website. Do not reuse development
credentials in production.

## 1. Provision isolated services

1. Keep the current Supabase project for development.
2. Create a separate Supabase project for production in the nearest suitable
   region.
3. Enable the production project's automated backups. Record the backup
   retention window and perform a restore drill before launch.
4. Create a Vercel project from this repository and deploy the `develop` branch
   to Preview before promoting the approved production branch.

## 2. Configure production environment

Set these encrypted variables in Vercel Production settings:

| Variable       | Production value                                               |
| -------------- | -------------------------------------------------------------- |
| `APP_URL`      | Canonical HTTPS URL of the Pulse deployment                    |
| `AUTH_SECRET`  | A new random value of at least 32 characters                   |
| `DATABASE_URL` | Production Supabase transaction-pooler URL, normally port 6543 |
| `DIRECT_URL`   | Production direct or session-pooler URL, normally port 5432    |

Set separate Preview values that point only to the development database. Never
copy values into source control or expose them through a `NEXT_PUBLIC_` name.

## 3. Migrate and verify

From a trusted environment containing the production variables:

```bash
npm ci
npm run db:deploy
npm run build
```

Do not run the development seed against production. Confirm that the
`GET /api/health` request returns HTTP 200 with
`{"status":"ok","database":"reachable"}`.
Configure an uptime monitor to alert on a non-200 response without attaching
credentials or request bodies to alerts.

## 4. Schedule retention

The retention command is dry-run by default:

```bash
npm run db:retention
npm run db:retention -- --execute
```

Review the dry-run counts, then schedule the execute form once per day in a
trusted job runner with production `DATABASE_URL`. It removes analytics older
than 90 days, rate-limit windows older than 24 hours, and orphaned anonymous
visitors. Alert when the command exits non-zero.

## 5. Connect the portfolio

1. Sign in to the deployed dashboard and register the portfolio's exact host,
   including a non-default port only if one is used.
2. Copy the generated tracking snippet from Settings into the portfolio before
   `</body>` and deploy the portfolio.
3. Visit several portfolio routes, including a client-side navigation.
4. Confirm the track requests return 202, the registered origin is echoed in
   CORS, and no query strings or full IP addresses are stored.
5. Confirm the new page views and recent activity appear within 30 seconds.

The ingestion route derives its allowed origin from the registered website, so
no static CORS allowlist variable is needed. A domain change must be made in
website Settings before events from the new origin will be accepted.

## 6. Release evidence

Record the production and portfolio URLs, deployed Git commit, migration
result, health-check result, backup policy, retention schedule, monitoring
destination, and a redacted screenshot of real analytics. Never include
credentials, connection strings, raw request addresses, or authentication
cookies in the evidence.
