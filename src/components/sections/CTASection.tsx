import { Section, Container } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import Link from "next/link";

interface CTASectionProps {
  title: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  phone?: boolean;
}

export default function CTASection({
  title,
  description,
  primaryLabel = "Kontaktujte nás",
  primaryHref = "/kontakt",
  secondaryLabel,
  secondaryHref,
  phone = false,
}: CTASectionProps) {
  return (
    <Section background="light">
      <Container size="md">
        <AnimateIn>
          <div className="text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-900 mb-4">
              {title}
            </h2>
            {description && <p className="text-neutral-600 max-w-xl mx-auto mb-8">{description}</p>}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-800 text-white font-medium rounded-md hover:bg-primary-900 transition-colors"
              >
                {primaryLabel}
              </Link>
              {secondaryLabel && secondaryHref && (
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-800 text-primary-800 font-medium rounded-md hover:bg-primary-800 hover:text-white transition-colors"
                >
                  {secondaryLabel}
                </Link>
              )}
            </div>
            {phone && (
              <p className="mt-6 text-neutral-500">
                Nebo zavolejte:{" "}
                <a href="tel:+420222244889" className="text-primary-800 font-medium hover:text-primary-900">
                  +420 222 244 889
                </a>
              </p>
            )}
          </div>
        </AnimateIn>
      </Container>
    </Section>
  );
}
