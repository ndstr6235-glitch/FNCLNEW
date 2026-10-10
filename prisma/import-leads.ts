/**
 * One-off import of a lead file straight into the pool (large files, PDFs
 * converted to text). Goes through the same encrypted path as the CRM dialog.
 *
 * Usage:
 *   npx tsx --env-file=.env.local prisma/import-leads.ts <file> <source> [sheet] [--apply]
 *
 * <file> is .xls/.xlsx/.csv, or a .txt made with `pdftotext -layout` from a
 * "č / Jméno / Příjmení / telefon" table.
 */
import { readFileSync } from "fs";
import * as XLSX from "xlsx";
import { insertLeadBatch } from "../src/lib/crm/lead-import";
import { cleanPhone, guessMapping, parseLeadRows, type ParsedLead } from "../src/lib/crm/lead-parse";

const [file, source, ...rest] = process.argv.slice(2);
const apply = rest.includes("--apply");
const sheetName = rest.find((a) => !a.startsWith("--"));
const CHUNK = 500;

if (!file || !source) {
  console.error("Usage: import-leads.ts <file> <source> [sheet] [--apply]");
  process.exit(1);
}

function fromText(path: string) {
  const leads: ParsedLead[] = [];
  const seen = new Set<string>();
  let total = 0;
  let withoutPhone = 0;
  let duplicatesInFile = 0;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*\d+\s+(.*?)\s+(\d{9,14})\s*$/);
    if (!m) continue;
    total++;
    const phone = cleanPhone(m[2]);
    if (!phone) { withoutPhone++; continue; }
    if (seen.has(phone)) { duplicatesInFile++; continue; }
    seen.add(phone);
    const parts = m[1].trim().split(/\s{2,}/);
    const firstName = parts.length > 1 ? parts[0] : "";
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : parts[0];
    leads.push({ firstName, lastName, phone, email: "", street: "", city: "", zip: "", note: "" });
  }
  return { leads, total, withoutPhone, duplicatesInFile };
}

function fromSheet(path: string) {
  const wb = XLSX.readFile(path);
  const name = sheetName ?? wb.SheetNames[0];
  const ws = wb.Sheets[name];
  if (!ws) throw new Error(`Sheet "${name}" not found (have: ${wb.SheetNames.join(", ")})`);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "", raw: false });
  const mapping = guessMapping(rows[0]);
  console.log(`Sheet "${name}", columns:`, JSON.stringify(mapping));
  return parseLeadRows(rows.slice(1), mapping);
}

async function main() {
  const summary = file.endsWith(".txt") ? fromText(file) : fromSheet(file);
  console.log(
    `rows ${summary.total} · to import ${summary.leads.length} · no valid phone ${summary.withoutPhone} · duplicates in file ${summary.duplicatesInFile}`
  );
  const noName = summary.leads.filter((l) => !l.firstName && !l.lastName).length;
  console.log(`without first name (companies etc.) ${summary.leads.filter((l) => !l.firstName).length} · without any name ${noName}`);
  if (!apply) {
    console.log("DRY RUN — nothing written. Add --apply to import.");
    return;
  }
  let inserted = 0;
  let duplicatesInDb = 0;
  for (let i = 0; i < summary.leads.length; i += CHUNK) {
    const res = await insertLeadBatch(
      summary.leads.slice(i, i + CHUNK).map((l) => ({ ...l, metadata: {} })),
      source
    );
    inserted += res.inserted;
    duplicatesInDb += res.duplicatesInDb;
    process.stdout.write(`\r${Math.min(i + CHUNK, summary.leads.length)}/${summary.leads.length}`);
  }
  console.log(`\nsource "${source}": inserted ${inserted}, already in CRM ${duplicatesInDb}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
