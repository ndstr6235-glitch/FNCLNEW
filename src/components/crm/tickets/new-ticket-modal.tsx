"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/crm/utils";
import { createTicket, type TicketPriority } from "@/app/actions/crm/tickets";
import { useToast } from "@/components/crm/ui/toast";
import { useRouter } from "next/navigation";

interface Broker {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  brokers?: Broker[];
  clients?: Client[];
  prefilledClientId?: string;
  prefilledClientName?: string;
  isBroker: boolean;
}

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: "LOW", label: "Nízká" },
  { value: "MEDIUM", label: "Střední" },
  { value: "HIGH", label: "Vysoká" },
  { value: "URGENT", label: "Urgentní" },
];

export default function NewTicketModal({
  open,
  onClose,
  brokers = [],
  clients = [],
  prefilledClientId,
  prefilledClientName,
  isBroker,
}: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [clientId, setClientId] = useState(prefilledClientId ?? "");
  const [clientSearch, setClientSearch] = useState(prefilledClientName ?? "");

  if (!open) return null;

  function handleClose() {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setAssigneeId("");
    setClientId(prefilledClientId ?? "");
    setClientSearch(prefilledClientName ?? "");
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createTicket({
        title,
        description,
        priority,
        assigneeId: assigneeId || undefined,
        clientId: clientId || undefined,
      });
      if (result.success) {
        toast("Požadavek vytvořen");
        handleClose();
        router.push(`/tickets/${result.id}`);
      } else {
        toast(result.error ?? "Chyba při vytváření", "error");
      }
    });
  }

  const filteredClients = clientSearch
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase())
      )
    : clients.slice(0, 8);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-surface rounded-t-[20px] sm:rounded-[20px] w-full sm:max-w-lg shadow-xl max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <h2 className="text-base font-semibold text-text">Nový požadavek</h2>
          <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-[8px] hover:bg-surface-hover">
            <X size={18} className="text-text-dim" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-mid mb-1">Název *</label>
            <input
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-surface text-text text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
              placeholder="Stručný popis požadavku…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-mid mb-1">Popis</label>
            <textarea
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-surface text-text text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 resize-none"
              rows={4}
              placeholder="Detailní popis, co je potřeba řešit…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-mid mb-1">Priorita</label>
            <select
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-surface text-text text-sm focus:outline-none focus:border-gold"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {!isBroker && brokers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Přiřadit komu</label>
              <select
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-surface text-text text-sm focus:outline-none focus:border-gold"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">— Nepřiřazen —</option>
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {!prefilledClientId && clients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Klient (volitelné)</label>
              <input
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-surface text-text text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                placeholder="Vyhledat klienta…"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setClientId("");
                }}
              />
              {clientSearch && !clientId && filteredClients.length > 0 && (
                <div className="mt-1 border border-border rounded-[10px] overflow-hidden bg-surface shadow-lg max-h-40 overflow-y-auto">
                  {filteredClients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface-hover text-text"
                      onClick={() => {
                        setClientId(c.id);
                        setClientSearch(c.name);
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {prefilledClientId && prefilledClientName && (
            <div>
              <label className="block text-sm font-medium text-text-mid mb-1">Klient</label>
              <div className="px-3 py-2 rounded-[10px] border border-border bg-surface-hover text-text text-sm">
                {prefilledClientName}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-[10px] border border-border text-text-mid text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-[10px] bg-gold text-white text-sm font-semibold transition-colors",
                isPending || !title.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-gold-light"
              )}
            >
              {isPending ? "Vytvářím…" : "Vytvořit požadavek"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
