"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mail, RotateCcw } from "lucide-react";
import { COMPANY_BANK_ACCOUNT } from "@/lib/crm/company";

export interface DraftData {
  firstName: string;
  lastName: string;
  amount: string;
  interestRate: string;
  duration: string;
  payoutFrequency: string;
  startDate: string;
  variableSymbol: string;
}

const num = (s: string) => Number(s.replace(/\s/g, "").replace(",", "."));
const czk = (n: number) => `${Math.round(n).toLocaleString("cs-CZ")} Kč`;
const czDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${Number(d)}. ${Number(m)}. ${y}` : "";
};
const durationText = (m: string) =>
  ({ "6": "6 měsíců", "12": "1 rok (12 měsíců)", "24": "2 roky (24 měsíců)", "36": "3 roky (36 měsíců)" })[m] ??
  `${m} měsíců`;

type Salutation = "pan" | "pani" | "neutral";

function buildDraft(d: DraftData, sal: Salutation, senderName: string) {
  const full = `${d.firstName} ${d.lastName}`.trim();
  const greeting =
    sal === "pan" ? `Dobrý den, pane ${d.lastName},` : sal === "pani" ? `Dobrý den, paní ${d.lastName},` : "Dobrý den,";

  const amount = num(d.amount);
  const rate = num(d.interestRate);
  const quarterly = d.payoutFrequency === "quarterly";
  const lines: string[] = [];
  if (amount > 0) lines.push(`• Výše zápůjčky: ${czk(amount)}`);
  if (rate > 0) lines.push(`• Úrok: ${String(rate).replace(".", ",")} % p.a., vyplácený ${quarterly ? "čtvrtletně" : "měsíčně"}`);
  lines.push(`• Doba trvání: ${durationText(d.duration)}${d.startDate ? `, od ${czDate(d.startDate)}` : ""}`);
  if (amount > 0 && rate > 0) {
    const payout = (amount * rate) / 100 / (quarterly ? 4 : 12);
    lines.push(`• ${quarterly ? "Čtvrtletní" : "Měsíční"} výplata úroku: ${czk(payout)}`);
  }

  const payment = `Částku zápůjčky prosím zašlete na účet ${COMPANY_BANK_ACCOUNT}${
    d.variableSymbol.trim() ? `, variabilní symbol ${d.variableSymbol.trim()}` : ""
  }.`;

  const subject = `Smlouva o zápůjčce – ${full} – Puskin and Partners`;
  const body = [
    greeting,
    "",
    "děkuji Vám za čas a důvěru. V příloze Vám posílám smlouvu o zápůjčce připravenou podle naší domluvy:",
    "",
    ...lines,
    "",
    "Další postup:",
    "1. Smlouvu si prosím vytiskněte, zkontrolujte své údaje a na poslední straně podepište.",
    "2. Podepsanou smlouvu nám pošlete zpět naskenovanou nebo vyfocenou na info@puskinpartners.cz.",
    `3. ${payment}`,
    "",
    "Pokud budete mít k čemukoli dotaz, rád Vám vše vysvětlím.",
    "",
    "S pozdravem,",
    "",
    senderName,
    "Alexandr Puškin, s.r.o.",
    "info@puskinpartners.cz",
    "www.puskinpartners.cz",
  ].join("\n");

  return { subject, body };
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-medium text-text-mid hover:bg-surface-hover"
    >
      {done ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
      {done ? "Zkopírováno" : label}
    </button>
  );
}

/** Ready-to-send e-mail text for the client, shown once the name is filled in. */
export default function ContractEmailDraft({ data, senderName }: { data: DraftData; senderName: string }) {
  const [sal, setSal] = useState<Salutation>("neutral");
  const generated = useMemo(() => buildDraft(data, sal, senderName), [data, sal, senderName]);
  // Hand edits override the generated text; until then it follows the form
  const [subjectEdit, setSubjectEdit] = useState<string | null>(null);
  const [bodyEdit, setBodyEdit] = useState<string | null>(null);
  const subject = subjectEdit ?? generated.subject;
  const body = bodyEdit ?? generated.body;
  const edited = subjectEdit !== null || bodyEdit !== null;
  const reset = () => {
    setSubjectEdit(null);
    setBodyEdit(null);
  };

  const salBtn = (v: Salutation, text: string) => (
    <button
      type="button"
      onClick={() => {
        setSal(v);
        reset();
      }}
      className={`px-3 py-1.5 text-xs font-medium border ${
        sal === v ? "bg-ink text-on-dark border-ink" : "border-border text-text-mid hover:bg-surface-hover"
      }`}
    >
      {text}
    </button>
  );

  return (
    <section className="border border-border bg-surface p-4 lg:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[1.5px] text-brass">
          <Mail size={14} /> Návrh e-mailu pro klienta
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-text-dim mr-1">Oslovení:</span>
          {salBtn("pan", "Pan")}
          {salBtn("pani", "Paní")}
          {salBtn("neutral", "Bez jména")}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-text-mid">Předmět</label>
          <CopyBtn text={subject} label="Kopírovat předmět" />
        </div>
        <input
          value={subject}
          onChange={(e) => {
            setSubjectEdit(e.target.value);
          }}
          className="w-full px-3 py-2.5 border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-text-mid">Text e-mailu</label>
          <CopyBtn text={body} label="Kopírovat text" />
        </div>
        <textarea
          value={body}
          onChange={(e) => {
            setBodyEdit(e.target.value);
          }}
          rows={20}
          className="w-full px-3 py-2.5 border border-border bg-surface text-sm text-text leading-relaxed font-[inherit] focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-dim">
        <span>
          {sal !== "neutral" && "U oslovení zkontrolujte 5. pád příjmení (např. „pane Nováku“). "}
          Smlouvu (PDF) přiložte k e-mailu.
        </span>
        {edited && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-text-mid hover:text-text"
          >
            <RotateCcw size={12} /> Vrátit podle údajů
          </button>
        )}
      </div>
    </section>
  );
}
