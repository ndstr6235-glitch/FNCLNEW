import { Section, Container, Heading, Card } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";

interface Project {
  title: string;
  location: string;
  type: string;
  status?: string;
  description?: string;
  units?: string;
}

interface ProjectCardsProps {
  title?: string;
  subtitle?: string;
  projects: readonly Project[];
  background?: "white" | "light";
}

export default function ProjectCards({
  title,
  subtitle,
  projects,
  background = "white",
}: ProjectCardsProps) {
  return (
    <Section background={background}>
      <Container>
        {title && (
          <AnimateIn>
            <Heading subtitle={subtitle}>{title}</Heading>
          </AnimateIn>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <AnimateIn key={project.title} delay={i * 100}>
              <Card hover className="h-full">
                {/* Placeholder image */}
                <div className="aspect-[16/10] bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg mb-4 relative overflow-hidden">
                  {project.status && (
                    <span className="absolute top-3 right-3 px-3 py-1 bg-accent-500 text-white text-xs font-medium rounded-full">
                      {project.status}
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-lg font-bold text-primary-900">{project.title}</h3>
                <p className="text-sm text-neutral-500 mt-1">{project.location} &middot; {project.type}</p>
                {project.description && (
                  <p className="text-neutral-600 text-sm mt-2">{project.description}</p>
                )}
                {project.units && (
                  <p className="text-accent-600 text-sm font-medium mt-2">{project.units}</p>
                )}
              </Card>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
