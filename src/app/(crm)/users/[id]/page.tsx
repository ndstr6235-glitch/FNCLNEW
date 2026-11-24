import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  PhoneCall,
  Mail,
  LogIn,
  CalendarClock,
  Users,
  Wallet,
  Target,
} from "lucide-react";
import { getSession } from "@/lib/crm/auth";
import { prisma } from "@/lib/crm/db";
import { pragueDayStart } from "@/lib/crm/database-stats";
import { getLeadSourcePrefs } from "@/lib/crm/lead-sources";
import { getPoolUserId } from "@/lib/crm/pool-user";
import { CALL_OUTCOMES, POSITIVE_OUTCOMES, getOutcomeMeta } from "@/lib/crm/call-outcomes";
import { STAGE_META } from "@/lib/crm/constants";
import type { ClientStage } from "@/lib/crm/types";
import { cn, fmtCZK } from "@/lib/crm/utils";
import BrokerSettings from "@/components/crm/users/broker-settings";

const ROLE_LABEL: Record<string, string> = {
  ADMINISTRATOR: "Administrátor",
  SUPERVISOR: "Supervizor",
  BROKER: "Makléř",
  OPERATOR: "Operátor",
};

const DAY = 86400000;
const PAGE_SIZE = 25;
const NOT_REACHED = new Set(["NEDOVOLAL", "SPATNE_CISLO"]);
const POSITIVE = new Set<string>(POSITIVE_OUTCOMES);

const TABS = [
  { key: "waiting", label: "Čekají na hovor" },
  { key: "hot", label: "Zájem a callbacky" },
  { key: "called", label: "Obvolané" },
  { key: "all", label: "Všechny" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const n = (v: number) => v.toLocaleString("cs-CZ");
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)} %` : "—");

function pragueKey(d: Date) {
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Prague" });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString("cs-CZ", { timeZone: "Europe/Prague", hour: "2-digit", minute: "2-digit" });
}
function fmtDateTime(d: Date) {
  return d.toLocaleString("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function ago(d: Date | null) {
  if (!d) return "zatím nic";
  const m = Math.round((Date.now() - d.getTime()) / 60000);
  if (m < 1) return "právě teď";
  if (m < 60) return `před ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `před ${h} h`;
  const days = Math.round(h / 24);
  return days === 1 ? "včera" : `před ${days} dny`;
}
function fmtPhone(p: string) {
  const d = p.replace(/\s/g, "");
  const m = d.match(/^(\+420)?(\d{3})(\d{3})(\d{3})$/);
  return m ? `${m[1] ? "+420 " : ""}${m[2]} ${m[3]} ${m[4]}` : p;
}

