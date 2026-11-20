import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./types";

/** Odhlášení po nečinnosti (žádný požadavek na server). */
export const SESSION_IDLE_MS = 30 * 60 * 1000;
/** Nejdelší možná délka přihlášení, i při práci — pak se musí znovu přihlásit. */
export const SESSION_MAX_MS = 12 * 60 * 60 * 1000;
/** Jak často se při aktivitě obnovuje cookie (aby se nepodepisovalo při každém požadavku). */
export const SESSION_REFRESH_MS = 60 * 1000;

export const SESSION_COOKIE = "session";

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    throw new Error(
      "SESSION_SECRET environment variable is required. Set it to a random string of at least 32 characters."
    );
  }
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  /** Čas přihlášení (ms) — od něj se počítá SESSION_MAX_MS. */
  loginAt: number;
  /** Poslední aktivita (ms) — od ní se počítá SESSION_IDLE_MS. */
  lastSeen: number;
  /** Přihlášení prošlo ověřením kódem (2FA). Tokeny bez něj neplatí. */
  mfa: true;
}

export type SessionUser = Omit<SessionPayload, "loginAt" | "lastSeen" | "mfa">;

export async function encrypt(
  user: SessionUser,
  loginAt: number = Date.now()
): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    loginAt,
    lastSeen: now,
    mfa: true,
  };
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((loginAt + SESSION_MAX_MS) / 1000))
    .sign(getSecret());
}

/** Vrátí session jen když je platná, ne starší než 12 h a ne nečinná přes 30 min. */
export async function decrypt(
  session: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, getSecret());
    const p = payload as unknown as SessionPayload;
    const now = Date.now();
    if (typeof p.loginAt !== "number" || typeof p.lastSeen !== "number") return null;
    if (p.mfa !== true) return null;
    if (now - p.loginAt > SESSION_MAX_MS) return null;
    if (now - p.lastSeen > SESSION_IDLE_MS) return null;
    return p;
  } catch {
    return null;
  }
}

/** Nový token s posunutou poslední aktivitou (loginAt zůstává). */
export function refresh(p: SessionPayload): Promise<string> {
  return encrypt(p, p.loginAt);
}

/** Cookie žije jen do konce 12h okna. */
export function cookieMaxAge(p: Pick<SessionPayload, "loginAt">): number {
  return Math.max(0, Math.floor((p.loginAt + SESSION_MAX_MS - Date.now()) / 1000));
}
