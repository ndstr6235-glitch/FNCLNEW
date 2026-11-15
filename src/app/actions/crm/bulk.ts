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
  const session = await requireAdminOrSupervisor();
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
// Bulk send Prezentace via BCC
// ---------------------------------------------------------------------------
export async function bulkSendPrezentace(
  emails: string[]
): Promise<{ success: boolean; sent: number; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, sent: 0, error: "Nepřihlášen." };
  if (!emails.length) return { success: false, sent: 0, error: "Žádné emaily." };

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

  // Send in batches of 49 (Resend BCC limit)
  const BATCH_SIZE = 49;
  let totalSent = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    try {
      const { error } = await resend.emails.send({
        from: `${senderName} | Puskin and Partners <info@puskinpartners.cz>`,
        to: ["info@puskinpartners.cz"],
        bcc: batch,
        subject: template.subject,
        text: body,
        replyTo: ["info@puskinpartners.cz"],
        ...(attachments.length > 0 ? { attachments } : {}),
      });

      if (error) {
        console.error("Bulk BCC send error:", error);
      } else {
        totalSent += batch.length;
      }
    } catch (err) {
      console.error("Bulk BCC batch failed:", err);
    }
  }

  await logAudit(
    session.id,
    "BULK_EMAIL",
    "email",
    undefined,
    `Hromadná Prezentace BCC: ${totalSent}/${emails.length} odesláno`
  );

  if (totalSent === 0) {
    return { success: false, sent: 0, error: "Odeslání selhalo." };
  }

  return { success: true, sent: totalSent };
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