export default async function UserCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "administrator" && session.role !== "supervisor") redirect("/dashboard");

  const { id } = await params;
  const sp = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === sp.tab) ? (sp.tab as TabKey) : "waiting";
  const page = Math.max(1, Number(sp.p) || 1);

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true, email: true, role: true, active: true, dailyLeadQuota: true },
  });
  if (!user || user.email === "pool@system.local") notFound();

  const poolId = await getPoolUserId();
  const today = pragueDayStart();
  const since30 = new Date(today.getTime() - 29 * DAY);

  const tabWhere: Record<TabKey, Prisma.ClientWhereInput> = {
    waiting: { assignedTo: id, lastCallOutcome: "", dnc: false },
    hot: { assignedTo: id, lastCallOutcome: { in: [...POSITIVE_OUTCOMES] } },
    called: { assignedTo: id, lastCallOutcome: { not: "" } },
    all: { assignedTo: id },
  };
  const tabOrder: Prisma.ClientOrderByWithRelationInput[] =
    tab === "waiting" ? [{ createdAt: "asc" }] : [{ lastCalledAt: "desc" }, { createdAt: "desc" }];

  const [
    calls,
    emails,
    assignedTotal,
    tabCounts,
    contacts,
    payments,
    logins,
    upcoming,
    sourcePrefs,
    poolSources,
    stageGroups,
  ] = await Promise.all([
    prisma.call.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientId: true,
        outcome: true,
        note: true,
        createdAt: true,
        client: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.sentEmail.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientId: true,
        templateLabel: true,
        subject: true,
        createdAt: true,
        client: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.leadAssignment.count({ where: { userId: id } }),
    Promise.all(TABS.map((t) => prisma.client.count({ where: tabWhere[t.key] }))),
    prisma.client.findMany({
      where: tabWhere[tab],
      orderBy: tabOrder,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        source: true,
        stage: true,
        lastCallOutcome: true,
        lastCalledAt: true,
      },
    }),
    prisma.payment.findMany({
      where: { paid: true, client: { assignedTo: id } },
      select: { amount: true, profit: true, clientId: true },
    }),
    prisma.auditLog.findMany({
      where: { userId: id, action: "LOGIN" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, createdAt: true },
    }),
    prisma.calEvent.findMany({
      where: { userId: id, date: { gte: pragueKey(new Date()) } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 6,
      select: { id: true, title: true, date: true, time: true, client: { select: { id: true, firstName: true, lastName: true } } },
    }),
    getLeadSourcePrefs(),
    prisma.client.groupBy({ by: ["source"], where: { assignedTo: poolId, dnc: false }, _count: true }),
    prisma.client.groupBy({ by: ["stage"], where: { assignedTo: id }, _count: true }),
  ]);

  const name = `${user.firstName} ${user.lastName}`;
  const [waitingCount, hotCount, calledCount, allCount] = tabCounts;
  const tabCount: Record<TabKey, number> = { waiting: waitingCount, hot: hotCount, called: calledCount, all: allCount };

  // ── Funnel (unique contacts) ──
  const calledIds = new Set<string>();
  const reachedIds = new Set<string>();
  const interestIds = new Set<string>();
  for (const c of calls) {
    calledIds.add(c.clientId);
    if (!NOT_REACHED.has(c.outcome)) reachedIds.add(c.clientId);
    if (POSITIVE.has(c.outcome)) interestIds.add(c.clientId);
  }
  const contractIds = new Set(emails.filter((e) => /smlouv/i.test(e.templateLabel ?? "")).map((e) => e.clientId));
  const investorIds = new Set(payments.map((p) => p.clientId));
  const deposits = payments.reduce((s, p) => s + p.amount, 0);
  const profit = payments.reduce((s, p) => s + p.profit, 0);
  const totalContacts = Math.max(assignedTotal, allCount);

  const funnel = [
    { label: "Kontaktů", value: totalContacts },
    { label: "Obvoláno", value: calledIds.size },
    { label: "Dovoláno", value: reachedIds.size },
    { label: "Zájem", value: interestIds.size },
    { label: "Smlouva odeslána", value: contractIds.size },
    { label: "Investor", value: investorIds.size },
  ];
  const funnelMax = Math.max(1, funnel[0].value);

  // ── Today ──
  const todayKey = pragueKey(new Date());
  const callsToday = calls.filter((c) => pragueKey(c.createdAt) === todayKey);
  const emailsToday = emails.filter((e) => pragueKey(e.createdAt) === todayKey).length;
  const firstToday = callsToday.at(-1)?.createdAt ?? null;
  const lastToday = callsToday[0]?.createdAt ?? null;
  const lastActivity =
    [calls[0]?.createdAt, emails[0]?.createdAt, logins[0]?.createdAt]
      .filter((d): d is Date => !!d)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  // ── 30-day chart ──
  const perDay = new Map<string, { total: number; positive: number }>();
  for (const c of calls) {
    if (c.createdAt < since30) break; // calls are newest-first
    const k = pragueKey(c.createdAt);
    const cur = perDay.get(k) ?? { total: 0, positive: 0 };
    cur.total++;
    if (POSITIVE.has(c.outcome)) cur.positive++;
    perDay.set(k, cur);
  }
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today.getTime() - (29 - i) * DAY + 12 * 3600000);
    const v = perDay.get(pragueKey(d)) ?? { total: 0, positive: 0 };
    const dow = Number(d.toLocaleDateString("en-US", { timeZone: "Europe/Prague", weekday: "narrow" }) === "S");
    return {
      key: pragueKey(d),
      label: d.toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague", day: "numeric", month: "numeric" }),
      weekday: d.toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague", weekday: "short" }),
      weekend: dow === 1,
      ...v,
    };
  });
  const chartMax = Math.max(5, ...days.map((d) => d.total));
  const calls30 = days.reduce((s, d) => s + d.total, 0);
  const calls7 = days.slice(-7).reduce((s, d) => s + d.total, 0);
  const activeDays7 = days.slice(-7).filter((d) => d.total > 0).length;
  const avgPerActiveDay = activeDays7 ? Math.round(calls7 / activeDays7) : 0;

  // ── Outcomes 30 days ──
  const outcome30 = new Map<string, number>();
  for (const c of calls) {
    if (c.createdAt < since30) break;
    outcome30.set(c.outcome, (outcome30.get(c.outcome) ?? 0) + 1);
  }
  const outcomeRows = CALL_OUTCOMES.map((o) => ({ ...o, count: outcome30.get(o.code) ?? 0 }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count);
  const outcomeMax = Math.max(1, ...outcomeRows.map((o) => o.count));

  // ── Timeline ──
  type Item = { id: string; at: Date; kind: "call" | "email" | "login"; title: string; detail?: string; clientId?: string };
  const timeline: Item[] = [
    ...calls.slice(0, 20).map((c) => ({
      id: `c${c.id}`,
      at: c.createdAt,
      kind: "call" as const,
      title: `${c.client.firstName} ${c.client.lastName}`,
      detail: [getOutcomeMeta(c.outcome)?.label ?? c.outcome, c.note].filter(Boolean).join(" · "),
      clientId: c.clientId,
    })),
    ...emails.slice(0, 20).map((e) => ({
      id: `e${e.id}`,
      at: e.createdAt,
      kind: "email" as const,
      title: `${e.client.firstName} ${e.client.lastName}`,
      detail: e.templateLabel || e.subject,
      clientId: e.clientId,
    })),
    ...logins.map((l) => ({ id: `l${l.id}`, at: l.createdAt, kind: "login" as const, title: "Přihlášení do CRM" })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 12);

  const prefs = sourcePrefs[id] ?? [];
  const available = poolSources
    .map((g) => ({ source: g.source, count: g._count }))
    .sort((a, b) => b.count - a.count);
  const stageCount = new Map(stageGroups.map((g) => [g.stage, g._count]));
  const pages = Math.max(1, Math.ceil(tabCount[tab] / PAGE_SIZE));
  const href = (t: TabKey, p = 1) => `/users/${id}?tab=${t}${p > 1 ? `&p=${p}` : ""}#kontakty`;

  return (
    <div className="space-y-5 lg:space-y-6">
      <Link href="/users" className="inline-flex items-center gap-1.5 text-xs text-text-mid hover:text-gold">
        <ArrowLeft size={14} /> Uživatelé
      </Link>

      {/* ── Hero ── */}
      <div className="bg-ink text-on-dark p-5 lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center font-display text-xl font-bold text-gold">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <span
                className={cn(
                  "absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-ink",
                  user.active ? "bg-emerald" : "bg-ruby"
                )}
                title={user.active ? "Aktivní" : "Vypnutý"}
              />
            </div>
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold">{name}</h1>
              <p className="mt-1 text-sm text-on-dark/70">
                <span className="text-gold font-semibold">{ROLE_LABEL[user.role] ?? user.role}</span> · {user.email}
                {!user.active && <span className="ml-2 text-ruby font-semibold">Účet vypnutý</span>}
              </p>
              <p className="mt-1 text-xs text-on-dark/60">
                Poslední aktivita {ago(lastActivity)} · Přihlášen {logins[0] ? fmtDateTime(logins[0].createdAt) : "zatím nikdy"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px bg-on-dark/10 self-stretch lg:self-auto">
            {[
              { label: "Hovory dnes", value: n(callsToday.length) },
              { label: "Čeká na hovor", value: n(waitingCount) },
              { label: "Vklady", value: fmtCZK(deposits) },
            ].map((s) => (
              <div key={s.label} className="bg-ink px-4 py-3 lg:px-6">
                <div className="text-[10px] uppercase tracking-wider text-on-dark/50">{s.label}</div>
                <div className="mt-1 font-display text-xl lg:text-2xl font-bold tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
        <Kpi
          icon={<Phone size={15} />}
          label="Hovory 7 dní"
          value={n(calls7)}
          sub={activeDays7 ? `průměr ${n(avgPerActiveDay)} za pracovní den` : "tento týden nevolal"}
        />
        <Kpi
          icon={<Target size={15} />}
          label="Dovolatelnost"
          value={pct(reachedIds.size, calledIds.size)}
          sub={`${n(reachedIds.size)} z ${n(calledIds.size)} obvolaných`}
        />
        <Kpi
          icon={<Users size={15} />}
          label="Zájem z dovolaných"
          value={pct(interestIds.size, reachedIds.size)}
          sub={`${n(interestIds.size)} kontaktů se zájmem`}
        />
        <Kpi
          icon={<Wallet size={15} />}
          label="Investoři"
          value={n(investorIds.size)}
          sub={`zisk ${fmtCZK(profit)}`}
        />
      </div>

      <div className="grid gap-5 lg:gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        {/* ── Funnel ── */}
        <section className="lg:col-span-2 border border-border bg-surface p-5 lg:p-6">
          <Header title="Cesta kontaktu" sub="Kolik jeho kontaktů se dostalo do jednotlivých kroků (každý kontakt jednou)" />
          <div className="mt-5 space-y-2.5">
            {funnel.map((f, i) => {
              const prev = i > 0 ? funnel[i - 1].value : 0;
              return (
                <div key={f.label} className="grid grid-cols-[120px_1fr_88px] items-center gap-3">
                  <span className="text-sm text-text-mid">{f.label}</span>
                  <div className="h-7 bg-surface-hover">
                    <div
                      className={cn("h-7 rounded-r", i === funnel.length - 1 ? "bg-emerald" : "bg-gold")}
                      style={{ width: `${Math.max(f.value > 0 ? 1.5 : 0, (f.value / funnelMax) * 100)}%`, opacity: 1 - i * 0.1 }}
                    />
                  </div>
                  <span className="text-right">
                    <span className="text-sm font-semibold text-text tabular-nums">{n(f.value)}</span>
                    {i > 0 && <span className="ml-1.5 text-[11px] text-text-dim tabular-nums">{pct(f.value, prev)}</span>}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-x-5 gap-y-1.5">
            {(Object.keys(STAGE_META) as ClientStage[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 text-xs text-text-mid">
                <span className="w-2 h-2 rounded-full" style={{ background: STAGE_META[s].color }} />
                {STAGE_META[s].label}
                <span className="font-semibold text-text tabular-nums">{n(stageCount.get(s) ?? 0)}</span>
              </span>
            ))}
          </div>
        </section>

        {/* ── Today ── */}
        <section className="border border-border bg-surface p-5 lg:p-6">
          <Header title="Dnes" sub={new Date().toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague", weekday: "long", day: "numeric", month: "long" })} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Mini label="Hovorů" value={n(callsToday.length)} />
            <Mini label="E-mailů" value={n(emailsToday)} />
            <Mini label="První hovor" value={firstToday ? fmtTime(firstToday) : "—"} />
            <Mini label="Poslední hovor" value={lastToday ? fmtTime(lastToday) : "—"} />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-text-mid">
              <span>Obvoláno z dnešní fronty</span>
              <span className="tabular-nums">
                {n(callsToday.length)} / {n(user.dailyLeadQuota)}
              </span>
            </div>
            <div className="mt-1.5 h-2 bg-surface-hover">
              <div
                className="h-2 bg-sapphire"
                style={{ width: `${Math.min(100, user.dailyLeadQuota ? (callsToday.length / user.dailyLeadQuota) * 100 : 0)}%` }}
              />
            </div>
          </div>

          <h4 className="mt-6 text-[10px] uppercase tracking-wider text-text-dim">Naplánované</h4>
          {upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-text-dim">Žádné callbacky ani schůzky.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {upcoming.map((e) => (
                <li key={e.id} className="flex items-start gap-2.5 text-sm">
                  <CalendarClock size={14} className="mt-0.5 text-gold shrink-0" />
                  <div className="min-w-0">
                    <div className="truncate text-text">
                      {e.client ? (
                        <Link href={`/clients?open=${e.client.id}`} className="hover:text-gold">
                          {e.client.firstName} {e.client.lastName}
                        </Link>
                      ) : (
                        e.title
                      )}
                    </div>
                    <div className="text-[11px] text-text-dim tabular-nums">
                      {e.date.split("-").reverse().join(". ")} {e.time}
                      {e.client && ` · ${e.title}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Chart ── */}
        <section className="lg:col-span-2 border border-border bg-surface p-5 lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <Header title="Hovory za 30 dní" sub={`${n(calls30)} hovorů · z toho se zájmem ${n(days.reduce((s, d) => s + d.positive, 0))}`} />
            <div className="flex items-center gap-4 text-[11px] text-text-mid">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sapphire" /> Hovory
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gold" /> Se zájmem
              </span>
            </div>
          </div>
          {calls30 === 0 ? (
            <div className="mt-5 h-40 flex items-center justify-center border border-dashed border-border text-sm text-text-dim">
              Za posledních 30 dní zatím žádný hovor
            </div>
          ) : (
            <div className="mt-5">
              <div className="relative h-40 flex items-end gap-[2px] border-b border-border">
                {[0.5, 1].map((f) => (
                  <div
                    key={f}
                    className="absolute left-0 right-0 border-t border-dashed border-border/70 pointer-events-none"
                    style={{ bottom: `${f * 100}%` }}
                  >
                    <span className="absolute -top-2.5 right-0 bg-surface pl-1 text-[10px] text-text-dim tabular-nums">
                      {Math.round(chartMax * f)}
                    </span>
                  </div>
                ))}
                {days.map((d) => (
                  <div key={d.key} className="group relative flex-1 h-full flex flex-col justify-end">
                    <div
                      className="w-full bg-sapphire rounded-t-[3px] transition-opacity group-hover:opacity-80 flex flex-col justify-end overflow-hidden"
                      style={{ height: `${(d.total / chartMax) * 100}%` }}
                    >
                      {d.positive > 0 && (
                        <div className="w-full bg-gold border-t-2 border-surface" style={{ height: `${(d.positive / d.total) * 100}%` }} />
                      )}
                    </div>
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 whitespace-nowrap bg-ink text-on-dark text-[11px] px-2 py-1 shadow-lg">
                      <div className="font-semibold">
                        {d.weekday} {d.label}
                      </div>
                      <div>
                        {d.total} hovorů · {d.positive} se zájmem
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-1.5 flex gap-[2px]">
                {days.map((d, i) => (
                  <div key={d.key} className={cn("flex-1 text-center text-[10px] tabular-nums whitespace-nowrap", d.weekend ? "text-text-faint" : "text-text-dim")}>
                    {i % 5 === 4 || i === 29 ? d.label : ""}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Outcomes ── */}
        <section className="border border-border bg-surface p-5 lg:p-6">
          <Header title="Výsledky hovorů" sub="posledních 30 dní" />
          {outcomeRows.length === 0 ? (
            <p className="mt-4 text-sm text-text-dim">Zatím žádné hovory.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {outcomeRows.map((o) => (
                <div key={o.code}>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-mid">{o.label}</span>
                    <span className="tabular-nums text-text font-semibold">
                      {o.count} <span className="font-normal text-text-dim">{pct(o.count, calls30)}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 bg-surface-hover">
                    <div
                      className={cn("h-1.5 rounded-r", POSITIVE.has(o.code) ? "bg-gold" : "bg-sapphire")}
                      style={{ width: `${(o.count / outcomeMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Contacts ── */}
        <section id="kontakty" className="lg:col-span-2 self-start border border-border bg-surface scroll-mt-6">
          <div className="p-5 lg:p-6 pb-0 lg:pb-0 flex items-start justify-between gap-4">
            <Header title="Jeho kontakty" sub="Kliknutím otevřete kartu klienta" />
            <Link href={`/clients?broker=${id}`} className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline">
              Otevřít v Klientech <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-4 px-5 lg:px-6 flex gap-1 overflow-x-auto border-b border-border">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={href(t.key)}
                scroll={false}
                className={cn(
                  "shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors",
                  tab === t.key ? "border-gold text-text" : "border-transparent text-text-mid hover:text-text"
                )}
              >
                {t.label}
                <span className={cn("ml-1.5 px-1.5 py-0.5 text-[10px] tabular-nums", tab === t.key ? "bg-gold-pale text-text" : "bg-surface-hover text-text-dim")}>
                  {n(tabCount[t.key])}
                </span>
              </Link>
            ))}
          </div>
          {contacts.length === 0 ? (
            <p className="p-6 text-sm text-text-dim">Žádné kontakty.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-text-dim">
                    <th className="px-5 lg:px-6 py-2.5 font-medium">Jméno</th>
                    <th className="px-3 py-2.5 font-medium">Telefon</th>
                    <th className="px-3 py-2.5 font-medium">Databáze</th>
                    <th className="px-3 py-2.5 font-medium">Fáze</th>
                    <th className="px-3 py-2.5 font-medium">Poslední výsledek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contacts.map((c) => {
                    const stage = STAGE_META[c.stage as ClientStage];
                    const outcome = c.lastCallOutcome ? getOutcomeMeta(c.lastCallOutcome) : null;
                    return (
                      <tr key={c.id} className="hover:bg-surface-hover">
                        <td className="px-5 lg:px-6 py-2.5">
                          <Link href={`/clients?open=${c.id}`} className="font-medium text-text hover:text-gold">
                            {c.firstName} {c.lastName}
                          </Link>
                          {c.email && <Mail size={11} className="inline ml-1.5 text-text-dim" aria-label="má e-mail" />}
                        </td>
                        <td className="px-3 py-2.5 text-text-mid tabular-nums whitespace-nowrap">{fmtPhone(c.phone)}</td>
                        <td className="px-3 py-2.5 text-text-mid whitespace-nowrap">{c.source || "ručně"}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {stage && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-text-mid">
                              <span className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                              {stage.label}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs whitespace-nowrap">
                          {outcome ? (
                            <span className={POSITIVE.has(outcome.code) ? "text-text font-semibold" : "text-text-mid"}>
                              {outcome.label}
                              {c.lastCalledAt && (
                                <span className="ml-1.5 font-normal text-text-dim">{c.lastCalledAt.split("-").reverse().map(Number).slice(0, 2).join(". ")}.</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-text-dim">nevoláno</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="px-5 lg:px-6 py-3 flex items-center justify-between border-t border-border text-xs text-text-mid">
              <span className="tabular-nums">
                {n((page - 1) * PAGE_SIZE + 1)}–{n(Math.min(page * PAGE_SIZE, tabCount[tab]))} z {n(tabCount[tab])}
              </span>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link href={href(tab, page - 1)} scroll={false} className="px-3 py-1.5 border border-border hover:bg-surface-hover">
                    Předchozí
                  </Link>
                )}
                {page < pages && (
                  <Link href={href(tab, page + 1)} scroll={false} className="px-3 py-1.5 border border-border hover:bg-surface-hover">
                    Další
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Settings + timeline ── */}
        <div className="space-y-5 lg:space-y-6">
          <BrokerSettings
            userId={id}
            quota={user.dailyLeadQuota}
            active={user.active}
            sources={prefs}
            available={available}
            canEdit={session.role === "administrator" && id !== session.id}
          />

          <section className="border border-border bg-surface p-5">
            <Header title="Poslední aktivita" />
            {timeline.length === 0 ? (
              <p className="mt-3 text-sm text-text-dim">Zatím žádná aktivita.</p>
            ) : (
              <ol className="mt-4 relative border-l border-border ml-2 space-y-4">
                {timeline.map((t) => (
                  <li key={t.id} className="pl-4 relative">
                    <span
                      className={cn(
                        "absolute -left-[9px] top-0.5 w-[17px] h-[17px] rounded-full flex items-center justify-center",
                        t.kind === "call" ? "bg-sapphire-pale text-sapphire" : t.kind === "email" ? "bg-gold-pale text-gold" : "bg-surface-hover text-text-dim"
                      )}
                    >
                      {t.kind === "call" ? <PhoneCall size={9} /> : t.kind === "email" ? <Mail size={9} /> : <LogIn size={9} />}
                    </span>
                    <div className="text-[10px] text-text-dim tabular-nums">{fmtDateTime(t.at)}</div>
                    <div className="text-sm text-text truncate">
                      {t.clientId ? (
                        <Link href={`/clients?open=${t.clientId}`} className="hover:text-gold">
                          {t.title}
                        </Link>
                      ) : (
                        t.title
                      )}
                    </div>
                    {t.detail && <div className="text-xs text-text-mid truncate">{t.detail}</div>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Header({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      {sub && <p className="mt-0.5 text-[11px] text-text-dim">{sub}</p>}
    </div>
  );
}

function Kpi({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-surface p-4 lg:p-5">
      <div className="flex items-center gap-2 text-xs text-text-mid">
        <span className="text-gold">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-text tabular-nums">{value}</div>
      <div className="mt-0.5 text-[11px] text-text-dim">{sub}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-hover p-3">
      <div className="text-[10px] uppercase tracking-wider text-text-dim">{label}</div>
      <div className="mt-0.5 font-display text-lg font-bold text-text tabular-nums">{value}</div>
    </div>
  );
}
