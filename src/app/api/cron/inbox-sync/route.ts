export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { syncInbox } from "@/lib/crm/inbound-sync";

/**
 * Reads the info@ mailbox and turns client replies into contract data on the
 * client card. Also reachable from the CRM UI via syncInboxAction.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncInbox({ force: true });
  return NextResponse.json(result);
}
