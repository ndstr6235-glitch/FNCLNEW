# TASK-004: Podstránky — O nás, Služby (4x), Reference, Kariéra, Blog, Kontakt

## Cíl
Vytvořit všech 9 podstránek webu podle struktury OAK Group s brandem Puskin and Partners.

## Závislosti
- TASK-001 (projekt setup — route struktura)
- TASK-002 (design systém — komponenty, barvy, fonty)
- TASK-003 (homepage — sdílené sekce: Services grid, Testimonials, Stats, Newsletter)

---

## Přehled stránek

| # | Stránka | URL | Priorita |
|---|---------|-----|----------|
| 1 | O nás | `/o-nas` | Vysoká |
| 2 | Development | `/sluzby/development` | Vysoká |
| 3 | Rekonstrukce | `/sluzby/rekonstrukce` | Vysoká |
| 4 | Nemovitosti | `/sluzby/nemovitosti` | Střední |
| 5 | Investice | `/sluzby/investice` | Vysoká |
| 6 | Reference | `/reference` | Střední |
| 7 | Kariéra | `/kariera` | Nízká |
| 8 | Blog | `/blog` | Nízká |
| 9 | Kontakt | `/kontakt` | Vysoká |

---

## Stránka 1: O nás (`/o-nas`)

### Soubor: `src/app/(web)/o-nas/page.tsx`

### Metadata
```tsx
export const metadata = {
  title: "O nás",
  description: "Puskin and Partners — stabilní stavebně-developerská společnost s více než 20 lety zkušeností v Praze.",
};
```

### Sekce (v pořadí):

#### 1.1 Hero banner
- Menší hero (ne fullscreen) — výška ~40vh
- Nadpis: "O nás"
- Podnadpis: "Stavíme důvěru, vytváříme hodnoty"
- Background: tmavý s overlay

#### 1.2 Příběh firmy
- 2 sloupce: text vlevo, obrázek vpravo
- Nadpis: "Naše cesta"
- Text: 3-4 odstavce o historii firmy, vizi, hodnotách
- Placeholder text o Alexandr Puškin, s.r.o. a jejich 20+ letech zkušeností

#### 1.3 Mise a hodnoty
- 3 karty v řadě:
  1. **Kvalita** — "Stavíme s důrazem na detail a prémiové materiály."
  2. **Důvěra** — "Transparentní procesy a férové jednání."
  3. **Inovace** — "Moderní technologie a architektonické trendy."

#### 1.4 Tým
- Heading: "Náš tým"
- Grid karet (2 sloupce tablet, 3-4 sloupce desktop)
- Každá karta: placeholder foto (kruhové), jméno, pozice
- Placeholder data:

```typescript
const team = [
  { name: "Lukáš Salamánek", role: "Majitel & jednatel", image: "/images/team/placeholder.jpg" },
  { name: "Jana Nováková", role: "Obchodní ředitelka", image: "/images/team/placeholder.jpg" },
  { name: "Martin Dvořák", role: "Vedoucí staveb", image: "/images/team/placeholder.jpg" },
  { name: "Eva Svobodová", role: "Marketing", image: "/images/team/placeholder.jpg" },
  { name: "Petr Veselý", role: "Realitní makléř", image: "/images/team/placeholder.jpg" },
  { name: "Kateřina Černá", role: "Investiční poradce", image: "/images/team/placeholder.jpg" },
];
```

#### 1.5 CTA sekce
- "Chcete se s námi spojit?"
- Button: "Kontaktujte nás" → /kontakt

### Komponenty k vytvoření:
- `src/components/sections/PageHero.tsx` — sdílený hero banner pro podstránky (reusable)
- `src/components/sections/TeamGrid.tsx` — tým grid

---

## Stránka 2: Development (`/sluzby/development`)

### Soubor: `src/app/(web)/sluzby/development/page.tsx`

### Metadata
```tsx
export const metadata = {
  title: "Development",
  description: "Komplexní developerské projekty v Praze — od návrhu po realizaci. 230+ dokončených projektů.",
};
```

