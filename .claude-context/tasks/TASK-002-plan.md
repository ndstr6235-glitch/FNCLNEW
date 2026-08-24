# TASK-002: Design systém — barvy, fonty, komponenty, logo

## Cíl
Vytvořit kompletní design systém pro Puskin and Partners: barevnou paletu, typografii, textové logo, základní UI komponenty a Tailwind konfiguraci.

## Závislosti
- TASK-001 (projekt musí být inicializovaný)

## Kontext — Odlišení od OAK Group
- OAK Group: hnědá (#855a47) + zelená (#6daf69), Poppins/Lato
- Puskin and Partners: ODLIŠNÝ, ale stejně prémiový — klidný, důvěryhodný, elegantní

---

## Kroky implementace

### Krok 1: Barevná paleta

**Zvolená paleta: Deep Navy + Warm Gold + Soft Neutrals**

Důvod: Navy = důvěra, stabilita, profesionalita. Gold = luxus, prémiovost. Soft neutrals = klid, elegance.
Odlišení od OAK Group: Žádná hnědá ani zelená. Kompletně jiný charakter.

```
Primary (Navy):
  --color-primary-50:  #f0f4f8
  --color-primary-100: #d9e2ec
  --color-primary-200: #bcccdc
  --color-primary-300: #9fb3c8
  --color-primary-400: #829ab1
  --color-primary-500: #627d98
  --color-primary-600: #486581
  --color-primary-700: #334e68
  --color-primary-800: #243b53
  --color-primary-900: #102a43

Accent (Warm Gold):
  --color-accent-50:  #fdf8f0
  --color-accent-100: #f9ecd8
  --color-accent-200: #f0d9b0
  --color-accent-300: #e6c584
  --color-accent-400: #d4a94e
  --color-accent-500: #c49a3c
  --color-accent-600: #a67f2e
  --color-accent-700: #876524
  --color-accent-800: #6b4f1d
  --color-accent-900: #4e3a16

Neutral (Warm Grays):
  --color-neutral-50:  #fafaf9
  --color-neutral-100: #f5f5f4
  --color-neutral-200: #e7e5e4
  --color-neutral-300: #d6d3d1
  --color-neutral-400: #a8a29e
  --color-neutral-500: #78716c
  --color-neutral-600: #57534e
  --color-neutral-700: #44403c
  --color-neutral-800: #292524
  --color-neutral-900: #1c1917

Semantic:
  --color-success: #16a34a
  --color-error:   #dc2626
  --color-warning: #f59e0b
  --color-info:    #3b82f6
```

### Krok 2: Typografie — Google Fonts

**Zvolené fonty:**

| Účel | Font | Váhy | Důvod |
|------|------|------|-------|
| **Nadpisy** | **Playfair Display** | 400, 500, 600, 700 | Elegantní serif, luxusní charakter, dokonalý pro real estate |
| **Tělo** | **Inter** | 300, 400, 500, 600 | Čistý, moderní sans-serif, výborná čitelnost |

**Implementace v `src/app/layout.tsx`:**
```tsx
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});
```

Na `<body>` přidat: `className={`${playfair.variable} ${inter.variable} font-body`}`

### Krok 3: Tailwind CSS v4 Theme (`src/app/globals.css`)

```css
@import "tailwindcss";

@theme {
  /* Primary — Deep Navy */
  --color-primary-50:  #f0f4f8;
  --color-primary-100: #d9e2ec;
  --color-primary-200: #bcccdc;
  --color-primary-300: #9fb3c8;
  --color-primary-400: #829ab1;
  --color-primary-500: #627d98;
  --color-primary-600: #486581;
  --color-primary-700: #334e68;
  --color-primary-800: #243b53;
  --color-primary-900: #102a43;

  /* Accent — Warm Gold */
  --color-accent-50:  #fdf8f0;
  --color-accent-100: #f9ecd8;
  --color-accent-200: #f0d9b0;
  --color-accent-300: #e6c584;
  --color-accent-400: #d4a94e;
  --color-accent-500: #c49a3c;
  --color-accent-600: #a67f2e;
  --color-accent-700: #876524;
  --color-accent-800: #6b4f1d;
  --color-accent-900: #4e3a16;

  /* Neutral — Warm Stone */
  --color-neutral-50:  #fafaf9;
  --color-neutral-100: #f5f5f4;
  --color-neutral-200: #e7e5e4;
  --color-neutral-300: #d6d3d1;
  --color-neutral-400: #a8a29e;
  --color-neutral-500: #78716c;
  --color-neutral-600: #57534e;
  --color-neutral-700: #44403c;
  --color-neutral-800: #292524;
  --color-neutral-900: #1c1917;

  /* Semantic */
  --color-success: #16a34a;
  --color-error:   #dc2626;
  --color-warning: #f59e0b;
  --color-info:    #3b82f6;

  /* Typography */
  --font-heading: var(--font-playfair-display), Georgia, serif;
  --font-body:    var(--font-inter), system-ui, sans-serif;

  /* Spacing scale (extends default) */
  --spacing-18: 4.5rem;
  --spacing-22: 5.5rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;

  /* Shadows */
  --shadow-soft: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-elevated: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* Base styles */
html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  color: var(--color-neutral-800);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-primary-900);
}

/* Selection color */
::selection {
  background-color: var(--color-accent-200);
  color: var(--color-primary-900);
}
```

### Krok 4: Textové Logo

Logo bude realizováno jako React komponenta s textem "Puskin and Partners":

**`src/components/ui/Logo.tsx`:**
```tsx
import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export default function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const colorClasses = {
    dark: "text-primary-900",
    light: "text-white",
  };

  return (
    <Link href="/" className={`font-heading font-bold tracking-tight ${sizeClasses[size]} ${colorClasses[variant]}`}>
      Puskin <span className="text-accent-500">&</span> Partners
    </Link>
  );
}
```

**Varianty:**
- `dark` — tmavé logo na světlém pozadí (primary-900 text + gold "&")
- `light` — světlé logo na tmavém pozadí (bílý text + gold "&")
- Velikosti: `sm` (nav mobile), `md` (nav desktop), `lg` (footer/hero)

### Krok 5: Základní UI komponenty

#### 5a: Button (`src/components/ui/Button.tsx`)

```tsx
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-body font-medium transition-all duration-200 rounded-md",
          // Variants
          variant === "primary" && "bg-primary-800 text-white hover:bg-primary-900 active:bg-primary-700",
          variant === "secondary" && "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-400",
          variant === "outline" && "border-2 border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-white",
          variant === "ghost" && "text-primary-800 hover:bg-primary-50",
          // Sizes
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base",
          size === "lg" && "px-8 py-4 text-lg",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
```

#### 5b: Card (`src/components/ui/Card.tsx`)

```tsx
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-6 shadow-card",
        hover && "transition-all duration-300 hover:shadow-elevated hover:-translate-y-1",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

#### 5c: Section (`src/components/ui/Section.tsx`)

```tsx
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "light" | "dark" | "primary";
}

