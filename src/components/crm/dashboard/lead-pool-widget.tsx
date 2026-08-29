"use client";

import { useState, useTransition } from "react";
import { Users, Loader2, Zap, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/crm/ui/toast";
import { triggerDistributionManual } from "@/app/actions/crm/distribute-leads";
import type { PoolStats } from "@/lib/crm/pool-stats";

interface Props {
  stats: PoolStats;
  isAdmin: boolean;
}

export default function LeadPoolWidget({ stats, isAdmin }: Props) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string | null>(null);

  const low = stats.totalDailyDemand > 0 && stats.daysOfSupply < 5;

  function handleDistribute() {
    startTransition(async () => {
      const res = await triggerDistributionManual();
      if (res.success) {
        toast(
          `Přiřazeno ${res.result.totalAssigned} leadů (zbývá ${res.result.poolRemainingAfter})`
        );
        setLastResult(
          `${res.result.totalAssigned} přiřazeno · zbývá ${res.result.poolRemainingAfter}`
        );
        // Refresh server data so dashboard counts update
        if (typeof window !== "undefined") window.location.reload();
      } else {
        toast(res.error, "error");
      }
    });
  }

  return (
    <div className=" border border-border bg-surface p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 bg-sapphire-pale text-sapphire">
            <Users size={18} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-text">Pool leadů</h3>
            <p className="text-[11px] text-text-dim">
              Nepřiřazení klienti čekající na rozhazovač
            </p>
          </div>
        </div>
        {low && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ruby bg-ruby-pale border border-ruby-border rounded-full px-2 py-0.5">
            <AlertTriangle size={10} /> Dochází
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="V poolu" value={stats.poolSize.toLocaleString("cs-CZ")} />
        <Stat
          label="Denně"
          value={
            stats.totalDailyDemand > 0
              ? `${stats.totalDailyDemand} (${stats.activeBrokers} brokerů)`
              : "—"
          }
        />
        <Stat
          label="Vystačí"
          value={
            stats.totalDailyDemand > 0 ? `${stats.daysOfSupply} dní` : "∞"
          }
        />
      </div>

      {stats.bySource.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {stats.bySource.map((s) => (
            <li
              key={s.source}
              className="flex justify-between text-xs text-text-mid"
            >
              <span className="truncate">{s.source}</span>
              <span className="font-medium text-text">
                {s.count.toLocaleString("cs-CZ")}
              </span>
            </li>
          ))}
        </ul>
      )}

      {isAdmin && (
        <button
          onClick={handleDistribute}
          disabled={pending || stats.activeBrokers === 0}
          className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brass text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          {pending ? "Distribuuji…" : "Distribuovat teď"}
        </button>
      )}

      {lastResult && (
        <p className="mt-2 text-[11px] text-emerald text-center">{lastResult}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className=" bg-surface-hover p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-text-dim">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-text">{value}</div>
    </div>
  );
}
