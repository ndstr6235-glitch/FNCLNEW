import type { Role, EmailTemplate, EventType, ClientStage, ClientScore } from "./types";

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
export const COLORS = {
  // Backgrounds
  bg: "#f0f2f7",
  sidebar: "#0f1117",
  surface: "#ffffff",
  surfaceHover: "#f8f9fc",

  // Borders
  border: "#e4e8f0",
  borderDark: "#d0d6e4",

  // Brand accents
  gold: "#b8912a",
  goldLight: "#f5c842",
  goldPale: "#fef9ec",
  goldBorder: "#f0d97a",

  // Semantic
  emerald: "#1a9e6a",
  emeraldPale: "#edfaf4",
  emeraldBorder: "#a3e6c9",

  ruby: "#d94040",
  rubyPale: "#fdf0f0",
  rubyBorder: "#f5b8b8",

  sapphire: "#2d6be4",
  sapphirePale: "#eef3fd",
  sapphireBorder: "#b3cdf9",

  amber: "#d97a1a",
  amberPale: "#fef5ec",

  // Text
  text: "#0f1117",
  textMid: "#4a5578",
  textDim: "#8892aa",
  textFaint: "#c0c8d8",
} as const;

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------
export const EVENT_TYPES: Record<
  EventType,
  { label: string; color: string; pale: string; icon: string }
> = {
  call: { label: "Hovor", color: "#2d6be4", pale: "#eef3fd", icon: "📞" },
  payment: { label: "Platba", color: "#1a9e6a", pale: "#edfaf4", icon: "💰" },
  reminder: { label: "Pripominka", color: "#d97a1a", pale: "#fef5ec", icon: "🔔" },
  interest: { label: "Urok", color: "#b8912a", pale: "#fef9ec", icon: "📈" },
  meeting: { label: "Schuzka", color: "#d94040", pale: "#fdf0f0", icon: "🤝" },
};

// ---------------------------------------------------------------------------
// Role metadata
// ---------------------------------------------------------------------------
export const ROLE_META: Record<
  Role,
  { label: string; color: string; icon: string }
> = {
  administrator: { label: "Administrator", color: "#d94040", icon: "🛡️" },
  supervisor: { label: "Supervizor", color: "#b8912a", icon: "👁️" },
  broker: { label: "Broker", color: "#2d6be4", icon: "💼" },
};

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------
export interface NavItem {
  key: string;
  label: string;
  roles: Role[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "HLAVNI",
    items: [
      { key: "dashboard", label: "Dashboard", roles: ["administrator", "supervisor", "broker"] },
      { key: "calling", label: "Vyvolavani", roles: ["broker"] },
      { key: "clients", label: "Klienti", roles: ["administrator", "supervisor", "broker"] },
      { key: "database", label: "Databaze", roles: ["administrator", "supervisor"] },
      { key: "calendar", label: "Kalendar", roles: ["administrator", "supervisor", "broker"] },
    ],
  },
  {
    title: "KOMUNIKACE",
    items: [
      { key: "emails", label: "Emaily", roles: ["administrator", "supervisor", "broker"] },
      { key: "tickets", label: "Pozadavky", roles: ["administrator", "supervisor", "broker"] },
      { key: "documents", label: "Dokumenty", roles: ["administrator", "supervisor"] },
    ],
  },
  {
    title: "ADMINISTRACE",
    items: [
      { key: "users", label: "Uzivatele", roles: ["administrator", "supervisor"] },
      { key: "templates", label: "Sablony emailu", roles: ["administrator"] },
      { key: "settings", label: "Nastaveni", roles: ["administrator"] },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

// ---------------------------------------------------------------------------
// Pipeline stages
// ---------------------------------------------------------------------------
export const PIPELINE_STAGES: {
  key: ClientStage;
  label: string;
  color: string;
  pale: string;
}[] = [
  { key: "NEW", label: "Novy", color: "#8892aa", pale: "#f0f2f7" },
  { key: "CONTACTED", label: "Kontaktovan", color: "#2d6be4", pale: "#eef3fd" },
  { key: "NEGOTIATION", label: "Jednani", color: "#d97a1a", pale: "#fef5ec" },
  { key: "INVESTOR", label: "Investor", color: "#1a9e6a", pale: "#edfaf4" },
  { key: "VIP", label: "VIP", color: "#b8912a", pale: "#fef9ec" },
];

export const STAGE_META: Record<
  ClientStage,
  { label: string; color: string; pale: string }
> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.key, { label: s.label, color: s.color, pale: s.pale }])
) as Record<ClientStage, { label: string; color: string; pale: string }>;

