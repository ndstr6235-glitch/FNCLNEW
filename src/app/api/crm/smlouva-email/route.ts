import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { logAudit } from "@/lib/crm/server-log";
import { generateProposalPdf } from "@/lib/crm/proposal-pdf";
import { contractFileName, finalContractFromForm } from "@/lib/crm/final-contract-data";
import { COMPANY_SIGNATORY } from "@/lib/crm/company";
import { emailHash } from "@/lib/crm/field-crypto";
import { plainBodyToHtml } from "@/lib/crm/email-footer";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Smlouva k tisku" → send the filled-in final contract (PDF) straight to the
// client with the subject and text from the e-mail draft.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return NextResponse.json({ error: "Nemáte oprávnění" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
  }

  const to = String(body.to ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const text = String(body.text ?? "").trim();
  if (!EMAIL_RE.test(to)) return NextResponse.json({ error: "Zadejte platný e-mail klienta" }, { status: 400 });
  if (!subject || !text) return NextResponse.json({ error: "Chybí předmět nebo text e-mailu" }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: "RESEND_API_KEY chybí" }, { status: 500 });

  // Respect the do-not-contact list if the address belongs to a known client
  const client = await prisma.client.findFirst({
    where: { emailHash: emailHash(to) },
    select: { id: true, dnc: true },
  });
  if (client?.dnc) {
    return NextResponse.json({ error: "Klient je v DNC listu — nelze odeslat e-mail" }, { status: 400 });
  }

  const data = finalContractFromForm((body.form ?? {}) as Record<string, unknown>);

  try {
    const pdf = await generateProposalPdf(data);
    const { error } = await new Resend(key).emails.send({
      from: `${COMPANY_SIGNATORY} | Puskin and Partners <info@puskinpartners.cz>`,
      to: [to],
      replyTo: ["info@puskinpartners.cz"],
      subject,
      text,
      html: plainBodyToHtml(text),
      attachments: [
        {
          filename: contractFileName(data.clientName),
          // Resend serializes via JSON — must be a base64 string, not a Buffer
          content: Buffer.from(pdf).toString("base64"),
          contentType: "application/pdf",
        },
      ],
    });
    if (error) {
      console.error("Contract e-mail failed:", error);
      return NextResponse.json({ error: error.message || "Odeslání selhalo" }, { status: 502 });
    }

    await logAudit(
      session.id,
      "CONTRACT_SENT",
      "contract",
      client?.id,
      `Smlouva k tisku odeslána na: ${to}, Klient: ${data.clientName ?? "—"}, Vklad: ${data.amount ?? "—"} Kč`
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contract e-mail failed:", err);
    return NextResponse.json({ error: "Smlouvu se nepodařilo odeslat" }, { status: 500 });
  }
}
