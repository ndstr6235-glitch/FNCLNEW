"use client";

import { useState } from "react";
import { Plus, Pencil, Check, X, Landmark, CircleCheck, Clock, Copy, CalendarClock } from "lucide-react";
import { fmtCZK, fmtDate } from "@/lib/crm/utils";
import { useToast } from "@/components/crm/ui/toast";
import { updatePaymentBankAccount, setPaymentPaid, schedulePayoutsFromClient } from "@/app/actions/crm/clients";
import type { ClientDetail } from "@/app/actions/crm/clients";

interface DrawerTabPaymentsProps {
  client: ClientDetail;
  onAddPayment: () => void;
  onRefresh?: () => void;
}

// Extract "[Účet: XXX]" marker from note → { bank, restOfNote }
function parseNote(note: string): { bank: string; rest: string } {
  const match = note.match(/^\[Účet:\s*([^\]]+)\]\s*(.*)$/);
  if (match) return { bank: match[1].trim(), rest: match[2].trim() };
  return { bank: "", rest: note };
}

export default function DrawerTabPayments({
  client,
  onAddPayment,
  onRefresh,
}: DrawerTabPaymentsProps) {
  const { payments, totalDeposit, totalProfit } = client;
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => toast(`Zkopírováno: ${text}`),
      () => toast("Nelze zkopírovat", "error")
    );
  }

  function startEdit(paymentId: string, currentBank: string) {
    setEditingId(paymentId);
    setEditValue(currentBank);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function saveEdit(paymentId: string) {
    setSaving(true);
    const result = await updatePaymentBankAccount(paymentId, editValue);
    setSaving(false);
    if (result.success) {
      toast("Účet uložen");
      setEditingId(null);
      setEditValue("");
      onRefresh?.();
    } else {
      toast(result.error || "Nepodařilo se uložit", "error");
    }
  }

  async function togglePaid(paymentId: string, currentlyPaid: boolean) {
    const result = await setPaymentPaid(paymentId, !currentlyPaid);
    if (result.success) {
      toast(currentlyPaid ? "Označeno jako nezaplaceno" : "Označeno jako zaplaceno");
      onRefresh?.();
    } else {
      toast(result.error || "Akce selhala", "error");
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Totals */}
      <div className="flex gap-3">
        <div className="flex-1 bg-emerald-pale p-3 border border-emerald-border">
          <span className="text-[10px] uppercase tracking-wider text-emerald/70">
            Celkový vklad
          </span>
          <p className="text-sm font-semibold text-emerald mt-0.5">
            {fmtCZK(totalDeposit)}
          </p>
        </div>
        <div className="flex-1 bg-gold-pale p-3 border border-gold-border">
          <span className="text-[10px] uppercase tracking-wider text-gold/70">
            Celkový výdělek
          </span>
          <p className="text-sm font-semibold text-gold mt-0.5">
            {fmtCZK(totalProfit)}
          </p>
        </div>
      </div>

      {/* Payment list */}
      {payments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-text-dim">Žádné platby</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => {
            const { bank, rest } = parseNote(p.note);
            const isEditing = editingId === p.id;

            return (
              <div
                key={p.id}
                className={` p-3 space-y-2 border ${
                  p.paid
                    ? "bg-emerald-pale/40 border-emerald-border"
                    : "bg-surface-hover border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dim">
                    {fmtDate(p.date)}
                  </span>
                  <span className="text-xs font-medium text-gold">
                    {p.percent}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text">
                    {fmtCZK(p.amount)}
                  </span>
                  <span className="text-sm font-medium text-emerald">
                    +{fmtCZK(p.profit)}
                  </span>
                </div>

                {/* Paid status + toggle */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border">
                  {p.paid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald">
                      <CircleCheck size={12} />
                      Zaplaceno
                      {p.paidAt && (
                        <span className="text-text-dim font-normal">
                          · {fmtDate(p.paidAt)}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-text-dim">
                      <Clock size={12} />
                      Čeká na platbu
                    </span>
                  )}
                  <button
                    onClick={() => togglePaid(p.id, p.paid)}
                    className={`text-xs px-2 py-1 transition-colors ${
                      p.paid
                        ? "text-text-dim hover:bg-surface"
                        : "bg-emerald text-white hover:bg-emerald/90"
                    }`}
                  >
                    {p.paid ? "Vrátit" : "Označit jako zaplaceno"}
                  </button>
                </div>

                {/* Variable symbol */}
                {p.variableSymbol && (
                  <div className="flex items-center gap-2 pt-1.5 border-t border-border">
                    <span className="text-xs text-text-dim">VS:</span>
                    <span className="text-xs font-mono font-medium text-text">{p.variableSymbol}</span>
                    <button
                      onClick={() => copyToClipboard(p.variableSymbol!)}
                      className="ml-auto text-gold hover:text-gold/70 transition-colors"
                      title="Kopírovat VS"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                )}

                {/* Bank account row — inline edit */}
                <div className="flex items-center gap-2 pt-1.5 border-t border-border">
                  <Landmark size={12} className="text-text-dim shrink-0" />
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="123456789/0300"
                        autoFocus
                        className="flex-1 min-w-0 px-2 py-1 border border-border bg-surface text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                      />
                      <button
                        onClick={() => saveEdit(p.id)}
                        disabled={saving}
                        className="w-7 h-7 flex items-center justify-center bg-emerald text-white hover:bg-emerald/90 disabled:opacity-50"
                        title="Uložit"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="w-7 h-7 flex items-center justify-center bg-surface text-text-dim hover:bg-surface-hover"
                        title="Zrušit"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 min-w-0 text-xs text-text-mid truncate">
                        {bank ? (
                          <>Účet: <span className="font-medium text-text">{bank}</span></>
                        ) : (
                          <span className="text-text-faint italic">Účet nezadán</span>
                        )}
                      </span>
                      <button
                        onClick={() => startEdit(p.id, bank)}
                        className="text-xs text-gold hover:underline flex items-center gap-1"
                      >
                        <Pencil size={11} />
                        {bank ? "Upravit" : "Doplnit"}
                      </button>
                    </>
                  )}
                </div>

                {rest && (
                  <p className="text-xs text-text-dim">{rest}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule payouts button */}
      {client.paymentReceivedDate && client.payments.some(p => p.paid && p.duration > 0) && (
        <button
          onClick={async () => {
            const result = await schedulePayoutsFromClient(client.id);
            if (result.success) {
              toast(`Naplánováno ${result.eventsCreated} výplat`);
              onRefresh?.();
            } else {
              toast(result.error || "Chyba", "error");
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold/10 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
        >
          <CalendarClock size={16} />
          Přeplánovat výplaty od data připsání
        </button>
      )}

      {/* Add payment button */}
      <button
        onClick={onAddPayment}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald/10 text-emerald text-sm font-medium hover:bg-emerald/20 transition-colors"
      >
        <Plus size={16} />
        Přidat platbu
      </button>
    </div>
  );
}
