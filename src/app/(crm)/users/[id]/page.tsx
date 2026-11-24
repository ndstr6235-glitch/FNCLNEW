import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  AtSign,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  Database,
  Gauge,
  LogIn,
  Mail,
  Phone,
  PhoneCall,
  Sparkles,
  Target,
  Users,
  Wallet,
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

const VIEWS = [
  { key: "prehled", label: "Přehled" },
  { key: "kontakty", label: "Kontakty" },
  { key: "aktivita", label: "Aktivita" },
] as const;
type ViewKey = (typeof VIEWS)[number]["key"];

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
function isRecent(d: Date | null, minutes: number) {
  return !!d && Date.now() - d.getTime() < minutes * 60000;
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
  const view: ViewKey = VIEWS.some((v) => v.key === sp.view) ? (sp.view as ViewKey) : "prehled";
  const page = Math.max(1, Number(sp.p) || 1);

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, firstName: true, lastName: true, email: true, role: true, active: true, dailyLeadQuota: true, createdAt: true },
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
    ...calls.slice(0, 40).map((c) => ({
      id: `c${c.id}`,
      at: c.createdAt,
      kind: "call" as const,
      title: `${c.client.firstName} ${c.client.lastName}`,
      detail: [getOutcomeMeta(c.outcome)?.label ?? c.outcome, c.note].filter(Boolean).join(" · "),
      clientId: c.clientId,
    })),
    ...emails.slice(0, 40).map((e) => ({
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
    .slice(0, 40);

  const prefs = sourcePrefs[id] ?? [];
  const available = poolSources
    .map((g) => ({ source: g.source, count: g._count }))
    .sort((a, b) => b.count - a.count);
  const stageCount = new Map(stageGroups.map((g) => [g.stage, g._count]));
  const pages = Math.max(1, Math.ceil(tabCount[tab] / PAGE_SIZE));
  const href = (t: TabKey, p = 1) => `/users/${id}?view=kontakty&tab=${t}${p > 1 ? `&p=${p}` : ""}`;
  const viewHref = (v: ViewKey) => `/users/${id}${v === "prehled" ? "" : `?view=${v}`}`;
  const online = isRecent(lastActivity, 10);

  return (
    <div className="space-y-4">
      <Link href="/users" className="inline-flex items-center gap-1.5 text-xs text-text-mid hover:text-gold">
        <ArrowLeft size={14} /> Uživatelé
      </Link>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr] lg:items-start [&>*]:min-w-0">
        {/* ════════ Profile panel ════════ */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            {/* Cover + avatar */}
            <div className="relative h-24 bg-ink">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,var(--color-gold),transparent_60%)]" />
            </div>
            <div className="px-5 pb-5 -mt-12 text-center">
              <div className="relative mx-auto w-24 h-24">
                <div className="w-24 h-24 rounded-full ring-4 ring-surface bg-gradient-to-br from-gold-light to-brass flex items-center justify-center font-display text-3xl font-bold text-white">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <span
                  className={cn(
                    "absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full ring-[3px] ring-surface",
                    !user.active ? "bg-ruby" : online ? "bg-emerald" : "bg-text-faint"
                  )}
                />
              </div>
              <h1 className="mt-3 font-display text-xl font-bold text-text">{name}</h1>
              <p className={cn("mt-0.5 text-sm", !user.active ? "text-ruby" : online ? "text-sapphire" : "text-text-dim")}>
                {!user.active ? "účet vypnutý" : online ? "online" : `naposledy aktivní ${ago(lastActivity)}`}
              </p>

              {/* Action tiles */}
              <div className="mt-5 grid grid-cols-4 gap-2">
                <Action href={viewHref("kontakty")} icon={<Users size={18} />} label="Kontakty" />
                <Action href={`/clients?broker=${id}`} icon={<ArrowRight size={18} />} label="Klienti" />
                <Action href={`mailto:${user.email}`} icon={<Mail size={18} />} label="E-mail" />
                <Action href={viewHref("aktivita")} icon={<Activity size={18} />} label="Aktivita" />
              </div>
            </div>

            {/* Info rows */}
            <ul className="border-t border-border divide-y divide-border">
              <Info icon={<AtSign size={18} />} value={user.email} label="E-mail" />
              <Info icon={<BadgeCheck size={18} />} value={ROLE_LABEL[user.role] ?? user.role} label="Role" />
              <Info icon={<Gauge size={18} />} value={`${n(user.dailyLeadQuota)} kontaktů denně`} label="Denní kvóta" />
              <Info icon={<Database size={18} />} value={prefs.length ? prefs.join(", ") : "Všechny databáze"} label="Bere z databází" />
              <Info
                icon={<LogIn size={18} />}
                value={logins[0] ? fmtDateTime(logins[0].createdAt) : "Zatím nikdy"}
                label="Poslední přihlášení"
              />
              <Info
                icon={<CalendarDays size={18} />}
                value={user.createdAt.toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague", day: "numeric", month: "long", year: "numeric" })}
                label="V týmu od"
              />
            </ul>
          </div>

          <BrokerSettings
            userId={id}
            quota={user.dailyLeadQuota}
            active={user.active}
            sources={prefs}
            available={available}
            canEdit={session.role === "administrator" && id !== session.id}
          />
        </aside>

        {/* ════════ Content ════════ */}
        <div className="space-y-5">
          {/* Today strip */}
          <div className="rounded-2xl border border-border bg-surface grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border overflow-hidden">
            <Stat label="Hovory dnes" value={n(callsToday.length)} sub={`z ${n(user.dailyLeadQuota)} v kvótě`} />
            <Stat label="Čeká na hovor" value={n(waitingCount)} sub={`z ${n(allCount)} kontaktů`} />
            <Stat label="E-maily dnes" value={n(emailsToday)} sub={`${n(emails.length)} celkem`} />
            <Stat
              label="Dnes volal"
              value={firstToday && lastToday ? `${fmtTime(firstToday)}–${fmtTime(lastToday)}` : "—"}
              sub={firstToday ? "první – poslední hovor" : "dnes ještě nevolal"}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-border">
            {VIEWS.map((v) => (
              <Link
                key={v.key}
                href={viewHref(v.key)}
                scroll={false}
                className={cn(
                  "pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors",
                  view === v.key ? "border-gold text-text" : "border-transparent text-text-dim hover:text-text"
                )}
              >
                {v.label}
                {v.key === "kontakty" && <span className="ml-1.5 text-xs font-normal text-text-dim tabular-nums">{n(allCount)}</span>}
              </Link>
            ))}
          </div>

          {view === "prehled" && (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
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
                  icon={<Sparkles size={15} />}
                  label="Zájem z dovolaných"
                  value={pct(interestIds.size, reachedIds.size)}
                  sub={`${n(interestIds.size)} kontaktů se zájmem`}
                />
                <Kpi icon={<Wallet size={15} />} label="Vklady" value={fmtCZK(deposits)} sub={`${n(investorIds.size)} investorů · zisk ${fmtCZK(profit)}`} />
              </div>

              <section className="rounded-2xl border border-border bg-surface p-5 lg:p-6">
                <Header title="Cesta kontaktu" sub="Kolik jeho kontaktů se dostalo do jednotlivých kroků (každý kontakt jednou)" />
                <div className="mt-5 space-y-2.5">
                  {funnel.map((f, i) => {
                    const prev = i > 0 ? funnel[i - 1].value : 0;
                    return (
                      <div key={f.label} className="grid grid-cols-[96px_1fr_72px] sm:grid-cols-[130px_1fr_88px] items-center gap-2 sm:gap-3">
                        <span className="text-sm text-text-mid">{f.label}</span>
                        <div className="h-7 rounded-md bg-surface-hover overflow-hidden">
                          <div
                            className={cn("h-7 rounded-md", i === funnel.length - 1 ? "bg-emerald" : "bg-gold")}
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

              <div className="grid gap-5 xl:grid-cols-[1fr_300px] [&>*]:min-w-0">
                <section className="rounded-2xl border border-border bg-surface p-5 lg:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <Header
                      title="Hovory za 30 dní"
                      sub={`${n(calls30)} hovorů · z toho se zájmem ${n(days.reduce((s, d) => s + d.positive, 0))}`}
                    />
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
                    <div className="mt-5 h-40 rounded-xl flex items-center justify-center border border-dashed border-border text-sm text-text-dim">
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
                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 whitespace-nowrap rounded-md bg-ink text-on-dark text-[11px] px-2 py-1 shadow-lg">
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
                          <div
                            key={d.key}
                            className={cn("flex-1 text-center text-[10px] tabular-nums whitespace-nowrap", d.weekend ? "text-text-faint" : "text-text-dim")}
                          >
                            {i % 5 === 4 || i === 29 ? d.label : ""}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-border bg-surface p-5 lg:p-6">
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
                          <div className="mt-1 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                            <div
                              className={cn("h-1.5 rounded-full", POSITIVE.has(o.code) ? "bg-gold" : "bg-sapphire")}
                              style={{ width: `${(o.count / outcomeMax) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {view === "kontakty" && (
            <section className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="px-5 lg:px-6 pt-4 flex items-center justify-between gap-3 border-b border-border">
                <div className="flex gap-1 overflow-x-auto">
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
                      <span
                        className={cn(
                          "ml-1.5 rounded px-1.5 py-0.5 text-[10px] tabular-nums",
                          tab === t.key ? "bg-gold-pale text-text" : "bg-surface-hover text-text-dim"
                        )}
                      >
                        {n(tabCount[t.key])}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/clients?broker=${id}`}
                  className="hidden sm:inline-flex shrink-0 items-center gap-1 pb-2 text-xs font-semibold text-gold hover:underline"
                >
                  V Klientech <ArrowRight size={12} />
                </Link>
              </div>
              {contacts.length === 0 ? (
                <p className="p-6 text-sm text-text-dim">Žádné kontakty.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {contacts.map((c) => {
                    const stage = STAGE_META[c.stage as ClientStage];
                    const outcome = c.lastCallOutcome ? getOutcomeMeta(c.lastCallOutcome) : null;
                    return (
                      <li key={c.id}>
                        <Link href={`/clients?open=${c.id}`} className="flex items-center gap-3 px-5 lg:px-6 py-3 hover:bg-surface-hover">
                          <div
                            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: stage?.color ?? "#8892aa" }}
                          >
                            {c.firstName[0]}
                            {c.lastName[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-semibold text-text">
                                {c.firstName} {c.lastName}
                              </span>
                              {c.email && <Mail size={12} className="shrink-0 text-text-dim" aria-label="má e-mail" />}
                            </div>
                            <div className="truncate text-xs text-text-dim tabular-nums">
                              {fmtPhone(c.phone)} · {c.source || "ručně"} · {stage?.label}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className={cn("text-xs", outcome && POSITIVE.has(outcome.code) ? "font-semibold text-text" : "text-text-mid")}>
                              {outcome ? outcome.label : "nevoláno"}
                            </div>
                            {c.lastCalledAt && (
                              <div className="text-[11px] text-text-dim tabular-nums">
                                {c.lastCalledAt.split("-").reverse().map(Number).slice(0, 2).join(". ")}.
                              </div>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {pages > 1 && (
                <div className="px-5 lg:px-6 py-3 flex items-center justify-between border-t border-border text-xs text-text-mid">
                  <span className="tabular-nums">
                    {n((page - 1) * PAGE_SIZE + 1)}–{n(Math.min(page * PAGE_SIZE, tabCount[tab]))} z {n(tabCount[tab])}
                  </span>
                  <div className="flex gap-1">
                    {page > 1 && (
                      <Link href={href(tab, page - 1)} scroll={false} className="rounded-md px-3 py-1.5 border border-border hover:bg-surface-hover">
                        Předchozí
                      </Link>
                    )}
                    {page < pages && (
                      <Link href={href(tab, page + 1)} scroll={false} className="rounded-md px-3 py-1.5 border border-border hover:bg-surface-hover">
                        Další
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {view === "aktivita" && (
            <div className="grid gap-5 xl:grid-cols-[1fr_300px] [&>*]:min-w-0">
              <section className="rounded-2xl border border-border bg-surface p-5 lg:p-6">
                <Header title="Aktivita" sub="Hovory, e-maily a přihlášení" />
                {timeline.length === 0 ? (
                  <p className="mt-4 text-sm text-text-dim">Zatím žádná aktivita.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-border">
                    {timeline.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 py-2.5">
                        <span
                          className={cn(
                            "w-9 h-9 shrink-0 rounded-full flex items-center justify-center",
                            t.kind === "call" ? "bg-sapphire-pale text-sapphire" : t.kind === "email" ? "bg-gold-pale text-gold" : "bg-surface-hover text-text-dim"
                          )}
                        >
                          {t.kind === "call" ? <PhoneCall size={15} /> : t.kind === "email" ? <Mail size={15} /> : <LogIn size={15} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm text-text">
                            {t.clientId ? (
                              <Link href={`/clients?open=${t.clientId}`} className="font-medium hover:text-gold">
                                {t.title}
                              </Link>
                            ) : (
                              t.title
                            )}
                          </div>
                          {t.detail && <div className="truncate text-xs text-text-mid">{t.detail}</div>}
                        </div>
                        <span className="shrink-0 text-[11px] text-text-dim tabular-nums">{fmtDateTime(t.at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-border bg-surface p-5 lg:p-6 self-start">
                <Header title="Naplánované" sub="callbacky a schůzky" />
                {upcoming.length === 0 ? (
                  <p className="mt-3 text-sm text-text-dim">Nic naplánovaného.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {upcoming.map((e) => (
                      <li key={e.id} className="flex items-start gap-2.5 text-sm">
                        <CalendarClock size={15} className="mt-0.5 text-gold shrink-0" />
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Action({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      className="flex flex-col items-center gap-1.5 rounded-xl bg-surface-hover py-3 text-gold hover:bg-gold-pale transition-colors"
    >
      {icon}
      <span className="text-[11px] font-medium text-text">{label}</span>
    </Link>
  );
}

function Info({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <li className="flex items-center gap-4 px-5 py-3">
      <span className="text-text-dim shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-sm text-text break-words">{value}</div>
        <div className="text-xs text-text-dim">{label}</div>
      </div>
    </li>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-4">
      <div className="text-[10px] uppercase tracking-wider text-text-dim">{label}</div>
      <div className="mt-1 font-display text-xl font-bold text-text tabular-nums">{value}</div>
      <div className="text-[11px] text-text-dim">{sub}</div>
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
    <div className="rounded-2xl border border-border bg-surface p-4 lg:p-5">
      <div className="flex items-center gap-2 text-xs text-text-mid">
        <span className="text-gold">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-text tabular-nums">{value}</div>
      <div className="mt-0.5 text-[11px] text-text-dim">{sub}</div>
    </div>
  );
}
