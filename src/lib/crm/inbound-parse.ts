/**
 * Parser for client replies arriving in the info@ mailbox.
 *
 * The "Navrh smlouvy" template asks the client for the data needed to issue the
 * final contract. Clients answer in free form, so the parser works line by line:
 * it looks for a known label (with or without diacritics, after a colon or a
 * dash) and reads the value that follows.
 */

export interface ParsedClientData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  zip?: string;
  bankAccount?: string;
  investmentAmount?: number;
  /** Sensitive values that live in Client.metadata */
  rodneCislo?: string;
  cisloOp?: string;
}

const stripDiacritics = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "");

const norm = (s: string) => stripDiacritics(s).toLowerCase().trim();

/**
 * Drop the quoted original message so we never parse our own template back.
 * Cuts at the usual reply separators and at any run of "> " quoting.
 */
export function stripQuotedText(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  for (const line of lines) {
    const n = norm(line);
    const isSeparator =
      /^>/.test(line.trim()) ||
      /^-{2,}\s*(puvodni|original)/.test(n) ||
      /^(od|from|odesilatel)\s*:/.test(n) ||
      /^dne .* napsal/.test(n) ||
      /^on .* wrote:/.test(n) ||
      n === "--" ||
      /^_{5,}$/.test(n);
    if (isSeparator) break;
    out.push(line);
  }

  return out.join("\n").trim();
}

// label (normalized, no diacritics) -> field
const LABELS: { keys: string[]; field: keyof ParsedClientData }[] = [
  { keys: ["jmeno a prijmeni", "jmeno prijmeni", "cele jmeno"], field: "firstName" },
  { keys: ["jmeno"], field: "firstName" },
  { keys: ["prijmeni"], field: "lastName" },
  { keys: ["datum narozeni", "narozen", "narozena"], field: "birthDate" },
  { keys: ["rodne cislo", "rc"], field: "rodneCislo" },
  { keys: ["cislo op", "cislo obcanskeho prukazu", "obcansky prukaz", "op"], field: "cisloOp" },
  {
    keys: [
      "adresa trvaleho bydliste",
      "trvale bydliste",
      "trvala adresa",
      "bydliste",
      "adresa",
    ],
    field: "street",
  },
  { keys: ["cislo uctu", "bankovni ucet", "ucet", "iban"], field: "bankAccount" },
  {
    keys: [
      "vyse investice",
      "castka investice",
      "investovana castka",
      "investice",
      "castka",
    ],
    field: "investmentAmount",
  },
  { keys: ["telefon", "tel", "mobil", "telefonni cislo"], field: "phone" },
  { keys: ["email", "e mail", "emailova adresa"], field: "email" },
];

function matchLabel(rawLabel: string): keyof ParsedClientData | null {
  const n = norm(rawLabel)
    .replace(/^[-–—•*\s]+/, "")
    .replace(/[.:]+$/, "")
    .replace(/\s+/g, " ");
  if (!n || n.length > 40) return null;

  for (const { keys, field } of LABELS) {
    if (keys.includes(n)) return field;
  }
  // "Datum narozeni (dd.mm.rrrr)" and similar suffixes
  for (const { keys, field } of LABELS) {
    if (keys.some((k) => n.startsWith(k + " "))) return field;
  }
  return null;
}

