/**
 * Logo y portada de relleno para tiendas sin imágenes (inyector del Store Studio).
 * Se generan como SVG y se suben a S3 igual que cualquier imagen: el backend
 * acepta image/svg+xml y el content-type sale de la extensión .svg.
 */

const NAVY = '#142239';
const ORANGE = '#ec6d13';
const LINEN = '#f9f7f2';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

const slugify = (s: string, max = 40): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, max) || 'tienda';

/** Iniciales del nombre de la tienda (máx. 2 letras). */
const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || name.slice(0, 2).toUpperCase();

/** Recorta a `max` caracteres sin cortar palabras. */
const clamp = (text: string, max: number): string => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.5 ? cut.slice(0, space) : cut).trimEnd()}…`;
};

interface ShopSvgArgs {
  shopName: string;
  craftName?: string | null;
  place?: string | null;
}

/** Logo cuadrado 512×512: monograma navy con anillo naranja. */
export function buildShopLogoSvgFile({ shopName, craftName }: ShopSvgArgs): File {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="${esc(
    shopName,
  )}">
  <rect width="512" height="512" rx="96" fill="${NAVY}"/>
  <circle cx="256" cy="228" r="150" fill="none" stroke="${ORANGE}" stroke-width="6" opacity="0.55"/>
  <text x="256" y="272" text-anchor="middle" font-family="Georgia, 'Noto Serif', serif" font-size="150" font-weight="700" fill="${LINEN}">${esc(
    initials(shopName),
  )}</text>
  <text x="256" y="416" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="3" fill="${ORANGE}">${esc(
    clamp((craftName ?? 'ARTESANÍA').toUpperCase(), 22),
  )}</text>
</svg>`;
  return new File([svg], `logo-${slugify(shopName)}.svg`, { type: 'image/svg+xml' });
}

/** Portada 1600×600: bandas tejidas + nombre de la tienda. */
export function buildShopBannerSvgFile({ shopName, craftName, place }: ShopSvgArgs): File {
  const bands = Array.from({ length: 9 }, (_, i) => {
    const y = 40 + i * 62;
    const w = 300 + ((i * 137) % 520);
    return `<rect x="${60 + ((i * 47) % 120)}" y="${y}" width="${w}" height="14" rx="7" fill="${
      i % 3 === 0 ? ORANGE : LINEN
    }" opacity="${i % 3 === 0 ? 0.75 : 0.14}"/>`;
  }).join('');

  const subtitle = [craftName, place].filter(Boolean).join(' · ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600" width="1600" height="600" role="img" aria-label="${esc(
    shopName,
  )}">
  <rect width="1600" height="600" fill="${NAVY}"/>
  <g>${bands}</g>
  <rect x="760" y="0" width="840" height="600" fill="${NAVY}" opacity="0.85"/>
  <text x="820" y="286" font-family="Georgia, 'Noto Serif', serif" font-size="74" font-weight="700" fill="${LINEN}">${esc(
    clamp(shopName, 26),
  )}</text>
  ${
    subtitle
      ? `<text x="820" y="344" font-family="Manrope, Arial, sans-serif" font-size="30" fill="${LINEN}" opacity="0.66">${esc(
          clamp(subtitle, 42),
        )}</text>`
      : ''
  }
  <rect x="820" y="392" width="180" height="6" rx="3" fill="${ORANGE}"/>
</svg>`;
  return new File([svg], `portada-${slugify(shopName)}.svg`, { type: 'image/svg+xml' });
}
