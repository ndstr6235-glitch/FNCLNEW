"use server";

import { prisma } from "@/lib/crm/db";
import { headers } from "next/headers";

export async function logAudit(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: string
) {
  let ipAddress: string | null = null;
  let userAgent: string | null = null;
  try {
    const h = await headers();
    const xff = h.get("x-forwarded-for");
    ipAddress = xff ? xff.split(",")[0].trim() : h.get("x-real-ip");
    userAgent = h.get("user-agent");
    if (userAgent && userAgent.length > 500) {
      userAgent = userAgent.slice(0, 500);
    }
  } catch {
    // headers() not available in this context
  }

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ?? null,
        details: details ?? null,
        ipAddress,
        userAgent,
      },
    });
  } catch {
    console.error("Failed to create audit log");
  }
}
