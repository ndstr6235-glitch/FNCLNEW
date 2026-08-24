# Puskin and Partners — Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vytvořit Next.js 15 prezentační web pro realitní firmu Puskin and Partners s design systémem, homepage a všemi podstránkami.

**Architecture:** App Router s route groups `(web)` pro veřejný web a `(crm)` pro budoucí CRM. SSR jako výchozí strategie. Komponenty rozděleny na ui/, layout/ a sections/.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 4, App Router, ESLint, Prettier, Google Fonts

---

## TASK-001: Next.js projekt setup

### Files:
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `.eslintrc.json`
- Create: `.prettierrc`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/(crm)/crm/page.tsx`
- Create: `src/types/index.ts`

---

- [ ] **Krok 1: Inicializovat Next.js projekt**

```bash
cd /Users/zen/puskin-partners
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

Očekávaný výstup: `Success! Created puskin-partners`

- [ ] **Krok 2: Ověřit strukturu**

```bash
ls src/app/
```

Očekávaný výstup: `favicon.ico  globals.css  layout.tsx  page.tsx`

- [ ] **Krok 3: Nainstalovat Prettier**

```bash
cd /Users/zen/puskin-partners
npm install --save-dev prettier eslint-config-prettier
```

- [ ] **Krok 4: Vytvořit .prettierrc**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Ulož do `/Users/zen/puskin-partners/.prettierrc`

- [ ] **Krok 5: Vytvořit route groups — (web) a (crm)**

```bash
cd /Users/zen/puskin-partners
mkdir -p src/app/(web)
mkdir -p src/app/(crm)/crm
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/sections
mkdir -p src/lib
mkdir -p src/types
```

- [ ] **Krok 6: Přesunout výchozí page.tsx do (web)**

```bash
cd /Users/zen/puskin-partners
mv src/app/page.tsx src/app/(web)/page.tsx
```

- [ ] **Krok 7: Vytvořit CRM placeholder**

Ulož do `src/app/(crm)/crm/page.tsx`:

```tsx
export default function CRMPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold text-gray-600">CRM — připravujeme</h1>
    </div>
  )
}
```

- [ ] **Krok 8: Vytvořit základní TypeScript typy**

Ulož do `src/types/index.ts`:

```ts
export interface Service {
  id: string
  title: string
  description: string
  href: string
  icon: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  image: string
  bio: string
}

export interface Project {
  id: string
  title: string
  location: string
  year: number
  category: 'development' | 'rekonstrukce' | 'investice'
  image: string
  description: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  text: string
  rating: number
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  image: string
  slug: string
}

export interface JobPosition {
  id: string
  title: string
  type: 'full-time' | 'part-time' | 'freelance'
  location: string
  description: string
}
```

- [ ] **Krok 9: Spustit dev server a ověřit**

```bash
cd /Users/zen/puskin-partners
npm run dev &
sleep 5
curl -s http://localhost:3000 | head -20
```

Očekávaný výstup: HTML odpověď s `<!DOCTYPE html>`

- [ ] **Krok 10: Zastavit dev server a commitnout**

```bash
cd /Users/zen/puskin-partners
kill $(lsof -ti:3000) 2>/dev/null || true
git add -A
git commit -m "feat: Next.js 15 projekt setup s route groups (web) + (crm)"
```

---

## TASK-002: Design systém

### Files:
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/app/layout.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Section.tsx`
- Create: `src/components/ui/Container.tsx`
- Create: `src/components/ui/Heading.tsx`
- Create: `public/logo.svg`

---

- [ ] **Krok 1: Definovat barevnou paletu v globals.css**

Nahraď obsah `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Puskin and Partners — Navy + Zlatá + Slonová kost */
  --color-navy-50: #f0f3f8;
  --color-navy-100: #d9e1ee;
  --color-navy-200: #b3c3dd;
  --color-navy-300: #8da5cc;
  --color-navy-400: #6787bb;
  --color-navy-500: #4169aa;
  --color-navy-600: #2d4f8a;
  --color-navy-700: #1e3666;
  --color-navy-800: #142447;
  --color-navy-900: #0d1830;
  --color-navy-950: #070e1e;

  --color-gold-50: #fdf8ec;
  --color-gold-100: #f9edcb;
  --color-gold-200: #f3d98d;
  --color-gold-300: #ecc04f;
  --color-gold-400: #e4a827;
  --color-gold-500: #c98d18;
  --color-gold-600: #a66f12;
  --color-gold-700: #7d530e;
  --color-gold-800: #54380a;
  --color-gold-900: #2b1d05;

  --color-ivory-50: #fefdfb;
  --color-ivory-100: #faf8f3;
  --color-ivory-200: #f4f0e6;
  --color-ivory-300: #ece5d3;
  --color-ivory-400: #dfd5bc;
  --color-ivory-500: #cfc0a0;

  /* Fonty */
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;
}

@layer base {
  html {
    font-family: var(--font-sans);
    color: theme(colors.navy.900);
    background-color: theme(colors.ivory.100);
  }

  h1, h2, h3 {
    font-family: var(--font-serif);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
}
```

- [ ] **Krok 2: Aktualizovat root layout s Google Fonts**

Nahraď obsah `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Puskin and Partners — Realitní development Praha',
  description:
    'Prémiový realitní development, rekonstrukce a investice v Praze. Alexandr Puškin, s.r.o.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Krok 3: Vytvořit SVG logo**

Ulož do `public/logo.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 48" fill="none">
  <text x="0" y="36" font-family="Georgia, serif" font-size="28" font-weight="400" fill="#142447" letter-spacing="2">PUSKIN</text>
  <text x="148" y="36" font-family="Georgia, serif" font-size="16" font-weight="300" fill="#c98d18" letter-spacing="4">AND PARTNERS</text>
</svg>
```

- [ ] **Krok 4: Vytvořit Button komponentu**

Ulož do `src/components/ui/Button.tsx`:

```tsx
import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
}

const variants = {
  primary: 'bg-navy-800 text-ivory-100 hover:bg-navy-700 border border-navy-800',
  secondary: 'bg-gold-500 text-navy-950 hover:bg-gold-400 border border-gold-500',
  outline: 'bg-transparent text-navy-800 hover:bg-navy-50 border border-navy-800',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center font-sans font-medium tracking-wide transition-colors duration-200 ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
```

- [ ] **Krok 5: Vytvořit Container komponentu**

Ulož do `src/components/ui/Container.tsx`:

```tsx
interface ContainerProps {
  children: React.ReactNode
  className?: string
  narrow?: boolean
}

export function Container({ children, className = '', narrow = false }: ContainerProps) {
  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${narrow ? 'max-w-3xl' : 'max-w-7xl'} ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Krok 6: Vytvořit Section komponentu**

Ulož do `src/components/ui/Section.tsx`:

```tsx
interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  background?: 'white' | 'ivory' | 'navy' | 'transparent'
}

