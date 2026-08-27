/**
 * Disposition codes — vysledky telefonickeho kontaktu.
 */
export const CALL_OUTCOMES = [
  {
    code: "ZAJEM",
    label: "Zajem",
    description: "Klient ma zajem, posuneme do dalsiho kroku",
    badgeColor: "emerald",
    icon: "✓",
    nextStage: "CONTACTED",
  },
  {
    code: "SCHUZKA",
    label: "Schuzka domluvena",
    description: "Domluvili jsme osobni schuzku — zadej cas",
    badgeColor: "sapphire",
    icon: "📅",
    nextStage: "NEGOTIATION",
    requiresDate: true,
  },
  {
    code: "SMLOUVA",
    label: "Posilam smlouvu",
    description: "Poslu Navrh smlouvy emailem",
    badgeColor: "gold",
    icon: "📄",
    nextStage: "NEGOTIATION",
  },
  {
    code: "CALLBACK",
    label: "Callback",
    description: "Klient chce, at zavolame pozdeji — zadej cas",
    badgeColor: "amber",
    icon: "🔁",
    nextStage: "CONTACTED",
    requiresDate: true,
  },
  {
    code: "SCHUZKA_ZRUSENA",
    label: "Schuzka nekonala",
    description: "Nedorazil / zrusil / no-show — zkusime znovu",
    badgeColor: "amber",
    icon: "🚷",
    nextStage: "CONTACTED",
  },
  {
    code: "NEDOVOLAL",
    label: "Nebere telefon",
    description: "Nezveda / vypnute / hlasovka — zkusime znovu",
    badgeColor: "amber",
    icon: "📵",
  },
  {
    code: "NEZAJEM",
    label: "Vubec nezajem",
    description: "Klient definitivne odmitl",
    badgeColor: "ruby",
    icon: "✗",
  },
  {
    code: "SPATNE_CISLO",
    label: "Spatne cislo",
    description: "Wrong number / neexistuje / mrtva linka",
    badgeColor: "ruby",
    icon: "⊘",
  },
  {
    code: "NEVOLAT",
    label: "Nevolat (DNC)",
    description: "Klient si nepreje dalsi kontakt — prida do Do-Not-Call listu",
    badgeColor: "ruby",
    icon: "🚫",
    setsDnc: true,
  },
] as const;

export type CallOutcomeCode = (typeof CALL_OUTCOMES)[number]["code"];

export function getOutcomeMeta(code: string) {
  return CALL_OUTCOMES.find((o) => o.code === (code as CallOutcomeCode));
}

export const POSITIVE_OUTCOMES = ["ZAJEM", "SCHUZKA", "SMLOUVA", "CALLBACK"] as const;
