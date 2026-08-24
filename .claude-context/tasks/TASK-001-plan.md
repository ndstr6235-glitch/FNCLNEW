# TASK-001: Projekt setup — Next.js App Router + základní struktura

## Cíl
Inicializovat Next.js 15 projekt s App Routerem, TypeScriptem, Tailwind CSS 4 a SSR. Vytvořit strukturu pro dva celky: veřejný web a CRM (placeholder).

## Závislosti
- Žádné (první task)

## Prerekvizity
- Node.js 20+ nainstalovaný
- npm/pnpm dostupný

---

## Kroky implementace

### Krok 1: Inicializace Next.js projektu
```bash
cd /Users/zen/puskin-partners
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm
```

**Poznámka:** Použít `--use-npm` pro konzistenci. Pokud adresář není prázdný, přesunout TASK-QUEUE.md a TASK-LOG.md dočasně stranou, pak vrátit.

### Krok 2: Struktura adresářů

Vytvořit následující adresářovou strukturu:

```
/Users/zen/puskin-partners/
├── src/
│   ├── app/
│   │   ├── (web)/                    # Route group — veřejný web
│   │   │   ├── layout.tsx            # Web layout (header + footer)
│   │   │   ├── page.tsx              # Homepage (/)
│   │   │   ├── o-nas/
│   │   │   │   └── page.tsx          # /o-nas
│   │   │   ├── sluzby/
│   │   │   │   ├── development/
│   │   │   │   │   └── page.tsx      # /sluzby/development
│   │   │   │   ├── rekonstrukce/
│   │   │   │   │   └── page.tsx      # /sluzby/rekonstrukce
│   │   │   │   ├── nemovitosti/
│   │   │   │   │   └── page.tsx      # /sluzby/nemovitosti
│   │   │   │   └── investice/
│   │   │   │       └── page.tsx      # /sluzby/investice
│   │   │   ├── reference/
│   │   │   │   └── page.tsx          # /reference
│   │   │   ├── kariera/
│   │   │   │   └── page.tsx          # /kariera
│   │   │   ├── blog/
│   │   │   │   └── page.tsx          # /blog
│   │   │   └── kontakt/
│   │   │       └── page.tsx          # /kontakt
│   │   │
│   │   ├── (crm)/                    # Route group — CRM (fáze 2)
│   │   │   ├── layout.tsx            # CRM layout (placeholder)
│   │   │   └── dashboard/
│   │   │       └── page.tsx          # /dashboard (placeholder)
│   │   │
│   │   ├── layout.tsx                # Root layout (html, body, fonty, metadata)
│   │   ├── globals.css               # Globální styly + Tailwind directives
│   │   └── not-found.tsx             # Custom 404 stránka
│   │
│   ├── components/                   # Sdílené komponenty
│   │   ├── ui/                       # Základní UI komponenty (Button, Card, etc.)
│   │   ├── layout/                   # Header, Footer, Navigation
│   │   └── sections/                 # Sekce stránek (Hero, Stats, etc.)
│   │
│   ├── lib/                          # Utility funkce
│   │   └── utils.ts                  # Helper funkce (cn, formatPrice, etc.)
│   │
│   ├── data/                         # Statická data
│   │   └── site.ts                   # Kontaktní info, metadata, navigace
│   │
│   └── types/                        # TypeScript typy
│       └── index.ts                  # Sdílené typy
│
├── public/                           # Statické soubory
│   ├── images/                       # Obrázky
│   │   ├── team/                     # Fotky týmu
│   │   ├── projects/                 # Fotky projektů
│   │   └── logo/                     # Logo soubory
│   └── fonts/                        # Lokální fonty (pokud potřeba)
│
├── .claude-context/                  # Task plány (již existuje)
│   ├── tasks/
│   └── checklists/
│
├── TASK-QUEUE.md
├── TASK-LOG.md
├── next.config.ts                    # Next.js konfigurace
├── tsconfig.json                     # TypeScript konfigurace
├── postcss.config.mjs                # PostCSS (Tailwind)
├── .eslintrc.json                    # ESLint konfigurace
├── .prettierrc                       # Prettier konfigurace
├── .gitignore
└── package.json
```

