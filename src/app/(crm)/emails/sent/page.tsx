import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MailCheck } from "lucide-react";
import { getSession } from "@/lib/crm/auth";
import { getContactedOverview } from "@/lib/crm/contacted";
import CallOutcomeBadge from "@/components/crm/clients/call-outcome-badge";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PERIODS = [
  { value: "", label: "Celé období" },
  { value: "1", label: "Dnes a včera" },
  { value: "7", label: "Posledních 7 dní" },
  { value: "30", label: "Posledních 30 dní" },
];

// Rendered on the server (UTC) — times are shown in Czech time explicitly
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Prague",
  });

/** /emails/sent — who has been contacted by e-mail. Admin/supervisor only. */
export default async function ContactedRoute({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "broker") redirect("/emails");

  const params = await searchParams;
  const str = (k: string) => (typeof params[k] === "string" ? (params[k] as string).trim() : "");
  const q = str("q");
  const senderId = str("sender");
  const template = str("template");
  const days = PERIODS.some((p) => p.value === str("days")) ? str("days") : "";
  const page = Math.max(1, parseInt(str("page") || "1") || 1);

  const data = await getContactedOverview({
    q: q || undefined,
    senderId: senderId || undefined,
    template: template || undefined,
    days: days ? Number(days) : undefined,
    page,
  });

  const totalPages = Math.max(1, Math.ceil(data.matchedPeople / data.pageSize));
  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (senderId) sp.set("sender", senderId);
    if (template) sp.set("template", template);
    if (days) sp.set("days", days);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `/emails/sent?${s}` : "/emails/sent";
  };
  const hasFilters = !!(q || senderId || template || days);
  const selectClass = "border border-border bg-surface px-3 py-2 text-sm text-text";

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <Link href="/emails" className="inline-flex items-center gap-1 text-xs text-text-dim hover:text-text">
          <ArrowLeft size={12} /> Emaily
        </Link>
        <h1 className="mt-1 font-display text-xl md:text-2xl font-bold text-text">
          Oslovení e-mailem
        </h1>
        <p className="mt-0.5 text-sm text-text-mid">
          Lidé, kterým z CRM odešel alespoň jeden e-mail
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Osloveno lidí" value={data.stats.people} />
        <Stat label="Odesláno e-mailů" value={data.stats.emails} />
        <Stat label="Osloveno za 7 dní" value={data.stats.peopleLast7Days} />
        <Stat label="Odpovědělo" value={data.stats.replied} />
      </div>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Jméno nebo příjmení"
          className={`${selectClass} w-full sm:w-56`}
        />
        <select name="sender" defaultValue={senderId} className={selectClass}>
          <option value="">Odeslal: všichni</option>
          {data.senders.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select name="template" defaultValue={template} className={selectClass}>
          <option value="">Šablona: všechny</option>
          {data.templates.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="days" defaultValue={days} className={selectClass}>
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-brass text-white text-sm font-semibold">
          Filtrovat
        </button>
        {hasFilters && (
          <Link href="/emails/sent" className="text-sm text-text-dim hover:text-text">
            Zrušit filtry
          </Link>
        )}
      </form>

      {data.rows.length === 0 ? (
        <div className="border border-border bg-surface p-10 text-center">
          <MailCheck size={28} className="mx-auto text-text-dim" />
          <p className="mt-3 text-sm text-text-mid">
            {hasFilters ? "Filtrům nic neodpovídá." : "Zatím nebyl odeslán žádný e-mail."}
          </p>
        </div>
      ) : (
        <div className="border border-border bg-surface overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-hover">
              <tr className="text-left text-[10px] uppercase tracking-wider text-text-dim">
                <th className="px-4 py-3 font-medium">Klient</th>
                <th className="px-4 py-3 font-medium">Kontakt</th>
                <th className="px-4 py-3 font-medium">Poslední e-mail</th>
                <th className="px-4 py-3 font-medium">Odeslal</th>
                <th className="px-4 py-3 font-medium text-right">E-mailů</th>
                <th className="px-4 py-3 font-medium">Odpověď</th>
                <th className="px-4 py-3 font-medium">Hovor</th>
                <th className="px-4 py-3 font-medium">Makléř</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.rows.map((r) => (
                <tr key={r.clientId} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <Link
                      href={`/clients?open=${r.clientId}&tab=email`}
                      className="text-text hover:underline font-medium"
                    >
                      {r.name || "(bez jména)"}
                    </Link>
                    {r.dnc && (
                      <span className="ml-2 text-[11px] text-ruby">nevolat</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-mid whitespace-nowrap">
                    <div>{r.email}</div>
                    <div className="text-text-dim">{r.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-mid">
                    <div className="whitespace-nowrap">{fmtDateTime(r.lastSentAt)}</div>
                    <div className="text-xs text-text-dim truncate max-w-[260px]" title={r.lastSubject}>
                      {r.lastTemplate || r.lastSubject}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-mid whitespace-nowrap">{r.lastSender}</td>
                  <td className="px-4 py-3 text-sm text-text text-right">{r.emailCount}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {r.repliedAt ? (
                      <span className="text-emerald">{fmtDateTime(r.repliedAt)}</span>
                    ) : (
                      <span className="text-text-dim">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.lastCallOutcome ? (
                      <CallOutcomeBadge outcome={r.lastCallOutcome} />
                    ) : (
                      <span className="text-sm text-text-dim">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-mid whitespace-nowrap">{r.brokerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-mid">
          <span>
            {data.matchedPeople.toLocaleString("cs-CZ")} lidí · strana {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageHref(page - 1)} className="px-3 py-1.5 border border-border bg-surface">
                Předchozí
              </Link>
            )}
            {page < totalPages && (
              <Link href={pageHref(page + 1)} className="px-3 py-1.5 border border-border bg-surface">
                Další
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="text-[10px] uppercase tracking-wider text-text-dim">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold text-text">
        {value.toLocaleString("cs-CZ")}
      </div>
    </div>
  );
}
