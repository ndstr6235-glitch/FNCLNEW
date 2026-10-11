import Link from "next/link";
import { MailCheck, ArrowRight } from "lucide-react";

interface Props {
  stats: { people: number; emails: number; peopleLast7Days: number; replied: number };
}

export default function ContactedWidget({ stats }: Props) {
  return (
    <div className=" border border-border bg-surface p-5 lg:p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-9 h-9 bg-emerald-pale text-emerald">
          <MailCheck size={18} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-text">Oslovení e-mailem</h3>
          <p className="text-[11px] text-text-dim">Komu už z CRM odešel e-mail</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Osloveno lidí" value={stats.people} />
        <Stat label="E-mailů" value={stats.emails} />
        <Stat label="Za 7 dní" value={stats.peopleLast7Days} />
        <Stat label="Odpovědělo" value={stats.replied} />
      </div>

      <Link
        href="/emails/sent"
        className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-sm font-semibold text-text hover:bg-surface-hover"
      >
        Zobrazit seznam <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className=" bg-surface-hover p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-text-dim">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-text">{value.toLocaleString("cs-CZ")}</div>
    </div>
  );
}
