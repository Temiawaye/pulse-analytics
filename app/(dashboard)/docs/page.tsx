import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/docs/code-block";
import { DocsNav } from "@/components/docs/docs-nav";
import { VerifyConnection } from "@/components/docs/verify-connection";
import {
  resolveDashboardScope,
  type DashboardSearchParams,
} from "@/lib/analytics/dashboard-scope";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db/client";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Connect Your Website",
  description: "Install Pulse Analytics and verify your first page view.",
};

export default async function DocsPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const user = await requireUser();
  const context = await resolveDashboardScope(user.id, await searchParams);
  const website = context?.website;
  const websiteName = website?.name ?? "your website";
  const websiteDomain = website?.domain ?? "example.com";
  const trackingId = website?.trackingId ?? "site_your_tracking_id";
  const lastEvent = website
    ? await db.pageView.findFirst({
        where: { websiteId: website.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      })
    : null;
  const trackerUrl = `${env.APP_URL}/tracker.js`;
  const endpoint = `${env.APP_URL}/api/track`;
  const snippet = `<script\n  defer\n  data-website-id="${trackingId}"\n  src="${trackerUrl}"\n></script>`;
  const nextSnippet = `import Script from "next/script";\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n      <Script\n        src="${trackerUrl}"\n        data-website-id="${trackingId}"\n        strategy="afterInteractive"\n      />\n    </html>\n  );\n}`;
  const reactSnippet = `import { useEffect } from "react";\n\nexport function PulseAnalytics() {\n  useEffect(() => {\n    const script = document.createElement("script");\n    script.src = "${trackerUrl}";\n    script.dataset.websiteId = "${trackingId}";\n    script.defer = true;\n    document.head.appendChild(script);\n    return () => script.remove();\n  }, []);\n\n  return null;\n}`;
  const payload = JSON.stringify(
    {
      trackingId,
      event: "page_view",
      path: "/pricing",
      title: "Pricing",
      referrer: "https://www.google.com/search",
      anonymousId: "70dc60b7d1aa4be189d1f6299344038f",
      timestamp: "2026-09-21T12:00:00.000Z",
    },
    null,
    2,
  );

  return (
    <div className="scroll-smooth lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
      <aside className="mb-8 lg:sticky lg:top-6 lg:mb-0 lg:self-start">
        <DocsNav />
      </aside>
      <article className="min-w-0 max-w-4xl">
        <header
          id="getting-started"
          className="scroll-mt-6 border-b border-slate-200 pb-10"
        >
          <span className="eyebrow">Integration guide</span>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Connect Your Website
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Add one lightweight script to {websiteName}. It records page views
            and sends them to Pulse Analytics so you can see traffic in your
            dashboard.
          </p>
          <Flow
            items={[
              "Your website",
              "Tracking script",
              "Analytics API",
              "Dashboard",
            ]}
          />
          {!website && (
            <Callout kind="tip" title="Explore first, personalize when ready">
              This guide uses labeled example values until you create a website.
              Then Pulse will show a real tracking ID, a ready-to-paste snippet,
              and live connection verification.{" "}
              <Link
                className="font-semibold underline underline-offset-4"
                href="/websites"
              >
                Create a website
              </Link>
            </Callout>
          )}
        </header>

        <Section
          id="connect"
          eyebrow="Before you start"
          title="Everything you need"
        >
          <p>
            {website
              ? "You already have a website selected, so the safe public values below are ready to copy."
              : "These are clearly labeled examples. Pulse replaces them with your safe public values after you create a website."}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Detail
              label={website ? "Website" : "Website example"}
              value={websiteName}
            />
            <Detail
              label={website ? "Registered domain" : "Domain placeholder"}
              value={websiteDomain}
            />
            <Detail label="Public tracking ID" value={trackingId} mono />
            <Detail label="Event endpoint" value={endpoint} mono />
          </div>
          <Callout kind="note" title="You also need source-code access">
            You must be able to edit the HTML or application layout of{" "}
            {websiteDomain}. The public tracking ID is designed for browser use;
            no API key or dashboard session is added to the tracked site.
          </Callout>
        </Section>

        <Section
          id="install"
          eyebrow="Quick start"
          title="Install in two steps"
        >
          <Step number="1" title="Add or select your website">
            {website ? (
              <>
                {websiteName} is registered with the exact host{" "}
                <code>{websiteDomain}</code>. To use another host, select it
                above or{" "}
              </>
            ) : (
              <>
                Register the exact hostname that will send events, such as{" "}
                <code>{websiteDomain}</code>.{" "}
              </>
            )}
            <Link
              href="/websites"
              className="font-medium text-emerald-700 underline underline-offset-4"
            >
              add it in Settings
            </Link>
            . Pulse uses the public ID <code>{trackingId}</code>, not the
            internal database ID.
          </Step>
          <Step number="2" title="Copy the tracking code">
            Paste this tag into every page, preferably near the end of{" "}
            <code>&lt;head&gt;</code>. It loads with <code>defer</code>, so it
            does not block HTML parsing.
            <div className="mt-4">
              <CodeBlock code={snippet} label="HTML" />
            </div>
          </Step>
          <Callout kind="tip" title="Single-page apps are covered">
            The tracker records the initial view and detects History API
            navigation through <code>pushState</code>, <code>replaceState</code>
            , and back/forward navigation.
          </Callout>
        </Section>

        <Section
          id="frameworks"
          eyebrow="Framework guides"
          title="Add Pulse to your stack"
        >
          <Example
            title="HTML"
            description="Place the generated tag before the closing head tag so it is available on every page."
            code={`<head>\n  <!-- Your existing tags -->\n  ${snippet.replaceAll("\n", "\n  ")}\n</head>`}
            label="index.html"
          />
          <Example
            title="Next.js App Router"
            description="Add next/script to the root layout. afterInteractive runs the tracker in the browser after hydration."
            code={nextSnippet}
            label="app/layout.tsx"
          />
          <Example
            title="React"
            description="Mount this component once near the root of your app. The effect appends the same dependency-free tracker."
            code={reactSnippet}
            label="PulseAnalytics.jsx"
          />
        </Section>

        <Section
          id="events"
          eyebrow="Sending events"
          title="How analytics data travels"
        >
          <ol className="space-y-3">
            {[
              "A visitor opens a page on your external website.",
              "tracker.js loads and creates a website-scoped anonymous ID in first-party local storage.",
              "It creates a page_view event and sends it to POST /api/track.",
              `Pulse checks the payload, rate limit, tracking ID, and exact Origin against ${websiteDomain}.`,
              "The server sanitizes the path, title, and referrer, derives browser and device from the request, then stores the visitor, session, and page view.",
              "The dashboard reads those records and refreshes its metrics and recent activity.",
            ].map((item, index) => (
              <li
                className="flex gap-3 text-sm leading-6 text-slate-700"
                key={item}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <Flow
            vertical
            items={[
              "Visitor",
              "External website",
              "Tracking script",
              "Analytics API",
              "Database",
              "Analytics dashboard",
            ]}
          />
          <h3 className="mt-8 text-lg font-semibold text-slate-950">
            Page-view payload
          </h3>
          <p className="mb-4 mt-2">
            This is the complete accepted client payload. <code>title</code>,{" "}
            <code>referrer</code>, and <code>timestamp</code> are optional. The
            tracker creates the anonymous ID automatically.
          </p>
          <CodeBlock code={payload} label="JSON" />
          <Callout kind="note" title="Privacy and sanitization">
            Query strings and fragments are removed from paths and referrers.
            Device and browser are derived server-side; the event body cannot
            override them.
          </Callout>
        </Section>

        <Section
          id="custom-events"
          eyebrow="Custom events"
          title="Page views only for now"
        >
          <Callout kind="warning" title="Custom events are not supported">
            The current API accepts only{" "}
            <code>event: &quot;page_view&quot;</code>. Button clicks, sign-ups,
            purchases, downloads, and form submissions are outside the current
            product scope and should not be sent to this endpoint.
          </Callout>
        </Section>

        <Section
          id="verify"
          eyebrow="Verify connection"
          title="Confirm the first event"
        >
          <p>
            {website ? (
              <>
                Open <strong>{websiteDomain}</strong> in another tab, visit one
                or two pages, then run this check. It queries stored page views
                for this selected website; it does not simulate a success
                response.
              </>
            ) : (
              "Live verification becomes available after you create a website and install its personalized tracking snippet."
            )}
          </p>
          {lastEvent && (
            <p className="mt-3 text-sm text-slate-600">
              Latest stored page view: {lastEvent.createdAt.toLocaleString()}
            </p>
          )}
          {website ? (
            <VerifyConnection websiteId={website.id} />
          ) : (
            <Link
              className="button-primary mt-5 inline-flex text-sm"
              href="/websites"
            >
              Create a website to verify
            </Link>
          )}
          <h3 className="mt-8 text-lg font-semibold">Real-time verification</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
            <li>Open the connected website in another browser tab.</li>
            <li>Navigate between a few routes.</li>
            <li>
              Return to{" "}
              <Link
                className="font-medium text-emerald-700 underline underline-offset-4"
                href={website ? `/overview?website=${website.id}` : "/overview"}
              >
                Overview
              </Link>
              .
            </li>
            <li>
              Watch Recent activity; the dashboard refreshes visible data about
              every 30 seconds.
            </li>
          </ol>
        </Section>

        <Section
          id="troubleshooting"
          eyebrow="Troubleshooting"
          title="Common integration problems"
        >
          <Trouble title="No events are appearing">
            Confirm the copied ID is <code>{trackingId}</code>. In browser
            DevTools, check that <code>{trackerUrl}</code> loads and that the
            Network request to <code>/api/track</code> returns <code>202</code>.
            Also confirm the tag is not marked{" "}
            <code>data-disabled=&quot;true&quot;</code>.
          </Trouble>
          <Trouble title="401 / 403 errors">
            The ingestion endpoint does not use login authentication and does
            not normally return 401. A 403 means the browser sent no Origin
            header or its exact host, including a non-default port, does not
            match <code>{websiteDomain}</code>. Update the domain in Settings
            when the site moves.
          </Trouble>
          <Trouble title="CORS errors">
            Pulse echoes the validated website origin after checking it against
            the registered domain. There is no static allowlist. Check the 403
            response first, then confirm that the page host and saved domain are
            identical.
          </Trouble>
          <Trouble title="Incorrect website ID">
            Copy the public tracking ID from this page or Settings. A missing or
            unknown ID is rejected; never use the internal website value from
            the dashboard URL.
          </Trouble>
          <Trouble title="Local development">
            The tracker intentionally ignores localhost, 127.0.0.1, ::1, and
            *.localhost. To collect local traffic, add{" "}
            <code>data-track-localhost=&quot;true&quot;</code> and register the
            exact local host and port as a separate website.
          </Trouble>
          <Trouble title="Other response codes">
            <code>400</code> means the JSON or fields are invalid,{" "}
            <code>404</code> means the tracking ID is unknown, <code>413</code>{" "}
            means the payload exceeds 8 KB, <code>415</code> means the content
            type is unsupported, <code>429</code> means the request was
            rate-limited, and <code>503</code> means storage temporarily failed.
          </Trouble>
        </Section>
      </article>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 border-b border-slate-200 py-10 last:border-0"
    >
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}
function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 break-all text-sm font-medium text-slate-950 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mb-7 pl-12">
      <span className="absolute left-0 top-0 grid size-8 place-items-center rounded-full bg-emerald-700 font-bold text-white">
        {number}
      </span>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}
function Example({
  title,
  description,
  code,
  label,
}: {
  title: string;
  description: string;
  code: string;
  label: string;
}) {
  return (
    <div className="mb-8 last:mb-0">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mb-4 mt-1">{description}</p>
      <CodeBlock code={code} label={label} />
    </div>
  );
}
function Callout({
  kind,
  title,
  children,
}: {
  kind: "note" | "tip" | "warning";
  title: string;
  children: React.ReactNode;
}) {
  const styles =
    kind === "warning"
      ? "border-amber-300 bg-amber-50 text-amber-950"
      : kind === "tip"
        ? "border-emerald-300 bg-emerald-50 text-emerald-950"
        : "border-sky-300 bg-sky-50 text-sky-950";
  return (
    <aside className={`mt-6 rounded-xl border-l-4 p-4 ${styles}`}>
      <p className="font-semibold">{title}</p>
      <div className="mt-1 text-sm leading-6 opacity-90">{children}</div>
    </aside>
  );
}
function Trouble({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-slate-200 py-4 first:pt-0">
      <summary className="cursor-pointer list-none font-semibold text-slate-950 marker:hidden">
        <span className="flex items-center justify-between gap-4">
          {title}
          <span
            aria-hidden="true"
            className="text-xl text-slate-400 group-open:rotate-45"
          >
            +
          </span>
        </span>
      </summary>
      <div className="mt-3 pr-8 text-sm leading-6 text-slate-600">
        {children}
      </div>
    </details>
  );
}
function Flow({
  items,
  vertical = false,
}: {
  items: string[];
  vertical?: boolean;
}) {
  return (
    <div
      className={`mt-7 rounded-2xl border border-slate-200 bg-white p-4 ${vertical ? "mx-auto max-w-sm" : "overflow-x-auto"}`}
      aria-label={items.join(" to ")}
    >
      <div
        className={
          vertical
            ? "flex flex-col items-center"
            : "flex min-w-max items-center justify-center"
        }
      >
        {items.map((item, index) => (
          <div
            className={vertical ? "contents" : "flex items-center"}
            key={item}
          >
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-800 sm:text-sm">
              {item}
            </span>
            {index < items.length - 1 && (
              <span
                aria-hidden="true"
                className={
                  vertical ? "py-1 text-emerald-700" : "px-2 text-emerald-700"
                }
              >
                {vertical ? "↓" : "→"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
