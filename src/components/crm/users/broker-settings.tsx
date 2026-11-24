"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/crm/utils";
import { useToast } from "@/components/crm/ui/toast";
import { setUserQuota, toggleUserActive } from "@/app/actions/crm/users";
import { setUserLeadSources } from "@/app/actions/crm/distribution-plan";

interface Props {
  userId: string;
  quota: number;
  active: boolean;
  sources: string[];
  /** Databases still in the pool, with how many contacts are left */
  available: { source: string; count: number }[];
  canEdit: boolean;
}

export default function BrokerSettings({ userId, quota, active, sources, available, canEdit }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [quotaValue, setQuotaValue] = useState(String(quota));
  const [selected, setSelected] = useState<string[]>(sources);

  // Sources the broker is set to but that are already used up still show
  const options = [
    ...available,
    ...sources.filter((s) => !available.some((a) => a.source === s)).map((s) => ({ source: s, count: 0 })),
  ];

  const quotaDirty = String(quota) !== quotaValue;
  const sourcesDirty = [...selected].sort().join("|") !== [...sources].sort().join("|");

  function run(fn: () => Promise<{ success: boolean; error?: string }>, ok: string) {
    start(async () => {
      const res = await fn();
      if (res.success) {
        toast(ok, "success");
        router.refresh();
      } else toast(res.error || "Nepodařilo se uložit", "error");
    });
  }

  function toggle(source: string) {
    setSelected((cur) => (cur.includes(source) ? cur.filter((s) => s !== source) : [...cur, source]));
  }

  return (
    <div className="border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-text">Nastavení rozdělování</h3>
      <p className="mt-0.5 text-[11px] text-text-dim">Každé ráno v 8:00 se mu doplní kontakty na denní kvótu.</p>

      <label className="mt-4 block text-[10px] uppercase tracking-wider text-text-dim">Denní kvóta</label>
      <div className="mt-1.5 flex gap-2">
        <input
          type="number"
          min={0}
          max={300}
          disabled={!canEdit || pending}
          value={quotaValue}
          onChange={(e) => setQuotaValue(e.target.value)}
          className="w-24 px-3 py-2 border border-border bg-surface text-sm text-text tabular-nums focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold disabled:opacity-60"
        />
        {canEdit && quotaDirty && (
          <button
            onClick={() => run(() => setUserQuota(userId, Number(quotaValue)), "Kvóta uložena")}
            disabled={pending}
            className="px-3 py-2 bg-brass text-white text-xs font-semibold hover:opacity-90 disabled:opacity-60"
          >
            Uložit
          </button>
        )}
      </div>

      <label className="mt-5 block text-[10px] uppercase tracking-wider text-text-dim">
        Z jakých databází bere {selected.length === 0 && <span className="normal-case tracking-normal">(všechny)</span>}
      </label>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o.source);
          return (
            <button
              key={o.source || "_"}
              type="button"
              disabled={!canEdit || pending}
              onClick={() => toggle(o.source)}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 border text-xs transition-colors disabled:cursor-default",
                on ? "border-gold bg-gold-pale text-text font-semibold" : "border-border text-text-mid hover:bg-surface-hover"
              )}
            >
              {on && <Check size={12} className="text-gold" />}
              {o.source || "Bez zdroje"}
              <span className="text-text-dim font-normal tabular-nums">{o.count.toLocaleString("cs-CZ")}</span>
            </button>
          );
        })}
      </div>
      {selected.length > 1 && (
        <p className="mt-1.5 text-[11px] text-text-dim">Kontakty z vybraných databází se míchají rovnoměrně.</p>
      )}
      {canEdit && sourcesDirty && (
        <button
          onClick={() => run(() => setUserLeadSources(userId, selected), "Databáze uloženy")}
          disabled={pending}
          className="mt-2 px-3 py-2 bg-brass text-white text-xs font-semibold hover:opacity-90 disabled:opacity-60"
        >
          Uložit databáze
        </button>
      )}

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
        <div>
          <div className="text-sm text-text">{active ? "Účet je aktivní" : "Účet je vypnutý"}</div>
          <div className="text-[11px] text-text-dim">
            {active ? "Vypnutím se okamžitě odhlásí." : "Nemůže se přihlásit a nedostává kontakty."}
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              if (active && !window.confirm("Opravdu vypnout účet? Makléř se okamžitě odhlásí.")) return;
              run(() => toggleUserActive(userId), active ? "Účet vypnut" : "Účet zapnut");
            }}
            disabled={pending}
            className={cn(
              "px-3 py-2 border text-xs font-semibold disabled:opacity-60",
              active ? "border-ruby/30 text-ruby hover:bg-ruby-pale" : "border-emerald/30 text-emerald hover:bg-emerald-pale"
            )}
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : active ? "Vypnout" : "Zapnout"}
          </button>
        )}
      </div>
    </div>
  );
}
