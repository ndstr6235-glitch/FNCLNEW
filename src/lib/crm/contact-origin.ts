import "server-only";
import { prisma } from "./db";

/** Shown as the origin of a contact that came from an import, not from a person. */
export const SYSTEM_ORIGIN = "Systém";

/**
 * Origin of each contact for the client lists: the person who created it by
 * hand, otherwise the system (import + distributor).
 */
export async function getContactOrigins(clientIds: string[]): Promise<Map<string, string>> {
  if (clientIds.length === 0) return new Map();
  const creators = await prisma.activity.findMany({
    where: { type: "CLIENT_CREATED", clientId: { in: clientIds } },
    select: { clientId: true, user: { select: { firstName: true, lastName: true } } },
  });
  return new Map(creators.map((a) => [a.clientId, `${a.user.firstName} ${a.user.lastName}`]));
}
