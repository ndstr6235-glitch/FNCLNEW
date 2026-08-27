// Stub — html-to-pdf requires puppeteer-core which is not installed.
// In production, use @sparticuz/chromium on Vercel or install puppeteer locally.
// For now, contract generation uses pdf-lib directly (proposal-pdf.ts).

export async function htmlToPdf(_html: string): Promise<Buffer> {
  throw new Error(
    "htmlToPdf is not available. Install puppeteer-core and @sparticuz/chromium to enable HTML-to-PDF conversion."
  );
}
