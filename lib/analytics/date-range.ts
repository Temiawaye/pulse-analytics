export type DateRangeKey = "24h" | "7d" | "30d";

export function resolveDateRange(value: string | undefined, now = new Date()) {
  const key: DateRangeKey = value === "24h" || value === "30d" ? value : "7d";
  const duration =
    key === "24h"
      ? 24 * 60 * 60_000
      : key === "7d"
        ? 7 * 24 * 60 * 60_000
        : 30 * 24 * 60 * 60_000;
  return { key, from: new Date(now.getTime() - duration), to: now };
}
