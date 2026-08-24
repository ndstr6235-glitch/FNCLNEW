# TASK-002: Implementace — Design systém

## Status: DONE
**Commit:** `38cc405` — "Add design system: Navy+Gold palette, Playfair/Inter fonts, UI components"

## Kroky provedené

| # | Krok | Status |
|---|------|--------|
| 1 | Barevná paleta (primary/accent/neutral/semantic) | DONE |
| 2 | Typografie — Playfair Display + Inter (Google Fonts) | DONE |
| 3 | Tailwind CSS v4 @theme (barvy, fonty, shadows, spacing, radius) | DONE |
| 4 | Textové logo (Logo.tsx — light/dark, sm/md/lg) | DONE |
| 5 | UI komponenty (Button, Card, Section, Container, Heading) | DONE |
| 6 | Aktualizace Header (dropdown Sluzby, glassmorphism, CTA) | DONE |
| 6 | Aktualizace Footer (3-column, Logo, kontakt) | DONE |
| 7 | Barrel export (components/ui/index.ts) | DONE |

## Vytvořené/upravené soubory (11)

**Upravené:**
- `src/app/globals.css` — Full @theme config (paleta, fonty, shadows, spacing, radius, base styles, selection)
- `src/app/layout.tsx` — Google Fonts (Playfair Display + Inter), font CSS variables
- `src/components/layout/Header.tsx` — Logo, dropdown menu, glassmorphism, CTA button
- `src/components/layout/Footer.tsx` — 3-column layout, Logo, navigace, kontakt

**Nové:**
- `src/components/ui/Logo.tsx` — Text logo, light/dark, 3 sizes
- `src/components/ui/Button.tsx` — 4 variants (primary/secondary/outline/ghost), 3 sizes
- `src/components/ui/Card.tsx` — Card with optional hover effect
- `src/components/ui/Section.tsx` — Section with 4 backgrounds
- `src/components/ui/Container.tsx` — Container with 4 max-widths
- `src/components/ui/Heading.tsx` — Heading with tag/size/subtitle
- `src/components/ui/index.ts` — Barrel export

## Build output
- `npm run build` — 0 chyb, 14 statických rout
- Kompilace 265ms (Turbopack)

## Design rozhodnutí
- Navy (#102a43) + Gold (#c49a3c) — odlišení od OAK Group (hnědá+zelená)
- Playfair Display (serif) pro nadpisy = elegance, luxus
- Inter (sans-serif) pro tělo = čitelnost, modernost
- Glassmorphism header (bg-white/95 + backdrop-blur)
- Dropdown menu pro Služby s CSS-only hover
