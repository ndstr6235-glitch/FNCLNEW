"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { revalidatePath } from "next/cache";
import { getHandovers, HANDOVER_REASON, type HandoverInfo } from "@/lib/crm/handover";
import { logActivity } from "./activity";

export interface CallingLead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  birthDate: string;
  source: string;
  createdAt: string;
  /** Set when an operator called the lead cold and handed it over */
  handover: HandoverInfo | null;
}

export interface CallingProgress {
  done: number;
  remaining: number;
  quota: number;
}

export async function getNextLeadToCall(
  excludeIds: string[] = []
): Promise<CallingLead | null> {
  const session = await getSession();
  if (!session || (session.role !== "broker" && session.role !== "operator")) return null;

  const lead = await prisma.client.findFirst({
    where: {
      assignedTo: session.id,
      lastCallOutcome: "",
      dnc: false,
      id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      city: true,
      birthDate: true,
      source: true,
      createdAt: true,
    },
  });

  if (!lead) return null;

  const handover = (await getHandovers([lead.id])).get(lead.id) ?? null;

  return {
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    phone: lead.phone,
    city: lead.city,
    birthDate: lead.birthDate,
    source: lead.source,
    createdAt: lead.createdAt.toISOString(),
    handover,
  };
}

export async function getCallingProgress(): Promise<CallingProgress> {
  const session = await getSession();
  if (!session || (session.role !== "broker" && session.role !== "operator")) {
    return { done: 0, remaining: 0, quota: 0 };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [done, remaining, user] = await Promise.all([
    prisma.call.count({
      where: {
        userId: session.id,
        createdAt: { gte: todayStart },
      },
    }),
    prisma.client.count({
      where: {
        assignedTo: session.id,
        lastCallOutcome: "",
        dnc: false,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.id },
      select: { dailyLeadQuota: true },
    }),
  ]);

  return {
    done,
    remaining,
    quota: user?.dailyLeadQuota ?? 150,
  };
}

export interface HandoverBroker {
  id: string;
  name: string;
}

/** Brokers an operator can hand a lead over to. */
export async function getHandoverBrokers(): Promise<HandoverBroker[]> {
  const session = await getSession();
  if (!session || session.role !== "operator") return [];
  const brokers = await prisma.user.findMany({
    where: { role: "BROKER", active: true, email: { not: "pool@system.local" } },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });
  return brokers.map((b) => ({ id: b.id, name: `${b.firstName} ${b.lastName}` }));
}

/**
 * Operator hands a cold-called lead over to a broker. The broker gets it in
 * Vyvolávání as a lead to call, with the operator's name and note attached.
 */
export async function handoverLead(input: {
  clientId: string;
  brokerId: string;
  note: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "operator") return { success: false, error: "Nemáte oprávnění" };

  const note = input.note.trim();
  if (!note) return { success: false, error: "Napiš poznámku pro makléře" };

  const [client, broker] = await Promise.all([
    prisma.client.findUnique({
      where: { id: input.clientId },
      select: { id: true, assignedTo: true, firstName: true, lastName: true },
    }),
    prisma.user.findFirst({
      where: { id: input.brokerId, role: "BROKER", active: true },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  if (!client) return { success: false, error: "Klient nenalezen" };
  if (client.assignedTo !== session.id) return { success: false, error: "Nemáte oprávnění" };
  if (!broker) return { success: false, error: "Makléř nenalezen" };

  const today = new Date().toISOString().split("T")[0];
  const operatorName = `${session.firstName} ${session.lastName}`.trim();
  const brokerName = `${broker.firstName} ${broker.lastName}`;
  const clientName = `${client.firstName} ${client.lastName}`;

  // The operator's call, with the note the broker reads before calling
  await prisma.call.create({
    data: { clientId: client.id, userId: session.id, outcome: "ZAJEM", note },
  });

  // To the broker as a fresh lead in their Vyvolávání queue
  await prisma.client.update({
    where: { id: client.id },
    data: {
      assignedTo: broker.id,
      lastCallOutcome: "",
      lastCalledAt: today,
      callDate: today,
      stage: "CONTACTED",
    },
  });

  await prisma.leadAssignment.create({
    data: { clientId: client.id, userId: broker.id, assignedBy: session.id, reason: HANDOVER_REASON },
  });

  await logActivity(
    client.id,
    session.id,
    "LEAD_HANDED_OVER",
    `Operátor ${operatorName} předal lead makléři ${brokerName}`,
    { brokerId: broker.id, note }
  );

  await prisma.notification.create({
    data: {
      userId: broker.id,
      type: "LEAD_HANDOVER",
      title: "Nový lead od operátora",
      message: `${operatorName} vám předal(a) ${clientName}: ${note}`,
      link: "/calling",
    },
  });

  revalidatePath("/calling");
  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}
