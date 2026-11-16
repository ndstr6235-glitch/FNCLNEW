"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import Modal from "@/components/crm/ui/modal";
import { useToast } from "@/components/crm/ui/toast";
import { bulkSendPrezentace } from "@/app/actions/crm/bulk";

interface BulkEmailModalProps {
  open: boolean;
  onClose: () => void;
}

/** Extract valid emails from pasted text (comma, semicolon, newline, space separated) */
function parseEmails(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.includes("@") && s.includes("."));
}

export default function BulkEmailModal({
  open,
  onClose,
}: BulkEmailModalProps) {
  const { toast } = useToast();
  const [raw, setRaw] = useState("");
  const [sending, setSending] = useState(false);

  const emails = parseEmails(raw);
  const unique = [...new Set(emails)];

  async function handleSend() {
    if (unique.length === 0) {
      toast("Zadejte alespoň jeden email", "error");
      return;
    }

    setSending(true);
    const result = await bulkSendPrezentace(unique);
    setSending(false);

    if (result.success) {
      toast(`Prezentace odeslána ${result.sent} příjemcům`);
      setRaw("");
      onClose();
    } else {
      toast(result.error || "Odeslání selhalo", "error");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Odeslat hromadně">
      <div className="space-y-4">
        <p className="text-sm text-text-mid">
          Vložte emailové adresy (oddělené čárkou, středníkem nebo novým
          řádkem). Prezentace s PDF přílohou odejde každému zvlášť — příjemci se navzájem nevidí a do info@ nechodí kopie.
        </p>

        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Emailové adresy
          </label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={6}
            placeholder={"jan@email.cz\npetr@firma.cz\nmarie@email.cz"}
            className="w-full px-3 py-2.5 border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition resize-none leading-relaxed font-mono"
          />
        </div>

        {unique.length > 0 && (
          <p className="text-xs text-text-mid">
            Rozpoznáno <strong className="text-text">{unique.length}</strong>{" "}
            {unique.length === 1
              ? "adresa"
              : unique.length < 5
                ? "adresy"
                : "adres"}
          </p>
        )}

        {/* Send button */}
        <div className="sticky bottom-[-1rem] -mx-5 px-5 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-surface border-t border-border">
          <button
            onClick={handleSend}
            disabled={unique.length === 0 || sending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-brass text-white text-sm font-semibold disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {sending
              ? "Odesílání..."
              : unique.length > 0
                ? `Odeslat Prezentaci (${unique.length})`
                : "Odeslat Prezentaci"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
