/** All layout coordinates are millimetres in the portrait trim coordinate system. */
export const CARD = { width: 53.98, height: 85.6, radius: 3.18, bleed: 3, safe: 5, qr: 34 } as const;
export const LOGO_CONTENT_SIZE = 23;
export const A4 = { width: 210, height: 297, columns: 3, rows: 3, gap: 4 } as const;
export const ART = { width: CARD.width + CARD.bleed * 2, height: CARD.height + CARD.bleed * 2 };
export const QR_RECT = { x: (CARD.width - CARD.qr) / 2, y: 13.5, width: CARD.qr, height: CARD.qr };
/** Single-sided vinyl sheet: cut-to-cut gap, not a scaling factor. */
export const COMPACT = { columns: 2, rows: 4, gap: 4, left: 10, top: 10, bleed: 0.5, markStart: 0.75, markEnd: 1.65 } as const;
export const mmToPt = (mm: number) => mm * 72 / 25.4;
export const ptToMm = (pt: number) => pt * 25.4 / 72;
export const mmToPx = (mm: number, dpi = 300) => Math.round(mm * dpi / 25.4);
export interface Rect { x: number; y: number; width: number; height: number }

/** Each row is one business, front left / back right, rotated clockwise. */
export function compactPosition(row: number, side: "front" | "back"): Rect {
  if (!Number.isInteger(row) || row < 0 || row >= COMPACT.rows) throw new Error("Invalid compact row");
  return { x: COMPACT.left + (side === "back" ? CARD.height + COMPACT.gap : 0),
    y: COMPACT.top + row * (CARD.width + COMPACT.gap), width: CARD.height, height: CARD.width };
}

export function compactQrRect(row: number): Rect {
  const card = compactPosition(row, "back");
  return { x: card.x + CARD.height - QR_RECT.y - CARD.qr, y: card.y + QR_RECT.x, width: CARD.qr, height: CARD.qr };
}

export function compactCropMarks(rect: Rect): string {
  const { x, y, width, height } = rect;
  const lines: string[] = [];
  const line = (x1: number, y1: number, x2: number, y2: number) => lines.push(`<path d="M${x1} ${y1}L${x2} ${y2}"/>`);
  for (const tx of [x, x + width]) {
    line(tx, y - COMPACT.markEnd, tx, y - COMPACT.markStart);
    line(tx, y + height + COMPACT.markStart, tx, y + height + COMPACT.markEnd);
  }
  for (const ty of [y, y + height]) {
    line(x - COMPACT.markEnd, ty, x - COMPACT.markStart, ty);
    line(x + width + COMPACT.markStart, ty, x + width + COMPACT.markEnd, ty);
  }
  return `<g data-cut-width-mm="${width}" data-cut-height-mm="${height}" fill="none" stroke="#555555" stroke-width="0.10">${lines.join("")}</g>`;
}

export function assertSafe(rect: Rect, label: string) {
  if (![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) || rect.width <= 0 || rect.height <= 0 ||
      rect.x < CARD.safe - 0.001 || rect.y < CARD.safe - 0.001 ||
      rect.x + rect.width > CARD.width - CARD.safe + 0.001 ||
      rect.y + rect.height > CARD.height - CARD.safe + 0.001) {
    throw new Error(`Unsafe/clipped card content: ${label} ${JSON.stringify(rect)}`);
  }
}

export function sheetPosition(slot: number, back = false): Rect {
  if (!Number.isInteger(slot) || slot < 0 || slot >= A4.columns * A4.rows) throw new Error("Invalid sheet slot");
  const marginX = (A4.width - A4.columns * ART.width - (A4.columns - 1) * A4.gap) / 2;
  const marginY = (A4.height - A4.rows * ART.height - (A4.rows - 1) * A4.gap) / 2;
  const frontX = marginX + (slot % A4.columns) * (ART.width + A4.gap);
  return {
    x: back ? A4.width - frontX - ART.width : frontX,
    y: marginY + Math.floor(slot / A4.columns) * (ART.height + A4.gap),
    width: ART.width, height: ART.height,
  };
}

export function cropMarks(rect: Rect): string {
  const { x, y, width, height } = rect;
  const inset = CARD.bleed;
  const lines: string[] = [];
  const line = (x1: number, y1: number, x2: number, y2: number) => lines.push(`<path d="M${x1} ${y1}L${x2} ${y2}"/>`);
  for (const tx of [x + inset, x + width - inset]) {
    line(tx, y - 1.8, tx, y - 0.4);
    line(tx, y + height + 0.4, tx, y + height + 1.8);
  }
  for (const ty of [y + inset, y + height - inset]) {
    line(x - 1.8, ty, x - 0.4, ty);
    line(x + width + 0.4, ty, x + width + 1.8, ty);
  }
  return `<g fill="none" stroke="#000000" stroke-width="0.12">${lines.join("")}</g>`;
}
