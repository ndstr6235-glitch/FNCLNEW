"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Phone, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/crm/utils";
import { useToast } from "@/components/crm/ui/toast";
import { logCall } from "@/app/actions/crm/calls";

/**
 * One-click call result: write a note (optional), press the button, done.
 * Callback / meeting first asks "when" with quick picks.
 * Used on the client card and on the calling screen. Render with key={clientId}.
 */

type Tone = "amber" | "emerald" | "ruby" | "sapphire" | "gold";

interface QuickOutcome {
  code: string;
  label: string;
  icon: string;
  tone: Tone;
  /** Needs a date and time (callback / meeting) */
  when?: boolean;
  /** Ask before saving */
  confirm?: string;
}

// Order = keyboard shortcut 1–9
const REACHED: QuickOutcome[] = [
  { code: "ZAJEM", label: "Má zájem", icon: "✓", tone: "emerald" },
  { code: "NEZAJEM", label: "Nemá zájem", icon: "✗", tone: "ruby" },
  { code: "CALLBACK", label: "Zavolat později", icon: "🔁", tone: "amber", when: true },
  { code: "SCHUZKA", label: "Schůzka", icon: "📅", tone: "sapphire", when: true },
  { code: "SMLOUVA", label: "Pošlu smlouvu", icon: "📄", tone: "gold" },
  {
    code: "NEVOLAT",
    label: "Nevolat",
    icon: "🚫",
    tone: "ruby",
    confirm: "Klient už nechce být kontaktován? Přidá se do DNC a nikdo mu už nezavolá ani nenapíše.",
  },
];
const NOT_REACHED: QuickOutcome[] = [
  { code: "NEDOVOLAL", label: "Nezvedl", icon: "📵", tone: "amber" },
  { code: "SPATNE_CISLO", label: "Špatné číslo", icon: "⊘", tone: "ruby" },
  { code: "SCHUZKA_ZRUSENA", label: "Schůzka nekonala", icon: "🚷", tone: "amber" },
];
const ORDER: QuickOutcome[] = [NOT_REACHED[0], ...REACHED, NOT_REACHED[1], NOT_REACHED[2]];
const KEY_OF = new Map(ORDER.map((o, i) => [o.code, i + 1]));

const TONE: Record<Tone, string> = {
  emerald: "border-emerald-border text-emerald hover:bg-emerald-pale",
  ruby: "border-ruby-border text-ruby hover:bg-ruby-pale",
  amber: "border-amber/40 text-amber hover:bg-amber-pale",
  sapphire: "border-sapphire-border text-sapphire hover:bg-sapphire-pale",
  gold: "border-gold-border text-gold hover:bg-gold-pale",
};
const TONE_ON: Record<Tone, string> = {
  emerald: "bg-emerald-pale ring-2 ring-emerald",
  ruby: "bg-ruby-pale ring-2 ring-ruby",
  amber: "bg-amber-pale ring-2 ring-amber",
  sapphire: "bg-sapphire-pale ring-2 ring-sapphire",
  gold: "bg-gold-pale ring-2 ring-gold",
};

/** datetime-local value in the browser's time zone */
function local(d: Date) {
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function quickTimes(): { label: string; value: string }[] {
  const now = new Date();
  const inH = (h: number) => {
    const d = new Date(now.getTime() + h * 3600000);
    d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
    return d;
  };
  const dayAt = (addDays: number, h: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + addDays);
    d.setHours(h, 0, 0, 0);
    return d;
  };
  // next working day
  let wd = 1;
  while ([0, 6].includes(dayAt(wd, 9).getDay())) wd++;
  const wdLabel = wd === 1 ? "Zítra" : dayAt(wd, 9).toLocaleDateString("cs-CZ", { weekday: "long" });
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return [
    { label: "Za hodinu", value: local(inH(1)) },
    { label: "Za 2 hodiny", value: local(inH(2)) },
    { label: `${cap(wdLabel)} 9:00`, value: local(dayAt(wd, 9)) },
    { label: `${cap(wdLabel)} 13:00`, value: local(dayAt(wd, 13)) },
    { label: `${cap(wdLabel)} 17:00`, value: local(dayAt(wd, 17)) },
  ];
}

interface Props {
  clientId: string;
  phone?: string;
  /** Called after the result is saved */
  onLogged?: (code: string) => void;
  /** Number keys 1–9 pick a result (only while not typing) */
  hotkeys?: boolean;
}

