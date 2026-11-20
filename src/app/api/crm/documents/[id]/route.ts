import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { logAudit } from "@/lib/crm/server-log";

export const dynamic = "force-dynamic";

/**
 * Stažení dokumentu jen pro přihlášené administrátory a supervizory.
 * Soubory jsou v soukromém úložišti — bez téhle adresy se k nim nikdo nedostane.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return new NextResponse("Nepřihlášen", { status: 401 });
  if (session.role !== "administrator" && session.role !== "supervisor") {
    return new NextResponse("Nemáte oprávnění", { status: 403 });
  }

  const { id } = await ctx.params;
  const doc = await prisma.document.findUnique({
    where: { id },
    select: { id: true, clientId: true, fileName: true, fileUrl: true, mimeType: true, name: true },
  });
  if (!doc || !doc.fileUrl) return new NextResponse("Dokument nenalezen", { status: 404 });

  let body: ReadableStream<Uint8Array> | null = null;
  let contentType = doc.mimeType || "application/octet-stream";

  if (doc.fileUrl.includes(".private.blob.vercel-storage.com")) {
    const res = await get(doc.fileUrl, { access: "private" });
    if (!res || res.statusCode !== 200) {
      return new NextResponse("Soubor se nepodařilo načíst", { status: 502 });
    }
    body = res.stream;
    contentType = res.blob.contentType || contentType;
  } else {
    // Starší soubory z dřívějšího veřejného úložiště
    const res = await fetch(doc.fileUrl, { cache: "no-store" });
    if (!res.ok || !res.body) {
      return new NextResponse("Soubor se nepodařilo načíst", { status: 502 });
    }
    body = res.body;
  }

  await logAudit(session.id, "DOWNLOAD_DOCUMENT", "document", doc.id, doc.name);

  const filename = (doc.fileName || "dokument").replace(/[^\w.\-]+/g, "_");
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
