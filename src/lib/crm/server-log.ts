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

// ---------------------------------------------------------------------------
// Hlídání stahování dat — upozorní administrátory na export, tisk kontaktů
// a nezvykle mnoho otevřených karet klientů za hodinu.
// ---------------------------------------------------------------------------

/** Kolik karet klientů za hodinu je ještě normální práce. */
export const CLIENT_VIEWS_PER_HOUR_ALERT = 100;
const ALERT_EMAIL = "info@puskinpartners.cz";

type Who = { id: string; firstName: string; lastName: string; role: string };

async function alertAdmins(who: Who, title: string, message: string) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMINISTRATOR", active: true },
      select: { id: true },
    });
    await Promise.all(
      admins.map((a) => createNotification(a.id, "security", title, message, "/settings/audit"))
    );
  } catch (err) {
    console.error("alertAdmins notification failed:", err);
  }
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) return;
    const { Resend } = await import("resend");
    await new Resend(key).emails.send({
      from: "CRM Puskin Partners <info@puskinpartners.cz>",
      to: ALERT_EMAIL,
      subject: `Bezpečnost CRM: ${title}`,
      text: `${message}\n\nUživatel: ${who.firstName} ${who.lastName} (${who.role})\nČas: ${new Date().toLocaleString("cs-CZ", { timeZone: "Europe/Prague" })}\n\nPodrobnosti v CRM → Nastavení → Audit.`,
    });
  } catch (err) {
    console.error("alertAdmins e-mail failed:", err);
  }
}

/** Otevření karty klienta: zapíše do auditu a při překročení limitu upozorní. */
export async function watchClientView(who: Who, clientId: string) {
  try {
    await logAudit(who.id, "VIEW_CLIENT", "client", clientId);
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const views = await prisma.auditLog.count({
      where: { userId: who.id, action: "VIEW_CLIENT", createdAt: { gte: since } },
    });
    if (views < CLIENT_VIEWS_PER_HOUR_ALERT) return;
    // Nejvýš jedno upozornění za hodinu na uživatele
    const alerted = await prisma.auditLog.count({
      where: { userId: who.id, action: "DATA_ALERT", createdAt: { gte: since } },
    });
    if (alerted > 0) return;
    await logAudit(who.id, "DATA_ALERT", "client", undefined, `${views} karet klientů za hodinu`);
    await alertAdmins(
      who,
      "Nezvykle mnoho otevřených klientů",
      `${who.firstName} ${who.lastName} otevřel(a) za poslední hodinu ${views} karet klientů.`
    );
  } catch (err) {
    console.error("watchClientView failed:", err);
  }
}

/** Export nebo tisk osobních údajů — vždy audit + upozornění administrátorům. */
export async function watchDataExport(who: Who, kind: string, count: number) {
  await logAudit(who.id, "DATA_EXPORT", "client", undefined, `${kind}: ${count} klientů`);
  await alertAdmins(
    who,
    `${kind} (${count} klientů)`,
    `${who.firstName} ${who.lastName} provedl(a) ${kind.toLowerCase()} — ${count} klientů.`
  );
}
