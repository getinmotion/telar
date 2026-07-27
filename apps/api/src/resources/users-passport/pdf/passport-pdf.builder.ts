import PDFDocument from 'pdfkit';

/**
 * Construcción del PDF del pasaporte digital de la pieza.
 *
 * Réplica en PDFKit del documento que el artesano ve en el paso 5 del wizard de
 * productos (`DigitalPassport.tsx`, artisans-web): portada navy con emblema,
 * página de datos con la fotografía de la pieza y el QR de verificación,
 * páginas de historia / proceso / cuidados / uso, sellos de trazabilidad,
 * anexos fotográficos y MRZ decorativa al pie.
 *
 * Se conserva la paleta hardcodeada del wizard (#ec6d13 / #151b2d / #54433e /
 * #166534) para que impreso y pantalla se lean como el mismo documento.
 */

type Doc = PDFKit.PDFDocument;

// ── Paleta (misma del paso 5) ─────────────────────────────────────────
const NAVY = '#151b2d';
const CREAM = '#fdfaf6';
const ORANGE = '#ec6d13';
const BROWN = '#54433e';
const GREEN = '#166534';
const MINT = '#8fd6a8';
const WHITE = '#ffffff';
/** rgba(21,27,45,0.12) resuelto sobre el crema del documento */
const HAIRLINE = '#e1dfde';

// ── Métricas de página ────────────────────────────────────────────────
const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const M = 40;
const CONTENT_W = PAGE_W - M * 2;
const MRZ_H = 46;

// ── Entrada ───────────────────────────────────────────────────────────

export interface PassportPdfInput {
  /** Número de pasaporte impreso en portada (identityKey del certificado) */
  passportNo: string;
  issueDate: Date;
  piece: {
    name: string;
    shortDescription?: string | null;
    sku?: string | null;
    workshopName?: string | null;
    origin: string;
    department?: string | null;
    collaboration?: string | null;
    categoryText: string;
    purposeLabel?: string | null;
    styleLabels: string[];
    craftName?: string | null;
    primaryTechniqueName?: string | null;
    secondaryTechniqueName?: string | null;
    materialNames: string[];
    elaborationTime?: string | null;
    availabilityLabel?: string | null;
    dimensionsText: string;
    weightText: string;
    artisanName?: string | null;
    history?: string | null;
    processDescription?: string | null;
    tools: string[];
    monthlyCapacity?: number | null;
    careNotes?: string | null;
    usageSuggestions?: string | null;
  };
  owner: {
    name: string;
    idNumber: string;
    email: string;
    phone: string;
  };
  /** Fotografía principal de la pieza (JPEG/PNG). */
  photo: Buffer | null;
  /** Anexo fotográfico (JPEG/PNG). */
  annexes: Buffer[];
  /** Evidencia del proceso (JPEG/PNG). */
  evidence: Buffer[];
  /** QR de verificación (PNG). */
  qr: Buffer;
}

// ── Utilidades de texto ───────────────────────────────────────────────

/**
 * Las fuentes estándar del PDF usan WinAnsi: los emoji y símbolos fuera de
 * cp1252 se descartan para no romper el render (las tildes sí están cubiertas).
 */
const clean = (value?: string | null): string =>
  (value ?? '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\r/g, '')
    .trim();

const orDash = (value?: string | null): string => clean(value) || '—';

/** Parte un texto multilínea en ítems, tolerando bullets legacy ("• ", "- "). */
export const toLines = (value?: string | null): string[] =>
  clean(value)
    .split(/\n+/)
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean);

interface TextOpts {
  font?: string;
  size?: number;
  color?: string;
  opacity?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  tracking?: number;
  lineGap?: number;
  ellipsis?: boolean;
  lineBreak?: boolean;
}

const asPdfOpts = (o: TextOpts) => ({
  width: o.width,
  align: o.align,
  characterSpacing: o.tracking ?? 0,
  lineGap: o.lineGap ?? 0,
  ellipsis: o.ellipsis,
  lineBreak: o.lineBreak ?? true,
});

function measure(doc: Doc, text: string, o: TextOpts): number {
  doc.font(o.font ?? 'Helvetica').fontSize(o.size ?? 9);
  return o.lineBreak === false
    ? doc.currentLineHeight()
    : doc.heightOfString(text, asPdfOpts(o));
}

