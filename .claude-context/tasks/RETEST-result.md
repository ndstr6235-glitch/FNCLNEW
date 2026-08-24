# Re-test Report — Blog detail + Kontaktní formulář
**Datum:** 2026-08-24  
**Tester:** TEST-CHROME  
**URL:** http://localhost:3000

---

## 1. Blog detail stránky — FAIL ✗

| URL | HTTP | Výsledek |
|-----|------|----------|
| /blog/trendy-interierovy-design-2026 | 404 | FAIL |
| /blog/smart-technologie-domacnost | 404 | FAIL |
| /blog/diverzifikace-portfolia-nemovitosti | 404 | FAIL |

**Příčina:** Soubor `/src/app/(web)/blog/[slug]/page.tsx` existuje, ale padá s Next.js 15 chybou:

```
Error: Route "/blog/[slug]" used `params.slug`. `params` is a Promise and must be 
unwrapped with `await` or `React.use()` before accessing its properties.
```

**Nutný fix** v `src/app/(web)/blog/[slug]/page.tsx`:

```tsx
// generateMetadata — přidat async + await params
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  ...
}

// BlogPostPage — přidat async + await params
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  ...
}
```

---

## 2. Kontaktní formulář — OK ✓

Testováno v Playwright headed Chrome:

- Vyplněna všechna pole: Jméno, Email, Telefon, Předmět (Development), Zpráva
- Zaškrtnut GDPR checkbox → submit button se aktivoval
- Klik na "Odeslat zprávu"
- **Success zpráva zobrazena:** "✓ Zpráva odeslána — Děkujeme za Vaši zprávu. Ozveme se Vám co nejdříve."
- Formulář po odeslání zmizel, nahrazen success blokem (zelené pozadí)
- Server action zalogovala data (viditelné v dev server logu)

---

## Závěr

| Fix | Stav |
|-----|------|
| Kontaktní formulář (BUG #2) | OPRAVENO ✓ |
| Blog detail stránky (BUG #1) | NEOPRAVENO — čeká na fix async params v Next.js 15 |
