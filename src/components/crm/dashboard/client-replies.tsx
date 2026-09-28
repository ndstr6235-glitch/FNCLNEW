import Link from "next/link";
import { CornerDownLeft, FileSignature } from "lucide-react";
import { fmtDateTime } from "@/lib/crm/utils";

export interface ReplyRow {
  id: string;
  clientId: string;
  clientName: string;
  fromEmail: string;
  subject: string;
  preview: string;
  receivedAt: string;
  /** Reply carried data for the contract */
  hasContractData: boolean;
}

/**
 * Sits at the top of the dashboard so a reply is the first thing seen after
 * logging in. Each row opens the client's e-mail thread.
 */
export default function ClientReplies({ replies }: { replies: ReplyRow[] }) {
  if (replies.length === 0) return null;

  return (
    <div className="border-2 border-emerald/40 bg-emerald/5">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald/20">
        <CornerDownLeft size={16} className="text-emerald shrink-0" />
        <span className="text-sm font-semibold text-emerald">
          Klienti odpověděli
        </span>
        <span className="ml-auto text-xs text-text-dim bg-surface rounded-full px-2 py-0.5">
          {replies.length}
        </span>
      </div>

      <div className="divide-y divide-emerald/15">
        {replies.map((reply) => (
          <Link
            key={reply.id}
            href={`/clients?open=${reply.clientId}&tab=email`}
            className="flex items-start gap-3 px-4 py-3 hover:bg-surface-hover transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-text">
                  {reply.clientName}
                </span>
                {reply.hasContractData && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-ruby/15 border border-ruby text-ruby text-[10px] font-bold uppercase tracking-wide animate-pulse">
                    <FileSignature size={10} />
                    Údaje ke smlouvě
                  </span>
                )}
                <span className="text-[11px] text-text-dim">
                  {fmtDateTime(reply.receivedAt)}
                </span>
              </div>
              <p className="text-xs text-text-mid mt-1 line-clamp-2">
                {reply.preview || reply.subject || "(prázdná zpráva)"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
