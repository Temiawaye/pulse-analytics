import { z } from "zod";

import { auth } from "@/auth";
import { resolveDateRange } from "@/lib/analytics/date-range";
import { getRecentActivity, getSummaryMetrics } from "@/lib/analytics/queries";

const querySchema = z.object({
  website: z.string().min(1).max(64),
  range: z.enum(["24h", "7d", "30d"]).default("7d"),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    website: url.searchParams.get("website"),
    range: url.searchParams.get("range") ?? "7d",
  });
  if (!parsed.success)
    return Response.json({ error: "Invalid request" }, { status: 400 });
  const dates = resolveDateRange(parsed.data.range);
  const scope = {
    userId: session.user.id,
    websiteId: parsed.data.website,
    from: dates.from,
    to: dates.to,
  };
  try {
    const [summary, recent] = await Promise.all([
      getSummaryMetrics(scope),
      getRecentActivity(scope, 8),
    ]);
    return Response.json(
      { summary, recent, refreshedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Website not found" }, { status: 404 });
  }
}
