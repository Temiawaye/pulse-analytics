"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
export function WebsiteSelector({
  websites,
}: {
  websites: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const selected = search.get("website") ?? "";
  return (
    <label className="text-sm font-medium text-slate-700">
      <span className="sr-only">Website</span>
      <select
        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        value={selected}
        onChange={(event) => {
          const params = new URLSearchParams(search);
          params.set("website", event.target.value);
          router.push(`${pathname}?${params}`);
        }}
        disabled={!websites.length}
      >
        <option value="">
          {websites.length ? "Select website" : "No websites"}
        </option>
        {websites.map((site) => (
          <option key={site.id} value={site.id}>
            {site.name}
          </option>
        ))}
      </select>
    </label>
  );
}