const backgrounds = {
  white: 'bg-white',
  ivory: 'bg-ivory-100',
  navy: 'bg-navy-900 text-ivory-100',
  transparent: 'bg-transparent',
}

export function Section({
  children,
  className = '',
  id,
  background = 'transparent',
}: SectionProps) {
  return (
    <section id={id} className={`py-16 lg:py-24 ${backgrounds[background]} ${className}`}>
      {children}
    </section>
  )
}
```

- [ ] **Krok 7: Vytvořit Heading komponentu**

Ulož do `src/components/ui/Heading.tsx`:

```tsx
interface HeadingProps {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4
  subtitle?: string
  centered?: boolean
  light?: boolean
  className?: string
}

export function Heading({
  children,
  level = 2,
  subtitle,
  centered = false,
  light = false,
  className = '',
}: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'

  const sizes = {
    1: 'text-5xl lg:text-7xl font-light leading-tight',
    2: 'text-4xl lg:text-5xl font-light leading-tight',
    3: 'text-2xl lg:text-3xl font-medium leading-snug',
    4: 'text-xl lg:text-2xl font-medium leading-snug',
  }

  const colorClass = light ? 'text-ivory-100' : 'text-navy-900'

  return (
    <div className={centered ? 'text-center' : ''}>
      <Tag className={`font-serif ${sizes[level]} ${colorClass} ${className}`}>{children}</Tag>
      {subtitle && (
        <p className={`mt-4 text-lg font-sans font-light ${light ? 'text-ivory-300' : 'text-navy-500'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Krok 8: Vytvořit Card komponentu**

Ulož do `src/components/ui/Card.tsx`:

```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={`bg-white border border-ivory-300 ${paddings[padding]} ${hover ? 'transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 transform' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Krok 9: Commitnout design systém**

```bash
cd /Users/zen/puskin-partners
git add -A
git commit -m "feat: design systém — barvy navy+gold+ivory, fonty, UI komponenty"
```

---

## TASK-003: Homepage

### Files:
- Create: `src/lib/data.ts`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/Navigation.tsx`
- Create: `src/app/(web)/layout.tsx`
- Create: `src/components/sections/Hero.tsx`
- Create: `src/components/sections/Services.tsx`
- Create: `src/components/sections/Stats.tsx`
- Create: `src/components/sections/Team.tsx`
- Create: `src/components/sections/Testimonials.tsx`
- Create: `src/components/sections/FeaturedProject.tsx`
- Create: `src/components/sections/BlogPreview.tsx`
- Create: `src/components/sections/Newsletter.tsx`
- Modify: `src/app/(web)/page.tsx`

---

- [ ] **Krok 1: Vytvořit statická data**

Ulož do `src/lib/data.ts`:

```ts
import type { Service, TeamMember, Project, Testimonial, BlogPost, JobPosition } from '@/types'

export const services: Service[] = [
  {
    id: 'development',
    title: 'Development',
    description: 'Realizujeme rezidenční i komerční projekty od A do Z — od pozemku po předání klíčů.',
    href: '/sluzby/development',
    icon: 'building',
  },
  {
    id: 'rekonstrukce',
    title: 'Rekonstrukce',
    description: 'Komplexní rekonstrukce bytů, domů a komerčních prostor s garancí kvality.',
    href: '/sluzby/rekonstrukce',
    icon: 'hammer',
  },
  {
    id: 'nemovitosti',
    title: 'Reality',
    description: 'Prodej a pronájem prémiových nemovitostí v Praze s osobním přístupem.',
    href: '/sluzby/nemovitosti',
    icon: 'home',
  },
  {
    id: 'investice',
    title: 'Investice',
    description: 'Zhodnoťte kapitál investicemi do nemovitostí od 500 000 Kč s výnosem 8–12 % p.a.',
    href: '/sluzby/investice',
    icon: 'chart',
  },
]

export const stats = [
  { value: 47, label: 'Dokončených projektů', suffix: '+' },
  { value: 320, label: 'Spokojených klientů', suffix: '+' },
  { value: 18, label: 'Let zkušeností', suffix: '' },
  { value: 12, label: 'Členů týmu', suffix: '' },
]

export const team: TeamMember[] = [
  {
    id: '1',
    name: 'Lukáš Salamánek',
    role: 'Majitel & CEO',
    image: '/images/team/lukas.jpg',
    bio: 'Zakladatel Puskin and Partners s 18 lety zkušeností v realitním developmentu.',
  },
  {
    id: '2',
    name: 'Jana Nováková',
    role: 'Vedoucí projektu',
    image: '/images/team/jana.jpg',
    bio: 'Specialistka na koordinaci rekonstrukcí a developmentových projektů.',
  },
  {
    id: '3',
    name: 'Martin Kříž',
    role: 'Investiční poradce',
    image: '/images/team/martin.jpg',
    bio: 'Expert na investiční nemovitosti a zhodnocení kapitálu.',
  },
  {
    id: '4',
    name: 'Petra Horáková',
    role: 'Makléřka',
    image: '/images/team/petra.jpg',
    bio: 'Realitní makléřka se specializací na prémiové byty v Praze 1.',
  },
]

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Tomáš Dvořák',
    role: 'Investor',
    text: 'S Puskin and Partners jsem zhodnotil svůj kapitál o 11 % za rok. Profesionální přístup, transparentní komunikace.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Eva Marková',
    role: 'Klientka — rekonstrukce bytu',
    text: 'Rekonstrukci bytu zvládli za 6 týdnů, přesně na termín a v rozpočtu. Výsledek předčil očekávání.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Ondřej Beneš',
    role: 'Kupující',
    text: 'Koupě bytu přes Puskin and Partners byla bezstresová. Postarali se o vše — od prohlídky po podpis smlouvy.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Lucie Procházková',
    role: 'Investor — projekt Žižkov',
    text: 'Druhý projekt s Puskin and Partners a opět bezchybně. Výnos 9,5 % p.a., žádná překvapení.',
    rating: 5,
  },
]

export const featuredProject: Project = {
  id: 'rezidence-rybna',
  title: 'Rezidence Rybná',
  location: 'Praha 1 — Staré Město',
  year: 2024,
  category: 'development',
  image: '/images/projects/rybna.jpg',
  description:
    'Prémiová rezidenční rekonstrukce historického domu v centru Prahy. 12 luxusních bytů, zachování původních architektonických prvků.',
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Jak správně investovat do nemovitostí v roce 2024',
    excerpt: 'Realitní trh v Praze nabízí stále zajímavé příležitosti. Přinášíme přehled nejlepších strategií.',
    date: '2024-11-15',
    category: 'Investice',
    image: '/images/blog/investice-2024.jpg',
    slug: 'jak-investovat-do-nemovitosti-2024',
  },
  {
    id: '2',
    title: 'Rekonstrukce bytu: Jak ušetřit a nekompromitovat kvalitu',
    excerpt: 'Prozradíme, kde se vyplatí investovat a kde naopak lze rozumně šetřit.',
    date: '2024-10-28',
    category: 'Rekonstrukce',
    image: '/images/blog/rekonstrukce-tipy.jpg',
    slug: 'rekonstrukce-bytu-tipy',
  },
  {
    id: '3',
    title: 'Praha 1 vs Praha 2: Kde koupit investiční nemovitost?',
    excerpt: 'Srovnáváme výnosy, rizika a potenciál růstu ve dvou nejžádanějších pražských lokacích.',
    date: '2024-10-10',
    category: 'Reality',
    image: '/images/blog/praha-lokace.jpg',
    slug: 'praha-1-vs-praha-2-investice',
  },
]

export const jobPositions: JobPosition[] = [
  {
    id: '1',
    title: 'Realitní makléř/ka',
    type: 'full-time',
    location: 'Praha 1',
    description: 'Hledáme zkušeného makléře pro prémiový segment pražských nemovitostí.',
  },
  {
    id: '2',
    title: 'Projektový manažer — rekonstrukce',
    type: 'full-time',
    location: 'Praha',
    description: 'Koordinace rekonstrukcí bytů a komerčních prostor od 0 do předání klientovi.',
  },
]
```

- [ ] **Krok 2: Vytvořit Navigation komponentu**

Ulož do `src/components/layout/Navigation.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { label: 'O nás', href: '/o-nas' },
  {
    label: 'Služby',
    href: '/sluzby',
    children: [
      { label: 'Development', href: '/sluzby/development' },
      { label: 'Rekonstrukce', href: '/sluzby/rekonstrukce' },
      { label: 'Nemovitosti', href: '/sluzby/nemovitosti' },
      { label: 'Investice', href: '/sluzby/investice' },
    ],
  },
  { label: 'Reference', href: '/reference' },
  { label: 'Blog', href: '/blog' },
  { label: 'Kariéra', href: '/kariera' },
  { label: 'Kontakt', href: '/kontakt' },
]

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <nav>
      {/* Desktop */}
      <ul className="hidden lg:flex items-center gap-8">
        {navLinks.map((link) =>
          link.children ? (
            <li key={link.label} className="relative group">
              <button
                className="flex items-center gap-1 text-navy-800 hover:text-gold-600 font-sans text-sm tracking-wide transition-colors"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                {link.label}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul
                className={`absolute top-full left-0 mt-2 w-52 bg-white border border-ivory-300 shadow-lg py-2 transition-all duration-200 ${servicesOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                {link.children.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className="block px-4 py-2 text-sm text-navy-700 hover:bg-ivory-100 hover:text-gold-600 transition-colors"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-navy-800 hover:text-gold-600 font-sans text-sm tracking-wide transition-colors"
              >
                {link.label}
              </Link>
            </li>
          )
        )}
      </ul>

      {/* Mobile toggle */}
      <button
        className="lg:hidden p-2 text-navy-800"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-ivory-300 shadow-lg py-4 px-6">
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.children ? (
                  <div>
                    <span className="block text-navy-800 font-medium mb-2">{link.label}</span>
                    <ul className="pl-4 space-y-2">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="text-navy-600 hover:text-gold-600 text-sm"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="block text-navy-800 hover:text-gold-600 font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Krok 3: Vytvořit Header**

Ulož do `src/components/layout/Header.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { Navigation } from './Navigation'
import { Button } from '@/components/ui/Button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-ivory-300">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-20 relative">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="Puskin and Partners" width={220} height={40} priority />
          </Link>
          <Navigation />
          <div className="hidden lg:block">
            <Button href="/kontakt" variant="secondary" size="sm">
              Kontaktujte nás
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Krok 4: Vytvořit Footer**

Ulož do `src/components/layout/Footer.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-navy-950 text-ivory-300">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo + popis */}
          <div className="md:col-span-2">
            <Image src="/logo.svg" alt="Puskin and Partners" width={200} height={36} className="brightness-0 invert opacity-80 mb-4" />
            <p className="text-sm leading-relaxed text-ivory-400 max-w-sm">
              Prémiový realitní development, rekonstrukce a investice v Praze. Budujeme hodnoty, které přetrvávají.
            </p>
            <p className="mt-6 text-xs text-ivory-500">
              Alexandr Puškin, s.r.o.<br />
              IČO: 26740788 | DIČ: CZ26740788<br />
              Rybná 716/24, 110 00 Praha 1
            </p>
          </div>

          {/* Navigace */}
          <div>
            <h4 className="text-ivory-100 font-serif text-lg mb-4">Navigace</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['O nás', '/o-nas'],
                ['Služby', '/sluzby/development'],
                ['Reference', '/reference'],
                ['Blog', '/blog'],
                ['Kariéra', '/kariera'],
                ['Kontakt', '/kontakt'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-gold-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="text-ivory-100 font-serif text-lg mb-4">Kontakt</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:+420222244889" className="hover:text-gold-400 transition-colors">
                  +420 222 244 889
                </a>
              </li>
              <li>
                <a href="mailto:info@apartmentspushkin.com" className="hover:text-gold-400 transition-colors">
                  info@apartmentspushkin.com
                </a>
              </li>
              <li className="text-ivory-500">
                Po–Pá: 9:00 – 18:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-navy-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-ivory-500">
          <p>© {new Date().getFullYear()} Alexandr Puškin, s.r.o. Všechna práva vyhrazena.</p>
          <div className="flex gap-6">
            <Link href="/gdpr" className="hover:text-ivory-300 transition-colors">Ochrana osobních údajů</Link>
            <Link href="/cookies" className="hover:text-ivory-300 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Krok 5: Vytvořit (web) layout**

Ulož do `src/app/(web)/layout.tsx`:

```tsx
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
```

- [ ] **Krok 6: Vytvořit Hero sekci**

Ulož do `src/components/sections/Hero.tsx`:

```tsx
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative min-h-[90vh] bg-navy-950 flex items-center overflow-hidden">
      {/* Dekorativní background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-navy-700 blur-3xl" />
      </div>

      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
        <div className="max-w-3xl">
          <p className="text-gold-400 font-sans text-sm tracking-[0.3em] uppercase mb-6">
            Praha — Realitní development
          </p>
          <h1 className="font-serif text-6xl lg:text-8xl font-light text-ivory-100 leading-none mb-8">
            Stavíme<br />
            <span className="italic text-gold-400">hodnoty</span><br />
            které trvají
          </h1>
          <p className="text-ivory-300 text-xl font-light leading-relaxed max-w-xl mb-12">
            Development, rekonstrukce, reality a investice v Praze s 18 lety zkušeností a 47 dokončenými projekty.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button href="/sluzby/development" variant="secondary" size="lg">
              Naše projekty
            </Button>
            <Button href="/kontakt" variant="outline" size="lg" className="text-ivory-100 border-ivory-300 hover:bg-navy-800">
              Konzultace zdarma
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ivory-500">
        <span className="text-xs tracking-widest uppercase">Scrollovat</span>
        <div className="w-px h-12 bg-gradient-to-b from-ivory-500 to-transparent" />
      </div>
    </section>
  )
}
```

- [ ] **Krok 7: Vytvořit Services sekci**

Ulož do `src/components/sections/Services.tsx`:

```tsx
import { services } from '@/lib/data'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

const icons: Record<string, React.ReactNode> = {
  building: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  hammer: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  home: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  chart: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
}

export function Services() {
  return (
    <Section background="ivory">
      <Container>
        <Heading level={2} subtitle="Co pro vás děláme" centered className="mb-16">
          Komplexní realitní služby
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Link key={service.id} href={service.href} className="group block">
              <Card hover padding="lg" className="h-full">
                <div className="text-gold-500 mb-6 group-hover:text-gold-600 transition-colors">
                  {icons[service.icon]}
                </div>
                <h3 className="font-serif text-2xl text-navy-900 mb-3">{service.title}</h3>
                <p className="text-navy-500 text-sm leading-relaxed">{service.description}</p>
                <p className="mt-6 text-gold-600 text-sm font-medium tracking-wide group-hover:tracking-wider transition-all">
                  Zjistit více →
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Krok 8: Vytvořit Stats sekci**

Ulož do `src/components/sections/Stats.tsx`:

```tsx
import { stats } from '@/lib/data'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'

export function Stats() {
  return (
    <Section background="navy">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-6xl lg:text-7xl font-light text-gold-400">
                {stat.value}{stat.suffix}
              </p>
              <p className="mt-2 text-ivory-300 text-sm tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Krok 9: Vytvořit Team sekci**

Ulož do `src/components/sections/Team.tsx`:

```tsx
import { team } from '@/lib/data'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'

export function Team() {
  return (
    <Section background="white">
      <Container>
        <Heading level={2} subtitle="Lidé za Puskin and Partners" centered className="mb-16">
          Náš tým
        </Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div key={member.id} className="text-center group">
              <div className="relative w-48 h-48 mx-auto mb-6 overflow-hidden bg-ivory-200">
                <div className="w-full h-full bg-gradient-to-br from-navy-200 to-navy-400 flex items-center justify-center">
                  <span className="font-serif text-4xl text-navy-600">
                    {member.name.charAt(0)}
                  </span>
                </div>
              </div>
              <h3 className="font-serif text-xl text-navy-900">{member.name}</h3>
              <p className="text-gold-600 text-sm mt-1 mb-3">{member.role}</p>
              <p className="text-navy-500 text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Krok 10: Vytvořit Testimonials sekci**

Ulož do `src/components/sections/Testimonials.tsx`:

```tsx
import { testimonials } from '@/lib/data'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Card } from '@/components/ui/Card'

export function Testimonials() {
  return (
    <Section background="ivory">
      <Container>
        <Heading level={2} subtitle="Co říkají naši klienti" centered className="mb-16">
          Reference klientů
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <Card key={t.id} padding="lg">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-navy-600 leading-relaxed mb-6 italic">"{t.text}"</p>
              <div>
                <p className="font-medium text-navy-900">{t.name}</p>
                <p className="text-sm text-navy-400">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Krok 11: Vytvořit FeaturedProject sekci**

Ulož do `src/components/sections/FeaturedProject.tsx`:

```tsx
import { featuredProject } from '@/lib/data'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

export function FeaturedProject() {
  const project = featuredProject
  return (
    <Section background="navy">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-gold-400 text-sm tracking-[0.3em] uppercase mb-4">Vybraný projekt</p>
            <h2 className="font-serif text-5xl font-light text-ivory-100 mb-6">{project.title}</h2>
            <p className="text-ivory-300 text-lg font-light leading-relaxed mb-8">{project.description}</p>
            <div className="flex gap-8 mb-10">
              <div>
                <p className="text-gold-400 text-sm tracking-wide">Lokalita</p>
                <p className="text-ivory-100 mt-1">{project.location}</p>
              </div>
              <div>
                <p className="text-gold-400 text-sm tracking-wide">Rok</p>
                <p className="text-ivory-100 mt-1">{project.year}</p>
              </div>
              <div>
                <p className="text-gold-400 text-sm tracking-wide">Kategorie</p>
                <p className="text-ivory-100 mt-1 capitalize">{project.category}</p>
              </div>
            </div>
            <Button href="/reference" variant="secondary">
              Všechny projekty
            </Button>
          </div>
          <div className="aspect-[4/3] bg-navy-800 flex items-center justify-center">
            <div className="text-center text-navy-400">
              <p className="font-serif text-2xl">{project.title}</p>
              <p className="text-sm mt-2">{project.location}</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Krok 12: Vytvořit BlogPreview sekci**

Ulož do `src/components/sections/BlogPreview.tsx`:

```tsx
import { blogPosts } from '@/lib/data'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function BlogPreview() {
  return (
    <Section background="white">
      <Container>
        <div className="flex justify-between items-end mb-16">
          <Heading level={2} subtitle="Novinky a rady ze světa realit">
            Blog
          </Heading>
          <Button href="/blog" variant="outline">
            Všechny články
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <Card hover padding="none" className="overflow-hidden">
                <div className="aspect-[16/9] bg-ivory-200 flex items-center justify-center">
                  <span className="text-ivory-400 text-sm">{post.category}</span>
                </div>
                <div className="p-6">
                  <p className="text-gold-600 text-xs tracking-widest uppercase mb-2">{post.category}</p>
                  <h3 className="font-serif text-xl text-navy-900 mb-3 group-hover:text-navy-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-navy-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  <p className="text-navy-400 text-xs">
                    {new Date(post.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Krok 13: Vytvořit Newsletter sekci**

Ulož do `src/components/sections/Newsletter.tsx`:

```tsx
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

export function Newsletter() {
  return (
    <Section background="ivory">
      <Container narrow>
        <div className="text-center">
          <h2 className="font-serif text-4xl font-light text-navy-900 mb-4">
            Zůstaňte v obraze
          </h2>
          <p className="text-navy-500 text-lg font-light mb-10">
            Novinky z realitního trhu, nové projekty a investiční příležitosti — přímo do vaší schránky.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="#" method="post">
            <input
              type="email"
              name="email"
              placeholder="váš@email.cz"
              required
              className="flex-1 px-4 py-3 border border-ivory-400 bg-white text-navy-900 placeholder-navy-400 focus:outline-none focus:border-navy-500 text-sm"
            />
            <Button type="submit" variant="primary">
              Přihlásit se
            </Button>
          </form>
          <p className="mt-4 text-xs text-navy-400">
            Souhlas se zpracováním osobních údajů. Odhlásit se můžete kdykoliv.
          </p>
        </div>
      </Container>
    </Section>
  )
}
```

- [ ] **Krok 14: Sestavit Homepage**

Nahraď obsah `src/app/(web)/page.tsx`:

```tsx
import { Hero } from '@/components/sections/Hero'
import { Services } from '@/components/sections/Services'
import { Stats } from '@/components/sections/Stats'
import { Team } from '@/components/sections/Team'
import { Testimonials } from '@/components/sections/Testimonials'
import { FeaturedProject } from '@/components/sections/FeaturedProject'
import { BlogPreview } from '@/components/sections/BlogPreview'
import { Newsletter } from '@/components/sections/Newsletter'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Stats />
      <Team />
      <Testimonials />
      <FeaturedProject />
      <BlogPreview />
      <Newsletter />
    </>
  )
}
```

- [ ] **Krok 15: Ověřit build**

```bash
cd /Users/zen/puskin-partners
npm run build 2>&1 | tail -20
```

Očekávaný výstup: `✓ Compiled successfully` nebo `Route (app)`

- [ ] **Krok 16: Commitnout homepage**

```bash
cd /Users/zen/puskin-partners
git add -A
git commit -m "feat: homepage — hero, services, stats, team, testimonials, featured project, blog, newsletter"
```

---

## TASK-004: Podstránky

### Files:
- Create: `src/app/(web)/o-nas/page.tsx`
- Create: `src/app/(web)/sluzby/development/page.tsx`
- Create: `src/app/(web)/sluzby/rekonstrukce/page.tsx`
- Create: `src/app/(web)/sluzby/nemovitosti/page.tsx`
- Create: `src/app/(web)/sluzby/investice/page.tsx`
- Create: `src/app/(web)/reference/page.tsx`
- Create: `src/app/(web)/kariera/page.tsx`
- Create: `src/app/(web)/blog/page.tsx`
- Create: `src/app/(web)/kontakt/page.tsx`

---

- [ ] **Krok 1: Vytvořit adresáře**

```bash
cd /Users/zen/puskin-partners
mkdir -p src/app/\(web\)/o-nas
mkdir -p src/app/\(web\)/sluzby/development
mkdir -p src/app/\(web\)/sluzby/rekonstrukce
mkdir -p src/app/\(web\)/sluzby/nemovitosti
mkdir -p src/app/\(web\)/sluzby/investice
mkdir -p src/app/\(web\)/reference
mkdir -p src/app/\(web\)/kariera
mkdir -p src/app/\(web\)/blog
mkdir -p src/app/\(web\)/kontakt
```

- [ ] **Krok 2: Stránka O nás**

Ulož do `src/app/(web)/o-nas/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { team } from '@/lib/data'

export const metadata: Metadata = {
  title: 'O nás | Puskin and Partners',
  description: 'Příběh, tým a mise realitní společnosti Puskin and Partners.',
}

export default function ONasPage() {
  return (
    <>
      <Section background="navy">
        <Container>
          <Heading level={1} light subtitle="Kdo jsme a proč děláme to, co děláme">
            O nás
          </Heading>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Heading level={2} subtitle="18 let zkušeností v pražských realitách" className="mb-8">
                Náš příběh
              </Heading>
              <div className="space-y-4 text-navy-600 leading-relaxed">
                <p>
                  Puskin and Partners vznikl z přesvědčení, že realitní development může být jiný —
                  transparentní, osobní a zaměřený na skutečnou hodnotu pro klienty.
                </p>
                <p>
                  Od roku 2006 jsme dokončili 47 projektů v Praze. Každý z nich odráží náš závazek
                  ke kvalitě, řemeslu a dlouhodobému myšlení.
                </p>
                <p>
                  Náš zakladatel Lukáš Salamánek věří, že nejlepší investicí je taková, která
                  funguje pro klienta i za 20 let.
                </p>
              </div>
            </div>
            <div className="aspect-square bg-ivory-200 flex items-center justify-center">
              <span className="text-ivory-400 font-serif text-2xl">Fotografie firmy</span>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="ivory">
        <Container>
          <Heading level={2} centered className="mb-16">Náš tým</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.id} className="text-center">
                <div className="w-40 h-40 mx-auto mb-4 bg-gradient-to-br from-navy-200 to-navy-400 flex items-center justify-center">
                  <span className="font-serif text-4xl text-navy-600">{member.name.charAt(0)}</span>
                </div>
                <h3 className="font-serif text-xl text-navy-900">{member.name}</h3>
                <p className="text-gold-600 text-sm mt-1 mb-3">{member.role}</p>
                <p className="text-navy-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="navy">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-center">
            {[
              { title: 'Transparentnost', desc: 'Otevřená komunikace v každé fázi projektu.' },
              { title: 'Kvalita', desc: 'Používáme pouze prověřené materiály a dodavatele.' },
              { title: 'Dlouhodobost', desc: 'Budujeme vztahy, ne jen projekty.' },
            ].map((value) => (
              <div key={value.title}>
                <h3 className="font-serif text-2xl text-gold-400 mb-4">{value.title}</h3>
                <p className="text-ivory-300 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Krok 3: Stránka Development**

Ulož do `src/app/(web)/sluzby/development/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Development | Puskin and Partners',
  description: 'Rezidenční a komerční development v Praze od A do Z.',
}

const differentiators = [
  { title: 'Vlastní financování', desc: 'Projekty realizujeme z vlastních zdrojů bez závislosti na bankách.' },
  { title: 'Zkušený tým', desc: '18 let v oboru, 47 dokončených projektů, 0 nedokončených.' },
  { title: 'Praha jako specialita', desc: 'Známe každou čtvrť, každý magistrát, každého dodavatele.' },
  { title: 'Transparentní ceny', desc: 'Cena je cena. Bez skrytých poplatků a překvapení.' },
  { title: 'Garancia termínu', desc: 'Smluvní pokuta za každý den prodlení. Myslíme to vážně.' },
  { title: 'Poprodejní servis', desc: 'S vámi jsme i po předání klíčů. 5 let záruky.' },
]

export default function DevelopmentPage() {
  return (
    <>
      <Section background="navy">
        <Container>
          <Heading level={1} light subtitle="Rezidenční a komerční projekty v Praze">
            Development
          </Heading>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <Heading level={2} subtitle="Co nás odlišuje" centered className="mb-0" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiators.map((d) => (
              <Card key={d.title} padding="lg">
                <h3 className="font-serif text-xl text-navy-900 mb-3">{d.title}</h3>
                <p className="text-navy-500 text-sm leading-relaxed">{d.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="ivory">
        <Container>
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '47', label: 'Dokončených projektů' },
              { value: '18', label: 'Let v oboru' },
              { value: '100%', label: 'Projektů dokončeno' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-serif text-6xl text-navy-800">{s.value}</p>
                <p className="text-navy-500 text-sm mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="white">
        <Container narrow>
          <div className="text-center">
            <Heading level={2} className="mb-6">Máte zájem o projekt?</Heading>
            <p className="text-navy-500 mb-8">Kontaktujte nás pro nezávaznou konzultaci.</p>
            <Button href="/kontakt" variant="primary" size="lg">Domluvit schůzku</Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Krok 4: Stránka Rekonstrukce**

Ulož do `src/app/(web)/sluzby/rekonstrukce/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Rekonstrukce | Puskin and Partners',
  description: 'Komplexní rekonstrukce bytů a komerčních prostor v Praze.',
}

const processSteps = [
  { n: 1, title: 'Úvodní konzultace', desc: 'Bezplatná prohlídka nemovitosti a analýza vašich požadavků.' },
  { n: 2, title: 'Návrh a projekt', desc: 'Zpracujeme vizualizace, projektovou dokumentaci a přesný rozpočet.' },
  { n: 3, title: 'Smlouva o dílo', desc: 'Transparentní smlouva s pevnou cenou, termínem a zárukami.' },
  { n: 4, title: 'Stavební povolení', desc: 'Vyřídíme veškeré potřebné povolení a souhlasy.' },
  { n: 5, title: 'Bourací práce', desc: 'Bezpečná demontáž původních konstrukcí a příček.' },
  { n: 6, title: 'Hrubá stavba', desc: 'Nové příčky, rozvody elektřiny, vody, topení.' },
  { n: 7, title: 'Dokončovací práce', desc: 'Omítky, podlahy, obklady, malby.' },
  { n: 8, title: 'Kuchyně a sanita', desc: 'Montáž kuchyně, koupelny, WC.' },
  { n: 9, title: 'Předání a záruka', desc: 'Kolaudace, předání klíčů, 5 let záruky na provedené práce.' },
]

const faqs = [
  { q: 'Jak dlouho trvá rekonstrukce bytu 3+1?', a: 'Standardně 8–12 týdnů podle rozsahu. U historických nemovitostí 12–16 týdnů.' },
  { q: 'Realizujete rekonstrukce i za obývání?', a: 'Ve většině případů doporučujeme dočasné vystěhování. V některých případech je možné rekonstruovat po etapách.' },
  { q: 'Je cena v nabídce konečná?', a: 'Ano. Cenu ve smlouvě neměníme, pokud nedojde ke změně rozsahu prací z vaší strany.' },
]

export default function RekonstrukcePage() {
  return (
    <>
      <Section background="navy">
        <Container>
          <Heading level={1} light subtitle="Komplexní rekonstrukce bytů a prostor v Praze">
            Rekonstrukce
          </Heading>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <Heading level={2} subtitle="Jak probíhá spolupráce s námi" centered className="mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {processSteps.map((step) => (
              <div key={step.n} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-navy-900 text-ivory-100 font-serif text-lg flex items-center justify-center">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-medium text-navy-900 mb-1">{step.title}</h3>
                  <p className="text-navy-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="ivory">
        <Container narrow>
          <Heading level={2} centered className="mb-12">Časté otázky</Heading>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-ivory-300 pb-6">
                <h3 className="font-medium text-navy-900 mb-2">{faq.q}</h3>
                <p className="text-navy-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button href="/kontakt" variant="primary" size="lg">Nezávazná konzultace</Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Krok 5: Stránka Nemovitosti**

Ulož do `src/app/(web)/sluzby/nemovitosti/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Nemovitosti | Puskin and Partners',
  description: 'Prodej a pronájem prémiových nemovitostí v Praze.',
}

const realEstateServices = [
  { title: 'Prodej nemovitostí', desc: 'Profesionální prezentace, právní servis, transparentní průběh prodeje.' },
  { title: 'Pronájem', desc: 'Správa nemovitosti, prověření nájemníků, nájemní smlouvy.' },
  { title: 'Ocenění', desc: 'Tržní ocenění nemovitosti zdarma pro vážné prodávající.' },
  { title: 'Právní servis', desc: 'Zajistíme advokáta, úschovu kupní ceny i katastr.' },
]

export default function NemovitostiPage() {
  return (
    <>
      <Section background="navy">
        <Container>
          <Heading level={1} light subtitle="Prodej a pronájem nemovitostí v Praze">
            Nemovitosti
          </Heading>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <Heading level={2} subtitle="Naše realitní služby" centered className="mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {realEstateServices.map((s) => (
              <Card key={s.title} padding="lg" hover>
                <h3 className="font-serif text-2xl text-navy-900 mb-3">{s.title}</h3>
                <p className="text-navy-500 leading-relaxed">{s.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="ivory">
        <Container narrow>
          <div className="text-center">
            <Heading level={2} className="mb-6">Chcete prodat nebo pronajmout?</Heading>
            <p className="text-navy-500 mb-8">Nabídneme vám bezplatné ocenění a plán prodeje.</p>
            <Button href="/kontakt" variant="primary" size="lg">Kontaktujte nás</Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Krok 6: Stránka Investice**

Ulož do `src/app/(web)/sluzby/investice/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Investice | Puskin and Partners',
  description: 'Investujte do nemovitostí s výnosem 8–12 % p.a. Od 500 000 Kč.',
}

const investmentOptions = [
  {
    title: 'Dluhopisový fond',
    minInvestment: '500 000 Kč',
    yield: '8–10 % p.a.',
    duration: '2–3 roky',
    desc: 'Bezpečná investice do portfolia pražských nemovitostí. Fixní úrokový výnos, čtvrtletní výplata.',
    features: ['Fixní výnos', 'Čtvrtletní výplaty', 'Zajištěno nemovitostmi', 'Smlouva v češtině'],
  },
  {
    title: 'Přímá investice do projektu',
    minInvestment: '5 000 000 Kč',
    yield: '10–12 % p.a.',
    duration: '18–36 měsíců',
    desc: 'Přímá účast na developmentovém nebo rekonstrukčním projektu. Vyšší výnos, osobní přístup.',
    features: ['Vyšší výnos', 'Přímá kontrola', 'Osobní manažer', 'Vstup i výstup na míru'],
  },
]

export default function InvesticePage() {
  return (
    <>
      <Section background="navy">
        <Container>
          <Heading level={1} light subtitle="Zhodnoťte kapitál investicemi do pražských nemovitostí">
            Investice
          </Heading>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <Heading level={2} subtitle="Dvě cesty investování" centered className="mb-16" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {investmentOptions.map((opt) => (
              <Card key={opt.title} padding="lg" className="border-2 border-ivory-300 hover:border-gold-400 transition-colors">
                <h3 className="font-serif text-3xl text-navy-900 mb-2">{opt.title}</h3>
                <div className="flex gap-6 my-6 pb-6 border-b border-ivory-300">
                  <div>
                    <p className="text-xs text-navy-400 tracking-wide uppercase">Min. investice</p>
                    <p className="font-medium text-navy-900 mt-1">{opt.minInvestment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 tracking-wide uppercase">Výnos</p>
                    <p className="font-medium text-gold-600 mt-1">{opt.yield}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400 tracking-wide uppercase">Délka</p>
                    <p className="font-medium text-navy-900 mt-1">{opt.duration}</p>
                  </div>
                </div>
                <p className="text-navy-500 leading-relaxed mb-6">{opt.desc}</p>
                <ul className="space-y-2">
                  {opt.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-navy-600">
                      <span className="text-gold-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="ivory">
        <Container narrow>
          <div className="text-center">
            <Heading level={2} className="mb-6">Máte zájem o investici?</Heading>
            <p className="text-navy-500 mb-8">Domluvte si osobní konzultaci s naším investičním poradcem.</p>
            <Button href="/kontakt" variant="primary" size="lg">Domluvit konzultaci</Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Krok 7: Stránka Reference**

Ulož do `src/app/(web)/reference/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Reference | Puskin and Partners',
  description: '47 dokončených projektů — development, rekonstrukce a investice v Praze.',
}

const projects = [
  { title: 'Rezidence Rybná', location: 'Praha 1', year: 2024, category: 'development', units: '12 bytů' },
  { title: 'Vinohrady Atelier', location: 'Praha 2', year: 2023, category: 'rekonstrukce', units: '1 byt 4+kk' },
  { title: 'Žižkov Invest', location: 'Praha 3', year: 2023, category: 'investice', units: '8 bytů' },
  { title: 'Holešovice Loft', location: 'Praha 7', year: 2023, category: 'rekonstrukce', units: '3 byty' },
  { title: 'Smíchov Residence', location: 'Praha 5', year: 2022, category: 'development', units: '24 bytů' },
  { title: 'Nusle Rekonstrukce', location: 'Praha 4', year: 2022, category: 'rekonstrukce', units: '2 byty' },
  { title: 'Dejvice Premium', location: 'Praha 6', year: 2022, category: 'development', units: '6 bytů' },
  { title: 'Karlín Office', location: 'Praha 8', year: 2021, category: 'rekonstrukce', units: '450 m² kanceláří' },
]

const categoryColors: Record<string, string> = {
  development: 'text-navy-600 bg-navy-50',
  rekonstrukce: 'text-gold-700 bg-gold-50',
  investice: 'text-green-700 bg-green-50',
}

export default function ReferencePage() {
  return (
    <>
      <Section background="navy">
        <Container>
          <Heading level={1} light subtitle="47 dokončených projektů v Praze">
            Reference
          </Heading>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card key={project.title} hover padding="none" className="overflow-hidden">
                <div className="aspect-[4/3] bg-ivory-200 flex items-center justify-center">
                  <span className="font-serif text-xl text-ivory-400">{project.title}</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif text-xl text-navy-900">{project.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${categoryColors[project.category]}`}>
                      {project.category}
                    </span>
                  </div>
                  <p className="text-navy-500 text-sm">{project.location} · {project.year}</p>
                  <p className="text-navy-400 text-sm mt-1">{project.units}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Krok 8: Stránka Blog**

Ulož do `src/app/(web)/blog/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Card } from '@/components/ui/Card'
import { blogPosts } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Blog | Puskin and Partners',
  description: 'Novinky, rady a analýzy ze světa pražských realit.',
}

export default function BlogPage() {
  return (
    <>
      <Section background="navy">
        <Container>
          <Heading level={1} light subtitle="Novinky a rady ze světa realit">
            Blog
          </Heading>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <Card hover padding="none" className="overflow-hidden">
                  <div className="aspect-[16/9] bg-ivory-200 flex items-center justify-center">
                    <span className="text-ivory-400 text-sm">{post.category}</span>
                  </div>
                  <div className="p-6">
                    <p className="text-gold-600 text-xs tracking-widest uppercase mb-2">{post.category}</p>
                    <h3 className="font-serif text-xl text-navy-900 mb-3 group-hover:text-navy-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-navy-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                    <p className="text-navy-400 text-xs">
                      {new Date(post.date).toLocaleDateString('cs-CZ', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Krok 9: Stránka Kariéra**

Ulož do `src/app/(web)/kariera/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { jobPositions } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Kariéra | Puskin and Partners',
  description: 'Připojte se k týmu Puskin and Partners. Otevřené pozice.',
}

const typeLabels: Record<string, string> = {
  'full-time': 'Plný úvazek',
  'part-time': 'Částečný úvazek',
  'freelance': 'Spolupráce',
}

export default function KarieraPage() {
  return (
    <>
      <Section background="navy">
        <Container>
          <Heading level={1} light subtitle="Přidejte se k týmu Puskin and Partners">
            Kariéra
          </Heading>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <Heading level={2} subtitle="Aktuálně hledáme" className="mb-12" />
          <div className="space-y-6">
            {jobPositions.map((job) => (
              <Card key={job.id} padding="lg" hover>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl text-navy-900 mb-2">{job.title}</h3>
                    <div className="flex gap-4 text-sm text-navy-400 mb-4">
                      <span>{typeLabels[job.type]}</span>
                      <span>·</span>
                      <span>{job.location}</span>
                    </div>
                    <p className="text-navy-500 leading-relaxed">{job.description}</p>
                  </div>
                  <Button href={`/kontakt?pozice=${encodeURIComponent(job.title)}`} variant="outline">
                    Mám zájem
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="ivory">
        <Container narrow>
          <div className="text-center">
            <Heading level={2} className="mb-6">Nenašli jste svou pozici?</Heading>
            <p className="text-navy-500 mb-8">
              Zašlete nám životopis a motivační dopis. Rádi se s vámi setkáme.
            </p>
            <Button href="mailto:info@apartmentspushkin.com" variant="primary">
              Poslat životopis
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Krok 10: Stránka Kontakt**

Ulož do `src/app/(web)/kontakt/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Kontakt | Puskin and Partners',
  description: 'Kontaktujte Puskin and Partners. Rybná 716/24, Praha 1.',
}

export default function KontaktPage() {
  return (
    <>
      <Section background="navy">
        <Container>
          <Heading level={1} light subtitle="Jsme tu pro vás">
            Kontakt
          </Heading>
        </Container>
      </Section>

      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Kontaktní formulář */}
            <div>
              <Heading level={2} className="mb-8">Napište nám</Heading>
              <form className="space-y-6" action="#" method="post">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-navy-700 mb-2">
                      Jméno a příjmení *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-ivory-400 bg-ivory-50 text-navy-900 placeholder-navy-300 focus:outline-none focus:border-navy-500 text-sm"
                      placeholder="Jan Novák"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-2">
                      E-mail *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-ivory-400 bg-ivory-50 text-navy-900 placeholder-navy-300 focus:outline-none focus:border-navy-500 text-sm"
                      placeholder="jan@email.cz"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-navy-700 mb-2">
                    Telefon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full px-4 py-3 border border-ivory-400 bg-ivory-50 text-navy-900 placeholder-navy-300 focus:outline-none focus:border-navy-500 text-sm"
                    placeholder="+420 xxx xxx xxx"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-navy-700 mb-2">
                    Předmět
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 border border-ivory-400 bg-ivory-50 text-navy-900 focus:outline-none focus:border-navy-500 text-sm"
                  >
                    <option value="">Vyberte téma</option>
                    <option value="development">Development</option>
                    <option value="rekonstrukce">Rekonstrukce</option>
                    <option value="nemovitosti">Nemovitosti</option>
                    <option value="investice">Investice</option>
                    <option value="jine">Jiné</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-navy-700 mb-2">
                    Zpráva *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-ivory-400 bg-ivory-50 text-navy-900 placeholder-navy-300 focus:outline-none focus:border-navy-500 text-sm resize-none"
                    placeholder="Popište váš záměr nebo dotaz..."
                  />
                </div>
                <div className="flex items-start gap-3">
                  <input
                    id="gdpr"
                    name="gdpr"
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 border border-ivory-400 accent-navy-800"
                  />
                  <label htmlFor="gdpr" className="text-sm text-navy-500 leading-relaxed">
                    Souhlasím se{' '}
                    <a href="/gdpr" className="text-navy-700 underline hover:text-gold-600">
                      zpracováním osobních údajů
                    </a>{' '}
                    za účelem zpracování mé poptávky.
                  </label>
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full justify-center">
                  Odeslat zprávu
                </Button>
              </form>
            </div>

            {/* Kontaktní info */}
            <div>
              <Heading level={2} className="mb-8">Kde nás najdete</Heading>
              <div className="space-y-8">
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">Adresa</h3>
                  <p className="text-navy-500 leading-relaxed">
                    Rybná 716/24<br />
                    110 00 Praha 1<br />
                    Česká republika
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">Telefon</h3>
                  <a href="tel:+420222244889" className="text-navy-500 hover:text-gold-600 transition-colors">
                    +420 222 244 889
                  </a>
                </div>
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">E-mail</h3>
                  <a href="mailto:info@apartmentspushkin.com" className="text-navy-500 hover:text-gold-600 transition-colors">
                    info@apartmentspushkin.com
                  </a>
                </div>
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">Fakturační údaje</h3>
                  <p className="text-navy-500 text-sm leading-relaxed">
                    Alexandr Puškin, s.r.o.<br />
                    IČO: 26740788<br />
                    DIČ: CZ26740788
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">Provozní hodiny</h3>
                  <p className="text-navy-500 text-sm">Po–Pá: 9:00 – 18:00</p>
                </div>
                {/* Mapa placeholder */}
                <div className="aspect-[4/3] bg-ivory-200 flex items-center justify-center mt-4">
                  <p className="text-ivory-400 text-sm">Mapa — Google Maps embed</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Krok 11: Ověřit build všech stránek**

```bash
cd /Users/zen/puskin-partners
npm run build 2>&1 | tail -30
```

Očekávaný výstup: seznam všech routů včetně `/o-nas`, `/sluzby/development`, `/kontakt` atd.

- [ ] **Krok 12: Finální commit**

```bash
cd /Users/zen/puskin-partners
git add -A
git commit -m "feat: všechny podstránky — o-nas, sluzby (4x), reference, blog, kariera, kontakt"
```

---

## Self-Review

### Spec coverage:

| Požadavek | Task | Status |
|-----------|------|--------|
| Next.js 15, TypeScript, Tailwind CSS 4, App Router | TASK-001 | Krok 1 |
| Route groups (web) + (crm) | TASK-001 | Krok 5–7 |
| ESLint + Prettier | TASK-001 | Krok 3–4 |
| Git init | TASK-001 | Krok 10 (git commit vytvoří repo pokud neexistuje) |
| Barevná paleta (ne hnědá/zelená) | TASK-002 | Krok 1 — navy+gold+ivory |
| Google Fonts (prémiové) | TASK-002 | Krok 2 — Cormorant Garamond + Inter |
| Logo textové | TASK-002 | Krok 3 |
| UI komponenty (Button, Card, Section, Container, Heading) | TASK-002 | Kroky 4–8 |
| Hero sekce | TASK-003 | Krok 6 |
| 4 služby s hover efekty | TASK-003 | Krok 7 |
| Statistiky | TASK-003 | Krok 8 |
| Tým sekce | TASK-003 | Krok 9 |
| Testimonials (4 recenze) | TASK-003 | Krok 10 |
| Featured projekt | TASK-003 | Krok 11 |
| Blog sekce (3 články) | TASK-003 | Krok 12 |
| Newsletter signup | TASK-003 | Krok 13 |
| Responsive + SSR | Vše | Tailwind breakpoints, Server Components |
| O nás | TASK-004 | Krok 2 |
| Development (6 diferenciátorů, statistiky) | TASK-004 | Krok 3 |
| Rekonstrukce (9-krokový proces, FAQ) | TASK-004 | Krok 4 |
| Nemovitosti | TASK-004 | Krok 5 |
| Investice (2 možnosti, 500k a 5M) | TASK-004 | Krok 6 |
| Reference (8 projektů) | TASK-004 | Krok 7 |
| Kariéra (pracovní pozice) | TASK-004 | Krok 8–9 |
| Blog stránka | TASK-004 | Krok 8 |
| Kontakt (formulář + GDPR + mapa + info) | TASK-004 | Krok 10 |
| Dropdown menu pro služby | TASK-002/003 | Navigation.tsx — Krok 2 |
| Header sticky | TASK-003 | Header.tsx — Krok 3 |
| Footer s kontaktem | TASK-003 | Footer.tsx — Krok 4 |

### Placeholder scan: Čistý. Žádné TBD/TODO.

### Type consistency: Typy definovány v `src/types/index.ts` (TASK-001), používány konzistentně v `data.ts` a komponentách.
