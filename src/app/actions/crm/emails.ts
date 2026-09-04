"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { Resend } from "resend";
import { put } from "@vercel/blob";
import { logAudit } from "./audit";
import { logActivity } from "./activity";
import { buildUnsubscribeUrl } from "@/lib/crm/unsubscribe-token";
import { generateUniqueVS } from "@/lib/crm/variable-symbol";

export interface EmailClientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isInvestor: boolean;
  totalDeposit: number;
  note: string;
  brokerName: string;
}

export interface EmailTemplateRow {
  id: string;
  label: string;
  subject: string;
  body: string;
  allowedRoles: string[];
}

export interface EmailPageData {
  clients: EmailClientRow[];
  templates: EmailTemplateRow[];
  signature: string;
}

export async function getEmailPageData(): Promise<EmailPageData | null> {
  const session = await getSession();
  if (!session) return null;

  const isBroker = session.role === "broker";
  const roleUpper = session.role.toUpperCase();

  const [rawClients, rawTemplates, user] = await Promise.all([
    prisma.client.findMany({
      where: isBroker ? { assignedTo: session.id } : {},
      include: {
        payments: { select: { amount: true, paid: true } },
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { firstName: "asc" },
    }),
    prisma.emailTemplate.findMany({
      orderBy: { label: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: session.id },
      select: { signature: true },
    }),
  ]);

  const clients: EmailClientRow[] = rawClients.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    isInvestor: c.payments.some((p) => p.paid),
    totalDeposit: c.payments.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0),
    note: c.note,
    brokerName: `${c.user.firstName} ${c.user.lastName}`,
  }));

  // Filter templates by role — allowedRoles is comma-separated UPPERCASE in DB
  const templates: EmailTemplateRow[] = rawTemplates
    .filter((t) => t.allowedRoles.split(",").map((r) => r.trim()).includes(roleUpper))
    .map((t) => ({
      id: t.id,
      label: t.label,
      subject: t.subject,
      body: t.body,
      allowedRoles: t.allowedRoles.split(",").map((r) => r.trim().toLowerCase()),
    }));

  return {
    clients,
    templates,
    signature: user?.signature || "",
  };
}

export interface SignatureData {
  signature: string;
  firstName: string;
  lastName: string;
  email: string;
}

export async function getCurrentUserSignature(): Promise<SignatureData> {
  const session = await getSession();
  if (!session) return { signature: "", firstName: "", lastName: "", email: "" };

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { signature: true, firstName: true, lastName: true, email: true },
  });

  return {
    signature: user?.signature || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  };
}

// Aliases used by email-composer.tsx
export const getUserSignature = getCurrentUserSignature;

export async function updateSignature(
  signature: string
): Promise<{ success: boolean }> {
  const session = await getSession();
  if (!session) return { success: false };

  await prisma.user.update({
    where: { id: session.id },
    data: { signature },
  });

  return { success: true };
}

export const updateUserSignature = updateSignature;

// ---------------------------------------------------------------------------
// Individual data fetchers (used by page.tsx and drawer-tab-email.tsx)
// ---------------------------------------------------------------------------
export async function getEmailClients(): Promise<EmailClientRow[]> {
  const session = await getSession();
  if (!session) return [];

  const isBroker = session.role === "broker";

  const rawClients = await prisma.client.findMany({
    where: isBroker ? { assignedTo: session.id } : {},
    include: {
      payments: { select: { amount: true, paid: true } },
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { firstName: "asc" },
  });

  return rawClients.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    isInvestor: c.payments.some((p) => p.paid),
    totalDeposit: c.payments.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0),
    note: c.note,
    brokerName: `${c.user.firstName} ${c.user.lastName}`,
  }));
}

