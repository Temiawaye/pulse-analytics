import { NextRequest, userAgent } from "next/server";

import { db } from "@/lib/db/client";
import { checkIngestionRateLimit } from "@/lib/tracking/rate-limit";
import {
  originMatchesDomain,
  sanitizePath,
  sanitizeReferrer,
  sanitizeTitle,
} from "@/lib/tracking/sanitize";
import { trackingEventSchema } from "@/lib/validation/tracking";

const MAX_PAYLOAD_BYTES = 8 * 1024;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return new Response(null, { status: 400 });
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return smallResponse(403);

  const contentType = request.headers.get("content-type")?.split(";", 1)[0];
  if (contentType !== "application/json" && contentType !== "text/plain") {
    return smallResponse(415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PAYLOAD_BYTES) return smallResponse(413);

  const body = await readLimitedBody(request);
  if (body === null) return smallResponse(413);

  let unknownPayload: unknown;
  try {
    unknownPayload = JSON.parse(body);
  } catch {
    return smallResponse(400);
  }

  const parsed = trackingEventSchema.safeParse(unknownPayload);
  if (!parsed.success) return smallResponse(400);

  const website = await db.website.findUnique({
    where: { trackingId: parsed.data.trackingId },
    select: { id: true, domain: true },
  });
  if (!website) return smallResponse(404);
  if (!originMatchesDomain(origin, website.domain)) return smallResponse(403);

  const rateLimit = await checkIngestionRateLimit(request, website.id);
  if (!rateLimit.allowed) {
    return new Response(null, {
      status: 429,
      headers: {
        ...corsHeaders(origin),
        "Retry-After": String(rateLimit.retryAfter),
      },
    });
  }

  const agent = userAgent(request);
  const now = new Date();
  const event = {
    anonymousId: parsed.data.anonymousId,
    path: sanitizePath(parsed.data.path),
    title: sanitizeTitle(parsed.data.title),
    referrer: sanitizeReferrer(parsed.data.referrer),
    device: normalizeDevice(agent.device.type),
    browser: agent.browser.name?.slice(0, 80) || "Unknown",
    country: trustedCountry(request),
  };

  try {
    await withSerializableRetry(async () => {
      await db.$transaction(
        async (transaction) => {
          const visitor = await transaction.visitor.upsert({
            where: {
              websiteId_anonymousId: {
                websiteId: website.id,
                anonymousId: event.anonymousId,
              },
            },
            update: { lastSeenAt: now },
            create: {
              websiteId: website.id,
              anonymousId: event.anonymousId,
              firstSeenAt: now,
              lastSeenAt: now,
            },
          });

          const activeAfter = new Date(now.getTime() - SESSION_TIMEOUT_MS);
          const activeSession = await transaction.session.findFirst({
            where: {
              websiteId: website.id,
              visitorId: visitor.id,
              lastActivityAt: { gt: activeAfter },
            },
            orderBy: { lastActivityAt: "desc" },
            select: { id: true },
          });

          const session = activeSession
            ? await transaction.session.update({
                where: { id: activeSession.id },
                data: { lastActivityAt: now },
                select: { id: true },
              })
            : await transaction.session.create({
                data: {
                  websiteId: website.id,
                  visitorId: visitor.id,
                  referrer: event.referrer,
                  device: event.device,
                  browser: event.browser,
                  country: event.country,
                  startedAt: now,
                  lastActivityAt: now,
                },
                select: { id: true },
              });

          await transaction.pageView.create({
            data: {
              websiteId: website.id,
              visitorId: visitor.id,
              sessionId: session.id,
              path: event.path,
              title: event.title,
              referrer: event.referrer,
              createdAt: now,
            },
          });
        },
        { isolationLevel: "Serializable" },
      );
    });
  } catch {
    return new Response(null, { status: 503, headers: corsHeaders(origin) });
  }

  return new Response(null, { status: 202, headers: corsHeaders(origin) });
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

function smallResponse(status: number) {
  return new Response(null, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function readLimitedBody(request: Request) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_PAYLOAD_BYTES) {
      await reader.cancel();
      return null;
    }
    result += decoder.decode(value, { stream: true });
  }
  return result + decoder.decode();
}

function normalizeDevice(type?: string) {
  if (type === "mobile") return "Mobile";
  if (type === "tablet") return "Tablet";
  return "Desktop";
}

function trustedCountry(request: Request) {
  const value = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  return value && /^[A-Z]{2}$/.test(value) ? value : null;
}

async function withSerializableRetry(operation: () => Promise<void>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await operation();
      return;
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String(error.code)
          : "";
      if (code !== "P2034" || attempt === 2) throw error;
    }
  }
}