export const FUNNEL_STAGES = [
  { key: "POOL", label: "Pool (lead)", color: "#8892aa" },
  { key: "CONTACTED", label: "Kontaktovan", color: "#2d6be4" },
  { key: "INTEREST", label: "Zajem", color: "#d97a1a" },
  { key: "CONTRACT_SENT", label: "Smlouva odeslana", color: "#b8912a" },
  { key: "PAID", label: "Zaplaceno", color: "#1a9e6a" },
] as const;

export const FUNNEL_DEAD_BRANCHES = [
  { key: "NEZAJEM", label: "Nezajem", color: "#d94040" },
  { key: "DNC", label: "Nevolat (DNC)", color: "#d94040" },
  { key: "UNREACHED", label: "5+x nedovolal", color: "#d97a1a" },
] as const;

// ---------------------------------------------------------------------------
// Client scoring
// ---------------------------------------------------------------------------
export const SCORE_META: Record<
  ClientScore,
  { label: string; color: string; pale: string }
> = {
  A: { label: "A", color: "#b8912a", pale: "#fef9ec" },
  B: { label: "B", color: "#1a9e6a", pale: "#edfaf4" },
  C: { label: "C", color: "#2d6be4", pale: "#eef3fd" },
  D: { label: "D", color: "#8892aa", pale: "#f0f2f7" },
};

export const ACTIVITY_ICONS: Record<string, string> = {
  CLIENT_CREATED: "🆕",
  CLIENT_UPDATED: "✏️",
  PAYMENT_ADDED: "💰",
  EMAIL_SENT: "✉️",
  EVENT_CREATED: "📅",
  NOTE_CHANGED: "📝",
  ASSIGNED_TO_CHANGED: "🔄",
  GDPR_UNSUBSCRIBE: "🚫",
};

// ---------------------------------------------------------------------------
// Default email templates
// ---------------------------------------------------------------------------
export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "t1",
    label: "Prezentace",
    subject: "Predstaveni spolecnosti – Puskin and Partners",
    body: "Vazeny/a [OSLOVENI],\n\nna zaklade naseho hovoru si Vam dovoluji zaslat prezentaci spolecnosti Puskin and Partners.\n\nV priloze naleznete podrobne informace o nasi spolecnosti a podminkach spoluprace.\n\nV pripade jakychkoli dotazu me nevahejte kontaktovat.\n\n[PODPIS]",
    allowedRoles: ["administrator", "supervisor", "broker"],
  },
  {
    id: "t2",
    label: "Navrh smlouvy",
    subject: "Navrh smlouvy – Puskin and Partners",
    body: "Vazeny/a [OSLOVENI],\n\nzasilam Vam navrh smlouvy k prostudovani.\n\nZaroven Vas prosim o zaslani nasledujicich udaju potrebnych pro vyhotoveni finalni smlouvy:\n\n– Jmeno a prijmeni\n– Datum narozeni\n– Trvale bydliste\n– Cislo obcanskeho prukazu\n– Cislo bankovniho uctu\n\nV pripade jakychkoli dotazu me nevahejte kontaktovat.\n\n[PODPIS]",
    allowedRoles: ["administrator", "supervisor", "broker"],
  },
  {
    id: "t3",
    label: "Smlouva finalni",
    subject: "Smlouva – Puskin and Partners",
    body: "Vazeny/a [OSLOVENI],\n\nv priloze zasilam finalni verzi smlouvy k podpisu.\n\nProsim o prostudovani a zaslani podepsane verze zpet.\n\n[PODPIS]",
    allowedRoles: ["administrator"],
  },
];
