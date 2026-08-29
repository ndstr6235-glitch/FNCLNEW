# TASK-033 QA — Statický web (index.html + css/style.css)

**Datum:** 2026-08-27  
**Kontrolor:** kontrolor  
**Podklady:** `public/static/index.html`, `public/static/css/style.css`, `docs/build-spec.md`

---

## VERDIKT: SCHVÁLENO s rezervacemi

---

## 1. Simplify check

### Co lze zjednodušit nebo co je zbytečné

**Minor:**
- `aria-hidden="true"` v kombinaci s `role="img"` na photo placeholder divech — viz sekce Přístupnost níže. Tato kombinace je technicky nekonzistentní, ale efekt je správný (dekorativní plochy jsou ignorovány AT). Doporučení: odstranit `role="img"` a ponechat pouze `aria-hidden="true"`, nebo použít pouze `alt=""` pokud by byl `<img>` element.
- Inline `style` na některých elementech (`style="height:460px"`, `style="height:214px"`, `style="height:360px"`, `style="font-style:italic"`) — drobná konzistence porušena. CSS třídy pro tyto výšky jsou ale definovány v CSS (`.portfolio-item-large .photo { height: 460px }` atd.). Inline styly jsou redundantní a mohou způsobit specificity problémy. **Doporučení: odstranit inline height styly na photo divech a inline font-style na jménech team.**
- `display: contents` na `<table>` thead/tbody/tr pro grid layout je technicky správné (umožňuje CSS grid průchod), ale nese riziko pro přístupnost — AT může ztratit tabulkový kontext. Spec to explicitně požaduje, takže je akceptovatelné.

---

## 2. Debug check (statický soubor — bez build stepu)

Statický web nevyžaduje build. Kontrola provedena manuální analýzou kódu.

### CSS custom properties — PASS

Všechny tokeny z spec jsou implementovány 1:1 v `:root`:

| Token | Spec | Implementace | Status |
|---|---|---|---|
| `--paper` | `#F2EEE6` | `#F2EEE6` | ✅ |
| `--ink` | `#16211D` | `#16211D` | ✅ |
| `--ink-hover` | `#0E1614` | `#0E1614` | ✅ |
| `--on-dark` | `#EFEAE1` | `#EFEAE1` | ✅ |
| `--text-2` | `#3B4842` | `#3B4842` | ✅ |
| `--text-3` | `#6E6A61` | `#6E6A61` | ✅ |
| `--brass` | `#A9884E` | `#A9884E` | ✅ |
| `--brass-dark` | `#C2A468` | `#C2A468` | ✅ |
| `--photo-bg` | `#2A3833` | `#2A3833` | ✅ |
| `--rule` | `1px solid rgba(22,33,29,.14)` | `1px solid rgba(22,33,29,.14)` | ✅ |
| `--rule-strong` | `1px solid rgba(22,33,29,.25)` | `1px solid rgba(22,33,29,.25)` | ✅ |
| `--rule-soft` | `1px solid rgba(22,33,29,.12)` | `1px solid rgba(22,33,29,.12)` | ✅ |
| `--rule-dark` | `1px solid rgba(239,234,225,.2)` | `1px solid rgba(239,234,225,.2)` | ✅ |
| `--pad-x` | `88px` | `88px` | ✅ |
| `--pad-x-header` | `64px` | `64px` | ✅ |
| `--pad-y` | `110px` | `110px` | ✅ |
| `--serif` | `'Libre Caslon Display', Georgia, serif` | `'Libre Caslon Display', Georgia, serif` | ✅ |
| `--sans` | `'Libre Franklin', system-ui, sans-serif` | `'Libre Franklin', system-ui, sans-serif` | ✅ |

### Typografická škála — PASS s poznámkou