export default function Section({ children, className, background = "white" }: SectionProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-24",
        background === "white" && "bg-white",
        background === "light" && "bg-neutral-50",
        background === "dark" && "bg-primary-900 text-white",
        background === "primary" && "bg-primary-800 text-white",
        className,
      )}
    >
      {children}
    </section>
  );
}
```

#### 5d: Container (`src/components/ui/Container.tsx`)

```tsx
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Container({ children, className, size = "lg" }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        size === "sm" && "max-w-3xl",
        size === "md" && "max-w-5xl",
        size === "lg" && "max-w-7xl",
        size === "xl" && "max-w-[1400px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

#### 5e: Heading (`src/components/ui/Heading.tsx`)

```tsx
import { cn } from "@/lib/utils";

interface HeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  subtitle?: string;
}

export default function Heading({
  children,
  as: Tag = "h2",
  size = "lg",
  className,
  subtitle,
}: HeadingProps) {
  return (
    <div className="mb-8 md:mb-12">
      <Tag
        className={cn(
          "font-heading font-bold text-primary-900",
          size === "sm" && "text-xl md:text-2xl",
          size === "md" && "text-2xl md:text-3xl",
          size === "lg" && "text-3xl md:text-4xl",
          size === "xl" && "text-4xl md:text-5xl",
          size === "2xl" && "text-5xl md:text-6xl lg:text-7xl",
          className,
        )}
      >
        {children}
      </Tag>
      {subtitle && (
        <p className="mt-4 text-lg text-neutral-500 max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}
```

### Krok 6: Aktualizovat Header a Footer s designem

Aktualizovat `Header.tsx` a `Footer.tsx` z TASK-001 — použít Logo komponentu, design systém barvy, správné fonty. Přidat dropdown menu pro Služby v navigaci.

### Krok 7: Vytvořit `src/components/ui/index.ts` barrel export

```tsx
export { default as Button } from "./Button";
export { default as Card } from "./Card";
export { default as Container } from "./Container";
export { default as Heading } from "./Heading";
export { default as Logo } from "./Logo";
export { default as Section } from "./Section";
```

---

## Soubory k vytvoření/upravit

| # | Soubor | Akce | Popis |
|---|--------|------|-------|
| 1 | `src/app/globals.css` | UPRAVIT | Přidat kompletní @theme s barvami, fonty, shadows |
| 2 | `src/app/layout.tsx` | UPRAVIT | Přidat Google Fonts (Playfair Display + Inter) |
| 3 | `src/components/ui/Logo.tsx` | VYTVOŘIT | Textové logo |
| 4 | `src/components/ui/Button.tsx` | VYTVOŘIT | Button s 4 variantami |
| 5 | `src/components/ui/Card.tsx` | VYTVOŘIT | Card s hover efektem |
| 6 | `src/components/ui/Section.tsx` | VYTVOŘIT | Section s 4 pozadími |
| 7 | `src/components/ui/Container.tsx` | VYTVOŘIT | Container s 4 velikostmi |
| 8 | `src/components/ui/Heading.tsx` | VYTVOŘIT | Heading s subtitle |
| 9 | `src/components/ui/index.ts` | VYTVOŘIT | Barrel export |
| 10 | `src/components/layout/Header.tsx` | UPRAVIT | Použít Logo, design, dropdown |
| 11 | `src/components/layout/Footer.tsx` | UPRAVIT | Použít Logo, design barvy |

## Očekávaný výsledek
- Konzistentní design systém s Navy+Gold paletou
- Playfair Display pro nadpisy, Inter pro tělo
- Textové logo "Puskin & Partners" se zlatým "&"
- 5 základních UI komponent (Button, Card, Section, Container, Heading)
- Tailwind CSS v4 @theme s kompletní konfigurací
- Header s dropdown navigací a Footer s novým designem
- Vizuálně odlišený od OAK Group (žádná hnědá/zelená)