### Sekce:

#### 2.1 Page Hero
- Nadpis: "Development"
- Podnadpis: "Komplexní developerské projekty s důrazem na kvalitu, spolehlivost a preciznost"

#### 2.2 Statistiky
- Reuse Stats komponentu z homepage (nebo mírně upravený)
- 4 čísla: 230+ projektů, 500+ klientů, 20+ let, 15+ členů týmu

#### 2.3 Klíčové diferenciátory (6 bloků)
- Grid 2x3 (mobile 1 sloupec)
- Každý blok: ikona + nadpis + krátký popis

```typescript
const differentiators = [
  { title: "Kvalitní materiály", description: "Používáme pouze ověřené, prémiové stavební materiály." },
  { title: "Architektura a design", description: "Moderní architektonické řešení šité na míru." },
  { title: "Flexibilita", description: "Přizpůsobíme se vašim požadavkům a představám." },
  { title: "Dodržení termínů", description: "Stavíme přesně podle dohodnutého harmonogramu." },
  { title: "Transparentní proces", description: "Průhledný stavební proces od začátku do konce." },
  { title: "Profesionální tým", description: "Zkušení odborníci v každé fázi projektu." },
];
```

#### 2.4 Featured projekty
- Grid 2-3 projektových karet
- Každá karta: obrázek, název, lokalita, status (Prodáno/V prodeji), počet pokojů/bytů
- Placeholder data

#### 2.5 Proces výstavby (4 fáze)
- Horizontální timeline nebo vertikální stepper
- 4 kroky: Projektový návrh → Interiérový design → Realizace → Stavební dozor
- Každý krok: číslo, nadpis, popis

#### 2.6 CTA
- "Plánujete výstavbu? Kontaktujte nás."
- Button → /kontakt

### Komponenty k vytvoření:
- `src/components/sections/DifferentiatorsGrid.tsx`
- `src/components/sections/ProcessTimeline.tsx` — reusable pro rekonstrukce i development
- `src/components/sections/ProjectCards.tsx` — reusable pro reference

---

## Stránka 3: Rekonstrukce (`/sluzby/rekonstrukce`)

### Soubor: `src/app/(web)/sluzby/rekonstrukce/page.tsx`

### Metadata
```tsx
export const metadata = {
  title: "Rekonstrukce",
  description: "Kompletní rekonstrukce bytů a domů na klíč v Praze. 9-krokový proces od schůzky po předání.",
};
```

### Sekce:

#### 3.1 Page Hero
- Nadpis: "Rekonstrukce"
- Podnadpis: "Kompletní stavby na klíč — od prvního setkání po předání klíčů"
- Stat v hero: "230+ dokončených realizací"

#### 3.2 Devítikrokový proces
- Vertikální stepper/timeline
- Každý krok: číslo (1-9), nadpis, popis
- Alternující layout (text vlevo/vpravo) na desktopu

```typescript
const renovationSteps = [
  { step: 1, title: "Schůzka", description: "Úvodní setkání, probereme vaše představy a ukážeme reference." },
  { step: 2, title: "Standardy", description: "Výběr materiálů, vzorků a barevných kombinací." },
  { step: 3, title: "Návrh", description: "Vizualizace budoucího stavu vašeho prostoru." },
  { step: 4, title: "Rozpočet", description: "Příprava detailního rozpočtu bez skrytých nákladů." },
  { step: 5, title: "Podpora", description: "Pomoc s financováním, právními záležitostmi i výběrem nemovitosti." },
  { step: 6, title: "Smlouva", description: "Podpis smlouvy a zahájení přípravné fáze." },
  { step: 7, title: "Zahájení stavby", description: "Začátek stavebních prací podle schváleného plánu." },
  { step: 8, title: "Kolaudace", description: "Finální kontrola dokončených prací." },
  { step: 9, title: "Předání", description: "Předání hotového prostoru do vašich rukou." },
];
```

