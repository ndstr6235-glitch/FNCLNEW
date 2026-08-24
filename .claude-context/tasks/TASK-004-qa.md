# TASK-004: QA Report — Podstránky + Tým fix

**Datum:** 2026-08-24
**Reviewer:** kontrolor
**Commit:** `2bb3b86`

---

## 1. Simplify kontrola

### Celkové hodnocení
Kód je výrazně lépe organizovaný než by bylo bez sdílených komponent. 15 sdílených komponent eliminuje duplikaci across 9 stránek.

**Pozitivní vzory:**
- `PageHero` — sdílená hero pro všechny podstránky, přijímá `title`, `subtitle`, `stat` props ✅
- `CTASection` — flexibilní CTA s volitelným `phone`, `secondaryLabel`, `secondaryHref` ✅
- `ProcessTimeline`, `DifferentiatorsGrid`, `ProjectCards` — parametrizované komponenty použité na více stránkách ✅
- Data soubory oddělené od komponent (`data/team.ts`, `data/projects.ts` atd.) ✅
- `siteConfig` použit v `kontakt/page.tsx` — správné (DRY, ne hardcoded hodnoty) ✅
- `FAQ` accordion s `useState` — čistý pattern, klávesové otevírání/zavírání ✅

**Drobné poznámky (ne blocker):**

1. **CTASection — hardcoded telefon:** V `CTASection.tsx` řádek 52 je `href="tel:+420222244889"` hardcoded místo `siteConfig.contact.phone`. Mělo by být `import { siteConfig }` a použít `siteConfig.contact.phone.replace(/\s/g, "")`. Nízká priorita — číslo se nemění často, ale je to nekonzistentní s praxí v ostatních komponentách.

2. **TeamGrid — chybí fotky/placeholder pro fotky:** `TeamGrid` má kulatý div jako avatar placeholder, ale `TeamMember` interface neobsahuje `image` field — fotky by nešlo přidat bez rozšíření interface. Pro tuto fázi OK (placeholder), ale interface bude potřeba rozšířit.

3. **FAQ — klíč přes index:** `key={i}` místo `key={item.question}` v FAQ.tsx. Funkční, ale když se FAQ přeřadí, React ztratí state. Nízká priorita pro statická data.

4. **ContactForm — `TODO: Implement form submission`:** Očekávané pro tuto fázi.

5. **MapEmbed — hardcoded src URL:** Koordináty v iframe src jsou přibližné (`2d14.4271!3d50.0886`). Rybná 716/24 Praha 1 — přijatelně blízko, ale ideálně by se použil přesnější embed. Nízká priorita.

6. **`src/types/index.ts` stále prázdný** — každá komponenta si definuje vlastní interface lokálně. Pro tuto fázi OK, v budoucnu sdílet typy.

### Duplicity
- `Testimonials` komponenta z TASK-003 znovu použita v `rekonstrukce/page.tsx` a `reference/page.tsx` — správný reuse ✅
- `AnimateIn` importován konzistentně ze `@/components/ui/AnimateIn` ✅

---

## 2. Debug kontrola

### Build výstup
```
✓ Compiled successfully in 219ms
✓ TypeScript: OK (0 chyb)
✓ ESLint: OK (0 warningů)
✓ 14 rout vygenerováno staticky
```

### Ověření všech 9 podstránek v build výstupu
| Route | Status |
|-------|--------|
| `/o-nas` | ✅ |
| `/sluzby/development` | ✅ |
| `/sluzby/rekonstrukce` | ✅ |
| `/sluzby/nemovitosti` | ✅ |
| `/sluzby/investice` | ✅ |
| `/reference` | ✅ |
| `/kariera` | ✅ |
| `/blog` | ✅ |
| `/kontakt` | ✅ |

### Ověření Tým fix na homepage
- `src/app/(web)/page.tsx` importuje `TeamGrid` a `{ team }` ✅
- `TeamGrid` umístěn mezi `<Stats />` a `<FeaturedProject />` ✅
- Homepage má nyní 9 sekcí (přidána TeamGrid) ✅

### SSR/Client split v TASK-004
- `BeforeAfterGallery` — client (interakce) ✅
- `FAQ` — `"use client"` (accordion state) ✅
- `JobPositions` — client ✅
- `ContactForm` — `"use client"` ✅
- Ostatní (PageHero, CTASection, ProcessTimeline, DifferentiatorsGrid, atd.) — Server ✅

