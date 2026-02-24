import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Moderator {
  id: string;
  email: string;
  full_name: string | null;
  role: 'moderator' | 'admin';
  source: 'user_roles' | 'admin_users';
  created_at: string;
}

export const useModeratorManagement = () => {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchModerators = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-moderators', {
        method: 'GET',
      });

      if (error) {
        throw new Error(error.message || 'Error al obtener moderadores');
      }

      setModerators(data?.moderators || []);
    } catch (error) {
      console.error('Error fetching moderators:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al cargar moderadores',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addModerator = useCallback(async (params: { user_id?: string; email?: string }) => {
    setIsAdding(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-moderators', {
        body: {
          action: 'add',
          ...params,
        },
      });

      if (error) {
        throw new Error(error.message || 'Error al agregar moderador');
      }

      toast({
        title: 'Éxito',
        description: 'Moderador agregado correctamente',
      });

      await fetchModerators();
      return true;
    } catch (error) {
      console.error('Error adding moderator:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al agregar moderador',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsAdding(false);
    }
  }, [toast, fetchModerators]);

  const removeModerator = useCallback(async (userId: string) => {
    setIsRemoving(userId);
    try {
      const { data, error } = await supabase.functions.invoke('manage-moderators', {
        body: {
          action: 'remove',
          user_id: userId,
        },
      });

      if (error) {
        throw new Error(error.message || 'Error al revocar moderador');
      }

      toast({
        title: 'Éxito',
        description: 'Acceso de moderador revocado',
      });

      await fetchModerators();
    } catch (error) {
      console.error('Error removing moderator:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al revocar moderador',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(null);
    }
  }, [toast, fetchModerators]);

  const counts = {
    moderators: moderators.filter(m => m.role === 'moderator').length,
    admins: moderators.filter(m => m.role === 'admin').length,
  };

  return {
    moderators,
    isLoading,
    isAdding,
    isRemoving,
    counts,
    fetchModerators,
    addModerator,
    removeModerator,
  };
};
