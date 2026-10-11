import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";

/**
 * "Contacted by e-mail" overview for admins and supervisors: one row per
 * person who has been sent at least one e-mail from the CRM.
 */

export interface ContactedFilters {
  senderId?: string;
  template?: string;
  /** Only e-mails sent in the last N days */
  days?: number;
  q?: string;
  page: number;
}

export interface ContactedRow {
  clientId: string;
  name: string;
  email: string;
  phone: string;
  brokerName: string;
  emailCount: number;
  lastSentAt: string;
  lastTemplate: string;
  lastSubject: string;
  lastSender: string;
  repliedAt: string | null;
  lastCallOutcome: string;
  dnc: boolean;
}

export interface ContactedOverview {
  rows: ContactedRow[];
  /** People matching the current filters */
  matchedPeople: number;
  stats: { people: number; emails: number; peopleLast7Days: number; replied: number };
  senders: { id: string; name: string }[];
  templates: string[];
  pageSize: number;
}

export const CONTACTED_PAGE_SIZE = 50;

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export async function getContactedOverview(f: ContactedFilters): Promise<ContactedOverview> {
  const where: Prisma.SentEmailWhereInput = {};
  if (f.senderId) where.userId = f.senderId;
  if (f.template) where.templateLabel = f.template;
  if (f.days) where.createdAt = { gte: daysAgo(f.days) };
  if (f.q) {
    where.client = {
      OR: [{ firstName: { contains: f.q } }, { lastName: { contains: f.q } }],
    };
  }

  const [groups, matched, allPeople, emails, recentPeople, replied, senders, templates] =
    await Promise.all([
      prisma.sentEmail.groupBy({
        by: ["clientId"],
        where,
        _count: { _all: true },
        _max: { createdAt: true },
        orderBy: { _max: { createdAt: "desc" } },
        skip: (f.page - 1) * CONTACTED_PAGE_SIZE,
        take: CONTACTED_PAGE_SIZE,
      }),
      prisma.sentEmail.groupBy({ by: ["clientId"], where }),
      prisma.sentEmail.groupBy({ by: ["clientId"] }),
      prisma.sentEmail.count(),
      prisma.sentEmail.groupBy({ by: ["clientId"], where: { createdAt: { gte: daysAgo(7) } } }),
      prisma.inboundEmail.groupBy({ by: ["clientId"], where: { clientId: { not: null } } }),
      prisma.user.findMany({
        where: { sentEmails: { some: {} } },
        select: { id: true, firstName: true, lastName: true },
        orderBy: { firstName: "asc" },
      }),
      prisma.sentEmail.groupBy({ by: ["templateLabel"] }),
    ]);

  const ids = groups.map((g) => g.clientId);

  const [clients, latest, replies] = await Promise.all([
    prisma.client.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        lastCallOutcome: true,
        dnc: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.sentEmail.findMany({
      where: { ...where, clientId: { in: ids } },
      orderBy: { createdAt: "desc" },
      select: {
        clientId: true,
        subject: true,
        templateLabel: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.inboundEmail.groupBy({
      by: ["clientId"],
      where: { clientId: { in: ids } },
      _max: { receivedAt: true },
    }),
  ]);

  const clientById = new Map(clients.map((c) => [c.id, c]));
  const latestByClient = new Map<string, (typeof latest)[number]>();
  for (const e of latest) if (!latestByClient.has(e.clientId)) latestByClient.set(e.clientId, e);
  const replyByClient = new Map(replies.map((r) => [r.clientId, r._max.receivedAt]));

  const rows: ContactedRow[] = [];
  for (const g of groups) {
    const c = clientById.get(g.clientId);
    const last = latestByClient.get(g.clientId);
    if (!c || !g._max.createdAt) continue;
    rows.push({
      clientId: c.id,
      name: `${c.firstName} ${c.lastName}`.trim(),
      email: c.email,
      phone: c.phone,
      brokerName: `${c.user.firstName} ${c.user.lastName}`,
      emailCount: g._count._all,
      lastSentAt: g._max.createdAt.toISOString(),
      lastTemplate: last?.templateLabel || "",
      lastSubject: last?.subject || "",
      lastSender: last ? `${last.user.firstName} ${last.user.lastName}` : "",
      repliedAt: replyByClient.get(c.id)?.toISOString() ?? null,
      lastCallOutcome: c.lastCallOutcome,
      dnc: c.dnc,
    });
  }

  return {
    rows,
    matchedPeople: matched.length,
    stats: {
      people: allPeople.length,
      emails,
      peopleLast7Days: recentPeople.length,
      replied: replied.length,
    },
    senders: senders.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}` })),
    templates: templates.map((t) => t.templateLabel || "").filter(Boolean).sort(),
    pageSize: CONTACTED_PAGE_SIZE,
  };
}

/** Numbers for the dashboard card. */
export async function getContactedStats() {
  const [people, emails, recent, replied] = await Promise.all([
    prisma.sentEmail.groupBy({ by: ["clientId"] }),
    prisma.sentEmail.count(),
    prisma.sentEmail.groupBy({ by: ["clientId"], where: { createdAt: { gte: daysAgo(7) } } }),
    prisma.inboundEmail.groupBy({ by: ["clientId"], where: { clientId: { not: null } } }),
  ]);
  return {
    people: people.length,
    emails,
    peopleLast7Days: recent.length,
    replied: replied.length,
  };
}