export default function QuickCallPanel({ clientId, phone, onLogged, hotkeys = true }: Props) {
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [pendingWhen, setPendingWhen] = useState<QuickOutcome | null>(null);
  const [customWhen, setCustomWhen] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const noteRef = useRef<HTMLTextAreaElement>(null);

  function save(o: QuickOutcome, when?: string) {
    start(async () => {
      const res = await logCall({ clientId, outcome: o.code, note: note.trim() || undefined, callbackAt: when });
      if (!res.success) {
        toast(res.error || "Nepodařilo se uložit", "error");
        return;
      }
      toast(`Uloženo: ${o.label}${when ? ` · ${new Date(when).toLocaleString("cs-CZ", { weekday: "short", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}` : ""}`);
      setSaved(o.label);
      setNote("");
      setPendingWhen(null);
      setCustomWhen("");
      onLogged?.(o.code);
    });
  }

  function pick(o: QuickOutcome) {
    if (pending) return;
    if (o.when) {
      setPendingWhen((cur) => (cur?.code === o.code ? null : o));
      return;
    }
    if (o.confirm && !window.confirm(o.confirm)) return;
    save(o);
  }

  useEffect(() => {
    if (!hotkeys) return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        noteRef.current?.focus();
        return;
      }
      const num = Number(e.key);
      if (num >= 1 && num <= ORDER.length) {
        e.preventDefault();
        pick(ORDER[num - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const btn = (o: QuickOutcome, big?: boolean) => (
    <button
      key={o.code}
      type="button"
      onClick={() => pick(o)}
      disabled={pending}
      className={cn(
        "relative flex items-center justify-center gap-2 border-2 bg-surface font-semibold transition-all active:scale-[0.97] disabled:opacity-50 select-none",
        big ? "min-h-[56px] px-3 text-base" : "min-h-[48px] px-2 text-sm",
        TONE[o.tone],
        pendingWhen?.code === o.code && TONE_ON[o.tone]
      )}
    >
      <span className={big ? "text-lg" : "text-base"}>{o.icon}</span>
      {o.label}
      {hotkeys && <span className="absolute top-0.5 right-1.5 text-[9px] font-bold opacity-40">{KEY_OF.get(o.code)}</span>}
    </button>
  );

  return (
    <div className="border-2 border-gold-border bg-surface">
      {phone && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-dim">Telefon</div>
            <div className="font-display text-xl font-bold text-text tabular-nums">{phone}</div>
          </div>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 px-5 min-h-[48px] bg-sapphire text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            <Phone size={18} /> Zavolat
          </a>
        </div>
      )}

      <div className="p-4 space-y-3">
        <textarea
          ref={noteRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") (e.target as HTMLTextAreaElement).blur();
          }}
          rows={2}
          placeholder="Poznámka k hovoru (nepovinné) — co řekl, co jste domluvili…"
          className="w-full px-3 py-2.5 border border-border bg-bg text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold resize-none"
        />

        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-text-dim">Nedovolal se</div>
          <div className="grid grid-cols-2 gap-2">
            {btn(NOT_REACHED[0], true)}
            {btn(NOT_REACHED[1], true)}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-text-dim">Mluvil jsem s ním</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REACHED.map((o) => btn(o))}
          </div>
        </div>

        {pendingWhen && (
          <div className="border border-border bg-bg p-3">
            <div className="text-xs font-semibold text-text">
              {pendingWhen.code === "SCHUZKA" ? "Kdy je schůzka?" : "Kdy zavolat znovu?"}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickTimes().map((t) => (
                <button
                  key={t.label}
                  type="button"
                  disabled={pending}
                  onClick={() => save(pendingWhen, t.value)}
                  className="px-3 min-h-[40px] border border-border bg-surface text-sm text-text hover:border-gold hover:bg-gold-pale disabled:opacity-50"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="datetime-local"
                value={customWhen}
                onChange={(e) => setCustomWhen(e.target.value)}
                className="flex-1 min-w-0 px-3 min-h-[40px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <button
                type="button"
                disabled={!customWhen || pending}
                onClick={() => save(pendingWhen, customWhen)}
                className="px-4 min-h-[40px] bg-brass text-white text-sm font-semibold disabled:opacity-50"
              >
                Uložit
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 min-h-[20px] text-[11px] text-text-dim">
          <button type="button" onClick={() => pick(NOT_REACHED[2])} disabled={pending} className="hover:text-text underline-offset-2 hover:underline">
            Schůzka nekonala
          </button>
          {pending ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> Ukládám…
            </span>
          ) : saved ? (
            <span className="inline-flex items-center gap-1 text-emerald font-semibold">
              <Check size={12} /> Uloženo: {saved}
            </span>
          ) : hotkeys ? (
            <span className="hidden sm:inline">Klávesy 1–9 · P = poznámka</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