#### 3.3 Before/After galerie
- 3-4 páry before/after obrázků
- Slider nebo toggle (PO/PŘED)
- Client component s interaktivním přepínáním
- Placeholder obrázky (šedé boxy s textem "Před" / "Po")

**Komponenta:** `src/components/sections/BeforeAfterGallery.tsx` (client)

#### 3.4 Dokončené realizace
- Reuse ProjectCards z development stránky
- 4-6 karet s placeholder fotkami

#### 3.5 FAQ sekce
- Accordion/expandable
- Client component

```typescript
const faq = [
  { question: "Jak dlouho trvá rekonstrukce?", answer: "Typická rekonstrukce bytu trvá 3-4 měsíce. Rozsáhlejší projekty mohou trvat déle." },
  { question: "Jaké materiály používáte?", answer: "Používáme pouze kvalitní, ověřené materiály od prémiových dodavatelů." },
  { question: "Jak řešíte neočekávané problémy?", answer: "Díky 20+ letům zkušeností dokážeme flexibilně reagovat na jakékoliv komplikace." },
  { question: "Pracujete i s historickými budovami?", answer: "Ano, máme zkušenosti s rekonstrukcí historických objektů i památkově chráněných budov." },
  { question: "Jak probíhá komunikace během stavby?", answer: "Přidělíme vám osobního projektového manažera, který vás pravidelně informuje o průběhu." },
  { question: "Je možné rozložit platbu?", answer: "Ano, nabízíme platbu po etapách podle dohodnutého harmonogramu." },
];
```

**Komponenta:** `src/components/sections/FAQ.tsx` (client) — reusable

#### 3.6 Testimonials
- Reuse z homepage

#### 3.7 CTA
- "Plánujete rekonstrukci? Kontaktujte nás."
- Button → /kontakt + telefon

### Komponenty k vytvoření:
- `src/components/sections/RenovationProcess.tsx` — 9-krokový stepper
- `src/components/sections/BeforeAfterGallery.tsx` — client, interaktivní
- `src/components/sections/FAQ.tsx` — accordion, reusable

---

## Stránka 4: Nemovitosti (`/sluzby/nemovitosti`)

### Soubor: `src/app/(web)/sluzby/nemovitosti/page.tsx`

### Metadata
```tsx
export const metadata = {
  title: "Nemovitosti",
  description: "Realitní služby v Praze — prodej, nákup a správa nemovitostí. Osobní přístup a profesionální servis.",
};
```

### Sekce:

#### 4.1 Page Hero
- Nadpis: "Nemovitosti"
- Podnadpis: "Profesionální realitní služby v Praze a okolí"

#### 4.2 Služby
- 3 karty v řadě:
  1. **Prodej nemovitostí** — Zajistíme co nejvýhodnější prodej vaší nemovitosti
  2. **Nákup nemovitostí** — Najdeme pro vás ideální nemovitost podle vašich požadavků
  3. **Správa nemovitostí** — Kompletní správa a údržba vašich investičních nemovitostí

#### 4.3 Proč si vybrat nás
- 4 diferenciátory: Znalost trhu, Osobní přístup, Transparentnost, Právní podpora

#### 4.4 CTA
- "Hledáte nemovitost nebo chcete prodat?"
- 2 buttony: "Chci koupit" + "Chci prodat" → obě na /kontakt

---

## Stránka 5: Investice (`/sluzby/investice`)

### Soubor: `src/app/(web)/sluzby/investice/page.tsx`

### Metadata
```tsx
export const metadata = {
  title: "Investice",
  description: "Investice do nemovitostí v Praze — krátkodobé pronájmy od 500 000 Kč, developerské projekty od 5 000 000 Kč.",
};
```

### Sekce:

#### 5.1 Page Hero
- Nadpis: "Investice do nemovitostí"
- Podnadpis: "Zhodnoťte své prostředky s výnosem až 15% ročně"

#### 5.2 Dva investiční modely (vizuálně oddělené karty)