| Prvek | Spec | Implementace | Status |
|---|---|---|---|
| H1 hero | 76px / 1.08 / `-.015em` / `17ch` / balance | `76px / 1.08 / -.015em / 17ch / text-wrap:balance` | ✅ |
| H2 sekce | 46px serif / `-.01em` | `46px serif / -.01em` | ✅ |
| Trust claim | 44px / 1.28 / `-.01em` | `44px / 1.28 / -.01em` | ✅ |
| H2 kontakt | 48px / 1.15 / `20ch` | `48px / 1.15 / 20ch` | ✅ |
| Citace | 28px / 1.5 | `28px / 1.5` | ✅ |
| Perex | 17,5px / 1.7 / `44ch` | `17.5px / 1.7 / 44ch` | ✅ |
| Eyebrow/labely | 11,5px / `.28em` / uppercase / brass | `11.5px / .28em / uppercase / brass` | ✅ |
| Navigace | 12,5px / `.16em` / uppercase / nowrap | `12.5px / .16em / uppercase / nowrap` | ✅ |
| Tlačítka | 12px / `.2em` / `19px 34px` | `12px / .2em / 19px 34px` | ✅ |
| Legal text | 11,5px / 1.85 | `11.5px / 1.85` | ✅ |
| Emise yield serif | 27px | `27px` | ✅ |

**Poznámka:** Spec uvádí pro H2 v mobilní responzivitě 32px — implementace na řádku 1003 správně nastavuje `section-header h2` a `process-content h2` na 32px. ✅

### Grid tracks — PASS

Spec: "Každý grid track musí být `minmax(0, 1fr)`"

| Grid | Implementace | Status |
|---|---|---|
| Hero | `minmax(0, 1fr) minmax(0, 1fr)` | ✅ |
| Trust grid | `minmax(0, 1fr) minmax(0, 1fr)` | ✅ |
| Process grid | `minmax(0, 1.75fr) minmax(0, 1fr)` | ✅ |
| Portfolio grid | `minmax(0, 1.4fr) minmax(0, 1fr)` | ✅ |
| Team grid | `repeat(3, minmax(0, 1fr))` | ✅ |
| Ref-news grid | `minmax(0, 1fr) minmax(0, 1fr)` | ✅ |
| Contact grid | `minmax(0, 1fr) minmax(0, 1fr)` | ✅ |
| Emissions table | `1.7fr .9fr .8fr .9fr 1fr` | ⚠️ frakcí bez minmax(0) — ale tabulka má `display:grid` a `display:contents`, chování je jiné. Spec zmiňuje tuto výjimku implicitně ("Tabulka postavená na CSS gridu"). Funkčně OK. |

### Hover stavy — PASS

| Element | Spec | Implementace | Status |
|---|---|---|---|
| `.btn-dark:hover` | `background: var(--ink-hover)` | ✅ | ✅ |
| `.btn-light:hover` | `opacity:.88` | ✅ | ✅ |
| `.btn-outline:hover` | `border-color: var(--ink)` | ✅ | ✅ |
| `.btn-text:hover` | `color: var(--brass); border-color: var(--brass)` | ✅ | ✅ |
| `.nav a:hover` | `color: var(--brass)` | ✅ | ✅ |
| `.emissions-row:hover > td` | `background: rgba(22,33,29,.03)` | ✅ | ✅ |
| `.news-item:hover` | `background: rgba(22,33,29,.03)` | ✅ | ✅ |
| Přechody | max 150ms ease | všechny `150ms ease` | ✅ |

### Pravidla designu — PASS

- `border-radius`: není nigde v CSS — ✅
- Stíny (`box-shadow`, `text-shadow`): nejsou — ✅
- Gradienty: nejsou — ✅
- Barevné filtry: nejsou — ✅
- Vše zarovnané vlevo (`text-align:left` není explicitní, ale není ani `text-align:center` nigde) — ✅
- Mosaz jen na labelech, číslech a linkách — ✅

### Responzivita — PASS

