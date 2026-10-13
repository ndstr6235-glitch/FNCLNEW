"use client";

import { useState } from "react";
import { Database } from "lucide-react";
import { cn } from "@/lib/crm/utils";
import type { DatabasePeriod, DatabaseStats } from "@/lib/crm/database-stats";

const PERIODS: { key: DatabasePeriod; label: string }[] = [
  { key: "today", label: "Dnes" },
  { key: "week", label: "7 dní" },
  { key: "month", label: "30 dní" },
  { key: "all", label: "Celkem" },
];

const num = (n: number) => n.toLocaleString("cs-CZ");
const pct = (part: number, whole: number) =>
  whole > 0 ? `${((part / whole) * 100).toLocaleString("cs-CZ", { maximumFractionDigits: 1 })} %` : "—";

export default function DatabaseOverview({ stats }: { stats: DatabaseStats }) {
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
            <h3 className="text-sm font-semibold text-text">Databáze kontaktů</h3>
            <p className="text-[11px] text-text-dim">
              Naše databáze bez vlastních kontaktů makléřů · otevřený = poprvé se mu volalo nebo psalo
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

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Big label="Přidáno do databáze" value={num(p.added)} />
        <Big label="Rozdáno makléřům" value={num(p.assigned)} />
        <Big label="Otevřeno z databáze" value={num(p.opened)} />
        <Big label="Vlastní kontakty makléřů" value={num(p.own)} />
      </div>

      {p.ownBy.length > 0 && (
        <p className="mt-2 text-[11px] text-text-dim">
          Vlastní kontakty přidali:{" "}
          {p.ownBy.map((b, i) => (
            <span key={b.name}>
              {i > 0 && ", "}
              {b.name} <span className="font-medium text-text-mid">{num(b.count)}</span>
            </span>
          ))}
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Small label="V databázi celkem" value={num(stats.total)} />
        <Small
          label="Otevřeno z databáze celkem"
          value={`${num(stats.opened)} (${pct(stats.opened, stats.total)})`}
        />
        <Small label="U makléřů, neotevřeno" value={num(stats.waitingAtBrokers)} />
        <Small label="V poolu, nerozdáno" value={num(stats.inPool)} />
      </div>

      {stats.bySource.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-text-dim">
                <th className="py-1.5 font-medium">Zdroj</th>
                <th className="py-1.5 font-medium text-right">Kontaktů</th>
                <th className="py-1.5 font-medium text-right">Otevřeno</th>
                <th className="py-1.5 font-medium text-right">Podíl</th>
                <th className="py-1.5 font-medium text-right">Zbývá</th>
              </tr>
            </thead>
            <tbody>
              {stats.bySource.map((s) => (
                <tr key={s.source} className="border-t border-border text-text-mid">
                  <td className="py-1.5 pr-3 max-w-[220px] truncate">{s.source}</td>
                  <td className="py-1.5 text-right font-medium text-text">{num(s.total)}</td>
                  <td className="py-1.5 text-right">{num(s.opened)}</td>
                  <td className="py-1.5 text-right">{pct(s.opened, s.total)}</td>
                  <td className="py-1.5 text-right">{num(s.total - s.opened)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Big({ label, value }: { label: string; value: string }) {
  return (
    <div className=" bg-surface-hover p-3">
      <div className="text-[10px] uppercase tracking-wider text-text-dim">{label}</div>
      <div className="mt-1 font-display text-xl md:text-2xl font-bold text-text">{value}</div>
    </div>
  );
}

function Small({ label, value }: { label: string; value: string }) {
  return (
    <div className=" border border-border p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-text-dim">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-text">{value}</div>
    </div>
  );
}
