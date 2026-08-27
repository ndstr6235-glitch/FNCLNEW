export const benefits = [
  { title: "Provizní systém", description: "Neomezené provize z uzavřených obchodů" },
  { title: "Flexibilní místo práce", description: "Kancelář Rybná 716/24 nebo home office" },
  { title: "Služební telefon", description: "iPhone a firemní tarif" },
  { title: "Zaškolení a mentoring", description: "Kompletní onboarding od seniorních kolegů" },
  { title: "Služební automobil", description: "Pro seniorní pozice a makléře" },
  { title: "Firemní akce", description: "Teambuildingy a klientské eventy" },
] as const;

export const positions = [
  {
    title: "Investiční poradce",
    location: "Praha 1",
    type: "Plný úvazek",
    contract: "IČO / HPP",
    description:
      "Akvizice a poradenství investorům v oblasti nemovitostních investic. Hledáme člověka se zkušenostmi z finančního nebo realitního sektoru a vlastní sítí kontaktů.",
  },
  {
    title: "Obchodní zástupce — reality",
    location: "Praha",
    type: "Plný úvazek",
    contract: "IČO",
    description:
      "Prodej a zprostředkování nemovitostí v Praze. Zajistíme kompletní zázemí, marketingovou podporu a přísun klientů. Vhodné i pro začínající makléře s obchodním talentem.",
  },
  {
    title: "Asistent/ka kanceláře",
    location: "Praha 1 — Rybná",
    type: "Plný úvazek",
    contract: "HPP",
    description:
      "Administrativní podpora vedení firmy, organizace schůzek, správa dokumentů a komunikace s klienty. Požadujeme AJ na komunikativní úrovni a znalost MS Office.",
  },
] as const;

export const hiringProcess = [
  { step: 1, title: "Online přihláška", description: "Zašlete nám životopis na info@apartmentspushkin.com." },
  { step: 2, title: "Osobní setkání", description: "Pozveme vás na schůzku s vedením v kanceláři na Rybné." },
  { step: 3, title: "Nabídka", description: "Do týdne obdržíte konkrétní nabídku a podmínky spolupráce." },
  { step: 4, title: "Onboarding", description: "Zaškolení a zapojení do projektů od prvního dne." },
] as const;
