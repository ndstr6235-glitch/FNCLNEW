"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/crm/utils";

export interface OriginTab {
  /** "all", "system" or the id of the person who added the contacts */
  key: string;
  label: string;
  count: number;
}

/** Who the contacts came from — one click narrows the list to that origin. */
export default function OriginTabs({ tabs }: { tabs: OriginTab[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("origin") ?? "all";

  const href = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "all") params.delete("origin");
    else params.set("origin", key);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-text-dim">Kdo kontakt přidal:</span>
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={href(t.key)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 border text-xs font-medium transition-colors",
            current === t.key
              ? "border-brass bg-brass text-white"
              : "border-border bg-surface text-text-mid hover:bg-surface-hover"
          )}
        >
          {t.label}
          <span className={cn("font-semibold", current === t.key ? "text-white" : "text-text")}>
            {t.count.toLocaleString("cs-CZ")}
          </span>
        </Link>
      ))}
    </div>
  );
}
