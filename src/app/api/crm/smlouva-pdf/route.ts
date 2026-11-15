import { NextResponse } from "next/server";
import { getSession } from "@/lib/crm/auth";
import { generateProposalPdf, type ProposalPdfData } from "@/lib/crm/proposal-pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

// Final contract filled in on the "Smlouva k tisku" page — the very same PDF
// the "Smlouva finální" e-mail attaches, downloaded ready to print and sign.
// Empty fields stay as lines to fill in by hand.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role === "broker" || session.role === "operator")) {
    return NextResponse.json({ error: "Nemáte oprávnění" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
  }

  const clientName = [str(body.firstName), str(body.lastName)].filter(Boolean).join(" ") || undefined;
  const data: ProposalPdfData = {
    clientName,
    amount: num(body.amount),
    interestRate: num(body.interestRate),
    duration: str(body.duration),
    payoutFrequency: str(body.payoutFrequency),
    birthDate: str(body.birthDate),
    street: str(body.street),
    city: str(body.city),
    zip: str(body.zip),
    bankAccount: str(body.bankAccount),
    variableSymbol: str(body.variableSymbol),
    startDate: str(body.startDate),
  };

  try {
    const pdf = await generateProposalPdf(data);
    const safeName =
      (clientName || "prazdna")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-") || "prazdna";
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Smlouva-${safeName}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Final contract PDF failed:", err);
    return NextResponse.json({ error: "PDF se nepodařilo vytvořit" }, { status: 500 });
  }
}
