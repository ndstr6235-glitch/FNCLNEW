import { FileSignature } from "lucide-react";

/**
 * Shown once a client has e-mailed the data needed for the contract and the
 * final contract has not gone out yet.
 */
export default function ContractPendingBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brass/15 border border-brass/40 text-brass text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
      title="Klient zaslal údaje a čeká na finální smlouvu"
    >
      <FileSignature size={11} className="shrink-0" />
      {compact ? "Čeká na smlouvu" : "Čeká na finální smlouvu"}
    </span>
  );
}
