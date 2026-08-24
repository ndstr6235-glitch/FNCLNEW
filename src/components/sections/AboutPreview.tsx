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
              O naší společnosti
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-900 mb-6">
              Více než 20 let na trhu
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Puskin and Partners je přední česká společnost specializující se na development,
              rekonstrukce a realitní služby. Od roku 2004 pomáháme našim klientům realizovat
              jejich vize a budovat hodnoty, které přetrvávají generace.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-8">
              Naším cílem je spojit moderní přístup s tradiční řemeslnou kvalitou. Každý projekt
              bereme jako příležitost vytvořit něco výjimečného — ať už jde o kompletní
              rekonstrukci historické budovy nebo development nového rezidenčního projektu.
            </p>
            <Link
              href="/o-nas"
              className="text-accent-600 font-medium hover:text-accent-700 transition-colors"
            >
              Zjistěte více o nás &rarr;
            </Link>
          </AnimateIn>
          <AnimateIn delay={200}>
            <div className="aspect-[4/3] bg-gradient-to-br from-primary-200 to-primary-300 rounded-2xl flex items-center justify-center">
              <p className="text-primary-600 font-medium">Fotografie týmu</p>
            </div>
          </AnimateIn>
        </div>
      </Container>
    </Section>
  );
}