**Model A: Krátkodobé pronájmy**
- Minimální investice: 500 000 Kč
- Průměrný výnos: 10–15% ročně
- Popis: Podíly ve více investičních bytech, diverzifikace, celoroční příjem
- CTA: "Zjistit více"

**Model B: Developerské projekty**
- Minimální investice: 5 000 000 Kč
- Průměrný výnos: 20–30% ročně
- Popis: Účast na developerských projektech, kompletní servis
- CTA: "Zjistit více"

#### 5.3 Jak to funguje (4 kroky)
1. Nezávazná konzultace
2. Výběr investičního modelu
3. Podpis smlouvy
4. Realizace a výnosy

#### 5.4 Výhody investice
- 4 karty: Vysoké výnosy, Profesionální správa, Diverzifikace, Transparentnost

#### 5.5 CTA
- "Zajímá vás investice? Kontaktujte nás pro nezávaznou konzultaci."
- Button + telefon

---

## Stránka 6: Reference (`/reference`)

### Soubor: `src/app/(web)/reference/page.tsx`

### Metadata
```tsx
export const metadata = {
  title: "Reference",
  description: "Naše dokončené projekty a rekonstrukce — before/after galerie a reference klientů.",
};
```

### Sekce:

#### 6.1 Page Hero
- Nadpis: "Reference"
- Podnadpis: "Naše dokončené projekty a realizace"

#### 6.2 Projektová galerie
- Grid 2x4 karet (mobile 1 sloupec, tablet 2, desktop 3-4)
- Každý projekt: obrázek, název, lokalita, typ (byt/dům/vila)
- Hover efekt: overlay s "Zobrazit detail"

```typescript
const projects = [
  { title: "Byt Biskoupová", location: "Praha", type: "Rekonstrukce bytu" },
  { title: "Byt Kladno", location: "Kladno", type: "Rekonstrukce bytu" },
  { title: "Byt Běchovice", location: "Praha-východ", type: "Rekonstrukce bytu" },
  { title: "Byt Služská", location: "Praha", type: "Rekonstrukce bytu" },
  { title: "Byt Tobrucká", location: "Praha", type: "Rekonstrukce bytu" },
  { title: "Byt Sulická", location: "Praha", type: "Rekonstrukce bytu" },
  { title: "Vila Šestajovice", location: "Praha-východ", type: "Development" },
  { title: "Vila Uhříněves", location: "Praha", type: "Development" },
];
```

- V budoucnu: before/after galerie na detail stránce (zatím jen přehledová stránka)

#### 6.3 Testimonials
- Reuse z homepage

#### 6.4 CTA
- "Chcete vidět více? Domluvte si prohlídku."

---

## Stránka 7: Kariéra (`/kariera`)

### Soubor: `src/app/(web)/kariera/page.tsx`

### Metadata
```tsx
export const metadata = {
  title: "Kariéra",
  description: "Pracovní příležitosti v Puskin and Partners — připojte se k našemu týmu.",
};
```

### Sekce:

#### 7.1 Page Hero
- Nadpis: "Kariéra"
- Podnadpis: "Připojte se k našemu týmu profesionálů"

#### 7.2 Proč u nás pracovat (6 benefitů)
Grid karet:
1. Nástupní bonus až 300 000 Kč
2. Flexibilní místo práce
3. Apple technika
4. Multisport karta
5. Služební automobil
6. Teambuildingy

#### 7.3 Otevřené pozice

```typescript
const positions = [
  {
    title: "Obchodník investice",
    location: "Praha",
    type: "Plný úvazek",
    contract: "IČO",
    description: "Prodej investičních příležitostí v nemovitostech.",
  },
  {
    title: "Realitní makléř",
    location: "Praha",
    type: "Plný úvazek",
    contract: "IČO",
    description: "Prodej rezidenčních nemovitostí od 500 000 Kč.",
  },
];
```

Každá pozice: expandable karta s detaily a CTA "Odeslat životopis"

