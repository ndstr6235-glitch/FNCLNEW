import { redirect } from "next/navigation";
import { getSession } from "@/lib/crm/auth";
import { getEmissions, getProjects, getStats, getContents, getNews, getTestimonials } from "@/app/actions/crm/cms";
import CmsPageClient from "@/components/crm/cms/cms-page-client";

export default async function CmsRoute() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role !== "administrator") {
    redirect("/dashboard");
  }

  const [emissions, projects, stats, contents, news, testimonials] = await Promise.all([
    getEmissions(),
    getProjects(),
    getStats(),
    getContents(),
    getNews(),
    getTestimonials(),
  ]);

  return (
    <CmsPageClient
      emissions={emissions}
      projects={projects}
      stats={stats}
      contents={contents}
      news={news}
      testimonials={testimonials}
    />
  );
}
