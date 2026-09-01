"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";
import { logAudit } from "./audit";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export interface DocumentRow {
  id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploaderName: string;
  createdAt: string;
  clientName?: string;
  clientId: string;
}

async function checkAdminOrSupervisor() {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "broker") return null;
  return session;
}

export interface SentDocumentRow extends DocumentRow {
  /** true = PDF je v Blobu (lze stáhnout); false = jen audit record bez PDF */
  archived: boolean;
  /** Subject e-mailu (pro starší záznamy bez Document) */
  emailSubject?: string;
  /** Komu byl e-mail odeslán */
  emailTo?: string;
  /** Template label */
  templateLabel?: string;
}

export async function getAllDocuments(filters?: {
  search?: string;
  type?: "smlouva" | "navrh" | "all";
}): Promise<SentDocumentRow[]> {
  const session = await checkAdminOrSupervisor();
  if (!session) return [];

  // 1) Reálné archivované PDF (Document záznamy ve Vercel Blob)
  const docWhere: Record<string, unknown> = {};
  if (filters?.search) {
    docWhere.OR = [
      { name: { contains: filters.search } },
      { client: { firstName: { contains: filters.search } } },
      { client: { lastName: { contains: filters.search } } },
    ];
  }
  if (filters?.type === "smlouva") {
    docWhere.name = { contains: "Smlouva" };
  } else if (filters?.type === "navrh") {
    docWhere.name = { contains: "Návrh" };
  }

  // 2) Sent contract emails (i ty starší bez PDF archivu)
  const seWhere: Record<string, unknown> = {
    templateLabel: { in: ["Smlouva finální", "Návrh smlouvy"] },
  };
  if (filters?.search) {
    seWhere.OR = [
      { to: { contains: filters.search } },
      { subject: { contains: filters.search } },
      { client: { firstName: { contains: filters.search } } },
      { client: { lastName: { contains: filters.search } } },
    ];
  }
  if (filters?.type === "smlouva") {
    seWhere.templateLabel = "Smlouva finální";
  } else if (filters?.type === "navrh") {
    seWhere.templateLabel = "Návrh smlouvy";
  }

  const [docs, sentEmails] = await Promise.all([
    prisma.document.findMany({
      where: docWhere,
      include: {
        user: { select: { firstName: true, lastName: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.sentEmail.findMany({
      where: seWhere,
      include: {
        user: { select: { firstName: true, lastName: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  const rows: SentDocumentRow[] = [];

  for (const d of docs) {
    rows.push({
      id: d.id,
      name: d.name,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      uploadedBy: d.uploadedBy,
      uploaderName: `${d.user.firstName} ${d.user.lastName}`,
      createdAt: d.createdAt.toISOString(),
      clientName: `${d.client.firstName} ${d.client.lastName}`,
      clientId: d.client.id,
      archived: true,
    });
  }

  // Přidat SentEmail, který NEMÁ odpovídající Document (= staré, bez archivu)
  // Match po clientId + datum (s tolerancí 1 dne) + templateLabel
  for (const se of sentEmails) {
    const sameDoc = docs.find(
      (d) =>
        d.client.id === se.client.id &&
        Math.abs(d.createdAt.getTime() - se.createdAt.getTime()) <
          24 * 60 * 60 * 1000 &&
        ((se.templateLabel === "Smlouva finální" &&
          d.name.includes("Smlouva")) ||
          (se.templateLabel === "Návrh smlouvy" && d.name.includes("Návrh")))
    );
    if (sameDoc) continue; // už zobrazeno z docs

    rows.push({
      id: `se-${se.id}`,
      name: se.subject || se.templateLabel || "Smlouva",
      fileName: "",
      fileUrl: "",
      fileSize: 0,
      mimeType: "application/pdf",
      uploadedBy: se.userId,
      uploaderName: `${se.user.firstName} ${se.user.lastName}`,
      createdAt: se.createdAt.toISOString(),
      clientName: `${se.client.firstName} ${se.client.lastName}`,
      clientId: se.client.id,
      archived: false,
      emailSubject: se.subject,
      emailTo: se.to,
      templateLabel: se.templateLabel || undefined,
    });
  }

  // Sort by createdAt desc
  rows.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return rows.slice(0, 500);
}

export async function getClientDocuments(
  clientId: string
): Promise<DocumentRow[]> {
  const session = await checkAdminOrSupervisor();
  if (!session) return [];

  const docs = await prisma.document.findMany({
    where: { clientId },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return docs.map((d) => ({
    id: d.id,
    name: d.name,
    fileName: d.fileName,
    fileUrl: d.fileUrl,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    uploadedBy: d.uploadedBy,
    uploaderName: `${d.user.firstName} ${d.user.lastName}`,
    createdAt: d.createdAt.toISOString(),
    clientId: d.clientId,
  }));
}

export async function uploadDocument(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await checkAdminOrSupervisor();
  if (!session) return { success: false, error: "Nemáte oprávnění" };

  const file = formData.get("file") as File | null;
  const clientId = formData.get("clientId") as string | null;
  const name = formData.get("name") as string | null;

  if (!file || !clientId) {
    return { success: false, error: "Chybí soubor nebo klient" };
  }

  if (file.size > MAX_SIZE) {
    return { success: false, error: "Soubor je příliš velký (max 10MB)" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Nepodporovaný typ souboru (PDF, DOC, DOCX, JPG, PNG)" };
  }

  const ext = file.name.split(".").pop() || "bin";
  const uniqueName = `${randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await put(
    `documents/${clientId}/${uniqueName}`,
    buffer,
    {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    }
  );

  await prisma.document.create({
    data: {
      clientId,
      name: name || file.name,
      fileName: uniqueName,
      fileUrl: blob.url,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: session.id,
    },
  });

  await logAudit(session.id, "CREATE", "document", clientId, name || file.name);

  revalidatePath("/clients");
  return { success: true };
}

export async function deleteDocument(
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await checkAdminOrSupervisor();
  if (!session) return { success: false, error: "Nemáte oprávnění" };

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) return { success: false, error: "Dokument nenalezen" };

  // Delete file from Vercel Blob
  try {
    if (doc.fileUrl) {
      await del(doc.fileUrl);
    }
  } catch {
    // Blob may not exist, continue
  }

  await prisma.document.delete({ where: { id: documentId } });
  await logAudit(session.id, "DELETE", "document", documentId, doc.name);

  revalidatePath("/clients");
  return { success: true };
}
