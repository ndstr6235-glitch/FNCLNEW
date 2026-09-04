import { NextResponse } from "next/server";
import { generateInvestmentPdf } from "@/lib/crm/investment-pdf";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const pdfBuffer = await generateInvestmentPdf();

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'inline; filename="Investicni-prezentace-Puskin-Partners.pdf"',
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Investment PDF generation failed:", error);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 },
    );
  }
}
