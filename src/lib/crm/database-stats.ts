import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./db";
import { getPoolUserId } from "./pool-user";

/**
 * "Databáze kontaktů" on the company dashboard: how many contacts came in,
 * how many were handed to brokers and how many were opened — called or
 * e-mailed for the first time.
 *
 * Brokers also add contacts of their own by hand. Those are counted apart so
 * the numbers for our database only speak about imported leads.
 */

export type DatabasePeriod = "today" | "week" | "month" | "all";

export interface DatabasePeriodStats {
  /** Imported into our database */
  added: number;
  assigned: number;
  /** Imported contacts called or e-mailed for the first time */
  opened: number;
  /** Added by hand, per person who added them */
  own: number;
  ownBy: { name: string; count: number }[];
}

export interface DatabaseStats {
  /** Imported contacts — brokers' own are in periods.all.own */
  total: number;
  opened: number;
  /** Handed to a broker, nobody has called or written yet */
  waitingAtBrokers: number;
  inPool: number;
  periods: Record<DatabasePeriod, DatabasePeriodStats>;
  bySource: { source: string; total: number; opened: number }[];
}

const SOURCE_ROWS = 8;

/** Midnight in Czech time — the server runs in UTC. */
function pragueDayStart(): Date {
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Prague" }));
  const offsetMin = Math.round((local.getTime() - now.getTime()) / 60000);
  local.setHours(0, 0, 0, 0);
  return new Date(local.getTime() - offsetMin * 60000);
}

async function computeDatabaseStats(): Promise<DatabaseStats> {
  const poolId = await getPoolUserId();
  const today = pragueDayStart();
  const week = new Date(today.getTime() - 6 * 86400000);
  const month = new Date(today.getTime() - 29 * 86400000);
  const since: Record<Exclude<DatabasePeriod, "all">, Date> = { today, week, month };
  const keys = ["today", "week", "month"] as const;

  const [all, inPool, added, assigned, assignedAll, firstCalls, firstEmails, sources, openedSources, handMade] =
    await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { assignedTo: poolId } }),
      Promise.all(keys.map((k) => prisma.client.count({ where: { createdAt: { gte: since[k] } } }))),
      Promise.all(
        keys.map((k) => prisma.leadAssignment.count({ where: { createdAt: { gte: since[k] } } }))
      ),
      prisma.leadAssignment.count(),
      // First call / first e-mail per contact — both tables only hold contacts
      // somebody worked on, so they stay small next to the client table
      prisma.call.groupBy({ by: ["clientId"], _min: { createdAt: true } }),
      prisma.sentEmail.groupBy({ by: ["clientId"], _min: { createdAt: true } }),
      prisma.client.groupBy({ by: ["source"], _count: true }),
      prisma.client.groupBy({
        by: ["source"],
        where: { OR: [{ calls: { some: {} } }, { sentEmails: { some: {} } }] },
        _count: true,
      }),
      // Every contact created through the form logs who created it
      prisma.activity.findMany({
        where: { type: "CLIENT_CREATED" },
        select: {
          clientId: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

  const ownIds = new Set(handMade.map((a) => a.clientId));
  const ownSince = (d?: Date) => {
    const byName = new Map<string, number>();
    for (const a of handMade) {
      if (d && a.createdAt < d) continue;
      const name = `${a.user.firstName} ${a.user.lastName}`;
      byName.set(name, (byName.get(name) ?? 0) + 1);
    }
    const ownBy = [...byName].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    return { own: ownBy.reduce((n, b) => n + b.count, 0), ownBy };
  };

  // Own contacts get the presentation e-mail the moment they are created, so
  // they would all count as opened — leave them out
  const firstTouch = new Map<string, number>();
  for (const row of [...firstCalls, ...firstEmails]) {
    if (ownIds.has(row.clientId)) continue;
    const at = row._min.createdAt?.getTime();
    if (at === undefined) continue;
    const prev = firstTouch.get(row.clientId);
    if (prev === undefined || at < prev) firstTouch.set(row.clientId, at);
  }
  const openedSince = (d: Date) => {
    let n = 0;
    for (const at of firstTouch.values()) if (at >= d.getTime()) n++;
    return n;
  };

  const opened = firstTouch.size;
  const total = all - ownIds.size;
  const period = (i: number, d: Date): DatabasePeriodStats => {
    const own = ownSince(d);
    return { added: Math.max(0, added[i] - own.own), assigned: assigned[i], opened: openedSince(d), ...own };
  };
  const openedBySource = new Map(openedSources.map((s) => [s.source, s._count]));

  return {
    total,
    opened,
    waitingAtBrokers: Math.max(0, total - inPool - opened),
    inPool,
    periods: {
      today: period(0, today),
      week: period(1, week),
      month: period(2, month),
      all: { added: total, assigned: assignedAll, opened, ...ownSince() },
    },
    bySource: sources
      .map((s) => ({
        source: s.source || "Ručně založené / bez zdroje",
        total: s._count,
        opened: openedBySource.get(s.source) ?? 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, SOURCE_ROWS),
  };
}

// Shares the tag with the pool card so a finished import refreshes both
export const getDatabaseStats = unstable_cache(computeDatabaseStats, ["dashboard-database-stats"], {
  revalidate: 300,
  tags: ["pool-stats"],
});