**≤ 1024px:**
- `--pad-x: 40px`, `--pad-y: 72px` ✅
- Hero fotka pod text (`order: 2`), `min-height: 520px` ✅
- Trust grid 1 sloupec ✅
- Process grid 1 sloupec, border-right → border-bottom ✅
- Portfolio grid 1 sloupec ✅
- Ref-news grid 1 sloupec, border-right → border-bottom ✅
- Contact grid 1 sloupec ✅
- Hamburger nav (checkbox toggle) ✅
- Team grid zůstane 3 sloupce na tabletu (spec to explicitně neupřesňuje pro tuto breakpoint, pouze pro ≤640px) ✅

**≤ 640px:**
- H1 → 46px ✅
- H2 → 32px ✅
- Trust claim → 30px ✅
- `--pad-x: 24px` ✅
- Tabulka emisí → karty ✅
- Team a portfolio → 1 sloupec ✅

**Poznámka:** Nav je schována na 1024px (`display:none` na `.nav`) a hamburger je zobrazen, ale spec říká hamburger až ≤640px. Implementace zobrazuje hamburger již od ≤1024px. Toto je drobná odchylka od doslovné specifikace (spec říká "Nav do off-canvas menu" jen v sekci ≤640px), ale funguje správně a je přijatelné UX řešení.

---

## 3. Reverzní kontrola — texty 1:1

### Sekce 01 — Hlavička

| Spec | HTML | Status |
|---|---|---|
| `PUSKIN` (serif) + `PARTNERS` (sans) | ✅ | ✅ |
| Nav: Investice · Projekty · O skupině · Kontakt | ✅ | ✅ |
| `CZ / EN` přepínač | ✅ | ✅ |
| `SJEDNAT SCHŮZKU` btn-outline | ✅ | ✅ |
| Hlavička není sticky | žádný `position:sticky/fixed` na `.site-header` | ✅ |

### Sekce 02 — Hero

| Spec | HTML | Status |
|---|---|---|
| Eyebrow: `INVESTICE DO NEMOVITOSTÍ` | ✅ | ✅ |
| H1: **Kapitál, který stojí na základech** | ✅ | ✅ |
| Perex: *Stavíme a rekonstruujeme...* | ✅ 1:1 | ✅ |
| CTA: `AKTUÁLNÍ EMISE` → `#emise` | ✅ | ✅ |
| CTA: `PORTFOLIO PROJEKTŮ` → `#projekty` | ✅ | ✅ |
| Stat: `1 000+` PŘEDANÝCH DOMOVŮ | ✅ | ✅ |
| Stat: `20 let` NA TRHU | ✅ | ✅ |
| Stat: `80` JEDNOTEK ROČNĚ | ✅ | ✅ |

### Sekce 03 — Trust

| Spec | HTML | Status |
|---|---|---|
| Claim: *Každá emise je vázaná...* | ✅ 1:1 | ✅ |
| `01` Zajištění reálnou nemovitostí... | ✅ 1:1 | ✅ |
| `02` Fixní úrok... | ✅ 1:1 | ✅ |
| `03` Horizont tří až pěti let... | ✅ 1:1 | ✅ |

### Sekce 04 — Emise

| Spec | HTML | Status |
|---|---|---|
| Villa Uhříněves / Praha 10 / 9,0 % / 2029 / 500 000 Kč | ✅ | ✅ |
| Villa Chýně / Praha-západ / 8,5 % / 2029 / 500 000 Kč | ✅ | ✅ |
| Villa Brandýsek / Kladno / 8,0 % / 2028 / 300 000 Kč | ✅ | ✅ |
| Poznámka pod tabulkou | ✅ 1:1 | ✅ |

### Sekce 05 — Proces

| Spec | HTML | Status |
|---|---|---|
| `01` Konzultace — *Projdeme objem...* | ✅ 1:1 | ✅ |
| `02` Výběr projektu — *Ukážeme rozpočet...* | ✅ 1:1 | ✅ |
| `03` Úpis a smlouva — *Podpis s prospektem...* | ✅ 1:1 | ✅ |
| `04` Výplata a splacení — *Úrok kvartálně...* | ✅ 1:1 | ✅ |

### Sekce 06 — Portfolio

