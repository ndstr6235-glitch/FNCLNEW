"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { getPoolUserId } from "@/lib/crm/pool-user";
import { getLeadSourcePrefs, saveLeadSourcePrefs } from "@/lib/crm/lead-sources";
import { logAudit } from "@/lib/crm/server-log";

export interface DistributionPerson {
  id: string;
  name: string;
  role: "broker" | "operator";
  quota: number;
  /** Lead database(s) this person draws from; empty = any */
  sources: string[];
  /** Leads waiting to be called right now */
  waiting: number;
}

export interface DistributionHistoryRow {
  userId: string;
  name: string;
  source: string;
  count: number;
  /** ISO date of the most recent assignment */
  lastAt: string;
}

export interface DistributionPlan {
  people: DistributionPerson[];
  /** Databases with leads still in the pool */
  poolSources: { source: string; count: number }[];
  history: DistributionHistoryRow[];
}

/** Who draws leads from which database, and who has received what so far. */
export async function getDistributionPlan(): Promise<DistributionPlan | null> {
  const session = await getSession();
  if (!session || (session.role !== "administrator" && session.role !== "supervisor")) return null;

  const poolId = await getPoolUserId();
  const [users, prefs, poolGroups, historyRaw] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["BROKER", "OPERATOR"] }, active: true, id: { not: poolId } },
      select: { id: true, firstName: true, lastName: true, role: true, dailyLeadQuota: true },
      orderBy: { firstName: "asc" },
    }),
    getLeadSourcePrefs(),
    prisma.client.groupBy({ by: ["source"], where: { assignedTo: poolId }, _count: true }),
    // Assignments made by the distributor (not hand-overs), per person and database
    prisma.$queryRaw<{ userId: string; source: string; cnt: number | bigint; lastAt: string | number | bigint | Date | null }[]>`
      SELECT la."userId" AS userId, c."source" AS source, COUNT(*) AS cnt, MAX(la."createdAt") AS lastAt
      FROM "LeadAssignment" la
      JOIN "Client" c ON c."id" = la."clientId"
      WHERE la."reason" IN ('cron', 'manual')
      GROUP BY la."userId", c."source"`,
  ]);

  const waitingGroups = await prisma.client.groupBy({
    by: ["assignedTo"],
    where: { assignedTo: { in: users.map((u) => u.id) }, lastCallOutcome: "", dnc: false },
    _count: true,
  });
  const waiting = new Map(waitingGroups.map((g) => [g.assignedTo, g._count]));
  const names = new Map(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));

  // SQLite hands DateTime back as ms (number/bigint), ISO text or a Date
  const toIso = (v: string | number | bigint | Date | null) => {
    if (v == null) return "";
    const d =
      v instanceof Date
        ? v
        : typeof v === "bigint" || typeof v === "number"
          ? new Date(Number(v))
          : /^\d+$/.test(v)
            ? new Date(Number(v))
            : new Date(v);
    return isNaN(d.getTime()) ? "" : d.toISOString();
  };

  // Assignments can belong to people who were deactivated since — name them too
  const missing = [...new Set(historyRaw.map((h) => h.userId))].filter((id) => !names.has(id));
  if (missing.length) {
    const others = await prisma.user.findMany({
      where: { id: { in: missing } },
      select: { id: true, firstName: true, lastName: true },
    });
    for (const o of others) names.set(o.id, `${o.firstName} ${o.lastName}`);
  }

  return {
    people: users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      role: u.role === "OPERATOR" ? "operator" : "broker",
      quota: u.dailyLeadQuota,
      sources: prefs[u.id] ?? [],
      waiting: waiting.get(u.id) ?? 0,
    })),
    poolSources: poolGroups
      .map((g) => ({ source: g.source, count: g._count }))
      .sort((a, b) => b.count - a.count),
    history: historyRaw
      .map((h) => ({
        userId: h.userId,
        name: names.get(h.userId) ?? "Neznámý uživatel",
        source: h.source,
        count: Number(h.cnt),
        lastAt: toIso(h.lastAt),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "cs") || b.count - a.count),
  };
}

/** Admin: set the lead database(s) a broker/operator draws from ([] = any). */
export async function setUserLeadSources(
  userId: string,
  sources: string[]
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") return { success: false, error: "Nemáte oprávnění" };

  const prefs = await getLeadSourcePrefs();
  const clean = [...new Set(sources.filter((s) => typeof s === "string"))];
  if (clean.length) prefs[userId] = clean;
  else delete prefs[userId];
  await saveLeadSourcePrefs(prefs);

  await logAudit(
    session.id,
    "LEAD_SOURCE_SET",
    "user",
    userId,
    clean.length ? `Databáze: ${clean.map((s) => s || "(bez zdroje)").join(", ")}` : "Databáze: všechny"
  );
  revalidatePath("/database");
  return { success: true };
}

/**
 * Admin: hand a person a number of leads from one database right now, on top
 * of the automatic daily distribution. Recorded in the history like any other.
 */
export async function assignLeadsManually(input: {
  userId: string;
  /** Client.source to draw from; null = any database */
  source: string | null;
  count: number;
}): Promise<{ success: boolean; assigned?: number; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") return { success: false, error: "Nemáte oprávnění" };

  const count = Math.floor(Number(input.count));
  if (!Number.isFinite(count) || count < 1 || count > 2000) {
    return { success: false, error: "Zadejte počet 1–2000" };
  }

  const poolId = await getPoolUserId();
  const user = await prisma.user.findFirst({
    where: { AND: [{ id: input.userId }, { id: { not: poolId } }], active: true, role: { in: ["BROKER", "OPERATOR"] } },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!user) return { success: false, error: "Uživatel nenalezen" };

  const leads = await prisma.client.findMany({
    where: {
      assignedTo: poolId,
      dnc: false,
      ...(input.source !== null ? { source: input.source } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: count,
    select: { id: true },
  });
  if (leads.length === 0) return { success: false, error: "V této databázi už nic nezbývá" };

  const ids = leads.map((l) => l.id);
  const today = new Date().toISOString().split("T")[0];
  // Only leads still in the pool — guards against a parallel distribution
  const moved = await prisma.client.updateMany({
    where: { id: { in: ids }, assignedTo: poolId },
    data: { assignedTo: user.id, callDate: today },
  });
  await prisma.leadAssignment.createMany({
    data: ids.map((clientId) => ({ clientId, userId: user.id, assignedBy: session.id, reason: "manual" })),
  });

  await logAudit(
    session.id,
    "DISTRIBUTE_LEADS",
    "user",
    user.id,
    `Ručně ${moved.count} leadů z ${input.source === null ? "všech databází" : input.source || "(bez zdroje)"} → ${user.firstName} ${user.lastName}`
  );
  revalidatePath("/database");
  revalidatePath("/dashboard");
  return { success: true, assigned: moved.count };
}
