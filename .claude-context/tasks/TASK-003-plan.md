# TASK-003: Hlavní stránka (Homepage)

## Cíl
Vytvořit kompletní hlavní stránku s 8 sekcemi podle struktury OAK Group, ale s brandem Puskin and Partners.

## Závislosti
- TASK-001 (projekt setup)
- TASK-002 (design systém — barvy, fonty, komponenty)

---

## Sekce na stránce (v pořadí)

### 1. Hero sekce
### 2. Služby (4 karty)
### 3. O nás (krátké intro)
### 4. Statistiky (animované countery)
### 5. Featured projekt
### 6. Testimonials (4 recenze)
### 7. Blog (3 nejnovější články)
### 8. Newsletter signup + CTA

---

## Kroky implementace

### Krok 1: Hero sekce (`src/components/sections/Hero.tsx`)

**Struktura:**
- Fullscreen hero (100vh) s overlay na background image
- Nadpis: "Stavíme hodnoty, které přetrvávají" (nebo podobný tagline)
- Podnadpis: Krátký popis firmy
- 2 CTA buttony: "Naše služby" (primary) + "Kontaktujte nás" (outline)
- Scroll-down indikátor (animovaná šipka)

**Design:**
- Tmavý overlay (primary-900 s opacity) přes pozadí
- Bílý text na tmavém pozadí
- Nadpis: Playfair Display, text-5xl md:text-6xl lg:text-7xl
- Animate-in efekt: fade + slide up při načtení stránky

**Kód (kostra):**
```tsx
import { Container, Button } from "@/components/ui";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-primary-900">
      {/* Background image + overlay */}
      <div className="absolute inset-0 bg-[url('/images/hero.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-primary-900/70" />
      </div>
      <Container className="relative z-10 text-white">
        <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold max-w-4xl leading-tight">
          Stavíme hodnoty,{" "}
          <span className="text-accent-400">které přetrvávají</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-neutral-200 max-w-2xl">
          Development, rekonstrukce, realitní služby a investice v Praze.
          Více než 20 let zkušeností s prémiovou kvalitou.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button variant="secondary" size="lg">Naše služby</Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-900">
            Kontaktujte nás
          </Button>
        </div>
      </Container>
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
        </svg>
      </div>
    </section>
  );
}
```

**Placeholder obrázek:** Použít gradient background dokud nebude reálná fotka.

### Krok 2: Služby sekce (`src/components/sections/Services.tsx`)

**Struktura:**
- Heading: "Naše služby" + subtitle
- 4 karty v gridu (1 sloupec mobile, 2 tablet, 4 desktop)
- Každá karta: ikona + název + popis + odkaz "Více informací →"
- Hover efekt: card se zvedne + shadow

**4 služby:**
1. **Development** — ikona: budova — "Komplexní developerské projekty od návrhu po realizaci."
2. **Rekonstrukce** — ikona: kladivo — "Kompletní rekonstrukce bytů a domů na klíč."
3. **Nemovitosti** — ikona: klíč — "Prodej, nákup a správa nemovitostí v Praze."
4. **Investice** — ikona: graf — "Investice do nemovitostí s výnosem až 15% ročně."

