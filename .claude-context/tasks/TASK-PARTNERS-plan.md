# TASK: Pridat sekci partneru/znacek na web

## Souhrn
Pridat horizontalni radu log partnerskych dodavatelu na homepage (staticky HTML). Styl: sede/tlumene loga na svetlem pozadi, elegantni rada. Znacky: Asko, Solodoor, Siko, Oresi, DEK. Loga stahnout z internetu (SVG preferovane).

---

## DULEZITE: Produkcni web je STATICKY HTML

Produkcni web je obsluhovan pres **staticky HTML** v `public/static/`, nikoliv pres Next.js route v `src/app/(web)/`. Middleware v `src/middleware.ts` prepisuje `/` → `/static/index.html` a jednotlive podstranky na odpovidajici HTML soubory. 

Proto vsechny zmeny MUSI byt v:
- `public/static/css/style.css` (hlavni stranky)
- `public/static/index.html` (homepage — JEDINE misto kde sekce bude)

---

## UMISTENI SEKCE

**Pouze na HOMEPAGE** (uzivatel potvrdil — NE na rekonstrukce):
- **Soubor**: `public/static/index.html`
- **Pozice**: Za sekci "Nase sluzby" (#sluzby, radek ~646), PRED kontaktni sekci (#kontakt, radek ~650)
- **Duvod**: Loga dodavatelu pridavaji duveryhodnost na hlavni strance

---

## DESIGN

### Vizualni styl
- **Pozadi**: `var(--paper)` (#F2EEE6) — svetle, cisel pozadi
- **Loga**: Cernobila / seda varianta (grayscale filter pres CSS), plna barva pri hoveru
- **Rozlozeni**: Horizontalni rada, centrovana, rovnomerne rozestupy
- **Oddelovace**: `border-top: var(--rule)` a `border-bottom: var(--rule)` — jemne linky jako ostatni sekce
- **Padding**: `padding: 64px var(--pad-x)` — konzistentni s ostatnimi sekcemi
- **Section label** (volitelne): "SPOLUPRACUJEME S" (uppercase, brass barva, 11px, letter-spacing .15em)

### Responzivita
- **Desktop**: 5 log v jedne rade, `gap: 64px`
- **Tablet (max-width: 1024px)**: 5 log, mensi gap (40px)
- **Mobil (max-width: 640px)**: 3 + 2 loga (wrap), gap 32px

### Loga — implementace
Loga mohou byt implementovana dvema zpusoby:

#### Postup: Stahnout loga z internetu
- Pouzit WebSearch/WebFetch k nalezeni oficialnich SVG log: Asko, Solodoor, Siko, Oresi, DEK
- Ulozit do `public/static/logos/` jako samostatne SVG soubory
- Vlozit jako `<img>` s grayscale CSS filtrem
- Pokud SVG neni dostupne pro nektere logo, pouzit PNG a konvertovat, nebo jako fallback textovou variantu

#### Fallback: Text-based loga
- Pokud SVG/PNG logo nelze stahnout, pouzit textovy nazev znacky
- Styl: `font-family: var(--sans)`, `font-size: 18px`, `font-weight: 500`, `letter-spacing: .1em`, `text-transform: uppercase`, `color: var(--text-3)`
- Pri hoveru: `color: var(--ink)`

---

## HTML STRUKTURA

```html
<!-- Partners / dodavatelé -->
<section class="partners">
  <span class="section-label">SPOLUPRACUJEME S</span>
  <div class="partners-logos">
    <img src="/static/logos/asko.svg" alt="Asko" class="partner-logo" loading="lazy">
    <img src="/static/logos/solodoor.svg" alt="Solodoor" class="partner-logo" loading="lazy">
    <img src="/static/logos/siko.svg" alt="Siko" class="partner-logo" loading="lazy">
    <img src="/static/logos/oresi.svg" alt="Oresi" class="partner-logo" loading="lazy">
    <img src="/static/logos/dek.svg" alt="DEK" class="partner-logo" loading="lazy">
  </div>
</section>
```

Alternativne s textovymi logy (pokud SVG nejsou k dispozici):
```html
<section class="partners">
  <span class="section-label">SPOLUPRACUJEME S</span>
  <div class="partners-logos">
    <span class="partner-logo-text">ASKO</span>
    <span class="partner-logo-text">SOLODOOR</span>
    <span class="partner-logo-text">SIKO</span>
    <span class="partner-logo-text">ORESI</span>
    <span class="partner-logo-text">DEK</span>
  </div>
</section>
```

---

## CSS STYLY

### Pridat do `public/static/css/style.css` (pro homepage)

```css
/* Partners / suppliers logos */
.partners {
  padding: 64px var(--pad-x);
  text-align: center;
  border-top: var(--rule);
  border-bottom: var(--rule);
}

.partners .section-label {
  display: block;
  margin-bottom: 40px;
}

.partners-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 64px;
  flex-wrap: wrap;
}

.partner-logo {
  height: 32px;
  width: auto;
  filter: grayscale(100%) opacity(0.4);
  transition: filter .3s ease;
}

.partner-logo:hover {
  filter: grayscale(0%) opacity(1);
}

/* Text variant (if SVGs not available) */
.partner-logo-text {
  font-family: var(--sans);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--text-3);
  transition: color .2s ease;
}

.partner-logo-text:hover {
  color: var(--ink);
}
```

### Pridat do responsive breakpointu v `style.css`

V `@media (max-width: 1024px)`:
```css
.partners-logos {
  gap: 40px;
}

.partner-logo {
  height: 28px;
}
```

V `@media (max-width: 640px)`:
```css
.partners {
  padding: 48px var(--pad-x);
}

.partners-logos {
  gap: 32px;
}

.partner-logo {
  height: 24px;
}

.partner-logo-text {
  font-size: 15px;
}
```

---

## SOUBORY K MODIFIKACI

| Soubor | Zmena |
|--------|-------|
| `public/static/css/style.css` | Pridat `.partners` CSS styly + responsive |
| `public/static/index.html` | Pridat partners sekci za #sluzby, pred #kontakt |

## SOUBORY K VYTVORENI

| Soubor | Typ | Popis |
|--------|-----|-------|
| `public/static/logos/asko.svg` | NOVY | Logo Asko |
| `public/static/logos/solodoor.svg` | NOVY | Logo Solodoor |
| `public/static/logos/siko.svg` | NOVY | Logo Siko |
| `public/static/logos/oresi.svg` | NOVY | Logo Oresi |
| `public/static/logos/dek.svg` | NOVY | Logo DEK |

---

## ODPOVEDI OD UZIVATELE (vyreseno)

1. **"DE"** = **DEK** (stavebniny DEK — dek.cz)
2. Partnery pouze na **HOMEPAGE** (NE rekonstrukce)
3. Loga **STAHNOUT Z INTERNETU** pres WebSearch/WebFetch (uzivatel nema SVG soubory)

---

## TESTOVANI

1. Overit vizualni podobu na vsech breakpointech (desktop, tablet, mobil)
2. Overit grayscale → color hover efekt
3. Overit ze loga maji spravny alt text pro accessibility
4. Overit ze sekce nenarusi layout ostatnich sekci na strance
5. Overit ze cache-busting funguje (zvysit `?v=` parametr v CSS link)

---

## POZNAMKY PRO IMPLEMENTATORA

- **DULEZITE**: Edituj POUZE staticke HTML soubory v `public/static/`. Next.js `(web)` route se na produkci nepouzivaji.
- **POUZE HOMEPAGE**: Sekce patri JEN do `public/static/index.html`, NE do rekonstrukce.html
- **CSS verze**: Po editaci `style.css` zvys `?v=` parametr v HTML souborech kde je linkovany (napr. `style.css?v=5` → `style.css?v=6`)
- **Existujici `.section-label`** trida uz je definovana v `style.css` — pouzij ji pro nadpis "SPOLUPRACUJEME S"
- **Loga stahnout**: Pouzij WebSearch/WebFetch pro nalezeni SVG log znacek. Hledej na oficialnich webech (asko-nabytek.cz, solodoor.cz, siko.cz, oresi.cz, dek.cz)
- **Loga output**: SVG soubory musi byt optimalizovane (SVGO), male velikosti, bez embedded fontu
- **Blob storage**: Loga NEUPLOADOVAT do Vercel Blob — jsou staticke assety, patri do `public/static/logos/`
