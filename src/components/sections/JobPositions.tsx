"use client";
import { useState } from "react";
import { Section, Container, Heading } from "@/components/ui";

interface Position {
  title: string;
  location: string;
  type: string;
  contract: string;
  description: string;
}

interface JobPositionsProps {
  positions: readonly Position[];
}

export default function JobPositions({ positions }: JobPositionsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section background="light">
      <Container size="md">
        <Heading subtitle="Aktuální pracovní nabídky">Otevřené pozice</Heading>
        <div className="space-y-4">
          {positions.map((position, i) => (
            <div key={position.title} className="bg-white rounded-xl shadow-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between"
              >
                <div>
                  <h3 className="font-heading text-lg font-bold text-primary-900">
                    {position.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    {position.location} &middot; {position.type} &middot; {position.contract}
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-40 pb-5" : "max-h-0"
                }`}
              >
                <div className="px-6">
                  <p className="text-neutral-600 text-sm mb-4">{position.description}</p>
                  <a
                    href="mailto:info@apartmentspushkin.com?subject=Životopis — pozice"
                    className="inline-flex items-center px-5 py-2.5 bg-accent-500 text-white text-sm font-medium rounded-md hover:bg-accent-600 transition-colors"
                  >
                    Odeslat životopis
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
