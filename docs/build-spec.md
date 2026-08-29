# Puskin Partners — build spec

Zadání pro Claude Code. Postav statický web podle tohoto dokumentu. Nevymýšlej vlastní barvy, fonty ani sekce. Všechny hodnoty níže jsou závazné.

## 0. Zadání v jedné větě

Jednostránkový web investiční a developerské skupiny **Puskin Partners** (Praha, nemovitosti, dluhopisové emise). Cíl: důvěra a prestiž u drobných investorů (vstup 300 tis. – 5 mil. Kč). Konverze na schůzku je druhotná.

## 1. Stack a výstup

- Statické HTML + CSS. Bez frameworku, bez build stepu, bez JS knihoven.
- Struktura souborů:
  ```
  index.html
  css/style.css
  img/            (fotografie dodá klient, viz §7)
  ```
- Jeden `<h1>`, dál čistá hierarchie `h2` / `h3`. Sémantické `<header>`, `<section>`, `<footer>`.
- Fonty z Google Fonts s `preconnect`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Libre+Franklin:wght@300;400;500&display=swap">
  ```
- Cíl Lighthouse performance ≥ 95. Žádná cookie lišta, chatbot, karusel ani scroll animace.
- Jazyk obsahu CZ. Přepínač `CZ / EN` v hlavičce je vizuální (EN texty nejsou dodány) — udělej z něj odkaz na `#`, aktivní CZ plnou barvou, EN na `opacity:.45`.
- Návrhová šířka 1440 px, desktop-first.

## 2. CSS custom properties

Zapiš do `:root` přesně tyto tokeny a všude používej jen je:

```css
:root {
  --paper:        #F2EEE6;  /* podklad stránky */
  --ink:          #16211D;  /* text, tmavé bloky, plná tlačítka */
  --ink-hover:    #0E1614;  /* pressed / hover tmavého tlačítka */
  --on-dark:      #EFEAE1;  /* text v tmavých blocích */
  --text-2:       #3B4842;  /* perexy, odstavce */
  --text-3:       #6E6A61;  /* meta popisky, drobný text */
  --brass:        #A9884E;  /* akcent na světlém */
  --brass-dark:   #C2A468;  /* akcent na tmavém */
  --photo-bg:     #2A3833;  /* plocha pod fotografií */

  --rule:         1px solid rgba(22,33,29,.14);   /* linka na světlém */
  --rule-strong:  1px solid rgba(22,33,29,.25);
  --rule-soft:    1px solid rgba(22,33,29,.12);
  --rule-dark:    1px solid rgba(239,234,225,.2); /* linka na tmavém */

  --pad-x:        88px;   /* horizontální padding sekcí */
  --pad-x-header: 64px;   /* horizontální padding hlavičky */
  --pad-y:        110px;  /* vertikální padding sekcí */

  --serif:  'Libre Caslon Display', Georgia, serif;
  --sans:   'Libre Franklin', system-ui, sans-serif;
}
```

Pravidla: **žádné** `border-radius` (0 všude), žádné stíny uvnitř stránky, žádné gradienty, žádné barevné filtry na fotkách. Mosaz nikdy jako velká plocha — jen labely, čísla kroků a vlasové linky. Vše zarovnané vlevo, nic necentruj.

## 3. Typografická škála

| Prvek | Font | Velikost / line-height | Detail |
|---|---|---|---|
| H1 hero | serif 400 | 76px / 1.08 | `letter-spacing:-.015em`, `max-width:17ch`, `text-wrap:balance` |
| H2 sekce | serif 400 | 46px | `letter-spacing:-.01em` |
| Claim v tmavém bloku | serif 400 | 44px / 1.28 | `letter-spacing:-.01em` |
| H2 v kontaktu | serif 400 | 48px / 1.15 | `max-width:20ch` |
| Karty projektů, jména | serif 400 | 20–27px | dle sekce |
| Citace reference | serif 400 | 28px / 1.5 | |
| Body / perex | sans 400 | 15,5–17,5px / 1.7–1.8 | barva `--text-2`, `max-width:44ch` v heru |
| Eyebrow, labely | sans 400 | 11,5px | `letter-spacing:.28em`, uppercase, `--brass` |
| Meta popisky | sans 400 | 11–11,5px | `letter-spacing:.18–.2em`, `--text-3` |
| Navigace | sans 400 | 12,5px | `letter-spacing:.16em`, uppercase, `white-space:nowrap` |
| Tlačítka | sans 400 | 12px | `letter-spacing:.2em`, padding `19px 34px` |
| Drobný právní text | sans 400 | 11,5px / 1.85 | `--text-3`, resp. `rgba(239,234,225,.5)` na tmavém |

