import { getSession } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/crm/db";
import { listTickets } from "@/app/actions/crm/tickets";
import TicketsClient from "./tickets-client";
import type { Role } from "@/lib/crm/types";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = session.role as Role;

  const defaultFilters =
    role === "broker"
      ? { fromMine: true as const }
      : { status: "OPEN" as const };

  const [tickets, users, clients] = await Promise.all([
    listTickets(defaultFilters),
    role !== "broker"
      ? prisma.user.findMany({
          where: { active: true },
          select: { id: true, firstName: true, lastName: true },
          orderBy: { firstName: "asc" },
        })
      : Promise.resolve([]),
    prisma.client.findMany({
      where: role === "broker" ? { assignedTo: session.id } : undefined,
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
      take: 200,
    }),
  ]);

  const brokers = users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
  }));

  const clientList = clients.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
  }));

  return (
    <TicketsClient
      initialTickets={tickets}
      userRole={role}
      brokers={brokers}
      clients={clientList}
    />
  );
}
