import { prisma } from "./db";
import bcrypt from "bcryptjs";

const POOL_EMAIL = "pool@system.local";

let cachedPoolId: string | null = null;

/**
 * Returns the ID of the sentinel "Volny pool" user that imported but
 * not-yet-distributed leads are assigned to.
 */
export async function getPoolUserId(): Promise<string> {
  if (cachedPoolId) return cachedPoolId;

  const existing = await prisma.user.findUnique({
    where: { email: POOL_EMAIL },
    select: { id: true },
  });
  if (existing) {
    cachedPoolId = existing.id;
    return existing.id;
  }

  const randomPassword = await bcrypt.hash(
    Math.random().toString(36) + Date.now(),
    10
  );
  const created = await prisma.user.create({
    data: {
      firstName: "Volny",
      lastName: "pool",
      email: POOL_EMAIL,
      password: randomPassword,
      role: "BROKER",
      active: false,
      dailyLeadQuota: 0,
    },
    select: { id: true },
  });
  cachedPoolId = created.id;
  return created.id;
}
