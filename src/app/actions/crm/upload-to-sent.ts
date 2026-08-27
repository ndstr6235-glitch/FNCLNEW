"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { put } from "@vercel/blob";
import { logAudit } from "./audit";

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Admin nahraje PDF k existujícímu SentEmail záznamu (např. originál
 * který si vytáhl z odchozí pošty). Vytvoří Document linkovaný k klientovi
 * a stejnému datu — pak se v documents page ukáže jako "Archivováno".
 */
export async function uploadPdfToSentEmail(
  sentEmailId: string,
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };
  if (session.role === "broker")
    return { success: false, error: "Nemáte oprávnění" };

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "Chybí soubor" };
  if (file.size === 0) return { success: false, error: "Prázdný soubor" };
  if (file.size > MAX_SIZE)
    return { success: false, error: "Soubor je příliš velký (max 20MB)" };
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"))
    return { success: false, error: "Jen PDF soubory jsou podporované" };

  const se = await prisma.sentEmail.findUnique({
    where: { id: sentEmailId },
    include: { client: { select: { id: true, firstName: true, lastName: true } } },
  });
  if (!se) return { success: false, error: "Email záznam nenalezen" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const isNavrh = se.templateLabel === "Návrh smlouvy";
  const docTypeLabel = isNavrh ? "Navrh-smlouvy" : "Smlouva";
  const fullName = `${se.client.firstName} ${se.client.lastName}`.trim();
  const safeName =
    fullName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "klient";
  const ts = se.createdAt.toISOString().split("T")[0];
  const filename = `${docTypeLabel}-${safeName}-${ts}.pdf`;

  let fileUrl: string;
  try {
    const blob = await put(
      `smlouvy/${se.client.id}/${Date.now()}-${filename}`,
      buffer,
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
      error: `Upload selhal: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  await prisma.document.create({
    data: {
      clientId: se.client.id,
      name: `${docTypeLabel === "Smlouva" ? "Smlouva finální" : "Návrh smlouvy"} – ${ts} (originál)`,
      fileName: file.name,
      fileUrl,
      fileSize: buffer.length,
      mimeType: "application/pdf",
      uploadedBy: session.id,
      // Match createdAt to original SentEmail.createdAt so it shows in same row
      createdAt: se.createdAt,
    },
  });

  await logAudit(
    session.id,
    "UPLOAD_ORIGINAL_PDF",
    "document",
    sentEmailId,
    `Nahrané originální PDF pro ${fullName} (${file.name}, ${(buffer.length / 1024).toFixed(0)} KB)`
  );

  return { success: true };
}
