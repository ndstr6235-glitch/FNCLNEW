"use client";

import { useState, useTransition, useCallback } from "react";
import { ArrowLeft, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/crm/utils";
import {
  getTicketDetail,
  updateTicketStatus,
  assignTicket,
  type TicketDetail,
  type TicketStatus,
  type TicketPriority,
} from "@/app/actions/crm/tickets";
import TicketThread from "@/components/crm/tickets/ticket-thread";
import { useToast } from "@/components/crm/ui/toast";
import type { Role } from "@/lib/crm/types";

const PRIORITY_STYLE: Record<TicketPriority, { label: string; cls: string }> = {
  LOW: { label: "Nízká", cls: "bg-surface-hover text-text-dim" },
  MEDIUM: { label: "Střední", cls: "bg-sapphire-pale text-sapphire" },
  HIGH: { label: "Vysoká", cls: "bg-amber-pale text-amber" },
  URGENT: { label: "Urgentní", cls: "bg-ruby-pale text-ruby" },
};

const STATUS_STYLE: Record<TicketStatus, { label: string; cls: string }> = {
  OPEN: { label: "Otevřen", cls: "bg-sapphire-pale text-sapphire" },
  IN_PROGRESS: { label: "Řeší se", cls: "bg-amber-pale text-amber" },
  DONE: { label: "Hotovo", cls: "bg-emerald-pale text-emerald" },
  CANCELLED: { label: "Zrušen", cls: "bg-surface-hover text-text-dim" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Broker {
  id: string;
  name: string;
}

interface Props {
  ticket: TicketDetail;
  currentUserId: string;
  userRole: Role;
  brokers: Broker[];
}

export default function TicketDetailClient({ ticket: initial, currentUserId, userRole, brokers }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<TicketDetail>(initial);
  const [isPending, startTransition] = useTransition();
  const [showAssign, setShowAssign] = useState(false);
  const [assigneeId, setAssigneeId] = useState(ticket.assigneeId ?? "");

  const canEditStatus =
    userRole !== "broker" ||
    ticket.assigneeId === currentUserId ||
    ticket.fromUserId === currentUserId;

  const refresh = useCallback(() => {
    startTransition(async () => {
      const data = await getTicketDetail(ticket.id);
      if (data) setTicket(data);
    });
  }, [ticket.id]);

  function handleStatusChange(status: TicketStatus) {
    startTransition(async () => {
      const result = await updateTicketStatus(ticket.id, status);
      if (result.success) {
        refresh();
      } else {
        toast(result.error ?? "Chyba", "error");
      }
    });
  }

  function handleAssign() {
    if (!assigneeId) return;
    startTransition(async () => {
      const result = await assignTicket(ticket.id, assigneeId);
      if (result.success) {
        setShowAssign(false);
        refresh();
        toast("Přiřazeno");
      } else {
        toast(result.error ?? "Chyba", "error");
      }
    });
  }

  const priority = PRIORITY_STYLE[ticket.priority];
  const status = STATUS_STYLE[ticket.status];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/tickets")}
          className="w-9 h-9 flex items-center justify-center rounded-[8px] hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft size={18} className="text-text-dim" />
        </button>
        <h1 className="text-base font-display font-bold text-text flex-1 min-w-0 truncate">
          {ticket.title}
        </h1>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", priority.cls)}>
          {priority.label}
        </span>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", status.cls)}>
          {status.label}
        </span>
      </div>

      <div className="bg-surface rounded-[16px] border border-border p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-text-dim text-xs">Autor</p>
            <p className="text-text font-medium">{ticket.from.firstName} {ticket.from.lastName}</p>
          </div>
          <div>
            <p className="text-text-dim text-xs">Přiřazeno</p>
            <p className="text-text font-medium">
              {ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : "—"}
            </p>
          </div>
          {ticket.client && (
            <div>
              <p className="text-text-dim text-xs">Klient</p>
              <p className="text-text font-medium">{ticket.client.firstName} {ticket.client.lastName}</p>
            </div>
          )}
          <div>
            <p className="text-text-dim text-xs">Vytvořeno</p>
            <p className="text-text font-medium">{formatDate(ticket.createdAt)}</p>
          </div>
          {ticket.resolvedAt && (
            <div>
              <p className="text-text-dim text-xs">Vyřešeno</p>
              <p className="text-text font-medium">{ticket.resolvedAt}</p>
            </div>
          )}
        </div>

        {ticket.description && (
          <div className="pt-2 border-t border-border">
            <p className="text-text-dim text-xs mb-1">Popis</p>
            <p className="text-sm text-text whitespace-pre-wrap">{ticket.description}</p>
          </div>
        )}
      </div>

      {canEditStatus && ticket.status !== "DONE" && ticket.status !== "CANCELLED" && (
        <div className="flex flex-wrap gap-2">
          {ticket.status === "OPEN" && (
            <button
              onClick={() => handleStatusChange("IN_PROGRESS")}
              disabled={isPending}
              className="px-4 py-2 rounded-[10px] bg-amber-pale text-amber text-sm font-medium hover:bg-amber/20 transition-colors"
            >
              Začít řešit
            </button>
          )}
          {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
            <button
              onClick={() => handleStatusChange("DONE")}
              disabled={isPending}
              className="px-4 py-2 rounded-[10px] bg-emerald-pale text-emerald text-sm font-medium hover:bg-emerald/20 transition-colors"
            >
              Hotovo
            </button>
          )}
          <button
            onClick={() => handleStatusChange("CANCELLED")}
            disabled={isPending}
            className="px-4 py-2 rounded-[10px] bg-surface-hover text-text-dim text-sm font-medium hover:bg-ruby-pale hover:text-ruby transition-colors"
          >
            Zrušit
          </button>
          {userRole !== "broker" && (
            <button
              onClick={() => setShowAssign(!showAssign)}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-border text-text-mid text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              <UserCheck size={14} />
              Přiřadit
            </button>
          )}
        </div>
      )}

      {showAssign && userRole !== "broker" && (
        <div className="bg-surface border border-border rounded-[12px] p-3 flex gap-2">
          <select
            className="flex-1 px-3 py-2 rounded-[8px] border border-border bg-surface text-text text-sm focus:outline-none focus:border-gold"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">— Vyberte osobu —</option>
            {brokers.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={!assigneeId || isPending}
            className="px-4 py-2 rounded-[8px] bg-gold text-white text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            Uložit
          </button>
        </div>
      )}

      <div className="bg-surface rounded-[16px] border border-border p-4">
        <h2 className="text-sm font-semibold text-text mb-4">Konverzace</h2>
        <TicketThread
          ticketId={ticket.id}
          messages={ticket.messages}
          currentUserId={currentUserId}
          onMessageAdded={refresh}
        />
      </div>
    </div>
  );
}
