"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, RefreshCw, Check } from "lucide-react";
import { cn, fmtDateTime } from "@/lib/crm/utils";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  type NotificationRow,
} from "@/app/actions/crm/notifications";
import { syncInboxAction } from "@/app/actions/crm/inbound";

/** Foreground poll for new notifications. */
const POLL_MS = 60_000;
/** How often the open CRM asks the server to read the info@ mailbox. */
const INBOX_SYNC_MS = 3 * 60_000;

const TYPE_ICONS: Record<string, string> = {
  client_assigned: "👤",
  payout_scheduled: "💰",
  client_data_received: "📄",
};

export default function NotificationBell({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  const unread = rows.filter((r) => !r.read).length;

  const load = useCallback(async () => {
    try {
      setRows(await getNotifications());
    } catch {
      // network hiccup — keep the previous list
    }
  }, []);

  useEffect(() => {
    // Polling a server action — the fetch is the point of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  // Keep the mailbox flowing while someone has the CRM open — the server
  // throttles this, so a busy office does not hammer the mail server.
  useEffect(() => {
    const run = () => {
      syncInboxAction().then((res) => {
        if (res.matched > 0) load();
      }).catch(() => {});
    };
    run();
    const t = setInterval(run, INBOX_SYNC_MS);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function handleOpenRow(row: NotificationRow) {
    if (!row.read) {
      await markAsRead(row.id);
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, read: true } : r))
      );
    }
    if (row.link) {
      setOpen(false);
      router.push(row.link);
    }
  }

  async function handleForceSync() {
    setSyncing(true);
    setSyncNote("");
    const res = await syncInboxAction(true);
    setSyncing(false);
    if (!res.ok) {
      setSyncNote(res.error || "Načtení pošty selhalo");
      return;
    }
    setSyncNote(
      res.matched > 0
        ? `Načteno ${res.matched} odpovědí klientů`
        : "Žádné nové odpovědi"
    );
    await load();
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 flex items-center justify-center hover:bg-surface-hover transition-colors"
        aria-label="Upozornění"
      >
        <Bell size={18} className="text-text-mid" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-ruby text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[320px] max-w-[calc(100vw-24px)] bg-surface border border-border shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs font-semibold text-text">Upozornění</span>
            <div className="flex items-center gap-1">
              {isAdmin && (
                <button
                  onClick={handleForceSync}
                  disabled={syncing}
                  title="Načíst poštu z info@"
                  className="p-1.5 text-text-dim hover:text-text disabled:opacity-50"
                >
                  <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                </button>
              )}
              {unread > 0 && (
                <button
                  onClick={async () => {
                    await markAllAsRead();
                    setRows((prev) => prev.map((r) => ({ ...r, read: true })));
                  }}
                  title="Označit vše jako přečtené"
                  className="p-1.5 text-text-dim hover:text-text"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          </div>

          {syncNote && (
            <p className="px-3 py-2 text-[11px] text-text-dim border-b border-border">
              {syncNote}
            </p>
          )}

          <div className="max-h-[360px] overflow-y-auto">
            {rows.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-text-dim">
                Žádná upozornění
              </p>
            ) : (
              rows.map((row) => (
                <button
                  key={row.id}
                  onClick={() => handleOpenRow(row)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 border-b border-border last:border-0 hover:bg-surface-hover transition-colors",
                    !row.read && "bg-brass/5"
                  )}
                >
                  <div className="flex gap-2">
                    <span className="text-sm leading-none pt-0.5">
                      {TYPE_ICONS[row.type] || "🔔"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-xs text-text leading-snug",
                          !row.read && "font-semibold"
                        )}
                      >
                        {row.title}
                      </p>
                      <p className="text-[11px] text-text-mid leading-snug mt-0.5">
                        {row.message}
                      </p>
                      <p className="text-[10px] text-text-dim mt-1">
                        {fmtDateTime(row.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
