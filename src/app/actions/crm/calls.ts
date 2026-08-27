"use server";

import { prisma } from "@/lib/crm/db";
import { getSession } from "@/lib/crm/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { logAudit } from "./audit";
import { CALL_OUTCOMES, getOutcomeMeta } from "@/lib/crm/call-outcomes";
import type { EventType } from "@prisma/client";

export interface CallRow {
  id: string;
  clientId: string;
  userId: string;
  userName: string;
  outcome: string;
  outcomeLabel: string;
  note: string;
  durationSec: number;
  callbackAt: string;
  createdAt: string;
}

export interface LogCallInput {
  clientId: string;
  outcome: string;
  note?: string;
  durationSec?: number;
  /** Required for outcomes CALLBACK and SCHUZKA — ISO datetime or "YYYY-MM-DD HH:MM" */
  callbackAt?: string;
}

const VALID_OUTCOME_CODES = new Set<string>(CALL_OUTCOMES.map((o) => o.code));

export async function logCall(
  input: LogCallInput
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const { clientId, outcome } = input;
  if (!VALID_OUTCOME_CODES.has(outcome)) {
    return { success: false, error: "Neplatný výsledek hovoru" };
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, assignedTo: true, firstName: true, lastName: true, phone: true },
  });
  if (!client) return { success: false, error: "Klient nenalezen" };

  if (session.role === "broker" && client.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  const meta = getOutcomeMeta(outcome)!;
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Validate callback datetime if required
  if ((outcome === "CALLBACK" || outcome === "SCHUZKA") && !input.callbackAt) {
    return {
      success: false,
      error: "Pro Callback / Schůzku zadej datum a čas",
    };
  }

  // 1. Create the call record
  await prisma.call.create({
    data: {
      clientId,
      userId: session.id,
      outcome,
      note: input.note?.trim() || "",
      durationSec: input.durationSec ?? 0,
      callbackAt: input.callbackAt || "",
    },
  });

  // 2. Update Client denormalized fields + DNC + stage
  const clientUpdate: Record<string, unknown> = {
    lastCallOutcome: outcome,
    lastCalledAt: todayStr,
  };
  const metaAny = meta as { setsDnc?: boolean; nextStage?: string };
  if (metaAny.setsDnc) {
    clientUpdate.dnc = true;
  }
  if (metaAny.nextStage) {
    clientUpdate.stage = metaAny.nextStage;
  }
  await prisma.client.update({ where: { id: clientId }, data: clientUpdate });

  // 3. Create follow-up CalEvent for CALLBACK + SCHUZKA
  if (input.callbackAt && (outcome === "CALLBACK" || outcome === "SCHUZKA")) {
    const [datePart, timePart] = input.callbackAt.split(/[ T]/);
    const eventType: EventType = outcome === "SCHUZKA" ? "MEETING" : "CALL";
    const title =
      outcome === "SCHUZKA"
        ? `Schůzka — ${client.firstName} ${client.lastName}`
        : `Zavolat zpět — ${client.firstName} ${client.lastName}`;
    await prisma.calEvent.create({
      data: {
        clientId,
        userId: session.id,
        type: eventType,
        title,
        date: datePart || todayStr,
        time: (timePart || "10:00").slice(0, 5),
        note: input.note?.trim() || "",
      },
    });
  }

  // 4. Smart retry pro NEDOVOLAL — eskalace podle počtu po sobě jdoucích
  // NEDOVOLAL outcomes. Když mezi nimi přijde jiný outcome, counter resetuje.
  if (outcome === "NEDOVOLAL") {
    // Smaž existující pending NEDOVOLAL retry eventy (přepíšeme jedním novým)
    await prisma.calEvent.deleteMany({
      where: {
        clientId,
        type: "CALL",
        date: { gte: todayStr },
        title: { startsWith: "Zkusit znovu —" },
      },
    });

    // Počet po sobě jdoucích NEDOVOLAL z DB (od nejnovějšího)
    const recentCalls = await prisma.call.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { outcome: true },
    });
    let consecutive = 1; // tento právě zalogovaný
    for (const c of recentCalls) {
      if (c.outcome === "NEDOVOLAL") consecutive++;
      else break;
    }
    // Eskalace: 1→1d, 2→3d, 3→7d, 4→14d, 5+→30d
    const retryInDays =
      consecutive >= 5 ? 30 :
      consecutive === 4 ? 14 :
      consecutive === 3 ? 7 :
      consecutive === 2 ? 3 :
      1;
    const retryDate = new Date();
    retryDate.setDate(retryDate.getDate() + retryInDays);
    await prisma.calEvent.create({
      data: {
        clientId,
        userId: session.id,
        type: "CALL",
        title: `Zkusit znovu — ${client.firstName} ${client.lastName} (${consecutive}× nedovolal)`,
        date: retryDate.toISOString().split("T")[0],
        time: "10:00",
        note: `${consecutive}× nedovolal po sobě. Další pokus za ${retryInDays} ${
          retryInDays === 1 ? "den" : retryInDays < 5 ? "dny" : "dní"
        }.${input.note?.trim() ? ` ${input.note.trim()}` : ""}`,
      },
    });
    // Po 5 nezvednutích → "dead lead", auto stage
    if (consecutive >= 5) {
      await prisma.client.update({
        where: { id: clientId },
        data: { stage: "CONTACTED" }, // necháme v CONTACTED, ne LOST, ať to broker vidí
      });
    }
  }

  // 5. NEZAJEM → +6M retry. Smaž existující pending NEZAJEM retry eventy.
  if (outcome === "NEZAJEM") {
    await prisma.calEvent.deleteMany({
      where: {
        clientId,
        type: "CALL",
        date: { gte: todayStr },
        title: { contains: "před 6 měsíci nezájem" },
      },
    });
    const retryDate = new Date();
    retryDate.setMonth(retryDate.getMonth() + 6);
    await prisma.calEvent.create({
      data: {
        clientId,
        userId: session.id,
        type: "CALL",
        title: `Zkusit znovu — ${client.firstName} ${client.lastName} (před 6 měsíci nezájem)`,
        date: retryDate.toISOString().split("T")[0],
        time: "10:00",
        note: `Při minulém kontaktu odmítl. ${input.note?.trim() || ""}`.trim(),
      },
    });
  }

  // 4. Activity + audit log
  await logActivity(
    clientId,
    session.id,
    "CLIENT_UPDATED",
    `Hovor: ${meta.label}${input.note ? ` — ${input.note}` : ""}`
  );
  await logAudit(
    session.id,
    "CALL_LOGGED",
    "client",
    clientId,
    `${client.firstName} ${client.lastName}: ${meta.label}`
  );

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getClientCalls(clientId: string): Promise<CallRow[]> {
  const session = await getSession();
  if (!session) return [];

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { assignedTo: true },
  });
  if (!client) return [];
  if (session.role === "broker" && client.assignedTo !== session.id) return [];

  const calls = await prisma.call.findMany({
    where: { clientId },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return calls.map((c) => ({
    id: c.id,
    clientId: c.clientId,
    userId: c.userId,
    userName: `${c.user.firstName} ${c.user.lastName}`,
    outcome: c.outcome,
    outcomeLabel: getOutcomeMeta(c.outcome)?.label ?? c.outcome,
    note: c.note,
    durationSec: c.durationSec,
    callbackAt: c.callbackAt,
    createdAt: c.createdAt.toISOString(),
  }));
}
