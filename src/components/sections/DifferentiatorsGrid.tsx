import { Section, Container, Heading, Card } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";

interface Differentiator {
  title: string;
  description: string;
}

interface DifferentiatorsGridProps {
  title?: string;
  subtitle?: string;
  items: readonly Differentiator[];
  columns?: 3 | 4;
  background?: "white" | "light";
}

export default function DifferentiatorsGrid({
  title,
  subtitle,
  items,
  columns = 3,
  background = "white",
}: DifferentiatorsGridProps) {
  return (
    <Section background={background}>
      <Container>
        {title && (
          <AnimateIn>
            <Heading subtitle={subtitle}>{title}</Heading>
          </AnimateIn>
        )}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
            columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {items.map((item, i) => (
            <AnimateIn key={item.title} delay={i * 80}>
              <Card className="h-full">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mb-3">
                  <div className="w-3 h-3 bg-accent-500 rounded-full" />
                </div>
                <h3 className="font-heading text-lg font-bold text-primary-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-500 text-sm">{item.description}</p>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
