// Generates a contract proposal PDF using pdf-lib + embedded Inter font.
// Inter supports full Czech diacritics. Works on Vercel serverless (no Puppeteer).

import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import * as fontkit from "@pdf-lib/fontkit";
import { INTER_REGULAR_B64, INTER_BOLD_B64, INTER_SEMIBOLD_B64 } from "./fonts-data";

export interface ProposalPdfData {
  clientName?: string;
  clientEmail?: string;
  amount?: number;
  interestRate?: number;
  duration?: string;
  payoutFrequency?: string;
  birthDate?: string;
  street?: string;
  city?: string;
  zip?: string;
  bankAccount?: string;
}

const BLANK_LINE = "_______________________________";

function fmtBirthDate(d?: string): string {
  if (!d) return BLANK_LINE;
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  return d;
}

function fmtAddress(street?: string, city?: string, zip?: string): string {
  const parts = [street, [zip, city].filter(Boolean).join(" ")].filter(
    (s) => s && s.trim()
  );
  if (parts.length === 0) return BLANK_LINE;
  return parts.join(", ");
}

function fmtAmount(n?: number): string {
  if (!n) return "_______________";
  return `${n.toLocaleString("cs-CZ")} Kč`;
}

function fmtRate(r?: number): string {
  if (r == null) return "___ %";
  return `${r} %`;
}

function fmtDuration(d?: string): string {
  if (!d) return "_______________";
  const map: Record<string, string> = {
    "6": "šesti měsíců (6)",
    "12": "jednoho roku (12 měs.)",
    "24": "dvou let (24 měs.)",
    "36": "tří let (36 měs.)",
  };
  return map[d] || `${d} měsíců`;
}

function fmtFrequency(f?: string): string {
  if (!f) return "_______________";
  if (f === "monthly") return "měsíčně";
  if (f === "quarterly") return "čtvrtletně";
  return f;
}

// Decode fonts from embedded base64 — works everywhere including Vercel serverless
const interRegularBytes = Buffer.from(INTER_REGULAR_B64, "base64");
const interBoldBytes = Buffer.from(INTER_BOLD_B64, "base64");
const interSemiBoldBytes = Buffer.from(INTER_SEMIBOLD_B64, "base64");

