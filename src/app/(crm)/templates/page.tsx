import { redirect } from "next/navigation";
import { getSession } from "@/lib/crm/auth";
import { getTemplates } from "@/app/actions/crm/templates";
import TemplatesPageClient from "@/components/crm/templates/templates-page-client";

export default async function TemplatesRoute() {
  const session = await getSession();
  if (!session) return null;

  // Admin only
  if (session.role !== "administrator") {
    redirect("/dashboard");
  }

  const templates = await getTemplates();

  return <TemplatesPageClient templates={templates} />;
}
