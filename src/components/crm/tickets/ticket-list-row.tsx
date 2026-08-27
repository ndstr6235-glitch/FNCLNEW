"use client";

import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/crm/utils";
import type { TicketRow, TicketStatus, TicketPriority } from "@/app/actions/crm/tickets";

const PRIORITY_DOT: Record<TicketPriority, string> = {
  LOW: "bg-text-faint",
  MEDIUM: "bg-sapphire",
  HIGH: "bg-amber",
  URGENT: "bg-ruby",
};

const PRIORITY_LABEL: Record<TicketPriority, string> = {
  LOW: "Nízká",
  MEDIUM: "Střední",
  HIGH: "Vysoká",
  URGENT: "Urgentní",
};

const STATUS_STYLE: Record<TicketStatus, { label: string; cls: string }> = {
  OPEN: { label: "Otevřen", cls: "bg-sapphire-pale text-sapphire" },
  IN_PROGRESS: { label: "Řeší se", cls: "bg-amber-pale text-amber" },
  DONE: { label: "Hotovo", cls: "bg-emerald-pale text-emerald" },
  CANCELLED: { label: "Zrušen", cls: "bg-surface-hover text-text-dim" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "právě teď";
  if (m < 60) return `před ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `před ${h} h`;
  return `před ${Math.floor(h / 24)} d`;
}

interface Props {
  ticket: TicketRow;
}

export default function TicketListRow({ ticket }: Props) {
  const router = useRouter();
  const status = STATUS_STYLE[ticket.status];
  const priorityDot = PRIORITY_DOT[ticket.priority];

  return (
    <button
      onClick={() => router.push(`/tickets/${ticket.id}`)}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors border-b border-border/50 last:border-b-0"
    >
      <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", priorityDot)} title={PRIORITY_LABEL[ticket.priority]} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{ticket.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {ticket.assignee && (
            <span className="text-xs text-text-dim">
              {ticket.assignee.firstName} {ticket.assignee.lastName}
            </span>
          )}
          {ticket.client && (
            <span className="text-xs bg-gold-pale text-gold px-1.5 py-0.5 rounded-full">
              {ticket.client.firstName} {ticket.client.lastName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {ticket.messageCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-text-dim">
            <MessageSquare size={12} />
            {ticket.messageCount}
          </span>
        )}
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", status.cls)}>
          {status.label}
        </span>
        <span className="text-[11px] text-text-faint whitespace-nowrap">
          {timeAgo(ticket.updatedAt)}
        </span>
      </div>
    </button>
  );
}
