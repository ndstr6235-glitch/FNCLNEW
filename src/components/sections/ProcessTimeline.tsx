import { Section, Container, Heading } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";

interface Step {
  step: number;
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  title?: string;
  subtitle?: string;
  steps: readonly Step[];
  background?: "white" | "light";
}

export default function ProcessTimeline({
  title,
  subtitle,
  steps,
  background = "white",
}: ProcessTimelineProps) {
  return (
    <Section background={background}>
      <Container>
        {title && (
          <AnimateIn>
            <Heading subtitle={subtitle}>{title}</Heading>
          </AnimateIn>
        )}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary-200 hidden md:block" />
          <div className="space-y-8">
            {steps.map((s, i) => (
              <AnimateIn key={s.step} delay={i * 100}>
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-800 text-white flex items-center justify-center font-heading font-bold text-lg relative z-10">
                    {s.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-heading text-xl font-bold text-primary-900">{s.title}</h3>
                    <p className="text-neutral-600 mt-1">{s.description}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
