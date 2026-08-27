import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { calculateScore } from "@/lib/crm/scoring";
import { getPoolUserId } from "@/lib/crm/pool-user";
import ClientsPageClient from "@/components/crm/clients/clients-page-client";
import type { Prisma } from "@prisma/client";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ClientsRoute({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const brokerParam = typeof params.broker === "string" ? params.broker : "all";
  const outcomeParam = typeof params.outcome === "string" ? params.outcome : "all";
  const showPool = params.pool === "1";

  const isBroker = session.role === "broker";
  const poolUserId = await getPoolUserId();

  // For admin default view we need IDs of real brokers — SQLite "!= pool"
  // would force a full table scan on 240k rows.
  let realBrokerIds: string[] = [];
  if (!isBroker && brokerParam === "all" && !showPool) {
    const all = await prisma.user.findMany({
      where: { id: { not: poolUserId } },
      select: { id: true },
    });
    realBrokerIds = all.map((u) => u.id);
  }

  // Build WHERE clause
  const where: Prisma.ClientWhereInput = {};
  if (isBroker) {
    where.assignedTo = session.id;
    where.dnc = false;
    if (outcomeParam === "all") {
      // Klienti co odmítli za posledních 180 dní se schovají — vrátí se sami
      // jakmile uplyne 6M (skrz CalEvent +6M retry). Po 180 dnech viditelní.
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
      const sixMonthsAgoStr = sixMonthsAgo.toISOString().split("T")[0];
      where.NOT = {
        AND: [
          { lastCallOutcome: "NEZAJEM" },
          { lastCalledAt: { gte: sixMonthsAgoStr } },
        ],
      };
    }
  } else if (brokerParam !== "all") {
    where.assignedTo = brokerParam;
  } else if (showPool) {
    where.assignedTo = poolUserId;
  } else {
    // Admin default — IN (real broker ids) uses the index
    where.assignedTo = { in: realBrokerIds };
  }

  // Search filter (OR across name, email, phone)
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  // Status filter — "investor" now means "actually paid" (not just contract sent)
  if (status === "investor") {
    where.payments = { some: { paid: true } };
  } else if (status === "prospect") {
    where.payments = { none: { paid: true } };
  }

  // Outcome filter
  if (outcomeParam === "none") {
    where.lastCallOutcome = "";
  } else if (outcomeParam !== "all") {
    where.lastCallOutcome = outcomeParam;
  }

  // Fetch clients — cap at 500 newest to keep the page snappy even with
  // 240k+ records in the pool. Admin uses filters / search / broker dropdown
  // to narrow down; pool itself is browsed via the source filter.
  const CLIENT_PAGE_LIMIT = 500;
  const rawClients = await prisma.client.findMany({
    where,
    include: {
      payments: { select: { amount: true, profit: true, paid: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: CLIENT_PAGE_LIMIT,
  });

  const clients = rawClients.map((c) => {
    // Only paid payments count toward "investor" status and totals
    const paidPayments = c.payments.filter((p) => p.paid);
    const totalDeposit = paidPayments.reduce((s, p) => s + p.amount, 0);
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      email: c.email,
      callDate: c.callDate,
      lastCallOutcome: c.lastCallOutcome,
      isInvestor: paidPayments.length > 0,
      totalDeposit,
      totalProfit: paidPayments.reduce((s, p) => s + p.profit, 0),
      brokerName: `${c.user.firstName} ${c.user.lastName}`,
      brokerId: c.user.id,
      stage: c.stage,
      score: calculateScore({
        totalDeposit,
        paymentCount: paidPayments.length,
        createdAt: c.createdAt,
      }),
    };
  });

  // Total count (without search/status filter but respecting RBAC + pool toggle)
  const totalCountWhere: Prisma.ClientWhereInput = isBroker
    ? { assignedTo: session.id }
    : showPool
    ? { assignedTo: poolUserId }
    : { assignedTo: { in: realBrokerIds } };
  const totalCount = await prisma.client.count({ where: totalCountWhere });

  const outcomeGroups = await prisma.client.groupBy({
    by: ["lastCallOutcome"],
    where: totalCountWhere,
    _count: true,
  });
  const outcomeCounts: Record<string, number> = {};
  for (const g of outcomeGroups) {
    outcomeCounts[g.lastCallOutcome] = g._count;
  }

  // Fetch brokers for filter dropdown (admin/supervisor only) — skip pool sentinel
  let brokers: { id: string; name: string }[] = [];
  if (!isBroker) {
    const rawBrokers = await prisma.user.findMany({
      where: {
        role: "BROKER",
        active: true,
        email: { not: "pool@system.local" },
      },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    });
    brokers = rawBrokers.map((b) => ({
      id: b.id,
      name: `${b.firstName} ${b.lastName}`,
    }));
  }

  const hasFilters = !!(search || status !== "all" || brokerParam !== "all" || outcomeParam !== "all");

  return (
    <ClientsPageClient
      clients={clients}
      brokers={brokers}
      isBroker={isBroker}
      userRole={session.role as "administrator" | "supervisor" | "broker"}
      totalCount={totalCount}
      hasFilters={hasFilters}
      outcomeCounts={outcomeCounts}
      currentOutcome={outcomeParam}
      isPoolView={showPool}
    />
  );
}
