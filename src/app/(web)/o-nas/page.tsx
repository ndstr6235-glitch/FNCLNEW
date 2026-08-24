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
    "Puskin and Partners — 20+ let ve stavebnictví, od roku 2023 investiční společnost. Development, rekonstrukce a investice v Praze.",
};

const values = [
  { title: "Kvalita", description: "Stavíme s důrazem na detail a prémiové materiály." },
  { title: "Důvěra", description: "Transparentní procesy a férové jednání." },
  { title: "Inovace", description: "Moderní technologie a architektonické trendy." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero title="O nás" subtitle="20+ let ve stavebnictví. Od roku 2023 investiční společnost." />

      {/* Personal intro from owner */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimateIn>
              <p className="text-accent-600 font-medium uppercase tracking-wider text-sm mb-4">
                Slovo zakladatele
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                Vítám vás v&nbsp;Puskin&nbsp;and&nbsp;Partners
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Jmenuji se Lukáš Salamánek a jsem zakladatelem společnosti. Od roku 2004
                stavíme v Praze — začínali jsme rekonstrukcemi bytů na Starém Městě
                a postupně jsme se rozrostli v developerskou firmu s vlastním týmem
                řemeslníků a profesionálů.
              </p>
              <p className="text-neutral-600 leading-relaxed mb-4">
                V roce 2023 jsme přidali nový pilíř: investice do nemovitostí. Dvě dekády
                stavebních zkušeností nám dávají jedinečnou schopnost posoudit rizika
                i příležitosti, které jiné investiční společnosti nemají.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Za 20+ let jsme dokončili přes 230 projektů — od kompletních přestaveb
                historických budov po novostavby rezidenčních vil. Naším cílem je
                poskytovat co nejkomplexnější služby na realitním a developerském trhu.
              </p>
            </AnimateIn>
            <AnimateIn delay={200}>
              <div className="aspect-[4/3] bg-gradient-to-br from-neutral-100 via-primary-100 to-accent-50 rounded-2xl flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 rounded-full bg-primary-200/60 flex items-center justify-center mb-4">
                  <span className="text-primary-500 font-heading font-bold text-2xl">LS</span>
                </div>
                <p className="text-primary-800 font-heading font-bold">Lukáš Salamánek</p>
                <p className="text-neutral-500 text-sm">Zakladatel &amp; jednatel</p>
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
        title="Nezávazná konzultace"
        description="Bez jakýchkoliv závazků Vám poskytneme individuální poradenství a podporu, abychom Vám pomohli realizovat Vaše budoucí plány."
        phone
      />
    </>
  );
}
