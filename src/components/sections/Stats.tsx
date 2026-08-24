"use client";
import { Section, Container } from "@/components/ui";
import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  { value: 230, suffix: "+", label: "Dokončených projektů" },
  { value: 500, suffix: "+", label: "Spokojených klientů" },
  { value: 20, suffix: " let", label: "Let na trhu" },
  { value: 15, suffix: "+", label: "Členů týmu" },
];

function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-heading font-bold text-white">
        {count}
        <span className="text-accent-400">{suffix}</span>
      </p>
      <p className="mt-2 text-primary-300 text-sm">{label}</p>
    </div>
  );
}

export default function Stats() {
  return (
    <Section background="dark">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
