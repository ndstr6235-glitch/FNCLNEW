import crypto from "crypto";

/**
 * Field-level encryption for personal data stored in the database.
 *
 * Values are encrypted with AES-256-GCM before they reach Turso, so a leaked
 * database token, dump or backup holds only ciphertext. The key lives in
 * `DATA_ENCRYPTION_KEY` (32 random bytes, base64) and never in the database.
 *
 * Encrypted columns cannot be searched with LIKE. Phone and e-mail therefore
 * get a keyed hash next to them (`phoneHash`, `emailHash`) that supports
 * exact-match lookups only.
 */

const PREFIX = "enc:v1:";
const IV_LEN = 12;
const TAG_LEN = 16;

/** Columns that are stored encrypted, per Prisma model. */
export const ENCRYPTED_FIELDS: Record<string, readonly string[]> = {
  Client: [
    "phone",
    "email",
    "birthDate",
    "street",
    "city",
    "zip",
    "bankAccount",
    "note",
    "metadata",
  ],
  Payment: ["note"],
  SentEmail: ["to", "body"],
  InboundEmail: ["fromEmail", "fromName", "body", "applied", "pending"],
  Activity: ["metadata"],
  AuditLog: ["details"],
  Notification: ["message"],
  Call: ["note"],
};

let cachedKeys: { enc: Buffer; index: Buffer } | null | undefined;

function loadKeys(): { enc: Buffer; index: Buffer } | null {
  if (cachedKeys !== undefined) return cachedKeys;
  const raw = process.env.DATA_ENCRYPTION_KEY?.trim();
  if (!raw) {
    cachedKeys = null;
    return null;
  }
  const enc = Buffer.from(raw, "base64");
  if (enc.length !== 32) {
    throw new Error("DATA_ENCRYPTION_KEY must be 32 bytes encoded as base64.");
  }
  const index = Buffer.from(
    crypto.hkdfSync("sha256", enc, Buffer.alloc(0), "blind-index", 32)
  );
  cachedKeys = { enc, index };
  return cachedKeys;
}

let warnedMissingKey = false;

/**
 * Without a key the data is stored as before (plain text), so a deployment
 * that has not received the key yet keeps working. It is logged loudly.
 */
function requireKeysInProduction(): { enc: Buffer; index: Buffer } | null {
  const keys = loadKeys();
  if (!keys && process.env.NODE_ENV === "production" && !warnedMissingKey) {
    warnedMissingKey = true;
    console.error("DATA_ENCRYPTION_KEY is not set — personal data is stored UNENCRYPTED.");
  }
  return keys;
}

/** False until the key is configured — the app then behaves as it did before encryption. */
export function encryptionEnabled(): boolean {
  return requireKeysInProduction() !== null;
}

export function isEncrypted(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encryptField(plain: string): string {
  if (plain === "" || isEncrypted(plain)) return plain;
  const keys = requireKeysInProduction();
  if (!keys) return plain;
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv("aes-256-gcm", keys.enc, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), ct]).toString("base64");
}

export function decryptField(value: string): string {
  if (!isEncrypted(value)) return value;
  const keys = loadKeys();
  if (!keys) {
    throw new Error("DATA_ENCRYPTION_KEY is not set — cannot read encrypted data.");
  }
  const buf = Buffer.from(value.slice(PREFIX.length), "base64");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ct = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv("aes-256-gcm", keys.enc, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

export function normalizePhone(raw: unknown): string {
  if (raw == null) return "";
  const digits = String(raw).replace(/\D+/g, "");
  if (digits.length === 12 && digits.startsWith("420")) return digits.slice(3);
  return digits;
}

export function normalizeEmail(raw: unknown): string {
  if (raw == null) return "";
  return String(raw).trim().toLowerCase();
}

function blindIndex(kind: string, normalized: string): string {
  const keys = requireKeysInProduction();
  if (!normalized || !keys) return "";
  return crypto.createHmac("sha256", keys.index).update(`${kind}:${normalized}`).digest("hex");
}

export function phoneHash(raw: unknown): string {
  return blindIndex("phone", normalizePhone(raw));
}

export function emailHash(raw: unknown): string {
  return blindIndex("email", normalizeEmail(raw));
}

/**
 * OR-conditions for a free-text client search. Names match on a substring;
 * phone and e-mail are encrypted, so they match only when typed in full.
 */
export function clientSearchConditions(q: string): Record<string, unknown>[] {
  const conditions: Record<string, unknown>[] = [
    { firstName: { contains: q } },
    { lastName: { contains: q } },
  ];
  if (!encryptionEnabled()) {
    conditions.push({ email: { contains: q } }, { phone: { contains: q } });
    return conditions;
  }
  if (q.includes("@")) conditions.push({ emailHash: emailHash(q) });
  if (normalizePhone(q).length >= 9) conditions.push({ phoneHash: phoneHash(q) });
  return conditions;
}

type Data = Record<string, unknown>;

/** Encrypts the configured columns of a write payload (and fills the hashes). */
export function encryptWriteData(model: string, data: unknown): unknown {
  if (Array.isArray(data)) return data.map((d) => encryptWriteData(model, d));
  if (!data || typeof data !== "object") return data;
  const fields = ENCRYPTED_FIELDS[model];
  if (!fields) return data;

  const out: Data = { ...(data as Data) };
  if (model === "Client") {
    if (typeof out.phone === "string") out.phoneHash = phoneHash(out.phone);
    if (typeof out.email === "string") out.emailHash = emailHash(out.email);
  }
  for (const f of fields) {
    const v = out[f];
    if (typeof v === "string") {
      out[f] = encryptField(v);
    } else if (v && typeof v === "object" && typeof (v as Data).set === "string") {
      out[f] = { set: encryptField((v as Data).set as string) };
    }
  }
  return out;
}

/** Decrypts every encrypted string in a query result, however deeply nested. */
export function decryptResult<T>(value: T): T {
  if (typeof value === "string") {
    return (isEncrypted(value) ? decryptField(value) : value) as T;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = decryptResult(value[i]);
    return value;
  }
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const obj = value as Data;
    for (const k of Object.keys(obj)) obj[k] = decryptResult(obj[k]);
  }
  return value;
}
