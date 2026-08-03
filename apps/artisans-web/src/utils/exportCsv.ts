/**
 * Exportación a CSV compartida.
 *
 * Hasta ahora cada pantalla reimplementaba lo mismo a mano (AdminOrdersPanel,
 * ModerationDrillDownModal, ShopSalesPage), con el mismo bug en las tres: no
 * escapaban las comillas ni los saltos de línea, así que un nombre de tienda con
 * una coma partía la fila. Aquí se escapa según RFC 4180.
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

/** Escapa un campo según RFC 4180: comillas dobladas y entrecomillado si hace falta. */
function escapeCell(raw: unknown): string {
  if (raw == null) return '';
  const s = String(raw);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const head = columns.map((c) => escapeCell(c.header)).join(',');
  const body = rows.map((r) =>
    columns.map((c) => escapeCell(c.value(r))).join(','),
  );
  return [head, ...body].join('\r\n');
}

/**
 * Descarga un CSV. El BOM inicial es necesario para que Excel en Windows abra
 * los acentos correctamente — sin él, "Ráquira" se ve como "RÃ¡quira", que es
 * justo lo que pasaba en los exports anteriores.
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿' + csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
): void {
  downloadCsv(filename, buildCsv(rows, columns));
}

/** Sufijo de fecha para el nombre del archivo: `-2026-07-31`. */
export function dateSuffix(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
