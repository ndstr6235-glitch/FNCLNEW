# TASK: Investicni PDF prezentace pro klienty

## Souhrn
Vytvorit PDF dokument generovany pres `pdf-lib` (uz v projektu), ktery bude slouzit jako emailovy attachment pro klienty se zajmem o investice. PDF musi vizualne odpovidat webu Puskin Partners (barvy, fonty, premium feel).

---

## ARCHITEKTURA

### Novy soubor
**`src/lib/crm/investment-pdf.ts`** — jediny novy soubor, obsahuje funkci `generateInvestmentPdf(): Promise<Buffer>`

### Existujici vzory k nasledovani
- **`src/lib/crm/proposal-pdf.ts`** — hlavni vzor pro pdf-lib pouziti, font embedding, layout helpers
- **`src/lib/crm/fonts-data.ts`** — base64 Inter fonty (Regular, Bold, SemiBold) — importovat `INTER_REGULAR_B64`, `INTER_BOLD_B64`, `INTER_SEMIBOLD_B64`

### API endpoint
**`src/app/api/investment-pdf/route.ts`** — GET endpoint ktery vrati PDF jako response s `Content-Type: application/pdf`

Pozn: Endpoint by mel byt chraneny session checkem (import `getSession` z `@/lib/crm/auth`), aby PDF neslouzilo verejne.

---

## BAREVNA PALETA (presne z webu)

```typescript
const navy = rgb(0.086, 0.129, 0.114);     // #16211D (ink)
const navyLight = rgb(0.231, 0.282, 0.259); // #3B4842 (text-2)
const gold = rgb(0.663, 0.533, 0.306);      // #A9884E (brass)
const goldLight = rgb(0.761, 0.643, 0.412); // #C2A468 (brass-dark)
const grey = rgb(0.431, 0.416, 0.380);      // #6E6A61 (text-3)
const greyLight = rgb(0.82, 0.84, 0.87);
const greyBg = rgb(0.949, 0.933, 0.902);    // #F2EEE6 (paper)
const white = rgb(0.937, 0.918, 0.882);     // #EFEAE1 (on-dark)
const pureWhite = rgb(1, 1, 1);
```

## FONTY
Import z existujiciho `fonts-data.ts`:
```typescript
import { INTER_REGULAR_B64, INTER_BOLD_B64, INTER_SEMIBOLD_B64 } from "./fonts-data";
```
Embeddovat s `{ subset: true }` — presne jako v `proposal-pdf.ts`.

---

## STRUKTURA PDF (6 stran)

### STRANA 1: Titulni strana
- **Header bar** (72px, navy pozadi) — presne jako proposal-pdf.ts:
  - Vlevo: "PUSKIN" (Bold 20) + "PARTNERS" (Semi 9, gold)
  - Vpravo: "Alexandr Puskin, s.r.o." + ICO + adresa
  - Pod header: gold accent line (1px)
- **Titulek** (centrovany, velky):
  - "Investicni prezentace" (Bold 32, navy)
  - Pod nim: "Alexandr Puskin, s.r.o. | Rybna 716/24, Praha 1" (Regular 11, grey)
- **3 klicove statistiky** v radku (stred stranky):
  - "7" — "Dokoncenych projektu"
  - "20,9M" — "Celkovy cistý výnos"  
  - "30-40%" — "Ocekavany výnos"
  - Cisla: Bold 36, gold | Popisky: Regular 10, grey
- **Tagline** (dole pred footerem):
  - "Investujete do konkretniho projektu — vite presne kam jdou vase penize." (SemiBold 12, navy, centrovano)
- **Footer** — presne jako proposal-pdf.ts (navy bar, gold linka, firemni udaje)

