import { DistributionChart } from "@/components/charts/distribution-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  resolveDashboardScope,
  type DashboardSearchParams,
} from "@/lib/analytics/dashboard-scope";
import {
  getReferrerBreakdown,
  getSourceDistribution,
} from "@/lib/analytics/queries";
import { requireUser } from "@/lib/auth/require-user";

export default async function SourcesPage({
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
        message="Add a website before viewing traffic sources."
        setup
      />
    );
  const [sources, referrers] = await Promise.all([
    getSourceDistribution(context.scope),
    getReferrerBreakdown(context.scope, 50),
  ]);
  const total = sources.reduce((sum, item) => sum + item.visits, 0);
  return (
    <section>
      <span className="eyebrow">Acquisition</span>
      <h1 className="mt-3 text-3xl font-semibold">Sources</h1>
      <p className="mt-2 text-slate-600">
        Understand how visitors discover your website.
      </p>
      {total === 0 ? (
        <div className="mt-7">
          <EmptyState
            title="No source data yet"
            message="Referrers will appear after sessions are recorded."
          />
        </div>
      ) : (
        <div className="mt-7 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-5 font-semibold">Source categories</h2>
            <DistributionChart
              label="Sessions by traffic-source category"
              data={sources.map((item) => ({
                name: item.source,
                value: item.visits,
              }))}
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Referrers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Referrer</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Visits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {referrers.map((item, index) => (
                    <tr key={`${item.referrer}-${index}`}>
                      <td className="max-w-xs truncate px-5 py-3 font-medium">
                        {item.referrer
                          ? new URL(item.referrer).hostname
                          : "Direct"}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {item.source}
                      </td>
                      <td className="px-5 py-3">{item.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
