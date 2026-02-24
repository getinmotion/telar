import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { NotificationFilters } from '@/components/notifications/NotificationFilters';
import { NotificationsHeader } from '@/components/notifications/NotificationsHeader';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const notificationIcons: Record<string, string> = {
  // Moderación
  moderation_approve: '✅',
  moderation_reject: '❌',
  moderation_approve_with_edits: '✏️',
  moderation_request_changes: '🔄',
  marketplace_approved: '🏪',
  marketplace_removed: '🚫',
  // Tienda
  shop_created: '🎉',
  shop_published: '🚀',
  shop_first_sale: '💰',
  // Productos
  product_created: '📦',
  product_approved: '✅',
  product_low_stock: '⚠️',
  product_out_of_stock: '🔴',
  // Progreso
  milestone_completed: '🏆',
  task_completed: '✓',
  achievement_unlocked: '🎖️',
  level_up: '⬆️',
  // Cuenta
  welcome: '👋',
  profile_completed: '👤',
  bank_data_configured: '💳',
  // Sistema
  system_announcement: '📢',
  feature_update: '🆕',
  default: '📬',
};

const getNotificationCategory = (type: string): string => {
  if (type.startsWith('moderation') || type === 'marketplace_approved' || type === 'marketplace_removed') {
    return 'moderation';
  }
  if (type.startsWith('shop')) return 'shop';
  if (type.startsWith('product')) return 'product';
  if (type.includes('milestone') || type.includes('task') || type.includes('achievement') || type.includes('level')) {
    return 'milestone';
  }
  if (type === 'welcome' || type.includes('profile') || type.includes('bank_data')) {
    return 'account';
  }
  if (type.includes('system') || type.includes('feature')) {
    return 'system';
  }
  return 'other';
};

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    const actionUrl = notification.metadata?.actionUrl;
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  // Filtrado de notificaciones
  const filteredNotifications = notifications.filter(notification => {
    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      const category = getNotificationCategory(notification.type);
      if (category !== filterType) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <NotificationsHeader 
        unreadCount={unreadCount} 
        onMarkAllAsRead={markAllAsRead}
      />
      
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >

          <NotificationFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
          />

          <Card className="p-0 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 mx-auto mb-4 animate-pulse text-muted-foreground" />
                <p className="text-muted-foreground">Cargando notificaciones...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== 'all' 
                    ? 'No se encontraron notificaciones con estos filtros' 
                    : 'No tienes notificaciones'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                  />
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
}) => {
  const icon = notificationIcons[notification.type] || notificationIcons.default;
  const hasActionUrl = !!notification.metadata?.actionUrl;

  return (
    <div
      className={cn(
        'p-4 hover:bg-muted/30 transition-colors relative group',
        !notification.read && 'bg-primary/5',
        hasActionUrl && 'cursor-pointer'
      )}
      onClick={hasActionUrl ? onClick : undefined}
    >
      <div className="flex gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'text-sm font-medium',
            !notification.read && 'font-semibold'
          )}>
            {notification.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </p>
        </div>
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r" />
      )}
    </div>
  );
};

export default NotificationsPage;
