import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import RenovationProcess from "@/components/sections/RenovationProcess";
import BeforeAfterGallery from "@/components/sections/BeforeAfterGallery";
import ProjectCards from "@/components/sections/ProjectCards";
import FAQ from "@/components/sections/FAQ";
import Testimonials from "@/components/sections/Testimonials";
import CTASection from "@/components/sections/CTASection";
import { renovationSteps } from "@/data/renovation-steps";
import { renovationFaq } from "@/data/faq";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Rekonstrukce",
  description:
    "Kompletní rekonstrukce bytů a domů na klíč v Praze. 9-krokový proces od schůzky po předání.",
};

const renovationProjects = projects.filter((p) => p.type === "Rekonstrukce bytu");

export default function ReconstructionPage() {
  return (
    <>
      <PageHero
        title="Rekonstrukce"
        subtitle="Kompletní stavby na klíč — od prvního setkání po předání klíčů"
        stat="230+ dokončených realizací"
      />
      <RenovationProcess steps={renovationSteps} />
      <BeforeAfterGallery />
      <ProjectCards
        title="Dokončené realizace"
        subtitle="Vybrané rekonstrukce našich klientů"
        projects={renovationProjects}
        background="light"
      />
      <FAQ items={renovationFaq} />
      <Testimonials />
      <CTASection
        title="Plánujete rekonstrukci?"
        description="Kontaktujte nás pro nezávaznou konzultaci a cenovou nabídku."
        phone
      />
    </>
  );
}