**Kód (kostra):**
```tsx
import { Section, Container, Heading, Card } from "@/components/ui";
import Link from "next/link";

const services = [
  {
    title: "Development",
    description: "Komplexní developerské projekty od návrhu po realizaci.",
    href: "/sluzby/development",
    icon: "building",
  },
  {
    title: "Rekonstrukce",
    description: "Kompletní rekonstrukce bytů a domů na klíč.",
    href: "/sluzby/rekonstrukce",
    icon: "hammer",
  },
  {
    title: "Nemovitosti",
    description: "Prodej, nákup a správa nemovitostí v Praze.",
    href: "/sluzby/nemovitosti",
    icon: "key",
  },
  {
    title: "Investice",
    description: "Investice do nemovitostí s výnosem až 15% ročně.",
    href: "/sluzby/investice",
    icon: "chart",
  },
];

export default function Services() {
  return (
    <Section background="light">
      <Container>
        <Heading subtitle="Co pro vás můžeme udělat">Naše služby</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service.title} hover>
              {/* Ikona */}
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                {/* SVG icon */}
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">{service.title}</h3>
              <p className="text-neutral-500 mb-4">{service.description}</p>
              <Link href={service.href} className="text-accent-600 font-medium hover:text-accent-700 transition-colors">
                Více informací &rarr;
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

**Ikony:** Vytvořit jednoduché SVG ikony inline nebo použít heroicons (nenech to na ikonové knihovně — importovat by ji bylo zbytečné). Lepší varianta: vytvořit `src/components/ui/Icon.tsx` s inline SVG pro potřebné ikony.

### Krok 3: O nás sekce (`src/components/sections/AboutPreview.tsx`)

**Struktura:**
- 2 sloupce: text vlevo, obrázek vpravo
- Nadpis: "Více než 20 let na trhu"
- Text: 2 odstavce o firmě
- CTA: "Zjistěte více o nás →" link na /o-nas
- Obrázek: placeholder (tmavý box s textem)

### Krok 4: Statistiky sekce (`src/components/sections/Stats.tsx`)

**Struktura:**
- Tmavé pozadí (primary-900)
- 4 statistiky v řadě
- Animované countery (počítají od 0 do cílové hodnoty)

**Data:**
| Stat | Hodnota | Suffix | Popis |
|------|---------|--------|-------|
| Projekty | 230 | + | Dokončených projektů |
| Klienti | 500 | + | Spokojených klientů |
| Zkušenosti | 20 | let | Let na trhu |
| Tým | 15 | + | Členů týmu |

**Animace:**
- Client component (`"use client"`)
- IntersectionObserver pro trigger
- useEffect + requestAnimationFrame pro counter animaci
- Animace trvá ~2s s ease-out

**Kód (kostra counter hooku):**
```tsx
"use client";
import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}
```

### Krok 5: Featured projekt (`src/components/sections/FeaturedProject.tsx`)

**Struktura:**
- Velký obrázek projektu (placeholder)
- Overlay s informacemi: název, lokalita, status
- CTA: "Zobrazit projekt →"
- Pozadí: light

**Příklad projektu:**
- Název: "Vila Šestajovice"
- Lokalita: "Praha-východ"
- Status: "Dokončeno"
- Popis: "Luxusní rodinná vila s 5 pokoji a zahradou."

### Krok 6: Testimonials sekce (`src/components/sections/Testimonials.tsx`)

**Struktura:**
- Heading: "Co říkají naši klienti"
- 4 recenze v gridu (1 mobile, 2 tablet, 4 desktop)
- Každá recenze: text, jméno, role/popis, hvězdičky (5/5)

**Data (placeholder — bude nahrazeno reálnými):**
```typescript
const testimonials = [
  {
    text: "Profesionální přístup od první schůzky až po předání klíčů. Naprosto bezproblémová spolupráce.",
    name: "Jana Nováková",
    role: "Klientka — rekonstrukce bytu",
    rating: 5,
  },
  {
    text: "Investice do projektu s Puskin & Partners mi přinesla výnos přes 12%. Doporučuji všem investorům.",
    name: "Martin Dvořák",
    role: "Investor",
    rating: 5,
  },
  {
    text: "Rekonstrukce proběhla přesně podle harmonogramu a rozpočtu. Výsledek předčil naše očekávání.",
    name: "Petr Svoboda",
    role: "Klient — rekonstrukce domu",
    rating: 5,
  },
  {
    text: "Díky týmu Puskin & Partners jsme našli ideální byt v centru Prahy za vynikající cenu.",
    name: "Eva Králová",
    role: "Klientka — nákup nemovitosti",
    rating: 5,
  },
];
```

### Krok 7: Blog sekce (`src/components/sections/BlogPreview.tsx`)

**Struktura:**
- Heading: "Z našeho blogu"
- 3 karty (1 mobile, 3 desktop)
- Každá karta: obrázek placeholder, datum, nadpis, excerpt
- CTA: "Všechny články →" link na /blog

**Data (placeholder):**
```typescript
const blogPosts = [
  {
    title: "Jak investovat do nemovitostí v roce 2026",
    excerpt: "Přehled aktuálních trendů a příležitostí na pražském realitním trhu.",
    date: "2026-08-15",
    slug: "jak-investovat-do-nemovitosti-2026",
  },
  {
    title: "5 kroků k úspěšné rekonstrukci",
    excerpt: "Kompletní průvodce rekonstrukcí od plánování po předání hotového projektu.",
    date: "2026-08-01",
    slug: "5-kroku-k-uspesne-rekonstrukci",
  },
  {
    title: "Proč investovat do Prahy?",
    excerpt: "Praha jako jedno z nejatraktivnějších měst pro investice do nemovitostí.",
    date: "2026-07-20",
    slug: "proc-investovat-do-prahy",
  },
];
```

### Krok 8: Newsletter CTA sekce (`src/components/sections/Newsletter.tsx`)

**Struktura:**
- Tmavé pozadí (primary-800)
- Heading: "Zůstaňte v obraze"
- Popis: krátký text o newsletteru
- Email input + submit button
- GDPR checkbox
- Client component pro form handling

### Krok 9: Sestavit Homepage (`src/app/(web)/page.tsx`)

```tsx
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import AboutPreview from "@/components/sections/AboutPreview";
import Stats from "@/components/sections/Stats";
import FeaturedProject from "@/components/sections/FeaturedProject";
import Testimonials from "@/components/sections/Testimonials";
import BlogPreview from "@/components/sections/BlogPreview";
import Newsletter from "@/components/sections/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <AboutPreview />
      <Stats />
      <FeaturedProject />
      <Testimonials />
      <BlogPreview />
      <Newsletter />
    </>
  );
}
```

### Krok 10: Scroll animace (`src/hooks/useScrollAnimation.ts`)

Client-side hook pro fade-in animace při scrollu:

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
```

