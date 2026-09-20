import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db/client";

export interface AnalyticsScope {
  userId: string;
  websiteId: string;
  from: Date;
  to: Date;
}

export async function getSummaryMetrics(scope: AnalyticsScope) {
  await assertOwnedScope(scope);
  const completionCutoff = new Date(scope.to.getTime() - 30 * 60_000);
  const [views] = await db.$queryRaw<
    { pageViews: number; uniqueVisitors: number }[]
  >(Prisma.sql`
    SELECT COUNT(*)::int AS "pageViews",
           COUNT(DISTINCT visitor_id)::int AS "uniqueVisitors"
    FROM page_views
    WHERE website_id = ${scope.websiteId}
      AND created_at >= ${scope.from} AND created_at < ${scope.to}
  `);
  const [sessions] = await db.$queryRaw<
    { completed: number; bounces: number; averageDuration: number | null }[]
  >(Prisma.sql`
    SELECT COUNT(*)::int AS completed,
           COUNT(*) FILTER (WHERE views = 1)::int AS bounces,
           AVG(EXTRACT(EPOCH FROM (last_activity_at - started_at)))::float8 AS "averageDuration"
    FROM (
      SELECT s.id, s.started_at, s.last_activity_at, COUNT(p.id)::int AS views
      FROM sessions s
      LEFT JOIN page_views p ON p.session_id = s.id
      WHERE s.website_id = ${scope.websiteId}
        AND s.started_at >= ${scope.from} AND s.started_at < ${scope.to}
        AND s.last_activity_at <= ${completionCutoff}
      GROUP BY s.id
    ) completed_sessions
  `);
  return {
    pageViews: views?.pageViews ?? 0,
    uniqueVisitors: views?.uniqueVisitors ?? 0,
    bounceRate:
      sessions?.completed > 0
        ? (sessions.bounces / sessions.completed) * 100
        : null,
    averageSessionDuration: sessions?.averageDuration ?? null,
  };
}

export async function getTrafficTimeline(scope: AnalyticsScope) {
  await assertOwnedScope(scope);
  const hourly = scope.to.getTime() - scope.from.getTime() <= 25 * 60 * 60_000;
  const bucket = hourly ? Prisma.sql`'hour'` : Prisma.sql`'day'`;
  const rows = await db.$queryRaw<
    { bucket: Date; views: number; visitors: number }[]
  >(Prisma.sql`
    SELECT date_trunc(${bucket}, created_at AT TIME ZONE 'UTC') AS bucket,
           COUNT(*)::int AS views,
           COUNT(DISTINCT visitor_id)::int AS visitors
    FROM page_views
    WHERE website_id = ${scope.websiteId}
      AND created_at >= ${scope.from} AND created_at < ${scope.to}
    GROUP BY bucket ORDER BY bucket
  `);
  return fillTimeline(rows, scope.from, scope.to, hourly);
}

export async function getTopPages(scope: AnalyticsScope, limit = 10) {
  await assertOwnedScope(scope);
  return db.$queryRaw<
    { path: string; pageViews: number; uniqueVisitors: number }[]
  >(Prisma.sql`
    SELECT path, COUNT(*)::int AS "pageViews",
           COUNT(DISTINCT visitor_id)::int AS "uniqueVisitors"
    FROM page_views
    WHERE website_id = ${scope.websiteId}
      AND created_at >= ${scope.from} AND created_at < ${scope.to}
    GROUP BY path ORDER BY "pageViews" DESC, path ASC
    LIMIT ${boundedLimit(limit)}
  `);
}

export async function getReferrerBreakdown(scope: AnalyticsScope, limit = 20) {
  await assertOwnedScope(scope);
  const rows = await db.$queryRaw<
    { referrer: string | null; visits: number }[]
  >(
    Prisma.sql`
      SELECT referrer, COUNT(*)::int AS visits
      FROM sessions
      WHERE website_id = ${scope.websiteId}
        AND started_at >= ${scope.from} AND started_at < ${scope.to}
      GROUP BY referrer ORDER BY visits DESC
      LIMIT ${boundedLimit(limit)}
    `,
  );
  return rows.map((row) => ({
    ...row,
    source: categorizeSource(row.referrer),
  }));
}

export async function getSourceDistribution(scope: AnalyticsScope) {
  await assertOwnedScope(scope);
  const referrers = await db.$queryRaw<
    { referrer: string | null; visits: number }[]
  >(Prisma.sql`
    SELECT referrer, COUNT(*)::int AS visits
    FROM sessions
    WHERE website_id = ${scope.websiteId}
      AND started_at >= ${scope.from} AND started_at < ${scope.to}
    GROUP BY referrer
  `);
  const totals = new Map<string, number>();
  for (const row of referrers) {
    const source = categorizeSource(row.referrer);
    totals.set(source, (totals.get(source) ?? 0) + row.visits);
  }
  return ["Direct", "Search", "Social", "Referral"].map((source) => ({
    source,
    visits: totals.get(source) ?? 0,
  }));
}

