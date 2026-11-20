import "server-only";

// Interní zápisy (aktivita, audit, notifikace). Záměrně NEJSOU v souboru
// s "use server": server action se dá zavolat zvenku i bez přihlášení,
// takže kdokoli by mohl podvrhnout záznam v auditu nebo notifikaci.

import { prisma } from "@/lib/crm/db";
import { headers } from "next/headers";
import type { ActivityType } from "@/lib/crm/activity-types";

export async function logActivity(
  clientId: string,
  userId: string,
  type: ActivityType,
  description: string,
  metadata: Record<string, unknown> = {}
) {
  await prisma.activity.create({
    data: {
      clientId,
      userId,
      type,
      description,
      metadata: JSON.stringify(metadata),
    },
  });
}

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

// Generic helper to create a notification
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  await prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}

// Called when admin assigns a client to a broker
export async function createAssignmentNotification(
  brokerId: string,
  clientName: string,
  clientId: string
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: brokerId,
      type: "client_assigned",
      title: "Nový klient přiřazen",
      message: `${clientName} vám byl přiřazen`,
      link: `/clients?open=${clientId}`,
    },
  });
}
