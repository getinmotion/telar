/**
 * useBlogPostsAdmin — list + CRUD for blog posts admin page.
 */
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  listBlogPostsAdmin,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogPost,
  type CreateBlogPostInput,
  type UpdateBlogPostInput,
} from '@/services/blog-posts-admin.actions';

export const useBlogPostsAdmin = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(
    async (params: { search?: string; limit?: number; offset?: number } = {}) => {
      setLoading(true);
      try {
        const res = await listBlogPostsAdmin(params);
        setPosts(res.data);
        setTotal(res.total);
        return res;
      } catch (err) {
        console.error('[useBlogPostsAdmin] fetchPosts error', err);
        toast.error('No se pudieron cargar los posts');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const create = useCallback(async (input: CreateBlogPostInput) => {
    setSaving(true);
    try {
      const post = await createBlogPost(input);
      toast.success('Post creado');
      setPosts((prev) => [post, ...prev]);
      setTotal((t) => t + 1);
      return post;
    } catch (err: any) {
      console.error('[useBlogPostsAdmin] create error', err);
      const msg =
        err?.response?.data?.message ?? 'No se pudo crear el post';
      toast.error(typeof msg === 'string' ? msg : 'No se pudo crear el post');
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, input: UpdateBlogPostInput) => {
      setSaving(true);
      try {
        const post = await updateBlogPost(id, input);
        toast.success('Post actualizado');
        setPosts((prev) => prev.map((p) => (p._id === id ? post : p)));
        return post;
      } catch (err: any) {
        console.error('[useBlogPostsAdmin] update error', err);
        const msg =
          err?.response?.data?.message ?? 'No se pudo actualizar el post';
        toast.error(typeof msg === 'string' ? msg : 'No se pudo actualizar el post');
        return null;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    if (!window.confirm('¿Eliminar este post? Esta acción no se puede deshacer.')) {
      return false;
    }
    setSaving(true);
    try {
      await deleteBlogPost(id);
      toast.success('Post eliminado');
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setTotal((t) => Math.max(0, t - 1));
      return true;
    } catch (err) {
      console.error('[useBlogPostsAdmin] remove error', err);
      toast.error('No se pudo eliminar el post');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    posts,
    total,
    loading,
    saving,
    fetchPosts,
    create,
    update,
    remove,
  };
};
