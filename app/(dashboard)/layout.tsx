import Link from "next/link";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { WebsiteSelector } from "@/components/dashboard/website-selector";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db/client";
import { signOut } from "@/auth";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const websites = await db.website.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
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
          <div className="flex flex-wrap items-center gap-2">
            <WebsiteSelector websites={websites} defaultId={websites[0]?.id} />
            <DateRangeSelector />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {user.name}
              </p>
              <p className="hidden max-w-48 truncate text-xs text-slate-500 sm:block">
                {user.email}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800"
            >
              {user.name?.slice(0, 1).toUpperCase() ?? "U"}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                className="text-sm font-medium text-slate-600 hover:text-slate-950"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
