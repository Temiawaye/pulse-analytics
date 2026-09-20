import "server-only";

import { db } from "@/lib/db/client";
import { resolveDateRange } from "@/lib/analytics/date-range";

export type DashboardSearchParams = Record<
  string,
  string | string[] | undefined
>;

export async function resolveDashboardScope(
  userId: string,
  params: DashboardSearchParams,
) {
  const requested =
    typeof params.website === "string" ? params.website : undefined;
  const website = await db.website.findFirst({
    where: requested ? { id: requested, userId } : { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, domain: true, trackingId: true },
  });
  if (!website) return null;
  const range = resolveDateRange(
    typeof params.range === "string" ? params.range : undefined,
  );
  return {
    website,
    range,
    scope: { userId, websiteId: website.id, from: range.from, to: range.to },
  };
}
