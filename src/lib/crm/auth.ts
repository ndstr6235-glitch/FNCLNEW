import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { Role } from "./types";
import {
  encrypt,
  decrypt,
  cookieMaxAge,
  SESSION_COOKIE,
  type SessionPayload,
  type SessionUser,
} from "./session";

export type { SessionPayload };

export async function createSession(user: SessionUser) {
  const loginAt = Date.now();
  const token = await encrypt(user, loginAt);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: cookieMaxAge({ loginAt }),
  });
}

const ROLE_MAP: Record<string, Role> = {
  ADMINISTRATOR: "administrator",
  SUPERVISOR: "supervisor",
  BROKER: "broker",
  OPERATOR: "operator",
};

/** Aktuální stav účtu z DB — jednou za požadavek (React cache). */
const loadAccount = cache(async (id: string) =>
  prisma.user.findUnique({ where: { id }, select: { active: true, role: true } })
);

/**
 * Platná session jen pro aktivní účet; role se bere z databáze, takže
 * deaktivace nebo snížení role platí okamžitě, ne až po vypršení tokenu.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await decrypt(token);
  if (!session) return null;
  const account = await loadAccount(session.id);
  if (!account || !account.active) return null;
  return { ...session, role: ROLE_MAP[account.role] || "broker" };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
