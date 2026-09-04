// Single-page A4 investment leaflet — matches web design tokens

import { PDFDocument, PDFFont, PDFPage, rgb, type Color } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { INTER_REGULAR_B64, INTER_BOLD_B64, INTER_SEMIBOLD_B64 } from "./fonts-data";
import {
  BYT5_1_PRED_B64, BYT5_1_PO_B64,
  BYT5_2_PRED_B64, BYT5_2_PO_B64,
  BYT5_3_PRED_B64, BYT5_3_PO_B64,
} from "./images-data";

/* ── color palette (from globals.css design tokens) ── */
const ink      = rgb(0.086, 0.129, 0.114);   // #16211D
const brass    = rgb(0.663, 0.533, 0.306);   // #A9884E
const brassLt  = rgb(0.761, 0.643, 0.408);   // #C2A468
const paper    = rgb(0.949, 0.933, 0.902);   // #F2EEE6
const onDark   = rgb(0.937, 0.918, 0.882);   // #EFEAE1
const text3    = rgb(0.431, 0.416, 0.380);   // #6E6A61
const white    = rgb(1, 1, 1);
const borderC  = rgb(0.82, 0.80, 0.77);

/* ── helpers ── */
function drawDashedRect(p: PDFPage, x: number, y: number, w: number, h: number, color: Color) {
  const dash = 4, gap = 3;
  for (const [x1, y1, x2] of [[x, y + h, x + w], [x, y, x + w]] as const) {
    for (let cx = x1; cx < x2; cx += dash + gap)
      p.drawLine({ start: { x: cx, y: y1 }, end: { x: Math.min(cx + dash, x2), y: y1 }, thickness: 0.6, color });
  }
  for (let cy = y; cy < y + h; cy += dash + gap) {
    p.drawLine({ start: { x, y: cy }, end: { x, y: Math.min(cy + dash, y + h) }, thickness: 0.6, color });
    p.drawLine({ start: { x: x + w, y: cy }, end: { x: x + w, y: Math.min(cy + dash, y + h) }, thickness: 0.6, color });
  }
}

function label(p: PDFPage, x: number, y: number, text: string, font: PDFFont) {
  p.drawText(text, { x, y, size: 7.5, font, color: brass });
  const w = font.widthOfTextAtSize(text, 7.5);
  p.drawLine({ start: { x, y: y - 3 }, end: { x: x + w, y: y - 3 }, thickness: 0.8, color: brass });
}

