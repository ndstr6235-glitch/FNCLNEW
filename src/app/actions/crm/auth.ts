"use server";

import { prisma } from "@/lib/crm/db";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { createSession, deleteSession, getSession } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import { logAudit } from "./audit";
import type { Role } from "@/lib/crm/types";

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

  await recordLoginAttempt(email, ipAddress, true);

  await createSession({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: ROLE_MAP[user.role] || "broker",
  });

  await logAudit(user.id, "LOGIN", "user", user.id, `${user.firstName} ${user.lastName}`);

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
