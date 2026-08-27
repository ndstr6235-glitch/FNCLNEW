import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { fmtCZK } from "@/lib/crm/utils";
import { Users, Landmark, TrendingUp, CalendarClock } from "lucide-react";
import StatCard from "@/components/crm/dashboard/stat-card";
import RecentClients from "@/components/crm/dashboard/recent-clients";
import UpcomingEvents from "@/components/crm/dashboard/upcoming-events";
import TopBrokers from "@/components/crm/dashboard/top-brokers";
import DepositsChart from "@/components/crm/dashboard/deposits-chart";
import ProfitChart from "@/components/crm/dashboard/profit-chart";
import MyDay from "@/components/crm/dashboard/my-day";
import PipelineFunnel from "@/components/crm/dashboard/pipeline-funnel";
import { getChartData, getConversionFunnel } from "@/app/actions/crm/charts";
import { getMyDayData } from "@/app/actions/crm/my-day";
import { getCompanyDashboardStats } from "@/app/actions/crm/dashboard-stats";
import { getPoolStats } from "@/lib/crm/pool-stats";
import LeadPoolWidget from "@/components/crm/dashboard/lead-pool-widget";
import ConversionFunnel from "@/components/crm/dashboard/conversion-funnel";
import type { EventType } from "@/lib/crm/types";

const EVENT_TYPE_MAP: Record<string, EventType> = {
  CALL: "call",
  PAYMENT: "payment",
  REMINDER: "reminder",
  INTEREST: "interest",
  MEETING: "meeting",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const isBroker = session.role === "broker";
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const future = new Date(now);
  future.setDate(future.getDate() + 7);
  const in7Days = future.toISOString().split("T")[0];

  const brokerWhere = isBroker ? { assignedTo: session.id } : {};
  const eventWhere = isBroker ? { userId: session.id } : {};

  // Headline numbers + pipeline + top brokers.
  // Company view (admin/supervisor) is heavy (240k clients) and identical for
  // everyone → computed once and cached for 5 minutes. Broker view is scoped to
  // their own small client set, so it's queried live.
  let clientCount: number;
  let investorCount: number;
  let totalDeposits: number;
  let totalProfit: number;
  let pipelineCounts: Record<string, number> = {};
  let topBrokers: { name: string; totalProfit: number; clientCount: number }[] =
    [];

  if (isBroker) {
    const [cCount, iCount, depAgg, proAgg, pipeGroups] = await Promise.all([
      prisma.client.count({ where: brokerWhere }),
      prisma.client.count({
        where: { ...brokerWhere, payments: { some: { paid: true } } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paid: true, client: { assignedTo: session.id } },
      }),
      prisma.payment.aggregate({
        _sum: { profit: true },
        where: { paid: true, client: { assignedTo: session.id } },
      }),
      prisma.client.groupBy({ by: ["stage"], where: brokerWhere, _count: true }),
    ]);
    clientCount = cCount;
    investorCount = iCount;
    totalDeposits = depAgg._sum.amount ?? 0;
    totalProfit = proAgg._sum.profit ?? 0;
    for (const g of pipeGroups) pipelineCounts[g.stage] = g._count;
  } else {
    const stats = await getCompanyDashboardStats();
    clientCount = stats.clientCount;
    investorCount = stats.investorCount;
    totalDeposits = stats.totalDeposits;
    totalProfit = stats.totalProfit;
    pipelineCounts = stats.pipelineCounts;
    topBrokers = stats.topBrokers;
  }

  // Upcoming events
  const rawEvents = await prisma.calEvent.findMany({
    where: {
      ...eventWhere,
      date: { gte: today, lte: in7Days },
    },
    include: { client: { select: { firstName: true, lastName: true } } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    take: 10,
  });
  const upcomingEvents = rawEvents.map((e) => ({
    id: e.id,
    type: EVENT_TYPE_MAP[e.type] || ("call" as EventType),
    title: e.title,
    date: e.date,
    time: e.time,
    clientName: e.client
      ? `${e.client.firstName} ${e.client.lastName}`
      : undefined,
  }));

  // Recent clients
  const rawClients = await prisma.client.findMany({
    where: brokerWhere,
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { payments: { select: { amount: true, paid: true } } },
  });
  const recentClients = rawClients.map((c) => {
    const paid = c.payments.filter((p) => p.paid);
    return {
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      isInvestor: paid.length > 0,
      totalDeposit: paid.reduce((s, p) => s + p.amount, 0),
    };
  });

  // Chart data
  const chartData = await getChartData();

  // My Day data
  const myDayData = await getMyDayData();

  // Pool stats + conversion funnel (admin/supervisor only, both cached 5 min)
  const poolStats = !isBroker ? await getPoolStats() : null;
  const funnelData = !isBroker ? await getConversionFunnel() : null;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold text-text">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-mid">
          Vítejte zpět, {session.firstName}
        </p>
      </div>

      {/* My Day */}
      <MyDay
        tasks={myDayData.tasks}
        followUps={myDayData.followUps}
        isCompanyView={!isBroker}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:grid-cols-4 lg:gap-6">
        <StatCard
          label="Klientů"
          value={clientCount.toString()}
          subtitle={`${investorCount} investorů`}
          accentColor="sapphire"
          icon={<Users size={16} />}
        />
        <StatCard
          label="Celkové vklady"
          value={fmtCZK(totalDeposits)}
          subtitle={`${investorCount} investorů`}
          accentColor="emerald"
          icon={<Landmark size={16} />}
        />
        <StatCard
          label="Výdělek"
          value={fmtCZK(totalProfit)}
          subtitle={isBroker ? "můj výdělek" : "celkový výdělek"}
          accentColor="gold"
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Nadcházející události"
          value={upcomingEvents.length.toString()}
          subtitle="příštích 7 dní"
          accentColor="amber"
          icon={<CalendarClock size={16} />}
        />
      </div>

      {/* Charts + Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <DepositsChart data={chartData} />
        <ProfitChart data={chartData} />
        <PipelineFunnel counts={pipelineCounts} />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <RecentClients clients={recentClients} />
        <UpcomingEvents events={upcomingEvents} />
        <TopBrokers brokers={topBrokers} visible={!isBroker} />
      </div>

      {/* Lead pool (admin/supervisor only) */}
      {poolStats && (
        <LeadPoolWidget
          stats={poolStats}
          isAdmin={session.role === "administrator"}
        />
      )}

      {/* Conversion funnel (admin/supervisor only) */}
      {funnelData && <ConversionFunnel initialData={funnelData} />}
    </div>
  );
}
