import "server-only";
import { createHmac } from "node:crypto";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";

const LIMIT = 120;
const WINDOW_MS = 60_000;

export async function checkIngestionRateLimit(
  request: Request,
  websiteId: string,
) {
  if (!env.AUTH_SECRET)
    throw new Error("AUTH_SECRET is required for rate limiting");
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const identity = request.headers.get("x-real-ip") ?? forwarded ?? "unknown";
  const identityHash = createHmac("sha256", env.AUTH_SECRET)
    .update(identity)
    .digest("hex");
  const windowStart = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);

  const entry = await db.ingestionRateLimit.upsert({
    where: {
      websiteId_identityHash_windowStart: {
        websiteId,
        identityHash,
        windowStart,
      },
    },
    update: { count: { increment: 1 } },
    create: { websiteId, identityHash, windowStart },
    select: { count: true },
  });
  return {
    allowed: entry.count <= LIMIT,
    retryAfter: Math.ceil(
      (windowStart.getTime() + WINDOW_MS - Date.now()) / 1000,
    ),
  };
}
