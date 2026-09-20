import { z } from "zod";
export const websiteSchema = z.object({
  name: z.string().trim().min(2).max(80),
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .transform((value) => value.replace(/^https?:\/\//, "").replace(/\/$/, ""))
    .pipe(
      z
        .string()
        .min(3)
        .max(253)
        .regex(/^[a-z0-9.-]+(?::\d+)?$/),
    ),
});
