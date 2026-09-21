import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { WebsiteSelector } from "@/components/dashboard/website-selector";
import { db } from "@/lib/db/client";

export async function AnalyticsFilters({ userId }: { userId: string }) {
  const websites = await db.website.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <WebsiteSelector websites={websites} defaultId={websites[0]?.id} />
      <DateRangeSelector />
    </div>
  );
}
