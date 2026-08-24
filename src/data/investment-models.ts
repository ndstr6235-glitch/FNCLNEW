export const investmentModels = [
  {
    title: "Investiční apartmány",
    minInvestment: "od 490 000 Kč",
    avgReturn: "10–15 % p.a.",
    description: "Podíly v investičních apartmánech v Praze. Diverzifikace rizika a celoroční příjem z krátkodobých pronájmů.",
    features: [
      "Vlastní apartmán již od 490 000 Kč",
      "Celoroční příjem z pronájmů",
      "Profesionální správa nemovitostí",
      "Diverzifikace do více nemovitostí",
    ],
  },
  {
    title: "Developerské projekty",
    minInvestment: "od 5 000 000 Kč",
    avgReturn: "20–30 % p.a.",
    description: "Účast na developerských projektech s vysokým potenciálem zhodnocení. Kompletní servis od návrhu po realizaci.",
    features: [
      "Vysoký potenciál zhodnocení",
      "Účast na prémiových projektech v Praze",
      "Kompletní projektový management",
      "Transparentní reporting",
    ],
  },
] as const;

export const investmentProcess = [
  { step: 1, title: "Nezávazná konzultace", description: "Probereme vaše investiční cíle a možnosti." },
  { step: 2, title: "Výběr modelu", description: "Zvolíme investiční model odpovídající vašim představám." },
  { step: 3, title: "Podpis smlouvy", description: "Právní zajištění a formalizace investice." },
  { step: 4, title: "Realizace a výnosy", description: "Sledování investice a pravidelné vyplácení výnosů." },
] as const;

export const investmentAdvantages = [
  { title: "Vysoké výnosy", description: "Průměrné zhodnocení 10–30% ročně podle zvoleného modelu." },
  { title: "Profesionální správa", description: "O vše se postaráme — vy jen sledujete výnosy." },
  { title: "Diverzifikace", description: "Rozložení rizika do více nemovitostí a projektů." },
  { title: "Transparentnost", description: "Pravidelný reporting a kompletní přehled o stavu investice." },
] as const;
