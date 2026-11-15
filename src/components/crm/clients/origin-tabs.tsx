"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Cpu, Users } from "lucide-react";
import { cn } from "@/lib/crm/utils";
import { isSystemOrigin, originColor, originInitials } from "@/lib/crm/origin-color";

export interface OriginTab {
  /** "all", "system" or the id of the person who added the contacts */
  key: string;
  label: string;
  count: number;
}

const ALL = { solid: "#A9884E", pale: "#F6F0E4" }; // brass

/** Who the contacts came from — one click narrows the list to that origin. */
export default function OriginTabs({ tabs }: { tabs: OriginTab[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("origin") ?? "all";
  const total = tabs.find((t) => t.key === "all")?.count ?? 0;

  const href = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "all") params.delete("origin");
    else params.set("origin", key);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-[1.5px] font-bold text-text-dim">
        Kdo kontakt přidal
      </div>
      <div className="flex flex-wrap gap-2.5">
        {tabs.map((t) => {
          const active = current === t.key;
          const isAll = t.key === "all";
          const system = !isAll && (t.key === "system" || isSystemOrigin(t.label));
          const c = isAll ? ALL : originColor(t.label);
          const share = !isAll && total > 0 ? Math.round((t.count / total) * 100) : null;

          return (
            <Link
              key={t.key}
              href={href(t.key)}
              className={cn(
                "group relative flex items-center gap-3 pl-2.5 pr-4 py-2 min-w-[150px] border transition-all overflow-hidden",
                active ? "shadow-sm" : "bg-surface border-border hover:-translate-y-px hover:shadow-sm"
              )}
              style={
                active
                  ? { backgroundColor: c.solid, borderColor: c.solid }
                  : { borderLeft: `3px solid ${c.solid}` }
              }
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={
                  active
                    ? { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }
                    : { backgroundColor: c.pale, color: c.solid }
                }
              >
                {isAll ? <Users size={15} /> : system ? <Cpu size={15} /> : originInitials(t.label)}
              </span>
              <span className="flex flex-col leading-tight min-w-0">
                <span
                  className={cn("text-[12px] font-medium truncate", active ? "text-white/85" : "text-text-mid")}
                >
                  {t.label}
                </span>
                <span className="flex items-baseline gap-1.5">
                  <span className={cn("text-base font-bold", active ? "text-white" : "text-text")}>
                    {t.count.toLocaleString("cs-CZ")}
                  </span>
                  {share !== null && (
                    <span className={cn("text-[11px]", active ? "text-white/70" : "text-text-dim")}>
                      {share} %
                    </span>
                  )}
                </span>
              </span>
              {share !== null && (
                <span
                  className="absolute left-0 bottom-0 h-[2px]"
                  style={{
                    width: `${share}%`,
                    backgroundColor: active ? "rgba(255,255,255,0.5)" : c.solid,
                    opacity: active ? 1 : 0.35,
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