## 4. Mřížka

- Sekce: `padding: var(--pad-y) var(--pad-x)`. Hero `padding-top:120px`.
- Sekce se od sebe oddělují `border-bottom: var(--rule)`, ne prázdným místem.
- **Každý grid track musí být `minmax(0, 1fr)`**, ne `1fr`. Fotografické bloky jinak grid roztlačí a obsah přeteče. Platí i pro `repeat(3, minmax(0,1fr))`.
- Nadpis sekce a její římské číslo jsou na jednom řádku: `display:flex; justify-content:space-between; align-items:baseline`.

## 5. Sekce — struktura a finální texty

Texty jsou finální, přepiš je 1:1.

### 01 Hlavička
`display:flex; justify-content:space-between; align-items:center; padding:34px var(--pad-x-header); border-bottom: var(--rule)`

- Logo vlevo: `PUSKIN` (serif, 26px) + `PARTNERS` (sans, 11px, `letter-spacing:.34em`, `--text-3`) na společné baseline, `gap:14px`.
- Nav středem: `Investice · Projekty · O skupině · Kontakt`, `gap:46px`, barva `--text-2`.
- Vpravo `gap:30px`: přepínač `CZ / EN` (11,5px, `.2em`, `--text-3`) a outline tlačítko `SJEDNAT SCHŮZKU` — `border:1px solid rgba(22,33,29,.35); padding:13px 22px`.
- Hlavička není sticky.

### 02 Hero
Grid `minmax(0,1fr) minmax(0,1fr)`. Vlevo text (`padding:120px 72px 100px var(--pad-x)`, `display:flex; flex-direction:column`), vpravo fotografie na výšku `min-height:820px`, `background:var(--photo-bg)`, `object-fit:cover`.

Levý sloupec shora dolů:
1. Eyebrow: vlasová linka `width:44px; height:1px; background:var(--brass)` + text `INVESTICE DO NEMOVITOSTÍ` (`white-space:nowrap`), `gap:16px`, `margin-bottom:56px`.
2. H1: **Kapitál, který stojí na základech**
3. Perex (`margin-top:40px`): *Stavíme a rekonstruujeme nemovitosti v Praze a okolí. Investorům otevíráme pouze projekty, které vedeme vlastními kapacitami — od výkupu pozemku po předání klíčů.*
4. CTA řádek (`margin-top:52px`, `gap:18px`): plné tmavé `AKTUÁLNÍ EMISE` (`background:var(--ink); color:var(--paper)`) → odkaz na `#emise`; textové `PORTFOLIO PROJEKTŮ` s `border-bottom:1px solid rgba(22,33,29,.3)` → `#projekty`.
5. Tři čísla přisazená ke spodní hraně (`margin-top:auto; padding-top:80px; gap:56px`), každé serif 34px + label 11,5px `.18em` `--text-3`:
   - `1 000+` — PŘEDANÝCH DOMOVŮ
   - `20 let` — NA TRHU
   - `80` — JEDNOTEK ROČNĚ

### 03 Tmavý blok důvěry
`background:var(--ink); color:var(--on-dark); padding:110px var(--pad-x)`. Grid `minmax(0,1fr) minmax(0,1fr)`, `gap:96px`, `align-items:start`.

Vlevo claim 44px: **Každá emise je vázaná na konkrétní stavbu — na tu, kterou si můžete přijít prohlédnout.**

Vpravo tři body, každý `border-top: var(--rule-dark); padding-top:22px`, číslo v `--brass-dark` (11,5px, `.2em`, `min-width:30px`), text 16px / 1.75 v `rgba(239,234,225,.82)`:
1. `01` Zajištění reálnou nemovitostí, ne portfoliem cizích aktiv.
2. `02` Fixní úrok vyplácený kvartálně po celou dobu emise.
3. `03` Horizont tří až pěti let, splacení jistiny v termínu emise.

### 04 Aktuální emise — `id="emise"`
Nadpis **Aktuální emise** + vpravo label `I — PŘÍLEŽITOSTI`. `margin-bottom:64px`.

