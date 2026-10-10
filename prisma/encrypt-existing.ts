/**
 * Encrypts personal data that is already stored in Turso and fills the
 * phone / e-mail hashes. Safe to run repeatedly — encrypted rows are skipped.
 *
 * Usage:
 *   npx tsx --env-file=.env.local prisma/encrypt-existing.ts            (dry run, counts only)
 *   npx tsx --env-file=.env.local prisma/encrypt-existing.ts --columns  (adds the hash columns only)
 *   npx tsx --env-file=.env.local prisma/encrypt-existing.ts --apply    (writes)
 *
 * Rollout order: --columns → deploy the code that understands encrypted
 * values → --apply. Code deployed before that cannot read encrypted rows.
 */
import { createClient, type InStatement } from "@libsql/client";
import {
  ENCRYPTED_FIELDS,
  emailHash,
  encryptField,
  isEncrypted,
  phoneHash,
} from "../src/lib/crm/field-crypto";

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
const columnsOnly = process.argv.includes("--columns");
const apply = columnsOnly || process.argv.includes("--apply");
const BATCH = 200;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}
if (!process.env.DATA_ENCRYPTION_KEY) {
  console.error("Missing DATA_ENCRYPTION_KEY");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function ensureHashColumns() {
  const info = await db.execute(`PRAGMA table_info("Client")`);
  const columns = new Set(info.rows.map((r) => String(r.name)));
  for (const col of ["phoneHash", "emailHash"]) {
    if (columns.has(col)) continue;
    console.log(`Client.${col}: column missing${apply ? " — adding" : ""}`);
    if (apply) {
      await db.execute(`ALTER TABLE "Client" ADD COLUMN "${col}" TEXT NOT NULL DEFAULT ''`);
    }
  }
  if (!apply) return columns.has("phoneHash") && columns.has("emailHash");
  await db.execute(`CREATE INDEX IF NOT EXISTS "Client_phoneHash_idx" ON "Client"("phoneHash")`);
  await db.execute(`CREATE INDEX IF NOT EXISTS "Client_emailHash_idx" ON "Client"("emailHash")`);
  await db.execute(`DROP INDEX IF EXISTS "Client_phone_idx"`);
  await db.execute(`DROP INDEX IF EXISTS "Client_email_idx"`);
  return true;
}

async function encryptTable(model: string, fields: readonly string[], hasHashes: boolean) {
  const cols = fields.map((f) => `"${f}"`).join(", ");
  const pending = fields
    .map((f) => `("${f}" IS NOT NULL AND "${f}" != '' AND "${f}" NOT LIKE 'enc:v1:%')`)
    .join(" OR ");
  const needsHash =
    model === "Client" && hasHashes
      ? ` OR ("phone" != '' AND "phoneHash" = '') OR ("email" != '' AND "emailHash" = '')`
      : "";

  let done = 0;
  let lastId = "";
  for (;;) {
    const res = await db.execute({
      sql: `SELECT "id", ${cols} FROM "${model}" WHERE "id" > ? AND (${pending}${needsHash}) ORDER BY "id" LIMIT ${BATCH}`,
      args: [lastId],
    });
    if (res.rows.length === 0) break;
    lastId = String(res.rows[res.rows.length - 1].id);

    const statements: InStatement[] = [];
    for (const row of res.rows) {
      const sets: string[] = [];
      const args: (string | null)[] = [];
      for (const f of fields) {
        const v = row[f];
        if (typeof v !== "string" || v === "" || isEncrypted(v)) continue;
        sets.push(`"${f}" = ?`);
        args.push(encryptField(v));
      }
      if (model === "Client") {
        // Hashes come from plain values, so only rows not yet encrypted get them here
        if (typeof row.phone === "string" && !isEncrypted(row.phone)) {
          sets.push(`"phoneHash" = ?`);
          args.push(phoneHash(row.phone));
        }
        if (typeof row.email === "string" && !isEncrypted(row.email)) {
          sets.push(`"emailHash" = ?`);
          args.push(emailHash(row.email));
        }
      }
      if (sets.length === 0) continue;
      statements.push({
        sql: `UPDATE "${model}" SET ${sets.join(", ")} WHERE "id" = ?`,
        args: [...args, String(row.id)],
      });
    }
    if (apply && statements.length > 0) await db.batch(statements, "write");
    done += statements.length;
  }
  console.log(`${model}: ${done} rows ${apply ? "encrypted" : "to encrypt"}`);
}

async function main() {
  console.log(apply ? "APPLY — writing to the database\n" : "DRY RUN — nothing is written\n");
  const hasHashes = await ensureHashColumns();
  if (columnsOnly) {
    console.log("Hash columns are in place.");
    return;
  }
  for (const [model, fields] of Object.entries(ENCRYPTED_FIELDS)) {
    await encryptTable(model, fields, hasHashes);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
