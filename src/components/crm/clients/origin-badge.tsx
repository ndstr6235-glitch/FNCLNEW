import { Cpu } from "lucide-react";
import { isSystemOrigin, originColor } from "@/lib/crm/origin-color";

/** Coloured tag naming who added the contact — same colour as its tab. */
export default function OriginBadge({ origin }: { origin: string }) {
  const c = originColor(origin);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: c.pale, color: c.solid }}
    >
      {isSystemOrigin(origin) ? (
        <Cpu size={11} className="shrink-0" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.solid }} />
      )}
      {origin}
    </span>
  );
}
