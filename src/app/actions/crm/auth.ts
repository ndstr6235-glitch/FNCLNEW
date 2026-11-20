"use server";

import { prisma } from "@/lib/crm/db";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { createSession, deleteSession, getSession } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/crm/server-log";
import { generateTotpSecret, verifyTotp } from "@/lib/crm/totp";
import {
  hasTotp,
  getTotp,
  saveTotp,
  setPendingLogin,
  getPendingLogin,
  clearPendingLogin,
  sealSetupSecret,
  openSetupSecret,
} from "@/lib/crm/two-factor";
import type { Role } from "@/lib/crm/types";

/** Vyžadovat kód z Google Authenticatoru po hesle. */
const TWO_FACTOR_REQUIRED = false;

const MAX_FAILED_PER_IP = 10;
const MAX_FAILED_PER_EMAIL = 5;
const WINDOW_MIN = 5;

async function getClientIp(): Promise<string | null> {
  try {
    const h = await headers();
    const xff = h.get("x-forwarded-for");
    return xff ? xff.split(",")[0].trim() : h.get("x-real-ip");
  } catch {
    return null;
  }
}

async function checkRateLimit(
  email: string,
  ipAddress: string | null
): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MIN * 60 * 1000);

  const [byIp, byEmail] = await Promise.all([
    ipAddress
      ? prisma.loginAttempt.count({
          where: { ipAddress, success: false, createdAt: { gte: since } },
        })
      : Promise.resolve(0),
    prisma.loginAttempt.count({
      where: { email, success: false, createdAt: { gte: since } },
    }),
  ]);

  return byIp < MAX_FAILED_PER_IP && byEmail < MAX_FAILED_PER_EMAIL;
}

async function recordLoginAttempt(
  email: string,
  ipAddress: string | null,
  success: boolean
) {
  try {
    await prisma.loginAttempt.create({
      data: { email, ipAddress, success },
    });
  } catch {
    // best effort
  }
}

const ROLE_MAP: Record<string, Role> = {
  ADMINISTRATOR: "administrator",
  SUPERVISOR: "supervisor",
  BROKER: "broker",
  OPERATOR: "operator",
};

const DUMMY_BCRYPT_HASH =
  "$2a$10$CwTycUXWue0Thq9StjUM0uJ8vxFvOZ4yJg6Yp1eUSv7Y6KvVe4lLm";

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Vyplnte email a heslo." };
  }

  const ipAddress = await getClientIp();

  const allowed = await checkRateLimit(email, ipAddress);
  if (!allowed) {
    return {
      error: `Prilis mnoho neuspesnych pokusu. Zkuste to za ${WINDOW_MIN} minut.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  const valid = await bcrypt.compare(
    password,
    user?.password || DUMMY_BCRYPT_HASH
  );

  if (
    !user ||
    !user.active ||
    !valid ||
    user.email === "pool@system.local"
  ) {
    await recordLoginAttempt(email, ipAddress, false);
    return { error: "Nespravny email nebo heslo." };
  }

  // Heslo sedí → druhý krok (kód z aplikace). Session vzniká až po kódu.
  const sessionUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: ROLE_MAP[user.role] || "broker",
  };
  // Dvoufázové ověření je zatím vypnuté (2026-11-20, na přání majitele).
  // Zapnutí: TWO_FACTOR_REQUIRED = true — nic dalšího měnit netřeba.
  if (!TWO_FACTOR_REQUIRED) {
    await recordLoginAttempt(email, ipAddress, true);
    await createSession(sessionUser);
    await logAudit(user.id, "LOGIN", "user", user.id, `${user.firstName} ${user.lastName}`);
    redirect("/dashboard");
  }

  const enrolled = await hasTotp(user.id);
  await setPendingLogin({
    user: sessionUser,
    ...(enrolled ? {} : { setupSecret: sealSetupSecret(generateTotpSecret()) }),
  });

  redirect("/login/2fa");
}

const MAX_FAILED_2FA = 5;

/** Druhý krok přihlášení: ověří 6místný kód z Google Authenticatoru. */
export async function verifyTwoFactor(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const pending = await getPendingLogin();
  if (!pending) {
    return { error: "Přihlášení vypršelo. Zadejte znovu e-mail a heslo." };
  }
  const code = String(formData.get("code") || "");
  const ipAddress = await getClientIp();
  const attemptKey = `2fa:${pending.user.email}`;

  const since = new Date(Date.now() - WINDOW_MIN * 60 * 1000);
  const failed = await prisma.loginAttempt.count({
    where: { email: attemptKey, success: false, createdAt: { gte: since } },
  });
  if (failed >= MAX_FAILED_2FA) {
    await clearPendingLogin();
    return { error: `Příliš mnoho špatných kódů. Zkuste to za ${WINDOW_MIN} minut znovu od začátku.` };
  }

  // Účet mohl být mezitím deaktivován
  const account = await prisma.user.findUnique({
    where: { id: pending.user.id },
    select: { active: true },
  });
  if (!account?.active) {
    await clearPendingLogin();
    return { error: "Účet není aktivní." };
  }

  let ok = false;
  if (pending.setupSecret) {
    const secret = openSetupSecret(pending.setupSecret);
    const step = verifyTotp(secret, code);
    if (step !== null) {
      await saveTotp(pending.user.id, secret, step);
      await logAudit(pending.user.id, "2FA_ENABLED", "user", pending.user.id);
      ok = true;
    }
  } else {
    const stored = await getTotp(pending.user.id);
    if (stored) {
      const step = verifyTotp(stored.secret, code);
      // Stejný kód nejde použít podruhé (ochrana proti odposlechnutí)
      if (step !== null && step > stored.last) {
        await saveTotp(pending.user.id, stored.secret, step);
        ok = true;
      }
    }
  }

  if (!ok) {
    await recordLoginAttempt(attemptKey, ipAddress, false);
    return { error: "Neplatný kód. Zadejte aktuální kód z aplikace." };
  }

  await recordLoginAttempt(pending.user.email, ipAddress, true);
  await clearPendingLogin();
  await createSession(pending.user);
  await logAudit(
    pending.user.id,
    "LOGIN",
    "user",
    pending.user.id,
    `${pending.user.firstName} ${pending.user.lastName}`
  );

  redirect("/dashboard");
}

export async function logout() {
  const session = await getSession();
  if (session) {
    await logAudit(session.id, "LOGOUT", "user", session.id, `${session.firstName} ${session.lastName}`);
  }
  await deleteSession();
  redirect("/login");
}
