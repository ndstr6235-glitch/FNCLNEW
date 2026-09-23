"use client";

import { useCallback, useEffect, useState } from "react";
import { FileSignature, Check, X, Mail } from "lucide-react";
import { fmtCZK, fmtDateTime } from "@/lib/crm/utils";
import {
  clearAwaitingContract,
  confirmInboundField,
  getClientInboundEmails,
  rejectInboundField,
  type InboundEmailRow,
} from "@/app/actions/crm/inbound";

const FIELD_LABELS: Record<string, string> = {
  firstName: "Jméno",
  lastName: "Příjmení",
  birthDate: "Datum narození",
  phone: "Telefon",
  email: "E-mail",
  street: "Ulice",
  city: "Město",
  zip: "PSČ",
  bankAccount: "Číslo účtu",
  investmentAmount: "Částka investice",
  rodneCislo: "Rodné číslo",
  cisloOp: "Číslo OP",
};

function fmtValue(field: string, value: string | number): string {
  if (field === "investmentAmount") return fmtCZK(Number(value));
  return String(value);
}

interface Props {
  clientId: string;
  awaitingContract: boolean;
  onRefresh?: () => void;
}

/**
 * Contract data the client sent to info@ — auto-filled values, values that
 * clash with the card and need a decision, and the raw reply.
 */
export default function InboundDataPanel({
  clientId,
  awaitingContract,
  onRefresh,
}: Props) {
  const [rows, setRows] = useState<InboundEmailRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [openBody, setOpenBody] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRows(await getClientInboundEmails(clientId));
  }, [clientId]);

  useEffect(() => {
    // Loads the client's inbound replies when the drawer opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (rows.length === 0 && !awaitingContract) return null;

  async function handleConfirm(inboundId: string, field: string) {
    setBusy(`${inboundId}:${field}`);
    await confirmInboundField(inboundId, field);
    setBusy(null);
    await load();
    onRefresh?.();
  }

  async function handleReject(inboundId: string, field: string) {
    setBusy(`${inboundId}:${field}`);
    await rejectInboundField(inboundId, field);
    setBusy(null);
    await load();
  }

  async function handleDone() {
    setBusy("done");
    await clearAwaitingContract(clientId);
    setBusy(null);
    onRefresh?.();
  }

  return (
    <div className="border-2 border-brass/40 bg-brass/5 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <FileSignature size={16} className="text-brass shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brass">
            {awaitingContract
              ? "Klient zaslal údaje — čeká na finální smlouvu"
              : "Údaje z e-mailu klienta"}
          </p>
          <p className="text-[11px] text-text-mid">
            Načteno ze schránky info@puskinpartners.cz
          </p>
        </div>
      </div>

      {rows.map((row) => {
        const appliedKeys = Object.keys(row.applied);
        const pendingKeys = Object.keys(row.pending);

        return (
          <div key={row.id} className="bg-surface border border-border p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-text-dim truncate">
                {row.fromEmail}
              </span>
              <span className="text-[11px] text-text-dim shrink-0">
                {fmtDateTime(row.receivedAt)}
              </span>
            </div>

            {appliedKeys.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-emerald mb-1">
                  Doplněno do karty
                </p>
                <ul className="space-y-0.5">
                  {appliedKeys.map((field) => (
                    <li key={field} className="text-xs text-text flex gap-1.5">
                      <span className="text-text-mid">
                        {FIELD_LABELS[field] || field}:
                      </span>
                      <span className="font-medium">
                        {fmtValue(field, row.applied[field])}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pendingKeys.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-ruby mb-1">
                  Liší se od karty — potvrďte, co platí
                </p>
                <ul className="space-y-1.5">
                  {pendingKeys.map((field) => (
                    <li
                      key={field}
                      className="flex items-center gap-2 text-xs bg-ruby-pale/60 px-2 py-1.5"
                    >
                      <span className="flex-1 min-w-0">
                        <span className="text-text-mid">
                          {FIELD_LABELS[field] || field}:{" "}
                        </span>
                        <span className="font-medium text-text">
                          {fmtValue(field, row.pending[field])}
                        </span>
                      </span>
                      <button
                        onClick={() => handleConfirm(row.id, field)}
                        disabled={busy === `${row.id}:${field}`}
                        title="Přepsat kartu touto hodnotou"
                        className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center bg-emerald/10 text-emerald hover:bg-emerald/20 disabled:opacity-50"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleReject(row.id, field)}
                        disabled={busy === `${row.id}:${field}`}
                        title="Nechat původní hodnotu"
                        className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center bg-ruby/10 text-ruby hover:bg-ruby/20 disabled:opacity-50"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setOpenBody(openBody === row.id ? null : row.id)}
              className="flex items-center gap-1.5 text-[11px] text-text-mid hover:text-text"
            >
              <Mail size={12} />
              {openBody === row.id ? "Skrýt původní e-mail" : "Zobrazit původní e-mail"}
            </button>

            {openBody === row.id && (
              <pre className="text-[11px] text-text-mid whitespace-pre-wrap break-words bg-surface-hover p-2 max-h-60 overflow-y-auto">
                {row.body || "(prázdná zpráva)"}
              </pre>
            )}
          </div>
        );
      })}

      {awaitingContract && (
        <button
          onClick={handleDone}
          disabled={busy === "done"}
          className="w-full px-3 py-2 min-h-[44px] border border-brass/40 bg-surface text-sm font-medium text-brass hover:bg-brass/10 disabled:opacity-50"
        >
          {busy === "done" ? "Ukládám…" : "Smlouva vyřízena — zrušit upozornění"}
        </button>
      )}
    </div>
  );
}
