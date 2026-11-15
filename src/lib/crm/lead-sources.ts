import { prisma } from "./db";

/** SystemSetting key holding which lead database each broker/operator draws from */
const KEY = "lead_sources_by_user";

/** userId → sources (Client.source) the distributor may hand them. Missing = any. */
export type LeadSourcePrefs = Record<string, string[]>;

export async function getLeadSourcePrefs(): Promise<LeadSourcePrefs> {
  const row = await prisma.systemSetting.findUnique({ where: { key: KEY } });
  if (!row?.value) return {};
  try {
    const parsed = JSON.parse(row.value) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: LeadSourcePrefs = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(v)) out[k] = v.filter((s): s is string => typeof s === "string");
    }
    return out;
  } catch {
    return {};
  }
}

export async function saveLeadSourcePrefs(prefs: LeadSourcePrefs): Promise<void> {
  const value = JSON.stringify(prefs);
  await prisma.systemSetting.upsert({
    where: { key: KEY },
    update: { value },
    create: { key: KEY, value },
  });
}
