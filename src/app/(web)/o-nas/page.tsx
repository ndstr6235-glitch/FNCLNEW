import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import { Section, Container, Heading, Card } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import TeamGrid from "@/components/sections/TeamGrid";
import CTASection from "@/components/sections/CTASection";
import { team } from "@/data/team";

export const metadata: Metadata = {
  title: "O nás",
  description:
    "Puskin and Partners — stabilní stavebně-developerská společnost s více než 20 lety zkušeností v Praze.",
};

const values = [
  { title: "Kvalita", description: "Stavíme s důrazem na detail a prémiové materiály." },
  { title: "Důvěra", description: "Transparentní procesy a férové jednání." },
  { title: "Inovace", description: "Moderní technologie a architektonické trendy." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero title="O nás" subtitle="Stavíme důvěru, vytváříme hodnoty" />

      {/* Company story */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimateIn>
              <p className="text-accent-600 font-medium uppercase tracking-wider text-sm mb-4">
                Naše cesta
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                Více než 20 let na trhu
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Společnost Alexandr Puškin, s.r.o. působí na českém trhu od roku 2004. Za více než
                dvě dekády jsme se vyvinuli v přední stavebně-developerskou firmu specializující se
                na prémiové projekty v Praze a okolí.
              </p>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Naším posláním je spojit tradiční řemeslnou kvalitu s moderními architektonickými
                trendy. Každý projekt přistupujeme s maximální péčí a důrazem na detail — ať už jde
                o kompletní rekonstrukci historické budovy nebo development nového rezidenčního
                projektu.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Pod vedením Lukáše Salamánka a jeho zkušeného týmu realizujeme projekty, které
                přetrvávají generace. Naši klienti oceňují především transparentní přístup,
                dodržování termínů a výjimečnou kvalitu zpracování.
              </p>
            </AnimateIn>
            <AnimateIn delay={200}>
              <div className="aspect-[4/3] bg-gradient-to-br from-primary-200 to-primary-300 rounded-2xl flex items-center justify-center">
                <p className="text-primary-600 font-medium">Fotografie kanceláře</p>
              </div>
            </AnimateIn>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section background="light">
        <Container>
          <AnimateIn>
            <Heading subtitle="Na čem stavíme naši práci">Naše hodnoty</Heading>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <AnimateIn key={value.title} delay={i * 100}>
                <Card className="h-full text-center">
                  <div className="w-14 h-14 mx-auto bg-accent-100 rounded-full flex items-center justify-center mb-4">
                    <div className="w-5 h-5 bg-accent-500 rounded-full" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-primary-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-neutral-500">{value.description}</p>
                </Card>
              </AnimateIn>
            ))}
          </div>
        </Container>
      </Section>

      <TeamGrid team={team} />

      <CTASection
        title="Chcete se s námi spojit?"
        description="Rádi vám odpovíme na jakékoliv dotazy."
      />
    </>
  );
}
