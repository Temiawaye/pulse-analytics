import "server-only";

import { z } from "zod";

const serverEnvironmentSchema = z.object({
  APP_URL: z.url().default("http://localhost:3000"),
});

const parsedEnvironment = serverEnvironmentSchema.safeParse({
  APP_URL: process.env.APP_URL,
});

if (!parsedEnvironment.success) {
  console.error("Invalid server environment configuration.");
  throw new Error("Invalid server environment configuration");
}

export const env = parsedEnvironment.data;
