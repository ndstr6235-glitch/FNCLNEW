"use server";

import { getSession } from "@/lib/crm/auth";
import { logAudit } from "./audit";
import { Resend } from "resend";
import { buildUnsubscribeUrl } from "@/lib/crm/unsubscribe-token";
import { generateContractHTML } from "@/lib/crm/contract-template";
import { htmlToPdf } from "@/lib/crm/html-to-pdf";
import type { ContractData } from "@/lib/crm/contract-template";

export type { ContractData };

const resend = new Resend(process.env.RESEND_API_KEY);

export async function generateContract(
  data: ContractData
): Promise<{ success: true; html: string } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Neautorizovaný přístup" };
  }

  // Only admin and supervisor can generate contracts
  if (session.role === "broker") {
    return { success: false, error: "Nemáte oprávnění generovat smlouvy" };
  }

  try {
    const html = generateContractHTML(data);

    await logAudit(
      session.id,
      "CONTRACT_GENERATED",
      "contract",
      undefined,
      `Smlouva pro: ${data.clientName}, Částka: ${data.amount} Kč, Úrok: ${data.interestRate}%, Doba: ${data.duration} měs.`
    );

    return { success: true, html };
  } catch (err) {
    console.error("Contract generation failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Nepodařilo se vygenerovat smlouvu",
    };
  }
}

export async function sendContractEmail(
  to: string,
  contractHtml: string,
  clientName: string,
  clientId?: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Neautorizovaný přístup" };
  }

  if (session.role === "broker") {
    return { success: false, error: "Nemáte oprávnění odesílat smlouvy" };
  }

  if (!to) {
    return { success: false, error: "Chybí emailová adresa příjemce" };
  }

  try {
    // Generate PDF from contract HTML
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await htmlToPdf(contractHtml);
    } catch (pdfErr) {
      console.error("PDF generation failed, sending without attachment:", pdfErr);
    }

    const safeName = clientName.replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    const unsubUrl = clientId ? buildUnsubscribeUrl(clientId) : undefined;
    const htmlWithFooter = unsubUrl
      ? contractHtml.replace(
          "</body>",
          `<hr style="margin:32px 0;border:none;border-top:1px solid #ddd"><p style="font-size:11px;color:#888;text-align:center">Nepřejete si dostávat další zprávy? <a href="${unsubUrl}" style="color:#b8912a">Odhlaste se</a>.</p></body>`
        )
      : contractHtml;

    const { error } = await resend.emails.send({
      from: "Alexandr Puškin, s.r.o. <info@puskinpartners.cz>",
      to: [to],
      replyTo: ["info@puskinpartners.cz"],
      subject: "Smlouva o zápůjčce – Alexandr Puškin, s.r.o.",
      html: htmlWithFooter,
      ...(pdfBuffer
        ? {
            attachments: [
              {
                filename: `Smlouva-${safeName}.pdf`,
                content: pdfBuffer,
              },
            ],
          }
        : {}),
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

    await logAudit(
      session.id,
      "CONTRACT_SENT",
      "contract",
      undefined,
      `Smlouva odeslána na: ${to}, Klient: ${clientName}`
    );

    return { success: true };
  } catch (err) {
    console.error("Contract email failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Neočekávaná chyba při odesílání",
    };
  }
}
