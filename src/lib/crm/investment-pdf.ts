// Single-page A4 investment leaflet — projects, process, contact.

import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { INTER_REGULAR_B64, INTER_BOLD_B64, INTER_SEMIBOLD_B64 } from "./fonts-data";

export async function generateInvestmentPdf(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fR = await doc.embedFont(Buffer.from(INTER_REGULAR_B64, "base64"), { subset: true });
  const fB = await doc.embedFont(Buffer.from(INTER_BOLD_B64, "base64"), { subset: true });
  const fS = await doc.embedFont(Buffer.from(INTER_SEMIBOLD_B64, "base64"), { subset: true });

  const W = 595.28;
  const H = 841.89;
  const M = 44;
  const CW = W - 2 * M;

  const navy = rgb(0.086, 0.129, 0.114);
  const gold = rgb(0.663, 0.533, 0.306);
  const grey = rgb(0.431, 0.416, 0.380);
  const greyBg = rgb(0.949, 0.933, 0.902);
  const onDark = rgb(0.937, 0.918, 0.882);

  const p = doc.addPage([W, H]);

  // ── HEADER BAR ──
  p.drawRectangle({ x: 0, y: H - 50, width: W, height: 50, color: navy });
  p.drawRectangle({ x: 0, y: H - 51, width: W, height: 1, color: gold });
  p.drawText("PUSKIN", { x: M, y: H - 26, size: 16, font: fB, color: onDark });
  p.drawText("PARTNERS", { x: M, y: H - 38, size: 7, font: fS, color: gold });
  const hr = "Investiční příležitosti";
  p.drawText(hr, { x: W - M - fS.widthOfTextAtSize(hr, 8), y: H - 33, size: 8, font: fS, color: onDark });

  let y = H - 78;

  // ── TITLE ──
  p.drawText("Investiční příležitosti", { x: M, y, size: 22, font: fB, color: navy });
  y -= 16;
  p.drawText("Investujte do konkrétního projektu — víte přesně kam jdou vaše peníze.", { x: M, y, size: 9, font: fR, color: grey });
  y -= 26;

  // ── 4 PROJECT CARDS (compact) ──
  const projects = [
    { name: "Vila Uhříněves", purchase: "18 mil.", reno: "5 mil.", yield: "30–40 %" },
    { name: "Vila Kladno", purchase: "15 mil.", reno: "6 mil.", yield: "30–40 %" },
    { name: "Wellness Šumava", purchase: "34 mil.", reno: "20 mil.", yield: "20–30 %" },
    { name: "Ubytovací zařízení Brno", purchase: "26 mil.", reno: "6 mil.", yield: "30–40 %" },
  ];

  for (const proj of projects) {
    const cardH = 52;
    p.drawRectangle({ x: M, y: y - cardH, width: CW, height: cardH, color: rgb(1, 1, 1) });
    p.drawRectangle({ x: M, y: y - cardH, width: 3, height: cardH, color: gold });

    p.drawText(proj.name, { x: M + 12, y: y - 16, size: 12, font: fB, color: navy });

    // Badge
    const badge = "Hledáme investory";
    const bw = fS.widthOfTextAtSize(badge, 7) + 12;
    p.drawRectangle({ x: M + CW - bw - 8, y: y - 19, width: bw, height: 15, color: gold });
    p.drawText(badge, { x: M + CW - bw - 2, y: y - 16, size: 7, font: fS, color: rgb(1, 1, 1) });

    // Figures row
    const fy = y - 38;
    const cols = [
      { l: "Nákup", v: proj.purchase },
      { l: "Realizace", v: proj.reno },
      { l: "Výnos", v: proj.yield },
    ];
    const cw = (CW - 12) / 3;
    cols.forEach((c, i) => {
      const fx = M + 12 + i * cw;
      p.drawText(c.l, { x: fx, y: fy + 10, size: 7, font: fR, color: grey });
      p.drawText(c.v, { x: fx, y: fy - 2, size: 11, font: fB, color: i === 2 ? gold : navy });
    });

    y -= cardH + 8;
  }

  // ── SEPARATOR ──
  y -= 6;
  p.drawRectangle({ x: M, y, width: CW, height: 1, color: gold });
  y -= 20;

  // ── JAK TO FUNGUJE (compact) ──
  p.drawText("Jak to funguje", { x: M, y, size: 14, font: fB, color: navy });
  y -= 22;

  const steps = [
    { n: "1", t: "Schůzka", d: "Ukážeme projekt — rozpočet, lokalitu, harmonogram." },
    { n: "2", t: "Smlouva", d: "Dohodneme podmínky, výši investice, termíny." },
    { n: "3", t: "Realizace", d: "Stavíme. Investor dostává pravidelné reporty." },
    { n: "4", t: "Vyplacení", d: "Po prodeji vyplatíme jistinu + podíl na zisku." },
  ];

  for (const s of steps) {
    // Number circle
    p.drawRectangle({ x: M, y: y - 4, width: 20, height: 20, color: gold });
    const nw = fB.widthOfTextAtSize(s.n, 11);
    p.drawText(s.n, { x: M + 10 - nw / 2, y: y, size: 11, font: fB, color: rgb(1, 1, 1) });

    p.drawText(s.t, { x: M + 28, y: y + 2, size: 10, font: fS, color: navy });
    p.drawText(s.d, { x: M + 28, y: y - 10, size: 8.5, font: fR, color: grey });

    if (s !== steps[steps.length - 1]) {
      p.drawLine({ start: { x: M + 10, y: y - 6 }, end: { x: M + 10, y: y - 26 }, thickness: 0.8, color: gold });
    }
    y -= 32;
  }

  // ── TRACK RECORD (one line) ──
  y -= 4;
  p.drawRectangle({ x: M, y: y - 22, width: CW, height: 22, color: greyBg });
  const tr = "7 dokončených projektů  •  celkový výnos 21 mil. Kč  •  průměrná výnosnost 28 %";
  const trW = fS.widthOfTextAtSize(tr, 8.5);
  p.drawText(tr, { x: (W - trW) / 2, y: y - 15, size: 8.5, font: fS, color: navy });

  // ── CONTACT BAR (bottom) ──
  y -= 38;
  const contactH = 50;
  p.drawRectangle({ x: M, y: y - contactH, width: CW, height: contactH, color: navy });
  p.drawRectangle({ x: M, y: y, width: CW, height: 1, color: gold });

  const cTitle = "Máte zájem? Ozvěte se.";
  const ctW = fB.widthOfTextAtSize(cTitle, 12);
  p.drawText(cTitle, { x: (W - ctW) / 2, y: y - 18, size: 12, font: fB, color: onDark });

  const cLine = "Miroslav Fencl  |  info@puskinpartners.cz  |  +420 602 674 143  |  Rybná 716/24, Praha 1";
  const clW = fR.widthOfTextAtSize(cLine, 8);
  p.drawText(cLine, { x: (W - clW) / 2, y: y - 36, size: 8, font: fR, color: gold });

  // ── FOOTER ──
  p.drawRectangle({ x: 0, y: 0, width: W, height: 24, color: navy });
  p.drawLine({ start: { x: 0, y: 24 }, end: { x: W, y: 24 }, thickness: 0.5, color: gold });
  p.drawText("Alexandr Puškin, s.r.o.  |  IČO: 26740788", { x: M, y: 8, size: 7, font: fR, color: onDark });

  doc.setTitle("Investiční příležitosti — Puskin Partners");
  doc.setAuthor("Alexandr Puškin, s.r.o.");

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
