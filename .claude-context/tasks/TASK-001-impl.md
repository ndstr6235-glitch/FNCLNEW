# TASK-001: Implementace — Next.js projekt setup

## Status: DONE
**Commit:** `0f5cbb3` — "Initial project setup: Next.js 15 + TypeScript + Tailwind CSS 4 + App Router"

## Kroky provedené

| # | Krok | Status |
|---|------|--------|
| 1 | Inicializace Next.js projektu (create-next-app) | DONE |
| 2 | Struktura adresaru | DONE |
| 3 | Root Layout | DONE |
| 4 | Web Layout (header + footer) | DONE |
| 5 | CRM Placeholder Layout | DONE |
| 6 | Globals CSS (Tailwind v4 @theme) | DONE |
| 7 | Placeholder stranky (10 pages) | DONE |
| 8 | Site Data (src/data/site.ts) | DONE |
| 9 | Utility funkce (cn, formatPrice) | DONE |
| 10 | Zavislosti (clsx, tailwind-merge) | DONE |
| 11 | Prettier konfigurace | DONE |
| 12 | Next.js konfigurace (images formats) | DONE |
| 13 | Header + Footer komponenty | DONE |
| 14 | Git commit | DONE |
| 15 | Overeni (npm run build) | DONE |

## Vytvořené soubory (22)

- `src/app/layout.tsx` — Root layout (cs lang, metadata, OG)
- `src/app/globals.css` — Tailwind v4 CSS-first theme
- `src/app/not-found.tsx` — Custom 404
- `src/app/(web)/layout.tsx` — Web layout (Header + Footer)
- `src/app/(web)/page.tsx` — Homepage placeholder
- `src/app/(web)/o-nas/page.tsx` — O nas placeholder
- `src/app/(web)/sluzby/development/page.tsx` — Development placeholder
- `src/app/(web)/sluzby/rekonstrukce/page.tsx` — Rekonstrukce placeholder
- `src/app/(web)/sluzby/nemovitosti/page.tsx` — Nemovitosti placeholder
- `src/app/(web)/sluzby/investice/page.tsx` — Investice placeholder
- `src/app/(web)/reference/page.tsx` — Reference placeholder
- `src/app/(web)/kariera/page.tsx` — Kariera placeholder
- `src/app/(web)/blog/page.tsx` — Blog placeholder
- `src/app/(web)/kontakt/page.tsx` — Kontakt placeholder
- `src/app/(crm)/layout.tsx` — CRM layout placeholder
- `src/app/(crm)/dashboard/page.tsx` — CRM dashboard placeholder
- `src/components/layout/Header.tsx` — Header s navigaci
- `src/components/layout/Footer.tsx` — Footer s company info
- `src/data/site.ts` — Site config (company, contact, navigation)
- `src/lib/utils.ts` — cn() + formatPrice()
- `src/types/index.ts` — Shared types (empty)
- `.prettierrc` — Prettier config

## Build output

Vsech 14 rout vygenerovano staticky:
- `/`, `/_not-found`, `/blog`, `/dashboard`, `/kariera`, `/kontakt`
- `/o-nas`, `/reference`, `/sluzby/development`, `/sluzby/investice`
- `/sluzby/nemovitosti`, `/sluzby/rekonstrukce`

## Poznamky
- Next.js 16.3.2 (Turbopack) — pouziva LayoutProps<> generovane typy
- Root layout pouziva `{ children: React.ReactNode }` misto LayoutProps (kompatibilni)
- Header key prop pouziva item.label (ne item.href) kvuli duplicitnimu "#" u Sluzby
- Backup/restore TASK-QUEUE.md, TASK-LOG.md, .claude-context, docs probehlo uspesne
