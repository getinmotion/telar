/**
 * Notifications Actions - NestJS Backend Integration
 * Maneja todas las operaciones CRUD de notificaciones
 */

import { telarApi } from '@/integrations/api/telarApi';

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

interface NotificationDTO {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, any>;
  read: boolean;
  createdAt: string;
}

/**
 * Map DTO (camelCase) to internal format (snake_case)
 */
function mapNotificationFromDTO(dto: NotificationDTO): Notification {
  return {
    id: dto.id,
    user_id: dto.userId,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    metadata: dto.metadata || {},
    read: dto.read,
    created_at: dto.createdAt,
  };
}

/**
 * GET /telar/server/notifications/user/{userId}
 * Obtener notificaciones del usuario con paginación
 */
export async function getNotificationsByUserId(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<Notification[]> {
  try {
    const params: Record<string, string> = {};
    if (options?.limit) params.limit = options.limit.toString();
    if (options?.offset) params.offset = options.offset.toString();

    const response = await telarApi.get<NotificationDTO[]>(
      `/telar/server/notifications/user/${userId}`,
      { params }
    );

    return response.data.map(mapNotificationFromDTO);
  } catch (error: any) {
    console.error('[getNotificationsByUserId] Error:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

/**
 * PATCH /telar/server/notifications/:id/mark-as-read
 * Marcar una notificación como leída
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  try {
    const response = await telarApi.patch<NotificationDTO>(
      `/telar/server/notifications/${notificationId}/mark-as-read`
    );

    return mapNotificationFromDTO(response.data);
  } catch (error: any) {
    console.error('[markNotificationAsRead] Error:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

/**
 * POST /telar/server/notifications/user/:userId/mark-all-as-read
 * Marcar todas las notificaciones del usuario como leídas
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ message: string }> {
  try {
    const response = await telarApi.post<{ message: string }>(
      `/telar/server/notifications/user/${userId}/mark-all-as-read`
    );

    return response.data;
  } catch (error: any) {
    console.error('[markAllNotificationsAsRead] Error:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

/**
 * DELETE /telar/server/notifications/:id
 * Eliminar una notificación
 *
 * Returns: HTTP 204 No Content on success
 */
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  try {
    await telarApi.delete(`/telar/server/notifications/${notificationId}`);
    // 204 No Content - no body to parse
  } catch (error: any) {
    console.error('[deleteNotification] Error:', error);

    // Axios con 404 retorna error.response.status === 404
    if (error.response?.status === 404) {
      throw new Error(error.response.data?.message || 'Notification not found');
    }

    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}
