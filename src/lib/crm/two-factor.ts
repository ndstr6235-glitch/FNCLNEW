import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { encryptField, decryptField } from "./field-crypto";
import type { SessionUser } from "./session";

// Dvoufázové přihlášení. Tajný klíč TOTP je v tabulce SystemSetting pod
// klíčem "totp:<userId>", zašifrovaný stejně jako osobní údaje (AES-256-GCM).

const PENDING_COOKIE = "login_2fa";
const PENDING_TTL_S = 10 * 60;

function settingKey(userId: string) {
  return `totp:${userId}`;
}

interface StoredTotp {
  s: string; // zašifrovaný secret
  last: number; // poslední použitý krok — stejný kód nejde použít dvakrát
}

export async function getTotp(userId: string): Promise<{ secret: string; last: number } | null> {
  const row = await prisma.systemSetting.findUnique({ where: { key: settingKey(userId) } });
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.value) as StoredTotp;
    return { secret: decryptField(parsed.s), last: parsed.last || 0 };
  } catch {
    return null;
  }
}

export async function saveTotp(userId: string, secret: string, last: number) {
  const value = JSON.stringify({ s: encryptField(secret), last } satisfies StoredTotp);
  await prisma.systemSetting.upsert({
    where: { key: settingKey(userId) },
    create: { key: settingKey(userId), value },
    update: { value },
  });
}

export async function deleteTotp(userId: string) {
  await prisma.systemSetting.deleteMany({ where: { key: settingKey(userId) } });
}

export async function hasTotp(userId: string): Promise<boolean> {
  const n = await prisma.systemSetting.count({ where: { key: settingKey(userId) } });
  return n > 0;
}

// ── Mezikrok po správném hesle ──────────────────────────────────────────

export interface PendingLogin {
  user: SessionUser;
  /** Při prvním nastavení: nový secret (zašifrovaný), který se teprve ověřuje */
  setupSecret?: string;
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET missing");
  return new TextEncoder().encode(s);
}

export async function setPendingLogin(p: PendingLogin) {
  const token = await new SignJWT({ ...p, purpose: "2fa" } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_TTL_S}s`)
    .sign(secret());
  const store = await cookies();
  store.set(PENDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: PENDING_TTL_S,
  });
}

export async function getPendingLogin(): Promise<PendingLogin | null> {
  const store = await cookies();
  const token = store.get(PENDING_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== "2fa") return null;
    return payload as unknown as PendingLogin;
  } catch {
    return null;
  }
}

export async function clearPendingLogin() {
  const store = await cookies();
  store.delete(PENDING_COOKIE);
}

export function sealSetupSecret(plain: string): string {
  return encryptField(plain);
}

export function openSetupSecret(sealed: string): string {
  return decryptField(sealed);
}
