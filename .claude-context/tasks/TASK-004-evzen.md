# TASK-004: Evžen review — Podstránky (9 stránek)

**Datum:** 2026-08-24
**Reviewer:** Evžen THE KING
**Kontrolováno proti:** Původní zadání od uživatele

---

## Kontrola shody se zadáním

### 1. Struktura stránek — "stejná jako oakgroup.cz"

| # | Stránka | URL | Existuje | Metadata | Sekce dle plánu |
|---|---------|-----|----------|----------|-----------------|
| 1 | O nás | `/o-nas` | ✅ | ✅ title + description | ✅ PageHero, Company story, Values, TeamGrid, CTA |
| 2 | Development | `/sluzby/development` | ✅ | ✅ | ✅ PageHero, Stats, Differentiators, Projects, Process, CTA |
| 3 | Rekonstrukce | `/sluzby/rekonstrukce` | ✅ | ✅ | ✅ PageHero, 9-step process, BeforeAfter, Projects, FAQ, Testimonials, CTA |
| 4 | Nemovitosti | `/sluzby/nemovitosti` | ✅ | ✅ | ✅ PageHero, 3 služby, Differentiators, CTA |
| 5 | Investice | `/sluzby/investice` | ✅ | ✅ | ✅ PageHero, 2 modely, Process, Výhody, CTA |
| 6 | Reference | `/reference` | ✅ | ✅ | ✅ PageHero, ProjectCards (8), Testimonials, CTA |
| 7 | Kariéra | `/kariera` | ✅ | ✅ | ✅ PageHero, Benefits, JobPositions, Process, CTA |
| 8 | Blog | `/blog` | ✅ | ✅ | ✅ PageHero, BlogList, Newsletter |
| 9 | Kontakt | `/kontakt` | ✅ | ✅ | ✅ PageHero, Contact+Form, Map, Phone CTA |

**Všech 9 podstránek existuje a má správné sekce.**

### 2. 4 služby — odpovídají zadání

| Služba | Stránka existuje | Hero title | Obsah |
|--------|-----------------|------------|-------|
| Development | ✅ `/sluzby/development` | "Development" | Stats, 6 diferenciátorů, 3 projekty, 4-step process |
| Rekonstrukce | ✅ `/sluzby/rekonstrukce` | "Rekonstrukce" | 9-step process, BeforeAfter, projekty, FAQ, testimonials |
| Nemovitosti | ✅ `/sluzby/nemovitosti` | "Nemovitosti" | 3 služby (prodej/nákup/správa), 4 diferenciátory |
| Investice | ✅ `/sluzby/investice` | "Investice do nemovitostí" | 2 modely (pronájem/development), 4-step process, výhody |

### 3. Reference / projekty — "stejné jako oakgroup.cz"

| Projekt | Zadání (dle plánu) | Implementace | Stav |
|---------|-------------------|-------------|------|
| Byt Biskoupová | ✅ | ✅ Praha, Rekonstrukce bytu | ✅ |
| Byt Kladno | ✅ | ✅ Kladno, Rekonstrukce bytu | ✅ |
| Byt Běchovice | ✅ | ✅ Praha-východ, Rekonstrukce bytu | ✅ |
| Byt Služská | ✅ | ✅ Praha, Rekonstrukce bytu | ✅ |
| Byt Tobrucká | ✅ | ✅ Praha, Rekonstrukce bytu | ✅ |
| Byt Sulická | ✅ | ✅ Praha, Rekonstrukce bytu | ✅ |
| Vila Šestajovice | ✅ | ✅ Praha-východ, Development | ✅ |
| Vila Uhříněves | ✅ | ✅ Praha, Development | ✅ |

**Všech 8 referenčních projektů odpovídá plánu.**

### 4. Kontaktní stránka

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Adresa: Rybná 716/24, Praha 1 | ✅ | Z siteConfig.company.address |
| Email: info@apartmentspushkin.com | ✅ | Z siteConfig.contact.email |
| Telefon: +420 222 244 889 | ✅ | Z siteConfig.contact.phone |
| IČO: 26740788 | ✅ | Z siteConfig.company.ico |
| DIČ: CZ26740788 | ✅ | Z siteConfig.company.dic |
| Otevírací hodiny | ✅ | Po-Pá 09:00-18:00 |
| Kontaktní formulář | ✅ | Jméno, Email, Telefon, Předmět (select), Zpráva |
| Předmět — select options | ✅ | Obecný dotaz, Development, Rekonstrukce, Nemovitosti, Investice, Kariéra |
| GDPR checkbox | ✅ | "Souhlasím se zpracováním osobních údajů" |
| Submit disabled bez GDPR | ✅ | `disabled={!agreed}` + opacity-50 |
| Mapa | ✅ | MapEmbed komponenta |
| CTA s telefonem | ✅ | Klikatelný tel: link |

