"use server";

import { getSession } from "@/lib/crm/auth";
import {
  distributeLeads,
  type DistributeLeadsResult,
} from "@/lib/crm/distribute-leads-core";
import { logAudit } from "./audit";

/**
 * Admin-only manual trigger from the dashboard.
 */
export async function triggerDistributionManual(): Promise<
  | { success: true; result: DistributeLeadsResult }
  | { success: false; error: string }
> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  const result = await distributeLeads("manual");
  await logAudit(
    session.id,
    "DISTRIBUTE_LEADS",
    "system",
    undefined,
    `Manual: ${result.totalAssigned} přiřazeno (zbývá ${result.poolRemainingAfter})`
  );
  return { success: true, result };
}
