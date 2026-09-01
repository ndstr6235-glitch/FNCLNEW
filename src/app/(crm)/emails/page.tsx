import { getSession } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import { getEmailPageData } from "@/app/actions/crm/emails";
import EmailsPageClient from "@/components/crm/emails/emails-page-client";
import type { Role } from "@/lib/crm/types";

export default async function EmailsRoute() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getEmailPageData();
  if (!data) return null;

  return (
    <EmailsPageClient
      clients={data.clients}
      templates={data.templates}
      userRole={session.role as Role}
    />
  );
}
