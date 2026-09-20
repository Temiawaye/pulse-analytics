import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z
  .object({
    APP_URL: z.url().default("http://localhost:3000"),
    DATABASE_URL: z.url().optional(),
    AUTH_SECRET: z.string().min(32).optional(),
    NODE_ENV: z.enum(["development", "test", "production"]),
  })
  .superRefine((environment, context) => {
    if (environment.NODE_ENV !== "production") return;
    if (!environment.DATABASE_URL) {
      context.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: "DATABASE_URL is required in production",
      });
    }
    if (!environment.AUTH_SECRET) {
      context.addIssue({
        code: "custom",
        path: ["AUTH_SECRET"],
        message: "AUTH_SECRET is required in production",
      });
    }
  });

const parsedEnvironment = serverEnvironmentSchema.safeParse({
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NODE_ENV: process.env.NODE_ENV ?? "development",
});

if (!parsedEnvironment.success) {
  console.error("Invalid server environment configuration.");
  throw new Error("Invalid server environment configuration");
}

export const env = parsedEnvironment.data;