### STRANA 2: Nase sluzby
- Header bar (stejny na kazde strane)
- **Section label**: "I — SLUZBY" (Bold 9, gold)
- **Heading**: "Co delame" (Bold 22, navy)
- **Intro text**: "Vsechno delame sami — od výběru nemovitosti pres stavbu az po prodej. Zadne prostredníky." (Regular 11, navyLight)
- **5 servisnich bloku** (kazdy = greyBg rectangle s gold left accent bar, 3px):
  1. **Development** — "Projekty od vizualizace po predani klicu"
  2. **Stavba** — "Stavba domů a rekonstrukce bytů"
  3. **Reality** — "Prodej, výkup a vyhledávání nemovitostí"
  4. **Investice** — "Zhodnocení investic do nemovitostních projektů"
  5. **Pronájem** — "Správa a pronájem apartmánů"
  - Nazev: SemiBold 13, navy | Popis: Regular 10, grey
- Footer

### STRANA 3: Dokoncene projekty (track record)
- Header bar
- **Section label**: "II — TRACK RECORD" (Bold 9, gold)
- **Heading**: "Dokoncene projekty" (Bold 22, navy)
- **Subheading**: "Reálné výsledky, ne projekce" (Regular 11, grey)
- **Tabulka** se 7 radky:

| Projekt | Nakup | Realizace | Prodej | Výnos |
|---------|-------|-----------|--------|-------|
| Velká Dobrá | 8M | 6M | 18M | **+4M** |
| Vila Běchovice | 14M | 5M | 24M | **+5M** |
| Vila Horoměřice | 15M | 5M | 28M | **+8M** |
| Byt Praha 3 | 2,8M | 0,7M | 4,5M | **+1,0M** |
| Byt Praha 5 | 3,1M | 0,8M | 5,0M | **+1,1M** |
| Byt Praha 10 | 2,4M | 0,6M | 3,8M | **+0,8M** |
| Byt Praha 4 | 3,4M | 0,8M | 5,3M | **+1,1M** |

  - **Implementace tabulky**:
    - Hlavicka: greyBg pozadi, SemiBold 9, gold text, uppercase
    - Radky: stridave bile / greyBg pozadi, Regular 10, navy
    - Sloupec "Výnos": SemiBold 10, gold barva (zvyrazneni)
    - Oddelovaci linky: 0.5px, greyLight
  - **Sumacni radek** pod tabulkou:
    - navy pozadi, gold text
    - "CELKEM" | "" | "" | "" | "**+20,9M Kc**"
- Footer

### STRANA 4: Pripravovane projekty (investicni prilezitosti)
- Header bar
- **Section label**: "III — PŘÍLEŽITOSTI" (Bold 9, gold)
- **Heading**: "Aktuální investiční příležitosti" (Bold 22, navy)
- **Subheading**: "Projekty, na které aktuálně hledáme investory" (Regular 11, grey)
- **4 projektove karty** (kazda = obdelnik s greyBg, gold left bar):

  1. **Vila Uhříněves**
     - Porizovaci cena: 18 mil. Kc | Realizace: 5 mil. Kc | Ocekavany výnos: 30-40% | Stav: Hledame investory

  2. **Vila Kladno**
     - Porizovaci cena: 15 mil. Kc | Realizace: 6 mil. Kc | Ocekavany výnos: 30-40% | Stav: Hledame investory

  3. **Wellness Sumava**
     - Porizovaci cena: 34 mil. Kc | Realizace: 20 mil. Kc | Ocekavany výnos: 30-40% | Stav: Hledame investory

  4. **Ubytovaci zarizeni Brno**
     - Porizovaci cena: 26 mil. Kc | Realizace: 6 mil. Kc | Ocekavany výnos: 30-40% | Stav: Hledame investory

  - **Layout kazde karty**:
    - Nazev projektu: SemiBold 14, navy
    - Key-value pary v 2 sloupcich (label: Regular 9, grey | value: SemiBold 10, navy)
    - "Hledame investory" badge: gold text na navy pozadi, maly obdelnik
    - Mezera mezi kartami: 18px

- Footer

