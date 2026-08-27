import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { getMonthEvents } from "@/app/actions/crm/calendar";
import CalendarPageClient from "@/components/crm/calendar/calendar-page-client";

export default async function CalendarRoute() {
  const session = await getSession();
  if (!session) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const isBroker = session.role === "broker";

  // Fetch events for current month
  const events = await getMonthEvents(year, month);

  // Fetch clients for event form dropdown
  const rawClients = await prisma.client.findMany({
    where: isBroker ? { assignedTo: session.id } : {},
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });
  const clients = rawClients.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
  }));

  return (
    <CalendarPageClient
      initialEvents={events}
      initialYear={year}
      initialMonth={month}
      clients={clients}
    />
  );
}
