import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface AllUser {
  id: string;
  email: string;
  full_name: string;
  user_type: 'admin' | 'shop_owner' | 'regular' | 'unclassified';
  is_active: boolean;
  created_at: string;
  last_sign_in?: string;
  shop_name?: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
}

const fetchAllUsers = async (): Promise<AllUser[]> => {
  const { data, error } = await supabase.functions.invoke('get-all-users');

  if (error) {
    throw error;
  }

  if (data?.success && data?.users) {
    return data.users;
  }

  throw new Error('No se pudieron obtener los usuarios');
};

export const useAdminUsers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAllUsers,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchInterval: 120000, // 2 minutes
  });

  // Realtime subscription for user_profiles changes
  useEffect(() => {
    const channel = supabase
      .channel('admin-users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getStats = () => {
    const users = query.data || [];
    return {
      admin: users.filter(u => u.user_type === 'admin').length,
      shopOwner: users.filter(u => u.user_type === 'shop_owner').length,
      regular: users.filter(u => u.user_type === 'regular').length,
      unclassified: users.filter(u => u.user_type === 'unclassified').length,
      total: users.length
    };
  };

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
    isFetching: query.isFetching,
    stats: getStats()
  };
};