Tabulka postavená na CSS gridu, ne na `<table>` layoutu (sémanticky ale `<table>` s `display:grid` na `tr`, nebo `role="table"`). Sloupce: `1.7fr .9fr .8fr .9fr 1fr`.

Hlavička řádku: 11,5px `.2em` `--text-3`, `padding-bottom:18px; border-bottom: var(--rule-strong)`:
`PROJEKT · LOKALITA · VÝNOS P.A. · SPLATNOST · MINIMÁLNÍ VSTUP`

Řádky `padding:34px 0; border-bottom: var(--rule-soft); align-items:baseline`. Název a výnos serif 27px, ostatní 16px `--text-2`:

| Projekt | Lokalita | Výnos p.a. | Splatnost | Min. vstup |
|---|---|---|---|---|
| Villa Uhříněves | Praha 10 | 9,0 % | 2029 | 500 000 Kč |
| Villa Chýně | Praha-západ | 8,5 % | 2029 | 500 000 Kč |
| Villa Brandýsek | Kladno | 8,0 % | 2028 | 300 000 Kč |

Pod tabulkou (`margin-top:26px`, 12,5px, `--text-3`): *Ilustrativní údaje k doplnění z prospektu a konečných podmínek jednotlivých emisí.*

### 05 Jak investice probíhá
Grid `minmax(0,1.75fr) minmax(0,1fr)` s dělicí `border-right: var(--rule)` na levém sloupci. Vpravo **úzký** pruh fotografie (detail materiálu nebo interiéru) — bez `min-height`, roztáhne se podle levého sloupce.

Levý sloupec: label `II — PROCES`, H2 **Jak investice probíhá**, pak čtyři kroky. Každý krok `display:flex; gap:28px; padding:26px 0; border-top: var(--rule-soft)` (poslední i `border-bottom`), číslo v mosazi 11,5px `.2em` `min-width:30px`, název serif 22px, popis 15,5px / 1.7 `--text-2`:

1. **Konzultace** — Projdeme objem, horizont a míru rizika, která vám vyhovuje.
2. **Výběr projektu** — Ukážeme rozpočet, harmonogram a aktuální stav stavby.
3. **Úpis a smlouva** — Podpis s prospektem a konečnými podmínkami na stole.
4. **Výplata a splacení** — Úrok kvartálně, jistina zpět v termínu splatnosti emise.

### 06 Portfolio — `id="projekty"`
Nadpis **Portfolio** + label `III — PROJEKTY`. Grid `minmax(0,1.4fr) minmax(0,1fr)`, `gap:32px`.

- Vlevo velká fotka `height:460px`.
- Vpravo dvě fotky `height:214px` pod sebou, `gap:32px`.
- Popisek pod každou fotkou: `padding-top:22px` (u malých 16px), `border-top:1px solid rgba(22,33,29,.16)`, `display:flex; justify-content:space-between; align-items:baseline` — název serif (24px / 20px) vlevo, meta 11–11,5px `.18em` `--text-3` vpravo.

| Fotka | Název | Meta |
|---|---|---|
| velká | Villa Uhříněves | PRAHA 10 · 2026 |
| malá | Villa Chýně | PRAHA-ZÁPAD |
| malá | Xaveriova | PRAHA 10 |

### 07 Lidé za skupinou
Nadpis **Lidé za skupinou** + label `IV — TÝM`. Grid `repeat(3, minmax(0,1fr))`, `gap:44px`. Portrét `height:360px`, `background:var(--photo-bg)`. Pod ním jméno serif 23px (`margin-top:24px`) a role 11,5px `.2em` `--text-3` (`margin-top:10px`).

- Martin Kozák — JEDNATEL
- *Jméno k doplnění* — INVESTIČNÍ DIVIZE
- *Jméno k doplnění* — VÝSTAVBA A REALIZACE

### 08 Reference a novinky
Grid `minmax(0,1fr) minmax(0,1fr)`, dělicí `border-right: var(--rule)` na levé polovině, `padding:100px 72px 100px var(--pad-x)` / `100px var(--pad-x) 100px 72px`.

Vlevo label `V — REFERENCE`, citace serif 28px / 1.5:
> „Dohodnuté termíny platily, rekonstrukce byla provedena dle požadavků a ve výborné kvalitě."

Zdroj 11,5px `.18em` `--text-3`: `KLIENT · REKONSTRUKCE BYTU, PRAHA`

