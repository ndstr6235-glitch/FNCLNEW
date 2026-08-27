"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { calculateScore } from "@/lib/crm/scoring";
import { createAssignmentNotification } from "./notifications";
import { logAudit } from "./audit";
import { SENSITIVE_METADATA_KEYS } from "@/lib/crm/lead-import";
import { computePayoutSchedule } from "@/lib/crm/payout-schedule";
import type { ClientScore, ClientStage } from "@/lib/crm/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ClientDetail {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  street: string;
  city: string;
  zip: string;
  callDate: string;
  nextPaymentDate: string;
  paymentFreq: number;
  note: string;
  stage: ClientStage;
  score: ClientScore;
  brokerName: string;
  brokerId: string;
  source: string;
  metadataPublic: Record<string, string>;
  /** Sensitive data — populated only for admin/supervisor; brokers receive empty object */
  metadataSensitive: Record<string, string>;
  bankAccount: string;
  dnc: boolean;
  lastCallOutcome: string;
  lastCalledAt: string;
  isInvestor: boolean;
  totalDeposit: number;
  totalProfit: number;
  avgPercent: number;
  payments: {
    id: string;
    amount: number;
    percent: number;
    profit: number;
    date: string;
    note: string;
    duration: number;
    monthlyPayout: number;
    payoutFrequency: string;
    paid: boolean;
    paidAt: string;
    variableSymbol: string | null;
  }[];
  events: {
    id: string;
    type: string;
    title: string;
    date: string;
    time: string;
    note: string;
  }[];
}

const EVENT_TYPE_MAP: Record<string, string> = {
  CALL: "call",
  PAYMENT: "payment",
  REMINDER: "reminder",
  INTEREST: "interest",
  MEETING: "meeting",
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------
export async function getClientDetail(
  clientId: string
): Promise<ClientDetail | null> {
  const session = await getSession();
  if (!session) return null;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      payments: { orderBy: { date: "desc" } },
      events: { orderBy: { date: "desc" } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!client) return null;

  if (session.role === "broker" && client.assignedTo !== session.id) {
    return null;
  }

  // Totals reflect actually paid money, not just scheduled
  const paidPayments = client.payments.filter((p) => p.paid);
  const totalDeposit = paidPayments.reduce((s, p) => s + p.amount, 0);
  const totalProfit = paidPayments.reduce((s, p) => s + p.profit, 0);
  const avgPercent =
    paidPayments.length > 0
      ? paidPayments.reduce((s, p) => s + p.percent, 0) / paidPayments.length
      : 0;

  const score = calculateScore({
    totalDeposit,
    paymentCount: client.payments.length,
    createdAt: client.createdAt,
  });

  // Parse metadata and split into public vs sensitive buckets
  let metadataPublic: Record<string, string> = {};
  let metadataSensitive: Record<string, string> = {};
  try {
    const parsed = JSON.parse(client.metadata || "{}") as Record<string, string>;
    for (const [k, v] of Object.entries(parsed)) {
      if (!v) continue;
      if (SENSITIVE_METADATA_KEYS.has(k)) {
        metadataSensitive[k] = v;
      } else {
        metadataPublic[k] = v;
      }
    }
  } catch {
    // malformed metadata — treat as empty
  }
  // Brokers never receive sensitive fields, even if they intercept the response
  if (session.role === "broker") {
    metadataSensitive = {};
  }

  return {
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    phone: client.phone,
    email: client.email,
    birthDate: client.birthDate,
    street: client.street,
    city: client.city,
    zip: client.zip,
    callDate: client.callDate,
    nextPaymentDate: client.nextPaymentDate,
    paymentFreq: client.paymentFreq,
    note: client.note,
    stage: client.stage as ClientStage,
    score,
    brokerName: `${client.user.firstName} ${client.user.lastName}`,
    brokerId: client.user.id,
    bankAccount: client.bankAccount,
    dnc: client.dnc,
    lastCallOutcome: client.lastCallOutcome,
    lastCalledAt: client.lastCalledAt,
    source: client.source,
    metadataPublic,
    metadataSensitive,
    isInvestor: paidPayments.length > 0,
    totalDeposit,
    totalProfit,
    avgPercent: Math.round(avgPercent * 100) / 100,
    payments: client.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      percent: p.percent,
      profit: p.profit,
      date: p.date,
      note: p.note,
      duration: p.duration,
      monthlyPayout: p.monthlyPayout,
      payoutFrequency: p.payoutFrequency,
      paid: p.paid,
      paidAt: p.paidAt,
      variableSymbol: p.variableSymbol ?? null,
    })),
    events: client.events.map((e) => ({
      id: e.id,
      type: EVENT_TYPE_MAP[e.type] || "call",
      title: e.title,
      date: e.date,
      time: e.time,
      note: e.note,
    })),
  };
}

