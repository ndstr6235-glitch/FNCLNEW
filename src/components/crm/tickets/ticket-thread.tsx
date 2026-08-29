"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/crm/utils";
import { addTicketMessage } from "@/app/actions/crm/tickets";
import { useToast } from "@/components/crm/ui/toast";

interface Message {
  id: string;
  message: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string };
}

interface Props {
  ticketId: string;
  messages: Message[];
  currentUserId: string;
  onMessageAdded: () => void;
}

function initials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketThread({ ticketId, messages, currentUserId, onMessageAdded }: Props) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text;
    setText("");
    startTransition(async () => {
      const result = await addTicketMessage(ticketId, msg);
      if (result.success) {
        onMessageAdded();
      } else {
        toast(result.error ?? "Chyba při odesílání", "error");
        setText(msg);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 && (
        <p className="text-sm text-text-dim text-center py-6">Zatím žádné zprávy</p>
      )}

      {messages.map((m) => {
        const isOwn = m.user.id === currentUserId;
        return (
          <div key={m.id} className={cn("flex gap-3", isOwn ? "flex-row-reverse" : "flex-row")}>
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold shrink-0 mt-1">
              {initials(m.user.firstName, m.user.lastName)}
            </div>
            <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-medium text-text-mid">
                  {m.user.firstName} {m.user.lastName}
                </span>
                <span className="text-[10px] text-text-faint">{formatTime(m.createdAt)}</span>
              </div>
              <div
                className={cn(
                  "px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words",
                  isOwn
                    ? "bg-gold text-white rounded-tr-[4px]"
                    : "bg-surface-hover text-text rounded-tl-[4px] border border-border"
                )}
              >
                {m.message}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />

      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-border sticky bottom-0 bg-surface pb-2">
        <textarea
          className="flex-1 px-3 py-2 border border-border bg-surface text-text text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 resize-none"
          placeholder="Napište odpověď…"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
        />
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className={cn(
            "self-end px-3 py-2 bg-gold text-white transition-colors",
            isPending || !text.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-gold-light"
          )}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
