import { Section, Container } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import Link from "next/link";

export default function AboutPreview() {
  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimateIn>
            <p className="text-accent-600 font-medium uppercase tracking-wider text-sm mb-4">
              O nás
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-900 mb-6">
              Od staveb k investicím
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Více než 20 let zkušeností ve stavebnictví. Začínali jsme v roce 2004
              rekonstrukcemi na Starém Městě. Dnes řídíme developerské projekty
              a spravujeme nemovitosti v celé Praze.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-8">
              Od roku 2023 fungujeme jako investiční společnost — spojujeme stavební
              know-how s investičními příležitostmi. Za dvě dekády jsme dokončili přes
              230 projektů s vlastním týmem řemeslníků a osvědčenými subdodavateli.
            </p>
            <Link
              href="/o-nas"
              className="text-accent-600 font-medium hover:text-accent-700 transition-colors"
            >
              Zjistěte více o nás &rarr;
            </Link>
          </AnimateIn>
          <AnimateIn delay={200}>
            <div className="aspect-[4/3] bg-gradient-to-br from-neutral-100 via-primary-100 to-accent-50 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 rounded-full bg-primary-200/60 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                  </svg>
                </div>
                <p className="text-primary-500 text-sm font-medium">Kancelář Rybná, Praha 1</p>
              </div>
              {/* Decorative grid lines */}
              <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-primary-200/40" />
              <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-accent-300/40" />
            </div>
          </AnimateIn>
        </div>
      </Container>
    </Section>
  );
}