// ---------------------------------------------------------------------------
// Create Client
// ---------------------------------------------------------------------------
export async function createClient(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate?: string;
  street?: string;
  city?: string;
  zip?: string;
  bankAccount?: string;
  callDate: string;
  nextPaymentDate: string;
  paymentFreq: number;
  note: string;
  assignedTo: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  if (!data.firstName.trim() || !data.lastName.trim()) {
    return { success: false, error: "Jméno a příjmení jsou povinné" };
  }

  const assignedTo =
    session.role === "broker" ? session.id : data.assignedTo || session.id;

  const client = await prisma.client.create({
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      birthDate: data.birthDate?.trim() ?? "",
      street: data.street?.trim() ?? "",
      city: data.city?.trim() ?? "",
      zip: data.zip?.trim() ?? "",
      bankAccount: data.bankAccount?.trim() ?? "",
      callDate: data.callDate || new Date().toISOString().split("T")[0],
      nextPaymentDate:
        data.nextPaymentDate || new Date().toISOString().split("T")[0],
      paymentFreq: data.paymentFreq || 30,
      note: data.note.trim(),
      assignedTo,
    },
  });

  await logActivity(
    client.id,
    session.id,
    "CLIENT_CREATED",
    `Klient vytvořen operátorem ${session.firstName} ${session.lastName}`
  );

  await logAudit(session.id, "CREATE", "client", client.id, `${data.firstName} ${data.lastName}`);

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true, id: client.id };
}

