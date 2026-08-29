"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/crm/utils";
import { listTickets, type TicketRow, type TicketStatus, type TicketPriority } from "@/app/actions/crm/tickets";
import NewTicketModal from "@/components/crm/tickets/new-ticket-modal";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/crm/types";

const PRIORITY_DOT: Record<TicketPriority, string> = {
  LOW: "bg-text-faint",
  MEDIUM: "bg-sapphire",
  HIGH: "bg-amber",
  URGENT: "bg-ruby",
};

const STATUS_STYLE: Record<TicketStatus, { label: string; cls: string }> = {
  OPEN: { label: "Otevřen", cls: "bg-sapphire-pale text-sapphire" },
  IN_PROGRESS: { label: "Řeší se", cls: "bg-amber-pale text-amber" },
  DONE: { label: "Hotovo", cls: "bg-emerald-pale text-emerald" },
  CANCELLED: { label: "Zrušen", cls: "bg-surface-hover text-text-dim" },
};

interface Props {
  clientId: string;
  clientName: string;
  userRole: Role;
}

export default function DrawerTabTickets({ clientId, clientName, userRole }: Props) {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await listTickets({ fromMine: userRole === "broker" });
      setTickets(data.filter((t) => t.clientId === clientId));
      setLoading(false);
    });
  }, [clientId, userRole]);

  function refresh() {
    startTransition(async () => {
      const data = await listTickets({ fromMine: userRole === "broker" });
      setTickets(data.filter((t) => t.clientId === clientId));
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Požadavky ({tickets.length})</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-white text-xs font-medium hover:bg-gold-light transition-colors"
        >
          <Plus size={12} />
          Nový požadavek
        </button>
      </div>

      {tickets.length === 0 ? (
        <p className="text-sm text-text-dim text-center py-8">Žádné požadavky pro tohoto klienta</p>
      ) : (
        <div className="border border-border overflow-hidden">
          {tickets.map((t) => {
            const status = STATUS_STYLE[t.status];
            return (
              <button
                key={t.id}
                onClick={() => router.push(`/tickets/${t.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-hover transition-colors border-b border-border/50 last:border-b-0"
              >
                <span className={cn("w-2 h-2 rounded-full shrink-0", PRIORITY_DOT[t.priority])} />
                <span className="flex-1 text-sm text-text truncate">{t.title}</span>
                {t.messageCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-text-dim">
                    <MessageSquare size={11} />
                    {t.messageCount}
                  </span>
                )}
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", status.cls)}>
                  {status.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <NewTicketModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          refresh();
        }}
        prefilledClientId={clientId}
        prefilledClientName={clientName}
        isBroker={userRole === "broker"}
      />
    </div>
  );
}