export async function getDeviceDistribution(scope: AnalyticsScope) {
  await assertOwnedScope(scope);
  return db.$queryRaw<{ device: string; visits: number }[]>(Prisma.sql`
    SELECT device, COUNT(*)::int AS visits
    FROM sessions
    WHERE website_id = ${scope.websiteId}
      AND started_at >= ${scope.from} AND started_at < ${scope.to}
    GROUP BY device ORDER BY visits DESC, device ASC
  `);
}

export async function getBrowserDistribution(scope: AnalyticsScope) {
  await assertOwnedScope(scope);
  return db.$queryRaw<{ browser: string; visits: number }[]>(Prisma.sql`
    SELECT browser, COUNT(*)::int AS visits
    FROM sessions
    WHERE website_id = ${scope.websiteId}
      AND started_at >= ${scope.from} AND started_at < ${scope.to}
    GROUP BY browser ORDER BY visits DESC, browser ASC
  `);
}

export async function getRecentActivity(scope: AnalyticsScope, limit = 20) {
  await assertOwnedScope(scope);
  return db.pageView.findMany({
    where: {
      websiteId: scope.websiteId,
      createdAt: { gte: scope.from, lt: scope.to },
    },
    orderBy: { createdAt: "desc" },
    take: boundedLimit(limit),
    select: {
      id: true,
      path: true,
      title: true,
      referrer: true,
      createdAt: true,
      visitor: { select: { anonymousId: true } },
      session: { select: { device: true, browser: true, country: true } },
    },
  });
}

export async function getVisitors(scope: AnalyticsScope, limit = 100) {
  await assertOwnedScope(scope);
  return db.$queryRaw<
    {
      id: string;
      anonymousId: string;
      firstSeenAt: Date;
      lastSeenAt: Date;
      sessions: number;
      pageViews: number;
    }[]
  >(Prisma.sql`
    SELECT v.id, v.anonymous_id AS "anonymousId",
           v.first_seen_at AS "firstSeenAt", v.last_seen_at AS "lastSeenAt",
           COUNT(DISTINCT s.id)::int AS sessions,
           COUNT(DISTINCT p.id)::int AS "pageViews"
    FROM visitors v
    JOIN page_views p ON p.visitor_id = v.id
      AND p.created_at >= ${scope.from} AND p.created_at < ${scope.to}
    LEFT JOIN sessions s ON s.visitor_id = v.id
      AND s.started_at >= ${scope.from} AND s.started_at < ${scope.to}
    WHERE v.website_id = ${scope.websiteId}
    GROUP BY v.id
    ORDER BY "lastSeenAt" DESC
    LIMIT ${boundedLimit(limit, 200)}
  `);
}

async function assertOwnedScope(scope: AnalyticsScope) {
  if (
    !scope.userId ||
    !scope.websiteId ||
    !(scope.from instanceof Date) ||
    !(scope.to instanceof Date) ||
    !Number.isFinite(scope.from.getTime()) ||
    !Number.isFinite(scope.to.getTime()) ||
    scope.from >= scope.to ||
    scope.to.getTime() - scope.from.getTime() > 31 * 24 * 60 * 60_000
  ) {
    throw new Error("Invalid analytics scope");
  }
  const website = await db.website.findFirst({
    where: { id: scope.websiteId, userId: scope.userId },
    select: { id: true },
  });
  if (!website) throw new Error("Website not found");
}

function boundedLimit(value: number, maximum = 100) {
  return Math.max(1, Math.min(maximum, Math.trunc(value) || 1));
}

function categorizeSource(referrer: string | null) {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (/^(google|bing|yahoo|duckduckgo|baidu|yandex)\./.test(host))
      return "Search";
    if (/^(facebook|instagram|linkedin|x|twitter|tiktok|reddit)\./.test(host))
      return "Social";
  } catch {
    return "Direct";
  }
  return "Referral";
}

function fillTimeline(
  rows: { bucket: Date; views: number; visitors: number }[],
  from: Date,
  to: Date,
  hourly: boolean,
) {
  const interval = hourly ? 60 * 60_000 : 24 * 60 * 60_000;
  const floor = (date: Date) => {
    const value = new Date(date);
    if (hourly) value.setUTCMinutes(0, 0, 0);
    else value.setUTCHours(0, 0, 0, 0);
    return value;
  };
  const indexed = new Map(
    rows.map((row) => [new Date(row.bucket).getTime(), row]),
  );
  const result = [];
  for (
    let time = floor(from).getTime();
    time < to.getTime();
    time += interval
  ) {
    const row = indexed.get(time);
    result.push({
      bucket: new Date(time),
      views: row?.views ?? 0,
      visitors: row?.visitors ?? 0,
    });
  }
  return result;
}
