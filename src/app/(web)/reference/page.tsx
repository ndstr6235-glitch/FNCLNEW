import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import ProjectCards from "@/components/sections/ProjectCards";
import Testimonials from "@/components/sections/Testimonials";
import CTASection from "@/components/sections/CTASection";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Reference",
  description:
    "Naše dokončené projekty a rekonstrukce — before/after galerie a reference klientů.",
};

export default function ReferencesPage() {
  return (
    <>
      <PageHero
        title="Reference"
        subtitle="Naše dokončené projekty a realizace"
      />
      <ProjectCards
        title="Naše realizace"
        subtitle="Přehled dokončených projektů"
        projects={projects}
      />
      <Testimonials />
      <CTASection
        title="Chcete vidět více?"
        description="Domluvte si osobní prohlídku našich realizací."
      />
    </>
  );
}
