import { NextResponse } from "next/server";
import { prisma } from "@/lib/crm/db";

export const revalidate = 300; // cache 5 minutes

export async function GET() {
  const [emissions, projects, stats, contents, news, testimonials] = await Promise.all([
    prisma.webEmission.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.webProject.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.webStat.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.webContent.findMany(),
    prisma.webNews.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.webTestimonial.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const contentMap: Record<string, string> = {};
  for (const c of contents) {
    contentMap[c.key] = c.value;
  }

  return NextResponse.json(
    { emissions, projects, stats, content: contentMap, news, testimonials },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
