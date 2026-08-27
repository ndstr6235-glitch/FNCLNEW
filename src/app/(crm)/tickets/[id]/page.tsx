import { getSession } from "@/lib/crm/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/crm/db";
import { getTicketDetail } from "@/app/actions/crm/tickets";
import TicketDetailClient from "./ticket-detail-client";
import type { Role } from "@/lib/crm/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const [ticket, users] = await Promise.all([
    getTicketDetail(id),
    session.role !== "broker"
      ? prisma.user.findMany({
          where: { active: true },
          select: { id: true, firstName: true, lastName: true },
          orderBy: { firstName: "asc" },
        })
      : Promise.resolve([]),
  ]);

  if (!ticket) notFound();

  const brokers = users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
  }));

  return (
    <TicketDetailClient
      ticket={ticket}
      currentUserId={session.id}
      userRole={session.role as Role}
      brokers={brokers}
    />
  );
}
