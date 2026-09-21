import { EmptyState } from "@/components/dashboard/empty-state";
import { AnalyticsFilters } from "@/components/dashboard/analytics-filters";
import { Select } from "@/components/ui/select";
import {
  resolveDashboardScope,
  type DashboardSearchParams,
} from "@/lib/analytics/dashboard-scope";
import { getTopPages } from "@/lib/analytics/queries";
import { requireUser } from "@/lib/auth/require-user";

export default async function PagesPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const context = await resolveDashboardScope(user.id, params);
  if (!context)
    return (
      <EmptyState
        title="No website selected"
        message="Add a website before viewing page analytics."
        setup
      />
    );
  const query =
    typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const sort =
    params.sort === "visitors" || params.sort === "path"
      ? params.sort
      : "views";
  const pages = (await getTopPages(context.scope, 100))
    .filter((page) => page.path.toLowerCase().includes(query))
    .sort((a, b) =>
      sort === "path"
        ? a.path.localeCompare(b.path)
        : sort === "visitors"
          ? b.uniqueVisitors - a.uniqueVisitors
          : b.pageViews - a.pageViews,
    );
  return (
    <section>
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="eyebrow">Content</span>
          <h1 className="mt-3 text-3xl font-semibold">Pages</h1>
          <p className="mt-2 text-slate-600">
            See which paths attract and retain visitors.
          </p>
        </div>
        <AnalyticsFilters userId={user.id} />
      </header>
      <form className="mt-7 flex flex-wrap gap-3" method="get">
        {typeof params.website === "string" && (
          <input type="hidden" name="website" value={params.website} />
        )}
        {typeof params.range === "string" && (
          <input type="hidden" name="range" value={params.range} />
        )}
        <label className="flex-1">
          <span className="sr-only">Search paths</span>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            name="q"
            defaultValue={query}
            placeholder="Search paths"
          />
        </label>
        <Select
          className="w-48"
          label="Sort pages"
          name="sort"
          defaultValue={sort}
          options={[
            { value: "views", label: "Most views", marker: "V" },
            { value: "visitors", label: "Most visitors", marker: "U" },
            { value: "path", label: "Path A–Z", marker: "AZ" },
          ]}
        />
        <button className="button-primary" type="submit">
          Apply
        </button>
      </form>
      <div className="mt-6">
        {pages.length ? (
          <DataTable rows={pages} />
        ) : (
          <EmptyState
            title="No matching pages"
            message={
              query
                ? "Try a different path search."
                : "Page views will appear after the tracker records traffic."
            }
          />
        )}
      </div>
    </section>
  );
}
function DataTable({
  rows,
}: {
  rows: Awaited<ReturnType<typeof getTopPages>>;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Path</th>
            <th className="px-5 py-3 font-medium">Page views</th>
            <th className="px-5 py-3 font-medium">Unique visitors</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.path}>
              <td className="px-5 py-4 font-medium text-slate-900">
                {row.path}
              </td>
              <td className="px-5 py-4 text-slate-600">{row.pageViews}</td>
              <td className="px-5 py-4 text-slate-600">{row.uniqueVisitors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
