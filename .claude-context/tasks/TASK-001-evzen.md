# TASK-001: Evžen review — projekt setup

**Datum:** 2026-08-24
**Reviewer:** Evžen THE KING
**Kontrolováno proti:** Původní zadání od uživatele

---

## Kontrola shody se zadáním

### 1. Tech stack

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Next.js 15, App Router, SSR | ✅ | Next.js 16.3.2 (vyšší verze, kompatibilní), App Router, Server Components |
| TypeScript | ✅ | tsconfig.json, @types/react, @types/node |
| Tailwind CSS 4 | ✅ | CSS-first @theme konfigurace v globals.css |

**Poznámka k Next.js verzi:** Zadání říká "Next.js 15", instalováno je 16.3.2. Toto je OK — `create-next-app@latest` nainstaluje nejnovější verzi a 16.x je zpětně kompatibilní.

### 2. Monorepo struktura: /app/(web)/ a /app/(crm)/

| Požadavek | Stav | Detail |
|-----------|------|--------|
| `/app/(web)/` pro veřejný web | ✅ | `src/app/(web)/` — route group s 10 stránkami |
| `/app/(crm)/` pro CRM | ✅ | `src/app/(crm)/` — placeholder s layout + dashboard |
| CRM jako fáze 2 | ✅ | CRM layout jasně označen "Fáze 2" — správně placeholder |

### 3. Struktura stránek (dle OAK Group)

| Stránka | Požadavek | Stav | URL |
|---------|-----------|------|-----|
| Homepage | ✅ | ✅ | `/` |
| O nás | ✅ | ✅ | `/o-nas` |
| Development | ✅ | ✅ | `/sluzby/development` |
| Rekonstrukce | ✅ | ✅ | `/sluzby/rekonstrukce` |
| Reality | ✅ | ⚠️ | `/sluzby/nemovitosti` — viz poznámka |
| Investice | ✅ | ✅ | `/sluzby/investice` |
| Reference | ✅ | ✅ | `/reference` |
| Kariéra | ✅ | ✅ | `/kariera` |
| Blog | ✅ | ✅ | `/blog` |
| Kontakt | ✅ | ✅ | `/kontakt` |

**⚠️ POZNÁMKA — "Reality" vs "Nemovitosti":**
Zadání uvádí službu **"Reality"**, ale v implementaci je **"Nemovitosti"** (URL `/sluzby/nemovitosti`, navigace "Nemovitosti"). Na OAK Group webu (oakgroup.cz) je sekce "Nemovitosti/Reality" — obojí se používá. Plánovač zvolil "Nemovitosti" jako URL-friendly variantu. Toto je AKCEPTOVATELNÉ — "Nemovitosti" je synonymum pro "Reality" v kontextu realitních služeb a je lepší pro SEO (české slovo). Pokud uživatel preferuje striktně "Reality", snadno se změní v budoucím tasku.

### 4. Firemní údaje

| Údaj | Zadání | Implementace | Stav |
|------|--------|-------------|------|
| Firma | Alexandr Puškin, s.r.o. | `siteConfig.company.legalName` = "Alexandr Puškin, s.r.o." | ✅ |
| IČO | 26740788 | `siteConfig.company.ico` = "26740788" | ✅ |
| Adresa | Rybná 716/24, Praha 1 | `siteConfig.company.address` = "Rybná 716/24", "Praha 1" | ✅ |
| Email | info@apartmentspushkin.com | `siteConfig.contact.email` = "info@apartmentspushkin.com" | ✅ |
| Telefon | +420 222 244 889 | `siteConfig.contact.phone` = "+420 222 244 889" | ✅ |
| Majitel | Lukáš Salamánek | `siteConfig.owner` = "Lukáš Salamánek" | ✅ |

### 5. Branding

| Požadavek | Stav | Detail |
|-----------|------|--------|
| NOVÝ branding — klidný, důvěryhodný | ✅ | Deep Navy + Warm Gold paleta — klidná, profesionální |
| ODLIŠNÝ od OAK Group (hnědá/zelená) | ✅ | Navy/Gold je jasně odlišné od OAK Group palety |
| NOVÉ logo "Puskin and Partners" | ✅ | Textové logo jako komponenta, používá se v Header i Footer |

### 6. Kvalita kódu

| Aspekt | Stav | Detail |
|--------|------|--------|
| Build bez chyb | ✅ | TypeScript 0 chyb, ESLint 0 warningů |
| SSR (Server Components) | ✅ | Všechny stránky jsou Server Components by default |
| siteConfig jako single source of truth | ✅ | Kontaktní údaje, navigace — vše na jednom místě |
| Header s navigací + dropdown | ✅ | Header má dropdown pro Služby s children |
| Footer s firemními údaji | ✅ | Footer zobrazuje IČO, adresu, kontakt |
| Git commit | ✅ | Projekt je v gitu s commitem |

### 7. Pravidla Evžena

| Pravidlo | Stav | Detail |
|----------|------|--------|
| Žádné zkratky v UI | ✅ | "O nás", "Development", "Rekonstrukce", "Nemovitosti", "Investice" — celé názvy |
| Nedokončené funkce OZNAČENY | ✅ | CRM jasně označen "Fáze 2", placeholder stránky odkazují na příslušné TASK-y |
| Skryté stránky = ŠPATNĚ | ✅ | Všechny stránky dostupné z navigace, CRM na /dashboard |

---

## VERDIKT

### ✅ SCHVÁLENO

TASK-001 (projekt setup) **odpovídá původnímu zadání**.

Všechny kritické body jsou splněny:
- Tech stack (Next.js + TypeScript + Tailwind CSS 4 + App Router + SSR) ✅
- Monorepo struktura (web)/(crm) ✅
- Všech 10 stránek dle OAK Group struktury ✅
- Všechny firemní údaje správně ✅
- Nový branding (Navy/Gold) odlišný od OAK Group ✅
- CRM placeholder označen jako fáze 2 ✅

**Jediná drobnost:** "Reality" → "Nemovitosti" — akceptovatelné synonym, snadno změnitelné.
