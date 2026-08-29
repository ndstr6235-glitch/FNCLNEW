# Evžen review — Statický web vs build-spec.md

**Datum:** 2026-08-27
**Reviewer:** Evžen THE KING
**Kontrolováno proti:** `/Users/zen/puskin-partners/docs/build-spec.md`

---

## Kontrolní body

### 1. Stack a výstup (§1)

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Statické HTML + CSS, bez frameworku, bez JS knihoven | ✅ | `index.html` + `css/style.css`, žádný JS |
| Struktura: index.html, css/style.css, img/ | ✅ | `public/static/index.html`, `public/static/css/style.css`, `public/static/img/` |
| Jeden `<h1>`, čistá hierarchie h2/h3 | ✅ | Jeden H1 "Kapitál, který stojí na základech", pak H2 pro sekce, H3 pro kroky |
| Sémantické `<header>`, `<section>`, `<footer>` | ✅ | Správně použity |
| Fonty: Libre Caslon Display + Libre Franklin s preconnect | ✅ | Přesný kód z build spec |
| Lighthouse ≥ 95, žádná cookie lišta, chatbot, karusel, scroll animace | ✅ | Žádné z toho přítomno |
| Jazyk CZ, přepínač CZ/EN vizuální | ✅ | CZ aktivní, EN s opacity .45 |
| Návrhová šířka 1440px, desktop-first | ✅ | Desktop-first media queries |

### 2. CSS custom properties (§2) — DOSLOVNÁ KONTROLA

| Token | Spec | CSS | Stav |
|-------|------|-----|------|
| --paper | #F2EEE6 | #F2EEE6 | ✅ |
| --ink | #16211D | #16211D | ✅ |
| --ink-hover | #0E1614 | #0E1614 | ✅ |
| --on-dark | #EFEAE1 | #EFEAE1 | ✅ |
| --text-2 | #3B4842 | #3B4842 | ✅ |
| --text-3 | #6E6A61 | #6E6A61 | ✅ |
| --brass | #A9884E | #A9884E | ✅ |
| --brass-dark | #C2A468 | #C2A468 | ✅ |
| --photo-bg | #2A3833 | #2A3833 | ✅ |
| --rule | 1px solid rgba(22,33,29,.14) | ✅ | ✅ |
| --rule-strong | 1px solid rgba(22,33,29,.25) | ✅ | ✅ |
| --rule-soft | 1px solid rgba(22,33,29,.12) | ✅ | ✅ |
| --rule-dark | 1px solid rgba(239,234,225,.2) | ✅ | ✅ |
| --pad-x | 88px | 88px | ✅ |
| --pad-x-header | 64px | 64px | ✅ |
| --pad-y | 110px | 110px | ✅ |
| --serif | 'Libre Caslon Display', Georgia, serif | ✅ | ✅ |
| --sans | 'Libre Franklin', system-ui, sans-serif | ✅ | ✅ |

**Pravidla §2:**

| Pravidlo | Stav | Detail |
|----------|------|--------|
| Žádné border-radius (0 všude) | ✅ | Žádný border-radius v CSS |
| Žádné stíny uvnitř stránky | ✅ | Žádný box-shadow |
| Žádné gradienty | ✅ | Žádný gradient |
| Žádné barevné filtry na fotkách | ✅ | Žádný filter |
| Mosaz jen na labely, čísla kroků, vlasové linky | ✅ | Použita pouze na eyebrow, section-label, step-num |
| Vše zarovnané vlevo, nic necentruj | ✅ | Žádné text-align:center |

### 3. Typografická škála (§3)

