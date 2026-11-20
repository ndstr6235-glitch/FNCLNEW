// Návrh vlastní směnky (výstavce = Miroslav Fencl jako fyzická osoba, remitent = investor).
// Obsahuje podstatné náležitosti vlastní směnky dle čl. I § 75 zákona
// č. 191/1950 Sb., směnečného a šekového. Bez dat = prázdný návrh k doplnění.

import { PDFDocument, PDFFont, rgb, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { INTER_REGULAR_B64, INTER_BOLD_B64, INTER_SEMIBOLD_B64 } from "./fonts-data";
import { COMPANY_SIGNATORY } from "./company";

export interface SmenkaPdfData {
  clientName?: string;
  birthDate?: string;
  street?: string;
  city?: string;
  zip?: string;
  amount?: number;
  /** Datum splatnosti (YYYY-MM-DD) */
  dueDate?: string;
  /** Datum vystavení (YYYY-MM-DD) */
  issueDate?: string;
  /** Výstavce (Miroslav Fencl) — datum narození a bydliště */
  issuerBirthDate?: string;
  issuerAddress?: string;
  /** Vodoznak „NÁVRH“ — výchozí true */
  draft?: boolean;
}

const COMPANY_NAME = "Alexandr Puškin, s.r.o.";
const PAYMENT_PLACE = "Praha";

function fmtCzDate(value?: string): string | undefined {
  if (!value) return undefined;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${Number(m[3])}. ${Number(m[2])}. ${m[1]}`;
  return value;
}

function fmtAmount(n?: number): string | undefined {
  if (!n) return undefined;
  return `${n.toLocaleString("cs-CZ")} Kč`;
}

const regularBytes = Buffer.from(INTER_REGULAR_B64, "base64");
const boldBytes = Buffer.from(INTER_BOLD_B64, "base64");
const semiBytes = Buffer.from(INTER_SEMIBOLD_B64, "base64");

export async function generateSmenkaPdf(data: SmenkaPdfData = {}): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle("Návrh směnky — Puskin Partners");
  doc.setAuthor(COMPANY_NAME);

  const fR = await doc.embedFont(regularBytes, { subset: true });
  const fB = await doc.embedFont(boldBytes, { subset: true });
  const fS = await doc.embedFont(semiBytes, { subset: true });

  const W = 595.28;
  const H = 841.89;
  const M = 56;

  const ink = rgb(0.086, 0.129, 0.114);
  const text2 = rgb(0.231, 0.282, 0.259);
  const gold = rgb(0.663, 0.533, 0.306);
  const grey = rgb(0.431, 0.416, 0.380);
  const paper = rgb(0.949, 0.933, 0.902);
  const onDark = rgb(0.937, 0.918, 0.882);

  const page = doc.addPage([W, H]);

  // ── Hlavička ──
  const headerH = 72;
  page.drawRectangle({ x: 0, y: H - headerH, width: W, height: headerH, color: ink });
  page.drawText("PUSKIN", { x: M, y: H - 38, size: 20, font: fB, color: onDark });
  page.drawText("PARTNERS", { x: M, y: H - 52, size: 9, font: fS, color: gold });
  const hl = "Vlastní směnka";
  page.drawText(hl, { x: W - M - fS.widthOfTextAtSize(hl, 10), y: H - 42, size: 10, font: fS, color: gold });
  page.drawRectangle({ x: 0, y: H - headerH - 1, width: W, height: 1, color: gold });

  const center = (t: string, y: number, size: number, font: PDFFont, color = ink) =>
    page.drawText(t, { x: (W - font.widthOfTextAtSize(t, size)) / 2, y, size, font, color });

  let y = H - headerH - 44;
  center(data.draft === false ? "Směnka" : "Návrh směnky", y, 22, fB);
  y -= 20;
  center("vlastní směnka dle zákona č. 191/1950 Sb., směnečného a šekového", y, 9.5, fR, grey);
  y -= 30;

  // ── Rámeček směnky ──
  const boxX = M - 8;
  const boxW = W - 2 * (M - 8);
  const boxTop = y;
  const boxH = 470;
  page.drawRectangle({ x: boxX, y: boxTop - boxH, width: boxW, height: boxH, color: paper, borderColor: gold, borderWidth: 1.2 });
  page.drawRectangle({ x: boxX + 5, y: boxTop - boxH + 5, width: boxW - 10, height: boxH - 10, borderColor: gold, borderWidth: 0.4, opacity: 0 });

  const ix = boxX + 24;
  const iw = boxW - 48;
  y = boxTop - 34;

  // Pole: popisek nahoře, hodnota nebo linka pod ním
  function field(label: string, value: string | undefined, x: number, width: number, yy: number) {
    page.drawText(label.toUpperCase(), { x, y: yy, size: 7, font: fS, color: gold });
    const vy = yy - 17;
    if (value) {
      page.drawText(value, { x, y: vy, size: 11, font: fS, color: ink });
    }
    page.drawLine({ start: { x, y: vy - 4 }, end: { x: x + width, y: vy - 4 }, thickness: 0.6, color: grey });
  }

  function wrap(t: string, maxW: number, font: PDFFont, size: number): string[] {
    const out: string[] = [];
    let cur = "";
    for (const w of t.split(" ")) {
      const test = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && cur) {
        out.push(cur);
        cur = w;
      } else cur = test;
    }
    if (cur) out.push(cur);
    return out;
  }

  // Řádek 1: místo a datum vystavení | směnečná suma
  const half = (iw - 24) / 2;
  field("Místo a datum vystavení", data.issueDate ? `${PAYMENT_PLACE}, ${fmtCzDate(data.issueDate)}` : undefined, ix, half, y);
  field("Směnečná suma", fmtAmount(data.amount), ix + half + 24, half, y);
  y -= 52;

  // Řádek 2: splatnost | místo placení
  field("Splatnost (den)", fmtCzDate(data.dueDate), ix, half, y);
  field("Místo placení", PAYMENT_PLACE, ix + half + 24, half, y);
  y -= 58;

  // Směnečný slib
  const amountTxt = fmtAmount(data.amount) ?? "______________ Kč";
  const dueTxt = fmtCzDate(data.dueDate) ?? "______________";
  const promise =
    `Dne ${dueTxt} zaplatím za tuto směnku bez protestu na řad níže uvedeného remitenta ` +
    `částku ${amountTxt}, slovy ___________________________________________ korun českých.`;
  for (const line of wrap(promise, iw, fS, 11.5)) {
    page.drawText(line, { x: ix, y, size: 11.5, font: fS, color: ink });
    y -= 17;
  }
  y -= 18;

  // Remitent
  page.drawText("REMITENT (NA JEHOŽ ŘAD SE PLATÍ)", { x: ix, y, size: 7, font: fS, color: gold });
  y -= 22;
  field("Jméno a příjmení", data.clientName, ix, half, y);
  field("Datum narození", fmtCzDate(data.birthDate), ix + half + 24, half, y);
  y -= 50;
  const addr = [data.street, [data.zip, data.city].filter(Boolean).join(" ")].filter((s) => s && s.trim()).join(", ");
  field("Bydliště", addr || undefined, ix, iw, y);
  y -= 58;

  // Výstavce — fyzická osoba
  page.drawText("VÝSTAVCE", { x: ix, y, size: 7, font: fS, color: gold });
  y -= 22;
  field("Jméno a příjmení", COMPANY_SIGNATORY, ix, half, y);
  field("Datum narození", fmtCzDate(data.issuerBirthDate), ix + half + 24, half, y);
  y -= 50;
  field("Bydliště", data.issuerAddress, ix, half, y);
  const sigX = ix + half + 24;
  const sigY = y - 17 - 4;
  page.drawLine({ start: { x: sigX, y: sigY }, end: { x: sigX + half, y: sigY }, thickness: 0.6, color: grey });
  const sigLabel = "podpis výstavce";
  page.drawText(sigLabel, { x: sigX + (half - fR.widthOfTextAtSize(sigLabel, 8)) / 2, y: sigY - 12, size: 8, font: fR, color: grey });

  // ── Poznámky pod rámečkem ──
  y = boxTop - boxH - 28;
  const notes = [
    "Směnka je platná jen jako originál s vlastnoručním podpisem výstavce. Elektronická kopie ani tento návrh směnkou nejsou.",
    "Směnku nelze měnit ani přepisovat. Částku slovy a číslem je nutné vyplnit shodně.",
  ];
  for (const n of notes) {
    for (const line of wrap(n, W - 2 * M, fR, 8.5)) {
      page.drawText(line, { x: M, y, size: 8.5, font: fR, color: grey });
      y -= 12;
    }
    y -= 4;
  }

  // Vodoznak NÁVRH
  if (data.draft !== false) {
    const wm = "NÁVRH";
    const size = 110;
    page.drawText(wm, {
      x: W / 2 - fB.widthOfTextAtSize(wm, size) / 2 * Math.cos(Math.PI / 6) + 10,
      y: H / 2 - 190,
      size,
      font: fB,
      color: gold,
      opacity: 0.08,
      rotate: degrees(30),
    });
  }

  return Buffer.from(await doc.save());
}
