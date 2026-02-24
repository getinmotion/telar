import { supabase } from '@/integrations/supabase/client';

// Tipos de notificaciones del sistema
export type NotificationType = 
  // Moderación
  | 'moderation_approve'
  | 'moderation_reject'
  | 'moderation_approve_with_edits'
  | 'moderation_request_changes'
  | 'marketplace_approved'
  | 'marketplace_removed'
  // Tienda
  | 'shop_created'
  | 'shop_published'
  | 'shop_first_sale'
  | 'artisan_profile_completed'
  // Productos
  | 'product_created'
  | 'product_approved'
  | 'product_low_stock'
  | 'product_out_of_stock'
  // Progreso
  | 'milestone_completed'
  | 'task_completed'
  | 'achievement_unlocked'
  | 'level_up'
  // Cuenta
  | 'welcome'
  | 'profile_completed'
  | 'bank_data_configured'
  // Ventas
  | 'new_order'
  // Sistema
  | 'system_announcement'
  | 'feature_update';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
}

/**
 * Servicio centralizado para crear notificaciones en el sistema
 */
export const createNotification = async (params: CreateNotificationParams): Promise<boolean> => {
  const { userId, type, title, message, metadata, actionUrl } = params;

  try {
    const notificationData = {
      user_id: userId,
      type,
      title,
      message,
      metadata: {
        ...metadata,
        actionUrl,
        createdAt: new Date().toISOString()
      },
      read: false
    };

    const { error } = await supabase
      .from('notifications')
      .insert(notificationData);

    if (error) {
      console.error('[NotificationService] Error creating notification:', error, { type, userId });
      return false;
    }

    console.log('[NotificationService] Notification created:', { type, userId, title });

    // Enviar email de notificación de forma asíncrona (no bloquea)
    supabase.functions
      .invoke('send-notification-email', {
        body: { userId, type, title, message, actionUrl }
      })
      .then(({ data, error }) => {
        if (error) {
          console.error('[NotificationService] Email notification error:', error);
        } else {
          console.log('[NotificationService] Email notification sent:', data);
        }
      })
      .catch(err => console.error('[NotificationService] Email exception:', err));

    return true;
  } catch (err) {
    console.error('[NotificationService] Exception creating notification:', err, { type, userId });
    return false;
  }
};

/**
 * Crear notificaciones específicas con configuración predefinida
 */
export const NotificationTemplates = {
  /**
   * Notificación de tienda creada
   */
  shopCreated: (userId: string, shopName: string, shopSlug: string) => 
    createNotification({
      userId,
      type: 'shop_created',
      title: '¡Tienda creada exitosamente!',
      message: `Tu tienda "${shopName}" ha sido creada. Ahora puedes personalizarla y agregar productos.`,
      actionUrl: '/mi-tienda',
      metadata: { shopName, shopSlug }
    }),

  /**
   * Notificación de tienda publicada
   */
  shopPublished: (userId: string, shopName: string, shopSlug: string) => 
    createNotification({
      userId,
      type: 'shop_published',
      title: '🚀 ¡Tu tienda está en línea!',
      message: `Tu tienda "${shopName}" ahora es visible en el marketplace. ¡Tus productos ya pueden ser vendidos!`,
      actionUrl: `/tienda/${shopSlug}`,
      metadata: { shopName, shopSlug }
    }),

  /**
   * Notificación de producto creado
   */
  productCreated: (userId: string, productName: string) => 
    createNotification({
      userId,
      type: 'product_created',
      title: 'Producto agregado',
      message: `"${productName}" ha sido agregado a tu inventario y enviado a moderación.`,
      actionUrl: '/mi-tienda',
      metadata: { productName }
    }),

  /**
   * Notificación de datos bancarios configurados
   */
  bankDataConfigured: (userId: string) => 
    createNotification({
      userId,
      type: 'bank_data_configured',
      title: '💳 Datos bancarios configurados',
      message: 'Tus datos bancarios han sido guardados exitosamente. Ya puedes recibir pagos de tus ventas.',
      actionUrl: '/mi-cuenta/datos-bancarios',
      metadata: {}
    }),

  /**
   * Notificación de milestone completado
   */
  milestoneCompleted: (userId: string, milestoneName: string, milestoneId: string) => 
    createNotification({
      userId,
      type: 'milestone_completed',
      title: '🏆 ¡Milestone completado!',
      message: `Has completado el milestone "${milestoneName}". ¡Sigue avanzando en tu camino artesanal!`,
      actionUrl: '/dashboard/tasks',
      metadata: { milestoneName, milestoneId }
    }),

  /**
   * Notificación de producto aprobado
   */
  productApproved: (userId: string, productName: string, productId: string) => 
    createNotification({
      userId,
      type: 'product_approved',
      title: '✅ Producto aprobado',
      message: `Tu producto "${productName}" ha sido aprobado y ahora es visible en el marketplace.`,
      actionUrl: '/mi-tienda',
      metadata: { productName, productId }
    }),

  /**
   * Notificación de marketplace aprobado
   */
  marketplaceApproved: (userId: string, shopName: string) => 
    createNotification({
      userId,
      type: 'marketplace_approved',
      title: '🏪 Tienda aprobada para marketplace',
      message: `¡Felicidades! Tu tienda "${shopName}" ha sido aprobada para aparecer en el marketplace.`,
      actionUrl: '/mi-tienda',
      metadata: { shopName }
    }),

  /**
   * Notificación de bienvenida
   */
  welcome: (userId: string, userName: string) => 
    createNotification({
      userId,
      type: 'welcome',
      title: '👋 ¡Bienvenido a TELAR!',
      message: `Hola ${userName}, estamos emocionados de tenerte con nosotros. Comienza creando tu tienda y sumándote al marketplace artesanal.`,
      actionUrl: '/dashboard',
      metadata: { userName }
    }),

  /**
   * Notificación de subida de nivel
   */
  levelUp: (userId: string, newLevel: number) => 
    createNotification({
      userId,
      type: 'level_up',
      title: `⬆️ ¡Nivel ${newLevel}!`,
      message: `¡Has alcanzado el nivel ${newLevel}! Sigue completando misiones para desbloquear más recompensas.`,
      actionUrl: '/dashboard',
      metadata: { level: newLevel }
    }),

  /**
   * Notificación de perfil artesanal completado
   */
  artisanProfileCompleted: (userId: string, shopName: string, shopSlug: string) => 
    createNotification({
      userId,
      type: 'artisan_profile_completed',
      title: '📖 ¡Tu historia ha sido publicada!',
      message: `Tu Perfil Artesanal de "${shopName}" ahora es visible en tu tienda. Los visitantes podrán conocer tu historia y tradición.`,
      actionUrl: `/tienda/${shopSlug}/perfil-artesanal`,
      metadata: { shopName, shopSlug }
    }),

  /**
   * Notificación de nueva venta/orden
   */
  newOrder: (userId: string, productNames: string, total: number, orderNumber: string) => 
    createNotification({
      userId,
      type: 'new_order',
      title: '💰 ¡Nueva venta!',
      message: `Has vendido "${productNames}" por $${total.toLocaleString('es-CO')}`,
      actionUrl: '/mi-tienda?tab=orders',
      metadata: { orderNumber, total, productNames }
    }),
};
