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
            <div className="aspect-[21/9] bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 relative">
              {/* Architectural grid pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-[20%] left-[10%] w-[30%] h-[60%] border border-white/30" />
                <div className="absolute top-[15%] left-[45%] w-[20%] h-[70%] border border-white/20" />
                <div className="absolute top-[25%] right-[10%] w-[15%] h-[50%] border border-white/25" />
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
