"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { cn } from "@/lib/crm/utils";
import type { BrokerContactStats, DatabasePeriod } from "@/lib/crm/database-stats";
import { Big, PERIODS, Small, num } from "./database-overview";

/** Broker's view of the contact database: what they were given and what is still waiting. */
export default function MyContactsOverview({ stats }: { stats: BrokerContactStats }) {
  const [period, setPeriod] = useState<DatabasePeriod>("week");
  const p = stats.periods[period];

  return (
    <div className=" border border-border bg-surface p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-9 h-9 bg-sapphire-pale text-sapphire">
            <Database size={18} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-text">Moje kontakty</h3>
            <p className="text-[11px] text-text-dim">
              Otevřený kontakt = poprvé jste mu volali nebo psali
            </p>
          </div>
        </div>
        <div className="flex border border-border self-start sm:self-auto">
          {PERIODS.map((o) => (
            <button
              key={o.key}
              onClick={() => setPeriod(o.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                period === o.key
                  ? "bg-brass text-white"
                  : "text-text-mid hover:bg-surface-hover"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Big label="Přiděleno mi" value={num(p.assigned)} />
        <Big label="Otevřel jsem" value={num(p.opened)} />
        <Big label="Moje vlastní kontakty" value={num(p.own)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Small label="Mám celkem" value={num(stats.total)} />
        <Small label="Čeká na první hovor" value={num(stats.waiting)} />
      </div>

      {stats.waiting > 0 && (
        <Link
          href="/clients?outcome=none"
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-sm font-semibold text-text hover:bg-surface-hover"
        >
          Zobrazit kontakty, které čekají <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