Wrapper komponenta `src/components/ui/AnimateIn.tsx`:
```tsx
"use client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimateIn({ children, className, delay = 0 }: AnimateInProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
```

---

## Soubory k vytvoření

| # | Soubor | Typ | Popis |
|---|--------|-----|-------|
| 1 | `src/components/sections/Hero.tsx` | Server | Hero sekce s CTA |
| 2 | `src/components/sections/Services.tsx` | Server | 4 karty služeb |
| 3 | `src/components/sections/AboutPreview.tsx` | Server | Krátké intro o firmě |
| 4 | `src/components/sections/Stats.tsx` | Client | Animované countery |
| 5 | `src/components/sections/FeaturedProject.tsx` | Server | Featured projekt |
| 6 | `src/components/sections/Testimonials.tsx` | Server | 4 recenze |
| 7 | `src/components/sections/BlogPreview.tsx` | Server | 3 články |
| 8 | `src/components/sections/Newsletter.tsx` | Client | Email signup form |
| 9 | `src/hooks/useScrollAnimation.ts` | Client | Scroll animation hook |
| 10 | `src/hooks/useCountUp.ts` | Client | Counter animation hook |
| 11 | `src/components/ui/AnimateIn.tsx` | Client | Fade-in wrapper |
| 12 | `src/components/ui/Icon.tsx` | Server | Inline SVG ikony |
| 13 | `src/app/(web)/page.tsx` | Server | Homepage (přepsat placeholder) |

## Responsive breakpoints

| Breakpoint | Layout |
|-----------|--------|
| Mobile (<640px) | 1 sloupec, zmenšené texty, stacked layout |
| Tablet (640-1024px) | 2 sloupce grid, středně velké texty |
| Desktop (>1024px) | 4 sloupce grid, plné velikosti |

## Očekávaný výsledek
- Plně funkční homepage s 8 sekcemi
- Responsive design (mobile, tablet, desktop)
- Scroll-triggered animace (fade-in, counter)
- Konzistentní design systém z TASK-002
- SSR stránka (pouze Stats a Newsletter jako client components)
- Placeholder obrázky a data (budou nahrazena reálnými)
