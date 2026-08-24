import { Section, Container, Heading } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import Link from "next/link";

export default function FeaturedProject() {
  return (
    <Section background="light">
      <Container>
        <AnimateIn>
          <Heading subtitle="Podívejte se na naši nejnovější realizaci">
            Vybraný projekt
          </Heading>
        </AnimateIn>
        <AnimateIn delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-neutral-200">
            {/* Placeholder image — light */}
            <div className="aspect-[4/3] lg:aspect-auto bg-gradient-to-br from-neutral-100 via-neutral-50 to-accent-50 flex flex-col items-center justify-center p-8">
              <svg className="w-20 h-20 text-primary-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
              </svg>
              <p className="text-neutral-400 text-sm">Fotografie projektu</p>
            </div>
            {/* Content */}
            <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
              <span className="inline-block self-start px-3 py-1 bg-accent-100 text-accent-700 text-sm font-medium rounded-full mb-4">
                Dokončeno
              </span>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-primary-900 mb-2">
                Vila Šestajovice
              </h3>
              <p className="text-accent-600 text-sm font-medium mb-3">Praha-východ</p>
              <p className="text-neutral-600 mb-6">
                Luxusní rodinná vila s 5 pokoji a zahradou. Kompletní realizace od projektu po
                předání klíčů.
              </p>
              <Link
                href="/reference"
                className="inline-flex items-center text-accent-600 font-medium hover:text-accent-700 transition-colors"
              >
                Zobrazit projekt &rarr;
              </Link>
            </div>
          </div>
        </AnimateIn>
      </Container>
    </Section>
  );
}
