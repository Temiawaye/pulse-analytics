import Link from "next/link";

import { DeleteWebsiteButton } from "@/components/dashboard/delete-website-button";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db/client";
import { createWebsite } from "./actions";

export default async function WebsitesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const websites = await db.website.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      domain: true,
      trackingId: true,
      createdAt: true,
      _count: { select: { pageViews: true, visitors: true } },
      pageViews: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  return (
    <section>
      <span className="eyebrow">Workspace</span>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Websites</h1>
          <p className="mt-2 text-slate-600">
            Add websites and monitor each project independently.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800">
          {websites.length} {websites.length === 1 ? "website" : "websites"}
        </span>
      </div>

      {params.created && (
        <Notice>
          Website created. Open its integration guide to install tracking.
        </Notice>
      )}
      {params.deleted === "1" && (
        <Notice>Website and its analytics data deleted.</Notice>
      )}
      {params.error && (
        <p
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          We could not complete that request. Check the website details and try
          again.
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-xl font-medium text-emerald-800">
            +
          </span>
          <div>
            <h2 className="font-semibold text-slate-950">Add a website</h2>
            <p className="text-sm text-slate-500">
              Use the exact hostname, including a non-default port.
            </p>
          </div>
        </div>
        <form
          action={createWebsite}
          className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          <Field
            label="Website name"
            name="name"
            placeholder="Marketing site"
          />
          <Field label="Domain" name="domain" placeholder="example.com" />
          <button className="button-primary justify-center" type="submit">
            Add website
          </button>
        </form>
      </section>

      {websites.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {websites.map((website) => {
            const lastEvent = website.pageViews[0]?.createdAt;
            return (
              <article
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                key={website.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-emerald-700 text-lg font-bold text-white">
                    {website.name.slice(0, 1).toUpperCase()}
                  </div>
                  <DeleteWebsiteButton
                    websiteId={website.id}
                    websiteName={website.name}
                  />
                </div>
                <h2 className="mt-4 truncate text-lg font-semibold text-slate-950">
                  {website.name}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {website.domain}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-4 text-sm">
                  <div>
                    <p className="text-slate-500">Page views</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {website._count.pageViews.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Visitors</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {website._count.visitors.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <span
                    className={`size-2 rounded-full ${lastEvent ? "bg-emerald-500" : "bg-amber-400"}`}
                  />
                  {lastEvent
                    ? `Last event ${lastEvent.toLocaleString()}`
                    : "Waiting for data"}
                </div>
                <p className="mt-3 truncate font-mono text-xs text-slate-400">
                  {website.trackingId}
                </p>
                <div className="mt-5 flex gap-2">
                  <Link
                    className="button-primary inline-flex flex-1 justify-center text-sm"
                    href={`/overview?website=${website.id}`}
                  >
                    View analytics
                  </Link>
                  <Link
                    className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    href={`/docs?website=${website.id}`}
                  >
                    Install
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="font-semibold text-slate-900">No websites yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            Add your first website above to generate a tracking ID.
          </p>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      {label}
      <input
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950"
        name={name}
        placeholder={placeholder}
        required
      />
    </label>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      role="status"
    >
      {children}
    </p>
  );
}
