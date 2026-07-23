import { useQuery } from '@tanstack/react-query';
import { getCmsSections, type CmsSection } from '@/services/cms-sections.actions';

/**
 * El CMS aún contiene textos con la marca anterior (Telar). Mientras se
 * actualiza el contenido desde el admin, estos reemplazos scrubean solo las
 * frases de marca inequívocas — nunca "telar" como técnica de tejido.
 */
const LEGACY_BRAND_REPLACEMENTS: [RegExp, string][] = [
  [/El Telar Digital/g, 'El Taller Digital'],
  [/TELAR © /g, 'Villa Adelaida © '],
  [/Telar\.co/gi, 'Villa Adelaida'],
  [/Sobre Telar/g, 'Sobre Villa Adelaida'],
  [/Historias TELAR/g, 'Historias Villa Adelaida'],
  [/Curada por TELAR/g, 'Curada por Villa Adelaida'],
];

function scrubLegacyBrand(value: unknown): unknown {
  if (typeof value === 'string') {
    return LEGACY_BRAND_REPLACEMENTS.reduce(
      (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
      value,
    );
  }
  if (Array.isArray(value)) return value.map(scrubLegacyBrand);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, scrubLegacyBrand(v)]),
    );
  }
  return value;
}

export function useCmsSections(pageKey: string) {
  return useQuery<CmsSection[]>({
    queryKey: ['cms-sections', pageKey],
    queryFn: async () => {
      const sections = await getCmsSections(pageKey);
      return sections.map((s) => ({
        ...s,
        payload: scrubLegacyBrand(s.payload) as CmsSection['payload'],
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
