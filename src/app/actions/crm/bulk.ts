"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { revalidatePath } from "next/cache";
import { deletePayoutEventsOfClients } from "@/lib/crm/payout-events";
import { Resend } from "resend";
import { logAudit } from "./audit";

async function requireAdminOrSupervisor() {
  const session = await getSession();
  if (!session || (session.role === "broker" || session.role === "operator")) return null;
  return session;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "administrator") return null;
  return session;
}

export async function bulkAssignBroker(clientIds: string[], brokerId: string) {
  // Only the administrator hands contacts out
  const session = await requireAdmin();
  if (!session) return { error: "Nemáte oprávnění." };
  if (!clientIds.length || !brokerId) return { error: "Vyberte klienty a brokera." };

  await prisma.client.updateMany({
    where: { id: { in: clientIds } },
    data: { assignedTo: brokerId },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true, count: clientIds.length };
}

export async function bulkChangeStage(clientIds: string[], stage: string) {
  const session = await requireAdminOrSupervisor();
  if (!session) return { error: "Nemáte oprávnění." };
  if (!clientIds.length || !stage) return { error: "Vyberte klienty a stage." };

  await prisma.client.updateMany({
    where: { id: { in: clientIds } },
    data: { stage },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true, count: clientIds.length };
}

export async function bulkDelete(clientIds: string[]) {
  const session = await requireAdmin();
  if (!session) return { error: "Pouze administrátor může mazat." };
  if (!clientIds.length) return { error: "Vyberte klienty." };

  await deletePayoutEventsOfClients(clientIds);
  await prisma.client.deleteMany({
    where: { id: { in: clientIds } },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true, count: clientIds.length };
}

// ---------------------------------------------------------------------------
// Bulk send Prezentace — one e-mail per recipient
// ---------------------------------------------------------------------------
export async function bulkSendPrezentace(
  emails: string[]
): Promise<{ success: boolean; sent: number; failed?: string[]; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, sent: 0, error: "Nepřihlášen." };
  if (!emails.length) return { success: false, sent: 0, error: "Žádné emaily." };
  if (emails.length > 300) return { success: false, sent: 0, error: "Najednou lze poslat nejvýš 300 e-mailů." };

  const key = process.env.RESEND_API_KEY;
  if (!key) return { success: false, sent: 0, error: "RESEND_API_KEY chybí." };
  const resend = new Resend(key);

  // Load Prezentace template
  const template = await prisma.emailTemplate.findFirst({
    where: { label: "Prezentace" },
  });
  if (!template) return { success: false, sent: 0, error: 'Šablona "Prezentace" neexistuje.' };

  // Load sender info
  const sender = await prisma.user.findUnique({
    where: { id: session.id },
    select: { firstName: true, lastName: true, signature: true },
  });
  const senderName = sender
    ? `${sender.firstName} ${sender.lastName}`
    : "Puskin and Partners";

  // Build signature: use DB signature if set, otherwise auto-generate
  const signature = sender?.signature ||
    [
      "S pozdravem,",
      "",
      senderName,
      "Alexandr Puškin, s.r.o.",
      "info@puskinpartners.cz",
      "www.puskinpartners.cz",
    ].join("\n");

  // Fixed body for bulk — oslovení is generic since we don't know names
  const body = `Dobrý den,\n\nna základě našeho hovoru posílám prezentaci a představení společnosti.\n\n${signature}`;

  // Load Prezentace PDF attachment
  let attachments: { filename: string; content: string; contentType?: string }[] = [];
  try {
    const { PREZENTACE_PDF_B64 } = await import("@/lib/crm/prezentace-pdf-data");
    attachments = [{
      filename: "Prezentace-Puskin-Partners.pdf",
      content: PREZENTACE_PDF_B64,
      contentType: "application/pdf",
    }];
  } catch (err) {
    console.error("Prezentace PDF load failed:", err);
  }

  // One e-mail per recipient — the client sees their own address in "To" and no
  // copy lands in the shared info@ inbox (the old BCC send went To: info@).
  // Resend has no attachments in its batch API, so send one by one, throttled.
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  let totalSent = 0;
  const failed: string[] = [];

  for (const email of emails) {
    let ok = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { error } = await resend.emails.send({
          from: `${senderName} | Puskin and Partners <info@puskinpartners.cz>`,
          to: [email],
          subject: template.subject,
          text: body,
          replyTo: ["info@puskinpartners.cz"],
          ...(attachments.length > 0 ? { attachments } : {}),
        });
        if (!error) {
          totalSent++;
          ok = true;
          break;
        }
        // Rate limited — wait and retry; anything else is final for this address
        if (error.name === "rate_limit_exceeded") {
          await sleep(1000 * (attempt + 1));
          continue;
        }
        console.error(`Bulk Prezentace to ${email} failed:`, error);
        break;
      } catch (err) {
        console.error(`Bulk Prezentace to ${email} failed:`, err);
        break;
      }
    }
    if (!ok) failed.push(email);
    await sleep(250);
  }

  await logAudit(
    session.id,
    "BULK_EMAIL",
    "email",
    undefined,
    `Hromadná Prezentace: ${totalSent}/${emails.length} odesláno`
  );

  if (totalSent === 0) {
    return { success: false, sent: 0, failed, error: "Odeslání selhalo." };
  }

  return { success: true, sent: totalSent, failed };
}

export async function bulkExportCSV(clientIds: string[]) {
  const session = await requireAdminOrSupervisor();
  if (!session) return { error: "Nemáte oprávnění." };
  if (!clientIds.length) return { error: "Vyberte klienty." };

  const clients = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    include: {
      payments: { select: { amount: true, profit: true } },
      user: { select: { firstName: true, lastName: true } },
    },
  });

  const header = "Jméno,Příjmení,Email,Telefon,Vklad,Výdělek,Broker,Stage\n";
  const rows = clients.map((c) => {
    const totalDeposit = c.payments.reduce((s, p) => s + p.amount, 0);
    const totalProfit = c.payments.reduce((s, p) => s + p.profit, 0);
    const broker = c.user ? `${c.user.firstName} ${c.user.lastName}` : "";
    return `"${c.firstName}","${c.lastName}","${c.email}","${c.phone}",${totalDeposit},${totalProfit},"${broker}","${c.stage}"`;
  }).join("\n");

  return { success: true, csv: header + rows };
}
