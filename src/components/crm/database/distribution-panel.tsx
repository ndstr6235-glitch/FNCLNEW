"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, History, Loader2, Send, Shuffle, Zap } from "lucide-react";
import { useToast } from "@/components/crm/ui/toast";
import { triggerDistributionManual } from "@/app/actions/crm/distribute-leads";
import {
  assignLeadsManually,
  setUserLeadSources,
  type DistributionPlan,
} from "@/app/actions/crm/distribution-plan";
import { cn } from "@/lib/crm/utils";

const ANY = "__any__";
const label = (s: string) => s || "(bez zdroje)";
const fmtDate = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        timeZone: "Europe/Prague",
      })
    : "—";

/** Admin picks which lead database each broker/operator draws from; shows who got what. */
export default function DistributionPanel({ plan, isAdmin }: { plan: DistributionPlan; isAdmin: boolean }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  // Manual hand-out: who, from which database, how many
  const [mUser, setMUser] = useState("");
  const [mSource, setMSource] = useState(ANY);
  const [mCount, setMCount] = useState("50");

  const poolCount = new Map(plan.poolSources.map((s) => [s.source, s.count]));
  const totalPool = plan.poolSources.reduce((s, p) => s + p.count, 0);

  // Every database in the pool now, plus any someone is set to
  const allSources = useMemo(() => {
    const set = new Set<string>(plan.poolSources.map((s) => s.source));
    for (const p of plan.people) p.sources.forEach((s) => set.add(s));
    return [...set];
  }, [plan]);

  const historyByPerson = useMemo(() => {
    const m = new Map<string, { userId: string; name: string; rows: DistributionPlan["history"]; total: number }>();
    for (const h of plan.history) {
      const e = m.get(h.userId) ?? { userId: h.userId, name: h.name, rows: [], total: 0 };
      e.rows.push(h);
      e.total += h.count;
      m.set(h.userId, e);
    }
    return m;
  }, [plan]);

  function changeSource(userId: string, value: string) {
    setSavingId(userId);
    startTransition(async () => {
      const res = await setUserLeadSources(userId, value === ANY ? [] : [value]);
      setSavingId(null);
      if (!res.success) toast(res.error || "Uložení se nepovedlo", "error");
      else {
        toast("Uloženo — rozdělování se tím bude řídit");
        router.refresh();
      }
    });
  }

  function assignNow() {
    startTransition(async () => {
      const res = await assignLeadsManually({
        userId: mUser,
        source: mSource === ANY ? null : mSource,
        count: Number(mCount),
      });
      if (!res.success) {
        toast(res.error || "Přidělení se nepovedlo", "error");
        return;
      }
      const who = plan.people.find((p) => p.id === mUser)?.name ?? "";
      toast(`Přiděleno ${res.assigned} leadů → ${who}`);
      router.refresh();
    });
  }

  function distributeNow() {
    startTransition(async () => {
      const res = await triggerDistributionManual();
      if (!res.success) {
        toast(res.error, "error");
        return;
      }
      toast(`Rozděleno ${res.result.totalAssigned} leadů (v poolu zbývá ${res.result.poolRemainingAfter})`);
      router.refresh();
    });
  }

  return (
    <div className="border border-border bg-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 lg:px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-9 h-9 bg-sapphire-pale text-sapphire">
            <Shuffle size={17} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-text">Rozdělování leadů</h2>
            <p className="text-[11px] text-text-dim">
              Komu systém dává leady z které databáze · automaticky každý den v 7:00 · v poolu{" "}
              {totalPool.toLocaleString("cs-CZ")}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={distributeNow}
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brass text-white text-sm font-semibold disabled:opacity-60"
          >
            {pending && !savingId ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            Rozdělit teď
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-text-dim border-b border-border">
              <th className="px-4 lg:px-5 py-2 font-semibold">Kdo</th>
              <th className="px-3 py-2 font-semibold text-right">Kvóta / den</th>
              <th className="px-3 py-2 font-semibold text-right">Čeká k provolání</th>
              <th className="px-3 py-2 font-semibold">Z které databáze</th>
              <th className="px-4 lg:px-5 py-2 font-semibold text-right">Dostal celkem</th>
            </tr>
          </thead>
          <tbody>
            {plan.people.map((p) => {
              const current = p.sources[0] ?? ANY;
              const received = historyByPerson.get(p.id)?.total ?? 0;
              const left = current === ANY ? totalPool : (poolCount.get(current) ?? 0);
              return (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 lg:px-5 py-2.5 whitespace-nowrap">
                    <span className="font-medium text-text">{p.name}</span>
                    <span
                      className={cn(
                        "ml-2 px-1.5 py-0.5 text-[10px] font-semibold",
                        p.role === "operator" ? "bg-emerald-pale text-emerald" : "bg-sapphire-pale text-sapphire"
                      )}
                    >
                      {p.role === "operator" ? "Operátor" : "Makléř"}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right whitespace-nowrap",
                      p.quota === 0 ? "text-ruby font-semibold" : "text-text"
                    )}
                  >
                    {p.quota === 0 ? "0 – nedostává" : p.quota}
                  </td>
                  <td className="px-3 py-2.5 text-right text-text-mid">{p.waiting}</td>
                  <td className="px-3 py-2.5">
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={current}
                          disabled={pending}
                          onChange={(e) => changeSource(p.id, e.target.value)}
                          className="min-w-[220px] px-2.5 py-2 border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30"
                        >
                          <option value={ANY}>Všechny databáze</option>
                          {allSources.map((s) => (
                            <option key={s} value={s}>
                              {label(s)} ({(poolCount.get(s) ?? 0).toLocaleString("cs-CZ")} v poolu)
                            </option>
                          ))}
                        </select>
                        {savingId === p.id && <Loader2 size={14} className="animate-spin text-text-dim" />}
                      </div>
                    ) : (
                      <span className="text-text">{current === ANY ? "Všechny databáze" : label(current)}</span>
                    )}
                    {left === 0 && p.quota > 0 && (
                      <div className="mt-1 text-[11px] text-ruby">V této databázi už nic nezbývá</div>
                    )}
                  </td>
                  <td className="px-4 lg:px-5 py-2.5 text-right font-semibold text-text">
                    {received.toLocaleString("cs-CZ")}
                  </td>
                </tr>
              );
            })}
            {plan.people.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-text-dim">
                  Žádní aktivní makléři ani operátoři.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdmin && plan.people.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-end gap-2.5 px-4 lg:px-5 py-4 border-t border-border bg-surface-hover">
          <div className="lg:w-40 shrink-0">
            <div className="text-xs font-semibold text-text">Přidělit ručně</div>
            <div className="text-[11px] text-text-dim">navíc k automatice</div>
          </div>
          <label className="flex-1 min-w-0">
            <span className="block text-[11px] text-text-mid mb-1">Komu</span>
            <select
              value={mUser}
              onChange={(e) => setMUser(e.target.value)}
              className="w-full px-2.5 py-2 border border-border bg-surface text-sm text-text"
            >
              <option value="">Vyberte…</option>
              {plan.people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role === "operator" ? "operátor" : "makléř"})
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1 min-w-0">
            <span className="block text-[11px] text-text-mid mb-1">Z které databáze</span>
            <select
              value={mSource}
              onChange={(e) => setMSource(e.target.value)}
              className="w-full px-2.5 py-2 border border-border bg-surface text-sm text-text"
            >
              <option value={ANY}>Všechny databáze</option>
              {plan.poolSources.map((s) => (
                <option key={s.source} value={s.source}>
                  {label(s.source)} ({s.count.toLocaleString("cs-CZ")} v poolu)
                </option>
              ))}
            </select>
          </label>
          <label className="lg:w-28">
            <span className="block text-[11px] text-text-mid mb-1">Kolik</span>
            <input
              type="number"
              min={1}
              max={2000}
              value={mCount}
              onChange={(e) => setMCount(e.target.value)}
              className="w-full px-2.5 py-2 border border-border bg-surface text-sm text-text"
            />
          </label>
          <button
            onClick={assignNow}
            disabled={pending || !mUser || !(Number(mCount) > 0)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-ink text-on-dark text-sm font-semibold disabled:opacity-50"
          >
            <Send size={14} /> Přidělit
          </button>
        </div>
      )}

      <button
        onClick={() => setShowHistory((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 lg:px-5 py-3 border-t border-border text-sm font-medium text-text-mid hover:bg-surface-hover"
      >
        <span className="inline-flex items-center gap-2">
          <History size={15} /> Historie — kdo dostal jaké leady
        </span>
        <ChevronDown size={16} className={cn("transition-transform", showHistory && "rotate-180")} />
      </button>
      {showHistory && (
        <div className="px-4 lg:px-5 pb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {historyByPerson.size === 0 && <p className="text-sm text-text-dim">Zatím nikdo nic nedostal.</p>}
          {[...historyByPerson.values()].map((h) => (
            <div key={h.userId} className="border border-border p-3">
              <div className="flex justify-between text-sm font-semibold text-text">
                <span>{h.name}</span>
                <span>{h.total.toLocaleString("cs-CZ")}</span>
              </div>
              <ul className="mt-2 space-y-1">
                {h.rows.map((r) => (
                  <li key={r.source} className="flex justify-between gap-2 text-xs text-text-mid">
                    <span className="truncate">{label(r.source)}</span>
                    <span className="shrink-0">
                      <b className="text-text">{r.count.toLocaleString("cs-CZ")}</b> · naposledy {fmtDate(r.lastAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