### Krok 3: Root Layout (`src/app/layout.tsx`)

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Puskin and Partners | Development, Rekonstrukce, Reality, Investice",
    template: "%s | Puskin and Partners",
  },
  description:
    "Puskin and Partners — prémiový development, rekonstrukce, realitní služby a investice v Praze. 20+ let zkušeností.",
  metadataBase: new URL("https://puskinandpartners.cz"),
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    siteName: "Puskin and Partners",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
```

### Krok 4: Web Layout (`src/app/(web)/layout.tsx`)

```tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

### Krok 5: CRM Placeholder Layout (`src/app/(crm)/layout.tsx`)

```tsx
export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">CRM — Fáze 2</h1>
        <p className="text-gray-500 mt-2">Tato sekce bude dostupná v budoucí verzi.</p>
      </div>
      {children}
    </div>
  );
}
```

### Krok 6: Globals CSS (`src/app/globals.css`)

```css
@import "tailwindcss";

/* Tailwind CSS v4 — CSS-first konfigurace */
/* Custom theme bude přidán v TASK-002 */

@theme {
  /* Barvy — placeholder, definitivní v TASK-002 */
  --color-primary: #1a365d;
  --color-primary-light: #2a4a7f;
  --color-primary-dark: #0f2440;
  --color-accent: #c9a96e;
  --color-accent-light: #d4b98a;

  /* Fonty — placeholder, definitivní v TASK-002 */
  --font-heading: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
}

/* Globální reset a base styly */
html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Krok 7: Placeholder stránky

Každá stránka v `(web)/` bude mít jednoduchý placeholder:

```tsx
// Příklad: src/app/(web)/page.tsx
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold">Puskin and Partners</h1>
      <p className="text-gray-600 mt-4">Homepage — bude implementováno v TASK-003</p>
    </div>
  );
}
```

Podobně pro všechny podstránky s odkazem na příslušný task.

### Krok 8: Site Data (`src/data/site.ts`)

```typescript
export const siteConfig = {
  name: "Puskin and Partners",
  company: {
    legalName: "Alexandr Puškin, s.r.o.",
    ico: "26740788",
    dic: "CZ26740788",
    address: {
      street: "Rybná 716/24",
      city: "Praha 1",
      zip: "110 00",
      country: "Česká republika",
    },
  },
  contact: {
    email: "info@apartmentspushkin.com",
    phone: "+420 222 244 889",
    hours: "Po–Pá 09:00–18:00",
  },
  owner: "Lukáš Salamánek",
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
  },
  navigation: {
    main: [
      { label: "O nás", href: "/o-nas" },
      {
        label: "Služby",
        href: "#",
        children: [
          { label: "Development", href: "/sluzby/development" },
          { label: "Rekonstrukce", href: "/sluzby/rekonstrukce" },
          { label: "Nemovitosti", href: "/sluzby/nemovitosti" },
          { label: "Investice", href: "/sluzby/investice" },
        ],
      },
      { label: "Reference", href: "/reference" },
      { label: "Kariéra", href: "/kariera" },
      { label: "Blog", href: "/blog" },
      { label: "Kontakt", href: "/kontakt" },
    ],
  },
} as const;
```

### Krok 9: Utility funkce (`src/lib/utils.ts`)

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
  }).format(price);
}
```

### Krok 10: Doinstalovat závislosti

```bash
cd /Users/zen/puskin-partners
npm install clsx tailwind-merge
```

### Krok 11: Prettier konfigurace (`.prettierrc`)

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": false,
  "tabWidth": 2,
  "printWidth": 100
}
```

### Krok 12: Next.js konfigurace (`next.config.ts`)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
```