function write(doc: Doc, text: string, x: number, y: number, o: TextOpts): number {
  const height = measure(doc, text, o);
  doc.fillColor(o.color ?? NAVY, o.opacity ?? 1);
  doc.text(text, x, y, asPdfOpts(o));
  return height;
}

// ── Primitivas del documento ──────────────────────────────────────────

/** Etiqueta micro monoespaciada (equivalente al `font-mono text-[8px]` web). */
const microLabel = (doc: Doc, text: string, x: number, y: number, width: number) =>
  write(doc, text.toUpperCase(), x, y, {
    font: 'Courier-Bold',
    size: 5.8,
    color: BROWN,
    opacity: 0.65,
    tracking: 1.1,
    width,
    lineBreak: false,
    ellipsis: true,
  });

/** Encabezado naranja de grupo, con la regla inferior. */
function groupHeader(doc: Doc, title: string, x: number, y: number, width: number): number {
  write(doc, title.toUpperCase(), x, y, {
    font: 'Courier-Bold',
    size: 6.5,
    color: ORANGE,
    tracking: 1.6,
    width,
    lineBreak: false,
  });
  const ruleY = y + 11;
  doc.lineWidth(0.5).strokeColor(NAVY, 0.12);
  doc.moveTo(x, ruleY).lineTo(x + width, ruleY).stroke();
  return 19;
}

function chips(doc: Doc, labels: string[], x: number, y: number, width: number, draw: boolean): number {
  const H = 12.5;
  doc.font('Helvetica').fontSize(7);
  let cx = x;
  let cy = y;
  for (const label of labels) {
    const w = doc.widthOfString(label) + 11;
    if (cx + w > x + width && cx > x) {
      cx = x;
      cy += H + 3;
    }
    if (draw) {
      doc.roundedRect(cx, cy, w, H, 6).fillColor(WHITE, 0.85).strokeColor(NAVY, 0.14).lineWidth(0.5).fillAndStroke();
      doc.font('Helvetica').fontSize(7).fillColor(BROWN, 1);
      doc.text(label, cx + 5.5, cy + 3.2, { lineBreak: false });
    }
    cx += w + 4;
  }
  return cy + H - y;
}

// ── Campos de la página de datos ──────────────────────────────────────

interface FieldDef {
  label: string;
  value?: string | null;
  /** Si viene, el valor se pinta como chips en vez de texto. */
  chips?: string[];
  /** Ocupa el ancho completo del grupo. */
  wide?: boolean;
}

function drawField(doc: Doc, field: FieldDef, x: number, y: number, width: number): number {
  const labelH = microLabel(doc, field.label, x, y, width) + 2.5;
  if (field.chips && field.chips.length > 0) {
    return labelH + chips(doc, field.chips, x, y + labelH, width, true);
  }
  return (
    labelH +
    write(doc, orDash(field.value), x, y + labelH, {
      font: 'Helvetica-Bold',
      size: 8.5,
      color: NAVY,
      width,
      lineGap: 1,
    })
  );
}

function drawFieldGroup(
  doc: Doc,
  opts: { title: string; x: number; y: number; width: number; fields: FieldDef[] },
): number {
  const { title, x, width, fields } = opts;
  let rowY = opts.y + groupHeader(doc, title, x, opts.y, width);

  const GAP_X = 12;
  const GAP_Y = 9;
  const colW = (width - GAP_X) / 2;
  let col = 0;
  let rowH = 0;

  const closeRow = () => {
    rowY += rowH + GAP_Y;
    rowH = 0;
    col = 0;
  };

  for (const field of fields) {
    if (field.wide) {
      if (col === 1) closeRow();
      rowH = Math.max(rowH, drawField(doc, field, x, rowY, width));
      closeRow();
      continue;
    }
    const cx = x + (col === 1 ? colW + GAP_X : 0);
    rowH = Math.max(rowH, drawField(doc, field, cx, rowY, colW));
    if (col === 1) closeRow();
    else col = 1;
  }
  if (col === 1) closeRow();

  return rowY - opts.y;
}

// ── Bloques de las páginas 02–05 ──────────────────────────────────────

type Block =
  | { kind: 'quote'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'empty'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'chips'; label: string; items: string[] }
  | { kind: 'note'; text: string };

