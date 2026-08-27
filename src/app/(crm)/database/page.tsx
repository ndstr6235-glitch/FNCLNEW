import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { calculateScore } from "@/lib/crm/scoring";
import { getPoolUserId } from "@/lib/crm/pool-user";
import ClientsPageClient from "@/components/crm/clients/clients-page-client";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * /database = lead pool view. Same UI as /clients but defaults to pool
 * (assignedTo = poolUserId). Admin/supervisor only.
 */
export default async function DatabaseRoute({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "broker") redirect("/dashboard");

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const outcomeParam =
    typeof params.outcome === "string" ? params.outcome : "all";
  const page = Math.max(
    1,
    parseInt(typeof params.page === "string" ? params.page : "1") || 1
  );
  const PAGE_SIZE = 200;

  const poolUserId = await getPoolUserId();

  const where: Prisma.ClientWhereInput = { assignedTo: poolUserId };

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }
  if (status === "investor") where.payments = { some: { paid: true } };
  else if (status === "prospect") where.payments = { none: { paid: true } };
  if (outcomeParam === "none") where.lastCallOutcome = "";
  else if (outcomeParam !== "all") where.lastCallOutcome = outcomeParam;

  const [rawClients, totalCount, rawBrokers] = await Promise.all([
    prisma.client.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        callDate: true,
        lastCallOutcome: true,
        stage: true,
        createdAt: true,
      },
      orderBy: { id: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.client.count({ where: { assignedTo: poolUserId } }),
    prisma.user.findMany({
      where: {
        role: "BROKER",
        active: true,
        email: { not: "pool@system.local" },
      },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);
  // outcomeCounts přeskočíme pro pool view (groupBy přes 240k je pomalý)
  const outcomeGroups: { lastCallOutcome: string; _count: number }[] = [];

  const clients = rawClients.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    email: c.email,
    callDate: c.callDate,
    lastCallOutcome: c.lastCallOutcome,
    isInvestor: false, // pool klienti nikdy nejsou investoři
    totalDeposit: 0,
    totalProfit: 0,
    brokerName: "Volný pool",
    brokerId: poolUserId,
    stage: c.stage,
    score: calculateScore({
      totalDeposit: 0,
      paymentCount: 0,
      createdAt: c.createdAt,
    }),
  }));

  const outcomeCounts: Record<string, number> = {};
  for (const g of outcomeGroups) {
    outcomeCounts[g.lastCallOutcome] = g._count;
  }

  const brokers = rawBrokers.map((b) => ({
    id: b.id,
    name: `${b.firstName} ${b.lastName}`,
  }));

  const hasFilters = !!(
    search ||
    status !== "all" ||
    outcomeParam !== "all"
  );

  return (
    <ClientsPageClient
      clients={clients}
      brokers={brokers}
      isBroker={false}
      userRole={session.role as "administrator" | "supervisor"}
      totalCount={totalCount}
      hasFilters={hasFilters}
      outcomeCounts={outcomeCounts}
      currentOutcome={outcomeParam}
      isPoolView={true}
      currentPage={page}
      pageSize={PAGE_SIZE}
    />
  );
}
