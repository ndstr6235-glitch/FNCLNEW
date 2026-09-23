import "server-only";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

/**
 * Reads the info@ mailbox over IMAP (Active24). Messages are only read —
 * nothing is deleted, moved, or marked, so the mailbox keeps working as usual
 * for whoever opens it in a mail client.
 */

export interface FetchedMessage {
  messageId: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  body: string;
  receivedAt: Date;
}

export interface ImapConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export function getImapConfig(): ImapConfig | null {
  const host = process.env.IMAP_HOST;
  const user = process.env.IMAP_USER;
  const password = process.env.IMAP_PASSWORD;
  if (!host || !user || !password) return null;

  return {
    host,
    port: Number(process.env.IMAP_PORT || 993),
    user,
    password,
  };
}

/**
 * Fetches messages received in the last `sinceDays` days, newest last.
 * Caps at `limit` messages so one run can never blow the function timeout.
 */
export async function fetchRecentMessages(
  config: ImapConfig,
  sinceDays = 14,
  limit = 60
): Promise<FetchedMessage[]> {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: true,
    auth: { user: config.user, pass: config.password },
    logger: false,
    socketTimeout: 30_000,
  });

  const messages: FetchedMessage[] = [];
  await client.connect();

  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
      const uids = await client.search({ since }, { uid: true });
      if (!uids || uids.length === 0) return [];

      const recent = uids.slice(-limit);

      for await (const msg of client.fetch(
        recent,
        { uid: true, source: true, envelope: true },
        { uid: true }
      )) {
        if (!msg.source) continue;

        const parsed = await simpleParser(msg.source);
        const from = parsed.from?.value?.[0];
        const fromEmail = (from?.address || "").toLowerCase();
        if (!fromEmail) continue;

        messages.push({
          messageId:
            parsed.messageId || `uid-${msg.uid}@${config.host}`,
          fromEmail,
          fromName: from?.name || "",
          subject: parsed.subject || "",
          body: parsed.text || stripHtml(parsed.html || ""),
          receivedAt: parsed.date || new Date(),
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => client.close());
  }

  return messages;
}

function stripHtml(html: string | false): string {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
