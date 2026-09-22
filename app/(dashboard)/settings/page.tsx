import Link from "next/link";

import { requireUser } from "@/lib/auth/require-user";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <section className="max-w-3xl">
      <span className="eyebrow">Configuration</span>
      <h1 className="mt-3 text-[2rem] font-semibold tracking-tight sm:text-4xl">
        Settings
      </h1>
      <p className="mt-2 text-slate-600">
        Manage your Pulse Analytics account and workspace.
      </p>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Account</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Info label="Name" value={user.name ?? "Not provided"} />
          <Info label="Email" value={user.email ?? "Not provided"} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Website management
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Website domains, tracking IDs, installation status, and deletion are
          managed from your Websites workspace.
        </p>
        <Link
          className="button-primary mt-5 inline-flex text-sm"
          href="/websites"
        >
          Manage websites
        </Link>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Data and privacy
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Pulse stores anonymous, website-scoped visitor activity. Query strings
          are removed and each website’s analytics remain isolated.
        </p>
        <Link
          className="mt-4 inline-flex text-sm font-semibold text-emerald-700 underline underline-offset-4"
          href="/docs"
        >
          Read the integration guide
        </Link>
      </section>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-medium text-slate-950">
        {value}
      </p>
    </div>
  );
}
