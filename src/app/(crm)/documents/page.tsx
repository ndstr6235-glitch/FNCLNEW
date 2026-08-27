import { getSession } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import { getAllDocuments } from "@/app/actions/crm/documents";
import DocumentsPageClient from "@/components/crm/documents/documents-page-client";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DocumentsRoute({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "broker") redirect("/dashboard");

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const type =
    typeof params.type === "string" &&
    (params.type === "smlouva" || params.type === "navrh")
      ? params.type
      : "all";

  const documents = await getAllDocuments({
    search: search || undefined,
    type: type === "all" ? undefined : type,
  });

  return (
    <DocumentsPageClient
      documents={documents}
      currentSearch={search}
      currentType={type}
    />
  );
}
