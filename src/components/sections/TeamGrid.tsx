import { Section, Container, Heading } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";

interface TeamMember {
  name: string;
  role: string;
}

interface TeamGridProps {
  team: readonly TeamMember[];
}

export default function TeamGrid({ team }: TeamGridProps) {
  return (
    <Section>
      <Container>
        <AnimateIn>
          <Heading subtitle="Seznamte se s lidmi, kteří stojí za našimi projekty">
            Náš tým
          </Heading>
        </AnimateIn>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <AnimateIn key={member.name} delay={i * 80}>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-200 to-primary-300 mb-4" />
                <h3 className="font-heading font-bold text-primary-900">{member.name}</h3>
                <p className="text-sm text-neutral-500 mt-1">{member.role}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
