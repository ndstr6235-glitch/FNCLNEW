import "server-only";
import { prisma } from "./db";

/** Lead an operator called cold and handed over to a broker. */
export interface HandoverInfo {
  operatorName: string;
  /** ISO timestamp of the handover */
  at: string;
  /** The operator's note from the call */
  note: string;
}

/** LeadAssignment.reason of a lead handed over by an operator */
export const HANDOVER_REASON = "operator";

/**
 * Latest operator handover for each client — who handed it over, when and
 * with what note, so the broker knows where the lead came from.
 */
export async function getHandovers(clientIds: string[]): Promise<Map<string, HandoverInfo>> {
  const out = new Map<string, HandoverInfo>();
  if (clientIds.length === 0) return out;

  const assignments = await prisma.leadAssignment.findMany({
    where: { clientId: { in: clientIds }, reason: HANDOVER_REASON },
    orderBy: { createdAt: "desc" },
    select: { clientId: true, assignedBy: true, createdAt: true },
  });
  const latest = new Map<string, (typeof assignments)[number]>();
  for (const a of assignments) if (!latest.has(a.clientId)) latest.set(a.clientId, a);
  if (latest.size === 0) return out;

  const operatorIds = [...new Set([...latest.values()].map((a) => a.assignedBy))];
  const [operators, calls] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: operatorIds } },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.call.findMany({
      where: { clientId: { in: [...latest.keys()] }, userId: { in: operatorIds } },
      orderBy: { createdAt: "desc" },
      select: { clientId: true, userId: true, note: true },
    }),
  ]);
  const names = new Map(operators.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));

  for (const [clientId, a] of latest) {
    const call = calls.find((c) => c.clientId === clientId && c.userId === a.assignedBy);
    out.set(clientId, {
      operatorName: names.get(a.assignedBy) ?? "Operátor",
      at: a.createdAt.toISOString(),
      note: call?.note ?? "",
    });
  }
  return out;
}
