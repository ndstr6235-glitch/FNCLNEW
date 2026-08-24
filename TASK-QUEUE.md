# TASK-QUEUE — Puskin and Partners

---

## AKTIVNÍ

## TASK-001: Projekt setup — Next.js App Router + základní struktura
Priorita: 1-vysoká
Stav: čeká
Projekt: /Users/zen/puskin-partners

### Kompletní zadání:
Vytvořit Next.js projekt s App Routerem, TypeScript, Tailwind CSS, SSR.
Struktura pro dva celky v jednom projektu:
- `/app/(web)/` — veřejný prezentační web (rebrand OAK Group)
- `/app/(crm)/` — interní CRM pro makléře (fáze 2, zatím jen placeholder)
Nastavit: ESLint, Prettier, git init, základní layout.

### Kontext:
- Tech stack: Next.js 15, TypeScript, Tailwind CSS 4, App Router
- Monorepo přístup — web + CRM jako route groups
- SSR jako výchozí rendering strategy
- Projekt poběží na localhost:3000

---

## TASK-002: Design systém — barvy, fonty, komponenty, logo
Priorita: 1-vysoká
Stav: čeká
Projekt: /Users/zen/puskin-partners

### Kompletní zadání:
Vytvořit kompletní design systém pro Puskin and Partners:
- Barevná paleta: klidné, důvěryhodné barvy (NE hnědá/zelená jako OAK Group — odlišit se)
- Typografie: elegantní, prémiové fonty (Google Fonts)
- Logo: textové logo "Puskin and Partners" — klidné, důvěryhodné
- Základní UI komponenty: Button, Card, Section, Container, Heading
- Tailwind config s custom barvami a fonty
- Globální styly

### Kontext:
- Inspirace: OAK Group má hnědou (#855a47) + zelenou (#6daf69), Poppins/Lato
- Puskin and Partners chce ODLIŠNÝ, ale stejně prémiový vizuál
- Klidný, důvěryhodný = tlumené tóny, elegance, hodně white space
- Firma: realitní development, rekonstrukce, investice — Praha

---

## TASK-003: Hlavní stránka (Homepage)
Priorita: 1-vysoká
Stav: čeká
Projekt: /Users/zen/puskin-partners

### Kompletní zadání:
Vytvořit hlavní stránku podle struktury OAK Group, ale s novým brandem Puskin and Partners:
- Hero sekce s tagline
- 4 služby: Development, Rekonstrukce, Reality, Investice (karty s hover efekty)
- Statistiky (animované countery): projekty, klienti, roky zkušeností, tým
- Tým sekce s fotkami (placeholder obrázky)
- Testimonials sekce (4 recenze)
- Featured projekt sekce
- Blog sekce (3 nejnovější články)
- Newsletter signup

### Kontext:
- SSR stránka
- Responsive: desktop, tablet, mobile
- Animace: scroll-triggered, hover efekty (podobné OAK Group ale vlastní)
- Firma: Alexandr Puškin, s.r.o., IČO 26740788, Rybná 716/24, Praha 1
- Kontakt: info@apartmentspushkin.com, +420 222 244 889
- Majitel: Lukáš Salamánek

---

## TASK-004: Podstránky — O nás, Služby (4x), Reference, Kariéra, Blog, Kontakt
Priorita: 2-střední
Stav: čeká
Projekt: /Users/zen/puskin-partners

### Kompletní zadání:
Vytvořit všechny podstránky webu podle struktury OAK Group:

1. **O nás** (`/o-nas`) — příběh firmy, tým, mise
2. **Development** (`/sluzby/development`) — projekty, statistiky, 6 diferenciátorů, featured projekty
3. **Rekonstrukce** (`/sluzby/rekonstrukce`) — 9-krokový proces, before/after galerie, FAQ
4. **Nemovitosti** (`/sluzby/nemovitosti`) — realitní služby
5. **Investice** (`/sluzby/investice`) — 2 investiční možnosti (od 500k a od 5M), výnosy
6. **Reference** (`/reference`) — 8 projektů s galeriemi
7. **Kariéra** (`/kariera`) — pracovní pozice
8. **Blog** (`/blog`) — seznam článků
9. **Kontakt** (`/kontakt`) — formulář, mapa, kontaktní info

### Kontext:
- Všechny stránky SSR
- Sdílený header/footer/navigace
- Dropdown menu pro služby v navigaci
- Kontaktní formulář s GDPR souhlasem
- Adresa: Rybná 716/24, 110 00 Praha 1
- Email: info@apartmentspushkin.com, Tel: +420 222 244 889
- IČO: 26740788, DIČ: CZ26740788

---

## BACKLOG


## ČEKÁ


## HOTOVÉ
