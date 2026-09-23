import "server-only";
import { prisma } from "@/lib/crm/db";
import { fetchRecentMessages, getImapConfig } from "@/lib/crm/inbound-imap";
import {
  hasContractData,
  parseClientData,
  stripQuotedText,
  type ParsedClientData,
} from "@/lib/crm/inbound-parse";

/**
 * Pulls client replies from the info@ mailbox and turns them into contract
 * data on the client card.
 *
 * Rules:
 *  - a field the card does not have yet is filled in automatically
 *  - a field that differs from what the card holds is stored as pending and
 *    waits for a human to confirm it in the client drawer
 *  - either way the client is flagged `awaitingContract` and the broker plus
 *    admins/supervisors get a notification
 */

const LAST_SYNC_KEY = "inbox_last_sync";
/** Minimum gap between two on-demand syncs triggered from the CRM UI. */
const THROTTLE_MS = 3 * 60 * 1000;

export interface SyncResult {
  ok: boolean;
  error?: string;
  scanned: number;
  matched: number;
  skipped: number;
  unmatched: number;
}

/** Human-readable labels, used in notifications and in the drawer. */
export const INBOUND_FIELD_LABELS: Record<string, string> = {
  firstName: "Jméno",
  lastName: "Příjmení",
  birthDate: "Datum narození",
  phone: "Telefon",
  email: "E-mail",
  street: "Ulice",
  city: "Město",
  zip: "PSČ",
  bankAccount: "Číslo účtu",
  investmentAmount: "Částka investice",
  rodneCislo: "Rodné číslo",
  cisloOp: "Číslo OP",
};

export async function getLastSync(): Promise<Date | null> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: LAST_SYNC_KEY },
  });
  return row ? new Date(row.value) : null;
}

async function setLastSync(when: Date): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: LAST_SYNC_KEY },
    create: { key: LAST_SYNC_KEY, value: when.toISOString() },
    update: { value: when.toISOString() },
  });
}