### 5. O nás — firemní údaje

| Údaj | Požadavek | Implementace | Stav |
|------|-----------|-------------|------|
| Firma | Alexandr Puškin, s.r.o. | ✅ "Společnost Alexandr Puškin, s.r.o." v textu | ✅ |
| Majitel | Lukáš Salamánek | ✅ "Pod vedením Lukáše Salamánka" v textu + TeamGrid | ✅ |
| 20+ let | ✅ | ✅ "od roku 2004", "více než dvě dekády" | ✅ |
| Tým grid | ✅ | ✅ 6 členů včetně Lukáše Salamánka jako "Majitel & jednatel" | ✅ |
| 3 hodnoty | ✅ | ✅ Kvalita, Důvěra, Inovace | ✅ |

### 6. Sdílené komponenty (reuse)

| Komponenta | Plán | Existuje | Použití |
|-----------|------|----------|---------|
| PageHero | ✅ | ✅ | Všech 9 podstránek |
| CTASection | ✅ | ✅ | O nás, Development, Rekonstrukce, Nemovitosti, Investice, Reference, Kariéra |
| ProcessTimeline | ✅ | ✅ | Development, Investice, Kariéra |
| ProjectCards | ✅ | ✅ | Development, Rekonstrukce, Reference |
| TeamGrid | ✅ | ✅ | O nás + Homepage |
| DifferentiatorsGrid | ✅ | ✅ | Development, Nemovitosti, Investice |
| RenovationProcess | ✅ | ✅ | Rekonstrukce |
| BeforeAfterGallery | ✅ | ✅ | Rekonstrukce |
| FAQ | ✅ | ✅ | Rekonstrukce |
| InvestmentModels | ✅ | ✅ | Investice |
| BenefitsGrid | ✅ | ✅ | Kariéra |
| JobPositions | ✅ | ✅ | Kariéra |
| BlogList | ✅ | ✅ | Blog |
| ContactForm | ✅ | ✅ | Kontakt |
| MapEmbed | ✅ | ✅ | Kontakt |

**Všech 15 sdílených komponent existuje a je správně použito.**

### 7. Data soubory

| Soubor | Existuje | Obsah |
|--------|----------|-------|
| team.ts | ✅ | 6 členů týmu |
| services.ts | ✅ | Diferenciátory, proces |
| projects.ts | ✅ | 8 projektů + 3 featured |
| testimonials.ts | ✅ | Sdíleno s homepage |
| blog.ts | ✅ | Blog články |
| jobs.ts | ✅ | Pozice, benefity, hiring process |
| faq.ts | ✅ | FAQ rekonstrukce |
| renovation-steps.ts | ✅ | 9 kroků |
| investment-models.ts | ✅ | 2 modely, process, advantages |

**Všech 9 data souborů existuje.**

### 8. Bonus: TASK-003-fix — Tým sekce na homepage

Implementátor doplnil TeamGrid na homepage (dle fix task #17). ✅

### 9. Pravidla Evžena

| Pravidlo | Stav | Detail |
|----------|------|--------|
| Žádné zkratky v UI | ✅ | Všechny texty celé — "Rekonstrukce", "Nemovitosti", "Development" |
| Nedokončené funkce OZNAČENY | ✅ | ContactForm TODO, Newsletter TODO — backend v budoucnu |
| Nic se neschovává | ✅ | Všechny stránky v navigaci, žádné skryté |
| Duplicitní data záměrná | ✅ | Testimonials reuse na více stránkách — OK, konzistentní |

---

## VERDIKT

### ✅ SCHVÁLENO

TASK-004 (Podstránky) **odpovídá původnímu zadání**.

Všechny kritické body splněny:
- Všech 9 podstránek implementováno dle plánu ✅
- 4 služby (Development, Rekonstrukce, Nemovitosti, Investice) s unikátním obsahem ✅
- Reference s 8 projekty dle OAK Group ✅
- Kontakt s formulářem, GDPR, mapou a správnými firemními údaji ✅
- O nás s příběhem firmy, hodnotami, TeamGrid a Lukášem Salamánkem ✅
- Kariéra s benefity, pozicemi a náborovým procesem ✅
- Blog s články a newsletter ✅
- 15 sdílených komponent (DRY princip) ✅
- 9 data souborů s placeholder obsahem ✅
- TASK-003-fix (Tým sekce na homepage) doplněna ✅
- Build bez chyb ✅

**Žádné problémy k řešení.**
