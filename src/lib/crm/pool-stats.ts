import { prisma } from "./db";
import { unstable_cache } from "next/cache";
import { getPoolUserId } from "./pool-user";

export interface PoolStats {
  poolSize: number;
  totalDailyDemand: number;
  activeBrokers: number;
  daysOfSupply: number;
  bySource: { source: string; count: number }[];
}

async function computePoolStats(): Promise<PoolStats> {
  const poolId = await getPoolUserId();

  const [poolSize, bySourceRaw, brokers] = await Promise.all([
    prisma.client.count({ where: { assignedTo: poolId } }),
    prisma.client.groupBy({
      by: ["source"],
      where: { assignedTo: poolId },
      _count: true,
    }),
    prisma.user.findMany({
      where: {
        role: "BROKER",
        active: true,
        id: { not: poolId },
        dailyLeadQuota: { gt: 0 },
      },
      select: { dailyLeadQuota: true },
    }),
  ]);

  const totalDailyDemand = brokers.reduce((s, b) => s + b.dailyLeadQuota, 0);
  const daysOfSupply =
    totalDailyDemand > 0 ? Math.floor(poolSize / totalDailyDemand) : 0;

  return {
    poolSize,
    totalDailyDemand,
    activeBrokers: brokers.length,
    daysOfSupply,
    bySource: bySourceRaw
      .map((s) => ({ source: s.source || "(bez zdroje)", count: s._count }))
      .sort((a, b) => b.count - a.count),
  };
}

export const getPoolStats = unstable_cache(computePoolStats, ["dashboard-pool-stats"], {
  revalidate: 300,
});
