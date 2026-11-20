import "server-only";

import { cookies } from "next/headers";
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

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decrypt(token);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