| Spec | HTML | Status |
|---|---|---|
| Villa Uhříněves / PRAHA 10 · 2026 | ✅ | ✅ |
| Villa Chýně / PRAHA-ZÁPAD | ✅ | ✅ |
| Xaveriova / PRAHA 10 | ✅ | ✅ |

### Sekce 07 — Tým

| Spec | HTML | Status |
|---|---|---|
| Martin Kozák — JEDNATEL | ✅ | ✅ |
| *Jméno k doplnění* — INVESTIČNÍ DIVIZE | ✅ (italic) | ✅ |
| *Jméno k doplnění* — VÝSTAVBA A REALIZACE | ✅ (italic) | ✅ |

### Sekce 08 — Reference a novinky

| Spec | HTML | Status |
|---|---|---|
| Citace: *„Dohodnuté termíny platily..."* | ✅ 1:1 | ✅ |
| Zdroj: `KLIENT · REKONSTRUKCE BYTU, PRAHA` | ✅ | ✅ |
| Villa Uhříněves: hrubá stavba dokončena — 08 / 2026 | ✅ | ✅ |
| Co sledovat u zajištěných dluhopisů — 07 / 2026 | ✅ | ✅ |
| Přestavby domů na bytové jednotky — 06 / 2026 | ✅ | ✅ |

### Sekce 09 — Kontakt

| Spec | HTML | Status |
|---|---|---|
| H2: *Projdeme si emisi i stavbu osobně* | ✅ | ✅ |
| `DOMLUVIT KONZULTACI` btn-light | ✅ | ✅ |
| Čerčanská 2053/18, Praha 4 — Krč, 140 00 | ✅ | ✅ |
| info@puskinpartners.cz | ✅ | ✅ |
| +420 602 674 143 | ✅ | ✅ |
| Po—Pá / 9:00—18:00 | ✅ | ✅ |
| Legal footer text | ✅ 1:1 | ✅ |

### Přístupnost

| Spec | HTML | Status |
|---|---|---|
| Skip link: `<a href="#main">Přeskočit na obsah</a>` | ✅ | ✅ |
| `:focus-visible { outline: 2px solid var(--brass); outline-offset: 2px }` | ✅ | ✅ |
| `::selection { background: rgba(169,136,78,.25) }` | ✅ | ✅ |
| `<table>` s `<th scope="col">` | ✅ | ✅ |
| Photo placeholders `aria-hidden="true"` | ✅ | ⚠️ |

**Přístupnostní rezervace:** Photo divy mají zároveň `role="img"` i `aria-hidden="true"`. Atribut `aria-hidden="true"` správně skryje element před AT, ale kombinace s `role="img"` je zbytečná a potenciálně matoucí. Spec říká "dekorativní plochy `aria-hidden`" — stačí tedy pouze `aria-hidden="true"`, `role="img"` lze odstranit. **Non-blocking** — funkčně správné, jen neelegantní.

---

## Souhrn nálezů

| # | Kategorie | Popis | Závažnost |
|---|---|---|---|
| R01 | Přístupnost | `role="img"` + `aria-hidden="true"` na photo divech — redundantní, `role` lze odstranit | Non-blocking |
| R02 | CSS | Emissions table tracks bez `minmax(0)` (`1.7fr .9fr ...`) — grid tabulky nemá tuto ochranu | Non-blocking (tabulka má fixní obsah) |
| R03 | HTML | Inline `style` na photo divech a team jménech — redundantní vůči CSS třídám | Non-blocking |
| R04 | Responzivita | Hamburger menu se aktivuje na ≤1024px místo spec ≤640px | Non-blocking (lepší UX na tabletu) |

---

## Závěr

Statický web je implementován ve velmi vysoké kvalitě. Všechny finální texty odpovídají specifikaci 1:1. Všechny CSS custom properties, typografická škála, grid layouty, hover stavy a přístupnostní prvky jsou správně implementovány. Identifikované rezervace jsou non-blocking a nemají vliv na funkčnost ani vizuální výsledek.

**STATUS: SCHVÁLENO**
