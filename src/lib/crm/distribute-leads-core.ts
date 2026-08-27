import { prisma } from "./db";
import { getPoolUserId } from "./pool-user";

export interface BrokerAssignmentSummary {
  brokerId: string;
  brokerName: string;
  quota: number;
  assigned: number;
}

export interface DistributeLeadsResult {
  totalAssigned: number;
  poolRemainingBefore: number;
  poolRemainingAfter: number;
  perBroker: BrokerAssignmentSummary[];
  poolLowWarning: boolean;
}

export async function distributeLeads(
  triggeredBy: "cron" | "manual" = "cron"
): Promise<DistributeLeadsResult> {
  const poolId = await getPoolUserId();
  const today = new Date().toISOString().split("T")[0];

  const poolRemainingBefore = await prisma.client.count({
    where: { assignedTo: poolId },
  });

  const brokers = await prisma.user.findMany({
    where: {
      role: "BROKER",
      active: true,
      id: { not: poolId },
      dailyLeadQuota: { gt: 0 },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dailyLeadQuota: true,
    },
  });

  const perBroker: BrokerAssignmentSummary[] = [];

  for (const broker of brokers) {
    const leads = await prisma.client.findMany({
      where: { assignedTo: poolId, dnc: false },
      orderBy: { createdAt: "asc" },
      take: broker.dailyLeadQuota,
      select: { id: true },
    });

    if (leads.length === 0) {
      perBroker.push({
        brokerId: broker.id,
        brokerName: `${broker.firstName} ${broker.lastName}`,
        quota: broker.dailyLeadQuota,
        assigned: 0,
      });
      continue;
    }

    const ids = leads.map((l) => l.id);

    await prisma.client.updateMany({
      where: { id: { in: ids } },
      data: {
        assignedTo: broker.id,
        callDate: today,
      },
    });

    await prisma.leadAssignment.createMany({
      data: ids.map((cid) => ({
        clientId: cid,
        userId: broker.id,
        assignedBy: poolId,
        reason: triggeredBy,
      })),
    });

    perBroker.push({
      brokerId: broker.id,
      brokerName: `${broker.firstName} ${broker.lastName}`,
      quota: broker.dailyLeadQuota,
      assigned: leads.length,
    });
  }

  const totalAssigned = perBroker.reduce((s, b) => s + b.assigned, 0);
  const poolRemainingAfter = poolRemainingBefore - totalAssigned;
  const totalDailyDemand = brokers.reduce((s, b) => s + b.dailyLeadQuota, 0);
  const poolLowWarning =
    totalDailyDemand > 0 && poolRemainingAfter < totalDailyDemand * 3;

  if (poolLowWarning) {
    const admins = await prisma.user.findMany({
      where: {
        OR: [{ role: "ADMINISTRATOR" }, { role: "SUPERVISOR" }],
        active: true,
      },
      select: { id: true },
    });
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: "LEADS_LOW",
        title: "Pool leadu dochazi",
        message: `Zbyva ${poolRemainingAfter} leadu, denni spotreba ${totalDailyDemand}. Dopln import.`,
        link: "/clients?source=pool",
      })),
    });
  }

  return {
    totalAssigned,
    poolRemainingBefore,
    poolRemainingAfter,
    perBroker,
    poolLowWarning,
  };
}
