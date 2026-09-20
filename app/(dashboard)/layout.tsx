import Link from "next/link";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-slate-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
        <Link
          className="inline-flex items-center gap-2 font-semibold tracking-tight text-slate-950"
          href="/overview"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-emerald-700 text-sm font-bold text-white"
          >
            P
          </span>
          Pulse Analytics
        </Link>
        <div className="mt-4 lg:mt-10">
          <DashboardNav />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 sm:px-8">
          <p className="text-sm font-medium text-slate-700">All websites</p>
          <p className="text-sm text-slate-500">Last 7 days</p>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
