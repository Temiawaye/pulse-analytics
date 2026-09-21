"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

export function DateRangeSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  return (
    <Select
      className="w-44"
      label="Date range"
      value={search.get("range") ?? "7d"}
      onValueChange={(value) => {
        const params = new URLSearchParams(search);
        params.set("range", value);
        router.push(`${pathname}?${params}`);
      }}
      options={[
        { value: "24h", label: "Last 24 hours", marker: "24" },
        { value: "7d", label: "Last 7 days", marker: "7" },
        { value: "30d", label: "Last 30 days", marker: "30" },
      ]}
    />
  );
}
