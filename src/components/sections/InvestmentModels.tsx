import { Section, Container, Heading, Card } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import Link from "next/link";

interface InvestmentModel {
  title: string;
  minInvestment: string;
  avgReturn: string;
  description: string;
  features: readonly string[];
}

interface InvestmentModelsProps {
  models: readonly InvestmentModel[];
}

export default function InvestmentModels({ models }: InvestmentModelsProps) {
  return (
    <Section>
      <Container>
        <AnimateIn>
          <Heading subtitle="Vyberte si investiční model, který vám vyhovuje">
            Investiční modely
          </Heading>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {models.map((model, i) => (
            <AnimateIn key={model.title} delay={i * 150}>
              <Card className="h-full border-2 border-neutral-100 hover:border-accent-300 transition-colors">
                <div className="mb-6">
                  <h3 className="font-heading text-2xl font-bold text-primary-900 mb-2">
                    {model.title}
                  </h3>
                  <p className="text-neutral-600">{model.description}</p>
                </div>
                <div className="flex gap-6 mb-6">
                  <div>
                    <p className="text-sm text-neutral-500">Minimální investice</p>
                    <p className="text-lg font-bold text-primary-900">{model.minInvestment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Průměrný výnos</p>
                    <p className="text-lg font-bold text-accent-600">{model.avgReturn}</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {model.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-neutral-600">
                      <svg className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center text-accent-600 font-medium hover:text-accent-700 transition-colors"
                >
                  Zjistit více &rarr;
                </Link>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
