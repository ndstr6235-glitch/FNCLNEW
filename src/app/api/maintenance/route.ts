export const runtime = "nodejs";
export const maxDuration = 60;

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/crm/db";
import { insertLeadBatch } from "@/lib/crm/lead-import";
import {
  ENCRYPTED_FIELDS,
  decryptField,
  emailHash,
  encryptField,
  encryptionEnabled,
  isEncrypted,
  phoneHash,
} from "@/lib/crm/field-crypto";

/**
 * TEMPORARY one-off maintenance endpoint (encrypting existing rows, bulk lead
 * import). Guarded by MAINTENANCE_SECRET; without it the endpoint is closed.
 * Remove once the rollout is done.
 */

type Row = Record<string, unknown>;
const BATCH = 200;

function authorized(req: NextRequest): boolean {
  const secret = process.env.MAINTENANCE_SECRET;
  const given = req.headers.get("authorization") ?? "";
  if (!secret || secret.length < 32) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function hashColumns(): Promise<{ phoneHash: boolean; emailHash: boolean }> {
  const info = await prisma.$queryRawUnsafe<Row[]>(`PRAGMA table_info("Client")`);
  const names = new Set(info.map((r) => String(r.name)));
  return { phoneHash: names.has("phoneHash"), emailHash: names.has("emailHash") };
}

async function ensureColumns() {
  const have = await hashColumns();
  for (const col of ["phoneHash", "emailHash"] as const) {
    if (!have[col]) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Client" ADD COLUMN "${col}" TEXT NOT NULL DEFAULT ''`
      );
    }
  }
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Client_phoneHash_idx" ON "Client"("phoneHash")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Client_emailHash_idx" ON "Client"("emailHash")`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Client_phone_idx"`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Client_email_idx"`);
}

/** Per-table fingerprint of the decrypted content — equal before and after encryption. */
async function digest() {
  const out: Row = {};
  for (const [model, fields] of Object.entries(ENCRYPTED_FIELDS)) {
    const rows = await prisma.$queryRawUnsafe<Row[]>(
      `SELECT "id", ${fields.map((f) => `"${f}"`).join(", ")} FROM "${model}" ORDER BY "id"`
    );
    const h = crypto.createHash("sha256");
    let enc = 0;
    let plain = 0;
    for (const row of rows) {
      for (const f of fields) {
        const v = row[f];
        if (typeof v !== "string" || v === "") {
          h.update("|");
          continue;
        }
        if (isEncrypted(v)) enc++;
        else plain++;
        h.update(decryptField(v) + "|");
      }
    }
    out[model] = { rows: rows.length, encrypted: enc, plain, digest: h.digest("hex").slice(0, 16) };
  }
  return out;
}

async function encryptSome(model: string, fields: readonly string[]): Promise<number> {
  const cols = fields.map((f) => `"${f}"`).join(", ");
  const pending = fields
    .map((f) => `("${f}" IS NOT NULL AND "${f}" != '' AND "${f}" NOT LIKE 'enc:v1:%')`)
    .join(" OR ");
  const rows = await prisma.$queryRawUnsafe<Row[]>(
    `SELECT "id", ${cols} FROM "${model}" WHERE ${pending} LIMIT ${BATCH}`
  );
  for (const row of rows) {
    const sets: string[] = [];
    const args: string[] = [];
    for (const f of fields) {
      const v = row[f];
      if (typeof v !== "string" || v === "" || isEncrypted(v)) continue;
      sets.push(`"${f}" = ?`);
      args.push(encryptField(v));
    }
    if (model === "Client") {
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
    await prisma.$executeRawUnsafe(
      `UPDATE "${model}" SET ${sets.join(", ")} WHERE "id" = ?`,
      ...args,
      String(row.id)
    );
  }
  return rows.length;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = (await req.json()) as { action?: string; source?: string; leads?: unknown[] };

  try {
    switch (body.action) {
      case "status": {
        const pool = await prisma.$queryRawUnsafe<Row[]>(
          `SELECT u."email" AS owner, c."source" AS source, COUNT(*) AS n FROM "Client" c JOIN "User" u ON u."id" = c."assignedTo" GROUP BY u."email", c."source"`
        );
        return NextResponse.json({
          encryptionEnabled: encryptionEnabled(),
          columns: await hashColumns(),
          clients: pool.map((r) => ({ owner: r.owner, source: r.source, n: Number(r.n) })),
          digest: await digest(),
        });
      }
      case "columns":
        await ensureColumns();
        return NextResponse.json({ ok: true, columns: await hashColumns() });
      case "encrypt": {
        if (!encryptionEnabled()) {
          return NextResponse.json({ error: "DATA_ENCRYPTION_KEY is not set" }, { status: 400 });
        }
        await ensureColumns();
        const done: Record<string, number> = {};
        let total = 0;
        for (const [model, fields] of Object.entries(ENCRYPTED_FIELDS)) {
          done[model] = await encryptSome(model, fields);
          total += done[model];
        }
        return NextResponse.json({ ok: true, done, more: total > 0 });
      }
      case "import": {
        if (!encryptionEnabled()) {
          return NextResponse.json({ error: "DATA_ENCRYPTION_KEY is not set" }, { status: 400 });
        }
        const source = String(body.source ?? "").trim();
        const leads = Array.isArray(body.leads) ? body.leads : [];
        if (!source || leads.length === 0 || leads.length > 500) {
          return NextResponse.json({ error: "Bad batch" }, { status: 400 });
        }
        const s = (v: unknown) => (typeof v === "string" ? v.slice(0, 300) : "");
        const clean = (leads as Row[])
          .map((l) => ({
            firstName: s(l.firstName),
            lastName: s(l.lastName),
            phone: s(l.phone),
            email: s(l.email),
            street: s(l.street),
            city: s(l.city),
            zip: s(l.zip),
            note: s(l.note),
            metadata: {},
          }))
          .filter((l) => /^\+42[01]\d{9}$/.test(l.phone));
        return NextResponse.json({ ok: true, ...(await insertLeadBatch(clean, source)) });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error("maintenance failed:", err);
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
