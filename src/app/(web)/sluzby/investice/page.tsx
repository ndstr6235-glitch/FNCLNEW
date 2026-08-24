import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import InvestmentModels from "@/components/sections/InvestmentModels";
import ProcessTimeline from "@/components/sections/ProcessTimeline";
import DifferentiatorsGrid from "@/components/sections/DifferentiatorsGrid";
import CTASection from "@/components/sections/CTASection";
import { investmentModels, investmentProcess, investmentAdvantages } from "@/data/investment-models";

export const metadata: Metadata = {
  title: "Investice",
  description:
    "Investice do nemovitostí v Praze — krátkodobé pronájmy od 500 000 Kč, developerské projekty od 5 000 000 Kč.",
};

export default function InvestmentsPage() {
  return (
    <>
      <PageHero
        title="Investice do nemovitostí"
        subtitle="Od roku 2023 spojujeme 20 let stavebních zkušeností s investičními příležitostmi"
      />
      <InvestmentModels models={investmentModels} />
      <ProcessTimeline
        title="Jak to funguje"
        subtitle="4 jednoduché kroky k vaší investici"
        steps={investmentProcess}
        background="light"
      />
      <DifferentiatorsGrid
        title="Výhody investice"
        subtitle="Proč investovat s Puskin and Partners"
        items={investmentAdvantages}
        columns={4}
      />
      <CTASection
        title="Zajímá vás investice?"
        description="Kontaktujte nás pro nezávaznou konzultaci."
        phone
      />
    </>
  );
}
