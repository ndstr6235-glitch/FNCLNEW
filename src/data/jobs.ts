export const benefits = [
  { title: "Nástupní bonus", description: "Až 300 000 Kč" },
  { title: "Flexibilní místo práce", description: "Kancelář nebo home office" },
  { title: "Apple technika", description: "MacBook a iPhone" },
  { title: "Multisport karta", description: "Přístup do sportovních center" },
  { title: "Služební automobil", description: "Pro seniorní pozice" },
  { title: "Teambuildingy", description: "Pravidelné firemní akce" },
] as const;

export const positions = [
  {
    title: "Obchodník investice",
    location: "Praha",
    type: "Plný úvazek",
    contract: "IČO",
    description: "Prodej investičních příležitostí v nemovitostech. Hledáme zkušeného obchodníka s kontakty na investory.",
  },
  {
    title: "Realitní makléř",
    location: "Praha",
    type: "Plný úvazek",
    contract: "IČO",
    description: "Prodej rezidenčních nemovitostí od 500 000 Kč. Zajistíme vám kompletní zázemí a marketingovou podporu.",
  },
] as const;

export const hiringProcess = [
  { step: 1, title: "Online přihláška", description: "Zašlete nám svůj životopis a motivační dopis." },
  { step: 2, title: "Osobní pohovor", description: "Pozveme vás na setkání s vedením firmy." },
  { step: 3, title: "Přijetí do týmu", description: "Nabídka pozice a dohodnutí podmínek." },
  { step: 4, title: "Onboarding", description: "Začátek práce s kompletním zaškolením." },
] as const;
