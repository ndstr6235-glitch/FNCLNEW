"use client";

import { useState, useTransition } from "react";
import { Send, UserCheck } from "lucide-react";
import { handoverLead, type HandoverBroker } from "@/app/actions/crm/calling";
import { useToast } from "@/components/crm/ui/toast";
import { COLORS } from "@/lib/crm/constants";

interface Props {
  clientId: string;
  brokers: HandoverBroker[];
  disabled?: boolean;
  onDone: () => void;
}

/** Operator: hand the lead being called over to a broker, with a note. */
export default function HandoverPanel({ clientId, brokers, disabled, onDone }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [brokerId, setBrokerId] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res = await handoverLead({ clientId, brokerId, note });
      if (!res.success) {
        toast(res.error || "Předání se nepovedlo", "error");
        return;
      }
      toast("Lead předán makléři");
      onDone();
    });
  }

  if (!open) {
    return (
      <div className="px-4 mb-4">
        <button
          onClick={() => setOpen(true)}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.99] disabled:opacity-50"
          style={{ background: COLORS.emerald }}
        >
          <UserCheck size={17} />
          Má zájem → předat makléři
        </button>
      </div>
    );
  }

  return (
    <div
      className="mx-4 mb-4 rounded-2xl border-2 p-4 flex flex-col gap-3"
      style={{ borderColor: COLORS.emerald, background: COLORS.emeraldPale }}
    >
      <div className="text-sm font-semibold" style={{ color: COLORS.emerald }}>
        Předat lead makléři
      </div>
      <select
        value={brokerId}
        onChange={(e) => setBrokerId(e.target.value)}
        className="w-full px-3 py-2.5 min-h-[44px] border text-sm bg-white outline-none"
        style={{ borderColor: COLORS.border, color: COLORS.text }}
      >
        <option value="">Vyber makléře…</option>
        {brokers.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Poznámka pro makléře — o co má zájem, kdy volat, částka…"
        className="w-full px-3 py-2 border text-sm bg-white outline-none resize-y"
        style={{ borderColor: COLORS.border, color: COLORS.text }}
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={!brokerId || !note.trim() || pending || disabled}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
          style={{ background: COLORS.emerald }}
        >
          <Send size={15} />
          {pending ? "Předávám…" : "Předat"}
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={pending}
          className="px-4 py-2.5 rounded-xl border text-sm font-medium bg-white"
          style={{ borderColor: COLORS.border, color: COLORS.textMid }}
        >
          Zrušit
        </button>
      </div>
    </div>
  );
}
