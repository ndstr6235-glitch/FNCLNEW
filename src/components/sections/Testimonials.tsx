import { Section, Container, Heading, Card } from "@/components/ui";
import Icon from "@/components/ui/Icon";
import AnimateIn from "@/components/ui/AnimateIn";

import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <Section>
      <Container>
        <AnimateIn>
          <Heading subtitle="Konkrétní zkušenosti našich klientů">
            Reference
          </Heading>
        </AnimateIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, i) => (
            <AnimateIn key={testimonial.name} delay={i * 100}>
              <Card className="h-full flex flex-col">
                <Icon name="quote" className="w-8 h-8 text-accent-300 mb-4" />
                <p className="text-neutral-600 leading-relaxed flex-1 mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Icon key={j} name="star" className="w-4 h-4 text-accent-400" />
                    ))}
                  </div>
                  <p className="font-medium text-primary-900">{testimonial.name}</p>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
