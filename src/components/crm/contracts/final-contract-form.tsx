"use client";

import { useState } from "react";
import { Download, Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/components/crm/ui/toast";
import ContractEmailDraft from "./contract-email-draft";

const INPUT =
  "w-full px-3 py-2.5 min-h-[44px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition";
const LABEL = "block text-xs font-medium text-text-mid mb-1";

const EMPTY = {
  firstName: "",
  lastName: "",
  birthDate: "",
  street: "",
  city: "",
  zip: "",
  bankAccount: "",
  amount: "",
  interestRate: "",
  duration: "12",
  payoutFrequency: "monthly",
  startDate: "",
  variableSymbol: "",
};
type Form = typeof EMPTY;

export default function FinalContractForm({ senderName }: { senderName: string }) {
  const { toast } = useToast();
  const [f, setF] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  async function download() {
    setBusy(true);
    try {
      const res = await fetch("/api/crm/smlouva-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "PDF se nepodařilo vytvořit");
      }
      const blob = await res.blob();
      const name =
        res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] || "Smlouva.pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast("Smlouva stažena");
    } catch (e) {
      toast(e instanceof Error ? e.message : "PDF se nepodařilo vytvořit", "error");
    } finally {
      setBusy(false);
    }
  }

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className={LABEL}>{label}</label>
      <input value={f[k]} onChange={set(k)} className={INPUT} {...props} />
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-5 max-w-3xl">
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold text-text">Smlouva k tisku</h1>
        <p className="mt-0.5 text-sm text-text-mid">
          Vyplňte údaje a stáhněte hotovou finální smlouvu v PDF. Co necháte prázdné, zůstane ve
          smlouvě jako čára k ručnímu doplnění.
        </p>
      </div>

      <section className="border border-border bg-surface p-4 lg:p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[1.5px] text-brass">Věřitel (klient)</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {field("firstName", "Jméno", { placeholder: "Jan" })}
          {field("lastName", "Příjmení", { placeholder: "Novák" })}
          {field("birthDate", "Datum narození", { type: "date" })}
          {field("bankAccount", "Bankovní spojení", { placeholder: "123456789/0100" })}
        </div>
        <div className="grid sm:grid-cols-[2fr_1.4fr_1fr] gap-3">
          {field("street", "Ulice a číslo", { placeholder: "Dlouhá 12" })}
          {field("city", "Město", { placeholder: "Praha" })}
          {field("zip", "PSČ", { placeholder: "110 00" })}
        </div>
      </section>

      <section className="border border-border bg-surface p-4 lg:p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[1.5px] text-brass">Parametry smlouvy</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {field("amount", "Výše zápůjčky (Kč)", { inputMode: "numeric", placeholder: "500 000" })}
          {field("interestRate", "Úrok % p.a.", { inputMode: "decimal", placeholder: "10" })}
          <div>
            <label className={LABEL}>Doba trvání</label>
            <select value={f.duration} onChange={set("duration")} className={INPUT}>
              <option value="6">6 měsíců</option>
              <option value="12">1 rok (12 měsíců)</option>
              <option value="24">2 roky (24 měsíců)</option>
              <option value="36">3 roky (36 měsíců)</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Výplata úroku</label>
            <select value={f.payoutFrequency} onChange={set("payoutFrequency")} className={INPUT}>
              <option value="monthly">Měsíčně</option>
              <option value="quarterly">Čtvrtletně</option>
            </select>
          </div>
          {field("startDate", "Datum začátku smlouvy (a podpisu)", { type: "date" })}
          {field("variableSymbol", "Variabilní symbol (nepovinné)", { inputMode: "numeric" })}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={download}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-brass text-white text-sm font-semibold disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {busy ? "Vytvářím PDF…" : "Stáhnout smlouvu v PDF"}
        </button>
        <button
          onClick={() => setF(EMPTY)}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] border border-border text-text-mid text-sm font-medium hover:bg-surface-hover"
        >
          <RotateCcw size={15} /> Vymazat
        </button>
      </div>

      {f.firstName.trim() && f.lastName.trim() && <ContractEmailDraft data={f} senderName={senderName} />}
    </div>
  );
}