/** "1.5.1980", "01. 05. 1980", "1980-05-01" -> "1980-05-01" */
export function parseCzechDate(value: string): string | undefined {
  const dotted = value.match(/(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{4})/);
  if (dotted) {
    const [, d, m, y] = dotted;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const iso = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  return undefined;
}

/** "500 000 Kc", "500.000,-", "1 250 000" -> number */
export function parseAmount(value: string): number | undefined {
  const cleaned = value
    .replace(/[\s ]/g, "")
    .replace(/(kc|czk|,-)/gi, "")
    .replace(/\.(?=\d{3}\b)/g, "")
    .replace(",", ".");
  const m = cleaned.match(/-?\d+(\.\d+)?/);
  if (!m) return undefined;
  const n = Number(m[0]);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** "Dlouha 12, 110 00 Praha 1" -> street / zip / city */
export function parseAddress(value: string): {
  street?: string;
  city?: string;
  zip?: string;
} {
  const result: { street?: string; city?: string; zip?: string } = {};
  let rest = value.trim();

  const zipMatch = rest.match(/\b(\d{3})\s?(\d{2})\b/);
  if (zipMatch) {
    result.zip = `${zipMatch[1]}${zipMatch[2]}`;
    rest = rest.replace(zipMatch[0], " ").replace(/\s{2,}/g, " ");
  }

  const parts = rest
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    result.street = parts[0];
    result.city = parts.slice(1).join(", ").trim();
  } else if (parts.length === 1) {
    result.street = parts[0];
  }

  if (result.city === "") delete result.city;
  return result;
}

const ACCOUNT_RE = /\b(?:\d{1,6}-)?\d{2,10}\/\d{4}\b/;
const IBAN_RE = /\bCZ\d{2}[\s]?(?:\d{4}[\s]?){5}\b/i;
const RC_RE = /\b\d{6}\s?\/\s?\d{3,4}\b/;

/**
 * Pull the contract data out of a client reply. Returns only the fields that
 * were actually found — never guesses.
 */
export function parseClientData(rawBody: string): ParsedClientData {
  const body = stripQuotedText(rawBody);
  const data: ParsedClientData = {};

  for (const line of body.split("\n")) {
    if (!line.trim()) continue;

    // "Label: value" or "- Label – value"
    const split = line.match(/^(.{2,40}?)\s*[:–—]\s*(.+)$/);
    if (!split) continue;

    const field = matchLabel(split[1]);
    if (!field) continue;
    const value = split[2].trim().replace(/\s{2,}/g, " ");
    if (!value) continue;

    switch (field) {
      case "firstName": {
        // A single "Jmeno a prijmeni" line carries both names
        const words = value.split(/\s+/).filter(Boolean);
        if (words.length >= 2) {
          data.firstName = words.slice(0, -1).join(" ");
          data.lastName = words[words.length - 1];
        } else {
          data.firstName = value;
        }
        break;
      }
      case "lastName":
        data.lastName = value;
        break;
      case "birthDate": {
        const d = parseCzechDate(value);
        if (d) data.birthDate = d;
        const rc = value.match(RC_RE);
        if (rc && !data.rodneCislo) data.rodneCislo = rc[0].replace(/\s/g, "");
        break;
      }
      case "rodneCislo": {
        const rc = value.match(RC_RE);
        data.rodneCislo = rc ? rc[0].replace(/\s/g, "") : value;
        if (!data.birthDate) {
          const fromRc = rodneCisloToBirthDate(data.rodneCislo);
          if (fromRc) data.birthDate = fromRc;
        }
        break;
      }
      case "cisloOp":
        data.cisloOp = value;
        break;
      case "street": {
        const addr = parseAddress(value);
        if (addr.street) data.street = addr.street;
        if (addr.city) data.city = addr.city;
        if (addr.zip) data.zip = addr.zip;
        break;
      }
      case "bankAccount": {
        const acc = value.match(ACCOUNT_RE) || value.match(IBAN_RE);
        data.bankAccount = acc ? acc[0].replace(/\s/g, "") : value;
        break;
      }
      case "investmentAmount": {
        const amount = parseAmount(value);
        if (amount) data.investmentAmount = amount;
        break;
      }
      case "phone": {
        const digits = value.replace(/[^\d+]/g, "");
        if (digits.replace(/\D/g, "").length >= 9) data.phone = digits;
        break;
      }
      case "email": {
        const m = value.match(/[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+/);
        if (m) data.email = m[0].toLowerCase();
        break;
      }
    }
  }

  // Many clients answer with bare lines and no labels at all:
  //   Andrea Novakova
  //   123456/4321
  //   Budecska 21, Praha 5
  //   123456789/0900
  //   500.000
  parseUnlabelledLines(body, data);

  // …and some write it as prose: "narozen 12.7.1985, bydlím na adrese …"
  parseProse(body, data);

  return data;
}

/**
 * Keyword-anchored extraction for replies written as sentences rather than a
 * list. Runs after the line passes and only fills what is still missing.
 */
function parseProse(body: string, data: ParsedClientData): void {
  const flat = body.replace(/\n/g, " ").replace(/\s{2,}/g, " ");
  const flatNorm = norm(flat);

  if (!data.birthDate) {
    const m = flatNorm.match(
      /(?:narozen[ay]?|nar\.|datum narozeni)\s*(?:dne\s*)?(\d{1,2}\s*\.\s*\d{1,2}\s*\.\s*\d{4})/
    );
    if (m) {
      const d = parseCzechDate(m[1]);
      if (d) data.birthDate = d;
    }
  }

  if (!data.street) {
    // Keep the original casing for the address itself
    const idx = flatNorm.search(
      /(?:adrese|adresa|bydliste|trvale bydliste|bydlim na)\s*:?\s*/
    );
    if (idx >= 0) {
      const after = flat.slice(idx).replace(/^[^,]*?(?:adres\S*|bydli\S*)\s*:?\s*/i, "");
      const chunk = after.split(/[.;]|\s(?:a|chci|posl[ae])\s/i)[0];
      const addr = parseAddress(chunk);
      if (addr.street && (addr.city || addr.zip)) {
        data.street = addr.street;
        if (addr.city && !data.city) data.city = addr.city;
        if (addr.zip && !data.zip) data.zip = addr.zip;
      }
    }
  }

  if (!data.investmentAmount) {
    const m = flat.match(/(\d[\d\s .,]{2,})\s*(?:kč|kc|czk)\b/i);
    const amount = m ? parseAmount(m[1]) : undefined;
    if (amount && amount >= 1000) data.investmentAmount = amount;
  }

  if (!data.phone) {
    // Negative lookaround keeps account numbers ("123456789/0900") out
    const m = flat.match(
      /(?<![\d/-])(?:\+420\s?)?\d{3}\s?\d{3}\s?\d{3}(?![\d/-])/
    );
    if (m) data.phone = m[0].replace(/[^\d+]/g, "");
  }

  if (!data.firstName) {
    const m = flat.match(
      /(?:jmenuji se|jmenuju se|jsem)\s+([A-ZÁ-Ž][a-zá-ž'-]+(?:\s+[A-ZÁ-Ž][a-zá-ž'-]+){1,2})/u
    );
    if (m) {
      const words = m[1].split(/\s+/);
      data.firstName = words.slice(0, -1).join(" ");
      data.lastName = words[words.length - 1];
    }
  }
}

/**
 * True when the reply carries something the contract actually needs. A bare
 * name from a signature is not enough to flag the client as waiting.
 */
export function hasContractData(data: ParsedClientData): boolean {
  return Boolean(
    data.bankAccount ||
      data.rodneCislo ||
      data.investmentAmount ||
      data.birthDate ||
      data.street
  );
}

/** Greeting / sign-off lines that must never be read as a client's name. */
const NON_NAME_LINES = [
  "dobry den",
  "dobry vecer",
  "vazeny pane",
  "vazena pani",
  "s pozdravem",
  "s uctou",
  "dekuji",
  "dekuji predem",
  "hezky den",
  "prijemny den",
  "posilam udaje",
  "posilam pozadovane udaje",
  "zdravim",
  "mejte se hezky",
];

/**
 * Second pass over lines that carry no label — each line is classified by what
 * it looks like. Only fills fields the labelled pass did not already set.
 */
function parseUnlabelledLines(body: string, data: ParsedClientData): void {
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim().replace(/\s{2,}/g, " ");
    if (!line || line.length > 120) continue;
    // Lines with a label were handled in the first pass
    if (/^.{2,40}?\s*[:–—]\s*.+$/.test(line) && matchLabel(line.split(/[:–—]/)[0])) {
      continue;
    }

    const rc = line.match(RC_RE);
    if (rc && !data.rodneCislo) {
      data.rodneCislo = rc[0].replace(/\s/g, "");
      if (!data.birthDate) {
        const fromRc = rodneCisloToBirthDate(data.rodneCislo);
        if (fromRc) data.birthDate = fromRc;
      }
      continue;
    }

    const acc = line.match(ACCOUNT_RE) || line.match(IBAN_RE);
    if (acc && !data.bankAccount && !rc) {
      data.bankAccount = acc[0].replace(/\s/g, "");
      continue;
    }

    const mail = line.match(/[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+/);
    if (mail && !data.email) {
      data.email = mail[0].toLowerCase();
      continue;
    }

    // Phone — a bare line of 9+ digits with the usual separators
    if (!data.phone && /^\+?[\d\s()/-]{9,20}$/.test(line)) {
      const digits = line.replace(/[^\d+]/g, "");
      const digitCount = digits.replace(/\D/g, "").length;
      if (digitCount === 9 || digitCount === 12 || digits.startsWith("+")) {
        data.phone = digits;
        continue;
      }
    }

    // Amount — a bare number, 1000 or more ("500.000", "500 000 Kc")
    if (!data.investmentAmount && /^[\d\s.,]+(kc|czk|,-)?$/i.test(line)) {
      const amount = parseAmount(line);
      if (amount && amount >= 1000) {
        data.investmentAmount = amount;
        continue;
      }
    }

    const date = !data.birthDate ? parseCzechDate(line) : undefined;
    if (date && /^[\d\s./-]+$/.test(line)) {
      data.birthDate = date;
      continue;
    }

    // Sentences are handled by parseProse — line heuristics below only apply
    // to short, list-style lines
    const wordCount = line.split(/\s+/).filter(Boolean).length;
    if (wordCount > 7 || !/^[A-ZÁ-Ž0-9+]/u.test(line)) continue;

    // Address — house number plus a comma, e.g. "Budecska 21, Praha 5"
    if (!data.street && /\d/.test(line) && /[a-zá-ž]/i.test(line)) {
      const addr = parseAddress(line.replace(/\.$/, ""));
      if (addr.street && (addr.city || addr.zip)) {
        data.street = addr.street;
        if (addr.city && !data.city) data.city = addr.city;
        if (addr.zip && !data.zip) data.zip = addr.zip;
        continue;
      }
    }

    // Name — two or three plain words, no digits, not a greeting
    if (!data.firstName && !/\d/.test(line)) {
      const n = norm(line).replace(/[.,]/g, "").trim();
      if (NON_NAME_LINES.some((g) => n === g || n.startsWith(g))) continue;
      const words = line.replace(/[.,]/g, "").split(/\s+/).filter(Boolean);
      const looksLikeName =
        words.length >= 2 &&
        words.length <= 3 &&
        words.every((w) => /^[A-ZÁ-Ž][a-zá-ž'-]+$/u.test(w));
      if (looksLikeName) {
        data.firstName = words.slice(0, -1).join(" ");
        data.lastName = words[words.length - 1];
      }
    }
  }
}

/** Derives the birth date from a Czech personal number (women: month + 50). */
export function rodneCisloToBirthDate(rc: string): string | undefined {
  const digits = rc.replace(/\D/g, "");
  if (digits.length < 9) return undefined;

  const yy = Number(digits.slice(0, 2));
  let mm = Number(digits.slice(2, 4));
  const dd = Number(digits.slice(4, 6));

  if (mm > 70) mm -= 70; // women, 2004+
  else if (mm > 50) mm -= 50; // women
  else if (mm > 20) mm -= 20; // men, 2004+

  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return undefined;

  // 9-digit personal numbers are pre-1954; 10-digit ones use the 1900/2000 split
  const year = digits.length === 9 ? 1900 + yy : yy <= 25 ? 2000 + yy : 1900 + yy;

  return `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

/** How many contract-relevant fields the reply actually carries. */
export function countParsedFields(data: ParsedClientData): number {
  return Object.values(data).filter(
    (v) => v !== undefined && v !== "" && v !== 0
  ).length;
}
