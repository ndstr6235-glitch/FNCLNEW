import "server-only";
import { prisma } from "./db";

/**
 * Interest payouts live in the calendar as events tied to a deposit payment.
 * Deleting a client removes the payments but only unlinks the events, so the
 * payouts have to be removed by hand — otherwise they keep showing up in the
 * calendar, the dashboard and the reminders as payouts for nobody.
 */
export async function deletePayoutEventsOfClients(clientIds: string[]): Promise<void> {
  if (clientIds.length === 0) return;
  await prisma.calEvent.deleteMany({
    where: {
      clientId: { in: clientIds },
      OR: [{ type: "INTEREST" }, { paymentId: { not: null } }],
    },
  });
}

/**
 * Removes payouts left behind by clients deleted before the fix above, and
 * the notifications that pointed at them (their link opens no client).
 */
export async function removeOrphanedPayoutEvents(): Promise<void> {
  await prisma.calEvent.deleteMany({
    where: { type: "INTEREST", clientId: null, paymentId: { not: null } },
  });
  await prisma.notification.deleteMany({
    where: { type: "payout_due", link: "/clients?open=" },
  });
}
