# TASK-005: CRM integrace — ndscrm rebrand do Puskin and Partners

## Cíl
Integrovat existující CRM (ndscrm) do monorepo projektu Puskin and Partners pod `/app/(crm)/`. Přebrandovat na Puskin and Partners, odstranit FioTransaction modul, přizpůsobit pro 7 makléřů/investičních poradců.

## Závislosti
- TASK-001 (projekt setup — route groups musí existovat)
- TASK-002 (design systém — pro konzistentní look CRM s webem)

## Zdroj
- Repo: `github.com/ndstr6235-glitch/ndscrm`
- Klon: `/tmp/ndscrm-ref/`
- Stack: Next.js 16 + Prisma + SQLite/Turso + Tailwind CSS 4
- 159 zdrojových souborů

---

## Analýza ndscrm

### Modely (Prisma schema)
| Model | Popis | Akce |
|-------|-------|------|
| User | Uživatelé (admin/supervisor/broker) | PONECHAT + rebrand |
| Client | Klienti/investoři (kontakty, stage, pipeline) | PONECHAT |
| Payment | Vklady investorů (amount, percent, profit, monthly payout) | PONECHAT |
| FioTransaction | Automatické párování Fio banka transakcí | **ODSTRANIT** |
| CalEvent | Kalendářní události | PONECHAT |
| EmailTemplate | Šablony emailů | PONECHAT + rebrand texty |
| Document | Dokumenty klientů (Vercel Blob) | PONECHAT |
| Notification | Notifikace uživatelů | PONECHAT |
| Activity | Aktivita na klientovi (audit trail) | PONECHAT |
| AuditLog | Systémový audit log | PONECHAT |
| SentEmail | Odeslané emaily | PONECHAT |
| Call | Záznamy hovorů | PONECHAT |
| LoginAttempt | Pokusy o přihlášení | PONECHAT |
| Ticket | Interní požadavky/tickety | PONECHAT |
| TicketMessage | Zprávy v ticketech | PONECHAT |
| LeadAssignment | Přiřazení leadů brokerům | PONECHAT |
| SystemSetting | Systémová nastavení | PONECHAT |

### Moduly (stránky)
| Modul | Route | Popis | Akce |
|-------|-------|-------|------|
| Dashboard | `/dashboard` | Statistiky, grafy, pipeline funnel | PONECHAT |
| Calling | `/calling` | Focus mode pro volání klientům | PONECHAT |
| Clients | `/clients` | Správa klientů, drawer, pipeline board | PONECHAT |
| Database | `/database` | Databáze leadů (admin/supervisor) | PONECHAT |
| Calendar | `/calendar` | Kalendář událostí | PONECHAT |
| Emails | `/emails` | Správa odeslaných emailů | PONECHAT |
| Tickets | `/tickets` | Interní požadavky | PONECHAT |
| Documents | `/documents` | Dokumenty klientů | PONECHAT |
| Contracts | `/contracts` | Generátor smluv (PDF) | PONECHAT + rebrand |
| Users | `/users` | Správa uživatelů | PONECHAT |
| Templates | `/templates` | Šablony emailů | PONECHAT + rebrand |
| Settings | `/settings` | Nastavení + audit log | PONECHAT |
| Login | `/login` | Přihlášení | PONECHAT + rebrand |

### Env proměnné
| Proměnná | Účel | Nutná |
|----------|------|-------|
| `SESSION_SECRET` | JWT šifrování session | ANO |
| `DATABASE_URL` | SQLite path nebo Turso | ANO |
| `TURSO_DATABASE_URL` | Turso cloud DB | VOLITELNÁ (prod) |
| `TURSO_AUTH_TOKEN` | Turso auth | VOLITELNÁ (prod) |
| `RESEND_API_KEY` | Resend.com pro emaily | ANO (pro emaily) |
| `GEMINI_API_KEY` | Google AI (AI asistent) | VOLITELNÁ |
| `CRON_SECRET` | Ochrana cron endpointů | ANO (prod) |
| `NEXT_PUBLIC_APP_URL` | URL aplikace | ANO |

### RBAC (3 role)
- **Administrator** — plný přístup, správa uživatelů, odesílání finálních smluv
- **Supervisor** — vidí vše, nemůže spravovat uživatele/šablony
- **Broker** — vidí jen vlastní klienty, nevidí dokumenty/smlouvy

