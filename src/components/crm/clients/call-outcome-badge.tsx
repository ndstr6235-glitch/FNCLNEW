import { cn } from "@/lib/crm/utils";
import { getOutcomeMeta } from "@/lib/crm/call-outcomes";

interface CallOutcomeBadgeProps {
  outcome: string;
}

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: "bg-emerald-pale", text: "text-emerald", border: "border-emerald-border" },
  sapphire: { bg: "bg-sapphire-pale", text: "text-sapphire", border: "border-sapphire-border" },
  gold: { bg: "bg-gold-pale", text: "text-gold", border: "border-gold-border" },
  amber: { bg: "bg-amber-pale", text: "text-amber", border: "border-amber-border" },
  ruby: { bg: "bg-ruby-pale", text: "text-ruby", border: "border-ruby-border" },
};

export default function CallOutcomeBadge({ outcome }: CallOutcomeBadgeProps) {
  if (!outcome) return null;
  const meta = getOutcomeMeta(outcome);
  if (!meta) return null;
  const colors = COLOR_CLASSES[meta.badgeColor] ?? COLOR_CLASSES.gold;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        colors.bg,
        colors.text,
        colors.border
      )}
    >
      {meta.icon} {meta.label}
    </span>
  );
}
