"use client";

import { CALL_OUTCOMES } from "@/lib/crm/call-outcomes";
import { COLORS } from "@/lib/crm/constants";
import { cn } from "@/lib/crm/utils";

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: COLORS.emeraldPale, text: COLORS.emerald, border: COLORS.emeraldBorder },
  sapphire: { bg: COLORS.sapphirePale, text: COLORS.sapphire, border: COLORS.sapphireBorder },
  gold: { bg: COLORS.goldPale, text: COLORS.gold, border: COLORS.goldBorder },
  amber: { bg: COLORS.amberPale, text: COLORS.amber, border: "#f5c842" },
  ruby: { bg: COLORS.rubyPale, text: COLORS.ruby, border: COLORS.rubyBorder },
};

interface OutcomeButtonsProps {
  onSelect: (code: string) => void;
  selectedOutcome: string | null;
  disabled?: boolean;
}

export default function OutcomeButtons({
  onSelect,
  selectedOutcome,
  disabled,
}: OutcomeButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-4 sm:p-6">
      {CALL_OUTCOMES.map((outcome, idx) => {
        const colors = BADGE_COLORS[outcome.badgeColor] ?? BADGE_COLORS.amber;
        const isSelected = selectedOutcome === outcome.code;
        const kbdNum = idx + 1;

        return (
          <button
            key={outcome.code}
            onClick={() => onSelect(outcome.code)}
            disabled={disabled}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border-2 text-center transition-all duration-150 select-none",
              "hover:scale-[1.02] active:scale-[0.98]",
              isSelected ? "ring-2 ring-offset-2" : "",
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            )}
            style={{
              background: isSelected ? colors.bg : "white",
              borderColor: isSelected ? colors.text : colors.border,
              color: colors.text,
            }}
          >
            <span className="text-xl leading-none">{outcome.icon}</span>
            <span className="text-xs font-semibold leading-tight">{outcome.label}</span>
            <span
              className="absolute top-1 right-1.5 text-[9px] font-bold opacity-40"
            >
              [{kbdNum}]
            </span>
          </button>
        );
      })}
    </div>
  );
}