/** Case-insensitive client lookup by e-mail address. */
async function findClientByEmail(email: string) {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM Client WHERE lower(email) = ${email.toLowerCase()} LIMIT 1
  `;
  if (rows.length === 0) return null;
  return prisma.client.findUnique({ where: { id: rows[0].id } });
}

export async function syncInbox(
  options: { force?: boolean } = {}
): Promise<SyncResult> {
  const empty: SyncResult = {
    ok: false,
    scanned: 0,
    matched: 0,
    skipped: 0,
    unmatched: 0,
  };

  const config = getImapConfig();
  if (!config) {
    return { ...empty, error: "Schránka není nastavená (chybí IMAP_* proměnné)" };
  }

  const last = await getLastSync();
  if (!options.force && last && Date.now() - last.getTime() < THROTTLE_MS) {
    return { ...empty, ok: true };
  }

  let messages;
  try {
    messages = await fetchRecentMessages(config);
  } catch (err) {
    console.error("IMAP sync failed:", err);
    return {
      ...empty,
      error: "Nepodařilo se připojit ke schránce info@",
    };
  }

  await setLastSync(new Date());

  const result: SyncResult = { ...empty, ok: true, scanned: messages.length };

  for (const msg of messages) {
    const existing = await prisma.inboundEmail.findUnique({
      where: { messageId: msg.messageId },
      select: { id: true },
    });
    if (existing) {
      result.skipped++;
      continue;
    }

    // Our own outgoing mail landing in the mailbox — never process it
    if (msg.fromEmail.endsWith("@puskinpartners.cz")) {
      result.skipped++;
      continue;
    }

    const client = await findClientByEmail(msg.fromEmail);
    const data = parseClientData(msg.body);
    const body = stripQuotedText(msg.body).slice(0, 8000);

    if (!client) {
      await prisma.inboundEmail.create({
        data: {
          messageId: msg.messageId,
          fromEmail: msg.fromEmail,
          fromName: msg.fromName,
          subject: msg.subject,
          body,
          receivedAt: msg.receivedAt,
          status: "NEW",
        },
      });
      result.unmatched++;
      continue;
    }

    if (!hasContractData(data)) {
      // A reply with no contract data (thanks, questions…) — keep it on the
      // card for context, but do not raise the contract flag.
      await prisma.inboundEmail.create({
        data: {
          messageId: msg.messageId,
          fromEmail: msg.fromEmail,
          fromName: msg.fromName,
          subject: msg.subject,
          body,
          receivedAt: msg.receivedAt,
          clientId: client.id,
          status: "DONE",
        },
      });
      result.skipped++;
      continue;
    }

    const { applied, pending } = splitAgainstCard(client, data);

    if (Object.keys(applied).length > 0) {
      await prisma.client.update({
        where: { id: client.id },
        data: buildClientUpdate(client.metadata, applied),
      });
    }

    await prisma.client.update({
      where: { id: client.id },
      data: { awaitingContract: true },
    });

    await prisma.inboundEmail.create({
      data: {
        messageId: msg.messageId,
        fromEmail: msg.fromEmail,
        fromName: msg.fromName,
        subject: msg.subject,
        body,
        receivedAt: msg.receivedAt,
        clientId: client.id,
        applied: JSON.stringify(applied),
        pending: JSON.stringify(pending),
        status: Object.keys(pending).length > 0 ? "PENDING" : "DONE",
      },
    });

    const clientName = `${client.firstName} ${client.lastName}`.trim();
    const appliedCount = Object.keys(applied).length;
    const pendingCount = Object.keys(pending).length;

    await prisma.activity.create({
      data: {
        clientId: client.id,
        userId: client.assignedTo,
        type: "CLIENT_DATA_RECEIVED",
        description:
          `Klient zaslal údaje ke smlouvě — doplněno ${appliedCount} polí` +
          (pendingCount > 0 ? `, ${pendingCount} čeká na potvrzení` : ""),
        metadata: JSON.stringify({ applied, pending, from: msg.fromEmail }),
      },
    });

    const recipients = await prisma.user.findMany({
      where: {
        active: true,
        OR: [
          { id: client.assignedTo },
          { role: { in: ["ADMINISTRATOR", "SUPERVISOR"] } },
        ],
      },
      select: { id: true },
    });

    if (recipients.length > 0) {
      await prisma.notification.createMany({
        data: recipients.map((u) => ({
          userId: u.id,
          type: "client_data_received",
          title: "Klient zaslal údaje — čeká na finální smlouvu",
          message:
            `${clientName} odpověděl na e-mail a poslal údaje ke smlouvě.` +
            (pendingCount > 0
              ? ` ${pendingCount} údajů se liší od karty — potvrďte je.`
              : ""),
          link: `/clients?open=${client.id}`,
        })),
      });
    }

    result.matched++;
  }

  return result;
}

type ClientRecord = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  street: string;
  city: string;
  zip: string;
  bankAccount: string;
  investmentAmount: number;
  metadata: string;
};

/**
 * Splits parsed data into what can be written straight away (card field is
 * empty) and what conflicts with an existing value (needs confirmation).
 */
export function splitAgainstCard(
  client: ClientRecord,
  data: ParsedClientData
): { applied: Record<string, string | number>; pending: Record<string, string | number> } {
  const applied: Record<string, string | number> = {};
  const pending: Record<string, string | number> = {};

  let meta: Record<string, string> = {};
  try {
    meta = JSON.parse(client.metadata || "{}") as Record<string, string>;
  } catch {
    meta = {};
  }

  const consider = (
    field: string,
    incoming: string | number | undefined,
    current: string | number
  ) => {
    if (incoming === undefined || incoming === "" || incoming === 0) return;
    const isEmpty = current === "" || current === 0 || current === null;
    if (isEmpty) {
      applied[field] = incoming;
    } else if (String(current).trim() !== String(incoming).trim()) {
      pending[field] = incoming;
    }
  };

  consider("firstName", data.firstName, client.firstName);
  consider("lastName", data.lastName, client.lastName);
  consider("birthDate", data.birthDate, client.birthDate);
  consider("phone", data.phone, client.phone);
  consider("street", data.street, client.street);
  consider("city", data.city, client.city);
  consider("zip", data.zip, client.zip);
  consider("bankAccount", data.bankAccount, client.bankAccount);
  consider("investmentAmount", data.investmentAmount, client.investmentAmount);
  consider("rodneCislo", data.rodneCislo, meta.rodne_cislo || "");
  consider("cisloOp", data.cisloOp, meta.cislo_op || "");

  return { applied, pending };
}

/** Maps field names onto the Prisma update payload (metadata included). */
export function buildClientUpdate(
  currentMetadata: string,
  values: Record<string, string | number>
): Record<string, unknown> {
  const update: Record<string, unknown> = {};
  let meta: Record<string, string> = {};
  try {
    meta = JSON.parse(currentMetadata || "{}") as Record<string, string>;
  } catch {
    meta = {};
  }
  let metaTouched = false;

  for (const [field, value] of Object.entries(values)) {
    switch (field) {
      case "rodneCislo":
        meta.rodne_cislo = String(value);
        metaTouched = true;
        break;
      case "cisloOp":
        meta.cislo_op = String(value);
        metaTouched = true;
        break;
      case "investmentAmount":
        update.investmentAmount = Number(value);
        break;
      default:
        update[field] = String(value);
    }
  }

  if (metaTouched) update.metadata = JSON.stringify(meta);
  return update;
}
