import { NextResponse } from "next/server";
import { getSession } from "@/lib/crm/auth";
import { generateProposalPdf } from "@/lib/crm/proposal-pdf";
import { contractFileName, finalContractFromForm } from "@/lib/crm/final-contract-data";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

  const data = finalContractFromForm(body);

  try {
    const pdf = await generateProposalPdf(data);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${contractFileName(data.clientName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Final contract PDF failed:", err);
    return NextResponse.json({ error: "PDF se nepodařilo vytvořit" }, { status: 500 });
  }
}
