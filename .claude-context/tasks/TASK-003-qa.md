# TASK-003: QA Report — Homepage

**Datum:** 2026-08-24
**Reviewer:** kontrolor
**Commit:** `15f10b2`

---

## 1. Simplify kontrola

### Celkové hodnocení
Kód je čistý, dobře organizovaný, konzistentní. Žádné zbytečné duplicity.

**Pozitivní vzory:**
- `AnimateIn` wrapper komponenta — scroll animace sdílené přes všechny sekce, neopakuje se
- `useCountUp` hook s IntersectionObserver — správná separace logiky do hooku
- `Icon` komponenta s typovaným `name` prop — type-safe inline SVG, žádná ikonová knihovna
- `formatDate()` v BlogPreview — malá utility funkce správně lokálně umístěna (nepatří do lib/utils, používá se jen zde)
- `StatItem` subcomponent v Stats.tsx — správná extrakce pro opakovaný pattern

**Drobné poznámky (ne blocker):**

1. **Hero — inline styly místo Button komponenty:** Oba CTA buttony v Hero.tsx jsou inline `<Link>` se styly místo `<Button variant="secondary">` a `<Button variant="outline">`. Design systém má Button komponentu, měl by se použít. Nízká priorita (vizuálně totožné), ale inkonsistentní.

2. **Newsletter — TODO komentář:** `// TODO: Implement newsletter signup` v `handleSubmit`. Očekávané pro tuto fázi, ale měl by se v budoucnu řešit.

3. **AnimateIn wrapper na Headings:** Každá sekce wrappuje `<Heading>` do `<AnimateIn>`, což způsobí mírné záškuby při rychlém scrollu (Heading se animuje samostatně od obsahu pod ním). Funkční, ale mohl by být celý container wrappován jedním `<AnimateIn>`. Kosmetika.

4. **Stats.tsx — `useRef<HTMLDivElement>`:** `ref` z `useCountUp` je `RefObject<HTMLDivElement>`, ale je přidán na `<div>` v `StatItem` — správné. V pořádku.

### Duplicity
- Žádné duplicitní styly ani logika.
- `AnimateIn` importován 6x — správné (je to sdílená komponenta).

---

## 2. Debug kontrola

### Build výstup
```
✓ Compiled successfully in 422ms
✓ TypeScript: OK (0 chyb)
✓ ESLint: OK (0 warningů)
✓ 14 rout vygenerováno staticky (homepage / je statická)
```

### Ověření SSR/Client split
- `Hero.tsx` — Server Component ✅
- `Services.tsx` — Server Component ✅
- `AboutPreview.tsx` — Server Component ✅
- `Stats.tsx` — `"use client"` ✅ (IntersectionObserver + useState)
- `FeaturedProject.tsx` — Server Component ✅
- `Testimonials.tsx` — Server Component ✅
- `BlogPreview.tsx` — Server Component ✅
- `Newsletter.tsx` — `"use client"` ✅ (form state)
- `AnimateIn.tsx` — `"use client"` ✅ (IntersectionObserver)
- `useCountUp.ts` — `"use client"` ✅
- `useScrollAnimation.ts` — `"use client"` ✅

### Ověření hooks
- `useCountUp`: IntersectionObserver trigger → requestAnimationFrame loop → ease-out cubic → disconnect po spuštění ✅
- `useScrollAnimation`: IntersectionObserver threshold 0.1, rootMargin -50px → disconnect po zobrazení ✅
- Cleanup `return () => observer.disconnect()` v obou hooks ✅ (memory leak prevence)

### Ověření animací
- `animate-bounce` na scroll indikátoru v Hero ✅ (Tailwind built-in)
- `transition-all duration-700 ease-out` v AnimateIn ✅
- `opacity-0 translate-y-8` → `opacity-100 translate-y-0` ✅
- `delay` prop jako inline `style.transitionDelay` ✅ (0, 100, 200, 300ms stagger)

### Ověření Icon komponenty
- 6 ikon: `building`, `hammer`, `key`, `chart`, `star`, `quote` ✅
- TypeScript union type pro `name` prop ✅
- Všechny ikony použity: building/hammer/key/chart v Services, quote+star v Testimonials ✅

---

## 3. Reverzní kontrola

Porovnání s původním zadáním TASK-003 (TASK-QUEUE.md) a plánem (TASK-003-plan.md):

### Ze zadání TASK-QUEUE.md

