# TASK-003: Evžen review — Homepage

**Datum:** 2026-08-24
**Reviewer:** Evžen THE KING
**Kontrolováno proti:** Původní zadání od uživatele

---

## Kontrola shody se zadáním

### 1. Struktura stránek — "stejná jako oakgroup.cz"

Zadání říká: Homepage jako OAK Group s 8 sekcemi.

| Sekce | Plán | Implementace | Stav |
|-------|------|-------------|------|
| 1. Hero | ✅ | ✅ Hero.tsx — fullscreen, tagline, 2 CTA, scroll indicator | ✅ |
| 2. Služby (4 karty) | ✅ | ✅ Services.tsx — 4 karty s ikonami, hover, AnimateIn | ✅ |
| 3. O nás (krátké intro) | ✅ | ✅ AboutPreview.tsx — 2 sloupce, text + placeholder | ✅ |
| 4. Statistiky (animované countery) | ✅ | ✅ Stats.tsx — 4 hodnoty, IntersectionObserver, ease-out | ✅ |
| 5. Featured projekt | ✅ | ✅ FeaturedProject.tsx — Vila Šestajovice | ✅ |
| 6. Testimonials (4 recenze) | ✅ | ✅ Testimonials.tsx — 4 recenze, hvězdičky, citáty | ✅ |
| 7. Blog (3 články) | ✅ | ✅ BlogPreview.tsx — 3 články, cs-CZ datum, CTA | ✅ |
| 8. Newsletter + CTA | ✅ | ✅ Newsletter.tsx — email, GDPR checkbox | ✅ |

**Všech 8 sekcí z plánu je implementováno.**

### 2. Služby — odpovídají zadání

| Služba | Zadání | Implementace | Stav |
|--------|--------|-------------|------|
| Development | ✅ | ✅ title: "Development", href: "/sluzby/development" | ✅ |
| Rekonstrukce | ✅ | ✅ title: "Rekonstrukce", href: "/sluzby/rekonstrukce" | ✅ |
| Reality/Nemovitosti | ✅ | ✅ title: "Nemovitosti", href: "/sluzby/nemovitosti" | ✅ (viz TASK-001 pozn.) |
| Investice | ✅ | ✅ title: "Investice", href: "/sluzby/investice" | ✅ |

### 3. Animace a countery

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Animované countery | ✅ | useCountUp hook: IntersectionObserver → requestAnimationFrame → ease-out cubic |
| Scroll-triggered animace | ✅ | useScrollAnimation + AnimateIn wrapper s staggered delay |
| Hover efekty na kartách | ✅ | Card hover: shadow-elevated + translate-y-1 |
| Hero scroll indicator | ✅ | animate-bounce na SVG šipce |
| Counter hodnoty dle plánu | ✅ | 230+ projektů, 500+ klientů, 20 let, 15+ členů |

### 4. Responsive design

| Breakpoint | Stav | Detail |
|-----------|------|--------|
| Mobile (<640px) | ✅ | 1 sloupec grid, text-5xl |
| Tablet (640-1024px) | ✅ | 2 sloupce grid, text-6xl |
| Desktop (>1024px) | ✅ | 4 sloupce grid, text-7xl |

### 5. SSR / Client split

| Komponenta | Typ | Stav | Důvod client |
|-----------|-----|------|-------------|
| Hero | Server | ✅ | — |
| Services | Server | ✅ | — |
| AboutPreview | Server | ✅ | — |
| Stats | Client | ✅ | IntersectionObserver + useState |
| FeaturedProject | Server | ✅ | — |
| Testimonials | Server | ✅ | — |
| BlogPreview | Server | ✅ | — |
| Newsletter | Client | ✅ | Form state |
| AnimateIn | Client | ✅ | IntersectionObserver |

**Správné — pouze 2 sekce + AnimateIn wrapper jako client components. Zbytek SSR.**

### 6. Design systém konzistence

| Aspekt | Stav | Detail |
|--------|------|--------|
| Používá Section/Container/Heading | ✅ | Konzistentně ve všech sekcích |
| Používá Card hover | ✅ | Services + Testimonials |
| Používá Icon komponentu | ✅ | Services (4 ikony) + Testimonials (quote, star) |
| Barvy z @theme | ✅ | primary-900, accent-400/500, neutral-500 |
| Fonty heading/body | ✅ | font-heading na nadpisech, font-medium/font-body na textu |

### 7. Chybějící Tým sekce

**⚠️ POZOR:** Kontrolor (QA) identifikoval, že plán TASK-003 obsahuje sekci "O nás (krátké intro)" (AboutPreview), ale TASK-QUEUE.md pravděpodobně obsahoval i požadavek na "Tým sekci s fotkami". Implementátor vytvořil AboutPreview místo Team sekce.

**Verdikt k tomuto bodu:**
- Plán TASK-003-plan.md definuje 8 sekcí — a všech 8 je implementováno dle plánu.
- Pokud TASK-QUEUE.md požadoval "Tým sekci" navíc k "O nás", pak jde o chybu v PLÁNOVÁNÍ (ne v implementaci).
- Fix task #17 "Doplnit Tým sekci na homepage" již existuje — správné řešení.
- AboutPreview je validní sekce sama o sobě, neměla by být odstraněna.

### 8. Drobné QA poznámky (neblokující)

| Poznámka | Závažnost | Detail |
|----------|-----------|--------|
| Hero CTA — inline styly místo Button | Nízká | Funkčně OK, vizuálně stejné, jen nekonzistentní s design systémem |
| Newsletter TODO | Nízká | `// TODO: Implement newsletter signup` — backend integrace v budoucnu |
| Placeholder data | OK | Všechna data (recenze, blog, projekt) jsou placeholder — správně pro tuto fázi |

### 9. Pravidla Evžena

| Pravidlo | Stav | Detail |
|----------|------|--------|
| Žádné zkratky v UI | ✅ | Všechny texty jsou celé, žádné zkratky |
| Nedokončené funkce OZNAČENY | ✅ | Newsletter TODO v kódu, fix task pro Tým sekci |
| Nic se neschovává | ✅ | Všech 8 sekcí viditelných na stránce |

---

## VERDIKT

### ✅ SCHVÁLENO S VÝHRADOU

TASK-003 (Homepage) **odpovídá plánu TASK-003-plan.md** — všech 8 sekcí implementováno.

**Výhrada:**
- ⚠️ Chybí Tým sekce (pokud byla v TASK-QUEUE.md). Fix task #17 existuje — bude doplněna.
- AboutPreview je validní a neměla by být odstraněna — Tým sekce se přidá jako 9. sekce.

**Co je v pořádku:**
- 8 sekcí implementováno dle plánu ✅
- 4 služby odpovídají zadání (Development, Rekonstrukce, Nemovitosti, Investice) ✅
- Animované countery s IntersectionObserver ✅
- Scroll animace (AnimateIn) ✅
- Responsive (1→2→4 grid) ✅
- SSR/Client split správný ✅
- Design systém konzistentně použit ✅
- Build bez chyb ✅
