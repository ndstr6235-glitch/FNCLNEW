import { prisma } from "./db";
import { getPoolUserId } from "./pool-user";
import { getLeadSourcePrefs } from "./lead-sources";

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
      role: { in: ["BROKER", "OPERATOR"] },
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
  // Which lead database each person draws from (set by the admin on Databáze)
  const sourcePrefs = await getLeadSourcePrefs();

  for (const broker of brokers) {
    // Top up to the quota instead of adding a full quota every day: leads the
    // broker has not called yet count against it, so an idle broker does not
    // drain the pool. Same definition of "waiting" as the calling screen.
    const waiting = await prisma.client.count({
      where: { assignedTo: broker.id, lastCallOutcome: "", dnc: false },
    });
    const needed = Math.max(0, broker.dailyLeadQuota - waiting);

    // Sources are drawn in the order they are listed (first one is used up
    // before the next); no preference = any source, oldest first.
    const leads: { id: string }[] = [];
    const sources = sourcePrefs[broker.id]?.length ? sourcePrefs[broker.id] : [null];
    for (const source of sources) {
      const missing = needed - leads.length;
      if (missing <= 0) break;
      const batch = await prisma.client.findMany({
        where: {
          assignedTo: poolId,
          dnc: false,
          ...(source !== null ? { source } : {}),
        },
        orderBy: { createdAt: "asc" },
        take: missing,
        select: { id: true },
      });
      leads.push(...batch);
    }

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
        link: "/database",
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