function renderBlock(doc: Doc, block: Block, x: number, y: number, width: number, draw: boolean): number {
  switch (block.kind) {
    case 'quote': {
      const o: TextOpts = { font: 'Times-Italic', size: 9.5, color: NAVY, width, lineGap: 2 };
      const text = `"${block.text}"`;
      const h = measure(doc, text, o);
      if (draw) write(doc, text, x, y, o);
      return h;
    }
    case 'paragraph': {
      const o: TextOpts = { font: 'Helvetica', size: 8.3, color: NAVY, width, lineGap: 2 };
      const h = measure(doc, block.text, o);
      if (draw) write(doc, block.text, x, y, o);
      return h;
    }
    case 'empty': {
      const o: TextOpts = {
        font: 'Helvetica-Oblique',
        size: 8,
        color: BROWN,
        opacity: 0.5,
        width,
        lineGap: 1,
      };
      const h = measure(doc, block.text, o);
      if (draw) write(doc, block.text, x, y, o);
      return h;
    }
    case 'bullets': {
      const o: TextOpts = { font: 'Helvetica', size: 8.3, color: NAVY, width: width - 9, lineGap: 1.5 };
      let cy = y;
      for (const item of block.items) {
        const h = measure(doc, item, o);
        if (draw) {
          doc.fillColor(ORANGE, 1).circle(x + 2.2, cy + 4.2, 1.4).fill();
          write(doc, item, x + 9, cy, o);
        }
        cy += h + 3.5;
      }
      return Math.max(0, cy - y - 3.5);
    }
    case 'chips': {
      const labelH = draw
        ? microLabel(doc, block.label, x, y, width) + 3
        : measure(doc, block.label, { font: 'Courier-Bold', size: 5.8, lineBreak: false }) + 3;
      return labelH + chips(doc, block.items, x, y + labelH, width, draw);
    }
    case 'note': {
      const o: TextOpts = {
        font: 'Courier-Bold',
        size: 6,
        color: BROWN,
        opacity: 0.7,
        tracking: 0.8,
        width,
      };
      const h = measure(doc, block.text, o);
      if (draw) write(doc, block.text, x, y, o);
      return h;
    }
  }
}

interface CardDef {
  num: string;
  title: string;
  blocks: Block[];
}

const CARD_PAD = 11;

function renderCard(doc: Doc, card: CardDef, x: number, y: number, width: number, draw: boolean): number {
  const innerW = width - CARD_PAD * 2;
  let cy = y + CARD_PAD;

  if (draw) {
    write(doc, card.title.toUpperCase(), x + CARD_PAD, cy, {
      font: 'Courier-Bold',
      size: 6.5,
      color: ORANGE,
      tracking: 1.6,
      width: innerW - 22,
      lineBreak: false,
      ellipsis: true,
    });
  }
  cy += 13;

  card.blocks.forEach((block, i) => {
    if (i > 0) cy += 7;
    cy += renderBlock(doc, block, x + CARD_PAD, cy, innerW, draw);
  });

  return cy + CARD_PAD - y;
}

function drawCard(doc: Doc, card: CardDef, x: number, y: number, width: number, height: number): void {
  doc.roundedRect(x, y, width, height, 10).fillColor(WHITE, 0.6).strokeColor(HAIRLINE, 1).lineWidth(0.7).fillAndStroke();
  // Número de página del pasaporte, marca de agua en la esquina
  write(doc, card.num, x + width - CARD_PAD - 24, y + 7, {
    font: 'Courier-Bold',
    size: 15,
    color: NAVY,
    opacity: 0.1,
    width: 24,
    align: 'right',
    lineBreak: false,
  });
  renderCard(doc, card, x, y, width, true);
}

// ── Sellos ────────────────────────────────────────────────────────────

function drawStamp(
  doc: Doc,
  lines: string[],
  x: number,
  y: number,
  color: string,
  rotate: number,
): { width: number; height: number } {
  const text = lines.map((l) => clean(l).toUpperCase());
  doc.font('Courier-Bold').fontSize(6.2);
  const textW = Math.max(...text.map((l) => doc.widthOfString(l, { characterSpacing: 1.2 })));
  const width = textW + 22;
  const height = text.length * 9 + 13;

  doc.save();
  doc.rotate(rotate, { origin: [x + width / 2, y + height / 2] });
  doc.lineWidth(1).strokeColor(color, 0.7);
  doc.roundedRect(x, y, width, height, 3).stroke();
  doc.roundedRect(x + 2.2, y + 2.2, width - 4.4, height - 4.4, 2).stroke();
  text.forEach((line, i) => {
    write(doc, line, x, y + 6.5 + i * 9, {
      font: 'Courier-Bold',
      size: 6.2,
      color,
      opacity: 0.8,
      tracking: 1.2,
      width,
      align: 'center',
      lineBreak: false,
    });
  });
  doc.restore();

  return { width, height };
}

