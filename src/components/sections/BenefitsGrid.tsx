import { Section, Container, Heading, Card } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";

interface Benefit {
  title: string;
  description: string;
}

interface BenefitsGridProps {
  benefits: readonly Benefit[];
}

export default function BenefitsGrid({ benefits }: BenefitsGridProps) {
  return (
    <Section>
      <Container>
        <AnimateIn>
          <Heading subtitle="Co vám nabízíme">Proč u nás pracovat</Heading>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <AnimateIn key={benefit.title} delay={i * 80}>
              <Card className="h-full text-center">
                <div className="w-12 h-12 mx-auto bg-accent-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-4 h-4 bg-accent-500 rounded-full" />
                </div>
                <h3 className="font-heading text-lg font-bold text-primary-900 mb-1">
                  {benefit.title}
                </h3>
                <p className="text-neutral-500 text-sm">{benefit.description}</p>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