### Design systém ndscrm
- Fonty: Fraunces (serif headings) + Sora (sans-serif UI)
- Accent: Gold `#b8912a`
- Sidebar: tmavý `#0f1117`, 220px / 68px collapsed
- Dark mode: class-based
- PWA podpora: service worker, manifest, offline page

---

## Plán integrace

### Strategie: CRM jako samostatná route group

CRM bude žít v `/app/(crm)/` se **zcela samostatným layoutem a design systémem**. Web (`/app/(web)/`) a CRM sdílejí pouze:
- Root `layout.tsx` (html, body, metadata)
- `prisma/` schema a DB přístup
- Některé utility (`lib/utils.ts`)

CRM si ponechá vlastní sidebar, auth, theme, a design tokeny — nemusí vizuálně odpovídat veřejnému webu.

### Fáze implementace

---

### Fáze 1: Příprava infrastruktury

#### Krok 1.1: Přidat Prisma do projektu
```bash
cd /Users/zen/puskin-partners
npm install prisma @prisma/client @prisma/adapter-libsql @libsql/client
```

Zkopírovat `prisma/schema.prisma` z ndscrm, ALE:
- **Odstranit** model `FioTransaction` (řádky 148-168)
- Ponechat vše ostatní beze změn

Vytvořit: `prisma/schema.prisma`

#### Krok 1.2: Přidat zbývající CRM závislosti
```bash
npm install jose bcryptjs resend lucide-react recharts pdf-lib @pdf-lib/fontkit xlsx @sparticuz/chromium puppeteer-core @vercel/blob cheerio server-only @google/generative-ai
npm install -D @types/bcryptjs tsx
```