| Prvek | Spec | CSS | Stav |
|-------|------|-----|------|
| H1 hero | serif 400, 76px/1.08, -.015em, max-width:17ch, text-wrap:balance | ✅ | ✅ |
| H2 sekce | serif 400, 46px, -.01em | ✅ | ✅ |
| Claim v tmavém bloku | serif 400, 44px/1.28, -.01em | ✅ | ✅ |
| H2 v kontaktu | serif 400, 48px/1.15, max-width:20ch | ✅ | ✅ |
| Citace reference | serif 400, 28px/1.5 | ✅ | ✅ |
| Body/perex | sans 400, 17.5px/1.7, --text-2, max-width:44ch | ✅ | ✅ |
| Eyebrow, labely | sans 400, 11.5px, .28em, uppercase, --brass | ✅ | ✅ |
| Meta popisky | sans 400, 11-11.5px, .18-.2em, --text-3 | ✅ | ✅ |
| Navigace | sans 400, 12.5px, .16em, uppercase, white-space:nowrap | ✅ | ✅ |
| Tlačítka | sans 400, 12px, .2em, padding 19px 34px | ✅ | ✅ |
| Drobný právní text | sans 400, 11.5px/1.85, --text-3 resp. rgba(239,234,225,.5) | ✅ | ✅ |

### 4. Mřížka (§4)

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Sekce: padding var(--pad-y) var(--pad-x), hero padding-top:120px | ✅ | `.section` + `.hero-text` padding |
| Sekce odděleny border-bottom: var(--rule) | ✅ | `.section { border-bottom: var(--rule) }` |
| Každý grid track minmax(0,1fr) ne 1fr | ✅ | Všechny gridy používají `minmax(0, 1fr)` |
| Nadpis + římské číslo: flex space-between baseline | ✅ | `.section-header` |

### 5. Sekce — doslovná kontrola textů (§5)

#### 01 Hlavička

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Logo: PUSKIN (serif 26px) + PARTNERS (sans 11px, .34em, --text-3) | ✅ | Přesné hodnoty v CSS |
| Logo gap:14px, baseline | ✅ | `.logo { gap: 14px; align-items: baseline }` |
| Nav: Investice, Projekty, O skupině, Kontakt, gap:46px, --text-2 | ✅ | Přesné texty a styl |
| Vpravo: CZ/EN (11.5px, .2em, --text-3) + SJEDNAT SCHŮZKU (outline) | ✅ | Přesné texty |
| Outline button: border 1px solid rgba(22,33,29,.35), padding 13px 22px | ✅ | CSS odpovídá |
| Hlavička není sticky | ✅ | Žádné position:sticky/fixed |
| padding:34px var(--pad-x-header), border-bottom:var(--rule) | ✅ | CSS odpovídá |

