import { EmptyState } from "@/components/dashboard/empty-state";
import { AnalyticsFilters } from "@/components/dashboard/analytics-filters";
import {
  resolveDashboardScope,
  type DashboardSearchParams,
} from "@/lib/analytics/dashboard-scope";
import { getVisitors } from "@/lib/analytics/queries";
import { requireUser } from "@/lib/auth/require-user";

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const user = await requireUser();
  const context = await resolveDashboardScope(user.id, await searchParams);
  if (!context)
    return (
      <EmptyState
        title="No website selected"
        message="Add a website before viewing visitor analytics."
        setup
      />
    );
  const visitors = await getVisitors(context.scope);
  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="eyebrow">Audience</span>
          <h1 className="mt-3 text-3xl font-semibold">Visitors</h1>
          <p className="mt-2 text-slate-600">
            Anonymous, website-scoped visitor activity.
          </p>
        </div>
        <AnalyticsFilters userId={user.id} />
      </header>
      <div className="mt-7">
        {visitors.length ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "Visitor",
                    "First seen",
                    "Last seen",
                    "Sessions",
                    "Views",
                  ].map((item) => (
                    <th className="px-5 py-3 font-medium" key={item}>
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.map((visitor) => (
                  <tr key={visitor.id}>
                    <td className="px-5 py-4 font-mono text-xs text-slate-700">
                      {maskId(visitor.anonymousId)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {visitor.firstSeenAt.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {visitor.lastSeenAt.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">{visitor.sessions}</td>
                    <td className="px-5 py-4">{visitor.pageViews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No visitors yet"
            message="Anonymous visitors will appear after the tracker records traffic."
          />
        )}
      </div>
    </section>
  );
}
function maskId(value: string) {
  return value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}
