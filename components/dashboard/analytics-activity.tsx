import { EmptyState } from "@/components/dashboard/empty-state";

export interface AnalyticsActivityItem {
  id: string;
  path: string;
  title: string | null;
  createdAt: string;
  session: { device: string; browser: string; country: string | null };
}

interface AnalyticsActivityProps {
  pageViews: number;
  recent: AnalyticsActivityItem[];
}

export function AnalyticsActivity({
  pageViews,
  recent,
}: AnalyticsActivityProps) {
  if (pageViews === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          title="No analytics yet"
          message="Install the tracking script and visit your website. New page views will appear here."
        />
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-slate-900">
        Recent activity
      </h2>
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
              <p className="font-mono text-xs text-slate-500">
                {item.path} / {item.session.device} / {item.session.browser}
              </p>
            </div>
            <time
              className="font-mono text-xs text-slate-500"
              dateTime={item.createdAt}
            >
              {new Date(item.createdAt).toLocaleString()}
            </time>
          </article>
        ))}
      </div>
    </section>
  );
}
