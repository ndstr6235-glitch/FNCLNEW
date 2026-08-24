import { Section, Container, Heading, Card } from "@/components/ui";
import Icon from "@/components/ui/Icon";
import AnimateIn from "@/components/ui/AnimateIn";

const testimonials = [
  {
    text: "Profesionální přístup od první schůzky až po předání klíčů. Naprosto bezproblémová spolupráce.",
    name: "Jana Nováková",
    role: "Klientka — rekonstrukce bytu",
    rating: 5,
  },
  {
    text: "Investice do projektu s Puskin & Partners mi přinesla výnos přes 12%. Doporučuji všem investorům.",
    name: "Martin Dvořák",
    role: "Investor",
    rating: 5,
  },
  {
    text: "Rekonstrukce proběhla přesně podle harmonogramu a rozpočtu. Výsledek předčil naše očekávání.",
    name: "Petr Svoboda",
    role: "Klient — rekonstrukce domu",
    rating: 5,
  },
  {
    text: "Díky týmu Puskin & Partners jsme našli ideální byt v centru Prahy za vynikající cenu.",
    name: "Eva Králová",
    role: "Klientka — nákup nemovitosti",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <Section>
      <Container>
        <AnimateIn>
          <Heading subtitle="Přečtěte si, co o nás říkají naši klienti">
            Co říkají naši klienti
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
