"use server";

import { prisma } from "@/lib/crm/db";
import { unstable_cache } from "next/cache";

export interface CompanyDashboardStats {
  clientCount: number;
  investorCount: number;
  totalDeposits: number;
  totalProfit: number;
  pipelineCounts: Record<string, number>;
  topBrokers: { name: string; totalProfit: number; clientCount: number }[];
}

/**
 * Company-wide dashboard numbers (admin/supervisor view). Identical for every
 * admin, and the underlying tables are large (240k+ clients), so this is cached
 * for 5 minutes. It keeps full-table work to two GROUP BY scans; every other
 * number is derived from the tiny Payment table instead of re-scanning clients.
 */
async function computeCompanyDashboardStats(): Promise<CompanyDashboardStats> {
  const [pipelineGroups, clientCountByBroker, brokers, paidPayments] =
    await Promise.all([
      // Scan #1 — per-stage counts (total client count is their sum)
      prisma.client.groupBy({ by: ["stage"], _count: true }),
      // Scan #2 — clients per broker
      prisma.client.groupBy({ by: ["assignedTo"], _count: true }),
      prisma.user.findMany({
        where: { role: "BROKER", active: true },
        select: { id: true, firstName: true, lastName: true, email: true },
      }),
      // Tiny table — every paid payment
      prisma.payment.findMany({
        where: { paid: true },
        select: { clientId: true, amount: true, profit: true },
      }),
    ]);

  const pipelineCounts: Record<string, number> = {};
  let clientCount = 0;
  for (const g of pipelineGroups) {
    pipelineCounts[g.stage] = g._count;
    clientCount += g._count;
  }

  const totalDeposits = paidPayments.reduce((s, p) => s + p.amount, 0);
  const totalProfit = paidPayments.reduce((s, p) => s + p.profit, 0);
  const investorClientIds = new Set(paidPayments.map((p) => p.clientId));
  const investorCount = investorClientIds.size;

  // Map investor clients → broker (small set: only clients with paid payments)
  const invClients = investorClientIds.size
    ? await prisma.client.findMany({
        where: { id: { in: [...investorClientIds] } },
        select: { id: true, assignedTo: true },
      })
    : [];
  const clientToBroker = new Map(invClients.map((c) => [c.id, c.assignedTo]));

  const profitByBroker = new Map<string, number>();
  for (const p of paidPayments) {
    const brokerId = clientToBroker.get(p.clientId);
    if (!brokerId) continue;
    profitByBroker.set(brokerId, (profitByBroker.get(brokerId) ?? 0) + p.profit);
  }
  const clientCountById = new Map(
    clientCountByBroker.map((c) => [c.assignedTo, c._count])
  );

  const topBrokers = brokers
    .filter((b) => b.email !== "pool@system.local")
    .map((b) => ({
      name: `${b.firstName} ${b.lastName}`,
      totalProfit: profitByBroker.get(b.id) ?? 0,
      clientCount: clientCountById.get(b.id) ?? 0,
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit);

  return {
    clientCount,
    investorCount,
    totalDeposits,
    totalProfit,
    pipelineCounts,
    topBrokers,
  };
}

export const getCompanyDashboardStats = unstable_cache(
  computeCompanyDashboardStats,
  ["dashboard-company-stats"],
  { revalidate: 300 }
);
