import type { CategoryRecipe } from './catalog';

/**
 * Imagen del producto inyectado: un SVG cuadrado autocontenido que se sube a S3
 * como cualquier foto (el backend acepta image/svg+xml). No se usa el hook
 * useImageUpload del wizard porque ese solo admite jpg/png/webp.
 */

const NAVY = '#142239';
const ORANGE = '#ec6d13';
const LINEN = '#f9f7f2';
const SAND = '#e2d5cf';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Parte el texto en líneas de máximo `max` caracteres sin cortar palabras. */
const wrap = (text: string, max: number, maxLines = 2): string[] => {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= max || !current) {
      current = candidate;
    } else if (lines.length < maxLines - 1) {
      lines.push(current);
      current = word;
    } else {
      // Ya no caben más líneas: se corta con puntos suspensivos.
      lines.push(`${current} ${word}`.slice(0, max - 1).trimEnd() + '…');
      return lines;
    }
  }
  if (current) lines.push(current);
  return lines;
};

/** Motivo geométrico según la categoría, para que no todas las piezas se vean igual. */
function motifMarkup(motif: CategoryRecipe['motif'], seed: number): string {
  const shift = seed % 40;
  switch (motif) {
    case 'bands':
      return Array.from({ length: 7 }, (_, i) => {
        const y = 120 + i * 46;
        const w = 240 + ((seed + i * 37) % 260);
        return `<rect x="${140 + ((i * 23 + shift) % 60)}" y="${y}" width="${w}" height="16" rx="8" fill="${
          i % 3 === 0 ? ORANGE : NAVY
        }" opacity="${i % 3 === 0 ? 0.85 : 0.16}"/>`;
      }).join('');
    case 'rings':
      return Array.from({ length: 6 }, (_, i) => {
        const r = 60 + i * 48;
        return `<circle cx="400" cy="380" r="${r}" fill="none" stroke="${
          i % 2 === 0 ? NAVY : ORANGE
        }" stroke-width="${i % 2 === 0 ? 6 : 3}" opacity="${i % 2 === 0 ? 0.2 : 0.7}"/>`;
      }).join('');
    case 'grid':
      return Array.from({ length: 36 }, (_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const on = (i * 7 + seed) % 5 === 0;
        return `<rect x="${170 + col * 78}" y="${140 + row * 78}" width="62" height="62" rx="10" fill="${
          on ? ORANGE : NAVY
        }" opacity="${on ? 0.85 : 0.13}"/>`;
      }).join('');
    case 'arc':
    default:
      return `
        <path d="M140 500 Q400 ${120 + shift} 660 500" fill="none" stroke="${NAVY}" stroke-width="10" opacity="0.2"/>
        <path d="M180 520 Q400 ${220 + shift} 620 520" fill="none" stroke="${ORANGE}" stroke-width="8" opacity="0.8"/>
        <circle cx="400" cy="${300 + shift}" r="86" fill="${NAVY}" opacity="0.12"/>`;
  }
}

const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
};

export type InjectVariant = 'realista' | 'proximamente';

interface SvgArgs {
  pieceName: string;
  craftName?: string;
  shopName: string;
  motif?: CategoryRecipe['motif'];
}

function realistaSvg({ pieceName, craftName, shopName, motif = 'bands' }: SvgArgs): string {
  const seed = hash(pieceName + shopName);
  const titleLines = wrap(pieceName, 22, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="${esc(pieceName)}">
  <rect width="800" height="800" fill="${LINEN}"/>
  <rect x="40" y="40" width="720" height="720" rx="28" fill="none" stroke="${SAND}" stroke-width="2"/>
  ${motifMarkup(motif, seed)}
  <rect x="0" y="600" width="800" height="200" fill="${LINEN}"/>
  ${titleLines
    .map(
      (line, i) =>
        `<text x="400" y="${664 + i * 40}" text-anchor="middle" font-family="Georgia, 'Noto Serif', serif" font-size="34" font-weight="700" fill="${NAVY}">${esc(
          line,
        )}</text>`,
    )
    .join('')}
  <text x="400" y="${684 + titleLines.length * 40}" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="18" fill="${NAVY}" opacity="0.6">${esc(
    [craftName, shopName].filter(Boolean).join(' · '),
  )}</text>
  <rect x="336" y="72" width="128" height="26" rx="13" fill="${ORANGE}" opacity="0.14"/>
  <text x="400" y="90" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="${ORANGE}">MUESTRA</text>
</svg>`;
}

function proximamenteSvg({ pieceName, craftName, shopName }: SvgArgs): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="${esc(pieceName)}">
  <rect width="800" height="800" fill="${NAVY}"/>
  <circle cx="400" cy="330" r="150" fill="none" stroke="${ORANGE}" stroke-width="3" opacity="0.5"/>
  <circle cx="400" cy="330" r="104" fill="${ORANGE}" opacity="0.12"/>
  <path d="M400 268 v62 l44 30" fill="none" stroke="${ORANGE}" stroke-width="10" stroke-linecap="round"/>
  <text x="400" y="560" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="6" fill="${ORANGE}">PRÓXIMAMENTE</text>
  <text x="400" y="618" text-anchor="middle" font-family="Georgia, 'Noto Serif', serif" font-size="38" font-weight="700" fill="#ffffff">Pieza en preparación</text>
  <text x="400" y="660" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="19" fill="#ffffff" opacity="0.72">Pronto estará disponible</text>
  <text x="400" y="716" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="16" fill="#ffffff" opacity="0.45">${esc(
    [craftName, shopName].filter(Boolean).join(' · '),
  )}</text>
</svg>`;
}

/** Marcas diacríticas combinantes, para el slug del nombre de archivo. */
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Devuelve el SVG como File listo para uploadImage(). */
export function buildProductSvgFile(variant: InjectVariant, args: SvgArgs): File {
  const svg = variant === 'proximamente' ? proximamenteSvg(args) : realistaSvg(args);
  const slug =
    args.pieceName
      .toLowerCase()
      .normalize('NFD')
      .replace(DIACRITICS, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'pieza';
  return new File([svg], `${slug}.svg`, { type: 'image/svg+xml' });
}
