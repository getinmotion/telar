/** Normalize a technique name to a URL-safe slug shared between Tecnicas and TecnicaDetail. */
const DIACRITICS = new RegExp('[̀-ͯ]', 'g');

export function techniqueToSlug(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