### Metadata
- Každá podstránka má vlastní `export const metadata: Metadata` s `title` a `description` ✅
- Metadata template `%s | Puskin and Partners` z root layoutu se aplikuje ✅

---

## 3. Reverzní kontrola

Porovnání s původním zadáním TASK-004 (TASK-QUEUE.md):

### Podstránky ze zadání

| Podstránka | URL | Status | Sekce |
|-----------|-----|--------|-------|
| O nás | `/o-nas` | ✅ | PageHero, příběh, hodnoty (3), TeamGrid, CTA |
| Development | `/sluzby/development` | ✅ | PageHero, Stats, 6 diferenciátorů, ProjectCards, ProcessTimeline, CTA |
| Rekonstrukce | `/sluzby/rekonstrukce` | ✅ | PageHero, 9-krokový proces, BeforeAfterGallery, ProjectCards, FAQ (6), Testimonials, CTA |
| Nemovitosti | `/sluzby/nemovitosti` | ✅ | PageHero, 3 služby, 4 diferenciátory, CTA |
| Investice | `/sluzby/investice` | ✅ | PageHero, 2 modely (500k / 5M), ProcessTimeline (4), Výhody (4), CTA |
| Reference | `/reference` | ✅ | PageHero, 8 projektů, Testimonials, CTA |
| Kariéra | `/kariera` | ✅ | PageHero, BenefitsGrid (6), JobPositions (2), ProcessTimeline (4), CTA |
| Blog | `/blog` | ✅ | PageHero, BlogList (3 články), Newsletter |
| Kontakt | `/kontakt` | ✅ | PageHero, kontaktní info + form, MapEmbed, telefon CTA |

### Specifické požadavky ze zadání

| Požadavek | Status | Poznámka |
|-----------|--------|----------|
| Development — 6 diferenciátorů | ✅ | DifferentiatorsGrid |
| Rekonstrukce — 9-krokový proces | ✅ | RenovationProcess, data/renovation-steps.ts |
| Rekonstrukce — before/after galerie | ✅ | BeforeAfterGallery |
| Rekonstrukce — FAQ | ✅ | FAQ komponenta, data/faq.ts |
| Investice — 2 možnosti (od 500k a od 5M) | ✅ | InvestmentModels, data/investment-models.ts |
| Reference — 8 projektů | ✅ | ProjectCards, data/projects.ts |
| Kariéra — pracovní pozice | ✅ | JobPositions, data/jobs.ts |
| Kontakt — formulář s GDPR souhlasem | ✅ | ContactForm s checkbox |
| Kontakt — mapa | ✅ | MapEmbed s Google Maps iframe |
| Sdílený header/footer/navigace | ✅ | Přes (web)/layout.tsx |
| Dropdown menu pro Služby | ✅ | Header.tsx z TASK-002 |
| Kontaktní info — adresa, email, tel | ✅ | siteConfig v kontakt/page.tsx |
| IČO, DIČ ve formuláři | ✅ | siteConfig.company.ico/dic |
| Všechny stránky SSR | ✅ | Staticky generované |

### TASK-003-fix — Tým sekce

| Požadavek | Status | Poznámka |
|-----------|--------|----------|
| Tým sekce na homepage | ✅ | TeamGrid přidán mezi Stats a FeaturedProject |
| Placeholder fotky (avatary) | ✅ | Kulaté gradienty jako placeholder |
| 6 členů týmu | ✅ | data/team.ts — Lukáš Salamánek a 5 dalších |

---

## Výsledek QA

**Status: APPROVED**

Všechny požadavky splněny:
- Build OK, 0 chyb, 0 warningů
- 9 podstránek kompletně implementováno dle zadání
- 15 sdílených komponent správně parametrizovaných a reusovaných
- 9 datových souborů oddělených od komponent
- TASK-003-fix: TeamGrid přidán na homepage ✅
- SSR/Client split správný
- Metadata na každé stránce

Nalezené drobnosti jsou nízko-prioritní (hardcoded tel v CTASection, klíč přes index v FAQ, prázdný types/index.ts) — žádný blocker.
