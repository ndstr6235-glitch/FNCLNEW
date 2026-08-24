import { Section, Container, Heading } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";

interface RenovationStep {
  step: number;
  title: string;
  description: string;
}

interface RenovationProcessProps {
  steps: readonly RenovationStep[];
}

export default function RenovationProcess({ steps }: RenovationProcessProps) {
  return (
    <Section>
      <Container>
        <AnimateIn>
          <Heading subtitle="Od první schůzky po předání klíčů">
            Jak probíhá rekonstrukce
          </Heading>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <AnimateIn key={s.step} delay={i * 60}>
              <div className="relative p-6 bg-white rounded-xl shadow-card">
                <span className="absolute -top-3 -left-1 text-5xl font-heading font-bold text-primary-100">
                  {String(s.step).padStart(2, "0")}
                </span>
                <div className="relative pt-4">
                  <h3 className="font-heading text-lg font-bold text-primary-900 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-neutral-500 text-sm">{s.description}</p>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
