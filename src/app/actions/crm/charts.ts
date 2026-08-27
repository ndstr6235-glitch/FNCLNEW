"use server";

import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getPoolUserId } from "@/lib/crm/pool-user";
import { POSITIVE_OUTCOMES } from "@/lib/crm/call-outcomes";
import { FUNNEL_STAGES, FUNNEL_DEAD_BRANCHES } from "@/lib/crm/constants";

export interface MonthlyChartData {
  month: string;
  label: string;
  amount: number;
  profit: number;
}

const CZ_MONTHS = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec",
];

async function computeChartData(
  brokerId: string | null
): Promise<MonthlyChartData[]> {
  const payments = await prisma.payment.findMany({
    where: {
      paid: true,
      ...(brokerId ? { client: { assignedTo: brokerId } } : {}),
    },
    select: { date: true, amount: true, profit: true },
  });

  // Build last 6 months keys
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${CZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    months.push({ key, label });
  }

  // Aggregate payments by month
  const byMonth: Record<string, { amount: number; profit: number }> = {};
  for (const m of months) {
    byMonth[m.key] = { amount: 0, profit: 0 };
  }

  for (const p of payments) {
    // date format: "YYYY-MM-DD"
    const monthKey = p.date.substring(0, 7);
    if (byMonth[monthKey]) {
      byMonth[monthKey].amount += p.amount;
      byMonth[monthKey].profit += p.profit;
    }
  }

  return months.map((m) => ({
    month: m.key,
    label: m.label,
    amount: byMonth[m.key].amount,
    profit: byMonth[m.key].profit,
  }));
}

// Company-wide chart data is identical for every admin/supervisor, so cache it
// for 5 minutes to avoid re-scanning payments on every dashboard load.
const getCompanyChartData = unstable_cache(
  () => computeChartData(null),
  ["dashboard-chart-company"],
  { revalidate: 300 }
);

export async function getChartData(): Promise<MonthlyChartData[]> {
  const session = await getSession();
  if (!session) return [];
  return session.role === "broker"
    ? computeChartData(session.id)
    : getCompanyChartData();
}

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  pctFromPrev: number;
  pctFromPool: number;
  color: string;
}

export interface ConversionFunnelData {
  stages: FunnelStage[];
  dead: { key: string; label: string; count: number }[];
  availableSources: string[];
  availableBrokers: { id: string; name: string }[];
}

