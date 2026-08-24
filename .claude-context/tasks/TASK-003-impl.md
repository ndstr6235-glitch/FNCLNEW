# TASK-003: Implementace — Homepage

## Status: DONE
**Commit:** `15f10b2` — "Implement homepage with 8 sections, scroll animations, counter hook"

## Kroky provedené

| # | Krok | Status |
|---|------|--------|
| 1 | Hero sekce (fullscreen, CTA, scroll indicator) | DONE |
| 2 | Services sekce (4 karty s ikonami) | DONE |
| 3 | AboutPreview sekce (2 sloupce, company intro) | DONE |
| 4 | Stats sekce (animovane countery, client component) | DONE |
| 5 | FeaturedProject sekce (Vila Sestajovice) | DONE |
| 6 | Testimonials sekce (4 recenze, hvezdicky) | DONE |
| 7 | BlogPreview sekce (3 clanky, formatovani data) | DONE |
| 8 | Newsletter sekce (email form, GDPR checkbox) | DONE |
| 9 | Homepage sestaveni (vsech 8 sekci) | DONE |
| 10 | Scroll animace (useScrollAnimation + AnimateIn) | DONE |

## Vytvořené soubory (13)

**Sekce (8):**
- `src/components/sections/Hero.tsx` — Server, fullscreen gradient, 2 CTA
- `src/components/sections/Services.tsx` — Server, 4 karty s AnimateIn
- `src/components/sections/AboutPreview.tsx` — Server, 2-column layout
- `src/components/sections/Stats.tsx` — Client, useCountUp s IntersectionObserver
- `src/components/sections/FeaturedProject.tsx` — Server, overlay projekt
- `src/components/sections/Testimonials.tsx` — Server, 4 reviews + stars
- `src/components/sections/BlogPreview.tsx` — Server, 3 articles + date format
- `src/components/sections/Newsletter.tsx` — Client, email form + GDPR

**Hooks (2):**
- `src/hooks/useScrollAnimation.ts` — IntersectionObserver fade-in trigger
- `src/hooks/useCountUp.ts` — Animated counter (ease-out, 2s duration)

**UI komponenty (2):**
- `src/components/ui/AnimateIn.tsx` — Reusable scroll-triggered fade+slide
- `src/components/ui/Icon.tsx` — Inline SVG (building, hammer, key, chart, star, quote)

**Upravené (1):**
- `src/app/(web)/page.tsx` — Homepage s 8 sekcemi

## Build output
- `npm run build` — 0 chyb, 14 statickych rout, 394ms kompilace
- Pouze Stats a Newsletter jsou client components (ostatni SSR)

## Poznamky
- Hero pouziva gradient background (placeholder pro budouci fotografii)
- Obrazky jsou placeholder divy s gradient backgrounds
- Blog posts maji placeholder data s cesky formatovanymi daty
- Newsletter form je zatim bez backend integrace (TODO)
- AnimateIn wrappery pridavaji staggered delay pro kaskadovy efekt
