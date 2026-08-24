import { Section, Container, Heading, Card } from "@/components/ui";
import Icon from "@/components/ui/Icon";
import AnimateIn from "@/components/ui/AnimateIn";
import Link from "next/link";

const services = [
  {
    title: "Projekty",
    description: "Development rezidenčních a komerčních nemovitostí v Praze a okolí.",
    href: "/sluzby/development",
    icon: "building" as const,
  },
  {
    title: "Stavba a rekonstrukce",
    description: "Stavba domů a rekonstrukce bytů. Od 9 500 Kč/m² s DPH.",
    href: "/sluzby/rekonstrukce",
    icon: "hammer" as const,
  },
  {
    title: "Reality",
    description: "Prodej, výkup a aktivní vyhledávání nemovitostí.",
    href: "/sluzby/nemovitosti",
    icon: "key" as const,
  },
  {
    title: "Investice",
    description: "Zhodnocení až 15 % p.a. Dva investiční modely od 500 000 Kč.",
    href: "/sluzby/investice",
    icon: "chart" as const,
  },
];

export default function Services() {
  return (
    <Section background="light">
      <Container>
        <AnimateIn>
          <Heading subtitle="Jsme spolehlivým partnerem s více než 20 lety zkušeností. Poskytujeme nejkomplexnější služby na realitním a developerském trhu.">
            Služby
          </Heading>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <AnimateIn key={service.title} delay={i * 100}>
              <Card hover>
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon name={service.icon} className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">{service.title}</h3>
                <p className="text-neutral-500 mb-4">{service.description}</p>
                <Link
                  href={service.href}
                  className="text-accent-600 font-medium hover:text-accent-700 transition-colors"
                >
                  Více informací &rarr;
                </Link>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
