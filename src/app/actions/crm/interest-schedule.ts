"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { logActivity } from "./activity";
import { logAudit } from "./audit";
import {
  computePayoutSchedule,
  formatLocalDate,
} from "@/lib/crm/payout-schedule";
import { generateUniqueVS } from "@/lib/crm/variable-symbol";

interface ScheduleInterestPaymentsInput {
  clientId: string;
  clientName: string;
  amount: number;
  interestRate: number; // % p.a.
  durationMonths: number;
  startDate?: string;
  payoutFrequency: "monthly" | "quarterly";
  bankAccount?: string;
  variableSymbol?: string;
}

/**
 * After "Smlouva finální" is sent, creates:
 * 1. Payment record for the deposit (paid=false, čeká na potvrzení)
 * 2. INTEREST CalEvents linked to that Payment.paymentId
 *
 * Když admin později označí Payment jako paid, reschedulePayouts() smaže
 * tyto eventy (via paymentId filter, ne celého klienta) a přeplánuje
 * podle reálného paidAt.
 */
export async function scheduleInterestPayments(
  input: ScheduleInterestPaymentsInput
): Promise<{ success: true; eventsCreated: number } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Neautorizovaný přístup" };

  const {
    clientId,
    clientName,
    amount,
    interestRate,
    durationMonths,
    startDate,
    payoutFrequency,
    bankAccount,
    variableSymbol: inputVS,
  } = input;

  if (!amount || !interestRate || !durationMonths) {
    return { success: false, error: "Chybí parametry smlouvy" };
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { assignedTo: true },
  });
  if (!client) return { success: false, error: "Klient nenalezen" };

  const startStr = startDate || formatLocalDate(new Date());
  const vs = inputVS || await generateUniqueVS();
  const annual = amount * (interestRate / 100);
  const perPeriod =
    payoutFrequency === "quarterly" ? Math.round(annual / 4) : Math.round(annual / 12);

  try {
    // 1. Payment record
    const deposit = await prisma.payment.create({
      data: {
        clientId,
        amount,
        percent: interestRate,
        profit: annual * (durationMonths / 12),
        date: startStr,
        duration: durationMonths,
        monthlyPayout: perPeriod,
        payoutFrequency,
        paid: false,
        variableSymbol: vs,
        note: `Smlouva ${durationMonths} měs., výplata ${payoutFrequency === "quarterly" ? "čtvrtletně" : "měsíčně"}${bankAccount ? `, účet klienta: ${bankAccount}` : ""}`,
      },
    });

    // 2. Schedule INTEREST events linked to this deposit
    const schedule = computePayoutSchedule({
      startDate: startStr,
      amount,
      interestRate,
      durationMonths,
      payoutFrequency,
    });

    const bankLine = bankAccount
      ? `\nÚčet klienta: ${bankAccount}`
      : "\nÚčet klienta: (nezadáno)";

    const eventsData = schedule.map((e, i) => ({
      clientId,
      userId: client.assignedTo,
      paymentId: deposit.id,
      type: "INTEREST" as const,
      title: `Výplata úroku — ${clientName} — ${e.amount.toLocaleString("cs-CZ")} Kč`,
      date: e.date,
      time: "09:00",
      note: `${e.label} • vklad ${amount.toLocaleString("cs-CZ")} Kč • ${interestRate}% p.a.${bankLine} • Splátka ${i + 1}/${schedule.length}`,
    }));

    if (eventsData.length > 0) {
      await prisma.calEvent.createMany({ data: eventsData });
      await prisma.client.update({
        where: { id: clientId },
        data: {
          nextPaymentDate: eventsData[0].date,
          paymentFreq: (payoutFrequency === "quarterly" ? 3 : 1) * 30,
        },
      });
    }

    await logActivity(
      clientId,
      session.id,
      "PAYMENT_ADDED",
      `Naplánováno ${eventsData.length} výplat úroku (${payoutFrequency === "quarterly" ? "čtvrtletně" : "měsíčně"})`
    );

    await logAudit(
      session.id,
      "SCHEDULE_INTEREST_PAYMENTS",
      "payment",
      deposit.id,
      `Klient: ${clientName}, Vklad: ${amount} Kč, Úrok: ${interestRate}% p.a., Doba: ${durationMonths} měs., VS: ${vs}, Počet výplat: ${eventsData.length}`
    );

    return { success: true, eventsCreated: eventsData.length };
  } catch (err) {
    console.error("scheduleInterestPayments failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Neočekávaná chyba při plánování výplat",
    };
  }
}
