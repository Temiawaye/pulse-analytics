import { EmptyState } from "@/components/dashboard/empty-state";
import { TrackingSnippet } from "@/components/dashboard/tracking-snippet";
import {
  resolveDashboardScope,
  type DashboardSearchParams,
} from "@/lib/analytics/dashboard-scope";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";
import { saveWebsite } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const context = await resolveDashboardScope(user.id, params);
  const website = context?.website;
  const lastEvent = website
    ? await db.pageView.findFirst({
        where: { websiteId: website.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      })
    : null;
  const snippet = website
    ? `<script\n  defer\n  data-website-id="${website.trackingId}"\n  src="${env.APP_URL}/tracker.js"\n></script>`
    : "";
  return (
    <section className="max-w-3xl">
      <span className="eyebrow">Configuration</span>
      <h1 className="mt-3 text-3xl font-semibold">
        {website ? "Website settings" : "Add a website"}
      </h1>
      <p className="mt-3 text-slate-600">
        Register the exact hostname that will send analytics events.
      </p>
      {params.created === "1" && (
        <Notice>Website created. Install the tracker below.</Notice>
      )}
      {params.saved === "1" && <Notice>Website settings saved.</Notice>}
      <form
        action={saveWebsite}
        className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
      >
        {website && <input type="hidden" name="websiteId" value={website.id} />}
        <Field
          name="name"
          label="Website name"
          defaultValue={website?.name}
          placeholder="My portfolio"
        />
        <Field
          name="domain"
          label="Domain"
          defaultValue={website?.domain}
          placeholder="example.com"
        />
        <button className="button-primary" type="submit">
          {website ? "Save changes" : "Create website"}
        </button>
      </form>
      {website ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info label="Public tracking ID" value={website.trackingId} />
            <Info
              label="Tracking status"
              value={
                lastEvent
                  ? `Last event ${lastEvent.createdAt.toLocaleString()}`
                  : "Waiting for first event"
              }
            />
          </div>
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold">Installation snippet</h2>
            <p className="mb-4 mt-2 text-sm text-slate-600">
              Paste this into the tracked website. It loads without blocking
              rendering.
            </p>
            <TrackingSnippet code={snippet} />
          </section>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No tracking code yet"
            message="Create the website to receive its public tracking ID and installation snippet."
          />
        </div>
      )}
    </section>
  );
}
function Field({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
      />
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
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