#### Krok 1.3: Env soubor
Vytvořit `.env.local`:
```
DATABASE_URL=file:./dev.db
SESSION_SECRET=random-string-min-32-chars-here-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Krok 1.4: DB skripty do package.json
Přidat do `scripts`:
```json
"db:push": "prisma db push",
"db:seed": "prisma db seed",
"db:studio": "prisma studio"
```
A `prisma.seed` field.

---

### Fáze 2: Kopírování CRM kódu

#### Krok 2.1: Lib soubory
Zkopírovat z `/tmp/ndscrm-ref/src/lib/` do `src/lib/crm/`:

| Soubor | Akce |
|--------|------|
| `auth.ts` | Zkopírovat → `src/lib/crm/auth.ts` |
| `session.ts` | Zkopírovat → `src/lib/crm/session.ts` |
| `db.ts` | Zkopírovat → `src/lib/crm/db.ts` |
| `turso.ts` | Zkopírovat → `src/lib/crm/turso.ts` |
| `types.ts` | Zkopírovat → `src/lib/crm/types.ts` |
| `constants.ts` | Zkopírovat → `src/lib/crm/constants.ts` + rebrand |
| `utils.ts` | Zkopírovat → `src/lib/crm/utils.ts` (CRM-specifické utility) |
| `scoring.ts` | Zkopírovat → `src/lib/crm/scoring.ts` |
| `pool-stats.ts` | Zkopírovat → `src/lib/crm/pool-stats.ts` |
| `pool-user.ts` | Zkopírovat → `src/lib/crm/pool-user.ts` |
| `distribute-leads-core.ts` | Zkopírovat → `src/lib/crm/distribute-leads-core.ts` |
| `call-outcomes.ts` | Zkopírovat → `src/lib/crm/call-outcomes.ts` |
| `variable-symbol.ts` | Zkopírovat → `src/lib/crm/variable-symbol.ts` |
| `payout-schedule.ts` | Zkopírovat → `src/lib/crm/payout-schedule.ts` |
| `contract-template.ts` | Zkopírovat → `src/lib/crm/contract-template.ts` + rebrand |
| `proposal-template.ts` | Zkopírovat → `src/lib/crm/proposal-template.ts` + rebrand |
| `proposal-pdf.ts` | Zkopírovat → `src/lib/crm/proposal-pdf.ts` |
| `prezentace-pdf.ts` | Zkopírovat → `src/lib/crm/prezentace-pdf.ts` + rebrand |
| `html-to-pdf.ts` | Zkopírovat → `src/lib/crm/html-to-pdf.ts` |
| `fonts-data.ts` | Zkopírovat → `src/lib/crm/fonts-data.ts` |
| `unsubscribe-token.ts` | Zkopírovat → `src/lib/crm/unsubscribe-token.ts` |
| `lead-import.ts` | Zkopírovat → `src/lib/crm/lead-import.ts` |

**Import aliasy:** Všechny importy v CRM souborech budou používat `@/lib/crm/...` místo `@/lib/...`.

#### Krok 2.2: CRM komponenty
Zkopírovat z `/tmp/ndscrm-ref/src/components/` do `src/components/crm/`:

```
src/components/crm/
├── ui/                     # CRM-specifické UI (toast, modal, skeleton, confirm-dialog, command-palette)
├── layout/                 # Sidebar, dashboard-main, mobile-header, notification-bell, sidebar-context
├── theme/                  # ThemeProvider, ThemeToggle
├── pwa/                    # ServiceWorkerRegistration
├── dashboard/              # stat-card, charts, widgets
├── clients/                # ClientDrawer, ClientForm, filtry, pipeline board, payments
├── calendar/               # MiniCalendar, EventCard, EventForm
├── emails/                 # EmailComposer, card
├── contracts/              # ContractGenerator
├── documents/              # DocumentsPageClient
├── tickets/                # TicketBadge, list, thread, modal
├── users/                  # UserForm
└── calling/                # FocusMode, LeadCard, OutcomeButtons
```

#### Krok 2.3: Server actions
Zkopírovat z `/tmp/ndscrm-ref/src/app/actions/` do `src/app/(crm)/actions/`:

| Action | Popis |
|--------|-------|
| `auth.ts` | Login/logout |
| `clients.ts` | CRUD klientů |
| `account.ts` | Správa účtu |
| `activity.ts` | Aktivita na klientech |
| `ai.ts` | AI asistent (Gemini) |
| `audit.ts` | Audit log |
| `bulk.ts` | Hromadné operace |
| `calendar.ts` | Kalendářní události |
| `calling.ts` | Vyvolávání |
| `calls.ts` | Záznamy hovorů |
| `charts.ts` | Data pro grafy |
| `contracts.ts` | Generování smluv + rebrand |
| `dashboard-stats.ts` | Dashboard statistiky |
| `distribute-leads.ts` | Distribuce leadů |
| `documents.ts` | Správa dokumentů |
| `emails.ts` | Odesílání emailů + rebrand |
| `interest-schedule.ts` | Úrokový kalendář |
| `my-day.ts` | My Day widget |
| `notifications.ts` | Notifikace |
| `regenerate-pdf.ts` | Regenerace PDF |
| `search.ts` | Vyhledávání |
| `settings.ts` | Nastavení |
| `templates.ts` | Šablony emailů |
| `tickets.ts` | Požadavky |
| `upload-to-sent.ts` | Upload do odeslaných |
| `users.ts` | Správa uživatelů |

#### Krok 2.4: CRM stránky
Zkopírovat z `/tmp/ndscrm-ref/src/app/(dashboard)/` do `src/app/(crm)/`:

```
src/app/(crm)/
├── layout.tsx              # CRM layout (auth check + sidebar)
├── loading.tsx             # Loading skeleton
├── dashboard/page.tsx
├── calling/page.tsx
├── clients/page.tsx
├── database/page.tsx
├── calendar/page.tsx
├── emails/page.tsx
├── tickets/
│   ├── page.tsx
│   └── [id]/page.tsx
├── documents/page.tsx
├── contracts/page.tsx
├── users/page.tsx
├── templates/page.tsx
└── settings/
    ├── page.tsx
    └── audit/page.tsx
```

#### Krok 2.5: Auth stránky
Zkopírovat login z `/tmp/ndscrm-ref/src/app/(auth)/` do `src/app/(crm-auth)/`:

```
src/app/(crm-auth)/
├── layout.tsx
└── login/
    ├── page.tsx
    └── login-form.tsx