#### 7.4 Náborový proces (4 kroky)
- Reuse ProcessTimeline:
  1. Online přihláška → 2. Osobní pohovor → 3. Přijetí do týmu → 4. Onboarding

#### 7.5 CTA
- "Máte zájem? Napište nám."
- Email link: info@apartmentspushkin.com

---

## Stránka 8: Blog (`/blog`)

### Soubor: `src/app/(web)/blog/page.tsx`

### Metadata
```tsx
export const metadata = {
  title: "Blog",
  description: "Články o nemovitostech, investicích, designu a stavebnictví od Puskin and Partners.",
};
```

### Sekce:

#### 8.1 Page Hero
- Nadpis: "Blog"
- Podnadpis: "Novinky, tipy a trendy ze světa nemovitostí"

#### 8.2 Seznam článků
- Grid 1-3 sloupce
- Každý článek: obrázek, kategorie tag, datum, nadpis, excerpt, "Číst více →"

```typescript
const blogPosts = [
  {
    title: "Trendy v interiérovém designu pro rok 2026",
    category: "Design",
    date: "2026-08-15",
    excerpt: "Jaké trendy ovládnou interiéry v letošním roce? Přinášíme přehled nejzajímavějších.",
    slug: "trendy-interierovy-design-2026",
  },
  {
    title: "Smart technologie mění způsob, jak žijeme",
    category: "Technologie",
    date: "2026-07-20",
    excerpt: "Chytrá domácnost už není sci-fi. Podívejte se, co je dnes možné.",
    slug: "smart-technologie-domacnost",
  },
  {
    title: "Diverzifikace portfolia: Investice do nemovitostí",
    category: "Investice",
    date: "2026-07-01",
    excerpt: "Proč jsou nemovitosti stále jednou z nejstabilnějších investic.",
    slug: "diverzifikace-portfolia-nemovitosti",
  },
];
```

- V budoucnu: jednotlivé blog posty (dynamické stránky) — zatím jen listing

#### 8.3 Newsletter signup
- Reuse z homepage

---

## Stránka 9: Kontakt (`/kontakt`)

### Soubor: `src/app/(web)/kontakt/page.tsx`

### Metadata
```tsx
export const metadata = {
  title: "Kontakt",
  description: "Kontaktujte Puskin and Partners — Rybná 716/24, Praha 1. Tel: +420 222 244 889.",
};
```

### Sekce:

#### 9.1 Page Hero
- Nadpis: "Kontakt"
- Podnadpis: "Spojte se s námi"

#### 9.2 Kontaktní info + formulář (2 sloupce)

**Levý sloupec — kontaktní údaje:**
- Adresa: Rybná 716/24, 110 00 Praha 1
- Email: info@apartmentspushkin.com
- Telefon: +420 222 244 889
- Otevírací hodiny: Po–Pá 09:00–18:00
- IČO: 26740788, DIČ: CZ26740788

**Pravý sloupec — kontaktní formulář:**
- Pole: Jméno, Email, Telefon (optional), Předmět (select: Obecný dotaz, Development, Rekonstrukce, Nemovitosti, Investice, Kariéra), Zpráva (textarea)
- GDPR checkbox: "Souhlasím se zpracováním osobních údajů"
- Submit button: "Odeslat zprávu"
- Client component pro validaci a odeslání

**Komponenta:** `src/components/sections/ContactForm.tsx` (client)

#### 9.3 Mapa
- Embedded Google Maps iframe
- Lokace: Rybná 716/24, Praha 1
- Výška: 400-600px
- Šedý/tlumený styl mapy

#### 9.4 CTA
- "Preferujete osobní setkání? Zavolejte nám."
- Telefonní číslo jako klikatelný link

---

## Sdílené komponenty k vytvoření

