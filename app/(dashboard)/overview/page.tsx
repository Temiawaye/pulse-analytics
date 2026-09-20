import { DistributionChart } from "@/components/charts/distribution-chart";
import { TrafficChart } from "@/components/charts/traffic-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  resolveDashboardScope,
  type DashboardSearchParams,
} from "@/lib/analytics/dashboard-scope";
import {
  getBrowserDistribution,
  getDeviceDistribution,
  getRecentActivity,
  getSourceDistribution,
  getSummaryMetrics,
  getTopPages,
  getTrafficTimeline,
} from "@/lib/analytics/queries";
import { requireUser } from "@/lib/auth/require-user";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const user = await requireUser();
  const context = await resolveDashboardScope(user.id, await searchParams);
  if (!context)
    return (
      <EmptyState
        title="Add your first website"
        message="Register a website to begin collecting and viewing analytics."
        setup
      />
    );
  const [summary, timeline, pages, sources, devices, browsers, recent] =
    await Promise.all([
      getSummaryMetrics(context.scope),
      getTrafficTimeline(context.scope),
      getTopPages(context.scope, 6),
      getSourceDistribution(context.scope),
      getDeviceDistribution(context.scope),
      getBrowserDistribution(context.scope),
      getRecentActivity(context.scope, 8),
    ]);
  const formatter = new Intl.DateTimeFormat(
    "en",
    context.range.key === "24h"
      ? { hour: "numeric" }
      : { month: "short", day: "numeric" },
  );
  return (
    <section>
      <header>
        <span className="eyebrow">{context.website.name}</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-2 text-sm text-slate-600">
          Traffic for {context.website.domain} over the selected period.
        </p>
      </header>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Page views"
          value={summary.pageViews.toLocaleString()}
          hint="Accepted page-view events"
        />
        <MetricCard
          label="Unique visitors"
          value={summary.uniqueVisitors.toLocaleString()}
          hint="Distinct anonymous visitors"
        />
        <MetricCard
          label="Bounce rate"
          value={
            summary.bounceRate === null
              ? "—"
              : `${summary.bounceRate.toFixed(1)}%`
          }
          hint="Completed one-page sessions"
        />
        <MetricCard
          label="Average duration"
          value={formatDuration(summary.averageSessionDuration)}
          hint="Completed sessions"
        />
      </div>
      {summary.pageViews === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No analytics yet"
            message="Install the tracking script and visit your website. New page views will appear here."
          />
        </div>
      ) : (
        <>
          <Panel title="Traffic over time" className="mt-6">
            <TrafficChart
              data={timeline.map((point) => ({
                label: formatter.format(point.bucket),
                views: point.views,
                visitors: point.visitors,
              }))}
            />
          </Panel>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Panel title="Top pages">
              <Table
                headers={["Path", "Views", "Visitors"]}
                rows={pages.map((page) => [
                  page.path,
                  page.pageViews,
                  page.uniqueVisitors,
                ])}
              />
            </Panel>
            <Panel title="Traffic sources">
              <DistributionChart
                label="Visits by traffic-source category"
                data={sources.map((source) => ({
                  name: source.source,
                  value: source.visits,
                }))}
              />
            </Panel>
            <Panel title="Devices">
              <DistributionChart
                label="Sessions by device type"
                data={devices.map((item) => ({
                  name: item.device,
                  value: item.visits,
                }))}
              />
            </Panel>
            <Panel title="Browsers">
              <DistributionChart
                label="Sessions by browser"
                data={browsers.map((item) => ({
                  name: item.browser,
                  value: item.visits,
                }))}
              />
            </Panel>
          </div>
          <Panel title="Recent activity" className="mt-6">
            <div className="divide-y divide-slate-100">
              {recent.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.title || item.path}
                    </p>
                    <p className="text-slate-500">
                      {item.path} · {item.session.device} ·{" "}
                      {item.session.browser}
                    </p>
                  </div>
                  <time
                    className="text-slate-500"
                    dateTime={item.createdAt.toISOString()}
                  >
                    {item.createdAt.toLocaleString()}
                  </time>
                </article>
              ))}
            </div>
          </Panel>
        </>
      )}
    </section>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <h2 className="mb-5 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr>
            {headers.map((header) => (
              <th className="pb-3 pr-4 font-medium" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`}>
              {row.map((cell, cellIndex) => (
                <td
                  className={`py-3 pr-4 ${cellIndex ? "text-slate-600" : "font-medium text-slate-900"}`}
                  key={cellIndex}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function formatDuration(seconds: number | null) {
  if (seconds === null) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}