export async function generateInvestmentPdf(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fR = await doc.embedFont(Buffer.from(INTER_REGULAR_B64, "base64"), { subset: true });
  const fB = await doc.embedFont(Buffer.from(INTER_BOLD_B64, "base64"), { subset: true });
  const fS = await doc.embedFont(Buffer.from(INTER_SEMIBOLD_B64, "base64"), { subset: true });

  // Embed before/after images (3 pairs, landscape 4:3)
  const imgs = {
    pred: [
      await doc.embedJpg(Buffer.from(BYT5_1_PRED_B64, "base64")),
      await doc.embedJpg(Buffer.from(BYT5_2_PRED_B64, "base64")),
      await doc.embedJpg(Buffer.from(BYT5_3_PRED_B64, "base64")),
    ],
    po: [
      await doc.embedJpg(Buffer.from(BYT5_1_PO_B64, "base64")),
      await doc.embedJpg(Buffer.from(BYT5_2_PO_B64, "base64")),
      await doc.embedJpg(Buffer.from(BYT5_3_PO_B64, "base64")),
    ],
  };

  const W = 595.28;
  const H = 841.89;
  const M = 42;
  const CW = W - 2 * M;

  const p = doc.addPage([W, H]);

  // ═══════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════
  const headerH = 58;
  p.drawRectangle({ x: 0, y: H - headerH, width: W, height: headerH, color: ink });
  p.drawRectangle({ x: 0, y: H - headerH - 2, width: W, height: 2, color: brass });

  p.drawText("Puskin", { x: M, y: H - 28, size: 18, font: fB, color: onDark });
  const pW = fB.widthOfTextAtSize("Puskin", 18);
  p.drawText(" and ", { x: M + pW, y: H - 28, size: 18, font: fR, color: text3 });
  const aW = fR.widthOfTextAtSize(" and ", 18);
  p.drawText("Partners", { x: M + pW + aW, y: H - 28, size: 18, font: fB, color: onDark });
  p.drawText("Development  •  Rekonstrukce  •  Investice", { x: M, y: H - 42, size: 7.5, font: fR, color: brass });

  const hTitle = "Investiční příležitosti";
  const htW = fB.widthOfTextAtSize(hTitle, 13);
  p.drawText(hTitle, { x: W - M - htW, y: H - 34, size: 13, font: fB, color: onDark });

  // Footer height reserved
  const footerH = 68;

  let y = H - headerH - 28;

  // ═══════════════════════════════════════
  // O SPOLEČNOSTI + V ČÍSLECH
  // ═══════════════════════════════════════
  const rightX = M + CW * 0.62;
  const rightW = CW * 0.38;

  label(p, M, y, "O SPOLEČNOSTI", fS);
  y -= 20;
  p.drawText("Investujte do konkrétních projektů", { x: M, y, size: 17, font: fB, color: ink });
  y -= 20;

  const descLines = [
    "Puskin and Partners je česká společnost zaměřená na development,",
    "rekonstrukce a investice do nemovitostí. Na trhu působíme",
    "od roku 2004. Investoři vědí přesně, kam jdou jejich peníze.",
  ];
  descLines.forEach((line) => {
    p.drawText(line, { x: M, y, size: 8.5, font: fR, color: text3 });
    y -= 13;
  });

  // V ČÍSLECH
  const statY = H - headerH - 46;
  label(p, rightX, statY, "V ČÍSLECH", fS);

  const stats = [
    { value: "150+", sub: "Dokončených\nprojektů" },
    { value: "4", sub: "Rozpracované\nprojekty" },
    { value: "2004", sub: "Na trhu\nod roku" },
  ];
  const sBoxW = (rightW - 10) / 3;
  stats.forEach((s, i) => {
    const sx = rightX + i * (sBoxW + 5);
    const sy = statY - 56;
    drawDashedRect(p, sx, sy, sBoxW, 50, borderC);
    const vw = fB.widthOfTextAtSize(s.value, 17);
    p.drawText(s.value, { x: sx + (sBoxW - vw) / 2, y: sy + 30, size: 17, font: fB, color: brass });
    s.sub.split("\n").forEach((line, li) => {
      const lw = fR.widthOfTextAtSize(line, 6.5);
      p.drawText(line, { x: sx + (sBoxW - lw) / 2, y: sy + 14 - li * 9, size: 6.5, font: fR, color: text3 });
    });
  });

  y -= 18;

  // ═══════════════════════════════════════
  // AKTUÁLNÍ PROJEKTY — 2×2 grid
  // ═══════════════════════════════════════
  label(p, M, y, "AKTUÁLNÍ PROJEKTY", fS);
  y -= 20;
  p.drawText("Aktuální investiční nabídky", { x: M, y, size: 14, font: fB, color: ink });
  y -= 20;

  const projects = [
    { name: "Vila Uhříněves", purchase: "18 mil.", reno: "5 mil.", yield: "30–40 %" },
    { name: "Vila Kladno", purchase: "15 mil.", reno: "6 mil.", yield: "30–40 %" },
    { name: "Wellness Šumava", purchase: "34 mil.", reno: "20 mil.", yield: "20–30 %" },
    { name: "Ubytovací zařízení Brno", purchase: "26 mil.", reno: "6 mil.", yield: "30–40 %" },
  ];

  const cardW = (CW - 14) / 2;
  const cardH = 62;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const proj = projects[row * 2 + col];
      const cx = M + col * (cardW + 14);
      const cy = y - cardH;

      p.drawRectangle({ x: cx, y: cy, width: cardW, height: cardH, color: white });
      p.drawRectangle({ x: cx, y: cy, width: cardW, height: cardH, borderColor: borderC, borderWidth: 0.5, color: white });
      p.drawRectangle({ x: cx, y: cy, width: 3, height: cardH, color: brass });

      p.drawText(proj.name, { x: cx + 14, y: cy + cardH - 17, size: 10.5, font: fB, color: ink });

      const badge = "Hledáme investory";
      const bw = fS.widthOfTextAtSize(badge, 6) + 10;
      p.drawRectangle({ x: cx + cardW - bw - 8, y: cy + cardH - 19, width: bw, height: 13, color: brass });
      p.drawText(badge, { x: cx + cardW - bw - 3, y: cy + cardH - 15.5, size: 6, font: fS, color: white });

      const vals = [
        { l: "Nákup", v: proj.purchase, c: ink },
        { l: "Realizace", v: proj.reno, c: ink },
        { l: "Výnos", v: proj.yield, c: brass },
      ];
      const colW = (cardW - 26) / 3;
      vals.forEach((v, i) => {
        const fx = cx + 14 + i * colW;
        p.drawText(v.l, { x: fx, y: cy + 24, size: 6.5, font: fR, color: text3 });
        p.drawText(v.v, { x: fx, y: cy + 12, size: 10, font: fB, color: v.c });
      });
    }
    y -= cardH + 8;
  }

  y -= 4;

  // ═══════════════════════════════════════
  // NAŠE PRÁCE — 3×2 photo grid (before/after)
  // ═══════════════════════════════════════
  label(p, M, y, "NAŠE PRÁCE", fS);
  y -= 18;
  p.drawText("Byt Praha 10 — kompletní rekonstrukce", { x: M, y, size: 13, font: fB, color: ink });
  y -= 14;

  const photoGap = 6;
  const photoW = (CW - 2 * photoGap) / 3;
  const photoH = photoW * 0.65; // cropped landscape

  // Row 1: PŘED
  const predLabelText = "PŘED";
  p.drawText(predLabelText, { x: M, y: y - 10, size: 7, font: fS, color: ink });
  y -= 14;
  imgs.pred.forEach((img, i) => {
    const ix = M + i * (photoW + photoGap);
    p.drawImage(img, { x: ix, y: y - photoH, width: photoW, height: photoH });
  });
  y -= photoH + 6;

  // Row 2: PO
  const poLabelText = "PO";
  p.drawText(poLabelText, { x: M, y: y - 10, size: 7, font: fS, color: brass });
  y -= 14;
  imgs.po.forEach((img, i) => {
    const ix = M + i * (photoW + photoGap);
    p.drawImage(img, { x: ix, y: y - photoH, width: photoW, height: photoH });
  });
  y -= photoH + 10;

  // ═══════════════════════════════════════
  // JAK TO FUNGUJE — 4 compact steps
  // ═══════════════════════════════════════
  label(p, M, y, "JAK TO FUNGUJE", fS);
  y -= 18;

  const steps = [
    { n: "1", t: "Konzultace", d: "Probereme vaše\npotřeby" },
    { n: "2", t: "Smlouva", d: "Podmínky,\ntermíny" },
    { n: "3", t: "Realizace", d: "Stavíme +\nreporty" },
    { n: "4", t: "Vyplacení", d: "Jistina +\nzisk" },
  ];

  const stepW = (CW - 18) / 4;
  const stepH = 70;

  steps.forEach((s, i) => {
    const sx = M + i * (stepW + 6);
    const sy = y - stepH;

    p.drawRectangle({ x: sx, y: sy, width: stepW, height: stepH, color: paper });

    const sqSize = 20;
    const sqX = sx + (stepW - sqSize) / 2;
    const sqY = sy + stepH - 10 - sqSize;
    p.drawRectangle({ x: sqX, y: sqY, width: sqSize, height: sqSize, color: brass });
    const nw = fB.widthOfTextAtSize(s.n, 11);
    p.drawText(s.n, { x: sqX + (sqSize - nw) / 2, y: sqY + 5, size: 11, font: fB, color: white });

    const tw = fS.widthOfTextAtSize(s.t, 8.5);
    p.drawText(s.t, { x: sx + (stepW - tw) / 2, y: sqY - 13, size: 8.5, font: fS, color: ink });

    s.d.split("\n").forEach((line, li) => {
      const lw = fR.widthOfTextAtSize(line, 6.5);
      p.drawText(line, { x: sx + (stepW - lw) / 2, y: sqY - 25 - li * 9, size: 6.5, font: fR, color: text3 });
    });
  });

  // ═══════════════════════════════════════
  // FOOTER BAR
  // ═══════════════════════════════════════
  p.drawRectangle({ x: 0, y: 0, width: W, height: footerH, color: ink });
  p.drawLine({ start: { x: 0, y: footerH }, end: { x: W, y: footerH }, thickness: 1.5, color: brass });

  label(p, M, footerH - 16, "SPOLUPRÁCE", fS);
  p.drawText("Podílejte se na růstu Puskin Partners", { x: M, y: footerH - 32, size: 11, font: fB, color: onDark });
  p.drawText("Jasné smluvní podmínky, kompletní dokumentace a osobní přístup.", { x: M, y: footerH - 44, size: 7, font: fR, color: text3 });

  const cLine = "Miroslav Fencl  |  info@puskinpartners.cz  |  +420 602 674 143  |  IČO: 26740788";
  p.drawText(cLine, { x: M, y: 8, size: 6.5, font: fR, color: onDark });
  const footR = "Alexandr Puškin, s.r.o.  |  Rybná 716/24, Praha 1";
  p.drawText(footR, { x: W - M - fR.widthOfTextAtSize(footR, 6.5), y: 8, size: 6.5, font: fR, color: onDark });

  const bigStats = [
    { value: "130 mil.", sub: "CELKOVÁ\nINVESTICE" },
    { value: "~30 %", sub: "PRŮMĚRNÝ\nVÝNOS" },
    { value: "4", sub: "AKTUÁLNÍ\nPROJEKTY" },
  ];
  const bsStart = M + CW * 0.54;
  const bsColW = (CW * 0.46) / 3;
  bigStats.forEach((bs, i) => {
    const bx = bsStart + i * bsColW;
    const vw = fB.widthOfTextAtSize(bs.value, 18);
    p.drawText(bs.value, { x: bx + (bsColW - vw) / 2, y: footerH - 28, size: 18, font: fB, color: brassLt });
    bs.sub.split("\n").forEach((line, li) => {
      const lw = fR.widthOfTextAtSize(line, 5.5);
      p.drawText(line, { x: bx + (bsColW - lw) / 2, y: footerH - 42 - li * 7, size: 5.5, font: fR, color: text3 });
    });
  });

  doc.setTitle("Investiční příležitosti — Puskin Partners");
  doc.setAuthor("Alexandr Puškin, s.r.o.");

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
