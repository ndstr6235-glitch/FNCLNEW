"use server";

import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";

export interface DayTask {
  id: string;
  type: "call" | "payment" | "reminder" | "meeting";
  title: string;
  time: string;
  clientId: string | null;
  clientName: string | null;
  clientPhone: string | null;
  done: boolean;
}

export interface FollowUp {
  id: string;
  clientId: string;
  name: string;
  phone: string;
  amount: number;
  paymentDate: string;
  daysOverdue: number;
}

export interface MyDayData {
  tasks: DayTask[];
  followUps: FollowUp[];
  brokerName?: string;
}

const TYPE_MAP: Record<string, DayTask["type"]> = {
  CALL: "call",
  PAYMENT: "payment",
  REMINDER: "reminder",
  MEETING: "meeting",
};

export async function getMyDayData(): Promise<MyDayData> {
  const session = await getSession();
  if (!session) return { tasks: [], followUps: [] };

  const isBroker = session.role === "broker";
  const today = new Date().toISOString().split("T")[0];

  // Today's events
  const events = await prisma.calEvent.findMany({
    where: {
      date: today,
      ...(isBroker ? { userId: session.id } : {}),
    },
    include: {
      client: { select: { firstName: true, lastName: true, phone: true } },
    },
    orderBy: [{ time: "asc" }],
  });

  const tasks: DayTask[] = events.map((e) => ({
    id: e.id,
    type: TYPE_MAP[e.type] || "call",
    title: e.title,
    time: e.time,
    clientId: e.clientId,
    clientName: e.client ? `${e.client.firstName} ${e.client.lastName}` : null,
    clientPhone: e.client?.phone ?? null,
    done: false,
  }));

  // Follow-ups: NEZAPLACENÉ platby s datem do dneška. Smlouva odeslána,
  // ale admin ještě nepotvrdil příchod peněz.
  const unpaidPayments = await prisma.payment.findMany({
    where: {
      paid: false,
      date: { lte: today },
      ...(isBroker ? { client: { assignedTo: session.id } } : {}),
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
    orderBy: { date: "asc" },
    take: 50,
  });

  const followUps: FollowUp[] = unpaidPayments.map((p) => {
    const diffMs = new Date(today).getTime() - new Date(p.date).getTime();
    const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return {
      id: p.id,
      clientId: p.client.id,
      name: `${p.client.firstName} ${p.client.lastName}`,
      phone: p.client.phone,
      amount: p.amount,
      paymentDate: p.date,
      daysOverdue,
    };
  });

  return { tasks, followUps };
}

export async function markTaskDone(eventId: string, note?: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  // Add a note to the event if provided
  if (note) {
    await prisma.calEvent.update({
      where: { id: eventId },
      data: { note },
    });
  }

  // Log activity if event has a client
  const event = await prisma.calEvent.findUnique({
    where: { id: eventId },
    select: { clientId: true, title: true, type: true },
  });

  if (event?.clientId) {
    const { logActivity } = await import("./activity");
    await logActivity(
      event.clientId,
      session.id,
      "EVENT_CREATED",
      `Splněno: ${event.title}`,
    );
  }
}