// ---------------------------------------------------------------------------
// Update Client
// ---------------------------------------------------------------------------
export async function updateClient(
  clientId: string,
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    birthDate?: string;
    street?: string;
    city?: string;
    zip?: string;
    bankAccount?: string;
    callDate: string;
    nextPaymentDate: string;
    paymentFreq: number;
    note: string;
    assignedTo: string;
    stage?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const existing = await prisma.client.findUnique({
    where: { id: clientId },
  });
  if (!existing) return { success: false, error: "Klient nenalezen" };

  if (session.role === "broker" && existing.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  if (!data.firstName.trim() || !data.lastName.trim()) {
    return { success: false, error: "Jméno a příjmení jsou povinné" };
  }

  const newAssignedTo =
    session.role === "broker" ? existing.assignedTo : data.assignedTo;

  await prisma.client.update({
    where: { id: clientId },
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      birthDate: data.birthDate?.trim() ?? "",
      street: data.street?.trim() ?? "",
      city: data.city?.trim() ?? "",
      zip: data.zip?.trim() ?? "",
      bankAccount: data.bankAccount?.trim() ?? "",
      callDate: data.callDate,
      nextPaymentDate: data.nextPaymentDate,
      paymentFreq: data.paymentFreq,
      note: data.note.trim(),
      assignedTo: newAssignedTo,
      ...(data.stage ? { stage: data.stage } : {}),
    },
  });

  // Log activity
  if (data.stage && existing.stage !== data.stage) {
    await logActivity(clientId, session.id, "CLIENT_UPDATED", `Stage změněn na ${data.stage}`);
  }
  if (existing.note !== data.note.trim()) {
    await logActivity(clientId, session.id, "NOTE_CHANGED", "Poznámka aktualizována");
  }
  if (existing.assignedTo !== newAssignedTo) {
    const newBroker = await prisma.user.findUnique({
      where: { id: newAssignedTo },
      select: { firstName: true, lastName: true },
    });
    await logActivity(
      clientId,
      session.id,
      "ASSIGNED_TO_CHANGED",
      `Klient přiřazen brokerovi ${newBroker?.firstName} ${newBroker?.lastName}`
    );
    // Notify the new broker
    await createAssignmentNotification(
      newAssignedTo,
      `${data.firstName} ${data.lastName}`,
      clientId
    );
  }
  await logActivity(clientId, session.id, "CLIENT_UPDATED", "Klient upraven");
  await logAudit(session.id, "UPDATE", "client", clientId, `${data.firstName} ${data.lastName}`);

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delete Client
// ---------------------------------------------------------------------------
export async function deleteClient(
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const existing = await prisma.client.findUnique({
    where: { id: clientId },
  });
  if (!existing) return { success: false, error: "Klient nenalezen" };

  if (session.role === "broker" && existing.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  await prisma.client.delete({ where: { id: clientId } });
  await logAudit(session.id, "DELETE", "client", clientId, `${existing.firstName} ${existing.lastName}`);

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Create Payment
// ---------------------------------------------------------------------------
export async function createPayment(data: {
  clientId: string;
  amount: number;
  percent: number;
  duration?: number;
  payoutFrequency?: string;
  date: string;
  note: string;
  bankAccount?: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const client = await prisma.client.findUnique({
    where: { id: data.clientId },
  });
  if (!client) return { success: false, error: "Klient nenalezen" };

  if (session.role === "broker" && client.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  if (data.amount <= 0) {
    return { success: false, error: "Částka musí být větší než 0" };
  }
  if (data.percent < 0 || data.percent > 100) {
    return { success: false, error: "Procento musí být 0–100" };
  }

  const profit = (data.amount * data.percent) / 100;
  const duration = data.duration || 12;
  const payoutFrequency = data.payoutFrequency || "monthly";
  const monthlyPayout =
    payoutFrequency === "monthly"
      ? (data.amount * (data.percent / 100)) / 12
      : (data.amount * (data.percent / 100)) / 4;

  // Bank account uložíme do note s markerem, aby šlo vyparsovat zpět
  const bankPart = data.bankAccount?.trim() ? `[Účet: ${data.bankAccount.trim()}] ` : "";
  await prisma.payment.create({
    data: {
      clientId: data.clientId,
      amount: data.amount,
      percent: data.percent,
      profit,
      duration,
      monthlyPayout,
      payoutFrequency,
      date: data.date || new Date().toISOString().split("T")[0],
      note: bankPart + data.note.trim(),
    },
  });

  // Klient se po vyplnění platby automaticky stává INVESTOREM
  if (client.stage !== "INVESTOR" && client.stage !== "VIP") {
    await prisma.client.update({
      where: { id: data.clientId },
      data: { stage: "INVESTOR" },
    });
  }

  const fmtAmount = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(data.amount);
  const fmtProfit = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(profit);
  await logActivity(
    data.clientId,
    session.id,
    "PAYMENT_ADDED",
    `Přidána platba ${fmtAmount} (${data.percent}% = ${fmtProfit})`
  );

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update bank account on existing Payment
// ---------------------------------------------------------------------------
export async function updatePaymentBankAccount(
  paymentId: string,
  bankAccount: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { client: { select: { assignedTo: true } } },
  });
  if (!payment) return { success: false, error: "Platba nenalezena" };

  if (session.role === "broker" && payment.client.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  // Strip existing [Účet: ...] marker, then prepend the new one (or remove)
  const stripped = payment.note.replace(/^\[Účet:[^\]]+\]\s*/, "");
  const trimmed = bankAccount.trim();
  const newNote = trimmed ? `[Účet: ${trimmed}] ${stripped}`.trim() : stripped;

  await prisma.payment.update({
    where: { id: paymentId },
    data: { note: newNote },
  });

  revalidatePath("/clients");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Reschedule interest payouts after admin confirms when money actually arrived
// (paidAt). Cíleně přepíše POUZE rozvrh tohoto depozitu (filtr přes
// CalEvent.paymentId), aby nepoškodil rozvrhy ostatních jistin klienta.
// ---------------------------------------------------------------------------
async function reschedulePayouts(
  clientId: string,
  depositPaymentId: string,
  actualStartDate: string
): Promise<void> {
  const deposit = await prisma.payment.findUnique({
    where: { id: depositPaymentId },
    include: {
      client: { select: { assignedTo: true, firstName: true, lastName: true } },
    },
  });
  if (!deposit) return;

  // Smaž VŠECHNY INTEREST eventy linkované k TÉTO Payment (ne klientovi)
  await prisma.calEvent.deleteMany({
    where: { paymentId: depositPaymentId, type: "INTEREST" },
  });

  const payoutFrequency =
    deposit.payoutFrequency === "quarterly" ? "quarterly" : "monthly";

  const schedule = computePayoutSchedule({
    startDate: actualStartDate,
    amount: deposit.amount,
    interestRate: deposit.percent,
    durationMonths: deposit.duration,
    payoutFrequency,
  });

  const clientName = `${deposit.client.firstName} ${deposit.client.lastName}`;
  const events = schedule.map((e, i) => ({
    clientId,
    userId: deposit.client.assignedTo,
    paymentId: depositPaymentId,
    type: "INTEREST" as const,
    title: `Výplata úroku — ${clientName} — ${e.amount.toLocaleString("cs-CZ")} Kč`,
    date: e.date,
    time: "09:00",
    note: `${e.label} (od ${actualStartDate}) • Splátka ${i + 1}/${schedule.length}`,
  }));

  if (events.length > 0) {
    await prisma.calEvent.createMany({ data: events });
    await prisma.client.update({
      where: { id: clientId },
      data: { nextPaymentDate: events[0].date },
    });
  }
}

// Pokud admin odznačí depozit (paid → false), vyčistí všechny naplánované úroky
async function cleanupPayouts(depositPaymentId: string): Promise<void> {
  await prisma.calEvent.deleteMany({
    where: { paymentId: depositPaymentId, type: "INTEREST" },
  });
}

// ---------------------------------------------------------------------------
// Mark Payment as paid / unpaid — admin & supervisor only
// ---------------------------------------------------------------------------
export async function setPaymentPaid(
  paymentId: string,
  paid: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };
  if (session.role === "broker") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { client: { select: { id: true, firstName: true, lastName: true } } },
  });
  if (!payment) return { success: false, error: "Platba nenalezena" };

  const todayStr = new Date().toISOString().split("T")[0];
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      paid,
      paidAt: paid ? todayStr : "",
    },
  });

  // Pokud admin označuje JISTINU (depozit, ne úrok) jako zaplacenou,
  // přeplánuj výplaty úroků podle skutečného data příchodu peněz —
  // první výplata je poměrná podle počtu dní do nejbližšího 15.
  // Při odznačení (paid=false) všechny naplánované úroky smaž.
  if (payment.duration > 0 && payment.amount > 0) {
    if (paid) {
      await reschedulePayouts(payment.client.id, paymentId, todayStr);
    } else {
      await cleanupPayouts(paymentId);
    }
  }

  const fmt = new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(payment.amount);
  await logActivity(
    payment.client.id,
    session.id,
    paid ? "PAYMENT_PAID" : "PAYMENT_UNPAID",
    paid ? `Označena platba ${fmt} jako zaplacená` : `Platba ${fmt} označena jako nezaplacená`
  );

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update Client Stage (for pipeline drag & drop)
// ---------------------------------------------------------------------------
export async function updateClientStage(
  clientId: string,
  stage: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const existing = await prisma.client.findUnique({ where: { id: clientId } });
  if (!existing) return { success: false, error: "Klient nenalezen" };

  if (session.role === "broker" && existing.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  await prisma.client.update({
    where: { id: clientId },
    data: { stage },
  });

  await logActivity(clientId, session.id, "CLIENT_UPDATED", `Stage změněn na ${stage}`);

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Pipeline Data
// ---------------------------------------------------------------------------
export interface PipelineClient {
  id: string;
  firstName: string;
  lastName: string;
  stage: string;
  score: ClientScore;
  totalDeposit: number;
  brokerName: string;
}

export async function getPipelineData(): Promise<PipelineClient[]> {
  const session = await getSession();
  if (!session) return [];

  const isBroker = session.role === "broker";

  const clients = await prisma.client.findMany({
    where: isBroker ? { assignedTo: session.id } : {},
    include: {
      payments: { select: { amount: true } },
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return clients.map((c) => {
    const totalDeposit = c.payments.reduce((s, p) => s + p.amount, 0);
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      stage: c.stage,
      score: calculateScore({
        totalDeposit,
        paymentCount: c.payments.length,
        createdAt: c.createdAt,
      }),
      totalDeposit,
      brokerName: `${c.user.firstName} ${c.user.lastName}`,
    };
  });
}