```

**Poznámka:** Použít separátní route group `(crm-auth)` aby login neměl web header/footer ani CRM sidebar.

#### Krok 2.6: API routes
Zkopírovat z `/tmp/ndscrm-ref/src/app/api/` do `src/app/api/crm/`:

```
src/app/api/crm/
├── cron/
│   ├── distribute-leads/route.ts
│   └── interest-reminder/route.ts
└── unsubscribe/route.ts
```

#### Krok 2.7: Statické soubory
Zkopírovat z `/tmp/ndscrm-ref/public/`:
- `fonts/` → `public/crm/fonts/`
- `icons/` → `public/crm/icons/`
- `prezentace-nodistar.pdf` → přebrandovat nebo nahradit
- Service worker soubory

---

### Fáze 3: Rebrand "Nodis Star" → "Puskin and Partners"

#### Krok 3.1: Soubory k rebrandování (18 souborů)

| Soubor | Co změnit |
|--------|-----------|
| `src/lib/crm/constants.ts` | Email templates: "Nodis Star s.r.o." → "Alexandr Puškin, s.r.o." |
| `src/lib/crm/contract-template.ts` | Firemní údaje ve smlouvách |
| `src/lib/crm/proposal-template.ts` | Firemní údaje v návrzích |
| `src/lib/crm/prezentace-pdf.ts` | Firemní údaje v prezentaci |
| `src/components/crm/layout/sidebar.tsx` | Logo: "Nodis Star" → "P&P" + "Puskin and Partners" |
| `src/components/crm/layout/mobile-header.tsx` | Logo v mobile headeru |
| `src/components/crm/emails/email-composer.tsx` | Reference na firmu |
| `src/components/crm/users/user-form.tsx` | Default signature |
| `src/app/(crm)/settings/page.tsx` | Reference na firmu |
| `src/app/(crm-auth)/login/login-form.tsx` | Logo na login stránce |
| `src/app/(crm)/actions/emails.ts` | From adresa: "Nodis Star" → "Puskin and Partners" |
| `src/app/(crm)/actions/contracts.ts` | Firemní údaje ve smlouvách |
| `src/app/(crm)/actions/ai.ts` | System prompt |
| `src/app/api/crm/cron/interest-reminder/route.ts` | Email sender info |
| `src/app/api/crm/unsubscribe/route.ts` | Firemní údaje |
| Root `layout.tsx` | Metadata: title, description |
| `src/app/manifest.ts` | PWA manifest |
| `src/app/offline/page.tsx` | Offline stránka |

#### Krok 3.2: Firemní údaje pro rebrand

**Stará data (Nodis Star):**
- Firma: Nodis Star s.r.o.
- Web: nodistar.cz / ndscrm.vercel.app

**Nová data (Puskin and Partners):**
- Firma: Alexandr Puškin, s.r.o.
- IČO: 26740788
- DIČ: CZ26740788
- Adresa: Rybná 716/24, 110 00 Praha 1
- Email: info@apartmentspushkin.com
- Telefon: +420 222 244 889
- Majitel: Lukáš Salamánek
- Logo text: "P&P" (sidebar icon) + "Puskin and Partners" (sidebar text)

#### Krok 3.3: Sidebar logo redesign

Změnit v sidebar.tsx:
```tsx
// Staré:
<div className="...">₿</div>
<span>Nodis Star</span>
<span>Investment Group</span>