export async function generateProposalPdf(data: ProposalPdfData): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontRegular = await doc.embedFont(interRegularBytes, { subset: true });
  const fontBold = await doc.embedFont(interBoldBytes, { subset: true });
  const fontSemi = await doc.embedFont(interSemiBoldBytes, { subset: true });

  // ── Layout constants ──
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 56;
  const contentWidth = pageWidth - 2 * margin;

  // ── Color palette (matches Puskin Partners web design) ──
  const navy = rgb(0.086, 0.129, 0.114); // #16211D (ink)
  const navyLight = rgb(0.231, 0.282, 0.259); // #3B4842 (text-2)
  const gold = rgb(0.663, 0.533, 0.306); // #A9884E (brass)
  const goldLight = rgb(0.761, 0.643, 0.412); // #C2A468 (brass-dark)
  const grey = rgb(0.431, 0.416, 0.380); // #6E6A61 (text-3)
  const greyLight = rgb(0.82, 0.84, 0.87);
  const greyBg = rgb(0.949, 0.933, 0.902); // #F2EEE6 (paper)
  const black = rgb(0.086, 0.129, 0.114); // #16211D (ink)
  const white = rgb(0.937, 0.918, 0.882); // #EFEAE1 (on-dark)

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight;

  // ── HEADER BAR ──
  const headerH = 72;
  page.drawRectangle({
    x: 0,
    y: pageHeight - headerH,
    width: pageWidth,
    height: headerH,
    color: navy,
  });

  // Brand — text logo (PUSKIN + PARTNERS)
  page.drawText("PUSKIN", {
    x: margin,
    y: pageHeight - 38,
    size: 20,
    font: fontBold,
    color: white,
  });
  page.drawText("PARTNERS", {
    x: margin,
    y: pageHeight - 52,
    size: 9,
    font: fontSemi,
    color: gold,
  });

  // Right side company info
  const headerInfoFaded = rgb(0.937, 0.918, 0.882); // on-dark at 60% visual
  const headerRight = [
    { text: "Alexandr Puškin, s.r.o.", size: 9.5, font: fontSemi, color: white },
    { text: "IČO: 26740788  |  DS: ", size: 8.5, font: fontRegular, color: headerInfoFaded },
    { text: "Rybná 716/24, 110 00 Praha 1", size: 8.5, font: fontRegular, color: headerInfoFaded },
  ];
  headerRight.forEach((line, i) => {
    const w = line.font.widthOfTextAtSize(line.text, line.size);
    page.drawText(line.text, {
      x: pageWidth - margin - w,
      y: pageHeight - 28 - i * 13,
      size: line.size,
      font: line.font,
      color: line.color,
    });
  });

  // Brass accent line under header
  page.drawRectangle({
    x: 0,
    y: pageHeight - headerH - 1,
    width: pageWidth,
    height: 1,
    color: gold,
  });

  y = pageHeight - headerH - 1 - 75;

  // ── TITLE ──
  const title = "Smlouva o zápůjčce";
  const titleSize = 28;
  const titleW = fontBold.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: (pageWidth - titleW) / 2,
    y,
    size: titleSize,
    font: fontBold,
    color: navy,
  });
  y -= 30;

  const subtitle = "uzavřená dle § 2390 a násl. zákona č. 89/2012 Sb., občanský zákoník";
  const subtitleSize = 10.5;
  const subtitleW = fontRegular.widthOfTextAtSize(subtitle, subtitleSize);
  page.drawText(subtitle, {
    x: (pageWidth - subtitleW) / 2,
    y,
    size: subtitleSize,
    font: fontRegular,
    color: grey,
  });
  y -= 58;

  // ── Helper: text wrapping ──
  function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  // ── Helper: section heading ──
  function drawSectionHeader(num: string, titleText: string) {
    const eyebrow = `ČLÁNEK ${num}`;
    page.drawText(eyebrow, {
      x: margin,
      y,
      size: 9,
      font: fontBold,
      color: gold,
    });
    y -= 20;
    page.drawText(titleText, {
      x: margin,
      y,
      size: 17,
      font: fontBold,
      color: navy,
    });
    y -= 28;
  }

  // ── Helper: numbered clause ──
  function drawNumberedItem(num: string, text: string) {
    const lineHeight = 16;
    const fontSize = 10.5;
    page.drawText(num, {
      x: margin,
      y,
      size: fontSize,
      font: fontBold,
      color: gold,
    });
    const lines = wrapText(text, contentWidth - 42, fontRegular, fontSize);
    lines.forEach((line, i) => {
      page.drawText(line, {
        x: margin + 42,
        y: y - i * lineHeight,
        size: fontSize,
        font: fontRegular,
        color: black,
      });
    });
    y -= lines.length * lineHeight + 12;
  }

  // ── Helper: party box ──
  function drawPartyBox(label: string, fields: [string, string][], filled: boolean) {
    const padTop = 20;
    const padBottom = 22;
    const padLeft = 24;
    const rowHeight = 22;
    const labelGap = 22;
    const boxH = padTop + labelGap + fields.length * rowHeight + padBottom - rowHeight;

    const boxTop = y + 10;
    const boxBottom = boxTop - boxH;

    // Background
    page.drawRectangle({
      x: margin,
      y: boxBottom,
      width: contentWidth,
      height: boxH,
      color: greyBg,
    });
    // Left gold accent bar
    page.drawRectangle({
      x: margin,
      y: boxBottom,
      width: 3,
      height: boxH,
      color: gold,
    });

    // Label
    let cursorY = boxTop - padTop;
    page.drawText(label, {
      x: margin + padLeft,
      y: cursorY,
      size: 10,
      font: fontBold,
      color: gold,
    });
    cursorY -= labelGap;

    // Fields
    for (const [key, val] of fields) {
      page.drawText(key, {
        x: margin + padLeft,
        y: cursorY,
        size: 10,
        font: fontRegular,
        color: grey,
      });
      page.drawText(val, {
        x: margin + 190,
        y: cursorY,
        size: 10,
        font: filled ? fontSemi : fontRegular,
        color: filled ? black : grey,
      });
      cursorY -= rowHeight;
    }
    y = boxBottom - 22;
  }

  // ── Helper: page break ──
  function ensureSpace(needed: number) {
    if (y - needed < 80) {
      drawFooter(page);
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - 50;
    }
  }

  // ── Helper: footer ──
  function drawFooter(p: PDFPage) {
    const footerH = 36;
    const footerY = 0;
    // Dark background bar
    p.drawRectangle({
      x: 0,
      y: footerY,
      width: pageWidth,
      height: footerH,
      color: navy,
    });
    // Brass line above
    p.drawLine({
      start: { x: 0, y: footerH },
      end: { x: pageWidth, y: footerH },
      thickness: 0.5,
      color: gold,
    });
    const footerTextColor = rgb(0.937, 0.918, 0.882); // on-dark faded
    p.drawText("Alexandr Puškin, s.r.o.  |  IČO: 26740788  |  Rybná 716/24, 110 00 Praha 1", {
      x: margin,
      y: footerY + 13,
      size: 8,
      font: fontRegular,
      color: footerTextColor,
    });
    const footRight = "Smlouva o zápůjčce";
    const frW = fontRegular.widthOfTextAtSize(footRight, 8);
    p.drawText(footRight, {
      x: pageWidth - margin - frW,
      y: footerY + 13,
      size: 8,
      font: fontRegular,
      color: footerTextColor,
    });
  }

  // ── SECTION 1: SMLUVNÍ STRANY ──
  page.drawText("ČLÁNEK I", {
    x: margin,
    y,
    size: 9,
    font: fontBold,
    color: gold,
  });
  y -= 20;
  page.drawText("Smluvní strany", {
    x: margin,
    y,
    size: 17,
    font: fontBold,
    color: navy,
  });
  y -= 32;

  const addressLine = fmtAddress(data.street, data.city, data.zip);
  const birthLine = fmtBirthDate(data.birthDate);
  const bankLine = data.bankAccount?.trim() || BLANK_LINE;
  const hasAnyClientData =
    !!data.clientName ||
    addressLine !== BLANK_LINE ||
    birthLine !== BLANK_LINE ||
    bankLine !== BLANK_LINE;

  drawPartyBox(
    "VĚŘITEL",
    [
      ["Jméno a příjmení:", data.clientName || BLANK_LINE],
      ["Datum narození:", birthLine],
      ["Bytem:", addressLine],
      ["Bankovní spojení:", bankLine],
    ],
    hasAnyClientData,
  );

  drawPartyBox(
    "DLUŽNÍK",
    [
      ["Společnost:", "Alexandr Puškin, s.r.o."],
      ["Sídlo:", "Rybná 716/24, Staré Město, 110 00 Praha 1"],
      ["IČO:", "26740788"],
      ["Zastoupená:", "Miroslav Fencl, jednatel"],
    ],
    true,
  );

  // ── ČLÁNEK II ──
  ensureSpace(120);
  drawSectionHeader("II", "Předmět smlouvy");
  drawNumberedItem("2.1", `Předmětem této smlouvy je poskytnutí peněžní zápůjčky ve výši ${fmtAmount(data.amount)}.`);
  drawNumberedItem("2.2", "Účelem zápůjčky je financování podnikatelské činnosti Dlužníka.");
  drawNumberedItem("2.3", "Peněžní zápůjčku vyplatí Věřitel Dlužníkovi bezhotovostně na číslo účtu: .");

  // ── ČLÁNEK III ──
  ensureSpace(100);
  drawSectionHeader("III", "Doba trvání smlouvy");
  drawNumberedItem("3.1", `Tato smlouva se uzavírá na dobu určitou ${fmtDuration(data.duration)} ode dne poskytnutí zápůjčky.`);
  drawNumberedItem("3.2", "Smluvní strany se mohou písemně dohodnout na prodloužení (prolongaci) smlouvy, a to nejpozději 30 dnů před uplynutím sjednané doby.");

  // ── ČLÁNEK IV ──
  ensureSpace(140);
  drawSectionHeader("IV", "Úrok a výplata výnosu");
  drawNumberedItem("4.1", `Zápůjčka je úročena pevnou sazbou ve výši ${fmtRate(data.interestRate)} p.a. (ročně) z jistiny.`);
  drawNumberedItem("4.2", `Úrok je vyplácen ${fmtFrequency(data.payoutFrequency)}, vždy k 15. dni příslušného kalendářního období, v poměrné výši odpovídající délce výplatního období.`);
  drawNumberedItem("4.3", "První úroková platba bude vyplacena k nejbližšímu 15. dni následujícímu po podpisu smlouvy.");
  drawNumberedItem("4.4", "Jistina je splatná nejpozději poslední den sjednané doby trvání smlouvy, pokud nebude sjednána její prolongace.");

  // ── ČLÁNEK V ──
  ensureSpace(100);
  drawSectionHeader("V", "Prodlení a sankce");
  drawNumberedItem("5.1", "V případě prodlení Dlužníka delšího než 5 kalendářních dnů s úhradou úroku nebo vrácením jistiny vzniká Věřiteli právo požadovat smluvní úrok z prodlení ve výši 12 % ročně z dlužné částky.");
  drawNumberedItem("5.2", "V případě prodlení delšího než 30 dnů je Věřitel oprávněn zesplatnit celý závazek a požadovat okamžité splacení jistiny.");

  // ── ČLÁNEK VI ──
  ensureSpace(140);
  drawSectionHeader("VI", "Práva a povinnosti Věřitele");
  drawNumberedItem("6.1", "Věřitel je povinen poskytnout Dlužníkovi peněžní prostředky ve výši jistiny dle čl. 2.1 této smlouvy, a to nejpozději do 5 pracovních dnů ode dne podpisu této smlouvy oběma smluvními stranami.");
  drawNumberedItem("6.2", "Věřitel je oprávněn požadovat po Dlužníkovi řádné a včasné plnění veškerých závazků vyplývajících z této smlouvy, zejména výplatu úroků ve sjednaných termínech a vrácení jistiny v termínu dle čl. 3.1.");
  drawNumberedItem("6.3", "Věřitel je oprávněn ověřit u Dlužníka stav úhrad a aktuální výši jeho závazku z této smlouvy, a to nejvýše jednou za kalendářní čtvrtletí na základě písemné žádosti.");
  drawNumberedItem("6.4", "Věřitel je povinen sdělit Dlužníkovi bez zbytečného odkladu jakoukoliv změnu svých identifikačních nebo platebních údajů, zejména změnu bankovního spojení.");

  // ── ČLÁNEK VII ──
  ensureSpace(140);
  drawSectionHeader("VII", "Práva a povinnosti Dlužníka");
  drawNumberedItem("7.1", "Dlužník je povinen vrátit Věřiteli celou poskytnutou jistinu řádně a včas v termínu dle čl. 3.1, a to na bankovní účet Věřitele uvedený v záhlaví této smlouvy.");
  drawNumberedItem("7.2", "Dlužník je povinen vyplácet Věřiteli úroky ve výši a četnosti dle čl. IV této smlouvy, vždy nejpozději do 15. dne kalendářního měsíce za období uplynulé.");
  drawNumberedItem("7.3", "Dlužník je povinen použít poskytnutou zápůjčku výhradně v souladu s účelem sjednaným v čl. 2.2 této smlouvy.");
  drawNumberedItem("7.4", "Dlužník je povinen bez zbytečného odkladu, nejpozději však do 7 kalendářních dnů, písemně informovat Věřitele o zahájení insolvenčního řízení, exekučního řízení nebo o podstatném zhoršení své finanční situace ohrožující plnění závazků z této smlouvy.");
  drawNumberedItem("7.5", "Dlužník je oprávněn kdykoliv splatit zápůjčku zcela nebo zčásti i před termínem splatnosti, a to bez sankce. O předčasné splátce je Dlužník povinen Věřitele písemně informovat nejméně 15 kalendářních dnů předem.");

  // ── ČLÁNEK VIII ──
  ensureSpace(70);
  drawSectionHeader("VIII", "Prohlášení Dlužníka");
  drawNumberedItem("8.1", "Dlužník prohlašuje, že není v úpadku ani mu úpadek nehrozí, není proti němu vedeno insolvenční řízení, exekuce ani výkon rozhodnutí a je schopen dostát svým závazkům.");

  // ── ČLÁNEK IX ──
  ensureSpace(120);
  drawSectionHeader("IX", "Závěrečná ustanovení");
  drawNumberedItem("9.1", "Jakékoli změny této smlouvy lze provádět pouze písemnou formou číslovaných dodatků.");
  drawNumberedItem("9.2", "Pokud by některé ustanovení bylo neplatné, ostatní ustanovení zůstávají nedotčena.");
  drawNumberedItem("9.3", "Smlouva je vyhotovena ve dvou stejnopisech, z nichž každá strana obdrží jedno vyhotovení.");
  drawNumberedItem("9.4", "Smlouva nabývá účinnosti dnem podpisu oběma smluvními stranami.");

  // ── SIGNATURES ──
  ensureSpace(180);
  y -= 24;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: greyLight,
  });
  y -= 32;

  // Column positions
  const leftCol = margin + 20;
  const rightCol = pageWidth / 2 + 20;
  const leftLineEnd = pageWidth / 2 - 30;
  const rightLineEnd = pageWidth - margin - 20;

  // Headers
  page.drawText("VĚŘITEL", {
    x: leftCol,
    y,
    size: 10,
    font: fontSemi,
    color: gold,
  });
  page.drawText("DLUŽNÍK", {
    x: rightCol,
    y,
    size: 10,
    font: fontSemi,
    color: gold,
  });

  // Signature space
  y -= 75;

  // Signature lines
  page.drawLine({
    start: { x: leftCol, y },
    end: { x: leftLineEnd, y },
    thickness: 0.7,
    color: gold,
  });
  page.drawLine({
    start: { x: rightCol, y },
    end: { x: rightLineEnd, y },
    thickness: 0.7,
    color: gold,
  });

  // Right side — Miroslav Fencl name
  page.drawText("Miroslav Fencl, jednatel", {
    x: rightCol,
    y: y - 14,
    size: 10,
    font: fontSemi,
    color: black,
  });

  // Date lines — VĚŘITEL stays blank for client to fill in by hand;
  // DLUŽNÍK (Miroslav Fencl) gets today's date pre-filled.
  y -= 30;
  page.drawText("V Praze dne _______________", {
    x: leftCol,
    y,
    size: 9.5,
    font: fontRegular,
    color: grey,
  });
  const today = new Date().toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  page.drawText(`V Praze dne ${today}`, {
    x: rightCol,
    y,
    size: 9.5,
    font: fontRegular,
    color: grey,
  });

  // ── FOOTER ──
  drawFooter(page);

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