### STRANA 5: Jak spoluprace funguje (proces)
- Header bar
- **Section label**: "IV — PROCES" (Bold 9, gold)
- **Heading**: "Jak spolupráce funguje" (Bold 22, navy)
- **4 kroky** (vertikalne, kazdy s cislem):
  1. **"01 — Schůzka"**: "Sedneme si, ukážeme konkrétní projekt — rozpočet, lokalitu, harmonogram."
  2. **"02 — Vstup do projektu"**: "Dohodneme podmínky a výši investice. Podepíšeme smlouvu s jasnými termíny."
  3. **"03 — Realizace"**: "Stavíme a rekonstruujeme. Investor dostává pravidelné reporty o průběhu."
  4. **"04 — Prodej a vyplacení"**: "Po prodeji nemovitosti vyplatíme investorovi jistinu a podíl na zisku."

  - Cislo: Bold 28, gold | Nazev: SemiBold 14, navy | Popis: Regular 10.5, navyLight
  - Vertikalni gold linka (1px) spojujici kroky vizualne

- **Investicni modely** (pod procesem, pokud se vejdou, jinak na strane 6):
  - 2 boxy vedle sebe:
    - **Spoluinvestice** — výnos 30-40%, podíl na zisku
    - **Půjčka na projekt** — fixní úrok, zajištění nemovitostí
  - Box: navy pozadi, white text, gold accent

- Footer

### STRANA 6: Kontakt (CTA)
- Header bar
- **Velky centrovaný CTA blok** (navy pozadi pres celou sirku obsahu):
  - "Chcete investovat do konkrétního projektu?" (Bold 24, white, centrovano)
  - "Sedneme si a ukážeme vám konkrétní projekt s rozpočtem, harmonogramem a plánem. Žádné závazky." (Regular 12, white 80% opacity)
- **Kontaktni udaje** (pod CTA blokem):
  - **Miroslav Fencl** (SemiBold 14, navy) — jednatel
  - Email: info@puskinpartners.cz (Regular 11, navy)
  - Telefon: +420 602 674 143 (Regular 11, navy)
  - Adresa: Rybná 716/24, Staré Město, 110 00 Praha 1 (Regular 10, grey)
  - Otevírací doba: Po—Pá / 9:00—18:00 (Regular 10, grey)
- **Firemni udaje** (drobne, centrovane):
  - "Alexandr Puškin, s.r.o. · IČO: 26740788 · Spisová značka: C 90827, Městský soud v Praze" (Regular 8, grey)
- Footer

---

## IMPLEMENTACNI DETAILY

### 1. Funkce `generateInvestmentPdf()`

```typescript
// src/lib/crm/investment-pdf.ts

import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import * as fontkit from "@pdf-lib/fontkit";
import { INTER_REGULAR_B64, INTER_BOLD_B64, INTER_SEMIBOLD_B64 } from "./fonts-data";

export async function generateInvestmentPdf(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  
  // Embed fonts (same pattern as proposal-pdf.ts)
  const interRegularBytes = Buffer.from(INTER_REGULAR_B64, "base64");
  const interBoldBytes = Buffer.from(INTER_BOLD_B64, "base64");
  const interSemiBoldBytes = Buffer.from(INTER_SEMIBOLD_B64, "base64");
  
  const fontRegular = await doc.embedFont(interRegularBytes, { subset: true });
  const fontBold = await doc.embedFont(interBoldBytes, { subset: true });
  const fontSemi = await doc.embedFont(interSemiBoldBytes, { subset: true });
  
  // A4 dimensions
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 56;
  const contentWidth = pageWidth - 2 * margin;
  
  // ... build pages ...
  
  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
```

### 2. Reusable helpers (kopirovat vzor z proposal-pdf.ts)

Tyto helpery definovat UVNITR `generateInvestmentPdf()` (ne exportovat — lokalni scope):

- `drawHeader(page)` — navy bar + logo + company info + gold line
- `drawFooter(page)` — navy bar + company info + document title
- `wrapText(text, maxWidth, font, fontSize)` — word wrapping
- `newPage()` — pridá stranku s header, vrati page a pocatecni Y

### 3. Tabulkovy layout (strana 3)

