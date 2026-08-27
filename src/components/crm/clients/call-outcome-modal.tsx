"use client";

import { useState, useTransition } from "react";
import { Phone, Loader2 } from "lucide-react";
import Modal from "@/components/crm/ui/modal";
import { useToast } from "@/components/crm/ui/toast";
import { logCall } from "@/app/actions/crm/calls";
import { CALL_OUTCOMES, getOutcomeMeta } from "@/lib/crm/call-outcomes";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clientId: string;
  clientName: string;
}

const TONE: Record<string, string> = {
  emerald: "bg-emerald-pale border-emerald-border text-emerald hover:bg-emerald-pale",
  sapphire: "bg-sapphire-pale border-sapphire-border text-sapphire hover:bg-sapphire-pale",
  gold: "bg-gold-pale border-gold-border text-gold hover:bg-gold-pale",
  amber: "bg-amber-pale border-amber-border text-amber hover:bg-amber-pale",
  ruby: "bg-ruby-pale border-ruby-border text-ruby hover:bg-ruby-pale",
};

const TONE_ACTIVE: Record<string, string> = {
  emerald: "ring-2 ring-emerald",
  sapphire: "ring-2 ring-sapphire",
  gold: "ring-2 ring-gold",
  amber: "ring-2 ring-amber",
  ruby: "ring-2 ring-ruby",
};

export default function CallOutcomeModal({
  open,
  onClose,
  onSuccess,
  clientId,
  clientName,
}: Props) {
  const { toast } = useToast();
  const [outcome, setOutcome] = useState<string>("");
  const [note, setNote] = useState("");
  const [callbackAt, setCallbackAt] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedMeta = outcome ? getOutcomeMeta(outcome) : null;
  const needsDate = !!selectedMeta && "requiresDate" in selectedMeta && selectedMeta.requiresDate;

  function reset() {
    setOutcome("");
    setNote("");
    setCallbackAt("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!outcome) {
      toast("Vyber výsledek hovoru", "error");
      return;
    }
    if (needsDate && !callbackAt) {
      toast("Zadej datum a čas", "error");
      return;
    }
    startTransition(async () => {
      const res = await logCall({
        clientId,
        outcome,
        note: note.trim() || undefined,
        callbackAt: callbackAt || undefined,
      });
      if (res.success) {
        toast(`Zaznamenáno: ${selectedMeta?.label}`);
        reset();
        onSuccess?.();
        onClose();
      } else {
        toast(res.error || "Akce selhala", "error");
      }
    });
  }

  return (
    <Modal open={open} onClose={handleClose} title={`Po hovoru — ${clientName}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-mid mb-2">
            Výsledek hovoru *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CALL_OUTCOMES.map((o) => {
              const active = outcome === o.code;
              return (
                <button
                  key={o.code}
                  type="button"
                  onClick={() => setOutcome(o.code)}
                  className={`text-left p-3 rounded-[10px] border transition-all ${
                    TONE[o.badgeColor] ?? ""
                  } ${active ? TONE_ACTIVE[o.badgeColor] ?? "" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{o.icon}</span>
                    <span className="text-sm font-semibold">{o.label}</span>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-70 leading-tight">
                    {o.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {needsDate && (
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Kdy?
            </label>
            <input
              type="datetime-local"
              value={callbackAt}
              onChange={(e) => setCallbackAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Poznámka (volitelné)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Co řekl? Co domluveno?"
            rows={3}
            className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={pending}
            className="flex-1 px-4 py-2.5 rounded-[10px] border border-border text-sm font-medium text-text-mid hover:bg-surface-hover transition-colors"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending || !outcome}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Phone size={14} />}
            Zaznamenat
          </button>
        </div>
      </div>
    </Modal>
  );
}