// Nové:
<div className="...">P&P</div>
<span>Puskin & Partners</span>
<span>Investment CRM</span>
```

---

### Fáze 4: Odstranění FioTransaction

#### Krok 4.1: Schema
Odstranit model `FioTransaction` z `prisma/schema.prisma` (řádky 148-168).

#### Krok 4.2: Kód
- Smazat `/tmp/ndscrm-ref/scripts/backfill-vs.ts` (nepoužívat v novém projektu)
- Ověřit, že žádný jiný soubor na FioTransaction neodkazuje (ověřeno — žádný)

#### Krok 4.3: UI
- Žádné CRM stránky neobsahují FioTransaction UI (model byl backend-only)
- Žádná akce nereferencuje FioTransaction

---

### Fáze 5: Přizpůsobení importů

#### Krok 5.1: Aktualizovat všechny import paths

Protože CRM kód bude v jiné adresářové struktuře, je potřeba aktualizovat importy:

| Starý import | Nový import |
|-------------|-------------|
| `@/lib/auth` | `@/lib/crm/auth` |
| `@/lib/db` | `@/lib/crm/db` |
| `@/lib/types` | `@/lib/crm/types` |
| `@/lib/utils` | `@/lib/crm/utils` |
| `@/lib/constants` | `@/lib/crm/constants` |
| `@/lib/session` | `@/lib/crm/session` |
| `@/lib/...` (ostatní) | `@/lib/crm/...` |
| `@/components/ui/...` | `@/components/crm/ui/...` |
| `@/components/layout/...` | `@/components/crm/layout/...` |
| `@/components/theme/...` | `@/components/crm/theme/...` |
| `@/components/pwa/...` | `@/components/crm/pwa/...` |
| `@/components/dashboard/...` | `@/components/crm/dashboard/...` |
| `@/components/clients/...` | `@/components/crm/clients/...` |
| `@/components/calendar/...` | `@/components/crm/calendar/...` |
| `@/components/emails/...` | `@/components/crm/emails/...` |
| `@/components/contracts/...` | `@/components/crm/contracts/...` |
| `@/components/documents/...` | `@/components/crm/documents/...` |
| `@/components/tickets/...` | `@/components/crm/tickets/...` |
| `@/components/users/...` | `@/components/crm/users/...` |
| `@/components/calling/...` | `@/components/crm/calling/...` |
| `@/app/actions/...` | `@/app/(crm)/actions/...` |

**Přístup:** Použít hromadný find-and-replace ve všech CRM souborech.

#### Krok 5.2: Shared lib

Některé utility mohou být sdílené mezi web a CRM:
- `clsx` + `tailwind-merge` (cn funkce) — vytvořit sdílený `src/lib/utils.ts`
- `formatPrice` — sdílený

CRM-specifické utility zůstanou v `src/lib/crm/utils.ts`.

---

### Fáze 6: Root layout adaptace

#### Krok 6.1: Sdílený root layout

Root `layout.tsx` musí podporovat oba design systémy:

```tsx
import type { Metadata } from "next";
// Web fonts
import { Playfair_Display, Inter } from "next/font/google";
// CRM fonts
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin", "latin-ext"], variable: "--font-heading", display: "swap", weight: ["400", "500", "600", "700"] });
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap", weight: ["300", "400", "500", "600"] });
const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces", display: "swap" });
const sora = Sora({ subsets: ["latin", "latin-ext"], variable: "--font-sora", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${playfair.variable} ${inter.variable} ${fraunces.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

#### Krok 6.2: Globals CSS

Sloučit CSS z obou systémů:
- Web @theme tokeny (z TASK-002)
- CRM @theme tokeny (z ndscrm globals.css)
- CRM dark mode, keyframes, base styles
- Obě sady tokenů koexistují — web používá `primary-*`, CRM používá `gold`, `sidebar`, atd.

---

### Fáze 7: Seed data pro Puskin and Partners

#### Krok 7.1: Nový seed soubor (`prisma/seed.ts`)

```typescript
// Admin user
{
  id: "u1",
  firstName: "Lukáš",
  lastName: "Salamánek",
  email: "lukas@apartmentspushkin.com",
  password: bcrypt.hash("PuskinAdmin2026!", 10),
  role: "ADMINISTRATOR",
  signature: "S pozdravem,\nLukáš Salamánek\nAlexandr Puškin, s.r.o.\nwww.puskinandpartners.cz"
}

// Email templates — přebrandované na "Alexandr Puškin, s.r.o."
```

#### Krok 7.2: 7 uživatelů (makléřů)

Vytvořit seed pro 7 brokerů (placeholder data, budou nahrazena reálnými):
```typescript
const brokers = [
  { firstName: "Broker", lastName: "1", email: "broker1@apartmentspushkin.com", role: "BROKER" },
  { firstName: "Broker", lastName: "2", email: "broker2@apartmentspushkin.com", role: "BROKER" },
  // ... až 7
];
```

---

### Fáze 8: Next.js konfigurace

#### Krok 8.1: Aktualizovat `next.config.ts`

```typescript
import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  },
  serverExternalPackages: ["pdf-lib", "@pdf-lib/fontkit"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      // Security headers jen pro CRM routes
      { source: "/dashboard/:path*", headers: [...SECURITY_HEADERS, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/login", headers: [...SECURITY_HEADERS, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/clients/:path*", headers: SECURITY_HEADERS },
      { source: "/api/crm/:path*", headers: SECURITY_HEADERS },
      // Veřejný web — bez X-Robots-Tag (chceme indexování)
    ];
  },
};
```

#### Krok 8.2: Vercel crons
Přidat do `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/crm/cron/interest-reminder", "schedule": "0 8 14 * *" },
    { "path": "/api/crm/cron/distribute-leads", "schedule": "0 7 * * *" }
  ]
}
```

---

## Kompletní seznam souborů

### Nové soubory k vytvořit
| Kategorie | Počet | Cesta |
|-----------|-------|-------|
| Prisma | 2 | `prisma/schema.prisma`, `prisma/seed.ts` |
| CRM lib | 22 | `src/lib/crm/*.ts` |
| CRM komponenty | ~50 | `src/components/crm/**/*.tsx` |
| CRM stránky | ~18 | `src/app/(crm)/**/*.tsx` |
| CRM auth | 3 | `src/app/(crm-auth)/**/*.tsx` |
| CRM actions | 26 | `src/app/(crm)/actions/*.ts` |
| API routes | 3 | `src/app/api/crm/**/*.ts` |
| Config | 2 | `.env.local`, `vercel.json` |
| **Celkem** | **~126** | |

### Soubory k upravit
| Soubor | Změna |
|--------|-------|
| `package.json` | Přidat CRM deps + scripts |
| `next.config.ts` | Security headers, external packages |
| `src/app/layout.tsx` | Přidat CRM fonty |
| `src/app/globals.css` | Přidat CRM theme tokeny |

---

## Pořadí implementace

1. **Prisma setup** — schema (bez FioTransaction), db push, seed
2. **CRM lib** — zkopírovat a přizpůsobit lib soubory
3. **CRM UI komponenty** — zkopírovat a přizpůsobit
4. **CRM layout + sidebar** — rebrand logo, navigace
5. **CRM auth** — login stránka s rebrandem
6. **CRM stránky** — zkopírovat dashboard a všechny moduly
7. **CRM actions** — zkopírovat a přizpůsobit importy
8. **API routes** — cron jobs a unsubscribe
9. **Root layout + globals CSS** — sloučit fonty a theme
10. **Rebrand** — hromadný replace "Nodis Star" → "Alexandr Puškin, s.r.o." ve všech CRM souborech
11. **Import fix** — opravit všechny import paths
12. **Seed** — vytvořit admin + 7 brokerů
13. **Test** — `npm run dev`, přihlášení, proklikání modulů

## Rizika a poznámky
- **Font loading:** 4 Google Fonts v root layoutu = více HTTP requestů. Zvážit `display: "swap"` pro všechny.
- **Next.js verze:** ndscrm používá Next.js 16.2.1, náš projekt Next.js 15. Může být potřeba upgrade nebo downgrade některých API.
- **Prisma preview features:** ndscrm používá `driverAdapters` preview feature — potřeba ověřit kompatibilitu.
- **PWA:** Service worker a manifest mohou kolidovat s veřejným webem. Zvážit omezení PWA scope na `/dashboard` a CRM routes.
- **CSS konflikt:** CRM a web mají různé base styly. CRM nastavuje `body { background: var(--color-bg) }` což by ovlivnilo web. Řešení: CRM base styly aplikovat jen na CRM layout wrapper.
- **Sdílená DB:** Web (SSR) a CRM sdílejí stejnou Prisma instanci — potřeba `prisma/` ve stejném projektu.

## Očekávaný výsledek
- CRM plně funkční na `/login`, `/dashboard`, `/clients`, atd.
- Přebrandováno na "Puskin and Partners" / "Alexandr Puškin, s.r.o."
- FioTransaction model odstraněn
- 7 brokerských účtů + 1 admin v seedu
- Veřejný web a CRM koexistují ve stejném projektu
- Sdílená databáze (Prisma + SQLite/Turso)
- Oddělené design systémy (web: Navy+Gold, CRM: Dark sidebar+Gold accent)
