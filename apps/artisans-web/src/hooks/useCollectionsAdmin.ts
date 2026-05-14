/**
 * useCollectionsAdmin — list + CRUD for collections admin page.
 */
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  listCollectionsAdmin,
  createCollection,
  updateCollection,
  deleteCollection,
  type CollectionAdmin,
  type CreateCollectionInput,
  type UpdateCollectionInput,
} from '@/services/collections-admin.actions';

export const useCollectionsAdmin = () => {
  const [collections, setCollections] = useState<CollectionAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCollections = useCallback(
    async (params: { search?: string; limit?: number; offset?: number } = {}) => {
      setLoading(true);
      try {
        const res = await listCollectionsAdmin(params);
        setCollections(res.data);
        setTotal(res.total);
        return res;
      } catch (err) {
        console.error('[useCollectionsAdmin] fetch error', err);
        toast.error('No se pudieron cargar las colecciones');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const create = useCallback(async (input: CreateCollectionInput) => {
    setSaving(true);
    try {
      const c = await createCollection(input);
      toast.success('Colección creada');
      setCollections((prev) => [c, ...prev]);
      setTotal((t) => t + 1);
      return c;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'No se pudo crear la colección';
      toast.error(typeof msg === 'string' ? msg : 'No se pudo crear la colección');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(async (id: string, input: UpdateCollectionInput) => {
    setSaving(true);
    try {
      const c = await updateCollection(id, input);
      toast.success('Colección actualizada');
      setCollections((prev) => prev.map((p) => (p._id === id ? c : p)));
      return c;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'No se pudo actualizar la colección';
      toast.error(typeof msg === 'string' ? msg : 'No se pudo actualizar la colección');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    if (!window.confirm('¿Eliminar esta colección? Esta acción no se puede deshacer.')) {
      return false;
    }
    setSaving(true);
    try {
      await deleteCollection(id);
      toast.success('Colección eliminada');
      setCollections((prev) => prev.filter((p) => p._id !== id));
      setTotal((t) => Math.max(0, t - 1));
      return true;
    } catch (err) {
      console.error('[useCollectionsAdmin] remove error', err);
      toast.error('No se pudo eliminar la colección');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    collections,
    total,
    loading,
    saving,
    fetchCollections,
    create,
    update,
    remove,
  };
};
