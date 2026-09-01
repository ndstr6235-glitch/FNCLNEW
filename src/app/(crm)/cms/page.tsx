import { redirect } from "next/navigation";
import { getSession } from "@/lib/crm/auth";
import { getEmissions, getStats, getContents } from "@/app/actions/crm/cms";
import CmsPageClient from "@/components/crm/cms/cms-page-client";

export default async function CmsRoute() {
  const session = await getSession();
  if (!session) return null;

  if (session.role !== "administrator") {
    redirect("/dashboard");
  }

  const [emissions, stats, contents] = await Promise.all([
    getEmissions(),
    getStats(),
    getContents(),
  ]);

  return (
    <CmsPageClient
      emissions={emissions}
      stats={stats}
      contents={contents}
    />
  );
}
