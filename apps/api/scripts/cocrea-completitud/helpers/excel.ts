import * as fs from 'fs';
import * as zlib from 'zlib';

/**
 * Lector mínimo de .xlsx, sin dependencias.
 *
 * Un .xlsx es un ZIP con XML dentro. Sólo necesitamos leer tres hojas una vez,
 * así que no vale la pena añadir `xlsx` (~7 MB) al árbol de dependencias del API
 * para un script que se corre un puñado de veces.
 */

interface ZipEntry {
  name: string;
  data: Buffer;
}

/** Recorre el ZIP por los "local file headers" (PK\x03\x04) y descomprime cada entrada. */
function unzip(buf: Buffer): ZipEntry[] {
  const entries: ZipEntry[] = [];
  let i = 0;

  while (i < buf.length - 3) {
    if (buf.readUInt32LE(i) !== 0x04034b50) {
      i++;
      continue;
    }

    const method = buf.readUInt16LE(i + 8);
    let compressedSize = buf.readUInt32LE(i + 18);
    let uncompressedSize = buf.readUInt32LE(i + 22);
    const nameLen = buf.readUInt16LE(i + 26);
    const extraLen = buf.readUInt16LE(i + 28);
    const nameStart = i + 30;
    const name = buf.toString('utf8', nameStart, nameStart + nameLen);
    const dataStart = nameStart + nameLen + extraLen;

    // Con data descriptor (bit 3) los tamaños van después de los datos; hay que
    // buscar el siguiente header para saber dónde termina esta entrada.
    const hasDataDescriptor = (buf.readUInt16LE(i + 6) & 0x08) !== 0;
    if (hasDataDescriptor && compressedSize === 0) {
      let j = dataStart;
      while (j < buf.length - 3 && buf.readUInt32LE(j) !== 0x08074b50) j++;
      compressedSize = j - dataStart;
      uncompressedSize = buf.length > j + 12 ? buf.readUInt32LE(j + 8) : 0;
    }

    const raw = buf.subarray(dataStart, dataStart + compressedSize);
    try {
      const data = method === 0 ? raw : zlib.inflateRawSync(raw);
      entries.push({ name, data });
    } catch {
      // Entrada ilegible (no debería pasar con xlsx de Excel); se ignora.
    }

    i = dataStart + compressedSize;
  }

  return entries;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, '&');
}

/** "BC12" -> 54 (índice de columna base 0) */
function columnIndex(cellRef: string): number {
  const letters = /^[A-Z]+/.exec(cellRef)?.[0] ?? 'A';
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export interface Sheet {
  name: string;
  rows: string[][];
}

export function readXlsx(filePath: string): Sheet[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el Excel en: ${filePath}\nDefine COCREA_XLSX con la ruta correcta.`);
  }

  const files = new Map(unzip(fs.readFileSync(filePath)).map((e) => [e.name, e.data]));

  const sharedXml = files.get('xl/sharedStrings.xml')?.toString('utf8') ?? '';
  const shared: string[] = [];
  for (const si of sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    const parts = [...si[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decodeXmlEntities(m[1]));
    shared.push(parts.join(''));
  }

  const workbookXml = files.get('xl/workbook.xml')?.toString('utf8') ?? '';
  const names = [...workbookXml.matchAll(/<sheet[^>]*name="([^"]*)"/g)].map((m) => decodeXmlEntities(m[1]));

  const sheets: Sheet[] = [];
  for (let n = 1; ; n++) {
    const xml = files.get(`xl/worksheets/sheet${n}.xml`)?.toString('utf8');
    if (!xml) break;

    const rows: string[][] = [];
    for (const row of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const cells: string[] = [];
      for (const c of row[1].matchAll(/<c r="([A-Z]+\d+)"([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const idx = columnIndex(c[1]);
        const attrs = c[2] || '';
        const inner = c[3] || '';
        const type = /t="([^"]*)"/.exec(attrs)?.[1] ?? 'n';

        let value = '';
        if (type === 's') {
          const v = /<v>([\s\S]*?)<\/v>/.exec(inner);
          value = v ? (shared[Number(v[1])] ?? '') : '';
        } else if (type === 'inlineStr') {
          value = [...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decodeXmlEntities(m[1])).join('');
        } else {
          const v = /<v>([\s\S]*?)<\/v>/.exec(inner);
          value = v ? decodeXmlEntities(v[1]) : '';
        }

        while (cells.length < idx) cells.push('');
        cells[idx] = value.trim();
      }
      rows.push(cells);
    }

    sheets.push({ name: names[n - 1] ?? `Hoja${n}`, rows });
  }

  return sheets;
}

export interface PersonaExcel {
  hoja: number;
  nombre: string;
  cedula: string;
  email: string;
  telefono: string;
  marca: string;
  municipio: string;
  origen: string;
}

/**
 * Las tres hojas comparten cabecera salvo la 3, que trae Ciudad/Departamento
 * en vez de Municipio/Origen. La cabecera está en la fila 2 (la 1 es un título).
 */
export function parsePersonas(filePath: string): PersonaExcel[] {
  const sheets = readXlsx(filePath);
  const personas: PersonaExcel[] = [];

  sheets.forEach((sheet, si) => {
    const hoja = si + 1;
    const header = (sheet.rows[1] ?? []).map((h) => h.toLowerCase());
    const col = (needle: string) => header.findIndex((h) => h.includes(needle));

    const iNombre = col('nombre');
    const iCedula = col('cédula') >= 0 ? col('cédula') : col('cedula');
    const iEmail = col('correo');
    const iTel = col('teléfono') >= 0 ? col('teléfono') : col('telefono');
    const iMarca = col('taller / marca');
    const iMun = col('municipio') >= 0 ? col('municipio') : col('ciudad');
    const iOrigen = col('escuela taller') >= 0 ? col('escuela taller') : col('departamento');

    for (const row of sheet.rows.slice(2)) {
      const nombre = (iNombre >= 0 ? row[iNombre] : '') || '';
      if (!nombre.trim()) continue;

      personas.push({
        hoja,
        nombre: nombre.trim(),
        cedula: (iCedula >= 0 ? row[iCedula] : '') || '',
        email: (iEmail >= 0 ? row[iEmail] : '') || '',
        telefono: (iTel >= 0 ? row[iTel] : '') || '',
        marca: (iMarca >= 0 ? row[iMarca] : '') || '',
        municipio: (iMun >= 0 ? row[iMun] : '') || '',
        origen: (iOrigen >= 0 ? row[iOrigen] : '') || '',
      });
    }
  });

  return personas;
}
