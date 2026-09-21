"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
export function WebsiteSelector({
  websites,
  defaultId,
}: {
  websites: { id: string; name: string }[];
  defaultId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const selected = search.get("website") ?? defaultId ?? "";
  return (
    <Select
      className="w-48"
      label="Website"
      value={selected}
      onValueChange={(value) => {
        const params = new URLSearchParams(search);
        params.set("website", value);
        router.push(`${pathname}?${params}`);
      }}
      disabled={!websites.length}
      options={
        websites.length
          ? websites.map((site) => ({
              value: site.id,
              label: site.name,
              marker: site.name,
            }))
          : [{ value: "", label: "No websites" }]
      }
    />
  );
}
