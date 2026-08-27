import type { CallingProgress } from "@/app/actions/crm/calling";
import { COLORS } from "@/lib/crm/constants";

interface ProgressHeaderProps {
  progress: CallingProgress;
}

export default function ProgressHeader({ progress }: ProgressHeaderProps) {
  const { done, quota } = progress;
  const pct = quota > 0 ? Math.min(100, Math.round((done / quota) * 100)) : 0;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-surface">
      <h1
        className="font-display text-lg font-bold"
        style={{ color: COLORS.text }}
      >
        Vyvolávání
      </h1>
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="h-2 w-32 sm:w-48 rounded-full overflow-hidden"
          style={{ background: COLORS.border }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight})`,
            }}
          />
        </div>
        <span
          className="text-sm font-medium whitespace-nowrap"
          style={{ color: COLORS.textMid }}
        >
          {done}&nbsp;/&nbsp;{quota} dnes
        </span>
      </div>
    </div>
  );
}
