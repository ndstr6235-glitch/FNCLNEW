# TASK-001: QA Report — Next.js projekt setup

**Datum:** 2026-08-24
**Reviewer:** kontrolor
**Commit:** `0f5cbb3`

---

## 1. Simplify kontrola

### Zbytečně složité části
Nic zásadního — kód je přiměřeně jednoduchý pro setup task.

### Duplicity a nepotřebný kód
- `src/types/index.ts` je prázdný soubor (jen komentář). Akceptovatelné — placeholder pro TASK-002+.
- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` — výchozí Next.js SVG soubory, nepotřebné pro projekt. Nízká priorita, lze smazat v budoucnu.
- `src/data/site.ts` obsahuje `social: { facebook: "#", instagram: "#", linkedin: "#" }` — placeholder hodnoty, v pořádku pro tuto fázi.

### Pozitivní vzory
- `cn()` utility v `src/lib/utils.ts` — správný pattern pro Tailwind
- `siteConfig` jako single source of truth pro firemní data — dobré řešení
- Route groups `(web)` a `(crm)` — čistá architektura

---

## 2. Debug kontrola

### Build výstup
```
✓ Compiled successfully in 6.7s
✓ TypeScript: OK (0 chyb)
✓ ESLint: OK (0 warningů)
✓ 14 rout vygenerováno staticky
```

### Routy
| Route | Status |
|-------|--------|
| `/` | ✅ generováno |
| `/_not-found` | ✅ generováno |
| `/blog` | ✅ generováno |
| `/dashboard` | ✅ generováno (CRM) |
| `/kariera` | ✅ generováno |
| `/kontakt` | ✅ generováno |
| `/o-nas` | ✅ generováno |
| `/reference` | ✅ generováno |
| `/sluzby/development` | ✅ generováno |
| `/sluzby/investice` | ✅ generováno |
| `/sluzby/nemovitosti` | ✅ generováno |
| `/sluzby/rekonstrukce` | ✅ generováno |

### Warningy / errory
- Žádné TypeScript chyby (`npx tsc --noEmit` čistý)
- Žádné ESLint chyby (`npm run lint` čistý)

### Minor poznámka
- `Header.tsx` používá `key={item.label}` — správná oprava (impl.md zmiňuje, že `key={item.href}` by způsobilo duplicitní klíč kvůli `href="#"` u Služby). Řešení je správné.
- `not-found.tsx` používá `bg-primary`, `hover:bg-primary-dark` — custom CSS proměnné definované v `globals.css` (`@theme`). Funguje.

---

## 3. Reverzní kontrola

Původní zadání TASK-001 bod po bodu:

### Požadavky ze zadání TASK-QUEUE.md

| Požadavek | Status | Poznámka |
|-----------|--------|----------|
| Next.js projekt s App Routerem | ✅ | Next.js 16.3.2 (Turbopack), App Router |
| TypeScript | ✅ | `tsconfig.json`, `@types/react`, `@types/node` |
| Tailwind CSS | ✅ | Tailwind CSS 4, CSS-first `@theme` konfigurace |
| SSR | ✅ | Všechny stránky jsou Server Components by default |
| `/app/(web)/` — veřejný web | ✅ | Kompletní route group se všemi podstránkami |
| `/app/(crm)/` — CRM placeholder | ✅ | `(crm)/layout.tsx` + `(crm)/dashboard/page.tsx` |
| ESLint | ✅ | `eslint.config.mjs`, `eslint-config-next` |
| Prettier | ✅ | `.prettierrc` s konfigurací |
| git init | ✅ | 2 commity: `dabd2ec` + `0f5cbb3` |
| Základní layout | ✅ | Root layout, web layout (header+footer), CRM layout |

### Požadavky z plánu TASK-001-plan.md

| Požadavek | Status | Poznámka |
|-----------|--------|----------|
| Header na web stránkách | ✅ | `(web)/layout.tsx` obsahuje `<Header />` |
| Footer na web stránkách | ✅ | `(web)/layout.tsx` obsahuje `<Footer />` |
| CRM vlastní layout bez header/footer | ✅ | `(crm)/layout.tsx` je samostatný, bez Header/Footer |
| Header sticky top-0 z-50 | ✅ | `className="sticky top-0 z-50 bg-white border-b"` |
| siteConfig jako single source of truth | ✅ | `src/data/site.ts` s firmou, kontaktem, navigací |
| cn() utility | ✅ | `src/lib/utils.ts` |
| formatPrice() utility | ✅ | `src/lib/utils.ts` |
| clsx + tailwind-merge závislosti | ✅ | `package.json` |
| not-found.tsx | ✅ | Custom 404 stránka |
| public/images/team, projects, logo | ✅ | Adresáře existují |
| public/fonts | ✅ | Adresář existuje |

### Co chybí z plánu (minor)

| Chybí | Dopad | Priorita |
|-------|-------|----------|
| `src/components/ui/` adresář prázdný | Nízký — komponenty přijdou v TASK-002 | Nízká |
| `src/components/sections/` adresář neexistuje | Nízký — sekce přijdou v TASK-003 | Nízká |
| Header nemá dropdown menu pro Služby | Nízký — plan říká "placeholder Header", dropdown přijde v TASK-002/003 | Nízká |

---

## Výsledek QA

**Status: APPROVED — TASK-001 splněna**

Všechny kritické požadavky jsou splněny:
- Build OK, 0 chyb, 0 warningů
- Route groups `(web)` a `(crm)` jsou správně oddělené
- Header + Footer jsou na webových stránkách
- CRM má vlastní layout bez Header/Footer
- Git repozitář inicializovaný se správným commitem
- TypeScript, ESLint, Prettier vše funkční

Nalezené nedostatky jsou minor a plánované na TASK-002/003.
