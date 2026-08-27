"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { put } from "@vercel/blob";
import { generateProposalPdf } from "@/lib/crm/proposal-pdf";
import { logAudit } from "./audit";

/**
 * Regeneruje PDF pro starou odeslanou smlouvu (SentEmail bez Document záznamu).
 * Zdrojové PDF zmizelo v paměti při odeslání. Tady ho rekonstruujeme z:
 * - SentEmail (clientId, subject, createdAt)
 * - Client (jméno, narozeniny, adresa, bankAccount)
 * - AuditLog s action SEND_EMAIL ve stejný čas (částka, úrok, doba)
 *
 * Výsledné PDF se uloží do Vercel Blob, vytvoří Document záznam.
 */
export async function regenerateContractPdf(
  sentEmailId: string
): Promise<{ success: true; documentId: string } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };
  if (session.role === "broker")
    return { success: false, error: "Nemáte oprávnění" };

  const se = await prisma.sentEmail.findUnique({
    where: { id: sentEmailId },
    include: {
      client: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });
  if (!se) return { success: false, error: "Email záznam nenalezen" };

  // Najdi AuditLog SEND_EMAIL ve stejný čas (±10 sec) pro extract contractMeta
  const audits = await prisma.auditLog.findMany({
    where: {
      action: "SEND_EMAIL",
      userId: se.userId,
      createdAt: {
        gte: new Date(se.createdAt.getTime() - 10000),
        lte: new Date(se.createdAt.getTime() + 10000),
      },
    },
    select: { details: true },
  });

  // Parse částku, úrok, dobu z audit details ("Vklad: X CZK, Úrok: Y%, Doba: Z měs.")
  let amount = 0;
  let interestRate: number | undefined;
  let duration: string | undefined;
  let payoutFrequency: string | undefined;
  let bankAccount: string | undefined;

  for (const a of audits) {
    if (!a.details) continue;
    if (!a.details.includes(se.to)) continue; // match this specific email
    const m = a.details.match(/Vklad:\s*(\d+)/);
    if (m) amount = Number(m[1]);
    const mr = a.details.match(/Úrok:\s*([\d.]+)%/);
    if (mr) interestRate = Number(mr[1]);
    const md = a.details.match(/Doba:\s*(\d+)\s*měs/);
    if (md) duration = md[1];
    const mf = a.details.match(/Frekvence:\s*(\w+)/);
    if (mf) payoutFrequency = mf[1];
    break;
  }

  // Fallback bankAccount z client recordu
  if (se.client.bankAccount) bankAccount = se.client.bankAccount;

  const isNavrh = se.templateLabel === "Návrh smlouvy";
  const fullName = `${se.client.firstName} ${se.client.lastName}`.trim();

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateProposalPdf(
      isNavrh
        ? {}
        : {
            clientName: fullName,
            clientEmail: se.to,
            amount,
            interestRate,
            duration,
            payoutFrequency,
            birthDate: se.client.birthDate,
            street: se.client.street,
            city: se.client.city,
            zip: se.client.zip,
            bankAccount,
          }
    );
  } catch (err) {
    return {
      success: false,
      error: `Generování PDF selhalo: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const docTypeLabel = isNavrh ? "Navrh-smlouvy" : "Smlouva";
  const safeName = fullName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") || "klient";
  const ts = se.createdAt.toISOString().split("T")[0];
  const filename = `${docTypeLabel}-${safeName}-${ts}-regenerated.pdf`;

  let fileUrl: string;
  try {
    const blob = await put(
      `smlouvy/${se.client.id}/${Date.now()}-${filename}`,
      pdfBuffer,
      {
        access: "public",
        contentType: "application/pdf",
        addRandomSuffix: false,
      }
    );
    fileUrl = blob.url;
  } catch (err) {
    return {
      success: false,
      error: `Blob upload selhal: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const doc = await prisma.document.create({
    data: {
      clientId: se.client.id,
      name: `${docTypeLabel === "Smlouva" ? "Smlouva finální" : "Návrh smlouvy"} – ${ts} (regenerováno)`,
      fileName: filename,
      fileUrl,
      fileSize: pdfBuffer.length,
      mimeType: "application/pdf",
      uploadedBy: session.id,
    },
  });

  await logAudit(
    session.id,
    "REGENERATE_PDF",
    "document",
    doc.id,
    `Regenerováno PDF z SentEmail ${sentEmailId} pro ${fullName}`
  );

  return { success: true, documentId: doc.id };
}

export async function regenerateAllMissingPdfs(): Promise<{
  success: boolean;
  generated: number;
  failed: number;
  errors: string[];
}> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return {
      success: false,
      generated: 0,
      failed: 0,
      errors: ["Nemáte oprávnění"],
    };
  }

  // Find all SentEmail s templateLabel contract bez odpovídajícího Document
  const sentEmails = await prisma.sentEmail.findMany({
    where: {
      templateLabel: { in: ["Smlouva finální", "Návrh smlouvy"] },
    },
  });

  const docs = await prisma.document.findMany({
    select: { clientId: true, createdAt: true, name: true },
  });

  let generated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const se of sentEmails) {
    const hasDoc = docs.find(
      (d) =>
        d.clientId === se.clientId &&
        Math.abs(d.createdAt.getTime() - se.createdAt.getTime()) < 86400000 &&
        ((se.templateLabel === "Smlouva finální" && d.name.includes("Smlouva")) ||
          (se.templateLabel === "Návrh smlouvy" && d.name.includes("Návrh")))
    );
    if (hasDoc) continue;

    const res = await regenerateContractPdf(se.id);
    if (res.success) {
      generated++;
    } else {
      failed++;
      errors.push(`${se.id}: ${res.error}`);
    }
  }

  return { success: true, generated, failed, errors };
}
