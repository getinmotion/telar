/**
 * PageRenderer — orquestador genérico de páginas CMS-driven.
 *
 * Carga todas las secciones de `pageKey`, las ordena por `position`, y
 * delega cada una al `SectionDispatcher` que mapea `type` → componente.
 *
 * Usar:
 *   <PageRenderer pageKey="home" />
 *
 * Permite que el orden visual de la página completo lo controle el curador
 * desde el admin (flechas ↑↓ en `/moderacion/cms`).
 */
import { useCmsSections } from '@/hooks/useCmsSections';
import type { CmsSection } from '@/services/cms-sections.actions';
import { SectionDispatcher } from './SectionDispatcher';

interface PageRendererProps {
  pageKey: string;
  /** Fallback secciones si la API no responde (uso opcional). */
  fallback?: CmsSection[];
}

export function PageRenderer({ pageKey, fallback }: PageRendererProps) {
  const { data, isLoading } = useCmsSections(pageKey);
  const sections = (data && data.length > 0 ? data : fallback ?? []).slice().sort(
    (a, b) => a.position - b.position,
  );

  if (isLoading && sections.length === 0) {
    return <div className="min-h-[40vh]" />;
  }

  // Dedupe content_pick by slot — admin/seed pueden duplicar el slot por error.
  const seenSlots = new Set<string>();
  const filtered = sections.filter((s) => {
    if (s.type !== 'content_pick') return true;
    const slot = (s.payload as any)?.slot;
    if (!slot) return false;
    if (seenSlots.has(slot)) return false;
    seenSlots.add(slot);
    return true;
  });

  return (
    <>
      {filtered
        .filter((s) => s.published !== false)
        .map((s) => (
          <SectionDispatcher key={s.id} section={s} />
        ))}
    </>
  );
}

export default PageRenderer;
