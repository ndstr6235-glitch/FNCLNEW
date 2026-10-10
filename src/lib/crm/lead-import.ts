import { prisma } from "./db";
import { getPoolUserId } from "./pool-user";
import {
  emailHash,
  encryptionEnabled,
  normalizeEmail,
  normalizePhone,
  phoneHash,
} from "./field-crypto";

export const SENSITIVE_METADATA_KEYS = new Set([
  "rodne_cislo",
  "cislo_op",
  "cislo_obcanky",
  "datum_narozeni",
  "cislo_uctu",
  "kod_banky",
  "prijem_prokazatelny",
  "prijem_ostatni",
  "vyse_uveru",
  "vyse_splatek",
  "zavazky",
  "zavazky_pocet",
  "zavazky_celkem",
  "zavazky_splatka",
  "vyse_exekuce",
  "exekuce",
  "registr",
  "zaloba",
  "vymahani",
  "hodnota_zastavy",
  "hodnota_nemovitosti",
  "adresa_nemovitosti",
  "nemovitost",
  "zastavitelna",
  "zastavena",
  "zamestnavatel_ico",
  "obor_zamestnani",
]);

export interface ImportedLead {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate?: string;
  street?: string;
  city?: string;
  zip?: string;
  note?: string;
  metadata: Record<string, string>;
}

export interface ImportResult {
  total: number;
  inserted: number;
  duplicatesInFile: number;
  duplicatesInDb: number;
  invalidRows: number;
}

export { normalizePhone, normalizeEmail };

export function pickPrimaryPhone(raw: unknown): {
  primary: string;
  rest: string;
} {
  if (raw == null) return { primary: "", rest: "" };
  const parts = String(raw)
    .split(/[;,/]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    primary: parts[0] || "",
    rest: parts.slice(1).join(";"),
  };
}

export function toStringSafe(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "number") {
    return Number.isInteger(v) ? String(v) : String(v);
  }
  return String(v).trim();
}

export async function insertLeadBatch(
  leads: ImportedLead[],
  source: string
): Promise<{
  inserted: number;
  duplicatesInDb: number;
}> {
  if (leads.length === 0) return { inserted: 0, duplicatesInDb: 0 };

  const poolUserId = await getPoolUserId();

  // With encryption on, phone and e-mail are unreadable in the database and
  // duplicates are found by their hashes; without it by the values themselves.
  const hashed = encryptionEnabled();
  const phoneKey = (v: string) => (hashed ? phoneHash(v) : v);
  const emailKey = (v: string) => (hashed ? emailHash(v) : v);
  const phoneCol = hashed ? "phoneHash" : "phone";
  const emailCol = hashed ? "emailHash" : "email";

  const phones = leads.map((l) => phoneKey(l.phone)).filter(Boolean);
  const emails = leads.map((l) => emailKey(l.email)).filter(Boolean);

  const existing = await prisma.client.findMany({
    where: {
      OR: [
        ...(phones.length ? [{ [phoneCol]: { in: phones } }] : []),
        ...(emails.length ? [{ [emailCol]: { in: emails } }] : []),
      ],
    },
    select: { phone: true, email: true, phoneHash: true, emailHash: true },
  });

  const existingPhones = new Set(existing.map((c) => c[phoneCol]).filter(Boolean));
  const existingEmails = new Set(existing.map((c) => c[emailCol]).filter(Boolean));

  const toInsert = leads.filter((l) => {
    if (l.phone && existingPhones.has(phoneKey(l.phone))) return false;
    if (l.email && existingEmails.has(emailKey(l.email))) return false;
    return true;
  });

  if (toInsert.length === 0) {
    return { inserted: 0, duplicatesInDb: leads.length };
  }

  await prisma.client.createMany({
    data: toInsert.map((l) => ({
      firstName: l.firstName,
      lastName: l.lastName,
      phone: l.phone,
      email: l.email,
      birthDate: l.birthDate ?? "",
      street: l.street ?? "",
      city: l.city ?? "",
      zip: l.zip ?? "",
      note: l.note ?? "",
      source,
      metadata: JSON.stringify(l.metadata),
      assignedTo: poolUserId,
      callDate: "",
      nextPaymentDate: "",
    })),
  });

  return {
    inserted: toInsert.length,
    duplicatesInDb: leads.length - toInsert.length,
  };
}
