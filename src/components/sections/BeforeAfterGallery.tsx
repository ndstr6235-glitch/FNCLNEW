"use client";
import { useState } from "react";
import { Section, Container, Heading } from "@/components/ui";

const galleryItems = [
  { title: "Byt Biskoupová", location: "Praha" },
  { title: "Byt Služská", location: "Praha" },
  { title: "Byt Běchovice", location: "Praha-východ" },
];

export default function BeforeAfterGallery() {
  const [activeStates, setActiveStates] = useState<boolean[]>(galleryItems.map(() => false));

  const toggle = (index: number) => {
    setActiveStates((prev) => prev.map((state, i) => (i === index ? !state : state)));
  };

  return (
    <Section background="light">
      <Container>
        <Heading subtitle="Podívejte se na proměny našich projektů">
          Před a po
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {galleryItems.map((item, i) => (
            <div key={item.title} className="relative">
              <div className="aspect-[4/3] rounded-xl overflow-hidden relative">
                <div
                  className={`absolute inset-0 transition-opacity duration-500 flex items-center justify-center text-lg font-medium ${
                    activeStates[i]
                      ? "bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700"
                      : "bg-gradient-to-br from-neutral-300 to-neutral-400 text-neutral-700"
                  }`}
                >
                  {activeStates[i] ? "Po rekonstrukci" : "Před rekonstrukcí"}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-heading font-bold text-primary-900">{item.title}</p>
                  <p className="text-sm text-neutral-500">{item.location}</p>
                </div>
                <button
                  onClick={() => toggle(i)}
                  className="px-4 py-2 text-sm font-medium bg-primary-800 text-white rounded-md hover:bg-primary-900 transition-colors"
                >
                  {activeStates[i] ? "Před" : "Po"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