### Krok 13: Placeholder Header a Footer

Vytvořit minimální `src/components/layout/Header.tsx` a `src/components/layout/Footer.tsx`:

**Header.tsx:**
```tsx
import Link from "next/link";
import { siteConfig } from "@/data/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          {siteConfig.name}
        </Link>
        <div className="hidden md:flex gap-6">
          {siteConfig.navigation.main.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm hover:text-primary">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
```

**Footer.tsx:**
```tsx
import { siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-lg font-bold">{siteConfig.name}</p>
          <p className="text-sm text-gray-400 mt-2">
            {siteConfig.company.legalName} | IČO: {siteConfig.company.ico}
          </p>
          <p className="text-sm text-gray-400">
            {siteConfig.company.address.street}, {siteConfig.company.address.zip}{" "}
            {siteConfig.company.address.city}
          </p>
          <p className="text-sm text-gray-400 mt-4">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

### Krok 14: Git init a první commit

```bash
cd /Users/zen/puskin-partners
git init
git add .
git commit -m "Initial project setup: Next.js 15 + TypeScript + Tailwind CSS 4 + App Router"
```

### Krok 15: Ověření

```bash
cd /Users/zen/puskin-partners
npm run dev
# Ověřit: localhost:3000 zobrazí homepage placeholder
# Ověřit: localhost:3000/kontakt zobrazí kontakt placeholder
# Ověřit: localhost:3000/dashboard zobrazí CRM placeholder
```

---

## Soubory k vytvoření (kompletní seznam)

| # | Soubor | Popis |
|---|--------|-------|
| 1 | `src/app/layout.tsx` | Root layout (přepsat default) |
| 2 | `src/app/globals.css` | Globální styly (přepsat default) |
| 3 | `src/app/not-found.tsx` | Custom 404 |
| 4 | `src/app/(web)/layout.tsx` | Web layout s header/footer |
| 5 | `src/app/(web)/page.tsx` | Homepage placeholder |
| 6 | `src/app/(web)/o-nas/page.tsx` | O nás placeholder |
| 7 | `src/app/(web)/sluzby/development/page.tsx` | Development placeholder |
| 8 | `src/app/(web)/sluzby/rekonstrukce/page.tsx` | Rekonstrukce placeholder |
| 9 | `src/app/(web)/sluzby/nemovitosti/page.tsx` | Nemovitosti placeholder |
| 10 | `src/app/(web)/sluzby/investice/page.tsx` | Investice placeholder |
| 11 | `src/app/(web)/reference/page.tsx` | Reference placeholder |
| 12 | `src/app/(web)/kariera/page.tsx` | Kariéra placeholder |
| 13 | `src/app/(web)/blog/page.tsx` | Blog placeholder |
| 14 | `src/app/(web)/kontakt/page.tsx` | Kontakt placeholder |
| 15 | `src/app/(crm)/layout.tsx` | CRM layout placeholder |
| 16 | `src/app/(crm)/dashboard/page.tsx` | CRM dashboard placeholder |
| 17 | `src/components/layout/Header.tsx` | Header s navigací |
| 18 | `src/components/layout/Footer.tsx` | Footer |
| 19 | `src/data/site.ts` | Konfigurace webu |
| 20 | `src/lib/utils.ts` | Utility funkce |
| 21 | `src/types/index.ts` | TypeScript typy |
| 22 | `.prettierrc` | Prettier konfigurace |

## Závislosti k instalaci

```bash
npm install clsx tailwind-merge
```

## Očekávaný výsledek
- Funkční Next.js 15 projekt na `localhost:3000`
- Route groups `(web)` a `(crm)` správně oddělené
- Všechny URL z navigace zobrazí placeholder stránky
- Header a Footer se zobrazí na všech webových stránkách
- CRM má vlastní layout bez header/footer
- Git repozitář inicializovaný s prvním commitem
- Tailwind CSS 4 funguje s CSS-first konfigurací
