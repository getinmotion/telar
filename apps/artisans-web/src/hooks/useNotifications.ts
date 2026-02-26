import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  getNotificationsByUserId,
  markNotificationAsRead as markAsReadService,
  markAllNotificationsAsRead as markAllAsReadService,
  deleteNotification as deleteNotificationService,
} from '@/services/notifications.actions';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: Usar ref para userId
  const userIdRef = useRef<string | undefined>(user?.id);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  // ✅ FIX: Guard para fetch único
  const hasFetchedRef = useRef(false);

  // ✅ FIX: Guard para suscripción única
  const hasSubscribedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      // ✅ MIGRATED: NestJS endpoint - GET /telar/server/notifications/user/:userId
      const data = await getNotificationsByUserId(userId, { limit: 50 });

      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Sin dependencias - usa refs

  const markAsRead = useCallback(async (notificationId: string) => {
    const userId = userIdRef.current;
    if (!userId) return;

    try {
      // ✅ MIGRATED: NestJS endpoint - PATCH /telar/server/notifications/:id/mark-as-read
      await markAsReadService(notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []); // ✅ Sin dependencias - usa refs

  const markAllAsRead = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) return;

    try {
      // ✅ MIGRATED: NestJS endpoint - POST /telar/server/notifications/user/:userId/mark-all-as-read
      await markAllAsReadService(userId);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []); // ✅ Sin dependencias - usa refs

  const deleteNotification = useCallback(async (notificationId: string) => {
    const userId = userIdRef.current;
    if (!userId) return;

    try {
      // ✅ MIGRATED: NestJS endpoint - DELETE /telar/server/notifications/:id
      await deleteNotificationService(notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []); // ✅ Sin dependencias - usa refs

  // ✅ FIX: Initial fetch solo cuando cambia userId
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      hasFetchedRef.current = false;
      hasSubscribedRef.current = false;
      return;
    }

    // Solo fetch si no se ha hecho antes para este usuario
    if (!hasFetchedRef.current) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  // ✅ OPTIMIZED: Real-time subscription con guard para prevenir loops
  // Este SÍ se mantiene porque las notificaciones son eventos EXTERNOS del sistema
  useEffect(() => {
    const userId = userIdRef.current;
    if (!userId || hasSubscribedRef.current) return;

    console.log('🔔 [Notifications] Subscribing to realtime notifications');
    hasSubscribedRef.current = true;

    const channel = supabase
      .channel(`notifications-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 [Notifications] New notification received:', payload.new);
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      console.log('🔔 [Notifications] Unsubscribing from realtime');
      supabase.removeChannel(channel);
      hasSubscribedRef.current = false;
    };
  }, [user?.id]); // ✅ Solo cuando cambia el userId

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
