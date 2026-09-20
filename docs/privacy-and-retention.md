# Privacy, security, and retention

Pulse Analytics is designed to answer basic traffic questions without building
profiles of identifiable people. This policy applies to visitor analytics; an
account owner's name and email are collected separately for authentication.

## Visitor data collected

For each accepted page view, Pulse stores:

- a random, website-scoped anonymous visitor ID generated in the visitor's
  browser;
- the page path and title, with control characters removed and length limits;
- the referrer's scheme, host, and path;
- server-derived browser and device categories;
- an optional two-letter country code supplied by the trusted hosting platform;
- UTC timestamps and the associated website, visitor, and session IDs.

The anonymous ID is stored in the tracked website's first-party local storage.
It is not an account identifier and is not shared between websites. Removing
that local-storage value causes a new anonymous visitor record to be created.

## Data deliberately excluded

The tracker does not send or store visitor names, email addresses, full IP
addresses, URL query strings, URL fragments, form values, keystrokes, or page
content. Device, browser, and country values from the event body are ignored.
Paths and referrers are normalized before storage so query parameters cannot
carry tokens or other sensitive values into analytics.

The ingestion rate limiter temporarily derives an HMAC-SHA-256 digest from the
request address and the server-only authentication secret. The raw address is
not stored, the digest is not displayed, and it cannot be reversed without the
secret.

## Access and isolation

Dashboard routes and analytics queries require authentication. Every query
first verifies that the selected website belongs to the authenticated account.
The public tracking ID is random and does not reveal a database ID. Tracking
requests are accepted only when their origin exactly matches the registered
website domain.

Stored titles, paths, and referrers are rendered as text by React rather than
as HTML. Authentication cookies are HTTP-only by Auth.js and are marked Secure
in production. Production responses apply CSP, clickjacking, MIME-sniffing,
referrer, permissions, and HSTS headers.

## Retention policy

- Page views, visitor records, and sessions are retained for 90 days.
- Ingestion rate-limit counters are retained for 24 hours.
- Account and website configuration is retained until the owner deletes the
  website or account.
- Deleting a website cascades to its visitors, sessions, page views, and rate
  counters through database foreign keys.

The production operator must schedule a daily database job that deletes page
views and sessions older than 90 days, removes visitors with no remaining page
views or sessions, and deletes rate-limit windows older than 24 hours. The job
must run against the production database using server-only credentials. Until
that job is enabled during deployment, this documented window is a deployment
blocker rather than a claim that data is already purged automatically.

## Query performance review

On September 20, 2026, the primary 30-day summary, timeline, top-pages, and
device-breakdown queries were measured with PostgreSQL `EXPLAIN ANALYZE` against
development data. Page-view queries used
`page_views_website_id_created_at_idx`; the device query used
`sessions_website_id_started_at_idx`. Execution times ranged from 0.127 ms to
2.407 ms on the small development dataset. No additional index or
pre-aggregation was justified. Query plans should be measured again with
production-scale data before caching or adding indexes.