// ── Imágenes ──────────────────────────────────────────────────────────

function drawPhoto(doc: Doc, buffer: Buffer, x: number, y: number, w: number, h: number, radius = 8): void {
  doc.save();
  doc.roundedRect(x, y, w, h, radius).clip();
  try {
    doc.image(buffer, x, y, { cover: [w, h], align: 'center', valign: 'center' });
  } catch {
    // Un formato que PDFKit no soporta no debe tumbar el documento
  }
  doc.restore();
}

function drawAnnexGrid(
  doc: Doc,
  images: Buffer[],
  prefix: string,
  x: number,
  y: number,
  width: number,
): number {
  const COLS = 3;
  const GAP = 6;
  const cell = (width - GAP * (COLS - 1)) / COLS;
  images.forEach((buffer, i) => {
    const cx = x + (i % COLS) * (cell + GAP);
    const cy = y + Math.floor(i / COLS) * (cell + GAP);
    doc.roundedRect(cx, cy, cell, cell, 6).fillColor(WHITE, 1).fill();
    drawPhoto(doc, buffer, cx, cy, cell, cell, 6);
    doc.roundedRect(cx, cy, cell, cell, 6).strokeColor(NAVY, 0.12).lineWidth(0.6).stroke();
    const code = `${prefix}-0${i + 1}`;
    doc.font('Courier-Bold').fontSize(5.4);
    const badgeW = doc.widthOfString(code, { characterSpacing: 0.8 }) + 7;
    doc.roundedRect(cx + 4, cy + cell - 12, badgeW, 8.5, 2).fillColor(NAVY, 0.72).fill();
    write(doc, code, cx + 4, cy + cell - 10.2, {
      font: 'Courier-Bold',
      size: 5.4,
      color: CREAM,
      tracking: 0.8,
      width: badgeW,
      align: 'center',
      lineBreak: false,
    });
  });
  const rows = Math.ceil(images.length / COLS);
  return rows * cell + Math.max(0, rows - 1) * GAP;
}

// ── MRZ ───────────────────────────────────────────────────────────────

const MRZ_LEN = 44;

const toMrzAlphabet = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '<');

const padMrz = (value: string): string => (value + '<'.repeat(MRZ_LEN)).slice(0, MRZ_LEN);

/**
 * Zona de lectura mecánica decorativa (estilo ICAO), igual que en el wizard:
 * es ornamental, no codifica datos verificables.
 */
function buildMrzLines(name: string, passportNo: string, department: string | null | undefined, year: number): [string, string] {
  const piece = toMrzAlphabet(name || 'PIEZA ARTESANAL');
  const dept = (toMrzAlphabet(department || 'COL').replace(/</g, '') || 'COL').slice(0, 3);
  return [padMrz(`P<TLRCOL${piece}`), padMrz(`${toMrzAlphabet(passportNo)}${year}${dept}`)];
}

// ── Documento ─────────────────────────────────────────────────────────

