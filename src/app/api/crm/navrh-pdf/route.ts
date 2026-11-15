import { NextResponse } from "next/server";
import { getSession } from "@/lib/crm/auth";
import { NAVRH_PDF_B64 } from "@/lib/crm/navrh-pdf-data";

export const dynamic = "force-dynamic";

// Blank proposal contract (the same PDF attached to "Návrh smlouvy" emails),
// downloadable from the CRM sidebar to print, fill in by hand and sign.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return new NextResponse(new Uint8Array(Buffer.from(NAVRH_PDF_B64, "base64")), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Navrh-smlouvy-Puskin-Partners.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