export async function getEmailTemplates(): Promise<EmailTemplateRow[]> {
  const session = await getSession();
  if (!session) return [];

  const roleUpper = session.role.toUpperCase();

  // Auto-repair Návrh template body: remove občanka + ensure "Výše vkladu" is asked.
  // Safe to run repeatedly — no-op once clean.
  try {
    const navrh = await prisma.emailTemplate.findFirst({
      where: { label: "Návrh smlouvy" },
    });
    if (navrh) {
      let body = navrh.body;
      let changed = false;

      // 1. Remove "Číslo občanského průkazu" if present
      if (body.includes("Číslo občanského průkazu")) {
        body = body
          .replace(/\n[–\-]\s*Číslo občanského průkazu\s*\n/g, "\n")
          .replace(/[–\-]\s*Číslo občanského průkazu\s*\n?/g, "");
        changed = true;
      }

      // 2. Ensure "Výše vkladu" question is in the list (right after "Trvalé bydliště")
      if (!body.includes("Výše vkladu") && body.includes("Trvalé bydliště")) {
        body = body.replace(
          /(– Trvalé bydliště\s*\n)/,
          "$1– Výše vkladu (jakou částku chcete investovat)\n"
        );
        changed = true;
      }

      if (changed) {
        await prisma.emailTemplate.update({
          where: { id: navrh.id },
          data: { body },
        });
      }
    }
  } catch {
    // non-fatal
  }

  const rawTemplates = await prisma.emailTemplate.findMany({
    orderBy: { label: "asc" },
  });

  return rawTemplates
    .filter((t) => t.allowedRoles.split(",").map((r) => r.trim()).includes(roleUpper))
    .map((t) => ({
      id: t.id,
      label: t.label,
      subject: t.subject,
      body: t.body,
      allowedRoles: t.allowedRoles.split(",").map((r) => r.trim().toLowerCase()),
    }));
}

// ---------------------------------------------------------------------------
// Send email via Resend
// ---------------------------------------------------------------------------

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface ContractMeta {
  investmentAmount: number;
  interestRate?: number;
  duration?: string;
  startDate?: string;
  payoutFrequency?: string;
  bankAccount?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  street?: string;
  city?: string;
  zip?: string;
}

interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
  senderName?: string;
  templateLabel?: string;
  contractMeta?: ContractMeta;
  clientId?: string;
  clientName?: string;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Neautorizovaný přístup" };
  }

  const { to, subject, body, replyTo, senderName, templateLabel, contractMeta, clientId, clientName } = input;

  if (!to || !subject || !body) {
    return { success: false, error: "Chybí povinné údaje (email, předmět, text)" };
  }

  if (clientId) {
    const cli = await prisma.client.findUnique({ where: { id: clientId }, select: { dnc: true } });
    if (cli?.dnc) {
      return { success: false, error: "Klient je v DNC listu — nelze odeslat e-mail" };
    }
  }

  try {
    // Build sender name — use the team member name or default to company
    const fromName = senderName || "Alexandr Puškin, s.r.o.";
    const from = `${fromName} <info@puskinpartners.cz>`;

    // All replies always route to the shared info@ inbox
    const effectiveReplyTo = "info@puskinpartners.cz";

    // Build attachments list — each template gets its own attachment
    const attachments: { filename: string; content: Buffer | string; contentType?: string }[] = [];
    const label = templateLabel?.toLowerCase() || "";

    // Pre-generate VS for contract templates so it appears in PDF
    let contractVS: string | undefined;
    const isContractTemplate = label.includes("smlouv");
    const isFinalContract = isContractTemplate && !label.includes("návrh") && !label.includes("navrh");
    if (isFinalContract) {
      const { generateUniqueVS } = await import("@/lib/crm/variable-symbol");
      contractVS = await generateUniqueVS();
    }

    if (label.includes("prezentace")) {
      // Prezentace → generate dynamic investment PDF
      try {
        const { generateInvestmentPdf } = await import("@/lib/crm/investment-pdf");
        const pdfBuffer = await generateInvestmentPdf();
        attachments.push({
          filename: "Prezentace-Puskin-Partners.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        });
      } catch {
        // Fallback to static PDF if dynamic generation fails
        try {
          const { PREZENTACE_PDF_BASE64 } = await import("@/lib/crm/prezentace-pdf");
          if (PREZENTACE_PDF_BASE64) {
            attachments.push({
              filename: "Prezentace-Puskin-Partners.pdf",
              content: PREZENTACE_PDF_BASE64,
              contentType: "application/pdf",
            });
          }
        } catch {
          // PDF module not available
        }
      }
    } else if (label.includes("smlouv")) {
      // Návrh smlouvy i Smlouva finální → vyplněný PDF s daty z composeru
      // Prázdná pole zůstanou jako tečkované čáry k doplnění
      // PDF is MANDATORY for smlouva templates — if it fails, don't send email
      try {
        const { generateProposalPdf } = await import("@/lib/crm/proposal-pdf");
        const isNavrh = label.includes("návrh") || label.includes("navrh");
        const contractFullName = contractMeta
          ? [contractMeta.firstName, contractMeta.lastName]
              .filter((s) => s && s.trim())
              .join(" ")
              .trim()
          : "";
        const pdfBuffer = await generateProposalPdf({
          clientName: contractFullName || undefined,
          clientEmail: to,
          amount: contractMeta?.investmentAmount,
          interestRate: contractMeta?.interestRate,
          duration: contractMeta?.duration,
          payoutFrequency: contractMeta?.payoutFrequency,
          birthDate: contractMeta?.birthDate,
          street: contractMeta?.street,
          city: contractMeta?.city,
          zip: contractMeta?.zip,
          bankAccount: contractMeta?.bankAccount,
        });

        // Build a descriptive filename: "Smlouva-Jmeno-Prijmeni-2026-05-28.pdf"
        const docTypeLabel = isNavrh ? "Navrh-smlouvy" : "Smlouva";
        const safeName =
          (contractFullName || clientName || "klient")
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^\w\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-") || "klient";
        const ts = new Date().toISOString().split("T")[0];
        const pdfFilename = `${docTypeLabel}-${safeName}-${ts}.pdf`;

        // Upload to Vercel Blob + persist as Document so the admin can
        // download and sign it later. Done BEFORE sending email — if blob
        // fails we still send (just log), so the client always gets the PDF.
        if (clientId) {
          try {
            const blob = await put(
              `smlouvy/${clientId}/${Date.now()}-${pdfFilename}`,
              pdfBuffer,
              {
                access: "public",
                contentType: "application/pdf",
                addRandomSuffix: false,
              }
            );
            await prisma.document.create({
              data: {
                clientId,
                name: `${docTypeLabel === "Smlouva" ? "Smlouva finální" : "Návrh smlouvy"} – ${ts}${contractVS ? ` · VS ${contractVS}` : ""}`,
                fileName: pdfFilename,
                fileUrl: blob.url,
                fileSize: pdfBuffer.length,
                mimeType: "application/pdf",
                uploadedBy: session.id,
              },
            });
          } catch (e) {
            console.error("Failed to archive generated PDF:", e);
          }
        }

        attachments.push({
          filename: pdfFilename,
          // Resend API serializes attachments via JSON.stringify — Buffer would
          // become {"type":"Buffer",...}, so we must pass a base64 string
          content: pdfBuffer.toString("base64"),
          contentType: "application/pdf",
        });
      } catch (err) {
        console.error("Proposal PDF generation failed:", err);
        return {
          success: false,
          error: `Nepodařilo se vygenerovat PDF smlouvy: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    }

    const unsubUrl = clientId ? buildUnsubscribeUrl(clientId) : undefined;
    // Pro Smlouvu finální přidej VS info do těla e-mailu (klient ho potřebuje
    // při platbě, ale ve PDF ho podle vzoru nemáme).
    const vsLine = contractVS
      ? `\n\nPři platbě uvádějte variabilní symbol: ${contractVS}`
      : "";
    const bodyWithFooter = unsubUrl
      ? `${body}${vsLine}\n\n---\nNepřejete si dostávat další zprávy? Odhlaste se zde: ${unsubUrl}`
      : `${body}${vsLine}`;

    const { error } = await getResend().emails.send({
      from,
      to: [to],
      subject,
      text: bodyWithFooter,
      replyTo: [effectiveReplyTo],
      ...(attachments.length > 0 ? { attachments } : {}),
      ...(unsubUrl
        ? {
            headers: {
              "List-Unsubscribe": `<${unsubUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          }
        : {}),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message || "Odeslání selhalo" };
    }

    // Build audit detail string including contract metadata if present
    let auditDetail = `To: ${to}, Subject: ${subject}`;
    if (contractMeta) {
      const parts: string[] = [];
      parts.push(`Vklad: ${contractMeta.investmentAmount} CZK`);
      if (contractMeta.interestRate != null) parts.push(`Úrok: ${contractMeta.interestRate}%`);
      if (contractMeta.duration) parts.push(`Doba: ${contractMeta.duration} měs.`);
      if (contractMeta.startDate) parts.push(`Začátek: ${contractMeta.startDate}`);
      if (contractMeta.payoutFrequency) parts.push(`Frekvence: ${contractMeta.payoutFrequency}`);
      auditDetail += ` | Smlouva: ${parts.join(", ")}`;
    }

    // Audit log
    await logAudit(
      session.id,
      "SEND_EMAIL",
      "email",
      undefined,
      auditDetail
    );

    // Auto-persist any contact info entered in the composer back onto the
    // Client record — so brokers don't have to re-enter it. Existing values
    // get overwritten only if a non-empty new value was provided.
    if (clientId && contractMeta) {
      const update: Record<string, string> = {};
      const setIfFilled = (key: string, val: string | undefined) => {
        if (val && val.trim()) update[key] = val.trim();
      };
      setIfFilled("birthDate", contractMeta.birthDate);
      setIfFilled("street", contractMeta.street);
      setIfFilled("city", contractMeta.city);
      setIfFilled("zip", contractMeta.zip);
      setIfFilled("bankAccount", contractMeta.bankAccount);
      // Only fill name if Client has none yet (don't overwrite existing name)
      if (contractMeta.firstName || contractMeta.lastName) {
        const existing = await prisma.client.findUnique({
          where: { id: clientId },
          select: { firstName: true, lastName: true },
        });
        if (existing) {
          if (!existing.firstName?.trim() && contractMeta.firstName) {
            update.firstName = contractMeta.firstName.trim();
          }
          if (!existing.lastName?.trim() && contractMeta.lastName) {
            update.lastName = contractMeta.lastName.trim();
          }
        }
      }
      if (Object.keys(update).length > 0) {
        try {
          await prisma.client.update({ where: { id: clientId }, data: update });
          await logActivity(
            clientId,
            session.id,
            "CLIENT_UPDATED",
            `Auto-vyplněno z e-mailu: ${Object.keys(update).join(", ")}`
          );
        } catch (e) {
          console.error("Failed to auto-persist contract meta to Client:", e);
        }
      }
    }

    // Save sent email record + activity log if clientId is provided
    if (clientId) {
      await Promise.all([
        prisma.sentEmail.create({
          data: {
            clientId,
            userId: session.id,
            to,
            subject,
            body,
            templateLabel: templateLabel || null,
          },
        }),
        logActivity(
          clientId,
          session.id,
          "EMAIL_SENT",
          `Odeslán email: ${subject}`
        ),
      ]);

      // When "Smlouva finální" is sent, schedule interest payout events
      // for the entire contract duration (creates Payment + CalEvent records)
      if (
        isFinalContract &&
        contractMeta?.investmentAmount &&
        contractMeta?.interestRate != null &&
        contractMeta?.duration
      ) {
        try {
          const { scheduleInterestPayments } = await import("./interest-schedule");
          await scheduleInterestPayments({
            clientId,
            clientName: clientName || "",
            amount: contractMeta.investmentAmount,
            interestRate: contractMeta.interestRate,
            durationMonths: Number(contractMeta.duration),
            startDate: contractMeta.startDate,
            payoutFrequency:
              contractMeta.payoutFrequency === "quarterly" ? "quarterly" : "monthly",
            bankAccount: contractMeta.bankAccount,
            variableSymbol: contractVS,
          });
        } catch (err) {
          console.error("scheduleInterestPayments failed (email still sent):", err);
        }
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Neočekávaná chyba při odesílání",
    };
  }
}

// ---------------------------------------------------------------------------
// Sent email history for a client
// ---------------------------------------------------------------------------

export interface SentEmailRow {
  id: string;
  to: string;
  subject: string;
  body: string;
  templateLabel: string | null;
  senderName: string;
  createdAt: string;
}

export async function getClientSentEmails(
  clientId: string
): Promise<SentEmailRow[]> {
  const session = await getSession();
  if (!session) return [];

  // RBAC: brokers can only see emails for their own clients
  if (session.role === "broker") {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { assignedTo: true },
    });
    if (!client || client.assignedTo !== session.id) return [];
  }

  const emails = await prisma.sentEmail.findMany({
    where: { clientId },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return emails.map((e) => ({
    id: e.id,
    to: e.to,
    subject: e.subject,
    body: e.body,
    templateLabel: e.templateLabel,
    senderName: `${e.user.firstName} ${e.user.lastName}`,
    createdAt: e.createdAt.toISOString(),
  }));
}
