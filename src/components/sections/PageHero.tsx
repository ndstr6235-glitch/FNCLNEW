import { Container } from "@/components/ui";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  stat?: string;
}

export default function PageHero({ title, subtitle, stat }: PageHeroProps) {
  return (
    <section className="relative bg-primary-900 py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="absolute inset-0 bg-primary-900/30" />
      </div>
      <Container className="relative z-10 text-center text-white">
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold">{title}</h1>
        {subtitle && <p className="mt-4 text-lg md:text-xl text-primary-200 max-w-2xl mx-auto">{subtitle}</p>}
        {stat && (
          <p className="mt-6 text-accent-400 font-medium text-lg">{stat}</p>
        )}
      </Container>
    </section>
  );
}