| # | Komponenta | Typ | Použití |
|---|-----------|-----|---------|
| 1 | `src/components/sections/PageHero.tsx` | Server | Všechny podstránky — hero banner |
| 2 | `src/components/sections/TeamGrid.tsx` | Server | O nás |
| 3 | `src/components/sections/DifferentiatorsGrid.tsx` | Server | Development, Nemovitosti |
| 4 | `src/components/sections/ProcessTimeline.tsx` | Server | Development, Rekonstrukce, Kariéra, Investice |
| 5 | `src/components/sections/ProjectCards.tsx` | Server | Development, Reference |
| 6 | `src/components/sections/RenovationProcess.tsx` | Server | Rekonstrukce (9 kroků) |
| 7 | `src/components/sections/BeforeAfterGallery.tsx` | Client | Rekonstrukce, Reference |
| 8 | `src/components/sections/FAQ.tsx` | Client | Rekonstrukce |
| 9 | `src/components/sections/ContactForm.tsx` | Client | Kontakt |
| 10 | `src/components/sections/InvestmentModels.tsx` | Server | Investice |
| 11 | `src/components/sections/JobPositions.tsx` | Client | Kariéra (expandable) |
| 12 | `src/components/sections/BenefitsGrid.tsx` | Server | Kariéra |
| 13 | `src/components/sections/BlogList.tsx` | Server | Blog |
| 14 | `src/components/sections/MapEmbed.tsx` | Server | Kontakt |
| 15 | `src/components/sections/CTASection.tsx` | Server | Všechny stránky (reusable CTA) |

## Soubory stránek

| # | Soubor | Popis |
|---|--------|-------|
| 1 | `src/app/(web)/o-nas/page.tsx` | O nás |
| 2 | `src/app/(web)/sluzby/development/page.tsx` | Development |
| 3 | `src/app/(web)/sluzby/rekonstrukce/page.tsx` | Rekonstrukce |
| 4 | `src/app/(web)/sluzby/nemovitosti/page.tsx` | Nemovitosti |
| 5 | `src/app/(web)/sluzby/investice/page.tsx` | Investice |
| 6 | `src/app/(web)/reference/page.tsx` | Reference |
| 7 | `src/app/(web)/kariera/page.tsx` | Kariéra |
| 8 | `src/app/(web)/blog/page.tsx` | Blog |
| 9 | `src/app/(web)/kontakt/page.tsx` | Kontakt |

## Data soubory k vytvoření

| # | Soubor | Popis |
|---|--------|-------|
| 1 | `src/data/team.ts` | Data týmu |
| 2 | `src/data/services.ts` | Data služeb + diferenciátory |
| 3 | `src/data/projects.ts` | Data referenčních projektů |
| 4 | `src/data/testimonials.ts` | Data recenzí |
| 5 | `src/data/blog.ts` | Data blog článků |
| 6 | `src/data/jobs.ts` | Data pracovních pozic + benefity |
| 7 | `src/data/faq.ts` | FAQ data (rekonstrukce) |
| 8 | `src/data/renovation-steps.ts` | 9 kroků rekonstrukce |
| 9 | `src/data/investment-models.ts` | 2 investiční modely |

## Pořadí implementace

1. **Sdílené komponenty** — PageHero, CTASection, ProcessTimeline, ProjectCards (základ pro všechny stránky)
2. **Data soubory** — všechna placeholder data
3. **Kontakt** — nejdůležitější z business hlediska (formulář + mapa)
4. **O nás** — základní firemní stránka
5. **Development** — hlavní služba
6. **Rekonstrukce** — komplexní stránka (9 kroků, before/after, FAQ)
7. **Investice** — důležité pro konverze
8. **Nemovitosti** — jednodušší stránka
9. **Reference** — galerie projektů
10. **Kariéra** — méně prioritní
11. **Blog** — listing (bez detail stránek v této fázi)

## Očekávaný výsledek
- 9 plně funkčních podstránek
- 15 sdílených sekcových komponent
- 9 data souborů s placeholder obsahem
- Responsive design na všech stránkách
- Konzistentní look & feel s homepage (TASK-003)
- Reuse komponent mezi stránkami (DRY princip)
- Všechny interaktivní prvky jako client components (FAQ, BeforeAfter, ContactForm, JobPositions)
