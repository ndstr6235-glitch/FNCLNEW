export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/crm/db";
import { verifyUnsubscribeToken } from "@/lib/crm/unsubscribe-token";

function htmlPage(icon: string, title: string, message: string): NextResponse {
  const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:24px;text-align:center;color:#1a2f4a}
h1{color:#b8912a;font-size:28px;margin-bottom:8px}p{color:#556073;line-height:1.6}</style></head>
<body><div style="font-size:48px;margin-bottom:24px">${icon}</div>
<h1>${title}</h1><p>${message}</p>
<p style="font-size:12px;margin-top:32px;color:#888">Nodis Star s.r.o. • IČO 21300101</p></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t");

  if (!t) {
    return htmlPage("⚠️", "Neplatný odkaz", "Tento odhlašovací odkaz není platný nebo vypršel.");
  }

  const clientId = verifyUnsubscribeToken(t);
  if (!clientId) {
    return htmlPage("⚠️", "Neplatný odkaz", "Tento odhlašovací odkaz není platný nebo vypršel.");
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, firstName: true, lastName: true, email: true, dnc: true, assignedTo: true },
  });

  if (!client) {
    return htmlPage("⚠️", "Neplatný odkaz", "Tento odhlašovací odkaz není platný nebo vypršel.");
  }

  if (client.dnc) {
    return htmlPage("✓", "Již jste odhlášeni", "Vaše e-mailová adresa už byla odhlášena dříve.");
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const userAgent = req.headers.get("user-agent")?.slice(0, 500) || null;

  const clientName = `${client.firstName} ${client.lastName}`.trim();
  const today = new Date().toISOString().split("T")[0];

  await prisma.client.update({
    where: { id: clientId },
    data: { dnc: true },
  });

  await Promise.all([
    prisma.calEvent.create({
      data: {
        type: "REMINDER",
        userId: client.assignedTo,
        clientId: client.id,
        title: `GDPR opt-out — ${clientName}`,
        date: today,
        time: "00:00",
        note: "Klient se odhlásil z e-mailů",
      },
    }),
    prisma.activity.create({
      data: {
        clientId: client.id,
        userId: client.assignedTo,
        type: "GDPR_UNSUBSCRIBE",
        description: "Klient se odhlásil z e-mailů (GDPR opt-out)",
        metadata: JSON.stringify({ ip, userAgent }),
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: client.assignedTo,
        action: "GDPR_UNSUBSCRIBE",
        entity: "client",
        entityId: clientId,
        details: `Email: ${client.email}`,
        ipAddress: ip,
        userAgent,
      },
    }),
  ]);

  return htmlPage(
    "✉️",
    "Byli jste odhlášeni",
    "Z této e-mailové adresy už nebudete dostávat další zprávy. Pokud jste se odhlásili omylem, kontaktujte info@nodistar.cz."
  );
}
