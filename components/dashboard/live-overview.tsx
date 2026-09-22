"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  AnalyticsActivity,
  type AnalyticsActivityItem,
} from "@/components/dashboard/analytics-activity";
import { MetricCard } from "@/components/dashboard/metric-card";

interface Summary {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number | null;
  averageSessionDuration: number | null;
}

interface LiveOverviewProps {
  websiteId: string;
  range: string;
  initialSummary: Summary;
  initialRecent: AnalyticsActivityItem[];
  initialRefreshedAt: string;
}

export function LiveOverview({
  websiteId,
  range,
  initialSummary,
  initialRecent,
  initialRefreshedAt,
}: LiveOverviewProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [recent, setRecent] = useState(initialRecent);
  const [refreshedAt, setRefreshedAt] = useState(initialRefreshedAt);
  const [status, setStatus] = useState<"idle" | "refreshing" | "error">("idle");
  const requestRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (document.hidden || requestRef.current) return;

    const controller = new AbortController();
    requestRef.current = controller;
    setStatus("refreshing");

    try {
      const params = new URLSearchParams({ website: websiteId, range });
      const response = await fetch(`/api/analytics/overview?${params}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Refresh failed");

      const data = (await response.json()) as {
        summary: Summary;
        recent: AnalyticsActivityItem[];
        refreshedAt: string;
      };
      setSummary(data.summary);
      setRecent(data.recent);
      setRefreshedAt(data.refreshedAt);
      setStatus("idle");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setStatus("error");
      }
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, [range, websiteId]);

  useEffect(() => {
    const interval = window.setInterval(() => void refresh(), 30_000);
    const refreshWhenVisible = () => {
      if (!document.hidden) void refresh();
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      requestRef.current?.abort();
    };
  }, [refresh]);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <p
          className="text-xs text-slate-500"
          aria-live="polite"
          suppressHydrationWarning
        >
          {status === "error"
            ? "Refresh failed - showing the last successful data."
            : `Last refreshed ${new Date(refreshedAt).toLocaleTimeString()}`}
        </p>
        <button
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          type="button"
          disabled={status === "refreshing"}
          onClick={() => void refresh()}
        >
          {status === "refreshing" ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Page views"
          value={summary.pageViews.toLocaleString()}
          hint="Accepted page-view events"
        />
        <MetricCard
          label="Unique visitors"
          value={summary.uniqueVisitors.toLocaleString()}
          hint="Distinct anonymous visitors"
        />
        <MetricCard
          label="Bounce rate"
          value={
            summary.bounceRate === null
              ? "Not available"
              : `${summary.bounceRate.toFixed(1)}%`
          }
          hint="Completed one-page sessions"
        />
        <MetricCard
          label="Average duration"
          value={formatDuration(summary.averageSessionDuration)}
          hint="Completed sessions"
        />
      </div>
      <AnalyticsActivity pageViews={summary.pageViews} recent={recent} />
    </>
  );
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return "Not available";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}
