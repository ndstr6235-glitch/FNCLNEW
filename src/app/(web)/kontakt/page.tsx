import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import ContactForm from "@/components/sections/ContactForm";
import MapEmbed from "@/components/sections/MapEmbed";
import { Section, Container } from "@/components/ui";
import AnimateIn from "@/components/ui/AnimateIn";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktujte Puskin and Partners — Rybná 716/24, Praha 1. Tel: +420 222 244 889.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero title="Kontakt" subtitle="Spojte se s námi" />

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <AnimateIn>
              <div>
                <h2 className="font-heading text-2xl font-bold text-primary-900 mb-6">
                  Kontaktní údaje
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-accent-600 uppercase tracking-wider mb-2">
                      Adresa
                    </h3>
                    <p className="text-neutral-700">
                      {siteConfig.company.address.street}
                      <br />
                      {siteConfig.company.address.zip} {siteConfig.company.address.city}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-accent-600 uppercase tracking-wider mb-2">
                      E-mail
                    </h3>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="text-primary-800 hover:text-primary-900 transition-colors"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-accent-600 uppercase tracking-wider mb-2">
                      Telefon
                    </h3>
                    <a
                      href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                      className="text-primary-800 hover:text-primary-900 transition-colors"
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-accent-600 uppercase tracking-wider mb-2">
                      Otevírací hodiny
                    </h3>
                    <p className="text-neutral-700">{siteConfig.contact.hours}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-accent-600 uppercase tracking-wider mb-2">
                      Fakturační údaje
                    </h3>
                    <p className="text-neutral-700">
                      {siteConfig.company.legalName}
                      <br />
                      IČO: {siteConfig.company.ico}
                      <br />
                      DIČ: {siteConfig.company.dic}
                    </p>
                  </div>
                </div>
              </div>
            </AnimateIn>

            {/* Contact form */}
            <AnimateIn delay={200}>
              <div>
                <h2 className="font-heading text-2xl font-bold text-primary-900 mb-6">
                  Napište nám
                </h2>
                <ContactForm />
              </div>
            </AnimateIn>
          </div>
        </Container>
      </Section>

      <MapEmbed />

      <Section background="light">
        <Container size="md">
          <AnimateIn>
            <div className="text-center">
              <h2 className="font-heading text-2xl font-bold text-primary-900 mb-4">
                Preferujete osobní setkání?
              </h2>
              <p className="text-neutral-600 mb-4">Zavolejte nám a domluvíme schůzku.</p>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="text-2xl font-heading font-bold text-primary-800 hover:text-primary-900 transition-colors"
              >
                {siteConfig.contact.phone}
              </a>
            </div>
          </AnimateIn>
        </Container>
      </Section>
    </>
  );
}
