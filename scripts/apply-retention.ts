import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to apply data retention");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
const execute = process.argv.includes("--execute");
const now = new Date();
const analyticsCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60_000);
const rateLimitCutoff = new Date(now.getTime() - 24 * 60 * 60_000);

async function main() {
  if (!execute) {
    const [pageViews, sessions, rateLimits] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { lt: analyticsCutoff } } }),
      prisma.session.count({
        where: { lastActivityAt: { lt: analyticsCutoff } },
      }),
      prisma.ingestionRateLimit.count({
        where: { windowStart: { lt: rateLimitCutoff } },
      }),
    ]);
    console.info(
      `Dry run: ${pageViews} page views, ${sessions} sessions, and ` +
        `${rateLimits} rate-limit windows are eligible.`,
    );
    console.info("Run with --execute to permanently delete eligible records.");
    return;
  }

  const result = await prisma.$transaction(async (transaction) => {
    const pageViews = await transaction.pageView.deleteMany({
      where: { createdAt: { lt: analyticsCutoff } },
    });
    const sessions = await transaction.session.deleteMany({
      where: { lastActivityAt: { lt: analyticsCutoff } },
    });
    const visitors = await transaction.visitor.deleteMany({
      where: { pageViews: { none: {} }, sessions: { none: {} } },
    });
    const rateLimits = await transaction.ingestionRateLimit.deleteMany({
      where: { windowStart: { lt: rateLimitCutoff } },
    });
    return {
      pageViews: pageViews.count,
      sessions: sessions.count,
      visitors: visitors.count,
      rateLimits: rateLimits.count,
    };
  });

  console.info(
    `Deleted ${result.pageViews} page views, ${result.sessions} sessions, ` +
      `${result.visitors} orphan visitors, and ${result.rateLimits} ` +
      "rate-limit windows.",
  );
}

main()
  .catch(() => {
    console.error("Data-retention job failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
