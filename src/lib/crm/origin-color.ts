/** "Systém" — kept in sync with SYSTEM_ORIGIN (contact-origin.ts is server-only). */
const SYSTEM_LABEL = "Systém";

export interface OriginColor {
  /** Solid accent — avatar, active tab background */
  solid: string;
  /** Pale tint — badge / inactive tab background */
  pale: string;
}

const SYSTEM: OriginColor = { solid: "#4B5B73", pale: "#EDF0F5" };

// Distinct, calm hues that sit well next to the brass brand colour
const PALETTE: OriginColor[] = [
  { solid: "#2D6BE4", pale: "#EEF3FD" }, // blue
  { solid: "#1A9E6A", pale: "#EDFAF4" }, // green
  { solid: "#8B5CF6", pale: "#F4F0FE" }, // violet
  { solid: "#D97A1A", pale: "#FEF5EC" }, // orange
  { solid: "#D6457A", pale: "#FDEFF4" }, // pink
  { solid: "#0E9AA7", pale: "#E9F8F9" }, // teal
];

/** Stable colour for a contact origin, derived from the person's name. */
export function originColor(label: string): OriginColor {
  if (label === SYSTEM_LABEL) return SYSTEM;
  let h = 4; // seed picked so the current team gets distinct colours
  for (const ch of label) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function isSystemOrigin(label: string): boolean {
  return label === SYSTEM_LABEL;
}

export function originInitials(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
