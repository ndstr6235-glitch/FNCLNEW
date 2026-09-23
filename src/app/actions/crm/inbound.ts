"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { logAudit } from "./audit";
import {
  buildClientUpdate,
  syncInbox,
  INBOUND_FIELD_LABELS,
  type SyncResult,
} from "@/lib/crm/inbound-sync";

export interface InboundEmailRow {
  id: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  body: string;
  receivedAt: string;
  status: string;
  applied: Record<string, string | number>;
  pending: Record<string, string | number>;
}

function parseJson(value: string): Record<string, string | number> {
  try {
    return JSON.parse(value || "{}") as Record<string, string | number>;
  } catch {
    return {};
  }
}

/** Label for a parsed field, e.g. "bankAccount" -> "Číslo účtu". */
export async function inboundFieldLabel(field: string): Promise<string> {
  return INBOUND_FIELD_LABELS[field] || field;
}

/**
 * Reads the info@ mailbox. Called from the CRM shell every few minutes and by
 * the "Načíst poštu" button; throttled unless `force` is set.
 */
export async function syncInboxAction(force = false): Promise<SyncResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Nepřihlášen", scanned: 0, matched: 0, skipped: 0, unmatched: 0 };
  }

  const result = await syncInbox({ force: force && session.role !== "broker" });

  if (result.matched > 0) {
    revalidatePath("/clients");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function getClientInboundEmails(
  clientId: string
): Promise<InboundEmailRow[]> {
  const session = await getSession();
  if (!session) return [];

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { assignedTo: true },
  });
  if (!client) return [];
  if (session.role === "broker" && client.assignedTo !== session.id) return [];

  const rows = await prisma.inboundEmail.findMany({
    where: { clientId },
    orderBy: { receivedAt: "desc" },
    take: 20,
  });

  return rows.map((r) => ({
    id: r.id,
    fromEmail: r.fromEmail,
    fromName: r.fromName,
    subject: r.subject,
    body: r.body,
    receivedAt: r.receivedAt.toISOString(),
    status: r.status,
    applied: parseJson(r.applied),
    pending: parseJson(r.pending),
  }));
}

/**
 * Confirms one conflicting value — writes it into the card and drops it from
 * the pending list.
 */
export async function confirmInboundField(
  inboundId: string,
  field: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const inbound = await prisma.inboundEmail.findUnique({
    where: { id: inboundId },
    include: { client: true },
  });
  if (!inbound || !inbound.client) {
    return { success: false, error: "Záznam nenalezen" };
  }
  if (session.role === "broker" && inbound.client.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  const pending = parseJson(inbound.pending);
  if (!(field in pending)) return { success: false, error: "Údaj už byl vyřízen" };

  const value = pending[field];
  await prisma.client.update({
    where: { id: inbound.client.id },
    data: buildClientUpdate(inbound.client.metadata, { [field]: value }),
  });

  const applied = { ...parseJson(inbound.applied), [field]: value };
  delete pending[field];

  await prisma.inboundEmail.update({
    where: { id: inboundId },
    data: {
      applied: JSON.stringify(applied),
      pending: JSON.stringify(pending),
      status: Object.keys(pending).length > 0 ? "PENDING" : "DONE",
    },
  });

  const label = INBOUND_FIELD_LABELS[field] || field;
  await logActivity(
    inbound.client.id,
    session.id,
    "CLIENT_UPDATED",
    `${label} přepsáno z e-mailu klienta na „${value}“`
  );

  revalidatePath("/clients");
  return { success: true };
}

/** Rejects one conflicting value — the card keeps what it already had. */
export async function rejectInboundField(
  inboundId: string,
  field: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const inbound = await prisma.inboundEmail.findUnique({
    where: { id: inboundId },
    include: { client: { select: { id: true, assignedTo: true } } },
  });
  if (!inbound || !inbound.client) {
    return { success: false, error: "Záznam nenalezen" };
  }
  if (session.role === "broker" && inbound.client.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  const pending = parseJson(inbound.pending);
  delete pending[field];

  await prisma.inboundEmail.update({
    where: { id: inboundId },
    data: {
      pending: JSON.stringify(pending),
      status: Object.keys(pending).length > 0 ? "PENDING" : "DONE",
    },
  });

  revalidatePath("/clients");
  return { success: true };
}

/**
 * Clears the "waiting for final contract" flag — used once the contract has
 * been sent, or when the flag was raised by mistake.
 */
export async function clearAwaitingContract(
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { assignedTo: true, awaitingContract: true },
  });
  if (!client) return { success: false, error: "Klient nenalezen" };
  if (session.role === "broker" && client.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }
  if (!client.awaitingContract) return { success: true };

  await prisma.client.update({
    where: { id: clientId },
    data: { awaitingContract: false },
  });

  await logActivity(
    clientId,
    session.id,
    "CLIENT_UPDATED",
    "Označeno jako vyřízené — klient už nečeká na finální smlouvu"
  );
  await logAudit(session.id, "AWAITING_CONTRACT_CLEARED", "client", clientId);

  revalidatePath("/clients");
  return { success: true };
}
