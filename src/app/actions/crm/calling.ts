"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";

export interface CallingLead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  birthDate: string;
  source: string;
  createdAt: string;
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
  if (!session || session.role !== "broker") return null;

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

  return {
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    phone: lead.phone,
    city: lead.city,
    birthDate: lead.birthDate,
    source: lead.source,
    createdAt: lead.createdAt.toISOString(),
  };
}

export async function getCallingProgress(): Promise<CallingProgress> {
  const session = await getSession();
  if (!session || session.role !== "broker") {
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
