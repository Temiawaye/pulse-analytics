import { z } from "zod";

export const trackingEventSchema = z.object({
  trackingId: z
    .string()
    .trim()
    .min(12)
    .max(80)
    .regex(/^site_[A-Za-z0-9_-]+$/),
  event: z.literal("page_view"),
  path: z.string().trim().min(1).max(2048),
  title: z.string().trim().max(300).optional(),
  referrer: z.string().trim().max(2048).optional(),
  anonymousId: z
    .string()
    .trim()
    .min(16)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/),
  timestamp: z.iso.datetime().optional(),
});

export type TrackingEvent = z.infer<typeof trackingEventSchema>;
