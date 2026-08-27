import type { CallingLead } from "@/app/actions/crm/calling";
import { COLORS } from "@/lib/crm/constants";
import { Phone } from "lucide-react";

interface LeadCardProps {
  lead: CallingLead;
}

function computeAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const parts = birthDate.split(/[-./]/);
  if (parts.length < 3) return null;
  const year = parseInt(parts[0].length === 4 ? parts[0] : parts[2], 10);
  const month = parseInt(parts[0].length === 4 ? parts[1] : parts[1], 10);
  const day = parseInt(parts[0].length === 4 ? parts[2] : parts[0], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  const birth = new Date(year, month - 1, day);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function LeadCard({ lead }: LeadCardProps) {
  const age = computeAge(lead.birthDate);

  return (
    <div className="flex flex-col gap-4 p-6 sm:p-8">
      <h2
        className="font-display text-3xl sm:text-4xl font-bold"
        style={{ color: COLORS.text }}
      >
        {lead.firstName} {lead.lastName}
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`tel:${lead.phone}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium text-base transition-all hover:brightness-110 active:scale-95"
          style={{ background: COLORS.sapphire }}
        >
          <Phone size={18} />
          {lead.phone}
        </a>
        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: COLORS.sapphirePale, color: COLORS.sapphire }}>
          Space → zavolat
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-sm" style={{ color: COLORS.textMid }}>
        {lead.city && (
          <span className="inline-flex items-center gap-1">
            🏠 {lead.city}
          </span>
        )}
        {age !== null && (
          <span className="inline-flex items-center gap-1">
            🎂 {age} let
          </span>
        )}
        {lead.source && (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: COLORS.goldPale, color: COLORS.gold }}
          >
            {lead.source}
          </span>
        )}
      </div>
    </div>
  );
}
