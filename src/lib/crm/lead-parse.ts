/**
 * Turns rows of an uploaded spreadsheet into leads. Pure functions only — used
 * both in the browser (import dialog) and in server-side import scripts.
 */

export interface ParsedLead {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  zip: string;
  note: string;
}

export type LeadField =
  | "fullName"
  | "firstName"
  | "lastName"
  | "phone"
  | "email"
  | "street"
  | "city"
  | "zip"
  | "note";

export const LEAD_FIELD_LABELS: Record<LeadField, string> = {
  fullName: "Celé jméno (Příjmení Jméno)",
  firstName: "Jméno",
  lastName: "Příjmení",
  phone: "Telefon",
  email: "E-mail",
  street: "Ulice",
  city: "Město",
  zip: "PSČ",
  note: "Poznámka",
};

const HEADER_HINTS: [LeadField, RegExp][] = [
  ["firstName", /^(jmeno|krestni|first ?name)/],
  ["lastName", /^(prijmeni|last ?name|surname)/],
  ["fullName", /^(klient|zakaznik|nazev|cele jmeno|jmeno a prijmeni|name)/],
  ["phone", /(mobil|telefon|tel\b|phone)/],
  ["email", /(e-?mail)/],
  ["street", /(ulice|adresa|street)/],
  ["city", /(mesto|obec|city)/],
  ["zip", /(psc|zip)/],
  ["note", /(poznamka|note)/],
];

function plain(s: unknown): string {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/** Guesses which column holds which field from the header row. */
export function guessMapping(header: unknown[]): Partial<Record<LeadField, number>> {
  const mapping: Partial<Record<LeadField, number>> = {};
  header.forEach((cell, i) => {
    const h = plain(cell);
    if (!h) return;
    for (const [field, re] of HEADER_HINTS) {
      if (mapping[field] === undefined && re.test(h)) {
        mapping[field] = i;
        return;
      }
    }
  });
  return mapping;
}

/**
 * Canonical phone: `+420777123456`. Takes the first number of a cell that
 * lists several. Returns "" when the value is not a usable phone number.
 */
export function cleanPhone(raw: unknown): string {
  const first = String(raw ?? "").split(/[;,/]+/)[0];
  let d = first.replace(/\D+/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 9 && /^[2-7]/.test(d)) return `+420${d}`;
  if (d.length === 12 && /^42[01]/.test(d)) return `+${d}`;
  return "";
}

export function cleanEmail(raw: unknown): string {
  const e = String(raw ?? "").split(/[;,\s]+/)[0].trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : "";
}

const COMPANY_RE =
  /s\.?\s?r\.?\s?o\.?|a\.\s?s\.|spol\.|v\.\s?o\.\s?s|k\.\s?s\.|gmbh|ltd|družstvo|z\.\s?s\.|o\.\s?p\.\s?s/i;

/** "Novák Jan" → Jan / Novák. Companies and unclear shapes stay whole in lastName. */
export function splitFullName(raw: unknown): { firstName: string; lastName: string } {
  const name = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (!name) return { firstName: "", lastName: "" };
  const words = name.split(" ");
  if (words.length === 2 && !name.includes(",") && !COMPANY_RE.test(name)) {
    return { firstName: words[1], lastName: words[0] };
  }
  return { firstName: "", lastName: name };
}

export interface ParseSummary {
  leads: ParsedLead[];
  total: number;
  /** Rows dropped because they have no usable phone number */
  withoutPhone: number;
  duplicatesInFile: number;
}

/** Leads without a phone number are skipped — the pool exists to be called. */
export function parseLeadRows(
  rows: unknown[][],
  mapping: Partial<Record<LeadField, number>>
): ParseSummary {
  const cell = (row: unknown[], f: LeadField) =>
    mapping[f] === undefined ? "" : String(row[mapping[f] as number] ?? "").trim();

  const seen = new Set<string>();
  const leads: ParsedLead[] = [];
  let total = 0;
  let withoutPhone = 0;
  let duplicatesInFile = 0;

  for (const row of rows) {
    if (!row || row.every((c) => String(c ?? "").trim() === "")) continue;
    total++;

    const phone = cleanPhone(cell(row, "phone"));
    if (!phone) {
      withoutPhone++;
      continue;
    }
    if (seen.has(phone)) {
      duplicatesInFile++;
      continue;
    }
    seen.add(phone);

    const name =
      mapping.fullName !== undefined
        ? splitFullName(cell(row, "fullName"))
        : { firstName: cell(row, "firstName"), lastName: cell(row, "lastName") };

    leads.push({
      ...name,
      phone,
      email: cleanEmail(cell(row, "email")),
      street: cell(row, "street"),
      city: cell(row, "city"),
      zip: cell(row, "zip"),
      note: cell(row, "note"),
    });
  }

  return { leads, total, withoutPhone, duplicatesInFile };
}
