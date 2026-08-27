"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { createNotification } from "./notifications";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TicketRow {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  resolvedAt: string;
  createdAt: string;
  updatedAt: string;
  fromUserId: string;
  assigneeId: string | null;
  clientId: string | null;
  from: { id: string; firstName: string; lastName: string };
  assignee: { id: string; firstName: string; lastName: string } | null;
  client: { id: string; firstName: string; lastName: string } | null;
  messageCount: number;
}

export interface TicketDetail extends TicketRow {
  messages: {
    id: string;
    message: string;
    createdAt: string;
    user: { id: string; firstName: string; lastName: string };
  }[];
}

export interface TicketStats {
  open: number;
  inProgress: number;
  done: number;
  cancelled: number;
}

interface ListFilters {
  status?: TicketStatus | "ALL";
  assigneeMine?: boolean;
  fromMine?: boolean;
  search?: string;
  priority?: TicketPriority | "ALL";
}

export async function listTickets(filters: ListFilters = {}): Promise<TicketRow[]> {
  const session = await getSession();
  if (!session) return [];

  const where: Record<string, unknown> = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.assigneeMine) {
    where.assigneeId = session.id;
  }

  if (filters.fromMine) {
    where.fromUserId = session.id;
  }

  if (filters.priority && filters.priority !== "ALL") {
    where.priority = filters.priority;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }

  if (session.role === "broker" && !filters.fromMine && !filters.assigneeMine) {
    where.fromUserId = session.id;
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    include: {
      from: { select: { id: true, firstName: true, lastName: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
      client: { select: { id: true, firstName: true, lastName: true } },
      messages: { select: { id: true } },
    },
  });

  return tickets.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status as TicketStatus,
    priority: t.priority as TicketPriority,
    resolvedAt: t.resolvedAt,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    fromUserId: t.fromUserId,
    assigneeId: t.assigneeId,
    clientId: t.clientId,
    from: t.from,
    assignee: t.assignee,
    client: t.client,
    messageCount: t.messages.length,
  }));
}

export async function getTicketDetail(ticketId: string): Promise<TicketDetail | null> {
  const session = await getSession();
  if (!session) return null;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      from: { select: { id: true, firstName: true, lastName: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
      client: { select: { id: true, firstName: true, lastName: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });

  if (!ticket) return null;

  if (
    session.role === "broker" &&
    ticket.fromUserId !== session.id &&
    ticket.assigneeId !== session.id
  ) {
    return null;
  }

  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status as TicketStatus,
    priority: ticket.priority as TicketPriority,
    resolvedAt: ticket.resolvedAt,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    fromUserId: ticket.fromUserId,
    assigneeId: ticket.assigneeId,
    clientId: ticket.clientId,
    from: ticket.from,
    assignee: ticket.assignee,
    client: ticket.client,
    messageCount: ticket.messages.length,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      message: m.message,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    })),
  };
}

export async function createTicket(data: {
  title: string;
  description: string;
  priority: TicketPriority;
  assigneeId?: string;
  clientId?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  if (!data.title.trim()) {
    return { success: false, error: "Název je povinný" };
  }

  const assigneeId = session.role === "broker" ? undefined : data.assigneeId;

  const ticket = await prisma.ticket.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority,
      fromUserId: session.id,
      assigneeId: assigneeId ?? null,
      clientId: data.clientId ?? null,
    },
  });

  if (assigneeId) {
    await createNotification(
      assigneeId,
      "ticket_new",
      "Nový požadavek přiřazen",
      `${session.firstName} ${session.lastName}: ${data.title}`,
      `/tickets/${ticket.id}`
    );
  }

  return { success: true, id: ticket.id };
}

export async function addTicketMessage(
  ticketId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  if (!message.trim()) return { success: false, error: "Zpráva je prázdná" };

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { fromUserId: true, assigneeId: true },
  });

  if (!ticket) return { success: false, error: "Ticket nenalezen" };

  const isParticipant =
    session.role !== "broker" ||
    ticket.fromUserId === session.id ||
    ticket.assigneeId === session.id;

  if (!isParticipant) return { success: false, error: "Přístup odepřen" };

  await prisma.ticketMessage.create({
    data: { ticketId, userId: session.id, message: message.trim() },
  });

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });

  const recipients = new Set<string>();
  recipients.add(ticket.fromUserId);
  if (ticket.assigneeId) recipients.add(ticket.assigneeId);
  recipients.delete(session.id);

  for (const userId of recipients) {
    await createNotification(
      userId,
      "ticket_reply",
      "Nová odpověď v požadavku",
      `${session.firstName} ${session.lastName} odpověděl/a`,
      `/tickets/${ticketId}`
    );
  }

  return { success: true };
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { fromUserId: true, assigneeId: true },
  });

  if (!ticket) return { success: false, error: "Ticket nenalezen" };

  if (
    session.role === "broker" &&
    ticket.assigneeId !== session.id &&
    ticket.fromUserId !== session.id
  ) {
    return { success: false, error: "Přístup odepřen" };
  }

  const today = new Date().toISOString().split("T")[0];
  const resolvedAt = status === "DONE" ? today : "";

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status, resolvedAt },
  });

  if (status === "DONE" && ticket.fromUserId !== session.id) {
    await createNotification(
      ticket.fromUserId,
      "ticket_resolved",
      "Požadavek byl vyřešen",
      `Váš požadavek byl označen jako hotový`,
      `/tickets/${ticketId}`
    );
  }

  return { success: true };
}

export async function assignTicket(
  ticketId: string,
  assigneeId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  if (session.role === "broker") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { assigneeId },
  });

  await createNotification(
    assigneeId,
    "ticket_new",
    "Požadavek vám byl přiřazen",
    `Byl vám přiřazen nový požadavek`,
    `/tickets/${ticketId}`
  );

  return { success: true };
}

export async function getTicketStats(): Promise<TicketStats> {
  const session = await getSession();
  if (!session) return { open: 0, inProgress: 0, done: 0, cancelled: 0 };

  const where =
    session.role === "broker"
      ? { fromUserId: session.id }
      : undefined;

  const [open, inProgress, done, cancelled] = await Promise.all([
    prisma.ticket.count({ where: { ...where, status: "OPEN" } }),
    prisma.ticket.count({ where: { ...where, status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { ...where, status: "DONE" } }),
    prisma.ticket.count({ where: { ...where, status: "CANCELLED" } }),
  ]);

  return { open, inProgress, done, cancelled };
}

export async function getOpenTicketCount(): Promise<number> {
  const session = await getSession();
  if (!session) return 0;

  if (session.role === "broker") {
    return prisma.ticket.count({
      where: { fromUserId: session.id, status: "OPEN" },
    });
  }

  return prisma.ticket.count({
    where: {
      status: "OPEN",
      OR: [{ assigneeId: session.id }, { assigneeId: null }],
    },
  });
}
