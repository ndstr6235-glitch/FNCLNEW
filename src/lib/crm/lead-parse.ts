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

/**
 * For files without a header row: guesses the columns from the data itself
 * (phone numbers, e-mails, and the first column holding names).
 */
export function guessMappingFromData(rows: unknown[][]): Partial<Record<LeadField, number>> {
  const sample = rows.filter((r) => r && r.some((c) => String(c ?? "").trim())).slice(0, 50);
  const width = Math.max(0, ...sample.map((r) => r.length));
  const share = (col: number, test: (s: string) => boolean) =>
    sample.filter((r) => test(String(r[col] ?? "").trim())).length / Math.max(1, sample.length);

  const mapping: Partial<Record<LeadField, number>> = {};
  for (let col = 0; col < width; col++) {
    if (mapping.phone === undefined && share(col, (s) => cleanPhone(s) !== "") > 0.6) mapping.phone = col;
    else if (mapping.email === undefined && share(col, (s) => /@/.test(s)) > 0.6) mapping.email = col;
  }
  for (let col = 0; col < width; col++) {
    if (col === mapping.phone || col === mapping.email) continue;
    // Two or more words of letters → a name column
    if (share(col, (s) => /^\p{L}[\p{L}.'-]*(\s+\p{L}[\p{L}.'-]*)+$/u.test(s)) > 0.6) {
      mapping.fullName = col;
      break;
    }
  }
  return mapping;
}

/** True when the first row looks like column names rather than a lead. */
export function looksLikeHeader(row: unknown[]): boolean {
  if (Object.keys(guessMapping(row)).length > 0) return true;
  return !row.some((c) => cleanPhone(c) !== "" || /@/.test(String(c ?? "")));
}

/**
 * Column guess for a whole sheet: header names first, then whatever the
 * header did not name (phone, e-mail, name) is recognised from the data.
 */
export function guessSheetMapping(
  rows: unknown[][],
  hasHeader: boolean
): Partial<Record<LeadField, number>> {
  if (!hasHeader) return guessMappingFromData(rows);
  const byName = guessMapping(rows[0] ?? []);
  const byData = guessMappingFromData(rows.slice(1));
  const used = new Set(Object.values(byName));
  const out = { ...byName };
  for (const f of ["phone", "email"] as const) {
    if (out[f] === undefined && byData[f] !== undefined && !used.has(byData[f])) {
      out[f] = byData[f];
      used.add(byData[f]!);
    }
  }
  const hasName = out.fullName !== undefined || out.firstName !== undefined || out.lastName !== undefined;
  if (!hasName && byData.fullName !== undefined && !used.has(byData.fullName)) out.fullName = byData.fullName;
  return out;
}