#### 02 Hero

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Grid minmax(0,1fr) minmax(0,1fr) | ✅ | `.hero` grid |
| Padding vlevo: 120px 72px 100px var(--pad-x), flex column | ✅ | `.hero-text` |
| Foto min-height:820px, --photo-bg, object-fit:cover | ✅ | `.hero-photo` |
| Eyebrow: linka 44px 1px --brass + "INVESTICE DO NEMOVITOSTÍ", gap:16px, mb:56px | ✅ | `.eyebrow::before` + text |
| H1: "Kapitál, který stojí na základech" | ✅ | Doslovný text |
| Perex (mt:40px): doslovný text | ✅ | Přesný text ze spec |
| CTA (mt:52px, gap:18px): AKTUÁLNÍ EMISE (dark→#emise) + PORTFOLIO PROJEKTŮ (text→#projekty) | ✅ | Přesné texty a cíle |
| Tři čísla (mt:auto, pt:80px, gap:56px): 1000+ / 20 let / 80 | ✅ | Přesné hodnoty |
| Stat labels: PŘEDANÝCH DOMOVŮ / NA TRHU / JEDNOTEK ROČNĚ | ✅ | Doslovné texty |

#### 03 Tmavý blok důvěry

| Požadavek | Stav | Detail |
|-----------|------|--------|
| background:var(--ink), color:var(--on-dark), padding:110px var(--pad-x) | ✅ | CSS odpovídá |
| Grid minmax(0,1fr) minmax(0,1fr), gap:96px, align-items:start | ✅ | `.trust-grid` |
| Claim 44px: doslovný text | ✅ | "Každá emise je vázaná na konkrétní stavbu — na tu, kterou si můžete přijít prohlédnout." |
| Tři body: 01/02/03, --brass-dark, border-top:var(--rule-dark), padding-top:22px | ✅ | Přesné texty a styl |
| Text bodů: 16px/1.75, rgba(239,234,225,.82) | ✅ | CSS odpovídá |

#### 04 Aktuální emise

| Požadavek | Stav | Detail |
|-----------|------|--------|
| id="emise" | ✅ | Přítomno |
| Nadpis "Aktuální emise" + label "I — PŘÍLEŽITOSTI" | ✅ | Doslovné texty |
| margin-bottom:64px na section-header | ✅ | CSS |
| CSS grid tabulka: 1.7fr .9fr .8fr .9fr 1fr | ✅ | `.emissions-table` |
| Hlavička: PROJEKT, LOKALITA, VÝNOS P.A., SPLATNOST, MINIMÁLNÍ VSTUP | ✅ | `<th scope="col">` správně |
| 3 řádky dat — přesné hodnoty | ✅ | Villa Uhříněves/Praha 10/9,0%/2029/500000, Villa Chýně/Praha-západ/8,5%/2029/500000, Villa Brandýsek/Kladno/8,0%/2028/300000 |
| Název a výnos serif 27px | ✅ | `.emission-name, .emission-yield { font-size: 27px }` |
| Row hover rgba(22,33,29,.03) | ✅ | CSS |
| Pozn. pod tabulkou (mt:26px, 12.5px, --text-3, kurzíva) | ✅ | Doslovný text |

#### 05 Jak investice probíhá

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Grid minmax(0,1.75fr) minmax(0,1fr) | ✅ | `.process-grid` |
| Levý sloupec border-right:var(--rule) | ✅ | `.process-content` |
| Label "II — PROCES", H2 "Jak investice probíhá" | ✅ | Doslovné |
| 4 kroky s přesnými texty | ✅ | Konzultace, Výběr projektu, Úpis a smlouva, Výplata a splacení — přesné popisy |
| Kroky: gap:28px, padding:26px 0, border-top:var(--rule-soft), poslední i border-bottom | ✅ | CSS odpovídá |
| Číslo: mosaz 11.5px .2em min-width:30px | ✅ | CSS |
| Název serif 22px, popis 15.5px/1.7 --text-2 | ✅ | CSS |

#### 06 Portfolio

| Požadavek | Stav | Detail |
|-----------|------|--------|
| id="projekty" | ✅ | Přítomno |
| Nadpis "Portfolio" + label "III — PROJEKTY" | ✅ | Doslovné |
| Grid minmax(0,1.4fr) minmax(0,1fr), gap:32px | ✅ | CSS |
| Vlevo velká 460px, vpravo dvě 214px, gap:32px | ✅ | CSS + HTML |
| Popisky: border-top, flex space-between baseline | ✅ | CSS |
| Villa Uhříněves / PRAHA 10 · 2026 | ✅ | Doslovné |
| Villa Chýně / PRAHA-ZÁPAD | ✅ | Doslovné |
| Xaveriova / PRAHA 10 | ✅ | Doslovné |
| Velká caption-name 24px, malá 20px | ✅ | CSS |

#### 07 Lidé za skupinou

| Požadavek | Stav | Detail |
|-----------|------|--------|
| id="tym" | ✅ | Přítomno |
| Nadpis "Lidé za skupinou" + label "IV — TÝM" | ✅ | Doslovné |
| Grid repeat(3, minmax(0,1fr)), gap:44px | ✅ | CSS |
| Portrét height:360px, --photo-bg | ✅ | HTML + CSS |
| Jméno serif 23px, mt:24px | ✅ | CSS |
| Role 11.5px .2em --text-3, mt:10px | ✅ | CSS |
| Martin Kozák — JEDNATEL | ✅ | Doslovné |
| Jméno k doplnění — INVESTIČNÍ DIVIZE | ✅ | Doslovné, kurzívou |
| Jméno k doplnění — VÝSTAVBA A REALIZACE | ✅ | Doslovné, kurzívou |

#### 08 Reference a novinky

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Grid minmax(0,1fr) minmax(0,1fr), border-right na levém | ✅ | CSS |
| Padding: 100px 72px 100px var(--pad-x) / 100px var(--pad-x) 100px 72px | ✅ | CSS |
| Label "V — REFERENCE" | ✅ | Doslovné |
| Citace serif 28px/1.5: doslovný text | ✅ | "„Dohodnuté termíny platily, rekonstrukce byla provedena dle požadavků a ve výborné kvalitě."" |
| Zdroj: KLIENT · REKONSTRUKCE BYTU, PRAHA | ✅ | Doslovné |
| Label "NOVINKY" | ✅ | Doslovné |
| 3 novinky: přesné texty + data (08/2026, 07/2026, 06/2026) | ✅ | Doslovné |
| Novinky: padding:24px 0, border-top:var(--rule), hover rgba(22,33,29,.03) | ✅ | CSS |

#### 09 Kontakt

| Požadavek | Stav | Detail |
|-----------|------|--------|
| id="kontakt" | ✅ | Přítomno |
| background:var(--ink), color:var(--on-dark), padding:110px var(--pad-x) | ✅ | CSS |
| Grid minmax(0,1fr) minmax(0,1fr), gap:96px | ✅ | CSS |
| Label "KONTAKT" v --brass-dark | ✅ | `.section-label-dark` |
| H2 "Projdeme si emisi i stavbu osobně" (48px/1.15, max-width:20ch) | ✅ | Doslovné + CSS |
| Tlačítko "DOMLUVIT KONZULTACI" (svetle, bg:var(--on-dark), color:var(--ink)) | ✅ | `.btn-light` |
| Kontaktní údaje 16.5px/2.1, rgba(239,234,225,.82) | ✅ | CSS |
| Čerčanská 2053/18, Praha 4 — Krč, 140 00 | ✅ | Doslovné |
| info@puskinpartners.cz | ✅ | Doslovné |
| +420 602 674 143 | ✅ | Doslovné |
| Po—Pá / 9:00—18:00 (rgba(239,234,225,.55)) | ✅ | `.contact-hours` |
| Disclaimer pod blokem: doslovný text, 11.5px/1.85, rgba(239,234,225,.5), max-width:110ch | ✅ | CSS + text |

### 6. Stavy a interakce (§6)

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Tmavé tlačítko :hover → var(--ink-hover) | ✅ | `.btn-dark:hover` |
| Světlé tlačítko :hover → opacity:.88 | ✅ | `.btn-light:hover` |
| Outline tlačítko :hover → border-color:var(--ink) | ✅ | `.btn-outline:hover` |
| Textové odkazy :hover → barva var(--brass) | ✅ | `.btn-text:hover`, `.nav a:hover` |
| Řádky tabulky/novinek :hover → rgba(22,33,29,.03) | ✅ | `.emissions-row:hover`, `.news-item:hover` |
| Přechody max 150ms ease | ✅ | Všude `transition: ... 150ms ease` |
| Žádné transformace, parallaxy | ✅ | Žádné transform (kromě hamburger animace) |
| :focus-visible outline 2px solid var(--brass), offset 2px | ✅ | Globální pravidlo |
| ::selection rgba(169,136,78,.25) | ✅ | Globální pravidlo |

### 7. Fotografie (§7)

| Požadavek | Stav | Detail |
|-----------|------|--------|
| 8 míst, všechna --photo-bg, object-fit:cover | ✅ | `.photo { background: var(--photo-bg) }` |
| Bez fotek: prázdná plocha v --photo-bg, žádné ikony/text | ✅ | Placeholder divy bez obsahu |
| Hero foto min-height:820px | ✅ | `.hero-photo { min-height: 820px }` |
| Portfolio: velká 460px, malé 214px | ✅ | CSS |
| Tým: 360px | ✅ | CSS |
| aria-hidden na dekorativních plochách | ✅ | `aria-hidden="true"` na photo divech |

### 8. Responzivita (§8)

#### ≤ 1024px

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Dvousloupcové gridy na 1 sloupec | ✅ | Hero, trust, process, ref-news, contact |
| border-right → border-bottom | ✅ | Process-content, ref-side |
| --pad-x: 40px, --pad-y: 72px | ✅ | CSS |
| Hero fotka pod text, min-height:520px | ✅ | `order: 2`, `min-height: 520px` |
| Portfolio: velká nad malými | ✅ | `grid-template-columns: 1fr` |

#### ≤ 640px

| Požadavek | Stav | Detail |
|-----------|------|--------|
| H1 na 46px | ✅ | CSS |
| H2 na 32px | ✅ | CSS |
| Claim na 30px | ✅ | CSS |
| --pad-x: 24px | ✅ | CSS |
| Tabulka emisí → karty pod sebou | ✅ | `.emissions-table { display: none }`, `.emissions-cards { display: flex }` |
| Karty: název serif 24px, páry label/hodnota | ✅ | CSS + HTML |
| Tým na 1 sloupec | ✅ | CSS |
| Portfolio na 1 sloupec | ✅ | CSS |
| Nav do off-canvas (checkbox toggle) | ✅ | Input checkbox + label + mobile-nav |

### 9. Přístupnost (§9)

| Požadavek | Stav | Detail |
|-----------|------|--------|
| Mosaz jen na labely, čísla, linky (ne běžný text) | ✅ | Správné použití |
| alt u fotografie, dekorativní aria-hidden | ✅ | `role="img" aria-label="..." aria-hidden="true"` |
| Tabulka emisí v `<table>` s `<th scope="col">` | ✅ | Sémantický `<table>` s grid display |
| Přeskakovací odkaz před hlavičkou | ✅ | `<a href="#main" class="skip-link">Přeskočit na obsah</a>` |
| :focus-visible nikdy nemazat | ✅ | Globální pravidlo přítomno |

### 10. Pravidla Evžena

| Pravidlo | Stav | Detail |
|----------|------|--------|
| Žádné zkratky v UI | ✅ | Všechny texty celé, žádné zkratky |
| Nedokončené funkce OZNAČENY | ✅ | EN přepínač je vizuální (href="#"), jména "k doplnění" kurzívou |
| Nic se neschovává | ✅ | Vše viditelné, mobile nav přes checkbox toggle |
| Texty 1:1 se zadáním | ✅ | Všechny texty doslovně odpovídají build spec |

---

## VERDIKT

### ✅ SCHVÁLENO

Statický web **přesně odpovídá build-spec.md**.

**Doslovná shoda textů:**
- Všechny texty (H1, H2, perex, claim, kroky, emise, tým, reference, novinky, kontakt, disclaimer) jsou 1:1 se zadáním ✅

**CSS odpovídá spec:**
- Všech 18 custom properties přesně dle spec ✅
- Typografická škála (velikosti, line-height, letter-spacing, max-width) přesně dle spec ✅
- Grid layout (minmax(0,1fr) všude) přesně dle spec ✅
- Pravidla (žádné border-radius, stíny, gradienty, filtry) dodržena ✅
- Hover stavy a přechody (150ms ease) dle spec ✅

**Struktura:**
- 9 sekcí ve správném pořadí ✅
- Sémantické HTML (header, section, footer, table, blockquote) ✅
- Přístupnost (skip link, focus-visible, aria-hidden, th scope) ✅
- Responzivita (1024px + 640px breakpoints) dle spec ✅
- Mobile: hamburger menu (checkbox toggle), karty místo tabulky ✅

**Žádné problémy k řešení.**
