"use client";

import { useState, useTransition, useCallback } from "react";
import { Plus } from "lucide-react";
import { listTickets, type TicketRow, type TicketStatus, type TicketPriority } from "@/app/actions/crm/tickets";
import TicketListRow from "@/components/crm/tickets/ticket-list-row";
import NewTicketModal from "@/components/crm/tickets/new-ticket-modal";
import { cn } from "@/lib/crm/utils";
import type { Role } from "@/lib/crm/types";

interface Broker {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
}

interface Props {
  initialTickets: TicketRow[];
  userRole: Role;
  brokers: Broker[];
  clients: Client[];
}

const STATUS_FILTERS: { value: TicketStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Vše" },
  { value: "OPEN", label: "Otevřen" },
  { value: "IN_PROGRESS", label: "Řeší se" },
  { value: "DONE", label: "Hotovo" },
  { value: "CANCELLED", label: "Zrušen" },
];

const PRIORITY_FILTERS: { value: TicketPriority | "ALL"; label: string }[] = [
  { value: "ALL", label: "Vše" },
  { value: "URGENT", label: "Urgentní" },
  { value: "HIGH", label: "Vysoká" },
  { value: "MEDIUM", label: "Střední" },
  { value: "LOW", label: "Nízká" },
];

const ASSIGNEE_FILTERS: { value: "all" | "mine" | "fromMine"; label: string }[] = [
  { value: "all", label: "Vše" },
  { value: "mine", label: "Přiřazeno mně" },
  { value: "fromMine", label: "Moje požadavky" },
];

export default function TicketsClient({ initialTickets, userRole, brokers, clients }: Props) {
  const [tickets, setTickets] = useState<TicketRow[]>(initialTickets);
  const [showModal, setShowModal] = useState(false);
  const [, startTransition] = useTransition();

  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">(
    userRole === "broker" ? "ALL" : "OPEN"
  );
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "ALL">("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "mine" | "fromMine">(
    userRole === "broker" ? "fromMine" : "all"
  );
  const [search, setSearch] = useState("");

  const refresh = useCallback(() => {
    startTransition(async () => {
      const data = await listTickets({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
        assigneeMine: assigneeFilter === "mine",
        fromMine: assigneeFilter === "fromMine",
        search: search || undefined,
      });
      setTickets(data);
    });
  }, [statusFilter, priorityFilter, assigneeFilter, search]);

  function applyStatusFilter(v: TicketStatus | "ALL") {
    setStatusFilter(v);
    startTransition(async () => {
      const data = await listTickets({
        status: v !== "ALL" ? v : undefined,
        priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
        assigneeMine: assigneeFilter === "mine",
        fromMine: assigneeFilter === "fromMine",
        search: search || undefined,
      });
      setTickets(data);
    });
  }

  function applyPriorityFilter(v: TicketPriority | "ALL") {
    setPriorityFilter(v);
    startTransition(async () => {
      const data = await listTickets({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        priority: v !== "ALL" ? v : undefined,
        assigneeMine: assigneeFilter === "mine",
        fromMine: assigneeFilter === "fromMine",
        search: search || undefined,
      });
      setTickets(data);
    });
  }

  function applyAssigneeFilter(v: "all" | "mine" | "fromMine") {
    setAssigneeFilter(v);
    startTransition(async () => {
      const data = await listTickets({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
        assigneeMine: v === "mine",
        fromMine: v === "fromMine",
        search: search || undefined,
      });
      setTickets(data);
    });
  }

  function applySearch(v: string) {
    setSearch(v);
    startTransition(async () => {
      const data = await listTickets({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
        assigneeMine: assigneeFilter === "mine",
        fromMine: assigneeFilter === "fromMine",
        search: v || undefined,
      });
      setTickets(data);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-display font-bold text-text">Požadavky</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-white text-sm font-semibold hover:bg-gold-light transition-colors"
        >
          <Plus size={16} />
          Nový požadavek
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <input
          className="w-full sm:w-72 px-3 py-2 border border-border bg-surface text-text text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
          placeholder="Hledat…"
          value={search}
          onChange={(e) => applySearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-surface-hover p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => applyStatusFilter(f.value)}
                className={cn(
                  "px-3 py-1 text-xs font-medium transition-colors",
                  statusFilter === f.value
                    ? "bg-gold text-white"
                    : "text-text-mid hover:text-text"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {userRole !== "broker" && (
            <div className="flex gap-1 bg-surface-hover p-1">
              {ASSIGNEE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => applyAssigneeFilter(f.value)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium transition-colors",
                    assigneeFilter === f.value
                      ? "bg-gold text-white"
                      : "text-text-mid hover:text-text"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-1 bg-surface-hover p-1">
            {PRIORITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => applyPriorityFilter(f.value)}
                className={cn(
                  "px-3 py-1 text-xs font-medium transition-colors",
                  priorityFilter === f.value
                    ? "bg-gold text-white"
                    : "text-text-mid hover:text-text"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border overflow-hidden">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-faint">
            <p className="text-sm">Žádné požadavky</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketListRow key={ticket.id} ticket={ticket} />
          ))
        )}
      </div>

      <NewTicketModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          refresh();
        }}
        brokers={brokers}
        clients={clients}
        isBroker={userRole === "broker"}
      />
    </div>
  );
}