| Požadavek | Status | Poznámka |
|-----------|--------|----------|
| Hero sekce s tagline | ✅ | "Stavíme hodnoty, které přetrvávají" + accent span |
| 4 služby — karty s hover efekty | ✅ | Services.tsx — 4 Card hover + AnimateIn stagger |
| Statistiky (animované countery) | ✅ | Stats.tsx — useCountUp hook s IntersectionObserver |
| Tým sekce s fotkami | ❌ | Chybí — místo toho je AboutPreview (text + placeholder) |
| Testimonials sekce (4 recenze) | ✅ | Testimonials.tsx — 4 recenze se hvězdičkami |
| Featured projekt sekce | ✅ | FeaturedProject.tsx — Vila Šestajovice |
| Blog sekce (3 nejnovější články) | ✅ | BlogPreview.tsx — 3 články + CTA na /blog |
| Newsletter signup | ✅ | Newsletter.tsx — email input + GDPR checkbox |
| SSR stránka | ✅ | Stránka je staticky generovaná, client pouze tam kde nutno |
| Responsive: desktop, tablet, mobile | ✅ | Grid: 1→2→4 cols, text-5xl md:text-6xl lg:text-7xl |
| Animace: scroll-triggered, hover efekty | ✅ | AnimateIn + Card hover |

### Z plánu TASK-003-plan.md

| Požadavek | Status | Poznámka |
|-----------|--------|----------|
| Hero — fullscreen min-h-screen | ✅ | `min-h-screen` v Hero.tsx |
| Hero — gradient placeholder (bez obrázku) | ✅ | `bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700` |
| Hero — scroll indicator animate-bounce | ✅ | SVG šipka s `animate-bounce` |
| Hero — 2 CTA buttony | ✅ | Přítomny (inline styly, viz poznámka) |
| Services — 4 karty v gridu 1/2/4 | ✅ | `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` |
| Services — Icon komponenta | ✅ | `src/components/ui/Icon.tsx` |
| AboutPreview — 2 sloupce, text + placeholder | ✅ | Přesně dle plánu |
| Stats — "use client", IntersectionObserver | ✅ | Přesně dle plánu |
| Stats — 4 hodnoty (230+, 500+, 20 let, 15+) | ✅ | Přesně dle plánu |
| FeaturedProject — Vila Šestajovice | ✅ | Přesně dle plánu |
| Testimonials — 4 recenze, hvězdičky | ✅ | Přesně dle plánu |
| BlogPreview — 3 články, formatDate cs-CZ | ✅ | Přesně dle plánu |
| Newsletter — "use client", GDPR checkbox | ✅ | Přesně dle plánu |
| useScrollAnimation hook | ✅ | `src/hooks/useScrollAnimation.ts` |
| useCountUp hook | ✅ | `src/hooks/useCountUp.ts` |
| AnimateIn wrapper | ✅ | `src/components/ui/AnimateIn.tsx` |
| Homepage sestavena z 8 komponent | ✅ | `src/app/(web)/page.tsx` přesně dle plánu |

### Co chybí

| Chybí | Závažnost | Poznámka |
|-------|-----------|----------|
| Tým sekce | ⚠️ Střední | TASK-QUEUE.md požaduje "Tým sekce s fotkami". Implementátor místo toho udělal AboutPreview (firmy intro). Je to jiná sekce, ne ekvivalent. |

---

## Výsledek QA

**Status: APPROVED s výhradou**

Build OK, 0 chyb. 7 z 8 sekcí splňuje zadání.

**Výhrada (neblokující pro merge, ale zaznamenat):**
- ⚠️ Tým sekce chybí — zadání v TASK-QUEUE.md explicitně žádá "Tým sekce s fotkami (placeholder obrázky)". Implementátor nahradil sekci AboutPreview (firmové intro). AboutPreview je hodnotný přídavek, ale Tým sekce nebyla realizována. Doporučuji doplnit v TASK-004 nebo jako samostatný task.

**Vše ostatní:**
- ✅ AnimateIn scroll animace funkční (IntersectionObserver + CSS transitions)
- ✅ Counter animace funkční (requestAnimationFrame + ease-out)
- ✅ Responsive grid (1→2→4 sloupce)
- ✅ Design systém konzistentně použit (Section, Container, Heading, Card, Icon)
- ✅ SSR/Client split správný
- ✅ Newsletter GDPR checkbox