async function computeConversionFunnel(filters?: {
  source?: string;
  brokerId?: string;
}): Promise<ConversionFunnelData> {
  const poolUserId = await getPoolUserId();

  const positiveOutcomes = POSITIVE_OUTCOMES as unknown as string[];

  // Raw WHERE fragments for the optional source/broker filters.
  const srcCond = filters?.source
    ? Prisma.sql`AND source = ${filters.source}`
    : Prisma.empty;
  const brkCond = filters?.brokerId
    ? Prisma.sql`AND assignedTo = ${filters.brokerId}`
    : Prisma.empty;
  // "Contacted" excludes the pool unless a specific broker is selected.
  const contactedScope = filters?.brokerId
    ? Prisma.empty
    : Prisma.sql`AND assignedTo != ${poolUserId}`;
  const payScope = filters?.brokerId
    ? Prisma.sql`AND cl.assignedTo = ${filters.brokerId}`
    : Prisma.empty;
  const paySrc = filters?.source
    ? Prisma.sql`AND cl.source = ${filters.source}`
    : Prisma.empty;

  // ONE pass over Client for every column-based count (was 5 separate
  // full-table scans). Payment-derived counts come from the tiny Payment
  // table instead of scanning 240k clients.
  const [clientAgg, payAgg, sourcesGroups, brokers] = await Promise.all([
    prisma.$queryRaw<
      {
        poolCount: bigint;
        contactedCount: bigint;
        interestCount: bigint;
        nezajemCount: bigint;
        dncCount: bigint;
      }[]
    >`
      SELECT
        COUNT(*) FILTER (WHERE assignedTo = ${poolUserId}) AS poolCount,
        COUNT(*) FILTER (WHERE lastCallOutcome != '' ${contactedScope}) AS contactedCount,
        COUNT(*) FILTER (WHERE lastCallOutcome IN (${Prisma.join(positiveOutcomes)})) AS interestCount,
        COUNT(*) FILTER (WHERE lastCallOutcome = 'NEZAJEM') AS nezajemCount,
        COUNT(*) FILTER (WHERE dnc = 1) AS dncCount
      FROM Client
      WHERE 1=1 ${srcCond} ${brkCond}
    `,
    prisma.$queryRaw<{ paidCount: bigint; contractSentCount: bigint }[]>`
      SELECT
        COUNT(DISTINCT p.clientId) FILTER (WHERE p.paid = 1) AS paidCount,
        COUNT(DISTINCT p.clientId) FILTER (
          WHERE p.paid = 0
          AND p.clientId NOT IN (SELECT clientId FROM Payment WHERE paid = 1)
        ) AS contractSentCount
      FROM Payment p
      INNER JOIN Client cl ON cl.id = p.clientId
      WHERE 1=1 ${payScope} ${paySrc}
    `,
    prisma.client.groupBy({
      by: ["source"],
      where: { source: { not: "" } },
    }),
    prisma.user.findMany({
      where: { role: "BROKER", active: true, email: { not: "pool@system.local" } },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const poolCount = Number(clientAgg[0]?.poolCount ?? 0);
  const contactedCount = Number(clientAgg[0]?.contactedCount ?? 0);
  const interestCount = Number(clientAgg[0]?.interestCount ?? 0);
  const nezajemCount = Number(clientAgg[0]?.nezajemCount ?? 0);
  const dncCount = Number(clientAgg[0]?.dncCount ?? 0);
  const paidCount = Number(payAgg[0]?.paidCount ?? 0);
  const contractSentCount = Number(payAgg[0]?.contractSentCount ?? 0);

  const unreachedRaw = await prisma.$queryRaw<{ cnt: bigint }[]>`
    SELECT COUNT(*) as cnt FROM (
      SELECT c.clientId
      FROM Call c
      INNER JOIN Client cl ON cl.id = c.clientId
      WHERE c.outcome = 'NEDOVOLAL'
      ${filters?.brokerId ? Prisma.sql`AND cl.assignedTo = ${filters.brokerId}` : Prisma.empty}
      ${filters?.source ? Prisma.sql`AND cl.source = ${filters.source}` : Prisma.empty}
      GROUP BY c.clientId
      HAVING COUNT(*) >= 5
    ) sub
  `;
  const unreached = Number(unreachedRaw[0]?.cnt ?? 0);

  const rawCounts = [poolCount, contactedCount, interestCount, contractSentCount, paidCount];

  const stages: FunnelStage[] = FUNNEL_STAGES.map((stage, i) => {
    const count = rawCounts[i];
    const prevCount = i === 0 ? poolCount : rawCounts[i - 1];
    return {
      key: stage.key,
      label: stage.label,
      count,
      pctFromPrev: prevCount > 0 ? Math.round((count / prevCount) * 100) : 0,
      pctFromPool: poolCount > 0 ? Math.round((count / poolCount) * 100) : 0,
      color: stage.color,
    };
  });

  const deadCounts = [nezajemCount, dncCount, unreached];
  const dead = FUNNEL_DEAD_BRANCHES.map((branch, i) => ({
    key: branch.key,
    label: branch.label,
    count: deadCounts[i],
  }));

  const availableSources = sourcesGroups
    .map((g) => g.source)
    .filter((s): s is string => !!s)
    .sort();

  const availableBrokers = brokers.map((b) => ({
    id: b.id,
    name: `${b.firstName} ${b.lastName}`,
  }));

  return { stages, dead, availableSources, availableBrokers };
}

// The unfiltered, company-wide funnel is the same for every admin/supervisor
// and is expensive (many full-table counts). Cache it for 5 minutes. Filtered
// views (by source/broker) are interactive and bypass the cache.
const getCompanyFunnel = unstable_cache(
  () => computeConversionFunnel(),
  ["dashboard-funnel-company"],
  { revalidate: 300 }
);

export async function getConversionFunnel(filters?: {
  source?: string;
  brokerId?: string;
}): Promise<ConversionFunnelData | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "broker") return null;

  const hasFilters = !!(filters?.source || filters?.brokerId);
  return hasFilters ? computeConversionFunnel(filters) : getCompanyFunnel();
}
