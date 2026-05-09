/**
 * useCmsAdmin — CRUD hook for the cms-sections backend, mirroring the
 * structure of useProductReview. Uses telarApi (Bearer token attached
 * by the request interceptor).
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { telarApi } from '@/integrations/api/telarApi';
import type {
  CmsSection,
  CreateCmsSectionInput,
  UpdateCmsSectionInput,
} from '@/services/cms-sections.types';

interface ListResponse {
  data: CmsSection[];
}

export const useCmsAdmin = () => {
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSections = useCallback(async (pageKey: string) => {
    setLoading(true);
    try {
      const res = await telarApi.get<ListResponse>('/cms/sections', {
        params: { pageKey, includeUnpublished: 'true' },
      });
      const list = (res.data?.data ?? []).slice().sort(
        (a, b) => a.position - b.position,
      );
      setSections(list);
      return list;
    } catch (err) {
      console.error('[useCmsAdmin] fetchSections error', err);
      toast.error('No se pudieron cargar las secciones');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createSection = useCallback(
    async (input: CreateCmsSectionInput) => {
      setSaving(true);
      try {
        const res = await telarApi.post<CmsSection>('/cms/sections', input);
        toast.success('Sección creada');
        setSections((prev) =>
          [...prev, res.data].sort((a, b) => a.position - b.position),
        );
        return res.data;
      } catch (err) {
        console.error('[useCmsAdmin] createSection error', err);
        toast.error('No se pudo crear la sección');
        return null;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const updateSection = useCallback(
    async (id: string, input: UpdateCmsSectionInput) => {
      setSaving(true);
      try {
        const res = await telarApi.patch<CmsSection>(`/cms/sections/${id}`, input);
        toast.success('Sección actualizada');
        setSections((prev) =>
          prev
            .map((s) => (s.id === id ? res.data : s))
            .sort((a, b) => a.position - b.position),
        );
        return res.data;
      } catch (err) {
        console.error('[useCmsAdmin] updateSection error', err);
        toast.error('No se pudo actualizar la sección');
        return null;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const deleteSection = useCallback(async (id: string) => {
    if (!window.confirm('¿Eliminar esta sección? Esta acción no se puede deshacer.')) {
      return false;
    }
    setSaving(true);
    try {
      await telarApi.delete(`/cms/sections/${id}`);
      toast.success('Sección eliminada');
      setSections((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err) {
      console.error('[useCmsAdmin] deleteSection error', err);
      toast.error('No se pudo eliminar la sección');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const reorderSections = useCallback(
    async (pageKey: string, orderedIds: string[]) => {
      // Optimistic local update
      setSections((prev) =>
        prev
          .filter((s) => s.pageKey === pageKey)
          .map((s) => {
            const position = orderedIds.indexOf(s.id);
            return { ...s, position: position >= 0 ? position : s.position };
          })
          .sort((a, b) => a.position - b.position),
      );
      try {
        const res = await telarApi.post<ListResponse>('/cms/sections/reorder', {
          pageKey,
          orderedIds,
        });
        if (res.data?.data) {
          setSections(res.data.data.sort((a, b) => a.position - b.position));
        }
      } catch (err) {
        console.error('[useCmsAdmin] reorderSections error', err);
        toast.error('No se pudo reordenar');
      }
    },
    [],
  );

  return {
    sections,
    loading,
    saving,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
  };
};
