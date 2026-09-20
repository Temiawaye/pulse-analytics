import { config } from "dotenv";

config({ path: ".env.local", override: true, quiet: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const TRACKING_ID = "site_demo_pulse_analytics";

async function main() {
  await prisma.website.deleteMany({
    where: { trackingId: TRACKING_ID },
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@pulse.local" },
    update: { name: "Demo User" },
    create: {
      email: "demo@pulse.local",
      name: "Demo User",
    },
  });

  const now = new Date();
  const minutesAgo = (minutes: number) =>
    new Date(now.getTime() - minutes * 60_000);

  await prisma.website.create({
    data: {
      userId: user.id,
      name: "Demo Portfolio",
      domain: "portfolio.example.com",
      trackingId: TRACKING_ID,
      visitors: {
        create: [
          {
            anonymousId: "visitor_demo_alpha",
            firstSeenAt: minutesAgo(220),
            lastSeenAt: minutesAgo(205),
            sessions: {
              create: {
                browser: "Chrome",
                device: "Desktop",
                referrer: "https://www.google.com",
                startedAt: minutesAgo(220),
                lastActivityAt: minutesAgo(205),
                pageViews: {
                  create: [
                    {
                      path: "/",
                      title: "Home",
                      referrer: "https://www.google.com",
                      createdAt: minutesAgo(220),
                    },
                    {
                      path: "/projects",
                      title: "Projects",
                      referrer: "https://portfolio.example.com/",
                      createdAt: minutesAgo(212),
                    },
                    {
                      path: "/about",
                      title: "About",
                      referrer: "https://portfolio.example.com/projects",
                      createdAt: minutesAgo(205),
                    },
                  ],
                },
              },
            },
          },
          {
            anonymousId: "visitor_demo_beta",
            firstSeenAt: minutesAgo(95),
            lastSeenAt: minutesAgo(95),
            sessions: {
              create: {
                browser: "Safari",
                device: "Mobile",
                startedAt: minutesAgo(95),
                lastActivityAt: minutesAgo(95),
                pageViews: {
                  create: {
                    path: "/projects",
                    title: "Projects",
                    createdAt: minutesAgo(95),
                  },
                },
              },
            },
          },
          {
            anonymousId: "visitor_demo_gamma",
            firstSeenAt: minutesAgo(12),
            lastSeenAt: minutesAgo(4),
            sessions: {
              create: {
                browser: "Firefox",
                device: "Desktop",
                referrer: "https://github.com",
                startedAt: minutesAgo(12),
                lastActivityAt: minutesAgo(4),
                pageViews: {
                  create: [
                    {
                      path: "/",
                      title: "Home",
                      referrer: "https://github.com",
                      createdAt: minutesAgo(12),
                    },
                    {
                      path: "/contact",
                      title: "Contact",
                      referrer: "https://portfolio.example.com/",
                      createdAt: minutesAgo(4),
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
  });

  const website = await prisma.website.findUniqueOrThrow({
    where: { trackingId: TRACKING_ID },
    include: {
      _count: {
        select: { pageViews: true, sessions: true, visitors: true },
      },
    },
  });

  console.info(
    `Seeded ${website.name}: ${website._count.visitors} visitors, ` +
      `${website._count.sessions} sessions, ${website._count.pageViews} page views.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
