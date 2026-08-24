import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import DifferentiatorsGrid from "@/components/sections/DifferentiatorsGrid";
import CTASection from "@/components/sections/CTASection";
import { Section, Container, Heading, Card } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import { realEstateServices, realEstateDifferentiators } from "@/data/services";

export const metadata: Metadata = {
  title: "Nemovitosti",
  description:
    "Realitní služby v Praze — prodej, nákup a správa nemovitostí. Osobní přístup a profesionální servis.",
};

export default function RealEstatePage() {
  return (
    <>
      <PageHero
        title="Nemovitosti"
        subtitle="Profesionální realitní služby v Praze a okolí"
      />

      <Section>
        <Container>
          <AnimateIn>
            <Heading subtitle="Kompletní realitní servis">Naše služby</Heading>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {realEstateServices.map((service, i) => (
              <AnimateIn key={service.title} delay={i * 100}>
                <Card hover className="h-full">
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-4 h-4 bg-accent-500 rounded-full" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-primary-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-neutral-500">{service.description}</p>
                </Card>
              </AnimateIn>
            ))}
          </div>
        </Container>
      </Section>

      <DifferentiatorsGrid
        title="Proč si vybrat nás"
        subtitle="Co nás odlišuje od ostatních"
        items={realEstateDifferentiators}
        columns={4}
        background="light"
      />

      <CTASection
        title="Hledáte nemovitost nebo chcete prodat?"
        primaryLabel="Chci koupit"
        secondaryLabel="Chci prodat"
        secondaryHref="/kontakt"
        phone
      />
    </>
  );
}
