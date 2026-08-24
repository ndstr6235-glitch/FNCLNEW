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
          <div className="relative rounded-2xl overflow-hidden group">
            {/* Placeholder image */}
            <div className="aspect-[21/9] bg-gradient-to-br from-primary-200 via-primary-300 to-accent-200 flex items-center justify-center">
              <div className="text-primary-500 text-center">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <span className="text-sm font-medium opacity-40">Obrázek projektu</span>
              </div>
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/30 to-transparent" />
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <span className="inline-block px-3 py-1 bg-accent-500 text-white text-sm font-medium rounded-full mb-4">
                Dokončeno
              </span>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                Vila Šestajovice
              </h3>
              <p className="text-primary-200 mb-1">Praha-východ</p>
              <p className="text-primary-300 max-w-xl mb-6">
                Luxusní rodinná vila s 5 pokoji a zahradou. Kompletní realizace od projektu po
                předání klíčů.
              </p>
              <Link
                href="/reference"
                className="inline-flex items-center text-accent-400 font-medium hover:text-accent-300 transition-colors"
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
