"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function DateRangeSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  return (
    <label className="text-sm font-medium text-slate-700">
      <span className="sr-only">Date range</span>
      <select
        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        value={search.get("range") ?? "7d"}
        onChange={(event) => {
          const params = new URLSearchParams(search);
          params.set("range", event.target.value);
          router.push(`${pathname}?${params}`);
        }}
      >
        <option value="24h">Last 24 hours</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
    </label>
  );
}
