import { NextRequest, NextResponse } from "next/server";
import { distributeLeads } from "@/lib/crm/distribute-leads-core";

/**
 * Daily cron — pulls leads from the pool and assigns each active broker their
 * `dailyLeadQuota`. Configured in vercel.json (default schedule: 07:00 daily).
 *
 * Triggers admin notification if pool runs low.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await distributeLeads("cron");
  return NextResponse.json({ ok: true, ...result });
}
