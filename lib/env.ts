import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  APP_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z.url().optional(),
});

const parsedEnvironment = serverEnvironmentSchema.safeParse({
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
});

if (!parsedEnvironment.success) {
  console.error("Invalid server environment configuration.");
  throw new Error("Invalid server environment configuration");
}

export const env = parsedEnvironment.data;
