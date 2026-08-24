import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import Stats from "@/components/sections/Stats";
import DifferentiatorsGrid from "@/components/sections/DifferentiatorsGrid";
import ProjectCards from "@/components/sections/ProjectCards";
import ProcessTimeline from "@/components/sections/ProcessTimeline";
import CTASection from "@/components/sections/CTASection";
import { developmentDifferentiators, developmentProcess } from "@/data/services";
import { featuredDevelopmentProjects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Development",
  description:
    "Komplexní developerské projekty v Praze — od návrhu po realizaci. 230+ dokončených projektů.",
};

export default function DevelopmentPage() {
  return (
    <>
      <PageHero
        title="Development"
        subtitle="Komplexní developerské projekty s důrazem na kvalitu, spolehlivost a preciznost"
      />
      <Stats />
      <DifferentiatorsGrid
        title="Proč stavět s námi"
        subtitle="Klíčové výhody spolupráce s Puskin and Partners"
        items={developmentDifferentiators}
        background="light"
      />
      <ProjectCards
        title="Naše projekty"
        subtitle="Vybrané developerské projekty"
        projects={featuredDevelopmentProjects}
      />
      <ProcessTimeline
        title="Proces výstavby"
        subtitle="4 fáze od návrhu po realizaci"
        steps={developmentProcess}
        background="light"
      />
      <CTASection
        title="Plánujete výstavbu?"
        description="Kontaktujte nás pro nezávaznou konzultaci."
        phone
      />
    </>
  );
}
