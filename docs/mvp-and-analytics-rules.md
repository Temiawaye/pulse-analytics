# Pulse Analytics MVP and analytics rules

This document fixes the product scope and calculation rules for the MVP. It is
the implementation contract for ingestion, reporting, and the dashboard.

## MVP feature set

Pulse Analytics will:

- let an authenticated user register and manage one or more websites;
- issue each website a unique public tracking ID that does not reveal its
  internal database ID;
- accept real page-view events from a registered website through `POST
  /api/track`;
- identify a visitor using a random, website-scoped anonymous ID without
  collecting names, email addresses, or full IP addresses;
- group page views into sessions using a 30-minute inactivity timeout;
- store users, websites, visitors, sessions, and page views in PostgreSQL;
- show page views, unique visitors, bounce rate, average session duration, top
  pages, sources, devices, browsers, and recent activity;
- filter reports to the last 24 hours, 7 days, or 30 days;
- isolate every website and analytics operation to its authenticated owner;
- provide a lightweight tracking script and installation snippet;
- refresh current dashboard data through visibility-aware polling; and
- document privacy, retention, local setup, deployment, and portfolio usage.

The MVP excludes heatmaps, recordings, custom events, complex attribution,
teams and roles, billing, subscriptions, predictive analytics, and WebSockets.

## Analytics rules

All timestamps are stored in UTC. A selected range is a half-open interval
`[from, to)`, which prevents double counting at adjacent boundaries. Dashboard
labels may display times in the viewer's locale.

### Page views

The number of accepted `page_view` records whose `createdAt` is inside the
selected range. Rejected, rate-limited, malformed, or wrong-origin requests do
not count.

### Unique visitors

The number of distinct website-scoped visitors with at least one accepted page
view inside the selected range. A visitor is keyed by `(websiteId,
anonymousId)`; the anonymous ID is not shared across websites.

### Session

Consecutive activity by one visitor on one website. An event reuses the most
recent session only when its last activity is less than 30 minutes before the
accepted event. At 30 minutes or more, a new session begins. A session's start
is its first accepted page view and its last activity is its latest accepted
page view.

### Bounce rate

The percentage of completed sessions in the selected range that contain
exactly one page view:

`single-page completed sessions / completed sessions * 100`

A session is completed for reporting when its `lastActivityAt` is at least 30
minutes before the report's `to` boundary. Active sessions are excluded so the
metric does not label an in-progress visit as a bounce. A session is attributed
to the range by `startedAt`. With no completed sessions, the dashboard shows
no data rather than an artificial 0%.

### Average session duration

For completed sessions whose `startedAt` is inside the selected range, average
`lastActivityAt - startedAt`, expressed in seconds and formatted for display.
Single-page sessions therefore have a duration of zero. With no completed
sessions, the dashboard shows no data.

### Breakdowns and activity

- Traffic over time counts views and distinct visitors in UTC buckets: hourly
  for 24 hours and daily for 7 or 30 days. Empty buckets are returned as zero.
- Top pages group accepted page views by sanitized path. Query strings and URL
  fragments are discarded before storage.
- Referrers use the sanitized referrer hostname. Missing referrers are Direct.
  Known search and social hostnames are categorized as Search and Social;
  remaining external hostnames are Referral.
- Device and browser values are derived on the server from the request user
  agent, never accepted from the event body.
- Recent activity is ordered by page-view creation time descending.

## Supported date filters

| Filter | Range | Chart bucket |
| --- | --- | --- |
| 24 hours | `to - 24 hours` through `to` | Hour |
| 7 days | `to - 7 days` through `to` | Day |
| 30 days | `to - 30 days` through `to` | Day |

The selected range and website live in URL search parameters so filtered views
can be refreshed, bookmarked, and shared without relying on client memory.

## Low-fidelity screen layouts

These wireframes define information hierarchy, not final visual styling.

### Shared dashboard shell

```text
+------------------------------------------------------------------+
| Pulse | Website selector | Date range | Account / Sign out       |
+-------------+----------------------------------------------------+
| Overview    | Page heading                         Last refreshed |
| Pages       |----------------------------------------------------|
| Visitors    | Page content                                      |
| Sources     |                                                    |
| Settings    |                                                    |
+-------------+----------------------------------------------------+
```

On narrow screens the navigation becomes a horizontally scrollable or compact
top navigation, controls wrap, and data tables retain horizontal scrolling.

### Overview

```text
+-------------+-------------+-------------+------------------+
| Page views  | Visitors    | Bounce rate | Avg. duration    |
+-------------+-------------+-------------+------------------+
| Traffic over time chart                                  |
+--------------------------------+--------------------------+
| Top pages table                | Traffic sources chart    |
+--------------------------------+--------------------------+
| Device breakdown               | Recent activity          |
+--------------------------------+--------------------------+
```

### Pages

```text
+------------------------------------------------------------------+
| Pages                                         Search | Sort       |
+------------------------------------------------------------------+
| Path                         Page views       Unique visitors     |
| /                            ...              ...                 |
| /projects                    ...              ...                 |
+------------------------------------------------------------------+
```

### Visitors

```text
+------------------------------------------------------------------+
| Anonymous visitors                                               |
+------------------------------------------------------------------+
| Visitor ID       First seen      Last seen     Sessions    Views |
| visitor_...      ...             ...           ...         ...   |
+------------------------------------------------------------------+
```

### Sources

```text
+----------------+----------------+----------------+----------------+
| Direct         | Search         | Social         | Referral       |
+---------------------------------+--------------------------------+
| Source distribution chart       | Referrer table                 |
+---------------------------------+--------------------------------+
```

### Settings

```text
+------------------------------------------------------------------+
| Website details                                                  |
| Name [________________]  Domain [________________]  [Save]        |
+------------------------------------------------------------------+
| Tracking status | Last event                                    |
+------------------------------------------------------------------+
| Installation                                                     |
| <script defer data-website-id="site_..." src="..."></script>   |
|                                                     [Copy]       |
+------------------------------------------------------------------+
```

Every data view must explicitly support loading, error, empty, and populated
states. Charts must include text labels or tabular context, controls must be
keyboard operable with visible focus, and color must not be the only carrier of
meaning.