```typescript
function drawTable(
  page: PDFPage,
  y: number,
  headers: string[],
  rows: string[][],
  colWidths: number[],
) {
  // Header row — greyBg, gold SemiBold text
  // Data rows — alternating white/greyBg
  // Last column (Výnos) — gold SemiBold
  // Summary row — navy bg, gold text
}
```

Sirky sloupcu (5 sloupcu, contentWidth = 483.28):
- Projekt: 140px
- Nákup: 80px
- Realizace: 80px  
- Prodej: 80px
- Výnos: ~103px

### 4. Projektove karty (strana 4)

Kazda karta: greyBg obdelnik, gold left accent (3px), padding 20px.
Uvnitr: nazev (SemiBold 14) + 4 key-value radky ve 2 sloupcich.
Karta vyska: cca 100px, mezera 18px.

### 5. API endpoint

```typescript
// src/app/api/investment-pdf/route.ts

import { getSession } from "@/lib/crm/auth";
import { generateInvestmentPdf } from "@/lib/crm/investment-pdf";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const pdfBuffer = await generateInvestmentPdf();
  
  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Investicni-prezentace-Puskin-Partners.pdf"',
    },
  });
}
```

---

## CO NEIMPLEMENTOVAT (out of scope)

1. **Embedded images/photos** — pdf-lib muze embedovat PNG/JPEG, ale stahovat z blob storage za runtime by bylo pomale a krehke. PDF bude cistě textovy/graficky (obdelniky, linky, text) — premium design bez fotek.
2. **Dynamicky obsah z DB** — data jsou staticka (track record, pripravovane projekty), hardcoded primo v souboru.
3. **Caching** — PDF se generuje on-the-fly pri kazdem requestu. Pokud bude potreba, lze pridat cache pozdeji.
4. **CRM UI integrace** — tlacitko v CRM pro stazeni/odeslani prezentace je follow-up task.

---

## SOUBORY K VYTVORENI

| Soubor | Typ | Popis |
|--------|-----|-------|
| `src/lib/crm/investment-pdf.ts` | NOVY | Generovani PDF pres pdf-lib |
| `src/app/api/investment-pdf/route.ts` | NOVY | GET endpoint pro stazeni PDF |

## SOUBORY K MODIFIKACI

Zadne existujici soubory se needituji.

## ZAVISLOSTI

Vsechny uz existuji v package.json:
- `pdf-lib` (^1.17.1)
- `@pdf-lib/fontkit` (^1.1.1)

---

## TESTOVANI

1. Spustit `npm run build` — overit ze TypeScript kompiluje bez chyb
2. Navstivit `GET /api/investment-pdf` (s platnou session) — overit:
   - Response je validni PDF
   - 6 stran
   - Spravne barvy, fonty, layout
   - Ceska diakritika (Inter font to podporuje)
   - Tabulka s financnimi daty je citelna
   - Kontaktni udaje jsou spravne
3. Bez session → 401 Unauthorized

---

## POZNAMKY PRO IMPLEMENTATORA

- **VZOR**: Opsej strukturu z `src/lib/crm/proposal-pdf.ts` (radky 68-543). Pouzivej stejne patterny pro header, footer, font embedding, page breaks.
- **DIAKRITIKA**: Inter font podporuje plnou ceskou diakritiku — testovano v proposal-pdf.
- **ROZMER**: A4 = 595.28 x 841.89 points. Margin = 56. Content = 483.28.
- **Y-osa**: pdf-lib pocita od spodu stranky (0 = dole, 841.89 = nahore). Zacni kreslit od pageHeight a jdi dolu.
- **JMENO v kontaktu**: Na webu je v site.ts owner "Miroslav Fencl", ale v kontaktu je telefon +420 602 674 143 a email info@puskinpartners.cz.
- **CELKOVY VYNOS**: 4+5+8+1+1.1+0.8+1.1 = 21M (zaokrouhlit na 20,9M jak je realno, nebo pouzit "21M" — overit s klientem). Pouzij 21M pro presnost.