export async function buildPassportPdf(input: PassportPdfInput): Promise<Buffer> {
  const { piece, owner } = input;
  const issueDate = input.issueDate.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const paintPageBackground = () => doc.rect(0, 0, PAGE_W, PAGE_H).fillColor(CREAM, 1).fill();

  paintPageBackground();

  /** Corte de página con el encabezado de continuación. */
  const newPage = (): number => {
    doc.addPage();
    paintPageBackground();
    write(doc, `Pasaporte digital · ${input.passportNo}`.toUpperCase(), M, M - 16, {
      font: 'Courier-Bold',
      size: 5.8,
      color: BROWN,
      opacity: 0.55,
      tracking: 1.1,
      width: CONTENT_W,
      lineBreak: false,
    });
    doc.lineWidth(0.5).strokeColor(NAVY, 0.1);
    doc.moveTo(M, M - 4).lineTo(PAGE_W - M, M - 4).stroke();
    return M + 8;
  };

  // ══ PORTADA ═════════════════════════════════════════════════════════
  const HEADER_H = 128;
  doc.rect(0, 0, PAGE_W, HEADER_H).fillColor(NAVY, 1).fill();

  // Emblema
  const ex = M + 22;
  const ey = 46;
  doc.save();
  doc.dash(2.5, { space: 2.5 }).lineWidth(0.8).strokeColor(ORANGE, 0.5);
  doc.circle(ex, ey, 21).stroke();
  doc.undash().lineWidth(0.6).strokeColor(CREAM, 0.22);
  doc.circle(ex, ey, 16).stroke();
  doc.lineWidth(2).strokeColor(ORANGE, 1).lineJoin('round');
  doc.moveTo(ex - 6.5, ey).lineTo(ex - 1.5, ey + 5.5).lineTo(ex + 7.5, ey - 5.5).stroke();
  doc.restore();

  write(doc, 'Pasaporte digital'.toUpperCase(), M + 54, 34, {
    font: 'Courier-Bold',
    size: 11,
    color: CREAM,
    tracking: 2.6,
    lineBreak: false,
  });
  write(doc, 'Pieza artesanal · TELAR · República de Colombia'.toUpperCase(), M + 54, 52, {
    font: 'Courier',
    size: 6,
    color: CREAM,
    opacity: 0.55,
    tracking: 1.3,
    lineBreak: false,
  });

  const noW = 190;
  const noX = PAGE_W - M - noW;
  write(doc, 'Passport No.'.toUpperCase(), noX, 32, {
    font: 'Courier',
    size: 5.8,
    color: CREAM,
    opacity: 0.5,
    tracking: 1.3,
    width: noW,
    align: 'right',
    lineBreak: false,
  });
  write(doc, input.passportNo, noX, 44, {
    font: 'Courier-Bold',
    size: 13,
    color: ORANGE,
    tracking: 1.2,
    width: noW,
    align: 'right',
    lineBreak: false,
  });

  // Píldora de estado + fecha de emisión
  const pillText = 'Certificado activo · registrado a nombre del titular'.toUpperCase();
  doc.font('Courier-Bold').fontSize(6);
  const pillW = doc.widthOfString(pillText, { characterSpacing: 1 }) + 32;
  const pillY = 88;
  doc.roundedRect(M, pillY, pillW, 17, 8.5).fillColor(GREEN, 0.22).strokeColor(GREEN, 0.55).lineWidth(0.7).fillAndStroke();
  doc.circle(M + 12, pillY + 8.5, 2.2).fillColor(MINT, 1).fill();
  write(doc, pillText, M + 20, pillY + 5.5, {
    font: 'Courier-Bold',
    size: 6,
    color: MINT,
    tracking: 1,
    lineBreak: false,
  });
  write(doc, `Emitido: ${issueDate}`.toUpperCase(), M + pillW + 12, pillY + 5.5, {
    font: 'Courier',
    size: 6,
    color: CREAM,
    opacity: 0.45,
    tracking: 1,
    lineBreak: false,
  });

  // ══ PÁGINA DE DATOS ═════════════════════════════════════════════════
  const dataTop = HEADER_H + 18;
  const dataX = M;
  const dataW = CONTENT_W;

  const innerPad = 16;
  const leftX = dataX + innerPad;
  const leftW = 152;
  const rightX = leftX + leftW + 22;
  const rightW = dataX + dataW - innerPad - rightX;
  let leftY = dataTop + innerPad;
  let rightY = dataTop + innerPad;

  // ── Columna izquierda: fotografía + QR de verificación ──
  const photoH = 200;
  if (input.photo) {
    doc.roundedRect(leftX, leftY, leftW, photoH, 10).fillColor(WHITE, 1).fill();
    drawPhoto(doc, input.photo, leftX + 3, leftY + 3, leftW - 6, photoH - 6, 8);
    doc.roundedRect(leftX, leftY, leftW, photoH, 10).strokeColor(NAVY, 0.12).lineWidth(0.7).stroke();
  } else {
    doc.save();
    doc.dash(3, { space: 2.5 }).lineWidth(0.8).strokeColor(NAVY, 0.2);
    doc.roundedRect(leftX, leftY, leftW, photoH, 10).stroke();
    doc.restore();
    write(doc, 'Sin fotografía'.toUpperCase(), leftX, leftY + photoH / 2 - 4, {
      font: 'Courier-Bold',
      size: 6,
      color: BROWN,
      opacity: 0.45,
      tracking: 1.2,
      width: leftW,
      align: 'center',
      lineBreak: false,
    });
  }
  leftY += photoH + 6;
  write(doc, 'Fotografía de la pieza'.toUpperCase(), leftX, leftY, {
    font: 'Courier',
    size: 5.6,
    color: BROWN,
    opacity: 0.5,
    tracking: 1.2,
    width: leftW,
    align: 'center',
    lineBreak: false,
  });
  leftY += 20;

  // QR — en la zona de lectura del documento, bajo la fotografía
  leftY += groupHeader(doc, 'Verificación', leftX, leftY, leftW);
  const qrCard = leftW;
  const qrSize = qrCard - 26;
  doc.roundedRect(leftX, leftY, qrCard, qrCard, 10).fillColor(WHITE, 0.85).strokeColor(HAIRLINE, 1).lineWidth(0.7).fillAndStroke();
  try {
    doc.image(input.qr, leftX + 13, leftY + 13, { width: qrSize, height: qrSize });
  } catch {
    // sin QR embebible seguimos con el resto del documento
  }
  leftY += qrCard + 7;
  write(doc, 'Escanea para verificar la autenticidad de la pieza y su titular.', leftX, leftY, {
    font: 'Helvetica',
    size: 6.6,
    color: BROWN,
    opacity: 0.75,
    width: leftW,
    align: 'center',
    lineGap: 1,
  });
  leftY += 20;
  write(doc, 'Clave de certificado'.toUpperCase(), leftX, leftY, {
    font: 'Courier',
    size: 5.6,
    color: BROWN,
    opacity: 0.55,
    tracking: 1.2,
    width: leftW,
    align: 'center',
    lineBreak: false,
  });
  leftY += 9;
  write(doc, input.passportNo, leftX, leftY, {
    font: 'Courier-Bold',
    size: 8.5,
    color: ORANGE,
    tracking: 0.8,
    width: leftW,
    align: 'center',
    lineBreak: false,
  });
  leftY += 14;

  // ── Columna derecha: campos del documento ──
  const groups: { title: string; fields: FieldDef[] }[] = [
    {
      title: 'Identificación',
      fields: [
        { label: 'Nombre de la pieza', value: piece.name, wide: true },
        { label: 'Descripción corta', value: piece.shortDescription, wide: true },
        { label: 'SKU', value: piece.sku },
        { label: 'Fecha de emisión', value: issueDate },
      ],
    },
    {
      title: 'Autoría y origen',
      fields: [
        { label: 'Taller', value: piece.workshopName },
        { label: 'Lugar de origen', value: piece.origin },
        { label: 'Artesano', value: piece.artisanName },
        ...(clean(piece.collaboration)
          ? [{ label: 'Colaboración', value: piece.collaboration } as FieldDef]
          : []),
      ],
    },
    {
      title: 'Clasificación',
      fields: [
        { label: 'Categoría', value: piece.categoryText },
        { label: 'Propósito', value: piece.purposeLabel },
        ...(piece.styleLabels.length > 0
          ? [{ label: 'Estilos', chips: piece.styleLabels, wide: true } as FieldDef]
          : [{ label: 'Estilos' } as FieldDef]),
      ],
    },
    {
      title: 'Oficio y técnica',
      fields: [
        { label: 'Oficio', value: piece.craftName },
        { label: 'Técnica principal', value: piece.primaryTechniqueName },
        ...(clean(piece.secondaryTechniqueName)
          ? [{ label: 'Técnica secundaria', value: piece.secondaryTechniqueName } as FieldDef]
          : []),
        piece.materialNames.length > 0
          ? ({ label: 'Materiales', chips: piece.materialNames, wide: true } as FieldDef)
          : ({ label: 'Materiales', wide: true } as FieldDef),
        { label: 'Tiempo de elaboración', value: piece.elaborationTime },
        { label: 'Disponibilidad', value: piece.availabilityLabel },
      ],
    },
    {
      title: 'Ficha física',
      fields: [
        { label: 'Dimensiones (al × an × la)', value: piece.dimensionsText },
        { label: 'Peso', value: piece.weightText },
      ],
    },
  ];

  for (const group of groups) {
    rightY += drawFieldGroup(doc, { title: group.title, x: rightX, y: rightY, width: rightW, fields: group.fields }) + 8;
  }

  // Marco discontinuo de la página de datos (se cierra cuando ya conocemos el alto)
  const dataBottom = Math.max(leftY, rightY) + innerPad - 4;
  doc.save();
  doc.dash(3.5, { space: 3 }).lineWidth(0.8).strokeColor(NAVY, 0.18);
  doc.roundedRect(dataX, dataTop, dataW, dataBottom - dataTop, 12).stroke();
  doc.restore();

  // Marca de agua del sello, recortada por el marco (como el overflow-hidden web)
  doc.save();
  doc.roundedRect(dataX, dataTop, dataW, dataBottom - dataTop, 12).clip();
  const wx = dataX + dataW - 32;
  const wy = dataBottom - 24;
  doc.lineWidth(3).strokeColor(NAVY, 0.05).circle(wx, wy, 72).stroke();
  doc.lineWidth(9).strokeColor(NAVY, 0.05).lineJoin('round');
  doc.moveTo(wx - 30, wy).lineTo(wx - 8, wy + 24).lineTo(wx + 34, wy - 28).stroke();
  doc.restore();

  // ══ TITULAR DEL PASAPORTE ═══════════════════════════════════════════
  const ownerFields: FieldDef[] = [
    { label: 'Nombre', value: owner.name },
    { label: 'Documento de identidad', value: owner.idNumber },
    { label: 'Correo electrónico', value: owner.email },
    { label: 'Teléfono', value: owner.phone },
  ];

  let cursor = dataBottom + 14;
  const OWNER_H = 96;
  if (cursor + OWNER_H > PAGE_H - M) cursor = newPage();

  doc.roundedRect(M, cursor, CONTENT_W, OWNER_H, 10).fillColor(ORANGE, 0.06).strokeColor(ORANGE, 0.45).lineWidth(0.8).fillAndStroke();
  drawFieldGroup(doc, {
    title: 'Titular del pasaporte',
    x: M + 14,
    y: cursor + 13,
    width: CONTENT_W - 28,
    fields: ownerFields,
  });
  cursor += OWNER_H + 18;

  // ══ PÁGINAS 02–05 ═══════════════════════════════════════════════════
  const cards: CardDef[] = [
    {
      num: '02',
      title: 'Historia de la pieza',
      blocks: clean(piece.history)
        ? [{ kind: 'quote', text: clean(piece.history) }]
        : [{ kind: 'empty', text: 'Sin historia registrada.' }],
    },
    {
      num: '03',
      title: 'Proceso de elaboración',
      blocks: [
        clean(piece.processDescription)
          ? ({ kind: 'paragraph', text: clean(piece.processDescription) } as Block)
          : ({ kind: 'empty', text: 'Sin descripción de proceso registrada.' } as Block),
        ...(piece.tools.length > 0
          ? [{ kind: 'chips', label: 'Herramientas', items: piece.tools } as Block]
          : []),
        ...(piece.monthlyCapacity != null
          ? [
              {
                kind: 'note',
                text: `Capacidad: ${piece.monthlyCapacity} unidad${piece.monthlyCapacity !== 1 ? 'es' : ''}/mes`.toUpperCase(),
              } as Block,
            ]
          : []),
      ],
    },
    {
      num: '04',
      title: 'Cuidados',
      blocks: (() => {
        const items = toLines(piece.careNotes);
        return items.length > 0
          ? [{ kind: 'bullets', items } as Block]
          : [{ kind: 'empty', text: 'Sin cuidados registrados.' } as Block];
      })(),
    },
    {
      num: '05',
      title: 'Sugerencias de uso',
      blocks: (() => {
        const items = toLines(piece.usageSuggestions);
        return items.length > 0
          ? [{ kind: 'bullets', items } as Block]
          : [{ kind: 'empty', text: 'Sin sugerencias registradas.' } as Block];
      })(),
    },
  ];

  const COL_GAP = 16;
  const colW = (CONTENT_W - COL_GAP) / 2;
  let colY: [number, number] = [cursor, cursor];

  for (const card of cards) {
    const height = renderCard(doc, card, 0, 0, colW, false);
    let col: 0 | 1 = colY[0] <= colY[1] ? 0 : 1;
    if (colY[col] + height > PAGE_H - M) {
      const top = newPage();
      colY = [top, top];
      col = 0;
    }
    const x = M + (col === 1 ? colW + COL_GAP : 0);
    drawCard(doc, card, x, colY[col], colW, height);
    colY[col] += height + COL_GAP;
  }
  cursor = Math.max(colY[0], colY[1]) + 4;

  // ══ SELLOS DE TRAZABILIDAD ══════════════════════════════════════════
  const STAMPS_H = 62;
  if (cursor + STAMPS_H > PAGE_H - M) cursor = newPage();
  write(doc, 'Sellos de trazabilidad'.toUpperCase(), M, cursor, {
    font: 'Courier-Bold',
    size: 6.5,
    color: BROWN,
    opacity: 0.55,
    tracking: 1.6,
    lineBreak: false,
  });
  cursor += 16;

  const stamps: { lines: string[]; color: string; rotate: number }[] = [
    { lines: ['Hecho a mano', 'Colombia'], color: ORANGE, rotate: -5 },
    ...(clean(piece.department)
      ? [{ lines: ['Origen', clean(piece.department)], color: GREEN, rotate: 3 }]
      : []),
    ...(clean(piece.craftName)
      ? [{ lines: ['Oficio', clean(piece.craftName)], color: NAVY, rotate: -2 }]
      : []),
    {
      lines: [
        'Registrado',
        input.issueDate.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      ],
      color: BROWN,
      rotate: 4,
    },
  ];

  let stampX = M + 4;
  for (const stamp of stamps) {
    const { width } = drawStamp(doc, stamp.lines, stampX, cursor, stamp.color, stamp.rotate);
    stampX += width + 18;
  }
  cursor += 42;

  // ══ ANEXOS ══════════════════════════════════════════════════════════
  if (input.annexes.length > 0 || input.evidence.length > 0) {
    const annexColW = (CONTENT_W - COL_GAP) / 2;
    const gridH = (count: number) => {
      const cell = (annexColW - 12) / 3;
      return Math.ceil(count / 3) * cell + (Math.ceil(count / 3) - 1) * 6;
    };
    const needed =
      20 + Math.max(input.annexes.length > 0 ? gridH(input.annexes.length) : 12, input.evidence.length > 0 ? gridH(input.evidence.length) : 12);
    if (cursor + needed > PAGE_H - M - MRZ_H) cursor = newPage();

    const columns: { title: string; images: Buffer[]; prefix: string; empty: string }[] = [
      { title: 'Anexo fotográfico', images: input.annexes, prefix: 'A', empty: 'Sin fotografías adjuntas.' },
      { title: 'Evidencia de proceso', images: input.evidence, prefix: 'B', empty: 'Sin evidencia de proceso adjunta.' },
    ];

    let annexBottom = cursor;
    columns.forEach((column, i) => {
      const x = M + i * (annexColW + COL_GAP);
      let y = cursor;
      write(doc, column.title.toUpperCase(), x, y, {
        font: 'Courier-Bold',
        size: 6.5,
        color: BROWN,
        opacity: 0.55,
        tracking: 1.6,
        width: annexColW,
        lineBreak: false,
      });
      y += 14;
      y +=
        column.images.length > 0
          ? drawAnnexGrid(doc, column.images, column.prefix, x, y, annexColW)
          : renderBlock(doc, { kind: 'empty', text: column.empty }, x, y, annexColW, true);
      annexBottom = Math.max(annexBottom, y);
    });
    cursor = annexBottom + 16;
  }

  // ══ MRZ DECORATIVA ══════════════════════════════════════════════════
  if (cursor > PAGE_H - M - MRZ_H) newPage();
  const [mrz1, mrz2] = buildMrzLines(
    piece.name,
    input.passportNo,
    piece.department,
    input.issueDate.getFullYear(),
  );
  doc.rect(0, PAGE_H - MRZ_H, PAGE_W, MRZ_H).fillColor(NAVY, 1).fill();
  write(doc, mrz1, M, PAGE_H - MRZ_H + 12, {
    font: 'Courier',
    size: 9.5,
    color: CREAM,
    opacity: 0.55,
    tracking: 1.4,
    lineBreak: false,
  });
  write(doc, mrz2, M, PAGE_H - MRZ_H + 26, {
    font: 'Courier',
    size: 9.5,
    color: CREAM,
    opacity: 0.55,
    tracking: 1.4,
    lineBreak: false,
  });

  doc.end();
  return done;
}
