import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import BenefitsGrid from "@/components/sections/BenefitsGrid";
import JobPositions from "@/components/sections/JobPositions";
import ProcessTimeline from "@/components/sections/ProcessTimeline";
import CTASection from "@/components/sections/CTASection";
import { benefits, positions, hiringProcess } from "@/data/jobs";

export const metadata: Metadata = {
  title: "Kariéra",
  description: "Pracovní příležitosti v Puskin and Partners — připojte se k našemu týmu.",
};

export default function CareerPage() {
  return (
    <>
      <PageHero
        title="Kariéra"
        subtitle="Připojte se k našemu týmu profesionálů"
      />
      <BenefitsGrid benefits={benefits} />
      <JobPositions positions={positions} />
      <ProcessTimeline
        title="Náborový proces"
        subtitle="Jak probíhá přijetí do týmu"
        steps={hiringProcess}
      />
      <CTASection
        title="Máte zájem?"
        description="Napište nám na info@apartmentspushkin.com nebo se přihlaste přímo na vybranou pozici."
        primaryLabel="Napište nám"
        primaryHref="mailto:info@apartmentspushkin.com"
      />
    </>
  );
}