Vpravo label `NOVINKY`, tři řádky `padding:24px 0; border-top: var(--rule)` (poslední i `border-bottom`), `display:flex; justify-content:space-between; gap:32px` — název serif 20px, datum 12px `--text-3` `white-space:nowrap`:

- Villa Uhříněves: hrubá stavba dokončena — 08 / 2026
- Co sledovat u zajištěných dluhopisů — 07 / 2026
- Přestavby domů na bytové jednotky — 06 / 2026

### 09 Kontakt — `id="kontakt"`
`background:var(--ink); color:var(--on-dark); padding:110px var(--pad-x)`. Grid `minmax(0,1fr) minmax(0,1fr)`, `gap:96px`.

Vlevo: label `KONTAKT` v `--brass-dark`, H2 **Projdeme si emisi i stavbu osobně** (48px / 1.15, `max-width:20ch`), plné světlé tlačítko `DOMLUVIT KONZULTACI` (`background:var(--on-dark); color:var(--ink)`).

Vpravo 16,5px / 2.1 v `rgba(239,234,225,.82)`:
```
Čerčanská 2053/18, Praha 4 — Krč, 140 00
info@puskinpartners.cz
+420 602 674 143
Po—Pá / 9:00—18:00      (rgba(239,234,225,.55))
```

Pod blokem (stále na tmavém, `padding:0 var(--pad-x) 46px`, 11,5px / 1.85, `rgba(239,234,225,.5)`, `max-width:110ch`):
> Toto je propagační sdělení. Prospekt a konečné podmínky emisí jsou k dispozici na vyžádání. Doporučujeme, aby si potenciální investoři přečetli prospekt, než učiní investiční rozhodnutí.

## 6. Stavy a interakce

- Tmavé tlačítko `:hover` → `background: var(--ink-hover)`. Světlé tlačítko na tmavém `:hover` → `opacity:.88`.
- Outline tlačítko `:hover` → `border-color: var(--ink)`.
- Textové odkazy `:hover` → barva `var(--brass)` nebo silnější podtržení.
- Řádky tabulky a novinek: `:hover { background: rgba(22,33,29,.03) }`. Nic víc.
- Přechody max `150ms ease`. Žádné transformace, žádné parallaxy.
- `:focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; }` — nikdy nemazat.
- `::selection { background: rgba(169,136,78,.25) }`.

## 7. Fotografie

Osm míst, všechna `background: var(--photo-bg)` a `object-fit: cover`. Dokud fotky nejsou, ponech plochu prázdnou v `--photo-bg` (žádné ikony, žádný text).

| # | Umístění | Poměr / výška | Obsah |
|---|---|---|---|
| 1 | hero, pravý sloupec | na výšku, min 820px | villa dům nebo interiér |
| 2 | proces, pravý pruh | úzký, flexibilní | detail materiálu / interiéru |
| 3 | portfolio, velká | 460px | Villa Uhříněves, exteriér |
| 4 | portfolio, malá | 214px | Villa Chýně, exteriér |
| 5 | portfolio, malá | 214px | Xaveriova, interiér |
| 6–8 | tým | 360px | portréty |

Fotografie dodá klient. Tlumené tóny, klidná kompozice, žádné barevné filtry ani přebarvování.

## 8. Responzivita

**≤ 1024 px**
- Všechny dvousloupcové gridy na jeden sloupec; dělicí `border-right` se mění na `border-bottom`.
- `--pad-x: 40px`, `--pad-y: 72px`.
- Hero fotka se přesune pod text, `min-height:520px`.
- Portfolio: velká fotka nad dvěma malými.

**≤ 640 px**
- H1 na 46px, H2 na 32px, claim v tmavém bloku na 30px.
- `--pad-x: 24px`.
- Tabulka emisí přejde na karty pod sebou: název serif 24px, pod ním páry label / hodnota (label 11px `.18em` `--text-3`), karty dělené `var(--rule-soft)`.
- Tým a portfolio na jeden sloupec.
- Nav do off-canvas menu s hamburgerem (bez JS knihovny — `<details>` nebo checkbox toggle je v pořádku).

## 9. Přístupnost

- `--text-2` (#3B4842) na `--paper` prochází AA. Mosaz `--brass` používej **jen** na labely, čísla a linky, nikdy na běžný text.
- `alt` u každé fotografie, dekorativní plochy `aria-hidden`.
- Logickou tabulku emisí drž v `<table>` s `<th scope="col">`, i když je vizuálně gridová.
- Přeskakovací odkaz na obsah před hlavičkou.
