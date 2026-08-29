import type { CallingProgress } from "@/app/actions/crm/calling";
import { COLORS } from "@/lib/crm/constants";
import Link from "next/link";

interface EmptyDoneProps {
  progress: CallingProgress;
}

export default function EmptyDone({ progress }: EmptyDoneProps) {
  const { done, quota } = progress;
  const noLeads = quota === 0 || done === 0;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 px-6 text-center">
      <div className="text-7xl leading-none">✅</div>
      <div>
        <h2
          className="font-display text-2xl font-bold mb-2"
          style={{ color: COLORS.text }}
        >
          Hotovo!
        </h2>
        <p className="text-base" style={{ color: COLORS.textMid }}>
          {noLeads
            ? "Žádné nové leady k vyvolání."
            : `Dnes všech ${done} zavoláno.`}
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all"
        style={{ background: COLORS.gold }}
      >
        Zpět na dashboard
      </Link>
    </div>
  );
}
