import type { Prisma } from "@prisma/client";

/**
 * Události, které smí vidět makléř/operátor: jen vlastní a jen u klientů,
 * kteří mu stále patří. Po předání klienta jinému makléři tak původní
 * makléř přestane vidět jméno, telefon ani poznámky k výplatám.
 */
export function ownEventsWhere(userId: string): Prisma.CalEventWhereInput {
  return {
    userId,
    OR: [{ clientId: null }, { client: { assignedTo: userId } }],
  };
}
