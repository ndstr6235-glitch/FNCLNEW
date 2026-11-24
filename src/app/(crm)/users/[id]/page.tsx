import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Phone, Mail, TrendingUp, Wallet } from "lucide-react";
import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { getBrokerContactStats, pragueDayStart } from "@/lib/crm/database-stats";
import { getLeadSourcePrefs } from "@/lib/crm/lead-sources";
import { CALL_OUTCOMES, getOutcomeMeta } from "@/lib/crm/call-outcomes";
import { PIPELINE_STAGES } from "@/lib/crm/constants";
import { fmtCZK } from "@/lib/crm/utils";
import StatCard from "@/components/crm/dashboard/stat-card";
import MyContactsOverview from "@/components/crm/dashboard/my-contacts-overview";

const ROLE_LABEL: Record<string, string> = {
  ADMINISTRATOR: "Administrátor",
  SUPERVISOR: "Supervizor",
  BROKER: "Makléř",
  OPERATOR: "Operátor",
};

const DAY = 86400000;

function fmtDateTime(d: Date) {
  return d.toLocaleString("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague", weekday: "short", day: "numeric", month: "numeric" });
}

function pragueKey(d: Date) {
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Prague" });
}

const n = (v: number) => v.toLocaleString("cs-CZ");

export default async function UserCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "administrator" && session.role !== "supervisor") redirect("/dashboard");

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      active: true,
      dailyLeadQuota: true,
      createdAt: true,
    },
  });
  if (!user || user.email === "pool@system.local") notFound();

  const today = pragueDayStart();
  const since14 = new Date(today.getTime() - 13 * DAY);
  const since30 = new Date(today.getTime() - 29 * DAY);
  const since7 = new Date(today.getTime() - 6 * DAY);

  const [
    contactStats,
    stageGroups,
    calls14,
    outcomes30,
    callsAll,
    emails7,
    emails30,
    emailsAll,
    templates30,
    payments,
    lastLogin,
    recentCalls,
    upcoming,
    sourcePrefs,
    sourceGroups,
  ] = await Promise.all([
    getBrokerContactStats(id),
    prisma.client.groupBy({ by: ["stage"], where: { assignedTo: id }, _count: true }),
    prisma.call.findMany({ where: { userId: id, createdAt: { gte: since14 } }, select: { createdAt: true } }),
    prisma.call.groupBy({ by: ["outcome"], where: { userId: id, createdAt: { gte: since30 } }, _count: true }),
    prisma.call.count({ where: { userId: id } }),
    prisma.sentEmail.count({ where: { userId: id, createdAt: { gte: since7 } } }),
    prisma.sentEmail.count({ where: { userId: id, createdAt: { gte: since30 } } }),
    prisma.sentEmail.count({ where: { userId: id } }),
    prisma.sentEmail.groupBy({ by: ["templateLabel"], where: { userId: id, createdAt: { gte: since30 } }, _count: true }),
    prisma.payment.findMany({
      where: { paid: true, client: { assignedTo: id } },
      select: { amount: true, profit: true, clientId: true },
    }),
    prisma.auditLog.findFirst({ where: { userId: id, action: "LOGIN" }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    prisma.call.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        outcome: true,
        note: true,
        createdAt: true,
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.calEvent.findMany({
      where: { userId: id, date: { gte: pragueKey(new Date()) } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 8,
      select: {
        id: true,
        title: true,
        date: true,
        time: true,
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    getLeadSourcePrefs(),
    prisma.client.groupBy({ by: ["source"], where: { assignedTo: id }, _count: true }),
  ]);

  const name = `${user.firstName} ${user.lastName}`;
  const deposits = payments.reduce((s, p) => s + p.amount, 0);
  const profit = payments.reduce((s, p) => s + p.profit, 0);
  const investors = new Set(payments.map((p) => p.clientId)).size;

  // Calls per day, last 14 days (Prague days)
  const perDay = new Map<string, number>();
  for (const c of calls14) perDay.set(pragueKey(c.createdAt), (perDay.get(pragueKey(c.createdAt)) ?? 0) + 1);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today.getTime() - (13 - i) * DAY + 12 * 3600000);
    return { label: fmtDay(d), count: perDay.get(pragueKey(d)) ?? 0, isToday: i === 13 };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const callsToday = days[13].count;
  const calls7 = days.slice(7).reduce((s, d) => s + d.count, 0);

  const outcomeCount = new Map(outcomes30.map((o) => [o.outcome, o._count]));
  const calls30 = outcomes30.reduce((s, o) => s + o._count, 0);
  const stageCount = new Map(stageGroups.map((g) => [g.stage, g._count]));
  const prefs = sourcePrefs[id] ?? [];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <Link href="/users" className="inline-flex items-center gap-1.5 text-xs text-text-mid hover:text-gold">
          <ArrowLeft size={14} /> Uživatelé
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-lg font-bold text-gold shrink-0">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold text-text">{name}</h1>
              <p className="mt-0.5 text-sm text-text-mid">
                {ROLE_LABEL[user.role] ?? user.role} · {user.email}
                {!user.active && <span className="ml-2 text-ruby font-semibold">Neaktivní</span>}
              </p>
              <p className="mt-0.5 text-xs text-text-dim">
                Denní kvóta {n(user.dailyLeadQuota)} · Zdroje kontaktů: {prefs.length ? prefs.join(", ") : "všechny"} ·
                Poslední přihlášení: {lastLogin ? fmtDateTime(lastLogin.createdAt) : "zatím nikdy"}
              </p>
            </div>
          </div>
          <Link
            href={`/clients?broker=${id}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brass text-white text-sm font-semibold hover:opacity-90"
          >
            Všechny jeho kontakty <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:grid-cols-4 lg:gap-6">
        <StatCard
          label="Hovory dnes"
          value={n(callsToday)}
          subtitle={`7 dní: ${n(calls7)} · 30 dní: ${n(calls30)} · celkem ${n(callsAll)}`}
          accentColor="sapphire"
          icon={<Phone size={16} />}
        />
        <StatCard
          label="E-maily (7 dní)"
          value={n(emails7)}
          subtitle={`30 dní: ${n(emails30)} · celkem ${n(emailsAll)}`}
          accentColor="gold"
          icon={<Mail size={16} />}
        />
        <StatCard
          label="Investoři"
          value={n(investors)}
          subtitle={`Vklady ${fmtCZK(deposits)}`}
          accentColor="emerald"
          icon={<Wallet size={16} />}
        />
        <StatCard
          label="Zisk"
          value={fmtCZK(profit)}
          subtitle="ze zaplacených vkladů jeho klientů"
          accentColor="amber"
          icon={<TrendingUp size={16} />}
        />
      </div>

      {/* Contacts overview */}
      <MyContactsOverview stats={contactStats} brokerId={id} />

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Calls per day */}
        <div className="border border-border bg-surface p-5 lg:p-6">
          <h3 className="text-sm font-semibold text-text">Hovory za posledních 14 dní</h3>
          <div className="mt-4 space-y-1.5">
            {days.map((d) => (
              <div key={d.label} className="flex items-center gap-3 text-xs">
                <span className={`w-16 shrink-0 ${d.isToday ? "font-semibold text-text" : "text-text-mid"}`}>{d.label}</span>
                <div className="flex-1 h-3 bg-surface-hover">
                  <div className="h-3 bg-sapphire" style={{ width: `${(d.count / maxDay) * 100}%` }} />
                </div>
                <span className="w-8 text-right tabular-nums text-text">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outcomes */}
        <div className="border border-border bg-surface p-5 lg:p-6">
          <h3 className="text-sm font-semibold text-text">Výsledky hovorů (30 dní)</h3>
          {calls30 === 0 ? (
            <p className="mt-4 text-sm text-text-dim">Za posledních 30 dní žádné hovory.</p>
          ) : (
            <div className="mt-4 space-y-1.5">
              {CALL_OUTCOMES.map((o) => {
                const c = outcomeCount.get(o.code) ?? 0;
                return (
                  <div key={o.code} className="flex items-center gap-3 text-xs">
                    <span className="w-36 shrink-0 text-text-mid">{o.label}</span>
                    <div className="flex-1 h-3 bg-surface-hover">
                      <div className="h-3 bg-gold" style={{ width: `${(c / calls30) * 100}%` }} />
                    </div>
                    <span className="w-16 text-right tabular-nums text-text">
                      {c} <span className="text-text-dim">({Math.round((c / calls30) * 100)} %)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pipeline + sources */}
        <div className="border border-border bg-surface p-5 lg:p-6">
          <h3 className="text-sm font-semibold text-text">Jeho kontakty podle fáze</h3>
          <div className="mt-4 space-y-2">
            {PIPELINE_STAGES.map((s) => (
              <div key={s.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-text-mid">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="tabular-nums font-semibold text-text">{n(stageCount.get(s.key) ?? 0)}</span>
              </div>
            ))}
          </div>
          {sourceGroups.length > 0 && (
            <>
              <h4 className="mt-5 text-[10px] uppercase tracking-wider text-text-dim">Podle databáze</h4>
              <div className="mt-2 space-y-1.5">
                {sourceGroups
                  .sort((a, b) => b._count - a._count)
                  .map((g) => (
                    <div key={g.source || "_"} className="flex items-center justify-between text-sm">
                      <span className="text-text-mid">{g.source || "Zadané ručně"}</span>
                      <span className="tabular-nums text-text">{n(g._count)}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
          {templates30.length > 0 && (
            <>
              <h4 className="mt-5 text-[10px] uppercase tracking-wider text-text-dim">Odeslané e-maily (30 dní)</h4>
              <div className="mt-2 space-y-1.5">
                {templates30
                  .sort((a, b) => b._count - a._count)
                  .map((t) => (
                    <div key={t.templateLabel ?? "_"} className="flex items-center justify-between text-sm">
                      <span className="text-text-mid">{t.templateLabel || "Bez šablony"}</span>
                      <span className="tabular-nums text-text">{n(t._count)}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Upcoming events */}
        <div className="border border-border bg-surface p-5 lg:p-6">
          <h3 className="text-sm font-semibold text-text">Naplánované (callbacky, schůzky)</h3>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-text-dim">Nic naplánovaného.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {upcoming.map((e) => (
                <li key={e.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-text">
                    {e.client ? (
                      <Link href={`/clients?open=${e.client.id}`} className="hover:text-gold">
                        {e.client.firstName} {e.client.lastName}
                      </Link>
                    ) : (
                      e.title
                    )}
                    {e.client && <span className="text-text-dim"> · {e.title}</span>}
                  </span>
                  <span className="shrink-0 text-xs text-text-mid tabular-nums">
                    {e.date.split("-").reverse().join(". ")} {e.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent calls */}
      <div className="border border-border bg-surface p-5 lg:p-6">
        <h3 className="text-sm font-semibold text-text">Poslední hovory</h3>
        {recentCalls.length === 0 ? (
          <p className="mt-4 text-sm text-text-dim">Zatím žádné hovory.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {recentCalls.map((c) => (
              <li key={c.id} className="py-2.5 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4 text-sm">
                <span className="w-32 shrink-0 text-xs text-text-dim tabular-nums">{fmtDateTime(c.createdAt)}</span>
                <Link href={`/clients?open=${c.client.id}`} className="w-48 shrink-0 truncate font-medium text-text hover:text-gold">
                  {c.client.firstName} {c.client.lastName}
                </Link>
                <span className="w-40 shrink-0 text-text-mid">{getOutcomeMeta(c.outcome)?.label ?? c.outcome}</span>
                {c.note && <span className="min-w-0 truncate text-xs text-text-dim">{c.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
