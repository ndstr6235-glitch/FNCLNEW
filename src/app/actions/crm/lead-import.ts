"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getSession } from "@/lib/crm/auth";
import { insertLeadBatch } from "@/lib/crm/lead-import";
import type { ParsedLead } from "@/lib/crm/lead-parse";
import { logAudit } from "./audit";

const MAX_CHUNK = 500;
const MAX_LEN = 300;

const str = (v: unknown) => (typeof v === "string" ? v.slice(0, MAX_LEN) : "");

/**
 * Stores one chunk of an uploaded lead file in the pool. The import dialog
 * parses the file in the browser and sends it here in chunks.
 */
export async function importLeadChunk(
  leads: ParsedLead[],
  source: string
): Promise<
  | { success: true; inserted: number; duplicatesInDb: number }
  | { success: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role === "broker") {
    return { success: false, error: "Nemáte oprávnění" };
  }
  if (!Array.isArray(leads) || leads.length === 0 || leads.length > MAX_CHUNK) {
    return { success: false, error: "Neplatná dávka" };
  }
  const src = str(source).trim();
  if (!src) return { success: false, error: "Vyplňte název zdroje" };

  const clean = leads
    .map((l) => ({
      firstName: str(l.firstName),
      lastName: str(l.lastName),
      phone: str(l.phone),
      email: str(l.email),
      street: str(l.street),
      city: str(l.city),
      zip: str(l.zip),
      note: str(l.note),
      metadata: {},
    }))
    .filter((l) => /^\+42[01]\d{9}$/.test(l.phone));

  const result = await insertLeadBatch(clean, src);
  return { success: true, ...result };
}

/** Called once after the last chunk — one audit record per import. */
export async function finishLeadImport(source: string, inserted: number) {
  const session = await getSession();
  if (!session || session.role === "broker") return;
  await logAudit(
    session.id,
    "IMPORT_LEADS",
    "system",
    undefined,
    `${str(source)}: ${Number(inserted) || 0} leadů do poolu`
  );
  updateTag("pool-stats");
  revalidatePath("/database");
  revalidatePath("/dashboard");
}
